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

  const channels = await prisma.channelConfig.findMany({
    where: { guildId },
    orderBy: { channelName: "asc" },
  });

  return Response.json({ channels });
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { channelId, guildId, channelName, slowmode, isLocked, autoModExempt } = body;

    if (!channelId || !guildId) {
      return Response.json({ error: "channelId and guildId are required" }, { status: 400 });
    }

    const config = await prisma.channelConfig.upsert({
      where: { channelId },
      update: {
        guildId,
        channelName: channelName ?? undefined,
        slowmode: slowmode ?? undefined,
        isLocked: isLocked ?? undefined,
        autoModExempt: autoModExempt ?? undefined,
      },
      create: {
        guildId,
        channelId,
        channelName: channelName ?? null,
        slowmode: slowmode ?? 0,
        isLocked: isLocked ?? false,
        autoModExempt: autoModExempt ?? false,
      },
    });

    return Response.json({ success: true, config });
  } catch (error) {
    return Response.json({ error: "Failed: " + (error instanceof Error ? error.message : "Unknown") }, { status: 400 });
  }
}
