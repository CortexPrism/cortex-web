import { prisma } from "@/lib/prisma";

export async function getKbArticleBySlug(slug: string) {
  return prisma.knowledgeBaseArticle.findUnique({ where: { slug } });
}

export async function getAllKbArticles(params?: {
  publishedOnly?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { publishedOnly = true, page = 1, limit = 20, search } = params || {};
  const where: Record<string, unknown> = {};
  if (publishedOnly) where.published = true;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.knowledgeBaseArticle.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.knowledgeBaseArticle.count({ where }),
  ]);

  return { articles, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getKbArticleById(id: string) {
  return prisma.knowledgeBaseArticle.findUnique({ where: { id } });
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
