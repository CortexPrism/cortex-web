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

  let guildConfigs;
  if (guildId) {
    guildConfigs = [await prisma.guildConfig.upsert({
      where: { guildId },
      update: {},
      create: { guildId },
    })];
  } else {
    guildConfigs = await prisma.guildConfig.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
  }

  return Response.json({ guilds: guildConfigs });
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { guildId, ...data } = body;

    if (!guildId || typeof guildId !== "string") {
      return Response.json({ error: "guildId is required" }, { status: 400 });
    }

    const allowedFields = [
      "guildName", "logChannelId", "modRoleId", "adminRoleId", "muteRoleId",
      "autoModEnabled", "welcomeEnabled", "welcomeMessage", "welcomeChannelId",
      "leaveEnabled", "leaveMessage", "leaveChannelId", "slowmodeDefault",
      "maxWarnsBeforeBan", "announcementChannelId", "ticketCategoryId",
      "ticketLogChannelId", "ticketStaffRoleId", "levelingEnabled",
      "levelingMessage", "levelingChannelId", "starboardEnabled",
      "starboardChannelId", "starboardThreshold",
    ];

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value;
      }
    }

    const config = await prisma.guildConfig.upsert({
      where: { guildId },
      update: updateData,
      create: { guildId, guildName: data.guildName || null, ...updateData },
    });

    return Response.json({ success: true, config });
  } catch (error) {
    return Response.json({ error: "Failed: " + (error instanceof Error ? error.message : "Unknown") }, { status: 400 });
  }
}
