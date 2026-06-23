import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { generateAlternates } from "@/lib/seo";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { Badge } from "@/components/shared/Badge";
import { StarRating } from "@/components/shared/StarRating";
import { DownloadCount } from "@/components/shared/DownloadCount";
import { MapPin, Globe, Package, Bot, Download, Calendar, ExternalLink } from "lucide-react";

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
  });
  if (!user) return { title: "Profile Not Found" };

  const displayName = user.displayName || user.username;
  return {
    title: `${displayName} — CortexPrism Profile`,
    description: user.bio || `${displayName} on CortexPrism Marketplace`,
    openGraph: {
      title: `${displayName} — CortexPrism Profile`,
      description: user.bio || `${displayName}'s published plugins and agents`,
      url: `https://cortexprism.io/profile/${user.username}`,
    },
    twitter: {
      title: `${displayName} — CortexPrism Profile`,
      description: user.bio || `${displayName} on CortexPrism Marketplace`,
    },
    alternates: generateAlternates(`/profile/${user.username}`),
  };
}

function formatSocialLinks(links: string | null): Record<string, string> {
  try { return links ? JSON.parse(links) : {}; } catch { return {}; }
}

export default async function ProfilePage({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      plugins: {
        where: { status: "approved" },
        orderBy: { downloads: "desc" },
        take: 50,
        include: { category: true },
      },
      agents: {
        where: { status: "approved" },
        orderBy: { downloads: "desc" },
        take: 50,
        include: { category: true },
      },
    },
  });

  if (!user) notFound();

  const displayName = user.displayName || user.username;
  const totalDownloads = user.plugins.reduce((s, p) => s + p.downloads, 0) +
    user.agents.reduce((s, a) => s + a.downloads, 0);
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long",
  });
  const socialLinks = formatSocialLinks(user.socialLinks);
  const hasContent = user.plugins.length > 0 || user.agents.length > 0;

  const socialPlatforms: Record<string, { label: string; icon: string; url: string }> = {
    twitter: { label: "Twitter / X", icon: "𝕏", url: "" },
    github: { label: "GitHub", icon: "⌘", url: "" },
    discord: { label: "Discord", icon: "◆", url: "" },
    linkedin: { label: "LinkedIn", icon: "▣", url: "" },
  };

  return (
    <div className="max-w-page-narrow mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12">
      {/* Profile header */}
      <div className="glass-card p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shrink-0">
            {user.username[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#e2e2ea]">{displayName}</h1>
                <p className="text-[#9090a8]">@{user.username}{user.role === "admin" && <Badge variant="indigo" className="ml-2">Admin</Badge>}</p>
              </div>
              <ProfileActions username={params.username} />
            </div>

            {user.bio && <p className="text-[#e2e2ea] mt-3">{user.bio}</p>}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-[#55556a]">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined {joinedDate}</span>
              {user.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{user.location}</span>}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300">
                  <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Social links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  const info = socialPlatforms[platform];
                  const href = platform === "discord" ? null : url;
                  const content = (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111118] text-xs text-[#9090a8] border border-[rgba(255,255,255,0.07)] hover:text-[#e2e2ea] transition-colors">
                      <span>{info?.icon || "•"}</span>
                      <span>{info?.label || platform}</span>
                    </span>
                  );
                  return href
                    ? <a key={platform} href={href} target="_blank" rel="noopener noreferrer">{content}</a>
                    : <span key={platform} title={url}>{content}</span>;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[rgba(255,255,255,0.07)]">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#e2e2ea]">{user.plugins.length}</div>
            <div className="text-xs text-[#55556a] flex items-center justify-center gap-1 mt-1"><Package className="w-3 h-3" /> Plugins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#e2e2ea]">{user.agents.length}</div>
            <div className="text-xs text-[#55556a] flex items-center justify-center gap-1 mt-1"><Bot className="w-3 h-3" /> Agents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#e2e2ea]">{totalDownloads.toLocaleString()}</div>
            <div className="text-xs text-[#55556a] flex items-center justify-center gap-1 mt-1"><Download className="w-3 h-3" /> Downloads</div>
          </div>
        </div>
      </div>

      {/* Published content */}
      <h2 className="text-xl font-bold text-[#e2e2ea] mb-6">Published Content</h2>

      {!hasContent ? (
        <div className="glass-card p-12 text-center">
          <p className="text-[#55556a]">No published plugins or agents yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {user.plugins.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-[#e2e2ea]">Plugins ({user.plugins.length})</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {user.plugins.map(p => (
                  <Link key={p.id} href={`/marketplace/plugins/${p.slug}`}
                    className="glass-card-hover p-4">
                    <div className="font-medium text-[#e2e2ea]">{p.name}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#55556a]">
                      <Badge variant="default">{p.kind}</Badge>
                      <span>v{p.version}</span>
                      {p.category && <span>· {p.category.name}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#55556a]">
                      <StarRating rating={p.rating} />
                      <DownloadCount count={p.downloads} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {user.agents.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-[#e2e2ea]">Agents ({user.agents.length})</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {user.agents.map(a => (
                  <Link key={a.id} href={`/marketplace/agents/${a.slug}`}
                    className="glass-card-hover p-4">
                    <div className="font-medium text-[#e2e2ea]">{a.name}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#55556a]">
                      {a.provider && <Badge variant="default">{a.provider}</Badge>}
                      <span>v{a.version}</span>
                      {a.category && <span>· {a.category.name}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#55556a]">
                      <StarRating rating={a.rating} />
                      <DownloadCount count={a.downloads} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
