import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe, Github, Heart, Code2 } from "lucide-react";
import { generateAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About CortexPrism — Open-Source Agent Operating System | AI OS for Autonomous Agents",
  description:
    "CortexPrism is an open-source, self-hosted Agent Operating System — an AI OS built with TypeScript and Deno 2.x. Features 24 LLM providers, 5-tier memory, 60+ built-in tools, self-learning skills, code intelligence, voice pipeline, computer use, browser automation, Parallax + LLM supervisor security, A2A protocol, MCP gateway, and an extensible plugin marketplace. Apache 2.0 licensed, privacy-first, no telemetry.",
  keywords: [
    "about CortexPrism",
    "open source Agent Operating System",
    "open source AI OS",
    "open source AI agent operating system",
    "agentic operating system",
    "Agent OS",
    "TypeScript AI framework",
    "Deno AI operating system",
    "Apache 2.0 licensed AI OS",
    "privacy-first AI agent",
    "self-hosted AI platform",
    "no vendor lock-in LLM",
    "self-hosted agent operating system",
  ],
  alternates: generateAlternates("/about"),
  openGraph: {
    title: "About CortexPrism — Open-Source Agent Operating System | AI OS for Autonomous Agents",
    description:
      "Open-source, self-hosted Agent Operating System — an AI OS in TypeScript/Deno 2.x. 24 LLM providers, 5-tier memory, 60+ tools, self-learning skills, code intelligence, voice, computer use, browser automation, Parallax + LLM supervisor security, A2A protocol, MCP gateway. Apache 2.0 licensed.",
    url: "https://cortexprism.io/about",
  },
  twitter: {
    title: "About CortexPrism — Open-Source Agent Operating System | AI OS for Autonomous Agents",
    description:
      "Open-source, self-hosted Agent Operating System — an AI OS in TypeScript/Deno 2.x. 24 LLM providers, 5-tier memory, 60+ tools, self-learning skills, code intelligence, voice, computer use, browser automation. Apache 2.0 licensed.",
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
          The open-source Agent Operating System — a self-hosted AI OS, privacy-first, and powered by Deno 2.x.
        </p>
      </div>

      <div className="glass-card p-8 md:p-12 mb-12">
        <h2 className="text-2xl font-bold text-[#e2e2ea] mb-4">What is CortexPrism?</h2>
        <div className="space-y-4 text-[#9090a8] leading-relaxed">
          <p>
            CortexPrism is an AI OS — a single-process AI Agent Operating System written in TypeScript and running on Deno 2.x. It exposes a CLI, a REST API + WebSocket server, and a full-featured web UI. All state is persisted in SQLite databases using WAL mode — no external database required.
          </p>
          <p>
            At its core, CortexPrism is an agent loop that orchestrates LLM calls, tool execution, memory operations, and reflection. It supports 24 LLM providers through a unified interface, with intelligent model routing via cascade and threshold strategies, plus a self-learning Model Quartermaster that predicts the optimal model for each task.
          </p>
          <p>
            The system features a 5-tier memory architecture with hybrid FTS5 keyword + vector embedding retrieval, a self-learning skills system that auto-extracts reusable patterns, a code intelligence engine with tree-sitter WASM parsing across 14+ languages, voice interaction pipeline, GUI automation via virtual displays, browser automation, a defense-in-depth security model (Parallax + LLM supervisor) with encrypted credential vault and DLP guard, sandboxed code execution, a git workspace with agent-powered commits, a DSL-based workflow engine, and distributed remote agent execution via hub nodes — and it all ships as a single binary.
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
            We believe AI infrastructure should be transparent, auditable, and community-driven. The Apache 2.0 license ensures CortexPrism remains free for everyone — individuals, startups, and enterprises alike.
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
            { title: "Community Driven", desc: "Apache 2.0 licensed. Contributions welcome. The roadmap is shaped by the community." },
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
