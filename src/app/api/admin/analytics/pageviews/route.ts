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

  const days = range === "30d" ? 30 : 7;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const since = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

  const pageViews = await prisma.analyticsPageView.findMany({
    where: { timestamp: { gte: since } },
    select: { timestamp: true },
    orderBy: { timestamp: "asc" },
  });

  const grouped: Record<string, { date: string; pageViews: number; sessions: number }> = {};

  const sessionDays: Set<string>[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().slice(0, 10);
    grouped[dateKey] = { date: dateKey, pageViews: 0, sessions: 0 };
    sessionDays.push(new Set());
  }

  for (const pv of pageViews) {
    const dateKey = pv.timestamp.toISOString().slice(0, 10);
    if (grouped[dateKey]) {
      grouped[dateKey].pageViews++;
    }
  }

  const sessionsInRange = await prisma.analyticsSession.findMany({
    where: { lastVisitAt: { gte: since } },
    select: { sessionId: true, lastVisitAt: true },
  });

  const daySessions: Record<string, Set<string>> = {};
  for (const s of sessionsInRange) {
    const dateKey = s.lastVisitAt.toISOString().slice(0, 10);
    if (!daySessions[dateKey]) daySessions[dateKey] = new Set();
    daySessions[dateKey].add(s.sessionId);
  }

  for (const [dateKey, sessionSet] of Object.entries(daySessions)) {
    if (grouped[dateKey]) {
      grouped[dateKey].sessions = sessionSet.size;
    }
  }

  return Response.json({
    data: Object.values(grouped),
  });
}
