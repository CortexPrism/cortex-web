import type { Metadata } from "next";
import { GitBranch, GitCommit, ExternalLink, FileText } from "lucide-react";
import { MdxContent } from "@/components/docs/MdxContent";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Release history for the CortexPrism project",
};

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

async function getRecentCommits(owner: string, repo: string, limit = 10): Promise<Commit[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`,
      {
        headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "cortexprism-web" },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c: Record<string, unknown>) => ({
      sha: (c.sha as string).substring(0, 7),
      message: ((c.commit as Record<string, unknown>)?.message as string)?.split("\n")[0] || "",
      author: ((c.commit as Record<string, unknown>)?.author as Record<string, unknown>)?.name as string || "unknown",
      date: ((c.commit as Record<string, unknown>)?.author as Record<string, unknown>)?.date as string || "",
      url: `https://github.com/${owner}/${repo}/commit/${c.sha as string}`,
    }));
  } catch {
    return [];
  }
}

async function getChangelogMD(repo: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${repo}/main/CHANGELOG.md`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export default async function ChangelogPage() {
  const [websiteCommits, cortexCommits, cortexChangelog] = await Promise.all([
    getRecentCommits("scarecr0w12", "cortex-web", 8),
    getRecentCommits("scarecr0w12", "cortex", 8),
    getChangelogMD("scarecr0w12/cortex"),
  ]);

  const websiteChangelogPath = path.join(process.cwd(), "CHANGELOG.md");
  let websiteChangelog = "";
  try {
    websiteChangelog = fs.readFileSync(websiteChangelogPath, "utf-8");
  } catch {}

  const allCommits = [...websiteCommits, ...cortexCommits]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#e2e2ea]">Changelog</h1>
        <p className="mt-4 text-lg text-[#9090a8]">
          Release history from{" "}
          <a href="https://github.com/scarecr0w12/cortex-web" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
            cortex-web
          </a>
          {" "}and{" "}
          <a href="https://github.com/scarecr0w12/cortex" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
            cortex
          </a>
        </p>
      </div>

      {allCommits.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <GitCommit className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-[#e2e2ea]">Recent Commits</h2>
          </div>
          <div className="space-y-1">
            {allCommits.map((c) => (
              <a
                key={c.sha}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#111118] transition-colors group"
              >
                <span className="font-mono text-xs text-[#55556a] mt-0.5 shrink-0 group-hover:text-indigo-400 transition-colors">
                  {c.sha}
                </span>
                <code className="flex-1 text-sm text-[#9090a8] group-hover:text-[#e2e2ea] transition-colors">
                  {c.message}
                </code>
                <span className="text-xs text-[#55556a] shrink-0">{c.author}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-[#e2e2ea]">Website</h2>
          </div>
          {websiteChangelog ? (
            <div className="glass-card p-6 md:p-8">
              <div className="prose prose-invert max-w-none prose-headings:text-[#e2e2ea] prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-[#9090a8] prose-a:text-indigo-400 prose-strong:text-[#e2e2ea] prose-code:text-[#e2e2ea] prose-pre:bg-[#0a0a0f] prose-pre:border prose-pre:border-[rgba(255,255,255,0.07)] prose-pre:rounded-xl prose-code:before:content-none prose-code:after:content-none prose-li:text-[#9090a8] prose-ul:space-y-1">
                <MdxContent content={websiteChangelog} />
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 text-center text-sm text-[#55556a]">
              No changelog available.
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-[#e2e2ea]">Cortex Engine</h2>
          </div>
          {cortexChangelog ? (
            <div className="glass-card p-6 md:p-8">
              <div className="prose prose-invert max-w-none prose-headings:text-[#e2e2ea] prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-[#9090a8] prose-a:text-indigo-400 prose-strong:text-[#e2e2ea] prose-code:text-[#e2e2ea] prose-pre:bg-[#0a0a0f] prose-pre:border prose-pre:border-[rgba(255,255,255,0.07)] prose-pre:rounded-xl prose-code:before:content-none prose-code:after:content-none prose-li:text-[#9090a8] prose-ul:space-y-1">
                <MdxContent content={cortexChangelog} />
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 flex items-center gap-3">
              <span className="text-sm text-[#55556a]">
                Could not fetch cortex changelog from GitHub.
              </span>
            </div>
          )}
        </section>
      </div>

      <div className="mt-12 flex items-center justify-center gap-4">
        <a
          href="https://github.com/scarecr0w12/cortex-web/commits/main"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Full commit history
        </a>
        <span className="text-[#333]">·</span>
        <a
          href="https://github.com/scarecr0w12/cortex/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Cortex CHANGELOG.md
        </a>
      </div>
    </div>
  );
}
