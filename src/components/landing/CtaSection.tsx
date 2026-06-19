"use client";

import Link from "next/link";
import { ArrowRight, Copy, Check } from "lucide-react";
import { useState } from "react";

function InstallCommand() {
  const [copied, setCopied] = useState(false);
  const cmd = "curl -fsSL https://cortexprism.io/install.sh | bash";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="glass-card p-1 relative group">
      <div className="bg-[#0a0a0f] rounded-xl p-4 border border-[rgba(255,255,255,0.05)] flex items-center gap-3">
        <pre className="flex-1 text-sm font-mono overflow-x-auto">
          <code>
            <span className="text-[#55556a]">$ </span>
            <span className="text-green-400">curl -fsSL https://cortexprism.io/install.sh</span>
            <span className="text-[#e2e2ea]"> | bash</span>
          </code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="shrink-0 p-2 rounded-lg text-[#55556a] hover:text-[#e2e2ea] hover:bg-[#18181f] transition-colors"
          title="Copy command"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export function CtaSection() {
  return (
    <section className="py-20">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
        <div className="glass-card p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

          <h2 className="text-3xl md:text-4xl font-bold text-[#e2e2ea] relative">
            Install in one line
          </h2>
          <p className="mt-4 text-lg text-[#9090a8] max-w-xl mx-auto relative">
            Works on Linux, macOS, Windows, and WSL. Ships as a single Deno binary — no Docker required to get started.
          </p>

          <div className="mt-8 max-w-2xl mx-auto relative">
            <InstallCommand />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 relative">
            <Link
              href="/getting-started"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg accent-gradient text-white hover:opacity-90 transition-opacity"
            >
              Setup Guide
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/install"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg border border-[rgba(255,255,255,0.15)] text-[#e2e2ea] hover:bg-[#111118] transition-colors"
            >
              Install Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
