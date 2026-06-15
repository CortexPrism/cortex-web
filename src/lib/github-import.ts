import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

interface GitHubRepoContent {
  name: string;
  path: string;
  type: string;
  download_url: string | null;
}

interface ImportResult {
  imported: number;
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
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

  try {
    const repoUrl = `https://github.com/${owner}/${repo}`;

    if (syncPlugins) {
      const pluginResult = await scanForPlugins(owner, repo, branch, manifestPath, repoUrl, autoApprove);
      result.imported += pluginResult.imported;
      result.skipped += pluginResult.skipped;
      result.errors.push(...pluginResult.errors);
    }

    if (syncAgents) {
      const agentResult = await scanForAgents(owner, repo, branch, manifestPath, repoUrl, autoApprove);
      result.imported += agentResult.imported;
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
      metadata: { owner, repo, imported: result.imported, skipped: result.skipped },
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
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

  try {
    const manifests = await discoverManifests(owner, repo, branch, manifestPath);

    for (const manifest of manifests) {
      try {
        if (!manifest.name) {
          result.skipped++;
          continue;
        }

        const existing = await prisma.plugin.findFirst({
          where: { OR: [{ name: manifest.name }, { slug: manifest.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") }] },
        });

        if (existing) {
          result.skipped++;
          continue;
        }

        const slug = manifest.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

        await prisma.plugin.create({
          data: {
            name: manifest.name,
            slug,
            version: manifest.version || "1.0.0",
            description: manifest.description || `${manifest.name} plugin from ${owner}/${repo}`,
            kind: manifest.kind || "esm",
            entryPoint: manifest.entryPoint || `plugins/${slug}/mod.ts`,
            capabilities: JSON.stringify(manifest.capabilities || []),
            tags: JSON.stringify(manifest.tags || []),
            author: manifest.author || owner,
            license: manifest.license || null,
            homepage: manifest.homepage || repoUrl,
            repository: repoUrl,
            status: autoApprove ? "approved" : "pending",
            githubImportId: `github:${owner}/${repo}:${manifest.name}`,
            userId: null,
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
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

  try {
    const manifests = await discoverManifests(owner, repo, branch, manifestPath);

    for (const manifest of manifests) {
      try {
        if (!manifest.name) {
          result.skipped++;
          continue;
        }

        const existing = await prisma.agentConfig.findFirst({
          where: { OR: [{ name: manifest.name }] },
        });

        if (existing) {
          result.skipped++;
          continue;
        }

        const slug = manifest.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

        await prisma.agentConfig.create({
          data: {
            name: manifest.name,
            slug,
            version: manifest.version || "1.0.0",
            description: manifest.description || `${manifest.name} agent from ${owner}/${repo}`,
            provider: manifest.provider || null,
            model: manifest.model || null,
            temperature: manifest.temperature ?? null,
            tools: JSON.stringify(manifest.tools || []),
            tags: JSON.stringify(manifest.tags || []),
            systemPrompt: manifest.systemPrompt || null,
            author: manifest.author || owner,
            license: manifest.license || null,
            homepage: manifest.homepage || repoUrl,
            repository: repoUrl,
            status: autoApprove ? "approved" : "pending",
            githubImportId: `github:${owner}/${repo}:${manifest.name}`,
            userId: null,
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
