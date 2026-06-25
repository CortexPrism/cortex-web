import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  GitBranch, GitCommit, GitPullRequestArrow, ExternalLink,
  ArrowRight, CalendarDays, Clock, Github,
} from "lucide-react";
import { MdxContent } from "@/components/docs/MdxContent";
import { SITE_URL, generateAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CortexPrism Changelog — Agent Operating System Release History & Commits",
  description:
    "Track CortexPrism releases, recent commits from the cortex engine, and full changelog history. Stay up to date with the latest features and fixes in the open-source Agent Operating System.",
  alternates: generateAlternates("/changelog"),
  keywords: [
    "CortexPrism changelog",
    "Agent Operating System release history",
    "AI OS release history",
    "Agent OS changelog",
    "open source AI agent updates",
    "CortexPrism release notes",
    "AI agent operating system commits",
    "cortex engine commits",
    "what's new CortexPrism",
  ],
  openGraph: {
    title: "CortexPrism Changelog — Agent Operating System Release History & Commits",
    description:
      "Recent commits from the cortex engine repository. Track changes, new features, bug fixes, and improvements in the open-source Agent Operating System.",
    url: `${SITE_URL}/changelog`,
  },
  twitter: {
    title: "CortexPrism Changelog — Agent Operating System Release History & Commits",
    description:
      "Track CortexPrism releases, recent commits from the cortex engine, and full changelog history.",
  },
};

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
  repo: string;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function timeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

async function getRecentCommits(owner: string, repo: string, limit = 20): Promise<Commit[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`,
      {
        cache: "no-store",
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
      repo,
    }));
  } catch {
    return [];
  }
}

async function getChangelogMD(repo: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${repo}/main/CHANGELOG.md`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export default async function ChangelogPage() {
  const [cortexCommits, cortexChangelog] = await Promise.all([
    getRecentCommits("CortexPrism", "cortex", 20),
    getChangelogMD("CortexPrism/cortex"),
  ]);

  const t = await getTranslations("changelogPage");

  const latestCommitDate = cortexCommits.length > 0 ? cortexCommits[0].date : null;

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 md:py-20">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm rounded-full bg-green-500/10 border border-green-500/20 text-green-300">
          <GitPullRequestArrow className="w-4 h-4" />
          Release History
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#e2e2ea] leading-tight">
          {t("heading")}{" "}
          <span className="gradient-text">— What&apos;s New</span>
        </h1>
        <p className="mt-5 text-lg text-[#9090a8] max-w-3xl mx-auto leading-relaxed">
          {t("subtitle")}{" "}
          <a href="https://github.com/CortexPrism/cortex" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            cortex
          </a>
          {" "}repository.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-16 max-w-md mx-auto">
        {[
          { value: String(cortexCommits.length), label: "Recent Commits", icon: GitCommit },
          { value: latestCommitDate ? timeAgo(latestCommitDate) : "--", label: "Latest Activity", icon: Clock },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-2xl font-bold gradient-text mb-0.5">
              <stat.icon className="w-5 h-5 text-indigo-400 shrink-0" />
              {stat.value}
            </div>
            <div className="text-xs text-[#55556a] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Commits */}
      {cortexCommits.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10" style={{ boxShadow: "0 0 20px rgba(167,139,250,0.18)" }}>
              <GitCommit className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#e2e2ea]">{t("recentCommits")}</h2>
              <p className="text-sm text-purple-400 font-medium">Last {cortexCommits.length} commits on cortex</p>
            </div>
          </div>
          <div className="space-y-2">
            {cortexCommits.map((c) => (
              <a
                key={c.sha}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 p-4 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-xl hover:border-[rgba(255,255,255,0.14)] hover:bg-[#14141c] transition-all duration-200"
              >
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] text-[#666680] group-hover:text-purple-400 group-hover:border-purple-500/30 transition-colors shrink-0 mt-0.5">
                  {c.sha}
                </span>
                <code className="flex-1 text-sm text-[#9090a8] group-hover:text-[#e2e2ea] transition-colors leading-relaxed">
                  {c.message}
                </code>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-[#55556a]">{c.author}</span>
                  <span className="flex items-center gap-1 text-xs text-[#55556a]">
                    <CalendarDays className="w-3 h-3" />
                    {formatDate(c.date)}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Cortex CHANGELOG.md */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10" style={{ boxShadow: "0 0 20px rgba(167,139,250,0.15)" }}>
              <GitBranch className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#e2e2ea]">{t("cortexEngine")}</h2>
              <p className="text-xs text-[#55556a]">cortex CHANGELOG.md</p>
            </div>
          </div>
          <a
            href="https://github.com/CortexPrism/cortex/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1 text-xs text-[#55556a] hover:text-indigo-400 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View raw
          </a>
        </div>
        {cortexChangelog ? (
          <div className="glass-card p-6 md:p-8">
            <div className="prose prose-invert max-w-none prose-headings:text-[#e2e2ea] prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-[#9090a8] prose-a:text-indigo-400 prose-strong:text-[#e2e2ea] prose-code:text-[#e2e2ea] prose-pre:bg-[#0a0a0f] prose-pre:border prose-pre:border-[rgba(255,255,255,0.07)] prose-pre:rounded-xl prose-code:before:content-none prose-code:after:content-none prose-li:text-[#9090a8] prose-ul:space-y-1">
              <MdxContent content={cortexChangelog} />
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <GitBranch className="w-8 h-8 text-[#55556a] mx-auto mb-3" />
            <p className="text-sm text-[#55556a]">{t("noChangelog")}</p>
          </div>
        )}
      </section>

      {/* Footer Links */}
      <div className="flex items-center justify-center gap-6 mb-16">
        <a
          href="https://github.com/CortexPrism/cortex/commits/main"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-[#9090a8] hover:text-indigo-400 transition-colors"
        >
          <GitCommit className="w-4 h-4" />
          {t("fullHistory")}
        </a>
      </div>

      {/* CTA */}
      <div className="glass-card p-10 md:p-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <h2 className="text-2xl md:text-3xl font-bold text-[#e2e2ea] relative">
          Want to contribute?
        </h2>
        <p className="mt-3 text-[#9090a8] max-w-lg mx-auto relative">
          CortexPrism is fully open source under Apache 2.0. Every commit on this page came from the community. Install it, star the repo, or open a PR.
        </p>
        <div className="mt-6 max-w-xl mx-auto relative">
          <div className="glass-card p-1">
            <div className="bg-[#0a0a0f] rounded-lg p-3.5 border border-[rgba(255,255,255,0.05)]">
              <pre className="text-sm font-mono overflow-x-auto">
                <code>
                  <span className="text-[#55556a]">$ </span>
                  <span className="text-green-400">curl -fsSL https://cortexprism.io/install.sh</span>
                  <span className="text-[#e2e2ea]"> | bash</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 relative">
          <Link
            href="/getting-started"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg accent-gradient text-white hover:opacity-90 transition-opacity"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com/CortexPrism/cortex"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg border border-[rgba(255,255,255,0.15)] text-[#e2e2ea] hover:bg-[#111118] transition-colors"
          >
            <Github className="w-5 h-5" />
            View on GitHub
          </a>
          <a
            href="https://github.com/CortexPrism/cortex/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg border border-[rgba(255,255,255,0.15)] text-[#e2e2ea] hover:bg-[#111118] transition-colors"
          >
            <GitPullRequestArrow className="w-5 h-5" />
            Contribute
          </a>
        </div>
      </div>
    </div>
  );
}
