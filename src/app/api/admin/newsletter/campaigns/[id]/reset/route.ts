import { NextRequest } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

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

    if (campaign.status !== "sending" && campaign.status !== "error" && campaign.status !== "scheduled") {
      return Response.json({ error: `Cannot reset a campaign with status "${campaign.status}" — only "sending", "scheduled", or "error" campaigns can be reset` }, { status: 400 });
    }

    const updated = await prisma.newsletterCampaign.update({
      where: { id: params.id },
      data: { status: "draft", sentCount: 0, scheduledAt: null },
    });

    await createAuditLog({
      userId: user.userId,
      action: "newsletter_campaign_reset",
      entity: "NewsletterCampaign",
      entityId: params.id,
      metadata: { subject: campaign.subject, previousStatus: campaign.status },
    });

    return Response.json({ success: true, campaign: updated });
  } catch (error) {
    console.error("[newsletter] Failed to reset campaign:", error);
    return Response.json({ error: "Failed to reset campaign" }, { status: 500 });
  }
}
