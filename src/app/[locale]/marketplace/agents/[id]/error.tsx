"use client";

import { AlertTriangle } from "lucide-react";

export default function AgentDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-page-narrow mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-20">
      <div className="glass-card p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-[#e2e2ea] mb-2">Failed to load agent</h2>
        <p className="text-sm text-[#9090a8] mb-6">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
