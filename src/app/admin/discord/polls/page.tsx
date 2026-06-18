"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, BarChart3, XCircle } from "lucide-react";
import { Button } from "@/components/shared/Button";

interface Poll {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string | null;
  title: string;
  description: string | null;
  options: string;
  allowMultiple: boolean;
  isActive: boolean;
  createdBy: string;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return t ? { authorization: `Bearer ${t}` } : {};
  }, []);

  const fetchPolls = useCallback(async () => {
    const headers = authHeaders();
    if (!headers.authorization) { setLoading(false); return; }
    setLoading(true);
    try {
      const settingsRes = await fetch("/api/admin/discord", { headers });
      const settingsData = await settingsRes.json();
      const guildId = settingsData.settings?.discord_guild_id || "";
      if (!guildId) { setLoading(false); return; }

      const res = await fetch(`/api/admin/discord/polls?guildId=${guildId}`, { headers });
      const data = await res.json();
      if (res.ok) setPolls(data.polls || []);
    } catch (e) {
      console.error("Failed to load polls:", e);
    }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchPolls(); }, [fetchPolls]);

  const endPoll = async (id: string) => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    try {
      await fetch(`/api/admin/discord/polls?id=${id}`, { method: "DELETE", headers });
      fetchPolls();
    } catch {}
  };

  const formatDate = (d: string) => new Date(d).toLocaleString();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e2ea]">Polls</h1>
        <p className="text-[#9090a8] text-sm">View and manage Discord polls</p>
      </div>

      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={fetchPolls}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#55556a]">Loading...</div>
      ) : polls.length > 0 ? (
        <div className="space-y-3">
          {polls.map(poll => {
            let options: { emoji: string; label: string; votes: number }[] = [];
            try { options = JSON.parse(poll.options); } catch {}
            const totalVotes = options.reduce((a, b) => a + b.votes, 0);

            return (
              <div key={poll.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[#e2e2ea] font-medium">{poll.title}</h3>
                    {poll.description && <p className="text-xs text-[#55556a] mt-0.5">{poll.description}</p>}
                    <p className="text-xs text-[#55556a] mt-1">
                      Created {formatDate(poll.createdAt)} · Channel: {poll.channelId}
                      {poll.allowMultiple ? " · Multiple choice" : ""}
                      {poll.expiresAt ? ` · Ends: ${formatDate(poll.expiresAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${poll.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      {poll.isActive ? "Active" : "Ended"}
                    </span>
                    {poll.isActive && (
                      <Button variant="ghost" size="sm" onClick={() => endPoll(poll.id)}>
                        <XCircle className="w-4 h-4 text-red-400" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {options.map((opt, i) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm">{opt.emoji}</span>
                        <span className="text-sm text-[#e2e2ea] flex-1">{opt.label}</span>
                        <div className="w-24 h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(pct, 5)}%` }} />
                        </div>
                        <span className="text-xs text-[#55556a] w-12 text-right">
                          {opt.votes} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-[#55556a]">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No polls found</p>
          <p className="text-xs mt-1">Create polls in Discord with /poll create</p>
        </div>
      )}
    </div>
  );
}
