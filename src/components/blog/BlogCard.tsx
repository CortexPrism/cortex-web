"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/shared/Badge";
import { formatDate, formatNumber } from "@/lib/utils";
import { Calendar, User, ArrowRight, Eye, Clock } from "lucide-react";
import { useRouter } from "@/i18n/routing";

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    tags: string[];
    publishedAt: string | null;
    viewCount?: number;
    readTime?: number;
    author: { username: string; avatar: string | null; displayName: string | null } | null;
  };
}

const accentColors = ["indigo", "purple", "green", "yellow", "red"] as const;

function tagColor(tag: string): (typeof accentColors)[number] {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return accentColors[Math.abs(hash) % accentColors.length];
}

export function BlogCard({ post }: BlogCardProps) {
  const t = useTranslations("components");
  const router = useRouter();
  const authorName = post.author?.displayName || post.author?.username || t("unknown");

  return (
    <div className="group relative glass-card rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.07)] hover:border-indigo-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
      <Link
        href={`/blog/${post.slug}`}
        className="block"
        aria-label={post.title}
      >
        {post.coverImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
      </Link>
      <div className="p-5">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/blog?tag=${encodeURIComponent(tag)}`);
                }}
                className="cursor-pointer"
              >
                <Badge variant={tagColor(tag)} className="hover:opacity-80 transition-opacity">{tag}</Badge>
              </button>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="default">+{post.tags.length - 3}</Badge>
            )}
          </div>
        )}

        <Link href={`/blog/${post.slug}`} className="block">
          <h3 className="text-lg font-semibold text-[#e2e2ea] group-hover:text-indigo-400 transition-colors mb-2 leading-snug">
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="text-sm text-[#9090a8] line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3 text-xs text-[#55556a]">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {authorName}
            </span>
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(post.publishedAt)}
              </span>
            )}
            {post.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime} {t("minRead")}
              </span>
            )}
            {post.viewCount !== undefined && post.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(post.viewCount)}
              </span>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-[#55556a] group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}
