import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { FilterCriteriaSchema } from "@/lib/schemas/newsletter";

const AutomationUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["welcome", "reengagement", "custom"]).optional(),
  trigger: z.enum(["on_subscribe", "on_schedule", "on_inactive"]).optional(),
  subject: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(100_000).optional(),
  delayMinutes: z.number().int().min(0).max(525600).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100).optional(),
  filterCriteria: FilterCriteriaSchema,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const automation = await prisma.newsletterAutomation.findUnique({
    where: { id: params.id },
  });

  if (!automation) {
    return Response.json({ error: "Automation not found" }, { status: 404 });
  }

  return Response.json({ automation });
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
    const automation = await prisma.newsletterAutomation.findUnique({
      where: { id: params.id },
    });

    if (!automation) {
      return Response.json({ error: "Automation not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = AutomationUpdateSchema.parse(body);

    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.type !== undefined) updates.type = data.type;
    if (data.trigger !== undefined) updates.trigger = data.trigger;
    if (data.subject !== undefined) updates.subject = data.subject;
    if (data.content !== undefined) updates.content = data.content;
    if (data.delayMinutes !== undefined) updates.delayMinutes = data.delayMinutes;
    if (data.isActive !== undefined) updates.isActive = data.isActive;
    if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;
    if (data.filterCriteria !== undefined) {
      updates.filterCriteria = data.filterCriteria ? JSON.stringify(data.filterCriteria) : null;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.newsletterAutomation.update({
      where: { id: params.id },
      data: updates,
    });

    await createAuditLog({
      userId: authUser.userId,
      action: "newsletter_automation_updated",
      entity: "NewsletterAutomation",
      entityId: params.id,
      metadata: { name: updated.name },
    });

    return Response.json({ automation: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Failed to update automation" }, { status: 500 });
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
    const automation = await prisma.newsletterAutomation.findUnique({
      where: { id: params.id },
    });

    if (!automation) {
      return Response.json({ error: "Automation not found" }, { status: 404 });
    }

    await prisma.newsletterAutomation.delete({ where: { id: params.id } });

    await createAuditLog({
      userId: user.userId,
      action: "newsletter_automation_deleted",
      entity: "NewsletterAutomation",
      entityId: params.id,
      metadata: { name: automation.name },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to delete automation" }, { status: 500 });
  }
}
