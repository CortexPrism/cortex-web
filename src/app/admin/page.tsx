"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Package, Bot, Users, GitBranch, Shield, Download, Clock, AlertCircle, CheckCircle } from "lucide-react";

interface AdminStats {
  users: { total: number; active: number };
  plugins: { total: number; pending: number; approved: number };
  agents: { total: number; pending: number; approved: number };
  downloads: number;
  categories: number;
  roles: number;
  githubConnections: number;
}

interface RecentItem {
  id: string; name: string; slug: string; status: string;
  createdAt: string; user: { username: string } | null;
}

interface RecentLog {
  id: string; action: string; entity: string | null;
  user: string | null; createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentPlugins, setRecentPlugins] = useState<RecentItem[]>([]);
  const [recentAgents, setRecentAgents] = useState<RecentItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/admin/stats", { headers: { authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setStats(data.stats);
        setRecentPlugins(data.recentActivity?.recentPlugins || []);
        setRecentAgents(data.recentActivity?.recentAgents || []);
        setRecentLogs(data.recentActivity?.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[#55556a]">Loading dashboard...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e2e2ea]">Dashboard</h1>
        <p className="text-[#9090a8] text-sm">Welcome to the admin panel, {user?.username}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Plugins" value={stats?.plugins.total || 0}
          sub={`${stats?.plugins.pending || 0} pending`} color="indigo" />
        <StatCard icon={Bot} label="Agents" value={stats?.agents.total || 0}
          sub={`${stats?.agents.pending || 0} pending`} color="purple" />
        <StatCard icon={Users} label="Users" value={stats?.users.total || 0}
          sub={`${stats?.users.active || 0} active`} color="green" />
        <StatCard icon={GitBranch} label="GitHub Connections" value={stats?.githubConnections || 0}
          sub={`${stats?.plugins.approved || 0} published`} color="blue" />
        <StatCard icon={Download} label="Total Downloads" value={stats?.downloads || 0}
          sub={`${stats?.categories || 0} categories`} color="yellow" />
        <StatCard icon={Shield} label="Roles" value={stats?.roles || 0}
          sub="RBAC system" color="red" />
      </div>

      {/* Pending alerts */}
      {(stats?.plugins.pending || stats?.agents.pending) ? (
        <div className="flex flex-wrap gap-3 mb-8">
          {stats!.plugins.pending > 0 && (
            <Link href="/admin/submissions?tab=plugins"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 text-sm hover:bg-yellow-500/20 transition-colors">
              <AlertCircle className="w-4 h-4" />
              {stats!.plugins.pending} plugin{stats!.plugins.pending > 1 ? "s" : ""} pending review
            </Link>
          )}
          {stats!.agents.pending > 0 && (
            <Link href="/admin/submissions?tab=agents"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 text-sm hover:bg-yellow-500/20 transition-colors">
              <AlertCircle className="w-4 h-4" />
              {stats!.agents.pending} agent{stats!.agents.pending > 1 ? "s" : ""} pending review
            </Link>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/10 text-green-300 border border-green-500/20 text-sm mb-8">
          <CheckCircle className="w-4 h-4" />
          All submissions reviewed
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent submissions */}
        <section>
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-4">Recent Submissions</h2>
          <div className="space-y-2">
            {recentPlugins.map(p => <SubmissionRow key={p.id} item={p} type="plugin" />)}
            {recentAgents.map(a => <SubmissionRow key={a.id} item={a} type="agent" />)}
            {recentPlugins.length === 0 && recentAgents.length === 0 && (
              <div className="glass-card p-6 text-center text-sm text-[#55556a]">No recent submissions</div>
            )}
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {recentLogs.length === 0 ? (
              <div className="glass-card p-6 text-center text-sm text-[#55556a]">No recent activity</div>
            ) : (
              recentLogs.map(log => (
                <div key={log.id} className="glass-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-[#55556a]" />
                    <span className="text-sm text-[#e2e2ea]">{log.action}</span>
                  </div>
                  <div className="text-xs text-[#55556a]">
                    {log.user && <span>{log.user} · </span>}
                    {new Date(log.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number;
  sub: string; color: string;
}) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className={`glass-card p-4 border ${colors[color] || colors.indigo}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-black/20">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-[#9090a8] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[#e2e2ea]">{typeof value === "number" ? value.toLocaleString() : value}</div>
      <div className="text-xs text-[#55556a] mt-1">{sub}</div>
    </div>
  );
}

function SubmissionRow({ item, type }: { item: RecentItem; type: "plugin" | "agent" }) {
  const statusColor: Record<string, string> = {
    pending: "text-yellow-400",
    approved: "text-green-400",
    rejected: "text-red-400",
  };

  return (
    <Link href={`/admin/submissions?tab=${type}s`} className="glass-card p-3 flex items-center justify-between hover:bg-[#111118] transition-colors">
      <div className="flex items-center gap-2">
        {type === "plugin" ? <Package className="w-4 h-4 text-indigo-400" /> : <Bot className="w-4 h-4 text-purple-400" />}
        <span className="text-sm text-[#e2e2ea]">{item.name}</span>
        {item.user && <span className="text-xs text-[#55556a]">by {item.user.username}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${statusColor[item.status] || "text-[#55556a]"}`}>{item.status}</span>
        <span className="text-xs text-[#55556a]">{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
