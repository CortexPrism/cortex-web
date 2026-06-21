"use client";

import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/routing";
import {
  Menu, X, ChevronDown, LogIn, LogOut,
  LayoutDashboard, User, Github,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { NavLogo } from "@/components/shared/NavLogo";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function Navbar() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { user, loading, logout } = useAuth();

  const navLinks = [
    {
      label: t("docs"),
      children: [
        { href: "/getting-started",            label: t("gettingStarted"),  desc: t("gettingStartedDesc") },
        { href: "/docs/cli",                   label: t("cliReference"),    desc: t("cliReferenceDesc") },
        { href: "/docs/architecture",          label: t("architecture"),    desc: t("architectureDesc") },
        { href: "/docs/developer-guide",       label: t("developerGuide"),  desc: t("developerGuideDesc") },
        { href: "/features",                   label: t("allFeatures"),     desc: t("allFeaturesDesc") },
      ],
    },
    { href: "/blog",         label: t("blog")         },
    { href: "/marketplace", label: t("marketplace") },
    { href: "/changelog",   label: t("changelog")   },
  ];

  const handleDropdownEnter = useCallback((label: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenDropdown(label);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.07)] bg-[#0a0a0f]/85 backdrop-blur-xl" aria-label={tc("ariaMainNav")}>
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label={tc("ariaHome")}>
            <NavLogo />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(link.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors",
                      openDropdown === link.label
                        ? "text-[#e2e2ea] bg-[#111118]"
                        : "text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118]"
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 transition-transform duration-150",
                        openDropdown === link.label && "rotate-180"
                      )}
                    />
                  </button>

                  {openDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1.5 w-64 glass-card p-1.5 shadow-2xl shadow-black/40">
                      {link.children.map((child) => {
                        const childHref = child.href;
                        const isActive = pathname === childHref || pathname.startsWith(childHref + "/");
                        return (
                          <Link
                            key={child.href}
                            href={childHref}
                            className={cn(
                              "flex flex-col px-3 py-2.5 rounded-lg transition-colors",
                              isActive
                                ? "bg-indigo-500/10"
                                : "hover:bg-[#18181f]"
                            )}
                          >
                            <span
                              className={cn(
                                "text-sm font-medium",
                                isActive ? "text-indigo-400" : "text-[#e2e2ea]"
                              )}
                            >
                              {child.label}
                            </span>
                            <span className="text-xs text-[#55556a] mt-0.5">{child.desc}</span>
                          </Link>
                        );
                      })}
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
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            {user && <NotificationBell />}
            {/* Reddit icon */}
            <a
              href="https://reddit.com/r/CortexPrism"
              target="_blank"
              rel="noopener noreferrer"
              title="Reddit"
              className="p-2 rounded-lg text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm5.834 7.047a1.375 1.375 0 0 1 .455 2.679 4.9 4.9 0 0 1 .04.55c0 2.675-2.99 4.847-6.676 4.847-3.687 0-6.676-2.172-6.676-4.847 0-.184.016-.365.04-.54a1.375 1.375 0 1 1 1.372-1.313c.39 0 .74.163.997.426 1.375-.932 3.24-1.52 5.342-1.593l1.036-3.195 2.386.505a1.362 1.362 0 1 1-.18.543l-1.71-.362-.748 2.29c1.98.086 3.74.658 5.06 1.527a1.37 1.37 0 0 1 .964-.396zM9.27 15.413c-.217-1.02 1.347-1.854 2.73-1.854 1.383 0 2.946.834 2.73 1.854-.067.31-.415.51-.825.51h-3.81c-.41 0-.758-.2-.825-.51zm-1.14-2.847a1.06 1.06 0 1 1 0-2.122 1.06 1.06 0 0 1 0 2.122zm7.74 0a1.06 1.06 0 1 1 0-2.122 1.06 1.06 0 0 1 0 2.122z"/>
              </svg>
            </a>

            {/* Discord icon */}
            <a
              href="https://discord.gg/wYxbmQeWY3"
              target="_blank"
              rel="noopener noreferrer"
              title="Discord"
              className="p-2 rounded-lg text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118] transition-colors"
            >
              {/* Discord SVG icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/CortexPrism/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-[rgba(255,255,255,0.12)] text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118] hover:border-[rgba(255,255,255,0.2)] transition-all"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>

            {/* Auth */}
            {loading ? (
              <div className="w-16 h-8 rounded-lg bg-[#111118] animate-pulse" />
            ) : user ? (
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("user")}
                onMouseLeave={handleDropdownLeave}
              >
                <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg accent-gradient text-white hover:opacity-90 transition-opacity">
                  <User className="w-4 h-4" />
                  {user.username}
                </button>
                {openDropdown === "user" && (
                  <div className="absolute top-full right-0 mt-1.5 w-44 glass-card p-1.5 shadow-2xl shadow-black/40">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#18181f] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> {t("dashboard")}
                    </Link>
                    <Link
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#18181f] transition-colors"
                    >
                      <User className="w-4 h-4" /> {t("profile")}
                    </Link>
                    <div className="my-1 border-t border-[rgba(255,255,255,0.07)]" />
                    <button
                      onClick={() => { logout(); setOpenDropdown(null); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-[#9090a8] hover:text-red-400 hover:bg-[#18181f] transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> {t("signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg accent-gradient text-white hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-4 h-4" />
                {t("signIn")}
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={tc("ariaToggleMenu")}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(255,255,255,0.07)] bg-[#0a0a0f]">
          <div className="px-4 py-4 space-y-1">
            {/* Docs section label */}
            <p className="px-3 pt-1 pb-0.5 text-xs font-semibold uppercase tracking-widest text-[#55556a]">
              {t("docs")}
            </p>
            {navLinks[0].children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block px-3 py-2 text-sm rounded-lg transition-colors",
                  pathname === child.href
                    ? "text-indigo-400 bg-indigo-500/10"
                    : "text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118]"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {child.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-[rgba(255,255,255,0.07)]" />

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href!}
                className={cn(
                  "block px-3 py-2 text-sm rounded-lg transition-colors",
                  pathname === link.href
                    ? "text-indigo-400 bg-indigo-500/10"
                    : "text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118]"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-[rgba(255,255,255,0.07)]" />

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-sm rounded-lg text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118]"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("dashboard")}
                </Link>
                <Link
                  href="/dashboard/notifications"
                  className="block px-3 py-2 text-sm rounded-lg text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118]"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("notifications")}
                </Link>
                <Link
                  href={`/profile/${user.username}`}
                  className="block px-3 py-2 text-sm rounded-lg text-[#9090a8] hover:text-[#e2e2ea] hover:bg-[#111118]"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("myProfile")}
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm rounded-lg text-[#9090a8] hover:text-red-400 hover:bg-[#111118]"
                >
                  {t("signOut")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 text-sm font-medium rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {t("signInArrow")}
              </Link>
            )}

            <div className="flex items-center gap-3 px-3 pt-2">
              <a
                href="https://discord.gg/wYxbmQeWY3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#9090a8] hover:text-indigo-400 transition-colors"
              >
                Discord
              </a>
              <span className="text-[#55556a]">·</span>
              <a
                href="https://reddit.com/r/CortexPrism"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#9090a8] hover:text-indigo-400 transition-colors"
              >
                Reddit
              </a>
              <span className="text-[#55556a]">·</span>
              <a
                href="https://github.com/CortexPrism/cortex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#9090a8] hover:text-indigo-400 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
