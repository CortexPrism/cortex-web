import { Link } from "@/i18n/routing";
import { Badge } from "@/components/shared/Badge";
import { formatDate } from "@/lib/utils";
import { Calendar, User, ArrowRight } from "lucide-react";

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    tags: string[];
    publishedAt: string | null;
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
  const authorName = post.author?.displayName || post.author?.username || "CortexPrism";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block glass-card rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.07)] hover:border-indigo-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5"
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
      <div className="p-5">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant={tagColor(tag)}>{tag}</Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="default">+{post.tags.length - 3}</Badge>
            )}
          </div>
        )}

        <h3 className="text-lg font-semibold text-[#e2e2ea] group-hover:text-indigo-400 transition-colors mb-2 leading-snug">
          {post.title}
        </h3>

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
          </div>
          <ArrowRight className="w-4 h-4 text-[#55556a] group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
