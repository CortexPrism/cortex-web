import type { Metadata } from "next";
import { Shield, Lock, Eye, FileSearch, Server, Wrench, FileCode } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CortexPrism Security — Enterprise-Grade AI Agent Security Architecture",
  description:
    "CortexPrism's Parallax security model provides defense-in-depth for AI agents: 3-stage tool validation, AES-256-GCM encrypted credential vault, granular policy engine, Docker-sandboxed code execution, and full immutable audit logging.",
  keywords: [
    "AI agent security",
    "enterprise AI security",
    "secure AI agent runtime",
    "AES-256 credential vault",
    "AI tool validation",
    "sandboxed AI execution",
    "AI audit logging",
    "defense-in-depth AI",
    "AI policy engine",
    "secure LLM deployment",
  ],
  alternates: { canonical: `${SITE_URL}/security` },
  openGraph: {
    title: "CortexPrism Security — Enterprise-Grade AI Agent Security Architecture",
    description:
      "Defense-in-depth for AI agents: 3-stage tool validation, AES-256-GCM encrypted vault, policy engine, Docker-isolated sandboxes, and immutable audit trail via Cortex Lens.",
    url: `${SITE_URL}/security`,
  },
};

const layers = [
  {
    icon: Lock,
    title: "Encrypted Credential Vault",
    description:
      "All sensitive credentials are encrypted using AES-256-GCM with PBKDF2 key derivation (100,000 iterations, SHA-256). The passphrase is never stored — only held in the environment variable at runtime.",
    details: [
      "AES-256-GCM encryption for all stored secrets",
      "PBKDF2 key derivation with 100,000 iterations",
      "12-byte random IV per encryption operation",
      "Passphrase held only in environment variable (CORTEX_VAULT_KEY)",
      "Full access audit log (vault_access_log)",
    ],
  },
  {
    icon: Shield,
    title: "Parallax 3-Stage Validation",
    description:
      "Every tool call passes through a 3-stage validation gate before execution. Any stage can deny the operation, preventing unauthorized or dangerous actions.",
    details: [
      "Stage 1: Tool name policy check — is this tool allowed?",
      "Stage 2: Shell command pattern check — regex deny rules for dangerous commands",
      "Stage 3: Domain allow/deny — for web search URLs",
      "All decisions logged as policy_check events in Lens",
      "Seeded deny rules for dangerous patterns (rm -rf /, fork bombs, disk writes)",
      "Default-allow when no rules match — add explicit deny rules for sensitive operations",
    ],
  },
  {
    icon: FileSearch,
    title: "Policy Engine",
    description:
      "Granular allow/deny rules with priority-based evaluation. Rules are stored in SQLite and evaluated by priority (lower number = higher precedence).",
    details: [
      "Six rule kinds: tool, shell, domain, capability, path, computer",
      "Regex-based pattern matching",
      "Priority ordering for rule precedence",
      "Default-allow when no rules match",
      "Pre-seeded deny rules for dangerous shell patterns",
    ],
  },
  {
    icon: FileCode,
    title: "CPL (Capability Level)",
    description:
      "YAML-based policy files defining capability boundaries for the agent. Rules can be managed via the CLI or auto-loaded from a policy file. Each rule specifies kind, effect, pattern, and priority.",
    details: [
      "YAML policy files with versioned schema",
      "Rules evaluated by priority order (ASC) — first match wins",
      "Supports shell, tool, and domain rule kinds",
      "Allow or deny effects with descriptive reasons",
      "Auto-loaded from ~/.cortex/policy.yml if present",
    ],
  },
  {
    icon: Server,
    title: "Sandboxed Code Execution",
    description:
      "Code execution happens in isolated Docker containers with strict resource limits and no network access. Subprocess fallback available when Docker is not present.",
    details: [
      "Docker containers with --network=none (no external access)",
      "256MB memory limit, 0.5 CPU cores",
      "64 PID limit and no-new-privileges security flag",
      "30-second execution timeout",
      "64KB output cap to prevent log flooding",
      "Ephemeral containers — no data persists",
    ],
  },
  {
    icon: Eye,
    title: "Cortex Lens Audit Trail",
    description:
      "Every security-relevant event is logged to the Cortex Lens database, providing a complete audit trail for all system activity.",
    details: [
      "All LLM calls logged (provider, model, tokens, cost)",
      "All tool calls logged (tool name, arguments, timestamp)",
      "All policy checks logged (allowed/denied with reason)",
      "All vault access logged (credential name, access time)",
      "Session lifecycle events (create, resume, close)",
    ],
  },
  {
    icon: Wrench,
    title: "Approval Gates",
    description:
      "Sensitive operations can require explicit user approval before execution. The shell and code_exec tools have configurable approval gates that can be toggled per session or policy.",
    details: [
      "Shell command execution can require approval (configurable)",
      "Code execution in sandbox can require approval (configurable)",
      "Configurable approval timeout",
      "Policy-based automatic approval for trusted patterns",
      "Full audit of all approved and rejected operations",
    ],
  },
];

