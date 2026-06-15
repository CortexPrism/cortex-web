import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
    const data = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({ userId: user.id, role: user.role });
    return Response.json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
