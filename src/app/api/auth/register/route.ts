import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
});

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = RegisterSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) {
      const field = existing.email === data.email ? "email" : "username";
      return Response.json({ error: `${field} already taken` }, { status: 409 });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { email: data.email, username: data.username, passwordHash },
    });

    const token = signToken({ userId: user.id, role: user.role });
    return Response.json({
      token,
      user: formatUser(user),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
