"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, Link } from "@/i18n/routing";
import { useAuth } from "@/lib/AuthContext";
import {
  LayoutDashboard, Users, Shield, GitBranch, ClipboardList, Activity, Menu, X, ChevronRight, Search, Settings, MessageSquare, Mail, BookOpen, FileText, BarChart3,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  exact?: boolean;
  subItems?: { href: string; label: string; exact?: boolean }[];
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/submissions", label: "Submissions", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/roles", label: "Roles & Permissions", icon: Shield },
  { href: "/admin/github", label: "GitHub Connections", icon: GitBranch },
  { href: "/admin/github/scanner", label: "Topic Scanner", icon: Search },
  {
    href: "/admin/discord",
    label: "Discord Bot",
    icon: MessageSquare,
    subItems: [
      { href: "/admin/discord", label: "Dashboard", exact: true },
      { href: "/admin/discord/moderation", label: "Moderation Logs" },
      { href: "/admin/discord/tickets", label: "Tickets" },
      { href: "/admin/discord/polls", label: "Polls" },
      { href: "/admin/release-watches", label: "Release Watches" },
    ],
  },
  { href: "/admin/email", label: "Email", icon: Mail },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/activity", label: "Activity Log", icon: Activity },
];

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-[#050508]"><div className="text-[#55556a]">Loading...</div></div>;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#050508]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a0a0f] border-r border-[rgba(255,255,255,0.07)]
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        pt-16 lg:pt-0
      `}>
        <div className="p-4 border-b border-[rgba(255,255,255,0.07)]">
          <h2 className="text-lg font-bold text-[#e2e2ea]">Admin Panel</h2>
          <p className="text-xs text-[#55556a]">{user.username}</p>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const hasSubItems = 'subItems' in item && item.subItems && item.subItems.length > 0;

            if (hasSubItems) {
              const subIsActive = item.subItems!.some(si => si.exact ? pathname === si.href : pathname.startsWith(si.href));
              return (
                <div key={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    subIsActive
                      ? "text-indigo-300"
                      : "text-[#9090a8] hover:bg-[#111118] hover:text-[#e2e2ea]"
                  }`}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${subIsActive ? "rotate-90" : ""}`} />
                  </div>
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l border-[rgba(255,255,255,0.07)] pl-3">
                    {item.subItems!.map((si) => {
                      const siActive = si.exact ? pathname === si.href : pathname.startsWith(si.href);
                      return (
                        <Link
                          key={si.href}
                          href={si.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                            siActive
                              ? "bg-indigo-500/10 text-indigo-300"
                              : "text-[#9090a8] hover:bg-[#111118] hover:text-[#e2e2ea]"
                          }`}
                        >
                          {si.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    : "text-[#9090a8] hover:bg-[#111118] hover:text-[#e2e2ea]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[rgba(255,255,255,0.07)] mt-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs text-[#55556a] hover:text-[#e2e2ea] transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-indigo-500 text-white rounded-full shadow-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
