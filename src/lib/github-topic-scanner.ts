import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { getGitHubToken } from "@/lib/settings";

export const CORTEX_TOPICS = {
  primary: ["cortex-plugin", "cortex-agent", "cortexprism"],
  pluginTypes: ["esm", "mcp", "wasm"],
  categories: [
    "development", "data-processing", "security",
    "productivity", "analytics", "communication", "research",
  ],
  all: [] as string[],
};
CORTEX_TOPICS.all = [
  ...CORTEX_TOPICS.primary,
  ...CORTEX_TOPICS.pluginTypes,
  ...CORTEX_TOPICS.categories,
];

interface GitHubSearchItem {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  description: string | null;
  html_url: string;
  stargazers_count: number;
  topics: string[];
  license: { spdx_id: string } | null;
  pushed_at: string;
  updated_at: string;
}

interface GitHubSearchResponse {
  items: GitHubSearchItem[];
  total_count: number;
}

interface ManifestCheck {
  found: boolean;
  kind: "plugin" | "agent" | null;
  manifest: Record<string, unknown> | null;
}

export interface DiscoveredRepoInfo {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  stars: number;
  topics: string[];
  manifestCheck: ManifestCheck;
}

function detectKind(topics: string[], manifest: ManifestCheck): "plugin" | "agent" | "unknown" {
  if (manifest.found && manifest.kind) return manifest.kind;
  if (topics.includes("cortex-agent")) return "agent";
  if (topics.some(t => ["esm", "mcp", "wasm", "cortex-plugin"].includes(t))) return "plugin";
  return "unknown";
}

function authHeader(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function searchGitHubByTopic(
  topic: string,
  token: string | null = null,
  perPage: number = 50,
): Promise<GitHubSearchItem[]> {
  const allItems: GitHubSearchItem[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 5) {
    try {
      const res = await fetch(
        `https://api.github.com/search/repositories?q=topic:${encodeURIComponent(topic)}&sort=updated&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            ...authHeader(token),
          },
        },
      );
      if (!res.ok) {
        if (res.status === 403 && !token) {
          console.warn(`GitHub API rate limit hit for topic "${topic}". Set a GITHUB_TOKEN for higher limits.`);
        }
        break;
      }
      const data: GitHubSearchResponse = await res.json();
      allItems.push(...data.items);
      hasMore = data.items.length === perPage;
      page++;
    } catch {
      break;
    }
  }

  return allItems;
}

async function checkManifest(
  owner: string,
  repo: string,
  token: string | null = null,
  branch: string = "main",
): Promise<ManifestCheck> {
  const result: ManifestCheck = { found: false, kind: null, manifest: null };

  const manifestPaths = ["cortex.json", "cortex.yaml", "manifest.json", "cortex/mod.json"];
  const branches = [branch, "main", "master"];

  for (const b of branches) {
    for (const path of manifestPaths) {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${b}`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
              ...authHeader(token),
            },
          },
        );
        if (!res.ok) continue;

        const data = await res.json();
        if (!data.download_url) continue;

        const contentRes = await fetch(data.download_url);
        if (!contentRes.ok) continue;

        if (path.endsWith(".json")) {
          const manifest = await contentRes.json();
          result.found = true;
          result.manifest = manifest;

          if (manifest.kind || manifest.capabilities) {
            result.kind = "plugin";
          } else if (manifest.provider || manifest.model || manifest.systemPrompt) {
            result.kind = "agent";
          }
          return result;
        }
      } catch {
        continue;
      }
    }
    if (result.found) break;
  }

  return result;
}

