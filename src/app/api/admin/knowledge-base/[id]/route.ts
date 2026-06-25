import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { createAuditLog } from "@/lib/audit";
import { getKbArticleById } from "@/lib/knowledge-base";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-/]+$/, "Slug must be lowercase alphanumeric with hyphens and slashes").optional(),
  section: z.string().optional(),
  content: z.string().min(1).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(
  request: NextRequest,
  { params: pp }: { params: Promise<{ id: string }> }
) {
  const params = await pp;
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const article = await getKbArticleById(params.id);
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(article);
}

export async function PUT(
  request: NextRequest,
  { params: pp }: { params: Promise<{ id: string }> }
) {
  const params = await pp;
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await getKbArticleById(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const conflict = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (conflict) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
  }

  const { tags, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (tags !== undefined) {
    updateData.tags = JSON.stringify(tags);
  }

  const article = await prisma.knowledgeBaseArticle.update({
    where: { id: params.id },
    data: updateData,
  });

  await createAuditLog({
    userId: user?.userId,
    action: "update",
    entity: "knowledge_base",
    entityId: article.id,
    metadata: { title: article.title, slug: article.slug },
  });

  return NextResponse.json({ ...article, tags: JSON.parse(article.tags) });
}

export async function DELETE(
  request: NextRequest,
  { params: pp }: { params: Promise<{ id: string }> }
) {
  const params = await pp;
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getKbArticleById(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.knowledgeBaseArticle.delete({ where: { id: params.id } });

  await createAuditLog({
    userId: user?.userId,
    action: "delete",
    entity: "knowledge_base",
    entityId: params.id,
    metadata: { title: existing.title, slug: existing.slug },
  });

  return NextResponse.json({ success: true });
}
