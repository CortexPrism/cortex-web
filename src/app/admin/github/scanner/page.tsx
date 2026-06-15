"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, RefreshCw, ExternalLink, Star, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { CORTEX_TOPICS } from "@/lib/github-topic-scanner";

interface DiscoveredRepo {
  id: string; owner: string; repo: string; fullName: string;
  description: string | null; htmlUrl: string; stars: number;
  topics: string[]; repoKind: string | null;
  manifestFound: boolean; manifestData: Record<string, unknown> | null;
  importStatus: string; importedId: string | null; error: string | null;
}

interface Scan {
  id: string; topic: string; status: string; resultCount: number;
  importedCount: number; error: string | null;
  startedAt: string | null; completedAt: string | null;
  createdBy: { username: string } | null; createdAt: string;
  _count: { results: number };
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

export default function TopicScannerPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("cortex-plugin");
  const [authError, setAuthError] = useState(false);

  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [results, setResults] = useState<DiscoveredRepo[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsTotalPages, setResultsTotalPages] = useState(1);
  const [importFilter, setImportFilter] = useState("");
  const [importing, setImporting] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const fetchScans = useCallback(async () => {
    const headers = authHeaders();
    if (!headers.authorization) { setAuthError(true); setLoading(false); return; }
    setAuthError(false);
    setLoading(true);
    const res = await fetch("/api/admin/github-topic-scanner", { headers });
    if (res.ok) {
      const data = await res.json();
      setScans(data.scans || []);
    } else if (res.status === 403) {
      setAuthError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  const fetchResults = useCallback(async (scanId: string) => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    setResultsLoading(true);
    const params = new URLSearchParams({ page: String(resultsPage), limit: "20" });
    if (importFilter) params.set("importStatus", importFilter);
    const res = await fetch(`/api/admin/github-topic-scanner/${scanId}?${params}`, { headers });
    if (res.ok) {
      const data = await res.json();
      setResults(data.results || []);
      setResultsTotalPages(data.totalPages || 1);
    }
    setResultsLoading(false);
  }, [resultsPage, importFilter]);

  useEffect(() => {
    if (activeScanId) fetchResults(activeScanId);
  }, [activeScanId, fetchResults]);

  const triggerScan = async () => {
    const headers = authHeaders();
    if (!headers.authorization) { setAuthError(true); return; }
    setAuthError(false);
    setScanning(true);
    setImportMessage(null);
    const res = await fetch("/api/admin/github-topic-scanner", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ topic: selectedTopic }),
    });
    if (res.ok) {
      const data = await res.json();
      setImportMessage(`Scan complete: ${data.totalFound} repositories discovered`);
      fetchScans();
      setActiveScanId(data.scanId);
      setResultsPage(1);
    } else if (res.status === 403) {
      setImportMessage("Scan failed: Admin access required — your session may have expired. Try logging out and back in.");
      setAuthError(true);
    } else {
      const data = await res.json();
      setImportMessage(`Scan failed: ${data.error || res.statusText}`);
    }
    setScanning(false);
  };

  const importRepo = async (discoveredId: string, autoApprove: boolean) => {
    const headers = authHeaders();
    if (!headers.authorization || !activeScanId) return;
    setImporting(discoveredId);
    const res = await fetch(`/api/admin/github-topic-scanner/${activeScanId}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ discoveredId, autoApprove }),
    });
    if (res.ok) {
      fetchResults(activeScanId);
    }
    setImporting(null);
  };

  const importAllWithManifest = async () => {
    if (!activeScanId) return;
    const pending = results.filter(r => r.importStatus === "pending" && r.manifestFound);
    for (const r of pending) {
      await importRepo(r.id, false);
    }
  };

  const inputClass = "px-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea]";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e2ea]">GitHub Topic Scanner</h1>
        <p className="text-[#9090a8] text-sm">
          Discover repositories by scanning GitHub topics defined in the CortexPrism submission standards
        </p>
      </div>

      {authError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 bg-red-500/10 text-red-300 border border-red-500/20">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>Admin authentication failed. Your session may have expired — try logging out and back in.</span>
        </div>
      )}

      {importMessage && !authError && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
          importMessage.startsWith("Scan failed")
            ? "bg-red-500/10 text-red-300 border border-red-500/20"
            : "bg-green-500/10 text-green-300 border border-green-500/20"
        }`}>
          {importMessage.startsWith("Scan failed") ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {importMessage}
        </div>
      )}

      <div className="glass-card p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-[#55556a] mb-1">Cortex Topic</label>
            <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}
              className={inputClass + " w-48"}>
              {CORTEX_TOPICS.all.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <Button onClick={triggerScan} disabled={scanning}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Scanning..." : "Scan Topic"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {CORTEX_TOPICS.primary.map(t => (
            <button key={t} onClick={() => setSelectedTopic(t)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedTopic === t
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  : "bg-[#111118] text-[#55556a] border border-[rgba(255,255,255,0.07)] hover:text-[#e2e2ea]"
              }`}>{t}</button>
          ))}
          <span className="text-xs text-[#55556a] self-center">|</span>
          {CORTEX_TOPICS.pluginTypes.map(t => (
            <button key={t} onClick={() => setSelectedTopic(t)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedTopic === t
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  : "bg-[#111118] text-[#55556a] border border-[rgba(255,255,255,0.07)] hover:text-[#e2e2ea]"
              }`}>{t}</button>
          ))}
          <span className="text-xs text-[#55556a] self-center">|</span>
          {CORTEX_TOPICS.categories.slice(0, 4).map(t => (
            <button key={t} onClick={() => setSelectedTopic(t)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedTopic === t
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  : "bg-[#111118] text-[#55556a] border border-[rgba(255,255,255,0.07)] hover:text-[#e2e2ea]"
              }`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-[#e2e2ea] mb-3 uppercase tracking-wider">Scan History</h2>
          {loading ? (
            <div className="text-center py-8 text-[#55556a] text-sm">Loading...</div>
          ) : scans.length === 0 ? (
            <div className="glass-card p-6 text-center text-sm text-[#55556a]">No scans yet</div>
          ) : (
            <div className="space-y-2">
              {scans.map(s => (
                <button key={s.id} onClick={() => { setActiveScanId(s.id); setResultsPage(1); }}
                  className={`w-full text-left glass-card p-3 transition-colors ${
                    activeScanId === s.id ? "border-indigo-500/30" : ""
                  }`}>
                  <div className="flex items-center justify-between">
                    <Badge variant={s.status === "completed" ? "green" : s.status === "running" ? "yellow" : "red"}>
                      {s.status}
                    </Badge>
                    <span className="text-xs text-[#55556a]">{s.resultCount} found</span>
                  </div>
                  <div className="text-sm text-[#e2e2ea] mt-1 font-medium">{s.topic}</div>
                  <div className="text-xs text-[#55556a] mt-1">
                    {new Date(s.createdAt).toLocaleDateString()}
                    {s.createdBy && ` by ${s.createdBy.username}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {!activeScanId ? (
            <div className="glass-card p-12 text-center">
              <Search className="w-8 h-8 mx-auto mb-3 text-[#55556a]" />
              <p className="text-[#9090a8]">Select a scan or run a new one to see results</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#e2e2ea] uppercase tracking-wider">Discovered Repositories</h2>
                <div className="flex items-center gap-2">
                  <select value={importFilter} onChange={e => { setImportFilter(e.target.value); setResultsPage(1); }}
                    className={inputClass + " w-32 text-xs"}>
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="imported">Imported</option>
                    <option value="skipped">Skipped</option>
                    <option value="error">Error</option>
                  </select>
                  <button onClick={importAllWithManifest}
                    className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded text-xs hover:bg-indigo-500/20 transition-colors">
                    Import All (with manifest)
                  </button>
                </div>
              </div>

              {resultsLoading ? (
                <div className="text-center py-12 text-[#55556a]">Loading...</div>
              ) : results.length === 0 ? (
                <div className="glass-card p-8 text-center text-sm text-[#55556a]">No results found</div>
              ) : (
                <div className="space-y-2">
                  {results.map(r => (
                    <div key={r.id} className={`glass-card p-4 ${
                      r.importStatus === "imported" ? "border-green-500/20" :
                      r.importStatus === "error" ? "border-red-500/20" : ""
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <a href={r.htmlUrl} target="_blank" rel="noopener noreferrer"
                              className="font-medium text-[#e2e2ea] hover:text-indigo-400 flex items-center gap-1">
                              {r.fullName} <ExternalLink className="w-3 h-3" />
                            </a>
                            <Badge variant={
                              r.importStatus === "imported" ? "green" :
                              r.importStatus === "skipped" ? "yellow" :
                              r.importStatus === "error" ? "red" : "default"
                            }>{r.importStatus}</Badge>
                            {r.manifestFound && <Badge variant="indigo">manifest</Badge>}
                            {r.repoKind && r.repoKind !== "unknown" && <Badge variant="purple">{r.repoKind}</Badge>}
                          </div>
                          {r.description && <p className="text-sm text-[#55556a] mt-1 truncate">{r.description}</p>}
                          <div className="flex items-center gap-3 mt-2 text-xs text-[#55556a]">
                            <span className="flex items-center gap-1"><Star className="w-3 h-3" />{r.stars}</span>
                            <span>{r.topics.slice(0, 5).join(", ")}{r.topics.length > 5 ? "..." : ""}</span>
                          </div>
                          {r.error && <p className="text-xs text-red-400 mt-1">{r.error}</p>}
                        </div>
                        <div className="flex gap-1.5 ml-3 shrink-0">
                          {r.importStatus === "pending" && (
                            <>
                              <button onClick={() => importRepo(r.id, false)} disabled={importing === r.id}
                                className="px-2.5 py-1.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs hover:bg-indigo-500/20 transition-colors disabled:opacity-50">
                                {importing === r.id ? "..." : "Import"}
                              </button>
                              <button onClick={() => importRepo(r.id, true)} disabled={importing === r.id}
                                className="px-2.5 py-1.5 rounded bg-green-500/10 text-green-300 border border-green-500/20 text-xs hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                title="Import with auto-approve">
                                +Approve
                              </button>
                            </>
                          )}
                          {r.importedId && (
                            <Link href={`/marketplace/${r.repoKind === "agent" ? "agents" : "plugins"}/${r.importedId}`}
                              className="px-2.5 py-1.5 rounded bg-[#111118] text-[#55556a] text-xs hover:text-[#e2e2ea]">
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {resultsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button onClick={() => setResultsPage(p => Math.max(1, p - 1))} disabled={resultsPage === 1}
                    className="p-2 rounded-lg bg-[#111118] text-[#9090a8] disabled:opacity-50 border border-[rgba(255,255,255,0.07)]">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-[#55556a]">Page {resultsPage} of {resultsTotalPages}</span>
                  <button onClick={() => setResultsPage(p => Math.min(resultsTotalPages, p + 1))} disabled={resultsPage === resultsTotalPages}
                    className="p-2 rounded-lg bg-[#111118] text-[#9090a8] disabled:opacity-50 border border-[rgba(255,255,255,0.07)]">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
