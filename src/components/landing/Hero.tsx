import Link from "next/link";
import { ArrowRight, Github, Terminal } from "lucide-react";
import { InstallCommand } from "./InstallCommand";

interface HeroProps {
  version: string;
}

export function Hero({ version }: HeroProps) {
  return (
    <section className="relative overflow-hidden" aria-label="Hero">
      {/* ── Background layers ── */}
      {/* Dot grid */}
      <div className="hero-dot-grid absolute inset-0 pointer-events-none" />
      {/* Glow orbs */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.06) 45%, transparent 70%)",
          filter: "blur(1px)",
        }}
      />
      <div
        className="absolute top-40 -left-40 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-60 -right-40 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 pt-20 pb-24 md:pt-28 md:pb-32 relative">
        <div className="text-center max-w-4xl mx-auto">

          {/* Version badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-8 text-sm rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            v{version} — Pre-release
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
            <span className="text-[#e2e2ea]">Open-Source </span>
            <span className="gradient-text">Agentic Harness</span>
            <br />
            <span className="text-[#e2e2ea]">for Modern AI</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[#9090a8] max-w-2xl mx-auto leading-relaxed">
            A powerful, secure, and extensible runtime for building agentic
            applications. Chat with 12+ LLM providers, execute code in
            sandboxes, manage memory across five tiers, orchestrate workflows,
            and deploy distributed agents — all open source.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/getting-started"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg accent-gradient text-white hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(99,102,241,0.35)]"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg border border-[rgba(255,255,255,0.12)] text-[#e2e2ea] hover:bg-[#111118] hover:border-[rgba(255,255,255,0.2)] transition-all"
            >
              Browse Marketplace
            </Link>
            <a
              href="https://github.com/CortexPrism/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118] transition-colors"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </div>

          <InstallCommand />
        </div>

        {/* Terminal demo */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="relative rounded-2xl p-px bg-gradient-to-br from-indigo-500/25 via-purple-500/10 to-transparent shadow-[0_0_60px_rgba(99,102,241,0.12)]">
            <div className="bg-[#0d0d14] rounded-[15px] overflow-hidden">
              {/* Terminal title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[#111118]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="flex items-center gap-1.5 ml-3">
                  <Terminal className="w-3.5 h-3.5 text-[#55556a]" />
                  <span className="text-xs text-[#55556a] font-mono">cortex — terminal</span>
                </div>
              </div>
              {/* Terminal body */}
              <div className="p-6">
                <pre className="text-sm font-mono leading-relaxed">
                  <code>
                    <span className="text-[#55556a]">$ </span>
                    <span className="text-green-400">cortex</span>
                    <span className="text-[#e2e2ea]"> chat -m claude-sonnet-4-5</span>
                    {"\n"}
                    <span className="text-indigo-300/60 text-xs">  ✦ Connected to Anthropic · claude-sonnet-4-5 · context: 200k</span>
                    {"\n\n"}
                    <span className="text-[#55556a]">$ </span>
                    <span className="text-green-400">cortex</span>
                    <span className="text-[#e2e2ea]"> memory search &apos;project architecture&apos; --type semantic</span>
                    {"\n"}
                    <span className="text-indigo-300/60 text-xs">  ✦ Found 12 semantic memories · 3 episodic · 1 reflection note</span>
                    {"\n\n"}
                    <span className="text-[#55556a]">$ </span>
                    <span className="text-green-400">cortex</span>
                    <span className="text-[#e2e2ea]"> run analyze-data.py -l python</span>
                    {"\n"}
                    <span className="text-indigo-300/60 text-xs">  ✦ Running in sandbox · Python 3.12 isolated container</span>
                    {"\n\n"}
                    <span className="text-[#55556a]">$ </span>
                    <span className="text-green-400">cortex</span>
                    <span className="text-[#e2e2ea]"> plugins install marketplace:cortexprism.io/plugins/python-executor</span>
                    {"\n"}
                    <span className="text-green-300/70 text-xs">  ✔ Installed python-executor v2.1.0 · 4 tools registered</span>
                    {"\n"}
                    <span className="text-[#55556a]">▌</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
