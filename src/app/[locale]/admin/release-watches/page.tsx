"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Power, PowerOff, RefreshCw, ExternalLink, GitBranch, CheckCircle, XCircle, Star, GitFork } from "lucide-react";
import { Button } from "@/components/shared/Button";

interface ReleaseWatchItem {
  id: string;
  owner: string;
  repo: string;
  watchType: string;
  lastReleaseTag: string | null;
  lastReleasePublishedAt: string | null;
  lastStarCount: number | null;
  lastForkCount: number | null;
  channelId: string;
  guildId: string;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
}

export default function AdminReleaseWatchesPage() {
  const [watches, setWatches] = useState<ReleaseWatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ owner: "", repo: "", watchType: "release", channelId: "", guildId: "" });
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = useCallback(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return t ? { authorization: `Bearer ${t}`, "Content-Type": "application/json" } : {};
  }, []);

  const fetchWatches = useCallback(async () => {
    const headers = authHeaders();
    if (!headers.authorization) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/release-watches", { headers });
      const data = await res.json();
      if (res.ok) {
        setWatches(data.watches || []);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to load" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load release watches" });
    }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchWatches(); }, [fetchWatches]);

  const addWatch = async () => {
    if (!form.owner || !form.repo || !form.channelId || !form.guildId) {
      setMessage({ type: "error", text: "All fields are required" });
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    const headers = authHeaders();
    if (!headers.authorization) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/release-watches", {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Now watching ${form.owner}/${form.repo}` });
        setShowAddForm(false);
        setForm({ owner: "", repo: "", watchType: "release", channelId: "", guildId: "" });
        fetchWatches();
      } else {
        setMessage({ type: "error", text: data.error || `Failed (HTTP ${res.status})` });
      }
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    }
    setSubmitting(false);
    setTimeout(() => setMessage(null), 5000);
  };

  const deleteWatch = async (id: string) => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/release-watches?id=${encodeURIComponent(id)}`, { method: "DELETE", headers });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Watch removed" });
        setWatches(prev => prev.filter(w => w.id !== id));
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete" });
      }
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const toggleWatch = async (id: string, currentActive: boolean) => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    setMessage(null);
    try {
      const res = await fetch("/api/admin/release-watches", {
        method: "PUT",
        headers,
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Watch ${!currentActive ? "enabled" : "paused"}` });
        setWatches(prev => prev.map(w => w.id === id ? { ...w, isActive: !currentActive } : w));
      } else {
        setMessage({ type: "error", text: data.error || "Failed to toggle" });
      }
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const inputClass = "w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50 placeholder:text-[#55556a]";
  const typeLabel = (t: string) => t === "both" ? "Releases + Tags" : t === "tag" ? "Tags only" : "Releases only";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2ea]">Release Watches</h1>
          <p className="text-[#9090a8] text-sm">Monitor GitHub repositories and post new releases, tags, stars, and forks to Discord channels</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Watch
        </Button>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
          message.type === "success"
            ? "bg-green-500/10 text-green-300 border border-green-500/20"
            : "bg-red-500/10 text-red-300 border border-red-500/20"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {showAddForm && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-4">Add New Watch</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[#e2e2ea] mb-1">Owner</label>
              <input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} className={inputClass} placeholder="e.g. CortexPrism" />
            </div>
            <div>
              <label className="block text-sm text-[#e2e2ea] mb-1">Repository</label>
              <input value={form.repo} onChange={e => setForm({ ...form, repo: e.target.value })} className={inputClass} placeholder="e.g. cortex" />
            </div>
            <div>
              <label className="block text-sm text-[#e2e2ea] mb-1">Watch Type</label>
              <select value={form.watchType} onChange={e => setForm({ ...form, watchType: e.target.value })} className={inputClass}>
                <option value="release">Releases</option>
                <option value="tag">Tags</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#e2e2ea] mb-1">Discord Guild ID</label>
              <input value={form.guildId} onChange={e => setForm({ ...form, guildId: e.target.value })} className={inputClass} placeholder="Server ID" />
            </div>
            <div>
              <label className="block text-sm text-[#e2e2ea] mb-1">Discord Channel ID</label>
              <input value={form.channelId} onChange={e => setForm({ ...form, channelId: e.target.value })} className={inputClass} placeholder="Channel ID" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={addWatch} disabled={submitting}>
              <Plus className="w-4 h-4 mr-1.5" /> {submitting ? "Adding..." : "Add Watch"}
            </Button>
            <button onClick={() => setShowAddForm(false)} className="text-sm text-[#55556a] hover:text-[#e2e2ea]">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#55556a]">Loading...</div>
      ) : watches.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <GitBranch className="w-12 h-12 text-[#55556a] mx-auto mb-3" />
          <p className="text-[#9090a8]">No repositories are being watched.</p>
          <p className="text-xs text-[#55556a] mt-1">Click &ldquo;Add Watch&rdquo; to start monitoring GitHub releases.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {watches.map((w) => (
            <div key={w.id} className={`glass-card p-5 ${!w.isActive ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={`https://github.com/${w.owner}/${w.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e2ea] font-medium hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
                    >
                      {w.owner}/{w.repo}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      w.watchType === "both" ? "bg-purple-500/10 text-purple-300"
                      : w.watchType === "tag" ? "bg-violet-500/10 text-violet-300"
                      : "bg-indigo-500/10 text-indigo-300"
                    }`}>
                      {typeLabel(w.watchType)}
                    </span>
                    {!w.isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300">Paused</span>
                    )}
                  </div>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-[#55556a]">
                    <span>Channel: <code className="text-[#9090a8]">{w.channelId}</code></span>
                    <span>Guild: <code className="text-[#9090a8]">{w.guildId}</code></span>
                    {w.lastStarCount !== null && (
                      <span className="inline-flex items-center gap-1 text-amber-300"><Star className="w-3 h-3 fill-current" /> {w.lastStarCount.toLocaleString()}</span>
                    )}
                    {w.lastForkCount !== null && (
                      <span className="inline-flex items-center gap-1 text-teal-300"><GitFork className="w-3 h-3" /> {w.lastForkCount.toLocaleString()}</span>
                    )}
                    {w.lastReleaseTag && (
                      <span>Last: <code className="text-green-400">{w.lastReleaseTag}</code></span>
                    )}
                    {w.lastReleasePublishedAt && (
                      <span>{new Date(w.lastReleasePublishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleWatch(w.id, w.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      w.isActive
                        ? "text-yellow-400 hover:bg-yellow-500/10"
                        : "text-green-400 hover:bg-green-500/10"
                    }`}
                    title={w.isActive ? "Pause" : "Resume"}
                  >
                    {w.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteWatch(w.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {watches.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchWatches}
            className="inline-flex items-center gap-2 text-sm text-[#55556a] hover:text-[#e2e2ea] transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      )}
    </div>
  );
}
