import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/shared/Badge";
import { formatDate } from "@/lib/utils";
import { ShareButton } from "@/components/shared/ShareButton";
import { getBlogShareText, SITE_URL } from "@/lib/share";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateBreadcrumbSchema,
  generateArticleSchema,
  generateMetaBase,
  generateAlternates,
} from "@/lib/seo";
import { MdxContent } from "@/components/docs/MdxContent";
import { BlogViewTracker } from "@/components/blog/BlogViewTracker";
import { formatNumber } from "@/lib/utils";
import { ArrowLeft, Calendar, User, Clock, Eye } from "lucide-react";

interface Props {
  params: { slug: string };
}

const accentColors = ["indigo", "purple", "green", "yellow", "red"] as const;

function tagColor(tag: string): (typeof accentColors)[number] {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return accentColors[Math.abs(hash) % accentColors.length];
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, published: true },
    select: { title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true, createdAt: true, updatedAt: true },
  });

  if (!post) return { title: "Post Not Found" };

  const desc = post.excerpt
    ? post.excerpt.length > 160
      ? post.excerpt.slice(0, 157) + "..."
      : post.excerpt
    : `Read "${post.title}" — a blog post from the CortexPrism AI Agent Operating System.`;

  const base = generateMetaBase(`/blog/${post.slug}`);
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    ...base,
    title: `${post.title} — CortexPrism Blog`,
    description: desc,
    alternates: generateAlternates(`/blog/${post.slug}`),
    keywords: [
      post.title,
      "CortexPrism blog",
      "AI agent tutorial",
      "Agent OS guide",
      "open source AI agent",
      "LLM agent development",
    ],
    openGraph: {
      ...base.openGraph,
      title: `${post.title} — CortexPrism Blog`,
      description: desc,
      url,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
        : base.openGraph.images,
    },
    twitter: {
      ...base.twitter,
      title: `${post.title} — CortexPrism Blog`,
      description: desc,
      images: post.coverImage ? [post.coverImage] : base.twitter.images,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, published: true },
    include: {
      author: { select: { username: true, avatar: true, displayName: true, bio: true } },
    },
  });

  if (!post) notFound();

  const tags: string[] = JSON.parse(post.tags);
  const authorName = post.author?.displayName || post.author?.username || "CortexPrism";
  const readTime = estimateReadTime(post.content);

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt || post.title,
    url: `${SITE_URL}/blog/${post.slug}`,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    authorName,
  });

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={articleSchema} />

      <article className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12">
        <BlogViewTracker slug={post.slug} />
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[#9090a8] hover:text-[#e2e2ea] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {post.coverImage && (
          <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-8 border border-[rgba(255,255,255,0.07)]">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <header className="max-w-page-content mx-auto mb-8">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.map((tag: string) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                  <Badge variant={tagColor(tag)}>{tag}</Badge>
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-[#e2e2ea] mb-4 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-[#9090a8] mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#55556a] pb-6 border-b border-[rgba(255,255,255,0.07)]">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {authorName}
            </span>
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {readTime} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {formatNumber(post.viewCount)} {post.viewCount === 1 ? "view" : "views"}
            </span>
            <div className="ml-auto">
              <ShareButton
                url={`/blog/${post.slug}`}
                title={post.title}
                text={getBlogShareText(post.title, post.excerpt)}
                variant="ghost"
                size="sm"
              />
            </div>
          </div>
        </header>

        <div className="max-w-page-content mx-auto">
          <MdxContent content={post.content} />
        </div>

        <div className="max-w-page-content mx-auto mt-12 pt-8 border-t border-[rgba(255,255,255,0.07)]">
          {post.author && (
            <div className="flex items-center gap-4 p-5 rounded-xl bg-[#111118] border border-[rgba(255,255,255,0.07)]">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={authorName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-semibold text-lg">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-[#e2e2ea] font-medium">{authorName}</p>
                {post.author.bio && (
                  <p className="text-sm text-[#9090a8]">{post.author.bio}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
