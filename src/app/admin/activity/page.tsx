"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, Clock, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface AuditLog {
  id: string; action: string; entity: string | null;
  entityId: string | null; metadata: string | null;
  ip: string | null; createdAt: string;
  user: { id: string; username: string } | null;
}

const actionLabels: Record<string, string> = {
  "submission.approved": "Submission Approved",
  "submission.rejected": "Submission Rejected",
  "github.connect": "GitHub Connected",
  "github.disconnect": "GitHub Disconnected",
  "github.sync": "GitHub Synced",
};

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (actionFilter) params.set("action", actionFilter);
    const res = await fetch(`/api/admin/audit-logs?${params}`, { headers: { authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
    }
    setLoading(false);
  }, [page, actionFilter, token]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e2ea]">Activity Log</h1>
        <p className="text-[#9090a8] text-sm">System audit trail of admin actions</p>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Filter className="w-4 h-4 text-[#55556a]" />
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea]">
          <option value="">All actions</option>
          <option value="submission.approved">Approvals</option>
          <option value="submission.rejected">Rejections</option>
          <option value="github.connect">GitHub Connects</option>
          <option value="github.disconnect">GitHub Disconnects</option>
          <option value="github.sync">GitHub Syncs</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#55556a]">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Activity className="w-8 h-8 mx-auto mb-3 text-[#55556a]" />
          <p className="text-[#9090a8]">No activity logs found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="glass-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-3 h-3 text-[#55556a] shrink-0" />
                  <div>
                    <span className="text-sm text-[#e2e2ea]">
                      {actionLabels[log.action] || log.action}
                    </span>
                    {log.entity && (
                      <span className="text-xs text-[#55556a] ml-2">
                        {log.entity}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                      </span>
                    )}
                    <div className="text-xs text-[#55556a]">
                      {log.user && <span>{log.user.username}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#55556a] shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
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
        </>
      )}
    </div>
  );
}
