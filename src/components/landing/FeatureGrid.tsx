"use client";

import { useTranslations } from "next-intl";
import {
  MessageSquare,
  Wrench,
  Database,
  Shield,
  Clock,
  Code2,
  Route,
  Puzzle,
  GitBranch,
  Workflow,
  BrainCircuit,
  Search,
  Sparkles,
  GitGraph,
  Mic,
  MonitorSmartphone,
} from "lucide-react";

const featureKeys = [
  { key: "interactiveChat",   icon: MessageSquare,   color: "text-blue-400",   bg: "bg-blue-500/10",   glow: "rgba(96,165,250,0.15)" },
  { key: "toolUse",           icon: Wrench,           color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "rgba(52,211,153,0.15)" },
  { key: "memory5Tier",       icon: Database,         color: "text-purple-400", bg: "bg-purple-500/10", glow: "rgba(167,139,250,0.15)" },
  { key: "parallaxSecurity",  icon: Shield,           color: "text-red-400",    bg: "bg-red-500/10",    glow: "rgba(248,113,113,0.15)" },
  { key: "codeSandbox",       icon: Code2,            color: "text-amber-400",  bg: "bg-amber-500/10",  glow: "rgba(251,191,36,0.15)" },
  { key: "modelRouter",       icon: Route,            color: "text-indigo-400", bg: "bg-indigo-500/10", glow: "rgba(99,102,241,0.18)" },
  { key: "daemonJobs",        icon: Clock,            color: "text-cyan-400",   bg: "bg-cyan-500/10",   glow: "rgba(34,211,238,0.15)" },
  { key: "pluginSystem",      icon: Puzzle,           color: "text-pink-400",   bg: "bg-pink-500/10",   glow: "rgba(244,114,182,0.15)" },
  { key: "gitWorkspace",      icon: GitBranch,        color: "text-orange-400", bg: "bg-orange-500/10", glow: "rgba(251,146,60,0.15)" },
  { key: "modelQuartermaster",icon: BrainCircuit,     color: "text-violet-400", bg: "bg-violet-500/10", glow: "rgba(167,139,250,0.15)" },
  { key: "workflowEngine",    icon: Workflow,         color: "text-teal-400",   bg: "bg-teal-500/10",   glow: "rgba(45,212,191,0.15)" },
  { key: "cortexLens",        icon: Search,           color: "text-sky-400",    bg: "bg-sky-500/10",    glow: "rgba(56,189,248,0.15)" },
  { key: "selfLearning",      icon: Sparkles,         color: "text-rose-400",   bg: "bg-rose-500/10",   glow: "rgba(251,113,133,0.15)" },
  { key: "codeIntelligence",  icon: GitGraph,         color: "text-lime-400",   bg: "bg-lime-500/10",   glow: "rgba(163,230,53,0.15)" },
  { key: "voicePipeline",     icon: Mic,              color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", glow: "rgba(232,121,249,0.15)" },
  { key: "computerUse",       icon: MonitorSmartphone, color: "text-yellow-400", bg: "bg-yellow-500/10", glow: "rgba(250,204,21,0.15)" },
];

export function FeatureGrid() {
  const t = useTranslations("features");
  const th = useTranslations("home");

  return (
    <section className="py-24" aria-label="Features">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
            {th("capabilities")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#e2e2ea]">
            {th("featureSectionTitle1")}{" "}
            <span className="gradient-text">{th("featureSectionTitle2")}</span>
          </h2>
          <p className="mt-4 text-lg text-[#9090a8] max-w-2xl mx-auto">
            {th("featureSectionDesc")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureKeys.map(({ key, icon: Icon, color, bg, glow }) => (
            <div
              key={key}
              className="feature-card group relative bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-xl p-6 cursor-default transition-all duration-200 hover:border-[rgba(255,255,255,0.14)] hover:bg-[#14141c]"
            >
              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg} mb-4 transition-transform duration-200 group-hover:scale-110`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>

              <h3 className="text-sm font-semibold text-[#e2e2ea] mb-2">{t(key)}</h3>
              <p className="text-sm text-[#9090a8] leading-relaxed">{t(`${key}Desc`)}</p>

              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${glow} 0%, transparent 65%)`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
