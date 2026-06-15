import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: { permission: true },
      },
      _count: { select: { users: true } },
    },
    orderBy: { name: "asc" },
  });

  return Response.json({ roles });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, name, description, permissionIds } = body;

    if (!key || !name) {
      return Response.json({ error: "Key and name are required" }, { status: 400 });
    }

    const role = await prisma.role.create({
      data: {
        key: key.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        name,
        description,
        permissions: permissionIds?.length
          ? { create: permissionIds.map((pid: string) => ({ permissionId: pid })) }
          : undefined,
      },
    });

    return Response.json({ role }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return Response.json({ error: "Role with this key already exists" }, { status: 409 });
    }
    return Response.json({ error: "Failed to create role" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, description, permissionIds } = body;

    if (!id) {
      return Response.json({ error: "Role ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length > 0) {
      await prisma.role.update({ where: { id }, data: updateData });
    }

    if (permissionIds !== undefined) {
      await prisma.rolePermission.deleteMany({ where: { roleId: id } });
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((pid: string) => ({ roleId: id, permissionId: pid })),
        });
      }
    }

    const role = await prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } },
    });

    return Response.json({ role });
  } catch {
    return Response.json({ error: "Failed to update role" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return Response.json({ error: "Role not found" }, { status: 404 });
    if (role.isSystem) return Response.json({ error: "Cannot delete system role" }, { status: 400 });

    await prisma.role.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to delete role" }, { status: 400 });
  }
}
