"use client";

import { useTranslations } from "next-intl";
import { Star, Puzzle, Bot, Download } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface StatsBarProps {
  githubStars: number;
  pluginCount: number;
  agentCount: number;
  totalDownloads: number;
}

const statKeys = ["statsGitHubStars", "statsPlugins", "statsAgentConfigs", "statsDownloads"] as const;

const statIcons = [Star, Puzzle, Bot, Download] as const;

export function StatsBar({ githubStars, pluginCount, agentCount, totalDownloads }: StatsBarProps) {
  const t = useTranslations("home");

  const values = [
    githubStars > 0 ? formatNumber(githubStars) : "—",
    String(pluginCount),
    String(agentCount),
    formatNumber(totalDownloads),
  ];

  return (
    <section className="relative border-y border-[rgba(255,255,255,0.07)] overflow-hidden">
      {/* Subtle gradient strip */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-[#111118] to-purple-500/5 pointer-events-none" />

      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-10 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statKeys.map((key, i) => {
            const Icon = statIcons[i];
            return (
              <div key={key} className="text-center group">
                {/* Icon badge */}
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-3 mx-auto transition-transform duration-200 group-hover:scale-110">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl md:text-3xl font-bold gradient-text">{values[i]}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-[#55556a]">{t(key)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
