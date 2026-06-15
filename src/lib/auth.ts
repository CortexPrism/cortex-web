import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true, email: true, username: true, displayName: true,
      role: true, avatar: true, bio: true, website: true,
      location: true, socialLinks: true, preferences: true,
      emailVerified: true, createdAt: true,
    },
  });
  return user;
}

export async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null, errorResponse: Response.json({ error: "Not authenticated" }, { status: 401 }) as Response };
  }
  const token = authHeader.slice(7);
  const user = await getUserFromToken(token);
  if (!user) {
    return { user: null, errorResponse: Response.json({ error: "Invalid token" }, { status: 401 }) as Response };
  }
  return { user, errorResponse: null };
}

export function requireRole(role: "admin" | "user") {
  return (userRole: string | undefined) => {
    if (!userRole) return false;
    if (role === "admin") return userRole === "admin";
    return true;
  };
}
