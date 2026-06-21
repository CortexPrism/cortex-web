import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d";
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const days = range === "30d" ? 30 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await prisma.analyticsSession.groupBy({
    by: ["country"],
    where: {
      lastVisitAt: { gte: since },
      country: { not: null },
    },
    _count: { country: true },
    orderBy: { _count: { country: "desc" } },
    take: limit,
  });

  const data = rows.map((r) => ({
    country: r.country || "Unknown",
    sessions: r._count.country,
  }));

  return Response.json({ data });
}
