import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getGitHubStats } from "@/lib/github";
import { Hero } from "@/components/landing/Hero";
import { StatsBar } from "@/components/landing/StatsBar";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { RecentBlogPosts } from "@/components/landing/RecentBlogPosts";
import { CtaSection } from "@/components/landing/CtaSection";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateSoftwareAppSchema, generateAlternates } from "@/lib/seo";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "CortexPrism — Open-Source AI OS | Agent Operating System with Memory, Tools & Web UI",
  description:
    "CortexPrism v0.50.0 is the open-source AI OS — a self-hosted Agent Operating System with 24 LLM providers, 5-tier memory, 60+ built-in tools, sandboxed code execution, overhauled web UI with dark/light theme and experience levels, and layered Parallax security. Powered by Deno. Apache 2.0 licensed.",
  keywords: [
    "AI OS",
    "Agent OS",
    "open source AI OS",
    "open source AI agent",
    "AI agent operating system",
    "LLM orchestration",
    "self-hosted AI",
    "autonomous agents",
    "agent operating system",
    "agent orchestration framework",
    "multi-provider LLM",
    "AI agent operating system platform",
    "AI memory system",
    "Deno AI operating system",
    "AI OS powered by Deno",
  ],
  alternates: generateAlternates("/"),
  openGraph: {
    title: "CortexPrism — Open-Source AI OS | Agent Operating System with Memory, Tools & Web UI",
    description:
      "The open-source AI OS: a self-hosted Agent Operating System with 24 LLM providers, 5-tier memory, 60+ tools, sandboxed code execution, overhauled web UI with dark/light theme and experience levels, and Parallax security. Powered by Deno. Apache 2.0 licensed.",
    url: "https://cortexprism.io",
  },
  twitter: {
    title: "CortexPrism — Open-Source AI OS | Agent Operating System with Memory, Tools & Web UI",
    description:
      "The open-source AI OS: a self-hosted Agent Operating System with 24 LLM providers, 5-tier memory, 60+ tools, sandboxed code execution, and Parallax security. Powered by Deno. Apache 2.0 licensed.",
  },
};

const CORTEX_VERSION_DEFAULT = "0.50.0";

function getCortexVersion(): string {
  const envVersion = process.env.NEXT_PUBLIC_CORTEX_VERSION;
  if (envVersion) return envVersion;

  try {
    const cortexDir = process.env.CORTEX_SOURCE_DIR || "/root/cortex";
    const denoJsonPath = path.join(cortexDir, "deno.json");
    if (fs.existsSync(denoJsonPath)) {
      const raw = fs.readFileSync(denoJsonPath, "utf-8");
      const { version } = JSON.parse(raw);
      return version || CORTEX_VERSION_DEFAULT;
    }
  } catch {}

  return CORTEX_VERSION_DEFAULT;
}

const cortexVersion = getCortexVersion();

export default async function HomePage() {
  const [pluginCount, agentCount, downloadAgg, gh] = await Promise.all([
    prisma.plugin.count({ where: { status: "approved" } }),
    prisma.agentConfig.count({ where: { status: "approved" } }),
    prisma.plugin.aggregate({ _sum: { downloads: true } }),
    getGitHubStats(),
  ]);

  const agentDownloads = await prisma.agentConfig.aggregate({ _sum: { downloads: true } });
  const totalDownloads =
    (downloadAgg._sum.downloads || 0) + (agentDownloads._sum.downloads || 0);

  return (
    <>
      <StructuredData data={generateSoftwareAppSchema()} />
      <Hero version={cortexVersion} />
      <StatsBar
        githubStars={gh.stargazers_count}
        pluginCount={pluginCount}
        agentCount={agentCount}
        totalDownloads={totalDownloads}
      />
      <FeatureGrid />
      <RecentBlogPosts />
      <CtaSection />
    </>
  );
}
