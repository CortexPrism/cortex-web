"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { GitBranch, ExternalLink, CheckCircle, Loader } from "lucide-react";

interface GitHubImportFormProps {
  type: "plugin" | "agent";
}

export function GitHubImportForm({ type }: GitHubImportFormProps) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    success: boolean; type?: string;
    plugin?: { id: string; name: string; slug: string; status: string };
    agent?: { id: string; name: string; slug: string; status: string };
  } | null>(null);
  const [autoApprove, setAutoApprove] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/marketplace/import", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ repository: repoUrl, branch, autoApprove }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else if (res.status === 422) {
        setError(data.error + (data.hints ? "\n\n" + data.hints.join("\n") : ""));
      } else if (res.status === 409) {
        setError(`${data.error} — it may already be submitted.`);
      } else {
        setError(typeof data.error === "string" ? data.error : "Import failed");
      }
    } catch {
      setError("Connection error");
    }
    setLoading(false);
  };

  const inputClass = "w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50";

  if (result?.success) {
    const entity = result.plugin || result.agent;
    return (
      <div className="glass-card p-8 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
        <h2 className="text-xl font-bold text-[#e2e2ea] mb-2">Import Successful</h2>
        <p className="text-[#9090a8] mb-2">
          {result.type === "plugin" ? "Plugin" : "Agent"} <span className="text-[#e2e2ea] font-medium">{entity?.name}</span> has been imported.
        </p>
        <Badge variant={entity?.status === "approved" ? "green" : "yellow"}>
          {entity?.status === "approved" ? "Approved" : "Pending Review"}
        </Badge>
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => { setResult(null); setRepoUrl(""); }}
            className="text-sm text-indigo-400 hover:text-indigo-300">
            Import Another
          </button>
          <a href={`/dashboard`} className="text-sm text-[#55556a] hover:text-[#e2e2ea]">
            View Dashboard →
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <GitBranch className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-sm font-semibold text-[#e2e2ea]">Import from GitHub</h3>
          <p className="text-xs text-[#55556a]">
            Automatically import a {type} by providing its public GitHub repository URL.
            The manifest will be read from the repository root.
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3 whitespace-pre-wrap">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#e2e2ea] mb-1">Repository URL *</label>
        <input type="url" required value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
          className={inputClass} placeholder="https://github.com/owner/my-cortex-plugin"
        />
        <p className="text-xs text-[#55556a] mt-1">Public GitHub repository containing a cortex.json or manifest.json</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#e2e2ea] mb-1">Branch</label>
        <input type="text" value={branch} onChange={e => setBranch(e.target.value)}
          className={inputClass} placeholder="main"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[#e2e2ea] cursor-pointer">
        <input type="checkbox" checked={autoApprove}
          onChange={e => setAutoApprove(e.target.checked)}
          className="w-4 h-4 rounded border-[rgba(255,255,255,0.07)]" />
        Auto-approve (requires admin privileges)
      </label>

      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
        <p className="text-xs text-[#9090a8]">
          The importer will read the manifest from the repository root, fetch GitHub metadata (stars, topics, license),
          and create a submission. Required manifest fields: name, version, kind (esm/mcp/wasm) for plugins,
          or provider/model for agents.
        </p>
      </div>

      <Button type="submit" disabled={loading || !repoUrl}>
        {loading ? (
          <><Loader className="w-4 h-4 mr-1.5 animate-spin" /> Importing...</>
        ) : (
          <><ExternalLink className="w-4 h-4 mr-1.5" /> Import from GitHub</>
        )}
      </Button>
    </form>
  );
}
