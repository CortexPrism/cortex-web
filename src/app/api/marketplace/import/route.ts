import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth-middleware";
import { getGitHubToken } from "@/lib/settings";

const ImportSchema = z.object({
  repository: z.string().url().refine(u => u.startsWith("https://github.com/"), {
    message: "Must be a GitHub URL (https://github.com/owner/repo)",
  }),
  branch: z.string().default("main"),
  autoApprove: z.boolean().optional().default(false),
  manifestPath: z.string().optional(),
  categoryId: z.string().optional(),
});

interface GitHubRepoData {
  owner: string;
  repo: string;
  description: string | null;
  stars: number;
  forks: number;
  topics: string[];
  license: string | null;
  defaultBranch: string;
}

interface ManifestData {
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
  provider?: string;
  model?: string;
  temperature?: number;
  tools?: string[];
  systemPrompt?: string;
  soulContent?: string;
}

async function fetchRepoFile(
  owner: string, repo: string, path: string,
  branch: string, token: string | null,
): Promise<string | null> {
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.download_url) return null;
    const contentRes = await fetch(data.download_url);
    if (!contentRes.ok) return null;
    if (path.endsWith(".json")) return contentRes.text();
    if (path.endsWith(".md")) return contentRes.text();
    return contentRes.text();
  } catch {
    return null;
  }
}

async function fetchReadme(
  owner: string, repo: string, branch: string, token: string | null,
): Promise<string | null> {
  const readmePaths = ["README.md", "readme.md", "Readme.md"];
  for (const path of readmePaths) {
    const content = await fetchRepoFile(owner, repo, path, branch, token);
    if (content) return content;
  }
  return null;
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "github.com") return null;
    const parts = u.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/");
    if (parts.length >= 2) return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
    return null;
  } catch {
    return null;
  }
}

async function fetchRepoData(owner: string, repo: string, token: string | null): Promise<GitHubRepoData | null> {
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers, next: { revalidate: 60 } });
    if (!res.ok) return null;

    const data = await res.json();
    return {
      owner: data.owner?.login || owner,
      repo: data.name,
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

async function fetchManifest(
  owner: string,
  repo: string,
  branch: string,
  token: string | null,
  manifestPath?: string,
): Promise<ManifestData | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const paths = manifestPath
    ? [manifestPath]
    : ["cortex.json", "manifest.json", "cortex.yaml", "cortex/mod.json"];
  const branches = [branch, "main", "master"];

  for (const b of branches) {
    for (const path of paths) {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${b}`,
          { headers },
        );
        if (!res.ok) continue;

        const data = await res.json();
        if (!data.download_url) continue;

        const contentRes = await fetch(data.download_url);
        if (!contentRes.ok) continue;

        if (path.endsWith(".json")) {
          return await contentRes.json() as ManifestData;
        }
      } catch {
        continue;
      }
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ImportSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.errors }, { status: 400 });
    }

    const { repository, branch: inputBranch, autoApprove, manifestPath, categoryId } = parsed.data;

    const parsedUrl = parseGitHubUrl(repository);
    if (!parsedUrl) {
      return Response.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }

    const { owner, repo } = parsedUrl;
    const token = await getGitHubToken();

    const repoData = await fetchRepoData(owner, repo, token);
    if (!repoData) {
      return Response.json({ error: "Repository not found or not accessible" }, { status: 404 });
    }

    const branch = inputBranch || repoData.defaultBranch;

    const manifest = await fetchManifest(owner, repo, branch, token, manifestPath);
    if (!manifest) {
      return Response.json({
        error: "No cortex manifest found. Expected cortex.json or manifest.json at repo root.",
        hints: [
          "Ensure the repository has a cortex.json or manifest.json file",
          "The manifest should contain name, version, and kind (esm/mcp/wasm) for plugins",
          "Or provider/model/systemPrompt for agents",
        ],
      }, { status: 422 });
    }

    const repoUrl = `https://github.com/${owner}/${repo}`;
    const user = getAuthUser(request);
    const isAgent = !!(manifest.provider || manifest.model || manifest.systemPrompt || manifest.soulContent);
    const name = manifest.name || repo;
    const slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

    if (isAgent) {
      const existing = await prisma.agentConfig.findFirst({
        where: { OR: [{ name }, { slug }] },
      });
      if (existing) {
        return Response.json({ error: `Agent "${name}" already exists`, existingId: existing.id }, { status: 409 });
      }

      const [readme] = await Promise.all([
        fetchReadme(owner, repo, branch, token),
      ]);

      const agent = await prisma.agentConfig.create({
        data: {
          name,
          slug,
          version: manifest.version || "1.0.0",
          description: manifest.description || repoData.description || `${name} agent from ${owner}/${repo}`,
          provider: manifest.provider || null,
          model: manifest.model || null,
          temperature: manifest.temperature ?? null,
          tools: JSON.stringify(manifest.tools || []),
          tags: JSON.stringify(Array.from(new Set([...(manifest.tags || []), ...repoData.topics]))),
          systemPrompt: manifest.systemPrompt || null,
          soulContent: manifest.soulContent || null,
          author: manifest.author || owner,
          homepage: manifest.homepage || repoUrl,
          repository: repoUrl,
          license: repoData.license || manifest.license || null,
          readme: readme,
          categoryId: categoryId || null,
          status: autoApprove ? "approved" : "pending",
          userId: user?.userId || null,
          githubImportId: `api:${owner}/${repo}`,
          githubStars: repoData.stars,
          githubForks: repoData.forks,
          githubTopics: JSON.stringify(repoData.topics),
        },
      });

      return Response.json({
        success: true,
        type: "agent",
        agent: {
          id: agent.id,
          name: agent.name,
          slug: agent.slug,
          version: agent.version,
          status: agent.status,
        },
      }, { status: 201 });
    }

    const existing = await prisma.plugin.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
    if (existing) {
      return Response.json({ error: `Plugin "${name}" already exists`, existingId: existing.id }, { status: 409 });
    }

    const readme = await fetchReadme(owner, repo, branch, token);
    const pngIcon = await fetchRepoFile(owner, repo, "icon.png", branch, token);
    const svgIcon = await fetchRepoFile(owner, repo, "icon.svg", branch, token);
    const iconUrl = pngIcon
      ? `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/icon.png`
      : svgIcon
        ? `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/icon.svg`
        : null;

    const plugin = await prisma.plugin.create({
      data: {
        name,
        slug,
        version: manifest.version || "1.0.0",
        description: manifest.description || repoData.description || `${name} plugin from ${owner}/${repo}`,
        kind: manifest.kind || "esm",
        entryPoint: manifest.entryPoint || `plugins/${slug}/mod.ts`,
        capabilities: JSON.stringify(manifest.capabilities || []),
        tags: JSON.stringify(Array.from(new Set([...(manifest.tags || []), ...repoData.topics]))),
        author: manifest.author || owner,
        homepage: manifest.homepage || repoUrl,
        repository: repoUrl,
        license: repoData.license || manifest.license || null,
        icon: iconUrl,
        readme: readme,
        categoryId: categoryId || null,
        status: autoApprove ? "approved" : "pending",
        userId: user?.userId || null,
        githubImportId: `api:${owner}/${repo}`,
        githubStars: repoData.stars,
        githubForks: repoData.forks,
        githubTopics: JSON.stringify(repoData.topics),
      },
    });

    return Response.json({
      success: true,
      type: "plugin",
      plugin: {
        id: plugin.id,
        name: plugin.name,
        slug: plugin.slug,
        version: plugin.version,
        kind: plugin.kind,
        status: plugin.status,
      },
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Import error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
