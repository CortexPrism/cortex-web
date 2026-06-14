"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, LogIn, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/features", label: "Features" },
  {
    label: "Docs",
    children: [
      { href: "/getting-started", label: "Getting Started" },
      { href: "/getting-started/installation", label: "Installation" },
      { href: "/docs/cli", label: "CLI Reference" },
      { href: "/docs/architecture", label: "Architecture" },
      { href: "/docs/knowledge-base", label: "Knowledge Base" },
    ],
  },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/changelog", label: "Changelog" },
  { href: "/contribute", label: "Contribute" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", { headers: { authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => { if (!d.error) setUser(d.user); }).catch(() => {});
    }
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.07)] bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-bold">
              ✦
            </span>
            <span className="font-bold text-xl text-[#e2e2ea]">CortexPrism</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 text-sm text-[#9090a8] hover:text-[#e2e2ea] transition-colors rounded-lg hover:bg-[#111118]">
                    {link.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {openDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-48 glass-card p-1 shadow-xl">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-lg transition-colors",
                            pathname === child.href
                              ? "text-indigo-400 bg-indigo-500/10"
                              : "text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#18181f]"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg transition-colors",
                    pathname === link.href
                      ? "text-indigo-400 bg-indigo-500/10"
                      : "text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118]"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
            {user ? (
              <Link
                href="/dashboard"
                className="ml-3 flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#111118] text-[#e2e2ea] border border-[rgba(255,255,255,0.07)] hover:bg-[#18181f] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                {user.username}
              </Link>
            ) : (
              <Link
                href="/login"
                className="ml-3 flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#111118] text-[#e2e2ea] border border-[rgba(255,255,255,0.07)] hover:bg-[#18181f] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
            <a
              href="https://github.com/CortexPrism/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-4 py-2 text-sm font-medium rounded-lg accent-gradient text-white hover:opacity-90 transition-opacity"
            >
              GitHub
            </a>
          </div>

          <button
            className="md:hidden p-2 text-[#9090a8] hover:text-[#e2e2ea]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(255,255,255,0.07)] bg-[#0a0a0f]">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <div className="px-3 py-2 text-sm text-[#55556a] font-medium">{link.label}</div>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "block pl-6 pr-3 py-2 text-sm rounded-lg transition-colors",
                        pathname === child.href
                          ? "text-indigo-400 bg-indigo-500/10"
                          : "text-[#9090a8] hover:text-[#e2e2ea]"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={cn(
                    "block px-3 py-2 text-sm rounded-lg transition-colors",
                    pathname === link.href
                      ? "text-indigo-400 bg-indigo-500/10"
                      : "text-[#9090a8] hover:text-[#e2e2ea]"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            {user ? (
              <Link href="/dashboard" className="block px-3 py-2 text-sm text-[#e2e2ea]" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="block px-3 py-2 text-sm text-[#e2e2ea]" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            )}
            <a
              href="https://github.com/CortexPrism/cortex"
              target="_blank"
              className="block px-3 py-2 text-sm text-indigo-400 font-medium"
            >
              GitHub →
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
