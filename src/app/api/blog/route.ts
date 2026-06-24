import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

const BlogInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));

    const user = getAuthUser(request);
    const isAdmin = requireAdmin(user);
    const where: Record<string, unknown> = isAdmin ? {} : { published: true };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: { select: { username: true, avatar: true, displayName: true } },
        },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return Response.json({
      posts: posts.map((p) => {
        const wordCount = p.content.trim().split(/\s+/).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          coverImage: p.coverImage,
          tags: JSON.parse(p.tags),
          published: p.published,
          publishedAt: p.publishedAt,
          viewCount: p.viewCount,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          authorId: p.authorId,
          author: p.author,
          readTime,
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!requireAdmin(user)) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const data = BlogInputSchema.parse(body);

    const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return Response.json({ error: "A post with this slug already exists" }, { status: 409 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        coverImage: data.coverImage || null,
        tags: JSON.stringify(data.tags || []),
        published: data.published ?? false,
        publishedAt: data.published ? new Date() : null,
        authorId: user?.userId || null,
      },
      include: {
        author: { select: { username: true, avatar: true, displayName: true } },
      },
    });

    return Response.json({ ...post, tags: JSON.parse(post.tags) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
