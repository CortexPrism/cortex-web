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

  if (!guildId) {
    return Response.json({ error: "guildId is required" }, { status: 400 });
  }

  const roles = await prisma.reactionRole.findMany({
    where: { guildId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ reactionRoles: roles });
}

export async function DELETE(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  try {
    await prisma.reactionRole.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed: " + (error instanceof Error ? error.message : "Unknown") }, { status: 400 });
  }
}
