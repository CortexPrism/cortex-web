import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authUser = getAuthUser(request);
  if (!requireAdmin(authUser)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, email: true, username: true, role: true,
      avatar: true, bio: true, website: true, isActive: true,
      githubId: true, createdAt: true,
      roleId: true,
      userRole: { select: { id: true, key: true, name: true } },
      _count: { select: { plugins: true, agents: true, reviews: true, ratings: true } },
    },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({ user });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authUser = getAuthUser(request);
  if (!requireAdmin(authUser)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  if (authUser!.userId === params.id) {
    return Response.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  try {
    await prisma.user.update({ where: { id: params.id }, data: { isActive: false } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "User not found" }, { status: 404 });
  }
}
