import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
  const status = searchParams.get("status") || undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const campaigns = await prisma.newsletterCampaign.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      subject: true,
      status: true,
      sentCount: true,
      opens: true,
      clicks: true,
      unsubscribes: true,
      bounces: true,
      sentAt: true,
      createdAt: true,
    },
  });

  const enriched = campaigns.map((c) => {
    const sent = c.sentCount || 0;
    return {
      ...c,
      openRate: sent > 0 ? parseFloat(((c.opens / sent) * 100).toFixed(1)) : 0,
      clickRate: sent > 0 ? parseFloat(((c.clicks / sent) * 100).toFixed(1)) : 0,
      unsubscribeRate: sent > 0 ? parseFloat(((c.unsubscribes / sent) * 100).toFixed(1)) : 0,
      bounceRate: sent > 0 ? parseFloat(((c.bounces / sent) * 100).toFixed(1)) : 0,
      ctr: c.opens > 0 ? parseFloat(((c.clicks / c.opens) * 100).toFixed(1)) : 0,
    };
  });

  return Response.json({ campaigns: enriched });
}
