import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { createAuditLog } from "@/lib/audit";
import { notifySubmissionAction } from "@/lib/submissions";
import { submitOnApproval } from "@/lib/indexnow";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  const where: Record<string, unknown> = { status };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [agents, total] = await Promise.all([
    prisma.agentConfig.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        user: { select: { id: true, username: true, email: true } },
        reviews: { include: { reviewer: { select: { username: true } } }, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.agentConfig.count({ where }),
  ]);

  return Response.json({
    agents: agents.map((a) => ({
      ...a,
      tools: JSON.parse(a.tools || "[]"),
      tags: typeof a.tags === 'string' ? JSON.parse(a.tags || "[]") : (a.tags || []),
      category: a.category?.name || null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, action, notes } = body;

    if (!id || !["approved", "rejected"].includes(action)) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const agent = await prisma.agentConfig.update({
      where: { id },
      data: { status: action === "approved" ? "approved" : "rejected" },
    });

    await prisma.submissionReview.create({
      data: {
        agentId: id,
        reviewerId: user!.userId,
        action,
        notes: notes || null,
      },
    });

    await createAuditLog({
      userId: user!.userId,
      action: `submission.${action}`,
      entity: "agent",
      entityId: id,
      metadata: { name: agent.name },
    });

    await notifySubmissionAction("agent", agent, action, notes);

    if (action === "approved") {
      submitOnApproval("agent", agent.slug).catch(() => {});
    }

    return Response.json({ agent });
  } catch {
    return Response.json({ error: "Agent not found or invalid data" }, { status: 404 });
  }
}
