import { NextRequest } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { generateUnsubscribeToken } from "@/lib/email";
import { sendBulkEmails } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";

const BATCH_SIZE = 100;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (campaign.status !== "draft") {
      return Response.json({ error: "Campaign can only be sent when in draft status" }, { status: 400 });
    }

    const updateResult = await prisma.newsletterCampaign.updateMany({
      where: { id: params.id, status: "draft" },
      data: { status: "sending" },
    });

    if (updateResult.count === 0) {
      return Response.json({ error: "Campaign is already being sent or was already sent" }, { status: 400 });
    }

    const totalCount = await prisma.newsletterSubscription.count({
      where: { status: "active" },
    });

    if (totalCount === 0) {
      await prisma.newsletterCampaign.update({
        where: { id: params.id },
        data: { status: "draft" },
      });
      return Response.json({ error: "No active subscribers" }, { status: 400 });
    }

    let totalSent = 0;
    let totalFailed = 0;
    let cursor: string | undefined;

    while (true) {
      const batch = await prisma.newsletterSubscription.findMany({
        where: { status: "active" },
        select: { id: true, email: true },
        take: BATCH_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: "asc" },
      });

      if (batch.length === 0) break;

      const recipients = batch.map((s) => ({
        email: s.email,
        unsubscribeToken: generateUnsubscribeToken(s.email),
      }));

      const { sent, failed } = await sendBulkEmails(recipients, campaign.subject, campaign.content, params.id);
      totalSent += sent;
      totalFailed += failed;
      cursor = batch[batch.length - 1].id;
    }

    await prisma.newsletterCampaign.update({
      where: { id: params.id },
      data: {
        status: "sent",
        sentAt: new Date(),
        sentCount: totalSent,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: "newsletter_campaign_sent",
      entity: "NewsletterCampaign",
      entityId: params.id,
      metadata: { subject: campaign.subject, sent: totalSent, failed: totalFailed, total: totalCount },
    });

    return Response.json({ success: true, sent: totalSent, failed: totalFailed, total: totalCount });
  } catch (error) {
    console.error("[newsletter] Failed to send campaign:", error);
    await prisma.newsletterCampaign.update({
      where: { id: params.id },
      data: { status: "error" },
    }).catch(() => {});

    return Response.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
