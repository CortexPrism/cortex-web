"use client";

import { useState } from "react";

type Platform = "macos" | "linux" | "windows";

const platforms: { key: Platform; label: string }[] = [
  { key: "macos", label: "macOS" },
  { key: "linux", label: "Linux / WSL" },
  { key: "windows", label: "Windows" },
];

const commands: Record<Platform, { prompt: string; command: string }> = {
  macos: {
    prompt: "$",
    command: "curl -fsSL https://cortexprism.io/install.sh | bash",
  },
  linux: {
    prompt: "$",
    command: "curl -fsSL https://cortexprism.io/install.sh | bash",
  },
  windows: {
    prompt: "PS>",
    command: "iwr https://cortexprism.io/install.ps1 -useb | iex",
  },
};

export function InstallCommand() {
  const [platform, setPlatform] = useState<Platform>("macos");
  const { prompt, command } = commands[platform];

  return (
    <div className="mt-10 max-w-xl mx-auto">
      <div className="flex items-center justify-center gap-1 mb-3 p-1 rounded-lg bg-[#111118] border border-[rgba(255,255,255,0.06)] w-fit mx-auto">
        {platforms.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPlatform(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              platform === key
                ? "bg-indigo-500/20 text-indigo-300 shadow-sm"
                : "text-[#9090a8] hover:text-[#e2e2ea]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="relative rounded-xl p-px bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-indigo-500/10">
        <div className="bg-[#0d0d14] rounded-[11px] px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-red-500/70" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
            <div className="w-2 h-2 rounded-full bg-green-500/70" />
          </div>
          <pre className="flex-1 text-sm font-mono text-left select-all">
            <code>
              <span className="text-[#55556a]">{prompt} </span>
              <span className="text-green-400">{command}</span>
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
