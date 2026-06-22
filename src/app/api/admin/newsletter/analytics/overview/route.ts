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
    totalActive,
    totalPending,
    totalUnsubscribed,
    weekNew,
    monthNew,
    newToday,
    totalCampaigns,
    sentCampaigns,
    totalSent,
    totalOpens,
    totalClicks,
    totalUnsubscribes,
    totalBounces,
    lastCampaign,
  ] = await Promise.all([
    prisma.newsletterSubscription.count({ where: { status: "active" } }),
    prisma.newsletterSubscription.count({ where: { status: "pending" } }),
    prisma.newsletterSubscription.count({ where: { status: "unsubscribed" } }),
    prisma.newsletterSubscription.count({ where: { subscribedAt: { gte: weekAgo }, status: "active" } }),
    prisma.newsletterSubscription.count({ where: { subscribedAt: { gte: monthAgo }, status: "active" } }),
    prisma.newsletterSubscription.count({ where: { subscribedAt: { gte: today }, status: "active" } }),
    prisma.newsletterCampaign.count(),
    prisma.newsletterCampaign.count({ where: { status: "sent" } }),
    prisma.newsletterCampaign.aggregate({ _sum: { sentCount: true } }),
    prisma.newsletterCampaign.aggregate({ _sum: { opens: true } }),
    prisma.newsletterCampaign.aggregate({ _sum: { clicks: true } }),
    prisma.newsletterCampaign.aggregate({ _sum: { unsubscribes: true } }),
    prisma.newsletterCampaign.aggregate({ _sum: { bounces: true } }),
    prisma.newsletterCampaign.findFirst({
      where: { status: "sent" },
      orderBy: { sentAt: "desc" },
      select: { id: true, subject: true, sentAt: true, sentCount: true, opens: true, clicks: true },
    }),
  ]);

  const totalDelivered = totalSent._sum.sentCount || 0;
  const totalOpenCount = totalOpens._sum.opens || 0;
  const totalClickCount = totalClicks._sum.clicks || 0;
  const totalUnsubCount = totalUnsubscribes._sum.unsubscribes || 0;
  const totalBounceCount = totalBounces._sum.bounces || 0;

  const openRate = totalDelivered > 0 ? ((totalOpenCount / totalDelivered) * 100).toFixed(1) : "0.0";
  const clickRate = totalDelivered > 0 ? ((totalClickCount / totalDelivered) * 100).toFixed(1) : "0.0";
  const unsubscribeRate = totalDelivered > 0 ? ((totalUnsubCount / totalDelivered) * 100).toFixed(1) : "0.0";
  const bounceRate = totalDelivered > 0 ? ((totalBounceCount / totalDelivered) * 100).toFixed(1) : "0.0";

  return Response.json({
    subscribers: {
      total: totalActive + totalPending + totalUnsubscribed,
      active: totalActive,
      pending: totalPending,
      unsubscribed: totalUnsubscribed,
      newToday,
      newWeek: weekNew,
      newMonth: monthNew,
    },
    campaigns: {
      total: totalCampaigns,
      sent: sentCampaigns,
      totalDelivered,
      totalOpens: totalOpenCount,
      totalClicks: totalClickCount,
      totalUnsubscribes: totalUnsubCount,
      totalBounces: totalBounceCount,
      openRate: parseFloat(openRate),
      clickRate: parseFloat(clickRate),
      unsubscribeRate: parseFloat(unsubscribeRate),
      bounceRate: parseFloat(bounceRate),
    },
    lastCampaign,
  });
}
