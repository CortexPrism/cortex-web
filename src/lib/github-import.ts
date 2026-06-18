import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { getGitHubToken } from "@/lib/settings";

interface GitHubRepoContent {
  name: string;
  path: string;
  type: string;
  download_url: string | null;
}

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

interface ModuleManifest {
  name?: string;
  version?: string;
  description?: string;
  kind?: "esm" | "mcp" | "wasm";
  entryPoint?: string;
  capabilities?: string[];
  tags?: string[];
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  systemPrompt?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  tools?: string[];
}

interface RepoMetadata {
  description: string | null;
  stars: number;
  forks: number;
  topics: string[];
  license: string | null;
  defaultBranch: string;
}

async function fetchRepoMetadata(owner: string, repo: string): Promise<RepoMetadata | null> {
  try {
    const token = await getGitHubToken();
    const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers, next: { revalidate: 60 } },
    );
    if (!res.ok) return null;

    const data = await res.json();
    return {
      description: data.description,
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      topics: data.topics || [],
      license: data.license?.spdx_id || null,
      defaultBranch: data.default_branch || "main",
    };
  } catch {
    return null;
  }
}

async function fetchRepoReadme(
  owner: string,
  repo: string,
  preferredBranch: string,
  fallbackBranch: string,
): Promise<string | null> {
  const readmePaths = ["README.md", "readme.md", "Readme.md"];
  const branches = [preferredBranch, fallbackBranch, "main", "master"];
  const uniqueBranches = branches.filter((b, i) => branches.indexOf(b) === i);

  for (const branch of uniqueBranches) {
    for (const path of readmePaths) {
      const content = await getGitHubFileContent(owner, repo, path, branch);
      if (content) return content;
    }
  }
  return null;
}

