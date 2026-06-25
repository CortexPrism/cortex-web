import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Puzzle, Bot, Sparkles, TrendingUp, Zap, Clock, Flame } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { SITE_URL, generateAlternates } from "@/lib/seo";
import { PluginCard } from "@/components/marketplace/PluginCard";
import { AgentCard } from "@/components/marketplace/AgentCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CortexPrism Marketplace — AI Plugins, MCP Servers & Agent Configs",
  description:
    "Browse the CortexPrism marketplace for AI plugins (ESM, MCP servers, WASM) and pre-configured agent profiles. Discover, install, and publish open-source extensions for the AI Agent Operating System.",
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
  alternates: generateAlternates("/marketplace"),
  openGraph: {
    title: "CortexPrism Marketplace — AI Plugins, MCP Servers & Agent Configs",
    description:
      "Discover AI plugins (ESM modules, MCP servers, WASM runtimes) and pre-configured agent profiles. Community-driven marketplace for the open-source AI Agent Operating System.",
    url: `${SITE_URL}/marketplace`,
  },
  twitter: {
    title: "CortexPrism Marketplace — AI Plugins, MCP Servers & Agent Configs",
    description:
      "Browse AI plugins (ESM, MCP servers, WASM runtimes) and pre-configured agent profiles. Community-driven, open-source marketplace.",
  },
};

const pluginSelect = {
  id: true,
  name: true,
  slug: true,
  version: true,
  description: true,
  kind: true,
  author: true,
  downloads: true,
  rating: true,
  icon: true,
  license: true,
  repository: true,
  githubStars: true,
  category: { select: { name: true } },
} as const;

const agentSelect = {
  id: true,
  name: true,
  slug: true,
  version: true,
  description: true,
  provider: true,
  model: true,
  author: true,
  downloads: true,
  rating: true,
  icon: true,
  tags: true,
  repository: true,
  githubStars: true,
  category: { select: { name: true } },
} as const;

function mapPluginForCard(p: Record<string, unknown>) {
  return {
    id: p.id as string,
    name: p.name as string,
    slug: p.slug as string,
    version: p.version as string,
    description: p.description as string,
    kind: p.kind as string,
    author: p.author as string | null,
    downloads: p.downloads as number,
    rating: p.rating as number,
    category: (p.category as { name: string } | null)?.name ?? null,
    icon: p.icon as string | null,
    license: p.license as string | null,
    repository: p.repository as string | null,
    githubStars: p.githubStars as number,
  };
}

function mapAgentForCard(a: Record<string, unknown>) {
  return {
    id: a.id as string,
    name: a.name as string,
    slug: a.slug as string,
    version: a.version as string,
    description: a.description as string,
    provider: a.provider as string | null,
    model: a.model as string | null,
    author: a.author as string | null,
    downloads: a.downloads as number,
    rating: a.rating as number,
    tags: typeof a.tags === 'string' ? JSON.parse(a.tags || "[]") : (a.tags as string[] || []),
    category: (a.category as { name: string } | null)?.name ?? null,
    icon: a.icon as string | null,
    repository: a.repository as string | null,
    githubStars: a.githubStars as number,
  };
}

