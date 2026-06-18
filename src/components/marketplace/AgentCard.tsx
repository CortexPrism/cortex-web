import Link from "next/link";
import { Badge } from "@/components/shared/Badge";
import { DownloadCount } from "@/components/shared/DownloadCount";
import { StarRating } from "@/components/shared/StarRating";
import { cn } from "@/lib/utils";
import { Github, Star } from "lucide-react";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    slug: string;
    version: string;
    description: string;
    provider: string | null;
    model: string | null;
    author: string | null;
    downloads: number;
    rating: number;
    tags: string[];
    category: string | null;
    icon: string | null;
    repository: string | null;
    githubStars: number;
  };
  featured?: boolean;
}

const iconColors = [
  "from-violet-500 to-purple-600",
  "from-fuchsia-500 to-pink-600",
  "from-indigo-500 to-violet-600",
  "from-purple-500 to-fuchsia-600",
  "from-blue-500 to-indigo-600",
  "from-pink-500 to-rose-600",
];

function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return iconColors[Math.abs(h) % iconColors.length];
}

export function AgentCard({ agent, featured = false }: AgentCardProps) {
  return (
    <Link href={`/marketplace/agents/${agent.slug}`}>
      <div
        className={cn(
          "group relative h-full rounded-xl border transition-all duration-300",
          "flex flex-col",
          featured
            ? "border-indigo-500/30 bg-gradient-to-br from-[#18181f] via-[#111118] to-[#0f0f15] hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1"
            : "border-[rgba(255,255,255,0.07)] bg-[#111118] hover:border-[rgba(99,102,241,0.3)] hover:bg-[#18181f] hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5"
        )}
      >
        {featured && (
          <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-semibold text-white shadow-lg">
            Featured
          </div>
        )}
        <div className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          featured
            ? "bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent"
            : "bg-gradient-to-b from-violet-500/5 via-transparent to-transparent"
        )} />

        <div className="relative p-5 md:p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0",
                hashColor(agent.name)
              )}>
                {agent.icon ? (
                  <img src={agent.icon} alt={`${agent.name} icon`} className="w-6 h-6" />
                ) : (
                  agent.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm md:text-[15px] font-semibold text-[#e2e2ea] leading-tight group-hover:text-white transition-colors truncate">
                  {agent.name}
                </h3>
                <span className="text-xs text-[#55556a] font-mono">v{agent.version}</span>
              </div>
            </div>
            {agent.provider && (
              <Badge variant="indigo" className="flex-shrink-0">{agent.provider}</Badge>
            )}
          </div>

          <p className="text-sm text-[#9090a8] leading-relaxed line-clamp-2 mb-3 flex-1">
            {agent.description}
          </p>

          {agent.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {agent.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
              {agent.tags.length > 3 && (
                <span className="text-xs text-[#55556a] self-center">+{agent.tags.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-[#55556a] truncate">{agent.author || "Unknown"}</span>
              {agent.model && (
                <>
                  <span className="text-[#333]">&middot;</span>
                  <span className="text-xs text-[#55556a] truncate font-mono">{agent.model}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {agent.githubStars > 0 && (
                <span className="flex items-center gap-1 text-xs text-[#55556a]">
                  <Star className="w-3 h-3 text-yellow-400" />
                  {agent.githubStars}
                </span>
              )}
              <StarRating rating={agent.rating} />
              <DownloadCount count={agent.downloads} />
            </div>
          </div>

          {agent.repository && (
            <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
              <Github className="w-4 h-4 text-[#55556a]" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
