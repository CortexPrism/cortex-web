import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

const ScheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

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

    if (campaign.status !== "draft") {
      return Response.json({ error: "Only draft campaigns can be scheduled" }, { status: 400 });
    }

    const body = await request.json();
    const { scheduledAt } = ScheduleSchema.parse(body);
    const scheduledDate = new Date(scheduledAt);

    if (scheduledDate <= new Date()) {
      return Response.json({ error: "Scheduled time must be in the future" }, { status: 400 });
    }

    await prisma.newsletterCampaign.update({
      where: { id: params.id },
      data: { status: "scheduled", scheduledAt: scheduledDate },
    });

    await createAuditLog({
      userId: user.userId,
      action: "newsletter_campaign_scheduled",
      entity: "NewsletterCampaign",
      entityId: params.id,
      metadata: { subject: campaign.subject, scheduledAt: scheduledDate.toISOString() },
    });

    return Response.json({ success: true, scheduledAt: scheduledDate.toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Failed to schedule campaign" }, { status: 500 });
  }
}

export async function DELETE(
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

    if (campaign.status !== "scheduled") {
      return Response.json({ error: "Campaign is not scheduled" }, { status: 400 });
    }

    await prisma.newsletterCampaign.update({
      where: { id: params.id },
      data: { status: "draft", scheduledAt: null },
    });

    await createAuditLog({
      userId: user.userId,
      action: "newsletter_campaign_unscheduled",
      entity: "NewsletterCampaign",
      entityId: params.id,
      metadata: { subject: campaign.subject },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to unschedule campaign" }, { status: 500 });
  }
}