export default function SecurityPage() {
  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 md:py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm rounded-full bg-red-500/10 border border-red-500/20 text-red-300">
          <Shield className="w-4 h-4" />
          Parallax Security Model
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#e2e2ea]">
          Security <span className="gradient-text">Architecture</span>
        </h1>
        <p className="mt-4 text-lg text-[#9090a8] max-w-4xl mx-auto">
          Defense in depth through multiple independent security layers. Every operation is validated, logged, and controlled.
        </p>
      </div>

      <div className="glass-card p-8 md:p-10 mb-12">
        <h2 className="text-xl font-bold text-[#e2e2ea] mb-4">Three-Stage Validation Flow</h2>
        <div className="glass-card p-4 mb-4">
          <pre className="text-sm font-mono leading-relaxed">
            <code>
              <span className="text-[#55556a]">Agent emits &lt;tool_call&gt;</span>
              {"\n"}
              <span className="text-[#e2e2ea]">  → 1. checkPolicy(&apos;tool&apos;, toolName)</span>
              {"\n"}
              <span className="text-[#9090a8]">       — is this tool allowed?</span>
              {"\n"}
              <span className="text-[#e2e2ea]">  → 2. checkPolicy(&apos;shell&apos;, command)</span>
              {"\n"}
              <span className="text-[#9090a8]">       — is the shell command safe? (regex deny)</span>
              {"\n"}
              <span className="text-[#e2e2ea]">  → 3. checkPolicy(&apos;domain&apos;, hostname)</span>
              {"\n"}
              <span className="text-[#9090a8]">       — is the domain allowed? (web_search only)</span>
              {"\n"}
              <span className="text-red-400">  → DENY → error returned to agent (no execution)</span>
              {"\n"}
              <span className="text-green-400">  → ALLOW → tool.execute() runs</span>
              {"\n"}
              <span className="text-[#55556a]">  → Lens: policy_check + tool_call events logged</span>
            </code>
          </pre>
        </div>
      </div>

      <div className="space-y-8 mb-12">
        {layers.map((layer) => (
          <div key={layer.title} className="glass-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                <layer.icon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#e2e2ea]">{layer.title}</h2>
            </div>
            <p className="text-[#9090a8] leading-relaxed mb-4">{layer.description}</p>
            <ul className="space-y-1.5">
              {layer.details.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-[#9090a8]">
                  <span className="text-red-400 mt-0.5">◆</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="glass-card p-8">
        <h2 className="text-xl font-bold text-[#e2e2ea] mb-4">Default Deny Rules</h2>
        <p className="text-[#9090a8] mb-4">
          The following dangerous patterns are blocked by default on first migration:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                <th className="text-left py-2 text-[#e2e2ea] font-medium">Pattern</th>
                <th className="text-left py-2 text-[#e2e2ea] font-medium">Blocks</th>
              </tr>
            </thead>
            <tbody>
              {[
                { pattern: "rm\\s+-rf\\s+/", blocks: "Recursive root filesystem delete" },
                { pattern: ":\(\\)\\{.*\\}", blocks: "Shell fork bomb attacks" },
                { pattern: "dd\\s+if=.*of=/dev/", blocks: "Direct block device writes" },
                { pattern: "chmod\\s+777\\s+/", blocks: "World-writable root permissions" },
              ].map((row) => (
                <tr key={row.pattern} className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="py-2">
                    <code className="text-sm text-green-400">{row.pattern}</code>
                  </td>
                  <td className="py-2 text-[#9090a8]">{row.blocks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
