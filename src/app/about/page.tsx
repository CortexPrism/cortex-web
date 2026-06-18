import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe, Github, Heart, Code2 } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About CortexPrism — Open-Source AI Agent Runtime",
  description:
    "CortexPrism is an open-source AI agent runtime built with TypeScript and Deno. Features 24 LLM providers, 5-tier memory architecture, parallax security, sandboxed code execution, and an extensible MCP plugin marketplace. MIT licensed, privacy-first, no telemetry.",
  keywords: [
    "about CortexPrism",
    "open source AI agent runtime",
    "TypeScript AI framework",
    "Deno AI runtime",
    "MIT licensed AI tools",
    "privacy-first AI agent",
    "self-hosted AI platform",
    "no vendor lock-in LLM",
  ],
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About CortexPrism — Open-Source AI Agent Runtime",
    description:
      "Open-source AI agent runtime in TypeScript/Deno. 24 LLM providers, 5-tier memory, parallax security, sandboxed execution, MCP plugin marketplace. MIT licensed. No telemetry, no vendor lock-in.",
    url: `${SITE_URL}/about`,
  },
  twitter: {
    title: "About CortexPrism — Open-Source AI Agent Runtime",
    description:
      "Open-source AI agent runtime in TypeScript/Deno. 24 LLM providers, 5-tier memory, parallax security, sandboxed execution, MCP plugin marketplace. MIT licensed.",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-page-narrow mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 md:py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#e2e2ea]">
          About <span className="gradient-text">CortexPrism</span>
        </h1>
        <p className="mt-4 text-lg text-[#9090a8] max-w-4xl mx-auto">
          The open-source agentic harness that puts powerful AI capabilities in your hands.
        </p>
      </div>

      <div className="glass-card p-8 md:p-12 mb-12">
        <h2 className="text-2xl font-bold text-[#e2e2ea] mb-4">What is CortexPrism?</h2>
        <div className="space-y-4 text-[#9090a8] leading-relaxed">
          <p>
            CortexPrism is a single-process agentic harness written in TypeScript/Deno. It exposes a CLI, a REST API + WebSocket server, and a web UI. All state is persisted in SQLite databases using WAL mode.
          </p>
          <p>
            At its core, CortexPrism is an agent loop that orchestrates LLM calls, tool execution, memory operations, and reflection. It supports 24 LLM providers through a unified interface, with a cascading model router for cost optimization.
          </p>
          <p>
            The system features a 5-tier memory architecture with hybrid FTS5 keyword + vector embedding retrieval, a defense-in-depth security model (Parallax) with encrypted credential vault, sandboxed code execution with auto-fix loops, a Model Quartermaster adaptive prediction engine, a git workspace with agent-powered commit messages, a DSL-based workflow engine, and distributed remote agent execution via hub nodes.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="glass-card p-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#e2e2ea] mb-2">Why Deno?</h3>
          <p className="text-sm text-[#9090a8] leading-relaxed">
            Deno provides a secure-by-default runtime with TypeScript support out of the box, modern JavaScript APIs, and efficient process management. It allows CortexPrism to run as a single binary with minimal dependencies.
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 text-green-400 mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#e2e2ea] mb-2">Why Open Source?</h3>
          <p className="text-sm text-[#9090a8] leading-relaxed">
            We believe AI infrastructure should be transparent, auditable, and community-driven. The MIT license ensures CortexPrism remains free for everyone — individuals, startups, and enterprises alike.
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 mb-4">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#e2e2ea] mb-2">Provider Freedom</h3>
          <p className="text-sm text-[#9090a8] leading-relaxed">
            No vendor lock-in. Use any LLM provider — or multiple at once. Switch between Anthropic, OpenAI, Google, local Ollama models, or any of 24 providers with a single flag.
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-400 mb-4">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#e2e2ea] mb-2">Extensible</h3>
          <p className="text-sm text-[#9090a8] leading-relaxed">
            Built-in tool system, plugin architecture supporting ESM/MCP/WASM, and a full REST API. Extend CortexPrism with custom tools, plugins, and integrations.
          </p>
        </div>
      </div>

      <div className="glass-card p-8 mb-12">
        <h2 className="text-xl font-bold text-[#e2e2ea] mb-4">Project Principles</h2>
        <div className="space-y-4">
          {[
            { title: "Privacy First", desc: "All data stored locally. No telemetry, no tracking. Your conversations, memory, and credentials remain on your machine." },
            { title: "Security by Design", desc: "Defense-in-depth with Parallax security model. Every tool call validated, every access logged, credentials encrypted." },
            { title: "Provider Agnostic", desc: "Use any LLM provider. Switch freely. The unified interface means your workflows are portable." },
            { title: "Local by Default", desc: "Run entirely on your machine. No cloud dependency for core functionality. Optional connectivity for LLM APIs." },
            { title: "Community Driven", desc: "MIT licensed. Contributions welcome. The roadmap is shaped by the community." },
          ].map((principle) => (
            <div key={principle.title} className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">◆</span>
              <div>
                <h3 className="text-sm font-semibold text-[#e2e2ea]">{principle.title}</h3>
                <p className="text-sm text-[#9090a8]">{principle.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-[#9090a8] mb-4">
          <Heart className="w-4 h-4 text-red-400" />
          <span>Built with love for the AI community</span>
        </div>
        <div className="flex items-center justify-center gap-4">
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
        </div>
      </div>
    </div>
  );
}
