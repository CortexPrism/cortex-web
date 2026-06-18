import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Puzzle, Bot, Sparkles, TrendingUp, Zap } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CortexPrism Marketplace — AI Plugins, MCP Servers & Agent Configs",
  description:
    "Browse the CortexPrism marketplace for AI plugins (ESM, MCP servers, WASM) and pre-configured agent profiles. Discover, install, and publish open-source extensions for the AI agent runtime.",
  keywords: [
    "AI plugin marketplace",
    "MCP server plugins",
    "Model Context Protocol plugins",
    "open source AI extensions",
    "agent configuration marketplace",
    "ESM AI plugins",
    "WASM AI plugins",
    "AI agent profiles",
    "LLM plugin store",
  ],
  alternates: { canonical: `${SITE_URL}/marketplace` },
  openGraph: {
    title: "CortexPrism Marketplace — AI Plugins, MCP Servers & Agent Configs",
    description:
      "Discover AI plugins (ESM modules, MCP servers, WASM runtimes) and pre-configured agent profiles. Community-driven marketplace for the open-source AI agent runtime.",
    url: `${SITE_URL}/marketplace`,
  },
  twitter: {
    title: "CortexPrism Marketplace — AI Plugins, MCP Servers & Agent Configs",
    description:
      "Browse AI plugins (ESM, MCP servers, WASM runtimes) and pre-configured agent profiles. Community-driven, open-source marketplace.",
  },
};

export default async function MarketplacePage() {
  const [pluginCount, agentCount] = await Promise.all([
    prisma.plugin.count({ where: { status: "approved" } }),
    prisma.agentConfig.count({ where: { status: "approved" } }),
  ]);

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 md:py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#e2e2ea]">Marketplace</h1>
        <p className="mt-4 text-lg text-[#9090a8] max-w-4xl mx-auto">
          Discover plugins and agent configurations for the CortexPrism ecosystem.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <Link href="/marketplace/plugins">
          <div className="group relative rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-[#111118] to-[#0f0f15] hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 mb-4 group-hover:bg-emerald-500/30 transition-colors">
                <Puzzle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#e2e2ea] mb-2 group-hover:text-white transition-colors">Plugins</h2>
              <p className="text-[#9090a8] mb-6">
                Extend CortexPrism with powerful plugins. ESM modules, MCP servers, and WASM runtimes.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold gradient-text">{pluginCount}</span>
                  <span className="text-xs text-[#55556a]">plugins available</span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm text-emerald-400 group-hover:gap-2 transition-all">
                  Browse <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/marketplace/agents">
          <div className="group relative rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-[#111118] to-[#0f0f15] hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#e2e2ea] mb-2 group-hover:text-white transition-colors">Agents</h2>
              <p className="text-[#9090a8] mb-6">
                Discover pre-configured agent profiles for various tasks and domains.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold gradient-text">{agentCount}</span>
                  <span className="text-xs text-[#55556a]">agents available</span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm text-purple-400 group-hover:gap-2 transition-all">
                  Browse <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Marketplace Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">{pluginCount}</div>
              <div className="text-xs text-[#55556a] uppercase tracking-wider">Plugins Available</div>
            </div>
          </div>
          <p className="text-xs text-[#9090a8] mb-4">ESM modules, MCP servers, and WASM runtimes</p>
          <Link href="/marketplace/plugins" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
            Browse All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">{agentCount}</div>
              <div className="text-xs text-[#55556a] uppercase tracking-wider">Agent Profiles</div>
            </div>
          </div>
          <p className="text-xs text-[#9090a8] mb-4">Pre-configured agent profiles for various tasks</p>
          <Link href="/marketplace/agents" className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
            Browse All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">
                {formatNumber(pluginCount + agentCount)}
              </div>
              <div className="text-xs text-[#55556a] uppercase tracking-wider">Total Items</div>
            </div>
          </div>
          <p className="text-xs text-[#9090a8] mb-4">Community-curated extensions & profiles</p>
          <div className="flex flex-col gap-2">
            <Link href="/marketplace/publish/plugin" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              Share a Plugin <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/marketplace/publish/agent" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              Share an Agent <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Highlight */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-[#e2e2ea]">Why Use the Marketplace?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#0a0a0f] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-[#e2e2ea]">Easy Integration</h3>
            </div>
            <p className="text-xs text-[#9090a8]">Quickly integrate plugins and agents into your CortexPrism setup with standardized installation commands.</p>
          </div>
          <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#0a0a0f] p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-[#e2e2ea]">Community-Driven</h3>
            </div>
            <p className="text-xs text-[#9090a8]">Discover and share community-built extensions that solve real-world problems and extend platform capabilities.</p>
          </div>
          <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#0a0a0f] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-[#e2e2ea]">Curated Quality</h3>
            </div>
            <p className="text-xs text-[#9090a8]">All marketplace items are reviewed for quality, security, and compatibility with the CortexPrism ecosystem.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
