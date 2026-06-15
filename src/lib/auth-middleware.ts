import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AuthUser {
  userId: string;
  role: string;
}

export interface AuthUserFull {
  id: string;
  email: string;
  username: string;
  role: string;
  roleId: string | null;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}

export function requireAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin";
}

export async function getUserWithPermissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRole: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });
  return user;
}

export async function hasPermission(userId: string, permissionKey: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRole: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!user.userRole) return false;
  return user.userRole.permissions.some(rp => rp.permission.key === permissionKey);
}

export async function hasAnyPermission(userId: string, permissionKeys: string[]): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRole: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!user.userRole) return false;
  const userPermKeys = user.userRole.permissions.map(rp => rp.permission.key);
  return permissionKeys.some(k => userPermKeys.includes(k));
}

export async function requirePermission(userId: string, permissionKey: string): Promise<Response | null> {
  const has = await hasPermission(userId, permissionKey);
  if (!has) {
    return Response.json({ error: "Insufficient permissions" }, { status: 403 });
  }
  return null;
}

export async function requireAdminOrPermission(userId: string, permissionKey: string): Promise<Response | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role === "admin") return null;
  return requirePermission(userId, permissionKey);
}
