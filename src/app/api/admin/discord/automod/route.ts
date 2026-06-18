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

  const rules = await prisma.autoModRule.findMany({
    where: { guildId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ rules });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { guildId, type, name, action, duration, config } = body;

    if (!guildId || !type || !name || !action) {
      return Response.json({ error: "guildId, type, name, and action are required" }, { status: 400 });
    }

    const validTypes = ["keyword_filter", "invite_filter", "spam_filter", "link_filter", "mention_limit", "caps_filter"];
    if (!validTypes.includes(type)) {
      return Response.json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 });
    }

    const validActions = ["warn", "mute", "kick", "ban", "delete"];
    if (!validActions.includes(action)) {
      return Response.json({ error: `Invalid action. Must be one of: ${validActions.join(", ")}` }, { status: 400 });
    }

    const rule = await prisma.autoModRule.create({
      data: {
        guildId,
        type,
        name,
        enabled: true,
        action,
        duration: duration || null,
        config: config ? JSON.stringify(config) : null,
      },
    });

    return Response.json({ success: true, rule });
  } catch (error) {
    return Response.json({ error: "Failed: " + (error instanceof Error ? error.message : "Unknown") }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, enabled, action, duration, config, name } = body;

    if (!id) {
      return Response.json({ error: "Rule id is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (enabled !== undefined) updateData.enabled = enabled;
    if (action) updateData.action = action;
    if (duration !== undefined) updateData.duration = duration;
    if (config !== undefined) updateData.config = typeof config === "string" ? config : JSON.stringify(config);
    if (name) updateData.name = name;

    const rule = await prisma.autoModRule.update({
      where: { id },
      data: updateData,
    });

    return Response.json({ success: true, rule });
  } catch (error) {
    return Response.json({ error: "Failed: " + (error instanceof Error ? error.message : "Unknown") }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Rule id is required" }, { status: 400 });
  }

  try {
    await prisma.autoModRule.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed: " + (error instanceof Error ? error.message : "Unknown") }, { status: 400 });
  }
}