export async function scanTopic(topic: string, userId: string): Promise<{ scanId: string; totalFound: number }> {
  const token = await getGitHubToken();

  const scan = await prisma.gitHubTopicScan.create({
    data: {
      topic,
      status: "running",
      startedAt: new Date(),
      createdById: userId,
    },
  });

  try {
    const repos = await searchGitHubByTopic(topic, token);

    const results: {
      fullName: string; owner: string; repo: string;
      description: string | null; htmlUrl: string; stars: number;
      topics: string[]; manifestCheck: ManifestCheck;
    }[] = [];

    for (const repo of repos) {
      if (repo.owner?.login === "CortexPrism") continue;

      const manifestCheck = await checkManifest(repo.owner.login, repo.name, token);
      const repoTopics = repo.topics || [];

      results.push({
        fullName: repo.full_name,
        owner: repo.owner.login,
        repo: repo.name,
        description: repo.description,
        htmlUrl: repo.html_url,
        stars: repo.stargazers_count,
        topics: repoTopics,
        manifestCheck,
      });
    }

    const discovered = results.filter(r =>
      r.topics.some(t => CORTEX_TOPICS.all.includes(t)) || r.manifestCheck.found
    );

    for (const r of discovered) {
      const kind = detectKind(r.topics, r.manifestCheck);
      try {
        await prisma.discoveredRepo.create({
          data: {
            scanId: scan.id,
            owner: r.owner,
            repo: r.repo,
            fullName: r.fullName,
            description: r.description,
            htmlUrl: r.htmlUrl,
            stars: r.stars,
            topics: JSON.stringify(r.topics),
            repoKind: kind,
            manifestFound: r.manifestCheck.found,
            manifestData: r.manifestCheck.manifest ? JSON.stringify(r.manifestCheck.manifest) : null,
            importStatus: "pending",
          },
        });
      } catch {
        // duplicate skip
      }
    }

    await prisma.gitHubTopicScan.update({
      where: { id: scan.id },
      data: { status: "completed", resultCount: discovered.length, completedAt: new Date() },
    });

    await createAuditLog({
      userId,
      action: "github.topic_scan",
      entity: "github_topic_scan",
      entityId: scan.id,
      metadata: { topic, discovered: discovered.length, total: repos.length },
    });

    return { scanId: scan.id, totalFound: discovered.length };
  } catch (error) {
    await prisma.gitHubTopicScan.update({
      where: { id: scan.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function importDiscoveredRepo(
  discoveredId: string,
  userId: string,
  autoApprove: boolean = false,
): Promise<{ success: boolean; entityId?: string; error?: string }> {
  const discovered = await prisma.discoveredRepo.findUnique({ where: { id: discoveredId } });
  if (!discovered) return { success: false, error: "Not found" };
  if (discovered.importStatus !== "pending") return { success: false, error: `Already ${discovered.importStatus}` };

  try {
    const repoUrl = `https://github.com/${discovered.owner}/${discovered.repo}`;
    const manifest = discovered.manifestData ? JSON.parse(discovered.manifestData) : null;
    const slug = discovered.repo.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    const kind = discovered.repoKind || "unknown";

    if (kind === "plugin") {
      const existing = await prisma.plugin.findFirst({
        where: { OR: [{ name: discovered.repo }, { slug }] },
      });
      if (existing) {
        await prisma.discoveredRepo.update({
          where: { id: discoveredId },
          data: { importStatus: "skipped", error: "Already exists in marketplace" },
        });
        return { success: false, error: "Already exists" };
      }

      const plugin = await prisma.plugin.create({
        data: {
          name: discovered.repo,
          slug,
          version: (manifest?.version as string) || "1.0.0",
          description: discovered.description || `${discovered.repo} plugin from ${discovered.fullName}`,
          kind: (manifest?.kind as string) || "esm",
          entryPoint: (manifest?.entryPoint as string) || `plugins/${slug}/mod.ts`,
          capabilities: JSON.stringify((manifest?.capabilities as string[]) || []),
          tags: JSON.stringify(discovered.topics),
          author: discovered.owner,
          license: (manifest?.license as string) || null,
          homepage: repoUrl,
          repository: repoUrl,
          status: autoApprove ? "approved" : "pending",
          githubImportId: `topic:${discovered.fullName}`,
          githubStars: discovered.stars,
          githubTopics: JSON.stringify(discovered.topics),
          userId: null,
        },
      });

      await prisma.discoveredRepo.update({
        where: { id: discoveredId },
        data: { importStatus: "imported", importedId: plugin.id },
      });

      return { success: true, entityId: plugin.id };
    }

    if (kind === "agent") {
      const existing = await prisma.agentConfig.findFirst({
        where: { OR: [{ name: discovered.repo }, { slug }] },
      });
      if (existing) {
        await prisma.discoveredRepo.update({
          where: { id: discoveredId },
          data: { importStatus: "skipped", error: "Already exists in marketplace" },
        });
        return { success: false, error: "Already exists" };
      }

      const agent = await prisma.agentConfig.create({
        data: {
          name: discovered.repo,
          slug,
          version: (manifest?.version as string) || "1.0.0",
          description: discovered.description || `${discovered.repo} agent from ${discovered.fullName}`,
          provider: (manifest?.provider as string) || null,
          model: (manifest?.model as string) || null,
          temperature: (manifest?.temperature as number) ?? null,
          tools: JSON.stringify((manifest?.tools as string[]) || []),
          tags: JSON.stringify(discovered.topics),
          systemPrompt: (manifest?.systemPrompt as string) || null,
          author: discovered.owner,
          license: (manifest?.license as string) || null,
          homepage: repoUrl,
          repository: repoUrl,
          status: autoApprove ? "approved" : "pending",
          githubImportId: `topic:${discovered.fullName}`,
          githubStars: discovered.stars,
          githubTopics: JSON.stringify(discovered.topics),
          userId: null,
        },
      });

      await prisma.discoveredRepo.update({
        where: { id: discoveredId },
        data: { importStatus: "imported", importedId: agent.id },
      });

      return { success: true, entityId: agent.id };
    }

    await prisma.discoveredRepo.update({
      where: { id: discoveredId },
      data: { importStatus: "skipped", error: "Unknown kind — cannot determine if plugin or agent" },
    });

    return { success: false, error: "Unknown kind" };
  } catch (error) {
    await prisma.discoveredRepo.update({
      where: { id: discoveredId },
      data: { importStatus: "error", error: error instanceof Error ? error.message : "Import failed" },
    });
    return { success: false, error: "Import failed" };
  }
}
