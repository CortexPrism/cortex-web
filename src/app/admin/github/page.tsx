"use client";

import { useEffect, useState, useCallback } from "react";
import { GitBranch, Plus, RefreshCw, Trash2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";

interface GitHubConnection {
  id: string; owner: string; repo: string; branch: string;
  isActive: boolean; lastSyncAt: string | null;
  syncPlugins: boolean; syncAgents: boolean; autoApprove: boolean;
  manifestPath: string;
  createdBy: { id: string; username: string } | null;
  createdAt: string;
}

export default function AdminGitHubPage() {
  const [connections, setConnections] = useState<GitHubConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [form, setForm] = useState({
    owner: "", repo: "", branch: "main", manifestPath: "cortex.json",
    syncPlugins: true, syncAgents: false, autoApprove: false,
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchConnections = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetch("/api/admin/github-connections", { headers: { authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setConnections(data.connections || []);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  const createConnection = async () => {
    if (!token || !form.owner || !form.repo) return;
    const res = await fetch("/api/admin/github-connections", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowNew(false);
      setForm({ owner: "", repo: "", branch: "main", manifestPath: "cortex.json", syncPlugins: true, syncAgents: false, autoApprove: false });
      fetchConnections();
    }
  };

  const deleteConnection = async (id: string) => {
    if (!token) return;
    await fetch("/api/admin/github-connections", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    fetchConnections();
  };

  const syncConnection = async (id: string) => {
    if (!token) return;
    setSyncing(id);
    setSyncResult(null);
    const res = await fetch(`/api/admin/github-connections/${id}/sync`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setSyncResult(data.result);
    }
    setSyncing(null);
    fetchConnections();
  };

  const toggleConnection = async (conn: GitHubConnection) => {
    if (!token) return;
    await fetch("/api/admin/github-connections", {
      method: "PUT",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: conn.id, isActive: !conn.isActive }),
    });
    fetchConnections();
  };

  const inputClass = "w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea]";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2ea]">GitHub Connections</h1>
          <p className="text-[#9090a8] text-sm">Connect repositories to auto-import modules to the marketplace</p>
        </div>
        <button onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-sm hover:bg-indigo-500/20 transition-colors">
          <Plus className="w-4 h-4" /> Add Repository
        </button>
      </div>

      {syncResult && (
        <div className="glass-card p-4 mb-6 border border-green-500/20">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Sync Complete</span>
          </div>
          <div className="text-sm text-[#e2e2ea]">
            Imported: {syncResult.imported} | Skipped: {syncResult.skipped}
          </div>
          {syncResult.errors.length > 0 && (
            <div className="mt-2 text-xs text-red-400">
              {syncResult.errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
        </div>
      )}

      {showNew && (
        <div className="glass-card p-6 mb-6">
          <h3 className="text-sm font-semibold text-[#e2e2ea] mb-4">Connect a GitHub Repository</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-[#55556a] mb-1">Owner *</label>
              <input type="text" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })}
                className={inputClass} placeholder="CortexPrism" />
            </div>
            <div>
              <label className="block text-xs text-[#55556a] mb-1">Repository *</label>
              <input type="text" value={form.repo} onChange={e => setForm({ ...form, repo: e.target.value })}
                className={inputClass} placeholder="cortex" />
            </div>
            <div>
              <label className="block text-xs text-[#55556a] mb-1">Branch</label>
              <input type="text" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })}
                className={inputClass} placeholder="main" />
            </div>
            <div>
              <label className="block text-xs text-[#55556a] mb-1">Manifest Path</label>
              <input type="text" value={form.manifestPath} onChange={e => setForm({ ...form, manifestPath: e.target.value })}
                className={inputClass} placeholder="cortex.json" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm text-[#e2e2ea]">
              <input type="checkbox" checked={form.syncPlugins}
                onChange={e => setForm({ ...form, syncPlugins: e.target.checked })} />
              Sync Plugins
            </label>
            <label className="flex items-center gap-2 text-sm text-[#e2e2ea]">
              <input type="checkbox" checked={form.syncAgents}
                onChange={e => setForm({ ...form, syncAgents: e.target.checked })} />
              Sync Agents
            </label>
            <label className="flex items-center gap-2 text-sm text-[#e2e2ea]">
              <input type="checkbox" checked={form.autoApprove}
                onChange={e => setForm({ ...form, autoApprove: e.target.checked })} />
              Auto-Approve
            </label>
          </div>
          <Button onClick={createConnection} disabled={!form.owner || !form.repo}>Connect Repository</Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#55556a]">Loading...</div>
      ) : connections.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <GitBranch className="w-8 h-8 mx-auto mb-3 text-[#55556a]" />
          <p className="text-[#9090a8]">No GitHub connections yet.</p>
          <p className="text-xs text-[#55556a] mt-1">Connect a repository to auto-import plugins and agents.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map(conn => (
            <div key={conn.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-indigo-400" />
                    <a href={`https://github.com/${conn.owner}/${conn.repo}`} target="_blank" rel="noopener noreferrer"
                      className="font-semibold text-[#e2e2ea] hover:text-indigo-400 flex items-center gap-1">
                      {conn.owner}/{conn.repo}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <Badge variant={conn.isActive ? "green" : "red"}>
                      {conn.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#55556a]">
                    <span>Branch: <code className="text-indigo-400">{conn.branch}</code></span>
                    <span>Manifest: <code className="text-indigo-400">{conn.manifestPath}</code></span>
                    {conn.syncPlugins && <Badge variant="indigo">Plugins</Badge>}
                    {conn.syncAgents && <Badge variant="purple">Agents</Badge>}
                    {conn.autoApprove && <Badge variant="green">Auto-Approve</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => syncConnection(conn.id)} disabled={syncing === conn.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs hover:bg-indigo-500/20 transition-colors disabled:opacity-50">
                    <RefreshCw className={`w-3 h-3 ${syncing === conn.id ? "animate-spin" : ""}`} />
                    {syncing === conn.id ? "Syncing..." : "Sync Now"}
                  </button>
                  <button onClick={() => toggleConnection(conn)}
                    className="p-1.5 rounded bg-[#111118] text-[#55556a] hover:text-[#e2e2ea]"
                    title={conn.isActive ? "Deactivate" : "Activate"}>
                    {conn.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteConnection(conn.id)}
                    className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {conn.lastSyncAt && (
                <div className="text-xs text-[#55556a]">
                  Last synced: {new Date(conn.lastSyncAt).toLocaleString()}
                  {conn.createdBy && ` · Added by ${conn.createdBy.username}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
