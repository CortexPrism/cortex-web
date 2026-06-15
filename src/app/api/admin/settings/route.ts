import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET() {
  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  const result: Record<string, string | null> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return Response.json({ settings: result });
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return Response.json({ error: "Key is required" }, { status: 400 });
    }

    if (value === null || value === "") {
      await prisma.setting.delete({ where: { key } }).catch(() => {});
      return Response.json({ success: true, message: "Setting deleted" });
    }

    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to update setting" }, { status: 400 });
  }
}
