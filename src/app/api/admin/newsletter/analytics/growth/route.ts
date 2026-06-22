import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "30d";

  const now = new Date();
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);

  const subscribers = await prisma.newsletterSubscription.findMany({
    where: {
      OR: [
        { createdAt: { gte: startDate } },
        { subscribedAt: { gte: startDate } },
        { unsubscribedAt: { gte: startDate } },
      ],
    },
    select: {
      createdAt: true,
      subscribedAt: true,
      unsubscribedAt: true,
      status: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const dailyData: Record<string, { date: string; newSubs: number; confirmed: number; unsubscribed: number }> = {};

  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyData[key] = { date: key, newSubs: 0, confirmed: 0, unsubscribed: 0 };
  }

  for (const sub of subscribers) {
    const createdKey = sub.createdAt.toISOString().slice(0, 10);
    if (dailyData[createdKey]) dailyData[createdKey].newSubs++;

    if (sub.subscribedAt) {
      const confirmedKey = sub.subscribedAt.toISOString().slice(0, 10);
      if (dailyData[confirmedKey]) dailyData[confirmedKey].confirmed++;
    }

    if (sub.unsubscribedAt) {
      const unsubKey = sub.unsubscribedAt.toISOString().slice(0, 10);
      if (dailyData[unsubKey]) dailyData[unsubKey].unsubscribed++;
    }
  }

  const growth = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

  let cumulative = 0;
  const withCumulative = growth.map((d) => {
    cumulative += d.confirmed - d.unsubscribed;
    return { ...d, active: Math.max(0, cumulative) };
  });

  return Response.json({ growth: withCumulative, range });
}
