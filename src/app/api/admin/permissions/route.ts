import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET() {
  const permissions = await prisma.permission.findMany({
    orderBy: { name: "asc" },
  });

  return Response.json({ permissions });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, name, description } = body;

    if (!key || !name) {
      return Response.json({ error: "Key and name are required" }, { status: 400 });
    }

    const permission = await prisma.permission.create({
      data: {
        key: key.toLowerCase().replace(/[^a-z0-9:]/g, "-"),
        name,
        description,
      },
    });

    return Response.json({ permission }, { status: 201 });
  } catch {
    return Response.json({ error: "Permission key already exists" }, { status: 409 });
  }
}
