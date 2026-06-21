"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Eye, Users, TrendingUp, Globe, ChevronLeft, ChevronRight } from "lucide-react";

interface Overview {
  totalSessions: number;
  totalPageViews: number;
  today: { pageViews: number; sessions: number };
  week: { pageViews: number; sessions: number };
  month: { pageViews: number; sessions: number };
}

interface PageViewTrend {
  date: string;
  pageViews: number;
  sessions: number;
}

interface TopPage {
  path: string;
  views: number;
  percentage: number;
}

interface ReferrerData {
  referrer: string;
  views: number;
}

interface GeoData {
  country: string;
  sessions: number;
}

interface HistoryEntry {
  id: string;
  path: string;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  ipHash: string | null;
  timestamp: string;
}

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6"];

function apiFetch(path: string) {
  const token = localStorage.getItem("token");
  return fetch(path, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  }).then((r) => r.json());
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [trends, setTrends] = useState<PageViewTrend[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [geo, setGeo] = useState<GeoData[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [ov, tv, tp, rf, gd, hs] = await Promise.all([
      apiFetch("/api/admin/analytics/overview"),
      apiFetch(`/api/admin/analytics/pageviews?range=${range}`),
      apiFetch(`/api/admin/analytics/pages?range=${range}&limit=10`),
      apiFetch(`/api/admin/analytics/referrers?range=${range}&limit=10`),
      apiFetch(`/api/admin/analytics/geo?range=${range}&limit=10`),
      apiFetch("/api/admin/analytics/history?page=1&limit=20"),
    ]);
    setOverview(ov);
    setTrends(tv.data || []);
    setTopPages(tp.data || []);
    setReferrers(rf.data || []);
    setGeo(gd.data || []);
    setHistory(hs.data || []);
    setHistoryTotal(hs.pagination?.total || 0);
    setHistoryPage(1);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchHistory = async (page: number) => {
    const hs = await apiFetch(`/api/admin/analytics/history?page=${page}&limit=20`);
    setHistory(hs.data || []);
    setHistoryPage(page);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-[#55556a]">Loading analytics...</div>
      </div>
    );
  }

  const statCards = [
    { label: "Page Views (Today)", value: overview?.today.pageViews ?? 0, icon: Eye, color: "indigo" },
    { label: "Visitors (Today)", value: overview?.today.sessions ?? 0, icon: Users, color: "purple" },
    { label: `Page Views (${range})`, value: range === "7d" ? overview?.week.pageViews ?? 0 : overview?.month.pageViews ?? 0, icon: TrendingUp, color: "green" },
    { label: `Unique Visitors (${range})`, value: range === "7d" ? overview?.week.sessions ?? 0 : overview?.month.sessions ?? 0, icon: Globe, color: "blue" },
  ];

  const statColors: Record<string, string> = {
    indigo: "border-indigo-500/30",
    purple: "border-purple-500/30",
    green: "border-green-500/30",
    blue: "border-blue-500/30",
  };

  const iconColors: Record<string, string> = {
    indigo: "text-indigo-400",
    purple: "text-purple-400",
    green: "text-green-400",
    blue: "text-blue-400",
  };

  const totalPages = Math.ceil(historyTotal / 20);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2ea]">Analytics</h1>
          <p className="text-sm text-[#55556a] mt-1">Visitor tracking, page views, and traffic insights</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRange("7d")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              range === "7d" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-[#9090a8] hover:bg-[#111118]"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setRange("30d")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              range === "30d" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-[#9090a8] hover:bg-[#111118]"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`glass-card bg-[#0a0a0f] border ${statColors[stat.color]} rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9090a8]">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${iconColors[stat.color]}`} />
            </div>
            <div className="text-2xl font-bold text-[#e2e2ea] mt-2">{stat.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#9090a8] mb-4">Page Views & Visitors</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#55556a" }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                />
                <YAxis tick={{ fontSize: 11, fill: "#55556a" }} />
                <Tooltip
                  contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#e2e2ea" }}
                />
                <Bar dataKey="pageViews" fill="#6366f1" radius={[4, 4, 0, 0]} name="Page Views" />
                <Bar dataKey="sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#9090a8] mb-4">Visitor Countries</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={geo} dataKey="sessions" nameKey="country" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2}>
                  {geo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#e2e2ea" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">
            {geo.slice(0, 5).map((g, i) => (
              <div key={g.country} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[#9090a8]">{g.country || "Unknown"}</span>
                </div>
                <span className="text-[#e2e2ea]">{g.sessions}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#9090a8] mb-4">Top Pages</h3>
          <div className="space-y-2">
            {topPages.map((p) => (
              <div key={p.path} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#e2e2ea] truncate">{p.path}</div>
                  <div className="w-full h-1.5 bg-[#111118] rounded-full mt-1">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(p.percentage, 2)}%` }} />
                  </div>
                </div>
                <div className="text-xs text-[#9090a8] text-right min-w-[60px]">
                  <span className="text-[#e2e2ea] font-medium">{p.views}</span>
                  <span className="ml-1">({p.percentage}%)</span>
                </div>
              </div>
            ))}
            {topPages.length === 0 && <div className="text-sm text-[#55556a]">No data yet</div>}
          </div>
        </div>

        <div className="glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#9090a8] mb-4">Top Referrers</h3>
          <div className="space-y-2">
            {referrers.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="text-sm text-[#e2e2ea] truncate max-w-[70%]">
                  {r.referrer === "Direct" || !r.referrer ? "Direct / Bookmarks" : r.referrer}
                </div>
                <span className="text-xs text-[#9090a8]">{r.views}</span>
              </div>
            ))}
            {referrers.length === 0 && <div className="text-sm text-[#55556a]">No data yet</div>}
          </div>
        </div>
      </div>

      <div className="glass-card bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
        <h3 className="text-sm font-medium text-[#9090a8] mb-4">Recent Page Views</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#55556a] border-b border-[rgba(255,255,255,0.07)]">
                <th className="py-2 pr-4 font-medium">Page</th>
                <th className="py-2 pr-4 font-medium">Country</th>
                <th className="py-2 pr-4 font-medium">Browser</th>
                <th className="py-2 pr-4 font-medium">Referrer</th>
                <th className="py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[#111118]">
                  <td className="py-2 pr-4 text-[#e2e2ea] truncate max-w-[200px]">{h.path}</td>
                  <td className="py-2 pr-4 text-[#9090a8]">{h.country || "-"}</td>
                  <td className="py-2 pr-4 text-[#9090a8]">{h.userAgent || "-"}</td>
                  <td className="py-2 pr-4 text-[#9090a8] truncate max-w-[200px]">{h.referrer || "Direct"}</td>
                  <td className="py-2 text-[#55556a] whitespace-nowrap">{new Date(h.timestamp).toLocaleString()}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-[#55556a]">No page views recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-[#55556a]">
              Page {historyPage} of {totalPages} ({historyTotal} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchHistory(historyPage - 1)}
                disabled={historyPage <= 1}
                className="p-1.5 rounded-lg text-[#9090a8] hover:bg-[#111118] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchHistory(historyPage + 1)}
                disabled={historyPage >= totalPages}
                className="p-1.5 rounded-lg text-[#9090a8] hover:bg-[#111118] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
