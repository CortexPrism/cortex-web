import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getKbArticleBySlug = cache(async function getKbArticleBySlug(slug: string) {
  const article = await prisma.knowledgeBaseArticle.findUnique({ where: { slug } });
  if (!article) return null;
  return { ...article, tags: JSON.parse(article.tags) as string[] };
});

export async function getAllKbArticles(params?: {
  publishedOnly?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
  section?: string;
}) {
  const { publishedOnly = true, page = 1, limit = 20, search, tag, section } = params || {};
  const where: Record<string, unknown> = {};
  if (publishedOnly) where.published = true;
  if (section) where.section = section;
  if (search) {
    where.AND = [
      {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
        ],
      },
    ];
  }
  if (tag) {
    where.tags = { contains: tag };
  }

  const [articles, total] = await Promise.all([
    prisma.knowledgeBaseArticle.findMany({
      where,
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { username: true, avatar: true, displayName: true } },
      },
    }),
    prisma.knowledgeBaseArticle.count({ where }),
  ]);

  return {
    articles: articles.map((a) => ({ ...a, tags: JSON.parse(a.tags) as string[] })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getKbSections() {
  const sections = await prisma.knowledgeBaseArticle.groupBy({
    by: ["section"],
    _count: true,
  });
  return sections.map((s) => ({ section: s.section, count: s._count }));
}

export async function getKbArticleById(id: string) {
  const article = await prisma.knowledgeBaseArticle.findUnique({
    where: { id },
    include: {
      author: { select: { username: true, avatar: true, displayName: true } },
      comments: {
        include: {
          author: { select: { username: true, avatar: true, displayName: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!article) return null;
  return { ...article, tags: JSON.parse(article.tags) as string[] };
}

export async function getKbSlugs() {
  const articles = await prisma.knowledgeBaseArticle.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return articles.map((a) => a.slug);
}

export async function getKbStats() {
  const [total, published, drafts] = await Promise.all([
    prisma.knowledgeBaseArticle.count(),
    prisma.knowledgeBaseArticle.count({ where: { published: true } }),
    prisma.knowledgeBaseArticle.count({ where: { published: false } }),
  ]);
  return { total, published, drafts };
}

export async function getAllKbTags(publishedOnly = true): Promise<string[]> {
  const where = publishedOnly ? { published: true } : {};
  const articles = await prisma.knowledgeBaseArticle.findMany({
    where,
    select: { tags: true },
  });
  const tagSet = new Set<string>();
  for (const a of articles) {
    const parsed = JSON.parse(a.tags) as string[];
    parsed.forEach((t) => tagSet.add(t));
  }
  return Array.from(tagSet).sort();
}

export async function incrementKbViewCount(slug: string) {
  try {
    await prisma.knowledgeBaseArticle.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // silently fail if article doesn't exist
  }
}

export async function getKbArticleComments(slug: string) {
  const article = await prisma.knowledgeBaseArticle.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!article) return [];

  return prisma.kbArticleComment.findMany({
    where: { articleId: article.id },
    include: {
      author: { select: { username: true, avatar: true, displayName: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createKbArticleComment(params: {
  slug: string;
  userId?: string;
  content: string;
}) {
  const article = await prisma.knowledgeBaseArticle.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });
  if (!article) throw new Error("Article not found");

  return prisma.kbArticleComment.create({
    data: {
      articleId: article.id,
      userId: params.userId || null,
      content: params.content,
    },
    include: {
      author: { select: { username: true, avatar: true, displayName: true } },
    },
  });
}

export async function deleteKbArticleComment(commentId: string) {
  return prisma.kbArticleComment.delete({ where: { id: commentId } });
}
