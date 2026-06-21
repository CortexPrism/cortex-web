import type { Metadata } from "next";
import { Terminal, Cpu, Package } from "lucide-react";
import { SITE_URL, generateHowToSchema } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Install CortexPrism — Self-Host Your AI OS in One Command",
  description:
    "Install the CortexPrism open-source AI OS — an Agent Operating System on Linux, macOS, or Windows with a single command. Includes Deno setup, database initialization, and Docker support. Free, self-hosted, no cloud dependency.",
  keywords: [
    "install AI OS",
    "install AI agent operating system",
    "self-hosted AI OS",
    "self-hosted AI setup",
    "open source AI install guide",
    "how to install CortexPrism",
    "self-host LLM agent",
    "AI framework installation",
    "Docker AI agent",
    "Deno AI operating system setup",
    "local AI agent install",
    "Agent OS install",
  ],
  alternates: { canonical: `${SITE_URL}/install` },
  openGraph: {
    title: "Install CortexPrism — Self-Host Your AI OS in One Command",
    description:
      "One command to install the open-source AI OS on Linux, macOS, or Windows. curl -fsSL https://cortexprism.io/install.sh | bash — fully self-hosted, no cloud required.",
    url: `${SITE_URL}/install`,
  },
  twitter: {
    title: "Install CortexPrism — Self-Host Your AI OS in One Command",
    description:
      "One command to install the open-source AI OS on Linux, macOS, or Windows. Fully self-hosted, no cloud required.",
  },
};

const howToSchema = generateHowToSchema({
  name: "How to Install the CortexPrism AI OS (Agent Operating System)",
  description:
    "Install the CortexPrism AI OS — an open-source Agent Operating System — on Linux, macOS, or Windows with a single command.",
  url: `${SITE_URL}/install`,
  totalTime: "PT5M",
  steps: [
    {
      name: "Run the one-command installer",
      text: "On macOS or Linux, run: curl -fsSL https://cortexprism.io/install.sh | bash. On Windows PowerShell, run: iwr https://cortexprism.io/install.ps1 -useb | iex",
    },
    {
      name: "Run initial setup",
      text: "After installation, run 'cortex setup' to configure your LLM provider API keys and initialize the databases.",
    },
    {
      name: "Start chatting with your AI agent",
      text: "Run 'cortex agent chat' to start an interactive session with your preferred LLM provider, or 'cortex server start' to launch the web UI and REST API.",
    },
  ],
});

