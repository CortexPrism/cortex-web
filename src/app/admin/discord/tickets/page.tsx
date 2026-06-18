"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, ChevronLeft, ChevronRight, MessageCircle, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/shared/Button";

interface Ticket {
  id: string;
  guildId: string;
  channelId: string;
  userId: string;
  userTag: string;
  subject: string;
  status: string;
  priority: string;
  claimedBy: string | null;
  claimedByTag: string | null;
  closedAt: string | null;
  closeReason: string | null;
  createdAt: string;
}

interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
}

const statusColors: Record<string, string> = {
  open: "bg-green-500/10 text-green-400 border-green-500/20",
  claimed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  closed: "bg-red-500/10 text-red-400 border-red-500/20",
  deleted: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const priorityIcons: Record<string, string> = {
  low: "🟢",
  normal: "🟡",
  high: "🟠",
  urgent: "🔴",
};

export default function AdminTicketsPage() {
  const [data, setData] = useState<TicketsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const authHeaders = useCallback(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return t ? { authorization: `Bearer ${t}` } : {};
  }, []);

  const fetchTickets = useCallback(async () => {
    const headers = authHeaders();
    if (!headers.authorization) { setLoading(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      if (statusFilter) params.set("status", statusFilter);

      const guildId = await fetch("/api/admin/discord", { headers }).then(r => r.json()).then(d => d.settings?.discord_guild_id).catch(() => "");
      if (guildId) params.set("guildId", guildId);

      const res = await fetch(`/api/admin/discord/tickets?${params}`, { headers });
      const d = await res.json();
      if (res.ok) setData(d);
    } catch (e) {
      console.error("Failed to load tickets:", e);
    }
    setLoading(false);
  }, [page, statusFilter, authHeaders]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const formatDate = (d: string) => new Date(d).toLocaleString();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e2ea]">Tickets</h1>
        <p className="text-[#9090a8] text-sm">View and manage Discord support tickets</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea]">
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="claimed">Claimed</option>
          <option value="closed">Closed</option>
          <option value="deleted">Deleted</option>
        </select>
        <Button variant="outline" size="sm" onClick={fetchTickets}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
        </Button>
      </div>

      {loading && !data ? (
        <div className="text-center py-12 text-[#55556a]">Loading...</div>
      ) : data && data.tickets.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.07)]">
            <table className="w-full text-sm">
              <thead className="bg-[#0a0a0f] text-[#9090a8] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Claimed By</th>
                  <th className="px-4 py-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {data.tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-[#111118]/50">
                    <td className="px-4 py-3 font-mono text-xs text-[#55556a]">{ticket.id.substring(0, 12)}...</td>
                    <td className="px-4 py-3 text-[#e2e2ea] font-medium">{ticket.subject}</td>
                    <td className="px-4 py-3 text-[#e2e2ea] text-xs">{ticket.userTag}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{priorityIcons[ticket.priority] || "🟡"} {ticket.priority.toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${statusColors[ticket.status] || ""}`}>
                        {ticket.status === "open" && <AlertCircle className="w-3 h-3" />}
                        {ticket.status === "claimed" && <CheckCircle className="w-3 h-3" />}
                        {ticket.status === "closed" && <XCircle className="w-3 h-3" />}
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#9090a8] text-xs">{ticket.claimedByTag || "—"}</td>
                    <td className="px-4 py-3 text-right text-[#55556a] text-xs whitespace-nowrap">
                      {formatDate(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-[#55556a]">
                Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, data.total)} of {data.total}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 py-1 text-[#9090a8]">{page} / {data.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-[#55556a]">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No tickets found</p>
          <p className="text-xs mt-1">Tickets are created via Discord using /ticket create</p>
        </div>
      )}
    </div>
  );
}
