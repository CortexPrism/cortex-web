import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Beaker, TestTube, GitBranch, Search, Shield, Mic, Monitor, Code2 } from "lucide-react";
import { generateAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Agent Operating System Use Cases — Voice Agents, Dev Assistants, Automation & Enterprise AI",
  description:
    "See how the CortexPrism Agent Operating System — an open-source AI OS — powers voice-enabled AI assistants, personal AI with persistent memory, AI-assisted development and debugging, research automation, GUI automation, CI/CD workflows, knowledge management, and secure enterprise AI agent deployments.",
  keywords: [
    "Agent Operating System use cases",
    "AI OS use cases",
    "Agent OS use cases",
    "AI agent use cases",
    "AI automation use cases",
    "personal AI assistant with memory",
    "AI coding assistant self-hosted",
    "AI research automation",
    "enterprise AI agent deployment",
    "CI/CD AI automation",
    "knowledge management AI",
    "AI agent operating system workflow",
    "autonomous agent examples",
    "voice AI agent",
    "GUI automation AI",
    "computer use AI agent",
  ],
  alternates: generateAlternates("/use-cases"),
  openGraph: {
    title: "Agent Operating System Use Cases — Voice Agents, Dev Assistants, Automation & Enterprise AI",
    description:
      "The open-source Agent Operating System in action: voice-enabled assistants, self-hosted personal AI with persistent memory, GUI automation, and enterprise-grade secure agent deployments — CortexPrism adapts to any workflow.",
    url: "https://cortexprism.io/use-cases",
  },
  twitter: {
    title: "Agent Operating System Use Cases — Voice Agents, Dev Assistants, Automation & Enterprise AI",
    description:
      "The open-source Agent Operating System in action: voice-enabled assistants, self-hosted personal AI with persistent memory, AI-assisted development, GUI automation, and secure enterprise agent deployments.",
  },
};