export default function InstallPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 md:py-20">
      <StructuredData data={howToSchema} />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#e2e2ea]">
          Install <span className="gradient-text">CortexPrism</span>
        </h1>
        <p className="mt-4 text-lg text-[#9090a8]">
          One command to get started on Linux, macOS, or Windows.
        </p>
      </div>

      <h2 className="text-xl font-bold text-[#e2e2ea] mb-4">Quick Install</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-[#e2e2ea] mb-3">
            macOS
          </h3>
          <div className="glass-card p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              <code>
                <span className="text-[#55556a]">$ </span>
                <span className="text-green-400">curl -fsSL https://cortexprism.io/install.sh</span>
                <span className="text-[#e2e2ea]"> | bash</span>
              </code>
            </pre>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-[#e2e2ea] mb-3">
            Linux / WSL
          </h3>
          <div className="glass-card p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              <code>
                <span className="text-[#55556a]">$ </span>
                <span className="text-green-400">curl -fsSL https://cortexprism.io/install.sh</span>
                <span className="text-[#e2e2ea]"> | bash</span>
              </code>
            </pre>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-[#e2e2ea] mb-3">
            Windows (PowerShell)
          </h3>
          <div className="glass-card p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              <code>
                <span className="text-[#55556a]">PS&gt; </span>
                <span className="text-green-400">iwr https://cortexprism.io/install.ps1</span>
                <span className="text-[#e2e2ea]"> -useb | iex</span>
              </code>
            </pre>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 text-green-400 mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#e2e2ea] mb-2">Prerequisites</h3>
          <ul className="text-sm text-[#9090a8] space-y-1">
            <li className="flex items-start gap-2"><span className="text-green-400">◆</span>Linux, macOS, or Windows</li>
            <li className="flex items-start gap-2"><span className="text-green-400">◆</span>Deno 2.x (installer handles this)</li>
            <li className="flex items-start gap-2"><span className="text-green-400">◆</span>Git (for source mode)</li>
            <li className="flex items-start gap-2"><span className="text-green-400">◆</span>Docker (optional, for sandboxes)</li>
          </ul>
        </div>

        <div className="glass-card p-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 mb-4">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#e2e2ea] mb-2">What it does</h3>
          <ul className="text-sm text-[#9090a8] space-y-1">
            <li className="flex items-start gap-2"><span className="text-indigo-400">◆</span>Installs Deno runtime</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400">◆</span>Clones the CortexPrism repo</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400">◆</span>Initializes databases</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400">◆</span>Configures the system</li>
          </ul>
        </div>

        <div className="glass-card p-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 mb-4">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#e2e2ea] mb-2">After install</h3>
          <ul className="text-sm text-[#9090a8] space-y-1">
            <li className="flex items-start gap-2"><span className="text-purple-400">◆</span>Run <code className="text-xs">cortex setup</code></li>
            <li className="flex items-start gap-2"><span className="text-purple-400">◆</span>Run <code className="text-xs">cortex agent chat</code></li>
            <li className="flex items-start gap-2"><span className="text-purple-400">◆</span>Run <code className="text-xs">cortex server start</code></li>
            <li className="flex items-start gap-2"><span className="text-purple-400">◆</span>Visit docs for more</li>
          </ul>
        </div>
      </div>

      <div className="glass-card p-8 mb-10">
        <h2 className="text-xl font-bold text-[#e2e2ea] mb-4">Manual Installation</h2>
        <p className="text-sm text-[#9090a8] mb-4">
          Clone the repo directly and run with Deno:
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-[#e2e2ea] mb-2">macOS / Linux</h3>
            <pre className="text-sm font-mono">
              <code>
                <span className="text-[#55556a]"># Clone and setup</span>
                {"\n"}
                <span className="text-green-400">git clone</span>
                <span className="text-[#e2e2ea]"> https://github.com/CortexPrism/cortex.git ~/.cortex</span>
                {"\n"}
                <span className="text-green-400">cd</span>
                <span className="text-[#e2e2ea]"> ~/.cortex</span>
                {"\n"}
                <span className="text-green-400">deno run --allow-all</span>
                <span className="text-[#e2e2ea]"> src/db/migrate.ts</span>
                {"\n"}
                <span className="text-green-400">deno run --allow-all</span>
                <span className="text-[#e2e2ea]"> src/main.ts setup</span>
                {"\n\n"}
                <span className="text-[#55556a]"># Add alias to shell profile</span>
                {"\n"}
                <span className="text-green-400">echo &apos;alias cortex=&quot;deno run --allow-all ~/.cortex/src/main.ts&quot;&apos;</span>
                <span className="text-[#e2e2ea]"> &gt;&gt; ~/.bashrc</span>
              </code>
            </pre>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-[#e2e2ea] mb-2">Windows (PowerShell)</h3>
            <pre className="text-sm font-mono">
              <code>
                <span className="text-[#55556a]"># Clone and setup</span>
                {"\n"}
                <span className="text-green-400">git clone</span>
                <span className="text-[#e2e2ea]"> https://github.com/CortexPrism/cortex.git $env:USERPROFILE\.cortex</span>
                {"\n"}
                <span className="text-green-400">cd</span>
                <span className="text-[#e2e2ea]"> $env:USERPROFILE\.cortex</span>
                {"\n"}
                <span className="text-green-400">deno run --allow-all</span>
                <span className="text-[#e2e2ea]"> src/db/migrate.ts</span>
                {"\n"}
                <span className="text-green-400">deno run --allow-all</span>
                <span className="text-[#e2e2ea]"> src/main.ts setup</span>
              </code>
            </pre>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 mb-10">
        <h2 className="text-xl font-bold text-[#e2e2ea] mb-4">Pre-compiled Binary</h2>
        <p className="text-sm text-[#9090a8] mb-4">
          Download the latest binary from the GitHub Releases page. All binaries include SHA-256 checksums and optional GPG signatures.
        </p>
        <div className="glass-card p-4">
          <pre className="text-sm font-mono">
            <code>
              <span className="text-[#55556a]"># Download from releases</span>
              {"\n"}
              <span className="text-green-400">curl -LO</span>
              <span className="text-[#e2e2ea]"> https://github.com/CortexPrism/cortex/releases/latest/download/cortex-linux-x64</span>
              {"\n"}
              <span className="text-green-400">chmod +x</span>
              <span className="text-[#e2e2ea]"> cortex-linux-x64</span>
              {"\n\n"}
              <span className="text-[#55556a]"># Verify checksum</span>
              {"\n"}
              <span className="text-green-400">sha256sum -c</span>
              <span className="text-[#e2e2ea]"> cortex-linux-x64.sha256</span>
              {"\n\n"}
              <span className="text-[#55556a]"># Run setup and start</span>
              {"\n"}
              <span className="text-green-400">./cortex-linux-x64</span>
              <span className="text-[#e2e2ea]"> setup</span>
              {"\n"}
              <span className="text-green-400">./cortex-linux-x64</span>
              <span className="text-[#e2e2ea]"> chat</span>
            </code>
          </pre>
        </div>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-xl font-bold text-[#e2e2ea] mb-4">Post-Install</h2>
        <p className="text-sm text-[#9090a8] mb-4">
          After installing, run these commands to get started:
        </p>
        <div className="glass-card p-4">
          <pre className="text-sm font-mono">
            <code>
              <span className="text-green-400">cortex setup</span>
              <span className="text-[#9090a8]">        # Interactive setup wizard — choose provider, enter API key</span>
              {"\n"}
              <span className="text-green-400">cortex agent chat</span>
              <span className="text-[#9090a8]">  # Start your first chat session</span>
              {"\n"}
              <span className="text-green-400">cortex server start</span>
              <span className="text-[#9090a8]">  # Open the Web UI at http://127.0.0.1:3000</span>
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
