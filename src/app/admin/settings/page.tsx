"use client";

import { useEffect, useState } from "react";
import { Save, Key, CheckCircle, XCircle, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/shared/Button";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [tokenValue, setTokenValue] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/settings", { headers: { authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setSettings(data.settings || {});
        setTokenValue(data.settings?.github_token || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const saveToken = async () => {
    if (!token) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ key: "github_token", value: tokenValue || null }),
    });
    if (res.ok) {
      setSettings(prev => ({ ...prev, github_token: tokenValue }));
      setMessage({ type: "success", text: "GitHub token saved" });
    } else {
      setMessage({ type: "error", text: "Failed to save token" });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 4000);
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

          {/* Scanner info */}
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
                <span className="text-[#55556a]">
                  {typeof window !== "undefined" ? "Runtime only" : "Checking..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
