import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

const BlogUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params: pp }: { params: Promise<{ id: string }> }
) {
  const params = await pp;
  try {
    const post = await prisma.blogPost.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: {
        author: { select: { username: true, avatar: true, displayName: true, bio: true } },
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    return Response.json({ ...post, tags: JSON.parse(post.tags) });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params: pp }: { params: Promise<{ id: string }> }
) {
  const params = await pp;
  try {
    const user = getAuthUser(request);
    if (!requireAdmin(user)) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const data = BlogUpdateSchema.parse(body);

    const existing = await prisma.blogPost.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!existing) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
      if (slugConflict) {
        return Response.json({ error: "A post with this slug already exists" }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage || null;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);

    if (data.published !== undefined) {
      updateData.published = data.published;
      if (data.published && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const post = await prisma.blogPost.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        author: { select: { username: true, avatar: true, displayName: true } },
      },
    });

    return Response.json({ ...post, tags: JSON.parse(post.tags) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params: pp }: { params: Promise<{ id: string }> }
) {
  const params = await pp;
  try {
    const user = getAuthUser(request);
    if (!requireAdmin(user)) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const existing = await prisma.blogPost.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    });

    if (!existing) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id: existing.id } });

    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
