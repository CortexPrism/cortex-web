import Link from "next/link";
import { LogoMark } from "@/components/shared/LogoMark";

const footerLinks = [
  {
    title: "Product",
    links: [
      { href: "/features",   label: "Features"   },
      { href: "/use-cases",  label: "Use Cases"  },
      { href: "/security",   label: "Security"   },
      { href: "/marketplace",label: "Marketplace"},
      { href: "/install",    label: "Install"    },
      { href: "/about",      label: "About"      },
    ],
  },
  {
    title: "Docs",
    links: [
      { href: "/getting-started",        label: "Getting Started" },
      { href: "/docs/cli",               label: "CLI Reference"   },
      { href: "/docs/architecture",      label: "Architecture"    },
      { href: "/docs/knowledge-base",    label: "Knowledge Base"  },
      { href: "/docs/developer-guide",   label: "Developer Guide" },
      { href: "/openapi",                label: "API Reference"   },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/changelog",  label: "Changelog"  },
      { href: "/contribute", label: "Contribute" },
      { href: "https://discord.gg/y7DkaEbPQC",          label: "Discord", external: true },
      { href: "https://github.com/CortexPrism/cortex",  label: "GitHub",  external: true },
      { href: "/marketplace/publish/plugin", label: "Publish Plugin" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.07)]" aria-label="Site footer">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <LogoMark size={20} />
              <span className="font-bold text-lg tracking-tight text-[#e2e2ea]">CortexPrism</span>
            </Link>
            <p className="text-sm text-[#55556a] leading-relaxed max-w-xs">
              Open-source AI agent harness with persistent memory, 60+ tools, a full web UI, and layered Parallax security. Self-hosted, powered by Deno. MIT licensed.
            </p>
            {/* Social row */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://github.com/CortexPrism/cortex"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-[rgba(255,255,255,0.07)] text-[#55556a] hover:text-[#e2e2ea] hover:border-[rgba(255,255,255,0.15)] transition-all"
                title="GitHub"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </a>
              <a
                href="https://discord.gg/y7DkaEbPQC"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-[rgba(255,255,255,0.07)] text-[#55556a] hover:text-[#e2e2ea] hover:border-[rgba(255,255,255,0.15)] transition-all"
                title="Discord"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9090a8] mb-4">
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#55556a] hover:text-indigo-400 transition-colors"
                      >
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-[#55556a] hover:text-indigo-400 transition-colors"
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

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#55556a]">
            &copy; {new Date().getFullYear()} CortexPrism. MIT License.
          </p>
          <p className="text-xs text-[#55556a]">
            Powered by Deno
          </p>
        </div>
      </div>
    </footer>
  );
}
