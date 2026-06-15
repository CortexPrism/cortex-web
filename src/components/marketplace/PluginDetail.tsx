"use client";

import { Badge } from "@/components/shared/Badge";
import { DownloadCount } from "@/components/shared/DownloadCount";
import { StarRating } from "@/components/shared/StarRating";
import { InstallCommand } from "@/components/marketplace/InstallCommand";
import { ScreenshotGallery } from "@/components/marketplace/ScreenshotGallery";
import { ReviewSection } from "@/components/marketplace/ReviewSection";
import { formatDate, formatNumber } from "@/lib/utils";
import {
  Globe, Github, User, ExternalLink, Star, GitFork, Tag, Settings, Zap, Award
} from "lucide-react";

interface Screenshot {
  url: string;
  alt: string | null;
}

interface PluginDetailData {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  kind: string;
  entryPoint: string;
  capabilities: string[];
  tags: string[];
  author: string | null;
  authorUrl: string | null;
  homepage: string | null;
  repository: string | null;
  license: string | null;
  icon: string | null;
  readme: string | null;
  downloads: number;
  rating: number;
  githubStars: number;
  githubForks: number;
  githubTopics: string[];
  category: string | null;
  screenshots: Screenshot[];
  createdAt: string;
  updatedAt: string;
}

interface PluginDetailProps {
  plugin: PluginDetailData;
}

const kindColors: Record<string, "indigo" | "green" | "purple"> = {
  esm: "indigo",
  mcp: "green",
  wasm: "purple",
};

export function PluginDetailView({ plugin }: PluginDetailProps) {
  return (
    <div>
      <div className="glass-card p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-6">
          <div className="w-12 md:w-14 h-12 md:h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
            {plugin.icon ? (
              <img src={plugin.icon} alt="" className="w-8 md:w-10 h-8 md:h-10 rounded-lg" />
            ) : (
              <span className="text-indigo-400 font-bold">{plugin.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-[#e2e2ea]">{plugin.name}</h1>
              <Badge variant={kindColors[plugin.kind] || "default"}>{plugin.kind.toUpperCase()}</Badge>
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs md:text-sm font-mono text-[#55556a]">v{plugin.version}</span>
              {plugin.license && (
                <Badge variant="default">{plugin.license}</Badge>
              )}
            </div>
            <p className="text-sm md:text-base text-[#9090a8]">{plugin.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
          <StarRating rating={plugin.rating} />
          <DownloadCount count={plugin.downloads} />
          {plugin.author && (
            <span className="flex items-center gap-1 text-[#55556a]">
              <User className="w-3.5 h-3.5" />
              {plugin.authorUrl ? (
                <a href={plugin.authorUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">{plugin.author}</a>
              ) : plugin.author}
            </span>
          )}
          {plugin.category && (
            <Badge variant="default">{plugin.category}</Badge>
          )}
        </div>

        {(plugin.githubStars > 0 || plugin.githubForks > 0) && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {plugin.githubStars > 0 && (
              <span className="flex items-center gap-1 text-sm text-[#9090a8]">
                <Star className="w-4 h-4 text-yellow-400" /> {formatNumber(plugin.githubStars)} stars
              </span>
            )}
            {plugin.githubForks > 0 && (
              <span className="flex items-center gap-1 text-sm text-[#9090a8]">
                <GitFork className="w-4 h-4 text-indigo-400" /> {formatNumber(plugin.githubForks)} forks
              </span>
            )}
          </div>
        )}

        {plugin.githubTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {plugin.githubTopics.map((t) => (
              <Badge key={t} variant="default">{t}</Badge>
            ))}
          </div>
        )}

        <div className="mb-6">
          <p className="text-xs text-[#55556a] mb-2">Install Command</p>
          <InstallCommand type="plugin" slug={plugin.slug} />
        </div>

        <div className="flex flex-wrap gap-4 text-sm items-center">
          {plugin.homepage && (
            <a href={plugin.homepage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
              <Globe className="w-3.5 h-3.5" /> Website
            </a>
          )}
          {plugin.repository && (
            <a href={plugin.repository} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
              <Github className="w-3.5 h-3.5" /> Repository
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          )}
          {plugin.license && (
            <span className="text-[#55556a]">License: {plugin.license}</span>
          )}
          <span className="text-[#55556a]">Entry: {plugin.entryPoint}</span>
        </div>
      </div>

      <ScreenshotGallery screenshots={plugin.screenshots} showThumbnails />

      {/* Configuration Section */}
      {(plugin.kind || plugin.entryPoint || plugin.license) && (
        <div className="glass-card p-8 mb-8">
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" /> Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plugin.kind && (
              <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
                <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">Plugin Type</div>
                <div className="text-base font-semibold text-[#e2e2ea]">
                  <Badge variant={kindColors[plugin.kind] || "default"} className="inline-block">
                    {plugin.kind.toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}
            {plugin.entryPoint && (
              <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
                <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">Entry Point</div>
                <div className="text-sm font-mono text-indigo-400">{plugin.entryPoint}</div>
              </div>
            )}
            {plugin.license && (
              <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
                <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">License</div>
                <div className="text-base font-semibold text-[#e2e2ea]">{plugin.license}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {plugin.capabilities.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" /> Capabilities
          </h2>
          <div className="flex flex-wrap gap-2">
            {plugin.capabilities.map((cap) => (
              <Badge key={cap} variant="indigo">{cap}</Badge>
            ))}
          </div>
        </div>
      )}

      {plugin.tags.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-400" /> Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {plugin.tags.map((tag) => (
              <Badge key={tag} variant="default">{tag}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="glass-card p-6 md:p-8 mb-8">
        <h2 className="text-lg font-semibold text-[#e2e2ea] mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" /> Statistics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
            <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">Downloads</div>
            <div className="text-2xl font-bold gradient-text">{formatNumber(plugin.downloads)}</div>
          </div>
          <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
            <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">Rating</div>
            <div className="text-2xl font-bold text-yellow-400">{plugin.rating.toFixed(1)}</div>
            <div className="text-xs text-[#55556a]">/ 5.0</div>
          </div>
          <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
            <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">Version</div>
            <div className="text-xl font-bold text-[#e2e2ea] font-mono">v{plugin.version}</div>
          </div>
          <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
            <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">Published</div>
            <div className="text-sm text-[#9090a8]">{formatDate(plugin.createdAt)}</div>
          </div>
        </div>
      </div>

      <ReviewSection itemId={plugin.id} type="plugin" />

      {plugin.readme && (
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-4">README</h2>
          <div className="prose prose-invert max-w-none prose-p:text-[#9090a8] prose-strong:text-[#e2e2ea] prose-code:text-[#e2e2ea]">
            {plugin.readme.split("\n").map((line, i) => (
              <p key={i} className="text-sm text-[#9090a8]">{line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-xs text-[#55556a]">
          Published {formatDate(plugin.createdAt)} &middot; Updated {formatDate(plugin.updatedAt)}
        </p>
      </div>
    </div>
  );
}
