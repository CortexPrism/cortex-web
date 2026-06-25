import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth-middleware";

const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().max(1000).optional(),
});

export async function GET(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const plugin = await prisma.plugin.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
  });
  if (!plugin) {
    return Response.json({ error: "Plugin not found" }, { status: 404 });
  }

  const ratings = await prisma.userRating.findMany({
    where: { pluginId: plugin.id },
    include: { user: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const avg = await prisma.userRating.aggregate({
    where: { pluginId: plugin.id },
    _avg: { rating: true },
    _count: true,
  });

  return Response.json({
    ratings: ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      review: r.review,
      user: r.user,
      createdAt: r.createdAt,
    })),
    averageRating: avg._avg.rating || 0,
    totalRatings: avg._count,
  });
}

export async function POST(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const user = getAuthUser(request);
  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const plugin = await prisma.plugin.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
  });
  if (!plugin) {
    return Response.json({ error: "Plugin not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = ReviewSchema.parse(body);

    const existing = await prisma.userRating.findFirst({
      where: { pluginId: plugin.id, userId: user.userId },
    });

    if (existing) {
      await prisma.userRating.update({
        where: { id: existing.id },
        data: { rating: data.rating, review: data.review || null },
      });
    } else {
      await prisma.userRating.create({
        data: {
          pluginId: plugin.id,
          userId: user.userId,
          rating: data.rating,
          review: data.review || null,
        },
      });
    }

    const avg = await prisma.userRating.aggregate({
      where: { pluginId: plugin.id },
      _avg: { rating: true },
    });

    await prisma.plugin.update({
      where: { id: plugin.id },
      data: { rating: Math.round((avg._avg.rating || 0) * 10) / 10 },
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
