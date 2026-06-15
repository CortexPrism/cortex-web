"use client";

import { useState } from "react";
import { PublishForm } from "@/components/marketplace/PublishForm";
import { GitHubImportForm } from "@/components/marketplace/GitHubImportForm";
import { FileText, GitBranch } from "lucide-react";

export default function PublishAgentPage() {
  const [mode, setMode] = useState<"form" | "github">("form");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e2e2ea] mb-2">Publish an Agent</h1>
        <p className="text-[#9090a8]">
          Share your agent configuration with the CortexPrism community.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode("form")}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
            mode === "form"
              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              : "bg-[#111118] text-[#9090a8] border border-[rgba(255,255,255,0.07)]"
          }`}>
          <FileText className="w-4 h-4" /> Manual Form
        </button>
        <button onClick={() => setMode("github")}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
            mode === "github"
              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              : "bg-[#111118] text-[#9090a8] border border-[rgba(255,255,255,0.07)]"
          }`}>
          <GitBranch className="w-4 h-4" /> GitHub Import
        </button>
      </div>

      {mode === "form" ? <PublishForm type="agent" /> : <GitHubImportForm type="agent" />}
    </div>
  );
}