export default async function MarketplacePage() {
  const [pluginCount, agentCount, trendingPlugins, trendingAgents, newPlugins, newAgents] =
    await Promise.all([
      prisma.plugin.count({ where: { status: "approved" } }),
      prisma.agentConfig.count({ where: { status: "approved" } }),
      prisma.plugin.findMany({
        where: { status: "approved" },
        orderBy: { downloads: "desc" },
        take: 6,
        select: pluginSelect,
      }),
      prisma.agentConfig.findMany({
        where: { status: "approved" },
        orderBy: { downloads: "desc" },
        take: 6,
        select: agentSelect,
      }),
      prisma.plugin.findMany({
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: pluginSelect,
      }),
      prisma.agentConfig.findMany({
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: agentSelect,
      }),
    ]);

  const t = await getTranslations("marketplaceHub");

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 md:py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#e2e2ea]">{t("heading")}</h1>
        <p className="mt-4 text-lg text-[#9090a8] max-w-4xl mx-auto">
          {t("subtitle")}
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
              <h2 className="text-xl font-bold text-[#e2e2ea] mb-2 group-hover:text-white transition-colors">{t("plugins")}</h2>
              <p className="text-[#9090a8] mb-6">
                {t("pluginsDesc")}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold gradient-text">{pluginCount}</span>
                  <span className="text-xs text-[#55556a]">{t("pluginsAvailable")}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm text-emerald-400 group-hover:gap-2 transition-all">
                  {t("browse")} <ArrowRight className="w-4 h-4" />
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
              <h2 className="text-xl font-bold text-[#e2e2ea] mb-2 group-hover:text-white transition-colors">{t("agents")}</h2>
              <p className="text-[#9090a8] mb-6">
                {t("agentsDesc")}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold gradient-text">{agentCount}</span>
                  <span className="text-xs text-[#55556a]">{t("agentsAvailable")}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm text-purple-400 group-hover:gap-2 transition-all">
                  {t("browse")} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="glass-card p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">{pluginCount}</div>
              <div className="text-xs text-[#55556a] uppercase tracking-wider">{t("overviewPlugins")}</div>
            </div>
          </div>
          <p className="text-xs text-[#9090a8] mb-4">{t("overviewPluginsDesc")}</p>
          <Link href="/marketplace/plugins" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
            {t("browse")} All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">{agentCount}</div>
              <div className="text-xs text-[#55556a] uppercase tracking-wider">{t("overviewAgents")}</div>
            </div>
          </div>
          <p className="text-xs text-[#9090a8] mb-4">{t("overviewAgentsDesc")}</p>
          <Link href="/marketplace/agents" className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
            {t("browse")} All <ArrowRight className="w-3 h-3" />
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
              <div className="text-xs text-[#55556a] uppercase tracking-wider">{t("overviewTotal")}</div>
            </div>
          </div>
          <p className="text-xs text-[#9090a8] mb-4">{t("communityCurated")}</p>
          <div className="flex flex-col gap-2">
            <Link href="/marketplace/publish/plugin" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              {t("sharePlugin")} <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/marketplace/publish/agent" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              {t("shareAgent")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[#e2e2ea]">{t("trendingTitle")}</h2>
          </div>
        </div>

        <div className="space-y-10">
          {trendingPlugins.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#e2e2ea] flex items-center gap-2">
                  <Puzzle className="w-4 h-4 text-emerald-400" />
                  {t("trendingPlugins")}
                </h3>
                <Link href="/marketplace/plugins?sort=downloads" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  {t("viewAll")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingPlugins.map((p) => (
                  <PluginCard key={p.id} plugin={mapPluginForCard(p)} />
                ))}
              </div>
            </div>
          )}

          {trendingAgents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#e2e2ea] flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  {t("trendingAgents")}
                </h3>
                <Link href="/marketplace/agents?sort=downloads" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  {t("viewAll")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingAgents.map((a) => (
                  <AgentCard key={a.id} agent={mapAgentForCard(a)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recently Added Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[#e2e2ea]">{t("newTitle")}</h2>
          </div>
        </div>

        <div className="space-y-10">
          {newPlugins.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#e2e2ea] flex items-center gap-2">
                  <Puzzle className="w-4 h-4 text-emerald-400" />
                  {t("newPlugins")}
                </h3>
                <Link href="/marketplace/plugins?sort=newest" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  {t("viewAll")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newPlugins.map((p) => (
                  <PluginCard key={p.id} plugin={mapPluginForCard(p)} />
                ))}
              </div>
            </div>
          )}

          {newAgents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#e2e2ea] flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  {t("newAgents")}
                </h3>
                <Link href="/marketplace/agents?sort=newest" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  {t("viewAll")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newAgents.map((a) => (
                  <AgentCard key={a.id} agent={mapAgentForCard(a)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-[#e2e2ea]">{t("whyTitle")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#0a0a0f] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-[#e2e2ea]">{t("easyIntegration")}</h3>
            </div>
            <p className="text-xs text-[#9090a8]">{t("easyIntegrationDesc")}</p>
          </div>
          <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#0a0a0f] p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-[#e2e2ea]">{t("communityDriven")}</h3>
            </div>
            <p className="text-xs text-[#9090a8]">{t("communityDrivenDesc")}</p>
          </div>
          <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#0a0a0f] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-[#e2e2ea]">{t("curatedQuality")}</h3>
            </div>
            <p className="text-xs text-[#9090a8]">{t("curatedQualityDesc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
