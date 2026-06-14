const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || "CortexPrism/cortex";

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
}

let cached: { data: GitHubRepo; ts: number } | null = null;

export async function getGitHubStats(): Promise<GitHubRepo> {
  if (cached && Date.now() - cached.ts < 300_000) {
    return cached.data;
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    const data: GitHubRepo = await res.json();
    cached = { data, ts: Date.now() };
    return data;
  } catch {
    return { stargazers_count: 0, forks_count: 0, open_issues_count: 0 };
  }
}
