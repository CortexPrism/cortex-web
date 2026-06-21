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
    by: ["path"],
    where: { timestamp: { gte: since } },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: limit,
  });

  const totalViews = rows.reduce((sum, r) => sum + r._count.path, 0);

  const data = rows.map((r) => ({
    path: r.path,
    views: r._count.path,
    percentage: totalViews > 0 ? Math.round((r._count.path / totalViews) * 1000) / 10 : 0,
  }));

  return Response.json({ data, totalViews });
}
