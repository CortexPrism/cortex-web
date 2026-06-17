"use client";

import { useEffect, useState } from "react";
import { Save, Key, CheckCircle, XCircle, Eye, EyeOff, ExternalLink, Globe, Send } from "lucide-react";
import { Button } from "@/components/shared/Button";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [tokenValue, setTokenValue] = useState("");
  const [indexnowKey, setIndexnowKey] = useState("");
  const [showIndexnowKey, setShowIndexnowKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  const authHeaders = () => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return t ? { authorization: `Bearer ${t}` } : {};
  };

  useEffect(() => {
    const headers = authHeaders();
    if (!headers.authorization) { setLoading(false); return; }
    fetch("/api/admin/settings", { headers })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
        setSettings(data.settings || {});
        setTokenValue(data.settings?.github_token || "");
        setIndexnowKey(data.settings?.indexnow_api_key || "");
        setLoading(false);
      })
      .catch((e) => { setMessage({ type: "error", text: "Failed to load: " + e.message }); setLoading(false); });
  }, []);

  const saveToken = async () => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ key: "github_token", value: tokenValue || null }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setSettings(prev => ({ ...prev, github_token: tokenValue }));
      setMessage({ type: "success", text: "GitHub token saved" });
    } else if (res.status === 403) {
      setMessage({ type: "error", text: "Session expired — log out and log back in, then try again" });
    } else {
      setMessage({ type: "error", text: data.error || `Failed (HTTP ${res.status})` });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 4000);
  };

  const saveIndexnowKey = async () => {
    if (!indexnowKey) {
      setMessage({ type: "error", text: "Please enter an API key" });
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    const headers = authHeaders();
    if (!headers.authorization) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/indexnow", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ key: indexnowKey }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setSettings(prev => ({ ...prev, indexnow_api_key: indexnowKey }));
      setMessage({ type: "success", text: "IndexNow API key saved" });
    } else if (res.status === 403) {
      setMessage({ type: "error", text: "Session expired — log out and log back in, then try again" });
    } else {
      setMessage({ type: "error", text: data.error || `Failed (HTTP ${res.status})` });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 4000);
  };

  const deleteIndexnowKey = async () => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/indexnow", { method: "DELETE", headers });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setIndexnowKey("");
      setSettings(prev => ({ ...prev, indexnow_api_key: null }));
      setMessage({ type: "success", text: "IndexNow API key removed" });
    } else {
      setMessage({ type: "error", text: data.error || `Failed (HTTP ${res.status})` });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 4000);
  };

  const triggerIndexNow = async () => {
    const headers = authHeaders();
    if (!headers.authorization) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch("/api/indexnow/submit", { method: "POST", headers });
      const data = await res.json();
      if (res.ok) {
        setSubmitResult(`Submitted ${data.urlCount || "?"} URLs: ${data.message}`);
      } else {
        setSubmitResult(`Error: ${data.error || data.message || `HTTP ${res.status}`}`);
      }
    } catch (e) {
      setSubmitResult(`Request failed: ${e}`);
    }
    setSubmitting(false);
    setTimeout(() => setSubmitResult(null), 8000);
  };

  const inputClass = "w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e2ea]">Settings</h1>
        <p className="text-[#9090a8] text-sm">Configure marketplace and GitHub integration settings</p>
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

      {loading ? (
        <div className="text-center py-12 text-[#55556a]">Loading...</div>
      ) : (
        <div className="max-w-2xl space-y-6">
          {/* GitHub Token */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Key className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#e2e2ea]">GitHub API Token</h2>
                <p className="text-xs text-[#55556a]">
                  Required for topic scanning. Without it, GitHub API rate limits severely restrict search results
                  (60 req/hr unauthenticated vs 5,000 req/hr authenticated).
                </p>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm text-[#e2e2ea] mb-1.5">Personal Access Token</label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={tokenValue}
                  onChange={e => setTokenValue(e.target.value)}
                  className={inputClass + " pr-10 font-mono text-xs"}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#55556a] hover:text-[#e2e2ea]"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-[#55556a] space-y-1 mb-4">
              <p>Create a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5">
                github.com/settings/tokens <ExternalLink className="w-3 h-3" />
              </a></p>
              <p>Required scopes: <code className="text-indigo-400">public_repo</code> (for searching repos and reading contents)</p>
              <p>No <code className="text-indigo-400">admin</code> or <code className="text-indigo-400">write</code> scopes needed.</p>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveToken} disabled={saving}>
                <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving..." : "Save Token"}
              </Button>
            </div>
          </div>

          {/* IndexNow SEO */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#e2e2ea]">IndexNow API</h2>
                <p className="text-xs text-[#55556a]">
                  Instantly notify Bing, Yandex, and Seznam when content changes.
                  API requests are rate-limited to ~100 URLs per submission.
                  <a href="https://www.bing.com/indexnow" target="_blank" rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 ml-1 inline-flex items-center gap-0.5">
                    Learn more <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </div>

            {settings._env_indexnow_api_key === "set" && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Key is configured via <code className="text-emerald-400 font-mono">INDEXNOW_API_KEY</code> environment variable.
                No further configuration needed.
              </div>
            )}

            <div className="mb-3">
              <label className="block text-sm text-[#e2e2ea] mb-1.5">API Key</label>
              <div className="relative">
                <input
                  type={showIndexnowKey ? "text" : "password"}
                  value={indexnowKey}
                  onChange={e => setIndexnowKey(e.target.value)}
                  className={inputClass + " pr-10 font-mono text-xs"}
                  placeholder="Generate with: openssl rand -hex 16"
                  disabled={settings._env_indexnow_api_key === "set"}
                />
                <button
                  onClick={() => setShowIndexnowKey(!showIndexnowKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#55556a] hover:text-[#e2e2ea]"
                >
                  {showIndexnowKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-[#55556a] space-y-1 mb-4">
              <p>Once saved, the key is served at <code className="text-emerald-400">{typeof window !== "undefined" ? window.location.origin : ""}/indexnow-key.txt</code></p>
              <p>Required for IndexNow protocol ownership verification. Keep this key secret.</p>
            </div>

            {settings._env_indexnow_api_key !== "set" && (
              <div className="flex items-center gap-3 mb-4">
                <Button onClick={saveIndexnowKey} disabled={saving}>
                  <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving..." : "Save Key"}
                </Button>
                {indexnowKey && (
                  <Button onClick={deleteIndexnowKey} disabled={saving} className="!bg-red-500/20 !text-red-300 hover:!bg-red-500/30">
                    Remove Key
                  </Button>
                )}
              </div>
            )}

            <div className="border-t border-[rgba(255,255,255,0.07)] pt-4">
              <h3 className="text-sm font-medium text-[#e2e2ea] mb-2">Manual Submission</h3>
              <p className="text-xs text-[#55556a] mb-3">
                Submit all site URLs (pages, docs, plugins, agents) to IndexNow search engines.
                Approved submissions are also sent automatically.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  onClick={triggerIndexNow}
                  disabled={submitting || (settings._env_indexnow_api_key !== "set" && !indexnowKey)}
                >
                  <Send className="w-4 h-4 mr-1.5" /> {submitting ? "Submitting..." : "Submit All URLs"}
                </Button>
                {submitResult && (
                  <span className={`text-xs ${submitResult.startsWith("Error") || submitResult.startsWith("Request failed") ? "text-red-400" : "text-green-400"}`}>
                    {submitResult}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-[#e2e2ea] mb-2">How Topic Scanning Works</h2>
            <div className="text-sm text-[#55556a] space-y-2">
              <p>The scanner searches GitHub for repositories tagged with Cortex-related topics defined in the
              <a href="https://cortexprism.io/docs/developer-guide/submission-standards" target="_blank" rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 ml-1">
                submission standards
              </a>:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><code className="text-indigo-400">cortex-plugin</code> — Primary topic for all plugins</li>
                <li><code className="text-indigo-400">cortex-agent</code> — Primary topic for agents</li>
                <li><code className="text-indigo-400">cortexprism</code> — General ecosystem tag</li>
                <li>Plugin types: <code className="text-indigo-400">esm</code>, <code className="text-indigo-400">mcp</code>, <code className="text-indigo-400">wasm</code></li>
                <li>Categories: <code className="text-indigo-400">development</code>, <code className="text-indigo-400">data-processing</code>, <code className="text-indigo-400">security</code>, etc.</li>
              </ul>
              <p className="mt-2">Each discovered repo is checked for a manifest (<code className="text-indigo-400">cortex.json</code>, <code className="text-indigo-400">manifest.json</code>) and classified as a plugin or agent before import.</p>
            </div>
          </div>

          {/* Current settings status */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-[#e2e2ea] mb-3">Current Configuration</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[#9090a8]">GitHub Token</span>
                <span className={settings.github_token ? "text-green-400" : "text-red-400"}>
                  {settings.github_token ? "Configured" : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[#9090a8]">Environment Variable (GITHUB_TOKEN)</span>
                <span className={settings._env_github_token === "set" ? "text-green-400" : "text-red-400"}>
                  {settings._env_github_token === "set" ? "Configured" : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[#9090a8]">IndexNow API Key</span>
                <span className={settings.indexnow_api_key ? "text-green-400" : "text-red-400"}>
                  {settings.indexnow_api_key ? "Configured" : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#9090a8]">Environment Variable (INDEXNOW_API_KEY)</span>
                <span className={settings._env_indexnow_api_key === "set" ? "text-green-400" : "text-red-400"}>
                  {settings._env_indexnow_api_key === "set" ? "Configured" : "Not set"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
