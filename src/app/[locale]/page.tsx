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
  title: "CortexPrism — Open-Source Agent Operating System | AI OS for Autonomous AI Agents",
  description:
    "CortexPrism v0.51.0 is the open-source Agent Operating System — a self-hosted AI OS with 24 LLM providers, 5-tier persistent memory, 60+ built-in tools, MCP plugin marketplace, sandboxed code execution, overhauled web UI with dark/light theme and experience levels, and enterprise-grade Parallax security with LLM supervisor. Powered by Deno. Apache 2.0 licensed.",
  keywords: [
    "agent operating system",
    "AI agent operating system",
    "autonomous agent operating system",
    "open source agent operating system",
    "agentic operating system",
    "self-hosted agent operating system",
    "Agent OS",
    "AI OS",
    "open source AI OS",
    "open source AI agent",
    "self-hosted AI agent",
    "autonomous AI agents",
    "AI agent with memory",
    "AI agent memory system",
    "multi-agent orchestration",
    "MCP plugin marketplace",
    "LLM orchestration",
    "LLM agent operating system",
    "multi-provider LLM",
    "self-hosted AI",
    "AI agent security",
    "enterprise AI agent deployment",
    "AI agent platform",
    "AI agent framework",
    "AI agent with tools",
    "sandboxed code execution",
    "Deno AI operating system",
    "AI OS powered by Deno",
    "TypeScript AI agent",
    "private AI agent",
    "autonomous agent platform",
    "agent deployment platform",
    "agent orchestration platform",
  ],
  alternates: generateAlternates("/"),
  openGraph: {
    title: "CortexPrism — Open-Source Agent Operating System | AI OS for Autonomous AI Agents",
    description:
      "The open-source Agent Operating System: a self-hosted AI OS with 24 LLM providers, 5-tier persistent memory, 60+ tools, MCP plugin marketplace, sandboxed code execution, overhauled web UI with dark/light theme and experience levels, and enterprise-grade Parallax security with LLM supervisor. Powered by Deno. Apache 2.0 licensed.",
    url: "https://cortexprism.io",
  },
  twitter: {
    title: "CortexPrism — Open-Source Agent Operating System | AI OS for Autonomous AI Agents",
    description:
      "The open-source Agent Operating System: a self-hosted AI OS with 24 LLM providers, 5-tier memory, 60+ tools, sandboxed code execution, and enterprise-grade Parallax security. Powered by Deno. Apache 2.0 licensed.",
  },
};

const CORTEX_VERSION_DEFAULT = "0.51.0";

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
