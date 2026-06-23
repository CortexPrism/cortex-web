import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { createAuditLog } from "@/lib/audit";
import { getAllKbArticles, getKbStats, getAllKbTags, getKbSections } from "@/lib/knowledge-base";

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-/]+$/, "Slug must be lowercase alphanumeric with hyphens and slashes"),
  section: z.string().optional().default("knowledge-base"),
  content: z.string().min(1, "Content is required"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const section = searchParams.get("section") || undefined;

  const result = await getAllKbArticles({ publishedOnly: false, page, limit, search, tag, section });
  const stats = await getKbStats();
  const tags = await getAllKbTags(false);
  const sections = await getKbSections();
  return NextResponse.json({ ...result, stats, tags, sections });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.knowledgeBaseArticle.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const { tags, ...rest } = parsed.data;
  const article = await prisma.knowledgeBaseArticle.create({
    data: {
      ...rest,
      tags: JSON.stringify(tags),
      createdBy: user?.userId || null,
    },
  });

  await createAuditLog({
    userId: user?.userId,
    action: "create",
    entity: "knowledge_base",
    entityId: article.id,
    metadata: { title: article.title, slug: article.slug },
  });

  return NextResponse.json({ ...article, tags: JSON.parse(article.tags) }, { status: 201 });
}
