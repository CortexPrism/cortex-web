import Link from "next/link";

const footerLinks = [
  {
    title: "Docs",
    links: [
      { href: "/getting-started", label: "Getting Started" },
      { href: "/docs/cli", label: "CLI Reference" },
      { href: "/docs/architecture", label: "Architecture" },
      { href: "/docs/knowledge-base", label: "Knowledge Base" },
      { href: "/docs/design-docs", label: "Design Docs" },
    ],
  },
  {
    title: "Marketplace",
    links: [
      { href: "/marketplace", label: "Browse" },
      { href: "/marketplace/plugins", label: "Plugins" },
      { href: "/marketplace/agents", label: "Agents" },
      { href: "/marketplace/publish/plugin", label: "Publish Plugin" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/contribute", label: "Contribute" },
      { href: "/changelog", label: "Changelog" },
      { href: "/openapi", label: "API Docs" },
      {
        href: "https://github.com/CortexPrism/cortex",
        label: "GitHub",
        external: true,
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.07)] bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-bold">
                ✦
              </span>
              <span className="font-bold text-lg text-[#e2e2ea]">CortexPrism</span>
            </Link>
            <p className="text-sm text-[#55556a] max-w-xs">
              An open-source agentic harness system with multi-provider LLM support, 5-tier memory, and parallax security.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-[#e2e2ea] mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#9090a8] hover:text-indigo-400 transition-colors"
                      >
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-[#9090a8] hover:text-indigo-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.07)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#55556a]">
            &copy; {new Date().getFullYear()} CortexPrism. Released under the MIT License.
          </p>
          <div className="flex items-center gap-4 text-sm text-[#55556a]">
            <span>Powered by Deno</span>
            <span>·</span>
            <a
              href="https://github.com/CortexPrism/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
