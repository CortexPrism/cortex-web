"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, SearchX } from "lucide-react";

interface SidebarSection {
  title: string;
  links: { href: string; label: string }[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: "Getting Started",
    links: [
      { href: "/getting-started", label: "Overview" },
      { href: "/getting-started/installation", label: "Installation" },
      { href: "/getting-started/first-run", label: "First Run" },
      { href: "/getting-started/configuration", label: "Configuration" },
    ],
  },
  {
    title: "CLI Reference",
    links: [
      { href: "/docs/cli", label: "Overview" },
      { href: "/docs/cli/chat", label: "chat" },
      { href: "/docs/cli/serve", label: "serve" },
      { href: "/docs/cli/daemon", label: "daemon" },
      { href: "/docs/cli/run", label: "run" },
      { href: "/docs/cli/memory", label: "memory" },
      { href: "/docs/cli/reflect", label: "reflect" },
      { href: "/docs/cli/vault", label: "vault" },
      { href: "/docs/cli/policy", label: "policy" },
      { href: "/docs/cli/jobs", label: "jobs" },
      { href: "/docs/cli/sessions", label: "sessions" },
      { href: "/docs/cli/setup", label: "setup" },
    ],
  },
  {
    title: "Architecture",
    links: [
      { href: "/docs/architecture", label: "Overview" },
      { href: "/docs/architecture/agent-loop", label: "Agent Loop" },
      { href: "/docs/architecture/memory-system", label: "Memory System" },
      { href: "/docs/architecture/security-parallax", label: "Security Parallax" },
      { href: "/docs/architecture/model-router", label: "Model Router" },
      { href: "/docs/architecture/daemon-supervisor", label: "Daemon Supervisor" },
      { href: "/docs/architecture/plugin-system", label: "Plugin System" },
      { href: "/docs/architecture/databases", label: "Databases" },
    ],
  },
  {
    title: "Knowledge Base",
    links: [
      { href: "/docs/knowledge-base", label: "Overview" },
      { href: "/docs/knowledge-base/faq", label: "FAQ" },
      { href: "/docs/knowledge-base/troubleshooting", label: "Troubleshooting" },
      { href: "/docs/knowledge-base/best-practices", label: "Best Practices" },
      { href: "/docs/knowledge-base/provider-guide", label: "Provider Guide" },
      { href: "/docs/knowledge-base/sandbox-guide", label: "Sandbox Guide" },
      { href: "/docs/knowledge-base/migration-guide", label: "Migration Guide" },
      { href: "/docs/knowledge-base/security-guidelines", label: "Security" },
      { href: "/docs/knowledge-base/performance-tuning", label: "Performance" },
    ],
  },
  {
    title: "Developer Guide",
    links: [
      { href: "/docs/developer-guide", label: "Overview" },
      { href: "/docs/developer-guide/getting-started", label: "Getting Started" },
      { href: "/docs/developer-guide/plugin-types", label: "Plugin Types" },
      { href: "/docs/developer-guide/esm-plugin", label: "ESM Plugins" },
      { href: "/docs/developer-guide/mcp-plugin", label: "MCP Plugins" },
      { href: "/docs/developer-guide/wasm-plugin", label: "WASM Plugins" },
      { href: "/docs/developer-guide/plugin-api", label: "Plugin API" },
      { href: "/docs/developer-guide/agent-development", label: "Agents" },
      { href: "/docs/developer-guide/publishing", label: "Publishing" },
      { href: "/docs/developer-guide/best-practices", label: "Best Practices" },
    ],
  },
  {
    title: "Design Docs",
    links: [{ href: "/docs/design-docs", label: "Index" }],
  },
];

const allLinks = sidebarSections.flatMap((s) => s.links);

function CollapsibleSection({
  section,
  pathname,
  defaultOpen,
}: {
  section: SidebarSection;
  pathname: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isActive = section.links.some((l) => pathname === l.href);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider mb-1 px-3 py-1.5 rounded-lg transition-colors",
          isActive ? "text-indigo-400" : "text-[#55556a] hover:text-[#9090a8]"
        )}
      >
        {section.title}
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>
      <ul
        className={cn(
          "space-y-0.5 overflow-hidden transition-all duration-200",
          open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-50"
        )}
      >
        {section.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "block px-3 py-1.5 text-sm rounded-lg transition-colors",
                pathname === link.href
                  ? "text-indigo-400 bg-indigo-500/10 font-medium"
                  : "text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118]"
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  if (!pathname.startsWith("/getting-started") && !pathname.startsWith("/docs")) {
    return null;
  }

  const filteredLinks = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return allLinks.filter(
      (l) => l.label.toLowerCase().includes(q) || l.href.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 overflow-y-auto max-h-[calc(100vh-5rem)] pr-4">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#55556a] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search docs..."
            className="w-full pl-8 pr-7 py-1.5 text-sm bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-[#9090a8] focus:outline-none focus:border-indigo-500/50 placeholder-[#55556a]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#55556a] hover:text-[#9090a8]"
            >
              <SearchX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {filteredLinks ? (
          <nav className="space-y-0.5">
            {filteredLinks.length === 0 ? (
              <p className="text-xs text-[#55556a] text-center py-4">No results found</p>
            ) : (
              filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block px-3 py-1.5 text-sm rounded-lg transition-colors",
                    pathname === link.href
                      ? "text-indigo-400 bg-indigo-500/10 font-medium"
                      : "text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118]"
                  )}
                >
                  {link.label}
                </Link>
              ))
            )}
          </nav>
        ) : (
          <nav className="space-y-3">
            {sidebarSections.map((section) => (
              <CollapsibleSection
                key={section.title}
                section={section}
                pathname={pathname}
                defaultOpen={section.links.some((l) => pathname === l.href)}
              />
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
}
