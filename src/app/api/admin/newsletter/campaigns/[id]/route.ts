import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

const CampaignUpdateSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(100_000).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const campaign = await prisma.newsletterCampaign.findUnique({
    where: { id: params.id },
  });

  if (!campaign) {
    return Response.json({ error: "Campaign not found" }, { status: 404 });
  }

  return Response.json({ campaign });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(request);
  if (!authUser || !requireAdmin(authUser)) {
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
      return Response.json({ error: "Only draft campaigns can be edited" }, { status: 400 });
    }

    const body = await request.json();
    const data = CampaignUpdateSchema.parse(body);

    const updates: Record<string, string> = {};
    if (data.subject !== undefined) updates.subject = data.subject;
    if (data.content !== undefined) updates.content = data.content;

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.newsletterCampaign.update({
      where: { id: params.id },
      data: updates,
    });

    await createAuditLog({
      userId: authUser.userId,
      action: "newsletter_campaign_updated",
      entity: "NewsletterCampaign",
      entityId: params.id,
      metadata: { subject: updated.subject },
    });

    return Response.json({ campaign: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(
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
      return Response.json({ error: "Only draft campaigns can be deleted" }, { status: 400 });
    }

    await prisma.newsletterCampaign.delete({ where: { id: params.id } });

    await createAuditLog({
      userId: user.userId,
      action: "newsletter_campaign_deleted",
      entity: "NewsletterCampaign",
      entityId: params.id,
      metadata: { subject: campaign.subject },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
