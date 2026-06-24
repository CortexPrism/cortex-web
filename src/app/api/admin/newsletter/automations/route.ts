import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { FilterCriteriaSchema } from "@/lib/schemas/newsletter";

const AutomationSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["welcome", "reengagement", "custom"]),
  trigger: z.enum(["on_subscribe", "on_schedule", "on_inactive"]),
  subject: z.string().min(1).max(200),
  content: z.string().min(1).max(100_000),
  delayMinutes: z.number().int().min(0).max(525600),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0).max(100),
  filterCriteria: FilterCriteriaSchema,
});

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const automations = await prisma.newsletterAutomation.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return Response.json({ automations });
  } catch (error) {
    console.error("[newsletter] Failed to list automations:", error);
    return Response.json({ error: "Failed to list automations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user || !requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = AutomationSchema.parse(body);

    const automation = await prisma.newsletterAutomation.create({
      data: {
        name: data.name,
        description: data.description || null,
        type: data.type,
        trigger: data.trigger,
        subject: data.subject,
        content: data.content,
        delayMinutes: data.delayMinutes,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        filterCriteria: data.filterCriteria ? JSON.stringify(data.filterCriteria) : null,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: "newsletter_automation_created",
      entity: "NewsletterAutomation",
      entityId: automation.id,
      metadata: { name: data.name, type: data.type, trigger: data.trigger },
    });

    return Response.json({ automation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    console.error("[newsletter] Failed to create automation:", error);
    return Response.json({ error: "Failed to create automation" }, { status: 500 });
  }
}
