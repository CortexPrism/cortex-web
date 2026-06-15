"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/shared/Badge";
import { Plus, Package, Bot, GitBranch } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface Submission {
  id: string; name: string; slug: string; version: string;
  description: string; status: string; kind?: string; provider?: string;
  category: string | null; createdAt: string;
}

const statusBadge: Record<string, "yellow" | "green" | "red" | "default"> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [plugins, setPlugins] = useState<Submission[]>([]);
  const [agents, setAgents] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    const token = localStorage.getItem("token");
    fetch("/api/user/submissions", {
      headers: { authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(subs => {
        setPlugins(subs.plugins || []);
        setAgents(subs.agents || []);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [user, authLoading, router]);

  if (authLoading || loading) return <div className="max-w-page-narrow mx-auto px-4 py-20 text-center text-[#55556a]">Loading...</div>;
  if (error) return <div className="max-w-page-narrow mx-auto px-4 py-20 text-center text-red-400">{error}</div>;
  if (!user) return null;

  return (
    <div className="max-w-page-narrow mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#e2e2ea]">Dashboard</h1>
          <p className="text-[#9090a8]">Welcome, {user.username}</p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === "admin" && (
            <Link href="/admin" className="text-sm text-indigo-400 hover:text-indigo-300">Admin Panel</Link>
          )}
          <Link href="/dashboard/settings" className="text-sm text-indigo-400 hover:text-indigo-300">Account Settings</Link>
          <button onClick={logout} className="text-sm text-[#55556a] hover:text-[#e2e2ea]">Sign Out</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link href="/marketplace/publish/plugin" className="glass-card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Plus className="w-5 h-5 text-indigo-400" /></div>
          <div><div className="font-semibold text-[#e2e2ea]">Publish Plugin</div><div className="text-sm text-[#55556a]">Submit a new plugin</div></div>
        </Link>
        <Link href="/marketplace/publish/agent" className="glass-card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center"><Plus className="w-5 h-5 text-purple-400" /></div>
          <div><div className="font-semibold text-[#e2e2ea]">Publish Agent</div><div className="text-sm text-[#55556a]">Submit a new agent config</div></div>
        </Link>
        <Link href="/marketplace/publish/plugin?source=github" className="glass-card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#18181f] flex items-center justify-center"><GitBranch className="w-5 h-5 text-[#9090a8]" /></div>
          <div><div className="font-semibold text-[#e2e2ea]">Import from GitHub</div><div className="text-sm text-[#55556a]">Publish from a repository</div></div>
        </Link>
      </div>

      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-[#e2e2ea]">My Plugins ({plugins.length})</h2>
        </div>
        {plugins.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm text-[#55556a]">No plugins submitted yet.</div>
        ) : (
          <div className="space-y-2">
            {plugins.map(p => (
              <div key={p.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <Link href={`/marketplace/plugins/${p.slug}`} className="font-medium text-[#e2e2ea] hover:text-indigo-400">{p.name}</Link>
                  <div className="text-xs text-[#55556a]">v{p.version} · {p.kind}</div>
                </div>
                <Badge variant={statusBadge[p.status] || "default"}>{p.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-[#e2e2ea]">My Agents ({agents.length})</h2>
        </div>
        {agents.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm text-[#55556a]">No agents submitted yet.</div>
        ) : (
          <div className="space-y-2">
            {agents.map(a => (
              <div key={a.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <Link href={`/marketplace/agents/${a.slug}`} className="font-medium text-[#e2e2ea] hover:text-indigo-400">{a.name}</Link>
                  <div className="text-xs text-[#55556a]">v{a.version}{a.provider ? ` · ${a.provider}` : ""}</div>
                </div>
                <Badge variant={statusBadge[a.status] || "default"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
