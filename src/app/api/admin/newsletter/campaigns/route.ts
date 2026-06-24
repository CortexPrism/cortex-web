import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { FilterCriteriaSchema } from "@/lib/schemas/newsletter";

const CampaignSchema = z.object({
  subject: z.string().min(1).max(200),
  content: z.string().min(1).max(100_000),
  filterCriteria: FilterCriteriaSchema,
  scheduledAt: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const rawLimit = parseInt(searchParams.get("limit") || "20", 10);
    const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, 1000);
    const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 50);

    const [campaigns, total] = await Promise.all([
      prisma.newsletterCampaign.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
        id: true,
        subject: true,
        status: true,
        scheduledAt: true,
        sentCount: true,
        sentAt: true,
        opens: true,
        clicks: true,
        unsubscribes: true,
        bounces: true,
        createdAt: true,
      },
    }),
    prisma.newsletterCampaign.count(),
  ]);

    return Response.json({
      campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[newsletter] Failed to list campaigns:", error);
    return Response.json({ error: "Failed to list campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user || !requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = CampaignSchema.parse(body);

    const scheduledDate = data.scheduledAt ? new Date(data.scheduledAt) : null;
    const initialStatus = scheduledDate && scheduledDate > new Date() ? "scheduled" : "draft";
    const scheduledAt = initialStatus === "scheduled" ? scheduledDate : null;

    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject: data.subject,
        content: data.content,
        status: initialStatus,
        scheduledAt,
        filterCriteria: data.filterCriteria ? JSON.stringify(data.filterCriteria) : null,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: "newsletter_campaign_created",
      entity: "NewsletterCampaign",
      entityId: campaign.id,
      metadata: { subject: data.subject, scheduledAt: scheduledAt?.toISOString() || null },
    });

    return Response.json({ campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
