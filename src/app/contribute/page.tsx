import type { Metadata } from "next";
import Link from "next/link";
import { Bug, BookOpen, Puzzle, MessageCircle, ExternalLink } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contribute to CortexPrism — Open Source AI Agent Framework",
  description:
    "Contribute to the open-source CortexPrism project. Report issues, submit pull requests, develop plugins, or join the community. MIT licensed and community-driven.",
  alternates: { canonical: `${SITE_URL}/contribute` },
  openGraph: {
    title: "Contribute to CortexPrism — Open Source AI Agent Framework",
    description:
      "Help build the future of agentic AI. Report bugs, submit PRs, develop plugins for the marketplace, or join the Discord community.",
    url: `${SITE_URL}/contribute`,
  },
  twitter: {
    title: "Contribute to CortexPrism — Open Source AI Agent Framework",
    description:
      "Help build the future of agentic AI. Report bugs, submit PRs, develop plugins, or join the community.",
  },
};

const sections = [
  {
    icon: Bug,
    title: "Report Issues",
    description: "Found a bug or have a feature request? Open an issue on GitHub with a clear description, reproduction steps, and expected behavior.",
    link: "https://github.com/CortexPrism/cortex/issues",
    label: "Open an Issue",
  },
  {
    icon: MessageCircle,
    title: "Join the Community",
    description: "Chat with developers and users on Discord. Get help, share ideas, discuss features, and stay up to date with the latest development.",
    link: "https://discord.gg/y7DkaEbPQC",
    label: "Join Discord",
  },
  {
    icon: BookOpen,
    title: "Submit Pull Requests",
    description: "Fork the repository, create a feature branch, make your changes, and submit a PR. Make sure to follow the coding conventions and add tests.",
    link: "https://github.com/CortexPrism/cortex/pulls",
    label: "View Pull Requests",
  },
  {
    icon: Puzzle,
    title: "Develop Plugins",
    description: "Build plugins for the CortexPrism marketplace. Plugins can be ESM modules, MCP servers, or WebAssembly modules.",
    link: "/marketplace/publish/plugin",
    label: "Publish a Plugin",
  },
];

export default function ContributePage() {
  return (
    <div className="max-w-page-narrow mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#e2e2ea]">Contribute</h1>
        <p className="mt-4 text-lg text-[#9090a8]">
          Help us build the future of agentic AI. Contributions of all kinds are welcome.
        </p>
      </div>

      <div className="glass-card p-8 mb-12">
        <p className="text-[#9090a8] leading-relaxed">
          CortexPrism is an open-source project released under the{" "}
          <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
            MIT License
          </a>
          . We welcome contributions from the community — whether it&apos;s fixing bugs, adding features,
          improving documentation, or developing plugins. Every contribution makes the project better for everyone.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {sections.map((section) => (
          <div key={section.title} className="glass-card-hover p-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 mb-4">
              <section.icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#e2e2ea] mb-2">{section.title}</h3>
            <p className="text-sm text-[#9090a8] mb-4 leading-relaxed">{section.description}</p>
            <a
              href={section.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {section.label}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>

      <div className="glass-card p-8">
        <h2 className="text-xl font-bold text-[#e2e2ea] mb-4">Development Setup</h2>
        <div className="space-y-4 text-sm text-[#9090a8]">
          <p>To set up a local development environment:</p>
          <div className="glass-card p-4">
            <pre className="text-sm font-mono">
              <code>
                <span className="text-[#55556a]"># Clone the repository</span>
                {"\n"}
                <span className="text-green-400">git clone</span>
                <span className="text-[#e2e2ea]"> https://github.com/CortexPrism/cortex.git</span>
                {"\n"}
                <span className="text-green-400">cd</span>
                <span className="text-[#e2e2ea]"> cortex</span>
                {"\n\n"}
                <span className="text-[#55556a]"># Install dependencies and initialize databases</span>
                {"\n"}
                <span className="text-green-400">deno run --allow-all</span>
                <span className="text-[#e2e2ea]"> src/db/migrate.ts</span>
                {"\n\n"}
                <span className="text-[#55556a]"># Run tests</span>
                {"\n"}
                <span className="text-green-400">deno task</span>
                <span className="text-[#e2e2ea]"> test</span>
              </code>
            </pre>
          </div>
          <p>
            For more details, check the{" "}
            <Link href="https://github.com/CortexPrism/cortex/blob/main/CONTRIBUTING.md" className="text-indigo-400 hover:text-indigo-300">
              Contributing Guide
            </Link>{" "}
            on GitHub.
          </p>
        </div>
      </div>
    </div>
  );
}
