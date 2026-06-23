import type { Metadata } from "next";
import {
  MessageSquare,
  Wrench,
  Database,
  Shield,
  Code2,
  Route,
  Clock,
  Puzzle,
  Monitor,
  Bot,
  Share2,
  GitBranch,
  Workflow,
  BrainCircuit,
  Search,
  Sparkles,
  GitGraph,
  Mic,
  MonitorSmartphone,
  Globe,
  Network,
} from "lucide-react";
import { generateAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CortexPrism Features — Agent Operating System Capabilities | AI OS Features",
  description:
    "Explore the full Agent Operating System feature set: chat with 24 LLM providers, 5-tier memory, 60+ built-in tools, self-learning skills, code intelligence, voice pipeline, computer use, browser automation, A2A protocol, MCP & ESM plugin system, Parallax security, sandboxed code execution, multi-agent orchestration, UI overhaul with dark/light theme, data import from OpenClaw/Hermes, and workflow engine. All open source.",
  keywords: [
    "AI OS features",
    "Agent Operating System capabilities",
    "Agent OS capabilities",
    "AI agent framework features",
    "LLM orchestration tools",
    "multi-agent system",
    "vector memory AI",
    "MCP plugin system",
    "sandboxed code execution",
    "AI workflow engine",
    "open source AI tools",
    "autonomous agent capabilities",
    "model context protocol",
    "self-learning skills AI",
    "code intelligence graph",
    "voice pipeline AI",
    "computer use AI agent",
    "A2A protocol",
    "agentic operating system features",
  ],
  alternates: generateAlternates("/features"),
  openGraph: {
    title: "CortexPrism Features — Agent Operating System Capabilities | AI OS Features",
    description:
      "The open-source Agent Operating System: 24 LLM providers, 5-tier memory, 60+ tools, self-learning skills, code intelligence, voice pipeline, computer use, browser automation, A2A protocol, MCP & ESM plugins, Parallax security, sandboxed code execution, overhauled UI with dark/light theme, multi-agent orchestration.",
    url: "https://cortexprism.io/features",
  },
  twitter: {
    title: "CortexPrism Features — Agent Operating System Capabilities | AI OS Features",
    description:
      "The open-source Agent Operating System: 24 LLM providers, 5-tier memory, 60+ tools, self-learning skills, code intelligence, voice, computer use, browser automation, A2A protocol, sandboxed execution, multi-agent orchestration.",
  },
};

