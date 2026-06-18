import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const guildId = searchParams.get("guildId");
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25")));

  const where: Record<string, unknown> = {};
  if (guildId) where.guildId = guildId;
  if (status) where.status = status;

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return Response.json({
    tickets,
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
    const { id, status, priority } = body;

    if (!id) {
      return Response.json({ error: "Ticket id is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (status === "closed") {
      updateData.closedAt = new Date();
      updateData.closedBy = user?.userId || "admin";
    }

    const ticket = await prisma.ticket.update({ where: { id }, data: updateData });
    return Response.json({ success: true, ticket });
  } catch (error) {
    return Response.json({ error: "Failed: " + (error instanceof Error ? error.message : "Unknown") }, { status: 400 });
  }
}
