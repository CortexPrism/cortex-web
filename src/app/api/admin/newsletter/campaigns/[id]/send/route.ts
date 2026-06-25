import { NextRequest } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { sendCampaignToSubscribers } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";
import { buildSubscriberWhere } from "@/lib/newsletter-filters";

async function processSend(campaignId: string, subject: string, content: string, filterCriteria: string | null, adminUserId: string) {
  try {
    const subscriberWhere = buildSubscriberWhere(filterCriteria);

    const totalCount = await prisma.newsletterSubscription.count({
      where: subscriberWhere,
    });

    if (totalCount === 0) {
      await prisma.newsletterCampaign.update({
        where: { id: campaignId },
        data: { status: "draft" },
      });
      console.error(`[newsletter] No matching subscribers for campaign ${campaignId}`);
      return;
    }

    const { sent, failed } = await sendCampaignToSubscribers(campaignId, subject, content, subscriberWhere);

    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        status: "sent",
        sentAt: new Date(),
        sentCount: sent,
      },
    });

    await createAuditLog({
      userId: adminUserId,
      action: "newsletter_campaign_sent",
      entity: "NewsletterCampaign",
      entityId: campaignId,
      metadata: { subject, sent, failed, total: totalCount },
    });

    console.log(`[newsletter] Campaign ${campaignId} sent: ${sent} delivered, ${failed} failed, ${totalCount} total`);
  } catch (error) {
    console.error(`[newsletter] Failed to send campaign ${campaignId}:`, error);
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { status: "error" },
    }).catch(() => {});
  }
}

export async function POST(
  request: NextRequest,
  { params: pp }: { params: Promise<{ id: string }> }
) {
  const params = await pp;
  const user = getAuthUser(request);
  if (!user || !requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status === "sending") {
      return Response.json({ error: "Campaign is already being sent. If stuck, reset it first." }, { status: 400 });
    }

    if (campaign.status !== "draft" && campaign.status !== "scheduled") {
      return Response.json({ error: "Campaign can only be sent when in draft or scheduled status" }, { status: 400 });
    }

    const updateResult = await prisma.newsletterCampaign.updateMany({
      where: {
        id: params.id,
        OR: [
          { status: "draft" },
          { status: "scheduled" },
        ],
      },
      data: { status: "sending", scheduledAt: null },
    });

    if (updateResult.count === 0) {
      return Response.json({ error: "Campaign is already being sent or was already sent" }, { status: 400 });
    }

    const subscriberWhere = buildSubscriberWhere(campaign.filterCriteria);
    const totalCount = await prisma.newsletterSubscription.count({ where: subscriberWhere });

    if (totalCount === 0) {
      await prisma.newsletterCampaign.update({
        where: { id: params.id },
        data: { status: "draft" },
      });
      return Response.json({ error: "No subscribers match the selected criteria" }, { status: 400 });
    }

    processSend(campaign.id, campaign.subject, campaign.content, campaign.filterCriteria, user.userId)
      .catch((e) => console.error("[newsletter] Background send failed:", e));

    return Response.json(
      { success: true, message: `Campaign send started — ${totalCount} recipients queued` },
      { status: 202 }
    );
  } catch (error) {
    console.error("[newsletter] Failed to start campaign send:", error);
    return Response.json({ error: "Failed to start sending campaign" }, { status: 500 });
  }
}
