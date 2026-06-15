import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function formatUser(user: {
  id: string; email: string; username: string; displayName: string | null;
  role: string; avatar: string | null; bio: string | null; website: string | null;
  location: string | null; socialLinks: string | null; preferences: string | null;
  emailVerified: boolean; createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    website: user.website,
    location: user.location,
    socialLinks: user.socialLinks ? JSON.parse(user.socialLinks) : null,
    preferences: user.preferences ? JSON.parse(user.preferences) : null,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

const ProfileUpdateSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal("")),
    github: z.string().url().optional().or(z.literal("")),
    discord: z.string().optional(),
    linkedin: z.string().url().optional().or(z.literal("")),
  }).optional(),
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    theme: z.enum(["dark", "light", "system"]).optional(),
  }).optional(),
});

const AccountUpdateSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
});

export async function GET(request: NextRequest) {
  const { user: authUser, errorResponse } = await authenticateRequest(request);
  if (errorResponse) return errorResponse;

  const fullUser = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!fullUser) return Response.json({ error: "User not found" }, { status: 404 });

  return Response.json({ user: formatUser(fullUser) });
}

export async function PUT(request: NextRequest) {
  const { user: authUser, errorResponse } = await authenticateRequest(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const profileResult = ProfileUpdateSchema.safeParse(body);
    const accountResult = AccountUpdateSchema.safeParse(body);

    const updateData: Record<string, unknown> = {};

    if (profileResult.success) {
      const data = profileResult.data;
      if (data.displayName !== undefined) updateData.displayName = data.displayName || null;
      if (data.bio !== undefined) updateData.bio = data.bio || null;
      if (data.website !== undefined) updateData.website = data.website || null;
      if (data.avatar !== undefined) updateData.avatar = data.avatar || null;
      if (data.location !== undefined) updateData.location = data.location || null;

      if (data.socialLinks !== undefined) {
        const cleaned: Record<string, string | null> = {};
        for (const [k, v] of Object.entries(data.socialLinks)) {
          cleaned[k] = v || null;
        }
        updateData.socialLinks = JSON.stringify(cleaned);
      }

      if (data.preferences !== undefined) {
        updateData.preferences = JSON.stringify(data.preferences);
      }
    }

    if (accountResult.success) {
      const data = accountResult.data;
      if (data.username !== undefined) {
        const existing = await prisma.user.findUnique({ where: { username: data.username } });
        if (existing && existing.id !== authUser.id) {
          return Response.json({ error: "Username already taken" }, { status: 409 });
        }
        updateData.username = data.username;
      }
      if (data.email !== undefined) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing && existing.id !== authUser.id) {
          return Response.json({ error: "Email already taken" }, { status: 409 });
        }
        updateData.email = data.email;
        updateData.emailVerified = false;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
    });

    return Response.json({ user: formatUser(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(request);
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => ({}));
  const { confirmation } = body;

  if (confirmation !== "DELETE MY ACCOUNT") {
    return Response.json({ error: "Please type 'DELETE MY ACCOUNT' to confirm" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: false,
      email: `deleted-${user.id}@cortexprism.io`,
      username: `deleted-${user.id}`,
      passwordHash: "",
      bio: null,
      avatar: null,
      website: null,
      location: null,
      socialLinks: null,
      preferences: null,
      displayName: null,
    },
  });

  return Response.json({ success: true });
}
