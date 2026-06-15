import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { createAuditLog } from "@/lib/audit";

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

  const [plugins, total] = await Promise.all([
    prisma.plugin.findMany({
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
    prisma.plugin.count({ where }),
  ]);

  return Response.json({
    plugins: plugins.map((p) => ({
      ...p,
      capabilities: JSON.parse(p.capabilities || "[]"),
      category: p.category?.name || null,
      tags: JSON.parse(p.tags || "[]"),
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

    const plugin = await prisma.plugin.update({
      where: { id },
      data: { status: action === "approved" ? "approved" : "rejected" },
    });

    await prisma.submissionReview.create({
      data: {
        pluginId: id,
        reviewerId: user!.userId,
        action,
        notes: notes || null,
      },
    });

    await createAuditLog({
      userId: user!.userId,
      action: `submission.${action}`,
      entity: "plugin",
      entityId: id,
      metadata: { name: plugin.name },
    });

    return Response.json({ plugin });
  } catch {
    return Response.json({ error: "Plugin not found or invalid data" }, { status: 404 });
  }
}
