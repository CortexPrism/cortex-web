"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface InstallCommandProps {
  type: "plugin" | "agent";
  slug: string;
  host?: string;
}

export function InstallCommand({ type, slug, host = "cortexprism.io" }: InstallCommandProps) {
  const [copied, setCopied] = useState(false);

  const command =
    type === "plugin"
      ? `cortex plugins install marketplace:${host}/plugins/${slug}`
      : `cortex agent import https://${host}/api/marketplace/agents/${slug}/download`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = command;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg p-3">
      <code className="flex-1 text-sm font-mono text-[#e2e2ea] truncate">
        <span className="text-[#55556a]">$ </span>
        {command}
      </code>
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-md hover:bg-[#18181f] transition-colors text-[#55556a] hover:text-[#e2e2ea]"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