const useCases = [
  {
    icon: Bot,
    title: "Personal AI Assistant",
    subtitle: "Your own intelligent assistant with memory",
    description: "Replace generic AI chat interfaces with a personalized assistant that remembers your context, preferences, and project details across sessions.",
    bullets: [
      "Persistent memory across chat sessions — never re-explain context",
      "Multi-provider support — use the best model for each task",
      "Tool integration — read files, search web, execute code",
      "Sandboxed code execution for data analysis and automation",
    ],
    example: "cortex chat --model claude-sonnet-4-5",
  },
  {
    icon: Beaker,
    title: "Research & Analysis",
    subtitle: "AI-powered research workflows",
    description: "Accelerate research with web search integration, code execution, and persistent knowledge storage. Perfect for competitive analysis, literature review, and data exploration.",
    bullets: [
      "Web search via DuckDuckGo for real-time information",
      "Python sandbox for data analysis and visualization",
      "Semantic memory for building a personal knowledge base",
      "Session history for revisiting past research",
    ],
    example: "cortex memory add 'Research findings: market size is $5B'",
  },
  {
    icon: TestTube,
    title: "Development & Debugging",
    subtitle: "Code-first AI assistance",
    description: "An AI pair programmer that can read your codebase, execute and debug code in sandboxed environments, and remember your project context.",
    bullets: [
      "File read tool for examining your codebase",
      "Code execution in 7+ languages with sandbox isolation",
      "Auto-fix loop for automated bug fixing",
      "Shell command execution with approval gates",
    ],
    example: "cortex run script.py --fix",
  },
  {
    icon: GitBranch,
    title: "CI/CD & Automation",
    subtitle: "Scheduled and automated agent tasks",
    description: "Set up automated workflows with scheduled jobs, daemon background processing, and policy-controlled automation. Ideal for monitoring, reporting, and maintenance tasks.",
    bullets: [
      "CRON-based job scheduling for recurring tasks",
      "Daemon mode for persistent background processing",
      "Policy engine for safe automation",
      "Full audit trail via Cortex Lens",
    ],
    example: "cortex jobs add weekly-report 'generate-report' --cron '0 9 * * 1'",
  },
  {
    icon: Search,
    title: "Knowledge Management",
    subtitle: "Build and query a personal knowledge base",
    description: "Use the 5-tier memory system to store, retrieve, and consolidate information. Perfect for teams maintaining shared context or individuals building second brains.",
    bullets: [
      "5-tier memory with hybrid FTS5 + vector search",
      "Episodic memory of past conversations",
      "Semantic memory for facts and knowledge",
      "Reflection patterns for meta-learning",
    ],
    example: "cortex memory search 'deployment configuration'",
  },
  {
    icon: Shield,
    title: "Secure Agent Deployments",
    subtitle: "Enterprise-grade security for agent operations",
    description: "Deploy AI agents with confidence using the Parallax + LLM supervisor security model, encrypted credential vault, DLP Guard, and granular policy controls.",
    bullets: [
      "3-stage tool validation gate + LLM security supervisor",
      "AES-256-GCM encrypted credential vault with PBKDF2",
      "DLP Guard with 22 scanners for data loss prevention",
      "Comprehensive audit logging in Cortex Lens",
    ],
    example: "cortex policy add 'rm.*-rf.*/' --kind shell --effect deny",
  },
  {
    icon: Mic,
    title: "Voice-Enabled Agent",
    subtitle: "Hands-free AI interaction",
    description: "Interact with your AI agent using natural speech. Full voice pipeline with speech-to-text, text-to-speech, and voice activity detection for seamless conversation.",
    bullets: [
      "Speech-to-text via OpenAI Whisper for natural input",
      "Text-to-speech with OpenAI TTS or ElevenLabs voices",
      "Energy-based VAD for automatic turn detection",
      "Real-time audio streaming over WebSocket",
    ],
    example: "cortex voice enable",
  },
  {
    icon: Monitor,
    title: "GUI Automation & Computer Use",
    subtitle: "Automate desktop applications",
    description: "Use CortexPrism to automate GUI applications, fill forms, scrape visual data, and control desktop environments. Perfect for legacy system integration and RPA workflows.",
    bullets: [
      "Virtual display automation via Xvfb",
      "Mouse and keyboard control with coordinate precision",
      "Screenshot capture and visual analysis",
      "Docker-isolated or native desktop runtime",
    ],
    example: "cortex desktop screenshot",
  },
  {
    icon: Code2,
    title: "Codebase Intelligence",
    subtitle: "Understand and navigate large codebases",
    description: "Index your entire codebase with tree-sitter WASM parsing across 14+ languages. Navigate call graphs, trace execution paths, and analyze impact of changes.",
    bullets: [
      "Multi-language parsing: TS, JS, Python, Go, Rust, Java, Kotlin, C, C++, C#, Ruby, PHP, Swift, Scala, Lua, Bash, SQL, and more",
      "Call graph resolution with cross-file import analysis",
      "Visual dependency graphs via D3.js in the Web UI",
      "Impact analysis and path tracing for change management",
    ],
    example: "cortex serve && open http://127.0.0.1:3000/codegraph",
  },
];

export default function UseCasesPage() {
  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 md:py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#e2e2ea]">Agent Operating System Use Cases</h1>
        <p className="mt-4 text-lg text-[#9090a8] max-w-4xl mx-auto">
          The open-source Agent Operating System adapts to your workflow. Here are some of the ways it can be used.
        </p>
      </div>

      <div className="space-y-12">
        {useCases.map((uc) => (
          <div key={uc.title} className="glass-card p-8 md:p-10 grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <uc.icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#e2e2ea]">{uc.title}</h2>
                  <p className="text-sm text-[#55556a]">{uc.subtitle}</p>
                </div>
              </div>
              <p className="text-[#9090a8] leading-relaxed mb-6">{uc.description}</p>
              <ul className="space-y-2">
                {uc.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-[#9090a8]">
                    <span className="text-indigo-400 mt-0.5">◆</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-4 h-fit">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500/80" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                <div className="w-2 h-2 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-[#55556a] font-mono">terminal</span>
              </div>
              <pre className="text-sm font-mono">
                <code>
                  <span className="text-[#55556a]">$ </span>
                  <span className="text-green-400">cortex</span>
                  <span className="text-[#e2e2ea]"> {uc.example}</span>
                </code>
              </pre>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/getting-started"
          className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg accent-gradient text-white hover:opacity-90 transition-opacity"
        >
          Get Started with the Agent Operating System
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
