"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/shared/Badge";
import { Package, Bot, Check, X, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  id: string; action: string; notes: string | null;
  createdAt: string;
  reviewer: { username: string } | null;
}

interface PendingItem {
  id: string; name: string; slug: string; version: string;
  description: string; kind?: string; provider?: string;
  category: string | null; status: string; tags?: string[];
  user: { id: string; username: string; email: string } | null;
  reviews: Review[];
  createdAt: string;
}

export default function AdminSubmissionsPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"plugins" | "agents">(
    (searchParams.get("tab") as "plugins" | "agents") || "plugins"
  );
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchSubmissions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ status: statusFilter, page: String(page), limit: "20" });
    if (searchQuery) params.set("search", searchQuery);

    const res = await fetch(`/api/admin/submissions/${tab}?${params}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data[tab] || []);
      setTotalPages(data.totalPages || 1);
    }
    setLoading(false);
  }, [tab, statusFilter, page, searchQuery, token]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "plugins" || t === "agents") setTab(t);
  }, [searchParams]);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    if (!token) return;
    setActionLoading(id);
    const res = await fetch(`/api/admin/submissions/${tab}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, action, notes: reviewNotes[id] || null }),
    });
    if (res.ok) {
      setReviewNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
      fetchSubmissions();
    }
    setActionLoading(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubmissions();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e2ea]">Submission Review</h1>
        <p className="text-[#9090a8] text-sm">Review and manage marketplace submissions</p>
      </div>

      {/* Tabs & filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          <button onClick={() => { setTab("plugins"); setPage(1); }}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === "plugins" ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "bg-[#111118] text-[#9090a8] border border-[rgba(255,255,255,0.07)]"}`}>
            <Package className="w-4 h-4 inline mr-1" /> Plugins
          </button>
          <button onClick={() => { setTab("agents"); setPage(1); }}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === "agents" ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "bg-[#111118] text-[#9090a8] border border-[rgba(255,255,255,0.07)]"}`}>
            <Bot className="w-4 h-4 inline mr-1" /> Agents
          </button>
        </div>

        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea]">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55556a]" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] w-48"
              placeholder="Search submissions..." />
          </div>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-[#55556a]">Loading...</div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-3xl mb-3">🎉</div>
          <p className="text-[#9090a8]">No {statusFilter} {tab} submissions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/marketplace/${tab}/${item.slug}`} className="font-semibold text-[#e2e2ea] hover:text-indigo-400">
                      {item.name}
                    </Link>
                    <Badge variant={
                      item.status === "pending" ? "yellow" :
                      item.status === "approved" ? "green" : "red"
                    }>{item.status}</Badge>
                    {item.tags?.slice(0, 3).map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#18181f] text-[#55556a]">{t}</span>
                    ))}
                  </div>
                  <p className="text-sm text-[#55556a] mt-1">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                <div className="text-[#55556a]">
                  by {item.user?.username || "Anonymous"} · v{item.version}
                  {item.kind && ` · ${item.kind.toUpperCase()}`}
                  {item.provider && ` · ${item.provider}`}
                  {item.category && ` · ${item.category}`}
                </div>

                {item.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <input type="text"
                      value={reviewNotes[item.id] || ""}
                      onChange={e => setReviewNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="Review notes..."
                      className="px-3 py-1.5 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-xs text-[#e2e2ea] w-40" />
                    <button onClick={() => handleAction(item.id, "approved")} disabled={actionLoading === item.id}
                      className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleAction(item.id, "rejected")} disabled={actionLoading === item.id}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Review history */}
              {item.reviews && item.reviews.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.07)]">
                  {item.reviews.slice(0, 3).map(r => (
                    <div key={r.id} className="text-xs text-[#55556a] flex items-center gap-2">
                      <Badge variant={r.action === "approved" ? "green" : "red"}>{r.action}</Badge>
                      <span>by {r.reviewer?.username || "unknown"}</span>
                      {r.notes && <span>— {r.notes}</span>}
                      <span className="ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg bg-[#111118] text-[#9090a8] disabled:opacity-50 border border-[rgba(255,255,255,0.07)]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-[#55556a]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg bg-[#111118] text-[#9090a8] disabled:opacity-50 border border-[rgba(255,255,255,0.07)]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
