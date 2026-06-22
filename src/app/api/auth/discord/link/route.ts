import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { z } from "zod";

const LinkSchema = z.object({
  code: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  const { user: authUser, errorResponse } = await authenticateRequest(request);
  if (errorResponse) return errorResponse;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: { discordId: null, discordUsername: null },
      select: {
        id: true, email: true, username: true, role: true,
        avatar: true, bio: true, website: true, discordUsername: true, createdAt: true,
      },
    });

    return Response.json({ user: updatedUser });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user: authUser, errorResponse } = await authenticateRequest(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { code } = LinkSchema.parse(body);

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL}/api/auth/discord/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      return Response.json({ error: "Failed to exchange Discord code" }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      return Response.json({ error: "Failed to fetch Discord user" }, { status: 500 });
    }

    const discordUser = await userResponse.json();
    const discordId = discordUser.id;

    const existing = await prisma.user.findUnique({ where: { discordId } });
    if (existing && existing.id !== authUser.id) {
      return Response.json({ error: "Discord account already linked to another user" }, { status: 409 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: { discordId, discordUsername: discordUser.username },
      select: {
        id: true, email: true, username: true, role: true,
        avatar: true, bio: true, website: true, discordUsername: true, createdAt: true,
      },
    });

    return Response.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
