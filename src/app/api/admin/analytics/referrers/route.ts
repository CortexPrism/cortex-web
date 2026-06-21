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

  const rows = await prisma.analyticsPageView.groupBy({
    by: ["referrer"],
    where: {
      timestamp: { gte: since },
      referrer: { not: null },
    },
    _count: { referrer: true },
    orderBy: { _count: { referrer: "desc" } },
    take: limit,
  });

  const data = rows.map((r) => ({
    referrer: r.referrer || "Direct",
    views: r._count.referrer,
  }));

  return Response.json({ data });
}