const features = [
  {
    icon: MessageSquare,
    title: "Interactive Chat",
    subtitle: "Multi-Provider LLM Support",
    description:
      "Chat with 24 LLM providers through a unified interface. Switch between OpenAI, Anthropic Claude, Google Gemini, Groq, and more without changing your workflow.",
    benefits: [
      "One interface for all major LLM providers",
      "Provider failover and fallback chains",
      "Streaming responses with real-time token display",
      "Conversation history with search and export",
    ],
    example: "cortex chat -m claude-sonnet-4-5",
  },
  {
    icon: Wrench,
    title: "Tool Use & Approval Gates",
    subtitle: "Controlled Agent Autonomy",
    description:
      "Agents can use tools and call functions, with configurable approval gates that let you review and approve or reject tool calls before they execute.",
    benefits: [
      "Built-in tool system for code execution, file I/O, web access",
      "Approval gates for sensitive operations",
      "Policy-based automatic approval rules",
      "Full audit log of all tool calls",
    ],
    example: "cortex chat -s sess_abc123",
  },
  {
    icon: Database,
    title: "5-Tier Memory System",
    subtitle: "Episodic to Skills",
    description:
      "A layered memory architecture with five tiers: episodic (turn summaries with auto-decay), semantic (injected facts with hybrid FTS5 + vector search), reflection (LLM-extracted behavior patterns), graph (knowledge graph entities and relationships), and skills (procedural knowledge from sessions).",
    benefits: [
      "Episodic: Turn summaries with configurable half-life and auto-decay scoring",
      "Semantic: Injected facts with hybrid FTS5 + cosine vector similarity search",
      "Reflection: LLM-extracted behavioral patterns with weekly consolidation",
      "Graph: Knowledge graph nodes and edges built from semantic entity extraction",
      "Skills: Procedural knowledge extracted from sessions with multi-step tool usage",
    ],
    example: 'cortex memory search "deployment config" --type semantic',
  },
  {
    icon: Shield,
    title: "Parallax Security Model",
    subtitle: "Defense in Depth",
    description:
      "A multi-layered security architecture with encrypted vault storage, granular policy engine, role-based access control, and approval workflows.",
    benefits: [
      "Encrypted vault for secrets and credentials",
      "Policy engine with allow/deny rules",
      "Approval workflows for sensitive actions",
      "Sandboxed plugin execution isolation",
    ],
    example: "cortex policy add code_exec -k tool -e allow -r trusted",
  },
  {
    icon: Code2,
    title: "Sandboxed Code Execution",
    subtitle: "Run Code Safely",
    description:
      "Execute Python, JavaScript, Wasm, and shell commands in isolated sandboxes. Perfect for data analysis, automation, and prototyping.",
    benefits: [
      "Python sandbox with pip package support",
      "WebAssembly runtime with WASI support",
      "Resource limits (CPU, memory, timeouts)",
      "Read-only mode for untrusted scripts",
    ],
    example: "cortex run analyze.py -l python --no-sandbox",
  },
  {
    icon: Route,
    title: "Model Router",
    subtitle: "Cascade & Threshold Strategies",
    description:
      "Two intelligent routing strategies wrapping LLM providers. Cascade tries cheapest providers first and escalates on low confidence. Threshold scores prompt complexity to route between strong and weak models.",
    benefits: [
      "Cascade router: cheapest model first, escalate on low confidence",
      "Threshold router: RouteLLM-style complexity scoring for prompt routing",
      "Cost optimization with confidence-based fallback between providers",
      "Graceful failover on provider outages",
    ],
    example: "cortex chat -m gpt-4o",
  },
  {
    icon: Clock,
    title: "Daemon Supervisor & Jobs",
    subtitle: "Background Processing",
    description:
      "Persistent daemon mode with a built-in job scheduler. Run agents in the background, schedule recurring tasks, and monitor execution.",
    benefits: [
      "Persistent background daemon process",
      "CRON-like job scheduling",
      "Job queue with priority levels",
      "Execution logs and monitoring",
    ],
    example: 'cortex daemon start && cortex jobs add weekly-report "generate-report" --cron "0 9 * * 1"',
  },
  {
    icon: Puzzle,
    title: "Plugin System",
    subtitle: "ESM, MCP & WASM",
    description:
      "Extend CortexPrism with a powerful plugin system supporting ESM modules, Model Context Protocol servers, and WebAssembly plugins with supply-chain verification.",
    benefits: [
      "Three plugin types: ESM, MCP, WASM",
      "Supply-chain verification (SHA-256, signatures, malware scanning)",
      "Plugin marketplace for discovery",
      "Version management with dependency resolution",
      "Isolated sandboxes with 3 trust levels",
    ],
    example: "cortex plugins install marketplace:cortexprism.io/plugins/python-executor",
  },
  {
    icon: Monitor,
    title: "Web UI & REST API",
    subtitle: "Full-Featured Interface",
    description:
      "Built-in web interface and comprehensive REST API for managing agents, monitoring sessions, and configuring the system remotely.",
    benefits: [
      "Responsive dark-theme web dashboard",
      "REST API with OpenAPI documentation",
      "WebSocket for real-time streaming",
      "Session management and monitoring",
    ],
    example: "cortex serve --port 8080",
  },
  {
    icon: Bot,
    title: "Agent Manager",
    subtitle: "10 Built-in + Custom Agents",
    description:
      "10 built-in specialized agents (Assistant, Developer, Researcher, Architect, Analyst, Writer, DevOps, Security, Code Reviewer, QA) plus custom agent profiles with different personalities, tools, and provider configurations.",
    benefits: [
      "10 pre-configured agent personalities",
      "13 typed sub-agents for delegation",
      "Agent-specific system prompts and souls",
      "AgentLint auditing with 33+ checks",
      "Per-agent tool and provider assignments",
    ],
    example: 'cortex agent create code-reviewer -m claude-sonnet-4-5 -d "Reviews pull requests" --tools file_read,web_search,shell',
  },
  {
    icon: Share2,
    title: "Micro-Services",
    subtitle: "Distributed Architecture",
    description:
      "Run CortexPrism as a distributed system with micro-service architecture. Scale components independently and deploy across multiple machines.",
    benefits: [
      "Distributed agent execution",
      "Message queue integration",
      "Service discovery and health checks",
      "Horizontal scaling of components",
    ],
    example: "cortex service create api-server -a code-reviewer -p 3001 --auto-start",
  },
  {
    icon: GitBranch,
    title: "Git Workspace",
    subtitle: "Agent-Powered Version Control",
    description:
      "Full git porcelain interface powered by the Cortex agent. Auto-generated commit messages, diff analysis, branch management, and PR-ready workflows.",
    benefits: [
      "Ten git subcommands: status, log, diff, add, commit, push, pull, clone, branch, remote",
      "Agent-generated conventional commit messages from diffs",
      "Diff analysis with natural language summaries",
      "Intelligent branch naming and conflict detection",
    ],
    example: "cortex git commit \"fix: resolve type error in auth module\"",
  },
  {
    icon: BrainCircuit,
    title: "Model Quartermaster",
    subtitle: "Adaptive Tool Prediction",
    description:
      "An adaptive 6-signal model-selection engine that observes LLM calls, learns patterns, and predicts the optimal model for each task. Powered by reinforcement learning.",
    benefits: [
      "Six prediction signals: trajectory, episodic, historical, cost, quality, reflection",
      "Automatic tool execution above 90% confidence for safe operations",
      "Reinforcement learning with EMA weight adjustment (alpha=0.15 reward, alpha=0.25 punishment)",
      "Dashboard with accuracy bars, signal weights, and top tools",
    ],
    example: "cortex qm dashboard -s sess_abc123",
  },
  {
    icon: Workflow,
    title: "Workflow Engine",
    subtitle: "DSL-Based Automation",
    description:
      "A DSL-based workflow engine for defining and executing multi-step agent tasks. Supports sequential steps, conditional branching, parallel execution, and human approval gates.",
    benefits: [
      "Five node types: step, branch, parallel, goto, wait",
      "Conditional branching with if/then/else logic",
      "Parallel execution via Promise.allSettled",
      "Human-in-the-loop approval gates with resume support",
    ],
    example: "cortex workflow run my-workflow",
  },
  {
    icon: Search,
    title: "Cortex Lens",
    subtitle: "Immutable Audit Log",
    description:
      "A comprehensive audit and telemetry event log that records every action in the system — LLM calls, tool execution, security decisions, memory operations, and quartermaster predictions.",
    benefits: [
      "50+ event types tracked with session, actor, and time indexing",
      "Immutable event log stored in dedicated lens.db SQLite database",
      "Web UI activity dashboard with timeline view",
      "REST API for programmatic audit log access",
    ],
    example: "cortex serve && open http://127.0.0.1:3000",
  },
  {
    icon: Sparkles,
    title: "Skills System",
    subtitle: "Self-Learning Procedural Knowledge",
    description:
      "Auto-extracts reusable procedural patterns from successful tool-call sequences and stores them as versioned, quality-scored skills with trust tiering and dependency tracking.",
    benefits: [
      "6-state lifecycle: candidate → verified → released → degraded → deprecated → archived",
      "Embedding-based retrieval with cosine similarity matching to user queries",
      "Automatic deduplication and merging of similar skills",
      "4-tier trust system controlling agent skill exposure",
    ],
    example: "cortex serve && open http://127.0.0.1:3000/skills",
  },
  {
    icon: GitGraph,
    title: "Code Intelligence",
    subtitle: "Multi-Language Code Graph",
    description:
      "Tree-sitter WASM parser for 14+ languages with call graph resolution, impact analysis, architecture extraction, and symbol search. Visualized via D3.js force-directed graph.",
    benefits: [
      "14+ languages: TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, C, C++, Ruby, PHP, Swift, Lua, Bash",
      "6-strategy call target resolution with cross-file import analysis",
      "12 node labels and 18 edge types in the graph database",
      "D3.js Web UI with symbol search, impact analysis, and path tracing",
    ],
    example: "cortex serve && open http://127.0.0.1:3000/codegraph",
  },
  {
    icon: Mic,
    title: "Voice Pipeline",
    subtitle: "Speech-to-Text & Text-to-Speech",
    description:
      "Full voice interaction pipeline with OpenAI Whisper STT, OpenAI TTS / ElevenLabs, energy-based VAD, and real-time audio streaming over WebSocket.",
    benefits: [
      "Speech-to-text via OpenAI Whisper with configurable models",
      "Text-to-speech with OpenAI TTS and ElevenLabs provider support",
      "Energy-based voice activity detection with adjustable threshold",
      "Real-time audio streaming over WebSocket for low-latency interaction",
    ],
    example: "cortex voice enable",
  },
  {
    icon: MonitorSmartphone,
    title: "Computer Use",
    subtitle: "GUI Automation via Virtual Displays",
    description:
      "GUI automation using X11 virtual framebuffer (Xvfb) with mouse control, keyboard input, and screenshot capture. Docker-isolated or native runtime.",
    benefits: [
      "Virtual display management with multi-display support",
      "Mouse: coordinate movement, left/right/middle clicks, double/triple clicks, drag",
      "Keyboard: text typing with configurable delays, key combos, key holding",
      "15 agent actions: screenshot, click, type, key, scroll, wait, mouse_move, drag",
    ],
    example: "cortex desktop screenshot",
  },
  {
    icon: Globe,
    title: "Browser Automation",
    subtitle: "Headless Web Interaction",
    description:
      "Headless Playwright-powered browser for web navigation, interaction, screenshots, and accessibility snapshots. Fully integrated with agent tools.",
    benefits: [
      "Navigate to URLs, click elements, type text, and submit forms",
      "Take full-page screenshots and accessibility snapshots",
      "Execute JavaScript on pages and wait for conditions",
      "All actions gated through policy validator with user approval",
    ],
    example: 'cortex chat -m claude-sonnet-4-5',
  },
  {
    icon: Network,
    title: "A2A Protocol Bridge",
    subtitle: "Cross-Framework Agent Collaboration",
    description:
      "Google Agent2Agent (A2A) v1.0 protocol for cross-framework agent collaboration. JSON-RPC 2.0 server/client with SSE streaming and tool wrapping.",
    benefits: [
      "Full A2A v1.0 compliance with JSON-RPC 2.0 transport",
      "Server mode: expose CortexPrism agents to other A2A-compatible frameworks",
      "Client mode: consume external A2A agents as CortexPrism tools",
      "SSE streaming for real-time agent-to-agent communication",
    ],
    example: "cortex serve && open http://127.0.0.1:3000/a2a",
  },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 md:py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#e2e2ea]">Agent Operating System Features</h1>
        <p className="mt-4 text-lg text-[#9090a8] max-w-4xl mx-auto">
          Everything you need to build, deploy, and manage AI agent applications — all in one open-source Agent Operating System.
        </p>
      </div>

      <div className="space-y-12">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="glass-card p-8 md:p-10 grid md:grid-cols-2 gap-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#e2e2ea]">{feature.title}</h2>
                  <p className="text-sm text-[#55556a]">{feature.subtitle}</p>
                </div>
              </div>
              <p className="text-[#9090a8] leading-relaxed mb-6">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-[#9090a8]">
                    <span className="text-indigo-400 mt-0.5">◆</span>
                    {benefit}
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
                  <span className="text-[#e2e2ea]"> {feature.example}</span>
                </code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
