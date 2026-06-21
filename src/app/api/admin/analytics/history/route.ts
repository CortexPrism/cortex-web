import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const skip = (page - 1) * limit;

  const [views, total] = await Promise.all([
    prisma.analyticsPageView.findMany({
      orderBy: { timestamp: "desc" },
      take: limit,
      skip,
      include: {
        session: {
          select: { country: true, ipHash: true, userAgent: true },
        },
      },
    }),
    prisma.analyticsPageView.count(),
  ]);

  const data = views.map((v) => ({
    id: v.id,
    path: v.path,
    referrer: v.referrer,
    userAgent: v.userAgent,
    country: v.session.country,
    ipHash: v.session.ipHash,
    timestamp: v.timestamp.toISOString(),
  }));

  return Response.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
