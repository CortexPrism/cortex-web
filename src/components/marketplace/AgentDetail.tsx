"use client";

import { Badge } from "@/components/shared/Badge";
import { DownloadCount } from "@/components/shared/DownloadCount";
import { StarRating } from "@/components/shared/StarRating";
import { InstallCommand } from "@/components/marketplace/InstallCommand";
import { ScreenshotGallery } from "@/components/marketplace/ScreenshotGallery";
import { ReviewSection } from "@/components/marketplace/ReviewSection";
import { formatDate, formatNumber } from "@/lib/utils";
import {
  Github, User, Brain, Thermometer, Globe, ExternalLink, Star, GitFork,
  Tag, Wrench, Settings, Award
} from "lucide-react";

interface Screenshot {
  url: string;
  alt: string | null;
}

interface AgentDetailData {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  provider: string | null;
  model: string | null;
  temperature: number | null;
  tools: string[];
  tags: string[];
  systemPrompt: string | null;
  soulContent: string | null;
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

interface AgentDetailProps {
  agent: AgentDetailData;
}

export function AgentDetailView({ agent }: AgentDetailProps) {
  return (
    <div>
      <div className="glass-card p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-6">
          <div className="w-12 md:w-14 h-12 md:h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
            {agent.icon ? (
              <img src={agent.icon} alt="" className="w-8 md:w-10 h-8 md:h-10 rounded-lg" />
            ) : (
              <span className="text-purple-400 font-bold">{agent.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-[#e2e2ea]">{agent.name}</h1>
              {agent.provider && <Badge variant="indigo">{agent.provider}</Badge>}
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs md:text-sm font-mono text-[#55556a]">v{agent.version}</span>
              {agent.license && <Badge variant="default">{agent.license}</Badge>}
            </div>
            <p className="text-sm md:text-base text-[#9090a8]">{agent.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
          <StarRating rating={agent.rating} />
          <DownloadCount count={agent.downloads} />
          {agent.author && (
            <span className="flex items-center gap-1 text-[#55556a]">
              <User className="w-3.5 h-3.5" />
              {agent.authorUrl ? (
                <a href={agent.authorUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">{agent.author}</a>
              ) : agent.author}
            </span>
          )}
          {agent.model && (
            <span className="flex items-center gap-1 text-[#55556a]">
              <Brain className="w-3.5 h-3.5" />
              {agent.model}
            </span>
          )}
          {agent.temperature !== null && (
            <span className="flex items-center gap-1 text-[#55556a]">
              <Thermometer className="w-3.5 h-3.5" />
              temp: {agent.temperature}
            </span>
          )}
          {agent.category && <Badge variant="default">{agent.category}</Badge>}
        </div>

        {(agent.githubStars > 0 || agent.githubForks > 0) && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {agent.githubStars > 0 && (
              <span className="flex items-center gap-1 text-sm text-[#9090a8]">
                <Star className="w-4 h-4 text-yellow-400" /> {formatNumber(agent.githubStars)} stars
              </span>
            )}
            {agent.githubForks > 0 && (
              <span className="flex items-center gap-1 text-sm text-[#9090a8]">
                <GitFork className="w-4 h-4 text-indigo-400" /> {formatNumber(agent.githubForks)} forks
              </span>
            )}
          </div>
        )}

        {agent.githubTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {agent.githubTopics.map((t) => (
              <Badge key={t} variant="default">{t}</Badge>
            ))}
          </div>
        )}

        <div className="mb-6">
          <p className="text-xs text-[#55556a] mb-2">Install Command</p>
          <InstallCommand type="agent" slug={agent.slug} />
        </div>

        <div className="flex flex-wrap gap-4 text-sm items-center">
          {agent.homepage && (
            <a href={agent.homepage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
              <Globe className="w-3.5 h-3.5" /> Website
            </a>
          )}
          {agent.repository && (
            <a href={agent.repository} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
              <Github className="w-3.5 h-3.5" /> Repository
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          )}
          {agent.authorUrl && (
            <a href={agent.authorUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
              <User className="w-3.5 h-3.5" /> Author Profile
            </a>
          )}
        </div>
      </div>

      <ScreenshotGallery screenshots={agent.screenshots} />

      {agent.tags.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400" /> Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {agent.tags.map((tag) => (
              <Badge key={tag} variant="default">{tag}</Badge>
            ))}
          </div>
        </div>
      )}

      {agent.tools.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-purple-400" /> Tools
          </h2>
          <div className="flex flex-wrap gap-2">
            {agent.tools.map((tool) => (
              <Badge key={tool} variant="indigo">{tool}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Section */}
      {(agent.provider || agent.model || agent.temperature !== null) && (
        <div className="glass-card p-8 mb-8">
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" /> Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agent.provider && (
              <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
                <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">AI Provider</div>
                <div className="text-base font-semibold text-[#e2e2ea] flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  {agent.provider}
                </div>
              </div>
            )}
            {agent.model && (
              <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
                <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">Model</div>
                <div className="text-base font-semibold text-[#e2e2ea] font-mono">{agent.model}</div>
              </div>
            )}
            {agent.temperature !== null && (
              <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
                <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">Temperature</div>
                <div className="text-base font-semibold text-[#e2e2ea] flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  {agent.temperature}
                </div>
              </div>
            )}
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
            <div className="text-2xl font-bold gradient-text">{formatNumber(agent.downloads)}</div>
          </div>
          <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
            <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">Rating</div>
            <div className="text-2xl font-bold text-yellow-400">{agent.rating.toFixed(1)}</div>
            <div className="text-xs text-[#55556a]">/ 5.0</div>
          </div>
          <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
            <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">Version</div>
            <div className="text-xl font-bold text-[#e2e2ea] font-mono">v{agent.version}</div>
          </div>
          <div className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
            <div className="text-xs font-semibold text-[#55556a] uppercase tracking-wide mb-2">Published</div>
            <div className="text-sm text-[#9090a8]">{formatDate(agent.createdAt)}</div>
          </div>
        </div>
      </div>

      {agent.systemPrompt && (
        <div className="glass-card p-8 mb-8">
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-4">System Prompt</h2>
          <div className="bg-[#0a0a0f] rounded-lg p-4 border border-[rgba(255,255,255,0.07)]">
            <pre className="text-sm text-[#9090a8] font-mono whitespace-pre-wrap">{agent.systemPrompt}</pre>
          </div>
        </div>
      )}

      <ReviewSection itemId={agent.id} type="agent" />

      {agent.readme && (
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-[#e2e2ea] mb-4">README</h2>
          <div className="text-sm text-[#9090a8] whitespace-pre-wrap">{agent.readme}</div>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-xs text-[#55556a]">
          Published {formatDate(agent.createdAt)} &middot; Updated {formatDate(agent.updatedAt)}
        </p>
      </div>
    </div>
  );
}
