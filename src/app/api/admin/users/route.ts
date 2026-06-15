import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-middleware";
import { requireAdmin } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { username: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, email: true, username: true, role: true,
        avatar: true, isActive: true, createdAt: true,
        roleId: true,
        userRole: { select: { id: true, key: true, name: true } },
        _count: { select: { plugins: true, agents: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return Response.json({ users, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export async function PUT(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!requireAdmin(authUser)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, roleId, isActive, role } = body;

    const updateData: Record<string, unknown> = {};
    if (roleId !== undefined) updateData.roleId = roleId || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role !== undefined) updateData.role = role;

    await prisma.user.update({ where: { id }, data: updateData });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Update failed" }, { status: 400 });
  }
}
