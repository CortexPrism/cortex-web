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
  const agent = await prisma.agentConfig.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
  });
  if (!agent) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  const ratings = await prisma.userRating.findMany({
    where: { agentId: agent.id },
    include: { user: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const avg = await prisma.userRating.aggregate({
    where: { agentId: agent.id },
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

  const agent = await prisma.agentConfig.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
  });
  if (!agent) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = ReviewSchema.parse(body);

    const existing = await prisma.userRating.findFirst({
      where: { agentId: agent.id, userId: user.userId },
    });

    if (existing) {
      await prisma.userRating.update({
        where: { id: existing.id },
        data: { rating: data.rating, review: data.review || null },
      });
    } else {
      await prisma.userRating.create({
        data: {
          agentId: agent.id,
          userId: user.userId,
          rating: data.rating,
          review: data.review || null,
        },
      });
    }

    const avg = await prisma.userRating.aggregate({
      where: { agentId: agent.id },
      _avg: { rating: true },
    });

    await prisma.agentConfig.update({
      where: { id: agent.id },
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
