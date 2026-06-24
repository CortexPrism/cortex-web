import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  ArrowRight, Shield, Zap, Globe, Github, Heart, Code2,
  Lock, Server, Users, BookOpen,
} from "lucide-react";
import { SITE_URL, generateAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return {
    title: `${t("headline")} — CortexPrism`,
    description: t("subtitle"),
    alternates: generateAlternates("/about"),
    openGraph: {
      title: `${t("headline")} — CortexPrism`,
      description: t("subtitle"),
      url: `${SITE_URL}/about`,
    },
    twitter: {
      title: `${t("headline")} — CortexPrism`,
      description: t("subtitle"),
    },
  };
}

function TerminalBlock({ commands }: { commands: { label: string; cmd: string }[] }) {
  return (
    <div className="glass-card p-1">
      <div className="bg-[#0a0a0f] rounded-lg p-4 border border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-[#55556a] font-mono">terminal</span>
        </div>
        <div className="space-y-3">
          {commands.map((c) => (
            <div key={c.cmd}>
              <div className="text-[10px] uppercase tracking-wider text-[#55556a] mb-1 font-mono">{c.label}</div>
              <pre className="text-sm font-mono">
                <code>
                  <span className="text-[#55556a]">$ </span>
                  <span className="text-green-400">cortex</span>
                  <span className="text-[#e2e2ea]"> {c.cmd.startsWith("cortex ") ? c.cmd.slice(7) : c.cmd}</span>
                </code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FEATURE_CARDS = [
  { icon: Zap, titleKey: "whyDeno", descKey: "whyDenoDesc", color: "text-indigo-400", bg: "bg-indigo-500/10", glow: "rgba(99,102,241,0.18)", borderColor: "border-indigo-500/20" },
  { icon: Shield, titleKey: "whyOpenSource", descKey: "whyOpenSourceDesc", color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "rgba(52,211,153,0.15)", borderColor: "border-emerald-500/20" },
  { icon: Globe, titleKey: "providerFreedom", descKey: "providerFreedomDesc", color: "text-purple-400", bg: "bg-purple-500/10", glow: "rgba(167,139,250,0.15)", borderColor: "border-purple-500/20" },
  { icon: Code2, titleKey: "extensible", descKey: "extensibleDesc", color: "text-amber-400", bg: "bg-amber-500/10", glow: "rgba(251,191,36,0.15)", borderColor: "border-amber-500/20" },
];

const PRINCIPLES = [
  { icon: Lock, titleKey: "principlePrivacyTitle", descKey: "principlePrivacyDesc", color: "text-violet-400", bg: "bg-violet-500/10", glow: "rgba(167,139,250,0.15)", borderColor: "border-violet-500/20" },
  { icon: Shield, titleKey: "principleSecurityTitle", descKey: "principleSecurityDesc", color: "text-red-400", bg: "bg-red-500/10", glow: "rgba(248,113,113,0.15)", borderColor: "border-red-500/20" },
  { icon: Globe, titleKey: "principleProviderTitle", descKey: "principleProviderDesc", color: "text-purple-400", bg: "bg-purple-500/10", glow: "rgba(167,139,250,0.15)", borderColor: "border-purple-500/20" },
  { icon: Server, titleKey: "principleLocalTitle", descKey: "principleLocalDesc", color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "rgba(52,211,153,0.15)", borderColor: "border-emerald-500/20" },
  { icon: Users, titleKey: "principleCommunityTitle", descKey: "principleCommunityDesc", color: "text-blue-400", bg: "bg-blue-500/10", glow: "rgba(96,165,250,0.15)", borderColor: "border-blue-500/20" },
];

export default async function AboutPage() {
  const t = await getTranslations("about");
  const tc = await getTranslations("common");

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 md:py-20">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
          <BookOpen className="w-4 h-4" />
          About CortexPrism
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#e2e2ea] leading-tight">
          {t("headline")}
        </h1>
        <p className="mt-5 text-lg text-[#9090a8] max-w-3xl mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[
          { value: "Apache 2.0", label: "Open Source" },
          { value: "30+", label: "LLM Providers" },
          { value: "60+", label: "Built-in Tools" },
          { value: "Single Binary", label: "Zero Dependencies" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <div className="text-2xl font-bold gradient-text">{stat.value}</div>
            <div className="text-xs text-[#55556a] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* What is CortexPrism */}
      <div className="grid md:grid-cols-2 gap-8 mb-16 items-start">
        <div className="glass-card p-8 md:p-10">
          <h2 className="text-xl font-bold text-[#e2e2ea] mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            {t("whatIsTitle")}
          </h2>
          <div className="space-y-4 text-[#9090a8] leading-relaxed">
            <p>{t("whatIsP1")}</p>
            <p>{t("whatIsP2")}</p>
            <p>{t("whatIsP3")}</p>
          </div>
        </div>
        <div className="sticky top-24">
          <h3 className="text-xs uppercase tracking-widest text-[#55556a] mb-3 font-semibold">Try it yourself</h3>
          <TerminalBlock
            commands={[
              { label: "Start a chat session", cmd: "cortex agent chat --model claude-sonnet-4-5" },
              { label: "Add to persistent memory", cmd: "cortex memory add 'Project uses PostgreSQL with Prisma ORM'" },
              { label: "Search your knowledge base", cmd: "cortex memory search 'database schema' --type semantic" },
              { label: "List available tools", cmd: "cortex tools list" },
              { label: "Install a plugin", cmd: "cortex plugins install marketplace:cortexprism.io/plugins/python-executor" },
            ]}
          />
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mb-16">
        <h2 className="text-lg font-semibold text-[#e2e2ea] mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          Why CortexPrism
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="group relative bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-xl p-5 transition-all duration-200 hover:border-[rgba(255,255,255,0.14)] hover:bg-[#14141c]"
            >
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 30%, ${card.glow} 0%, transparent 70%)` }}
              />
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${card.bg} mb-3 transition-transform duration-200 group-hover:scale-110 relative`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-[#e2e2ea] mb-2 relative">{t(card.titleKey)}</h3>
              <p className="text-sm text-[#9090a8] leading-relaxed relative">{t(card.descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Principles */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10" style={{ boxShadow: "0 0 20px rgba(99,102,241,0.18)" }}>
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#e2e2ea]">{t("principlesTitle")}</h2>
            <p className="text-sm text-indigo-400 font-medium">The values that guide everything we build</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.titleKey}
              className="group relative bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-xl p-5 transition-all duration-200 hover:border-[rgba(255,255,255,0.14)] hover:bg-[#14141c]"
            >
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 30%, ${principle.glow} 0%, transparent 70%)` }}
              />
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${principle.bg} mb-3 transition-transform duration-200 group-hover:scale-110 relative`}>
                <principle.icon className={`w-5 h-5 ${principle.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-[#e2e2ea] mb-2 relative">{t(principle.titleKey)}</h3>
              <p className="text-sm text-[#9090a8] leading-relaxed relative">{t(principle.descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16">
        <div className="glass-card p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          <div className="inline-flex items-center gap-2 text-[#9090a8] mb-6 relative">
            <Heart className="w-4 h-4 text-red-400" />
            <span>{t("builtWithLove")}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#e2e2ea] relative">
            Ready to start building?
          </h2>
          <p className="mt-3 text-[#9090a8] max-w-lg mx-auto relative">
            Install CortexPrism in one command. Self-hosted, open source, Apache 2.0 licensed.
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
              {tc("getStarted")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/CortexPrism/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg border border-[rgba(255,255,255,0.15)] text-[#e2e2ea] hover:bg-[#111118] transition-colors"
            >
              <Github className="w-5 h-5" />
              {tc("viewOnGitHub")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
