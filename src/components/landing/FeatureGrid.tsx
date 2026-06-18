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
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Interactive Chat",
    description: "Chat with 24 LLM providers including OpenAI, Anthropic, Google, Groq, and more.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    glow: "rgba(96,165,250,0.15)",
  },
  {
    icon: Wrench,
    title: "Tool Use & Approval",
    description: "Agents can use tools with configurable approval gates for safety.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    glow: "rgba(52,211,153,0.15)",
  },
  {
    icon: Database,
    title: "5-Tier Memory",
    description: "Episodic, semantic, reflection, graph, and skills tiers with hybrid FTS5 + vector retrieval.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    glow: "rgba(167,139,250,0.15)",
  },
  {
    icon: Shield,
    title: "Parallax Security",
    description: "Defense-in-depth with vault, policy engine, and approval workflows.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    glow: "rgba(248,113,113,0.15)",
  },
  {
    icon: Code2,
    title: "Code Sandbox",
    description: "Secure code execution in sandboxed environments (Python, WASM, more).",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    glow: "rgba(251,191,36,0.15)",
  },
  {
    icon: Route,
    title: "Model Router",
    description: "Cascade and threshold model routing for intelligent provider selection and failover.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    glow: "rgba(99,102,241,0.18)",
  },
  {
    icon: Clock,
    title: "Daemon & Jobs",
    description: "Persistent daemon mode with scheduled jobs and background processing.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    glow: "rgba(34,211,238,0.15)",
  },
  {
    icon: Puzzle,
    title: "Plugin System",
    description: "Extensible ESM/MCP/WASM plugin architecture with marketplace.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    glow: "rgba(244,114,182,0.15)",
  },
  {
    icon: GitBranch,
    title: "Git Workspace",
    description: "Full git porcelain with agent-powered commits, diffs, and branch management.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    glow: "rgba(251,146,60,0.15)",
  },
  {
    icon: BrainCircuit,
    title: "Model Quartermaster",
    description: "Adaptive 6-signal model selection engine with reinforcement learning.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    glow: "rgba(167,139,250,0.15)",
  },
  {
    icon: Workflow,
    title: "Workflow Engine",
    description: "DSL-based workflows with steps, branching, parallel execution, and approval gates.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    glow: "rgba(45,212,191,0.15)",
  },
  {
    icon: Search,
    title: "Cortex Lens Audit",
    description: "Immutable event log tracking every LLM call, tool execution, and policy decision.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    glow: "rgba(56,189,248,0.15)",
  },
];

export function FeatureGrid() {
  return (
    <section className="py-24" aria-label="Features">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
            Capabilities
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#e2e2ea]">
            Everything you need to build{" "}
            <span className="gradient-text">agentic applications</span>
          </h2>
          <p className="mt-4 text-lg text-[#9090a8] max-w-2xl mx-auto">
            A comprehensive toolset for building, deploying, and managing AI agents at any scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card group relative bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-xl p-6 cursor-default transition-all duration-200 hover:border-[rgba(255,255,255,0.14)] hover:bg-[#14141c]"
            >
              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${feature.bg} mb-4 transition-transform duration-200 group-hover:scale-110`}
              >
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>

              <h3 className="text-sm font-semibold text-[#e2e2ea] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#9090a8] leading-relaxed">{feature.description}</p>

              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${feature.glow} 0%, transparent 65%)`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