export async function syncGitHubRepo(
  owner: string,
  repo: string,
  branch: string,
  manifestPath: string,
  syncPlugins: boolean,
  syncAgents: boolean,
  autoApprove: boolean,
  userId: string,
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, updated: 0, skipped: 0, errors: [] };

  try {
    const repoUrl = `https://github.com/${owner}/${repo}`;

    if (syncPlugins) {
      const pluginResult = await scanForPlugins(owner, repo, branch, manifestPath, repoUrl, autoApprove);
      result.imported += pluginResult.imported;
      result.updated += pluginResult.updated;
      result.skipped += pluginResult.skipped;
      result.errors.push(...pluginResult.errors);
    }

    if (syncAgents) {
      const agentResult = await scanForAgents(owner, repo, branch, manifestPath, repoUrl, autoApprove);
      result.imported += agentResult.imported;
      result.updated += agentResult.updated;
      result.skipped += agentResult.skipped;
      result.errors.push(...agentResult.errors);
    }

    await prisma.gitHubConnection.update({
      where: { owner_repo: { owner, repo } },
      data: { lastSyncAt: new Date() },
    });

    await createAuditLog({
      userId,
      action: "github.sync",
      entity: "github_connection",
      metadata: { owner, repo, imported: result.imported, updated: result.updated, skipped: result.skipped },
    });
  } catch (error) {
    result.errors.push(`Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return result;
}

async function scanForPlugins(
  owner: string,
  repo: string,
  branch: string,
  manifestPath: string,
  repoUrl: string,
  autoApprove: boolean,
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, updated: 0, skipped: 0, errors: [] };

  try {
    const manifests = await discoverManifests(owner, repo, branch, manifestPath);
    if (manifests.length === 0) return result;

    const repoMeta = await fetchRepoMetadata(owner, repo);
    const defaultBranch = repoMeta?.defaultBranch || branch;

    for (const manifest of manifests) {
      try {
        if (!manifest.name) {
          result.skipped++;
          continue;
        }

        const slug = manifest.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

        const existing = await prisma.plugin.findFirst({
          where: { OR: [{ name: manifest.name }, { slug }] },
        });

        const version = manifest.version || "1.0.0";
        const description = manifest.description || repoMeta?.description || `${manifest.name} plugin from ${owner}/${repo}`;
        const tags = JSON.stringify(Array.from(new Set([...(manifest.tags || []), ...(repoMeta?.topics || [])])));

        if (existing) {
          const versionChanged = existing.version !== version;

          const updateData: Record<string, unknown> = {
            version,
            description,
            kind: manifest.kind || existing.kind,
            entryPoint: manifest.entryPoint || existing.entryPoint,
            capabilities: JSON.stringify(manifest.capabilities || []),
            tags,
            author: manifest.author || existing.author || owner,
            license: manifest.license || repoMeta?.license || existing.license || null,
            homepage: manifest.homepage || existing.homepage || repoUrl,
            repository: repoUrl,
            githubStars: repoMeta?.stars ?? existing.githubStars,
            githubForks: repoMeta?.forks ?? existing.githubForks,
            githubTopics: tags,
            githubLastCommit: new Date(),
          };

          if (versionChanged) {
            const readme = await fetchRepoReadme(owner, repo, branch, defaultBranch);
            if (readme) updateData.readme = readme;
          }

          await prisma.plugin.update({
            where: { id: existing.id },
            data: updateData,
          });

          if (versionChanged) {
            await prisma.pluginVersion.create({
              data: {
                pluginId: existing.id,
                version,
                description,
                entryPoint: (manifest.entryPoint || existing.entryPoint) as string,
                capabilities: JSON.stringify(manifest.capabilities || []),
                kind: (manifest.kind || existing.kind) as string,
              },
            });
          }

          result.updated++;
          continue;
        }

        const readme = await fetchRepoReadme(owner, repo, branch, defaultBranch);

        const plugin = await prisma.plugin.create({
          data: {
            name: manifest.name,
            slug,
            version,
            description,
            kind: manifest.kind || "esm",
            entryPoint: manifest.entryPoint || `plugins/${slug}/mod.ts`,
            capabilities: JSON.stringify(manifest.capabilities || []),
            tags,
            author: manifest.author || owner,
            license: manifest.license || repoMeta?.license || null,
            homepage: manifest.homepage || repoUrl,
            repository: repoUrl,
            readme,
            status: autoApprove ? "approved" : "pending",
            githubImportId: `github:${owner}/${repo}:${manifest.name}`,
            githubStars: repoMeta?.stars ?? 0,
            githubForks: repoMeta?.forks ?? 0,
            githubTopics: tags,
            userId: null,
          },
        });

        await prisma.pluginVersion.create({
          data: {
            pluginId: plugin.id,
            version,
            description,
            entryPoint: plugin.entryPoint,
            capabilities: JSON.stringify(manifest.capabilities || []),
            kind: plugin.kind,
          },
        });

        result.imported++;
      } catch {
        result.errors.push(`Failed to import plugin: ${manifest.name}`);
      }
    }
  } catch (error) {
    result.errors.push(`Plugin scan failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return result;
}

async function scanForAgents(
  owner: string,
  repo: string,
  branch: string,
  manifestPath: string,
  repoUrl: string,
  autoApprove: boolean,
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, updated: 0, skipped: 0, errors: [] };

  try {
    const manifests = await discoverManifests(owner, repo, branch, manifestPath);
    if (manifests.length === 0) return result;

    const repoMeta = await fetchRepoMetadata(owner, repo);
    const defaultBranch = repoMeta?.defaultBranch || branch;

    for (const manifest of manifests) {
      try {
        if (!manifest.name) {
          result.skipped++;
          continue;
        }

        const slug = manifest.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

        const existing = await prisma.agentConfig.findFirst({
          where: { OR: [{ name: manifest.name }] },
        });

        const version = manifest.version || "1.0.0";
        const description = manifest.description || repoMeta?.description || `${manifest.name} agent from ${owner}/${repo}`;
        const tags = JSON.stringify(Array.from(new Set([...(manifest.tags || []), ...(repoMeta?.topics || [])])));

        if (existing) {
          const versionChanged = existing.version !== version;

          const updateData: Record<string, unknown> = {
            version,
            description,
            provider: manifest.provider ?? existing.provider,
            model: manifest.model ?? existing.model,
            temperature: manifest.temperature ?? existing.temperature,
            tools: JSON.stringify(manifest.tools || []),
            tags,
            systemPrompt: manifest.systemPrompt ?? existing.systemPrompt,
            author: manifest.author || existing.author || owner,
            license: manifest.license || repoMeta?.license || existing.license || null,
            homepage: manifest.homepage || existing.homepage || repoUrl,
            repository: repoUrl,
            githubStars: repoMeta?.stars ?? existing.githubStars,
            githubForks: repoMeta?.forks ?? existing.githubForks,
            githubTopics: tags,
            githubLastCommit: new Date(),
          };

          if (versionChanged) {
            const readme = await fetchRepoReadme(owner, repo, branch, defaultBranch);
            if (readme) updateData.readme = readme;
          }

          await prisma.agentConfig.update({
            where: { id: existing.id },
            data: updateData,
          });

          if (versionChanged) {
            await prisma.agentVersion.create({
              data: {
                agentId: existing.id,
                version,
                description,
                provider: (manifest.provider ?? existing.provider) as string | undefined,
                model: (manifest.model ?? existing.model) as string | undefined,
                temperature: (manifest.temperature ?? existing.temperature) as number | undefined,
                tools: JSON.stringify(manifest.tools || []),
                tags,
                systemPrompt: (manifest.systemPrompt ?? existing.systemPrompt) as string | undefined,
              },
            });
          }

          result.updated++;
          continue;
        }

        const readme = await fetchRepoReadme(owner, repo, branch, defaultBranch);

        const agent = await prisma.agentConfig.create({
          data: {
            name: manifest.name,
            slug,
            version,
            description,
            provider: manifest.provider || null,
            model: manifest.model || null,
            temperature: manifest.temperature ?? null,
            tools: JSON.stringify(manifest.tools || []),
            tags,
            systemPrompt: manifest.systemPrompt || null,
            author: manifest.author || owner,
            license: manifest.license || repoMeta?.license || null,
            homepage: manifest.homepage || repoUrl,
            repository: repoUrl,
            readme,
            status: autoApprove ? "approved" : "pending",
            githubImportId: `github:${owner}/${repo}:${manifest.name}`,
            githubStars: repoMeta?.stars ?? 0,
            githubForks: repoMeta?.forks ?? 0,
            githubTopics: tags,
            userId: null,
          },
        });

        await prisma.agentVersion.create({
          data: {
            agentId: agent.id,
            version,
            description,
            provider: manifest.provider,
            model: manifest.model,
            temperature: manifest.temperature,
            tools: JSON.stringify(manifest.tools || []),
            tags,
            systemPrompt: manifest.systemPrompt,
          },
        });

        result.imported++;
      } catch {
        result.errors.push(`Failed to import agent: ${manifest.name}`);
      }
    }
  } catch (error) {
    result.errors.push(`Agent scan failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return result;
}

async function discoverManifests(
  owner: string,
  repo: string,
  branch: string,
  manifestPath: string,
): Promise<ModuleManifest[]> {
  const manifests: ModuleManifest[] = [];

  try {
    const rootManifest = await fetchManifest(owner, repo, branch, manifestPath);
    if (rootManifest) {
      manifests.push(rootManifest);
    }

    const subdirs = await fetchSubdirectories(owner, repo, branch);
    for (const dir of subdirs) {
      const subManifest = await fetchManifest(owner, repo, branch, `${dir.path}/${manifestPath}`);
      if (subManifest) {
        manifests.push({ ...subManifest, name: subManifest.name || dir.name });
      }
    }
  } catch {
    // If the root manifest doesn't exist, try scanning subdirectories
    const subdirs = await fetchSubdirectories(owner, repo, branch);
    for (const dir of subdirs) {
      const subManifest = await fetchManifest(owner, repo, branch, `${dir.path}/${manifestPath}`);
      if (subManifest) {
        manifests.push({ ...subManifest, name: subManifest.name || dir.name });
      }
    }
  }

  return manifests;
}

async function fetchManifest(
  owner: string,
  repo: string,
  branch: string,
  path: string,
): Promise<ModuleManifest | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.download_url) return null;

    const contentRes = await fetch(data.download_url);
    if (!contentRes.ok) return null;

    const content = await contentRes.json();
    return content as ModuleManifest;
  } catch {
    return null;
  }
}

async function fetchSubdirectories(
  owner: string,
  repo: string,
  branch: string,
): Promise<GitHubRepoContent[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) return [];

    const data: GitHubRepoContent[] = await res.json();
    return data.filter(item => item.type === "dir");
  } catch {
    return [];
  }
}

export async function getGitHubFileContent(
  owner: string,
  repo: string,
  path: string,
  branch: string = "main",
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.download_url) return null;
    const contentRes = await fetch(data.download_url);
    if (!contentRes.ok) return null;
    return contentRes.text();
  } catch {
    return null;
  }
}
