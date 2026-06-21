import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalSessions,
    totalPageViews,
    todayPageViews,
    todaySessions,
    weekPageViews,
    weekSessions,
    monthPageViews,
    monthSessions,
  ] = await Promise.all([
    prisma.analyticsSession.count(),
    prisma.analyticsPageView.count(),
    prisma.analyticsPageView.count({ where: { timestamp: { gte: today } } }),
    prisma.analyticsSession.count({ where: { lastVisitAt: { gte: today } } }),
    prisma.analyticsPageView.count({ where: { timestamp: { gte: weekAgo } } }),
    prisma.analyticsSession.count({ where: { lastVisitAt: { gte: weekAgo } } }),
    prisma.analyticsPageView.count({ where: { timestamp: { gte: monthAgo } } }),
    prisma.analyticsSession.count({ where: { lastVisitAt: { gte: monthAgo } } }),
  ]);

  return Response.json({
    totalSessions,
    totalPageViews,
    today: { pageViews: todayPageViews, sessions: todaySessions },
    week: { pageViews: weekPageViews, sessions: weekSessions },
    month: { pageViews: monthPageViews, sessions: monthSessions },
  });
}
