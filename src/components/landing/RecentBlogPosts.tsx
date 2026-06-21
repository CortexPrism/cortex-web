import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { BlogCard } from "@/components/blog/BlogCard";
import { ArrowRight } from "lucide-react";

export async function RecentBlogPosts() {
  const rawPosts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      author: { select: { username: true, avatar: true, displayName: true } },
    },
  });

  const posts = rawPosts.map((p) => ({
    ...p,
    tags: JSON.parse(p.tags) as string[],
    publishedAt: p.publishedAt?.toISOString() ?? null,
  }));

  if (posts.length === 0) return null;

  return (
    <section className="py-24" aria-label="Recent blog posts">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              From the Blog
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#e2e2ea]">
              Latest{" "}
              <span className="gradient-text">posts &amp; updates</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all posts
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all posts
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
