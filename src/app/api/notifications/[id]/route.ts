import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-middleware";
import { markNotificationRead, deleteNotification } from "@/lib/notifications";

export async function PUT(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const user = getAuthUser(request);
  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  await markNotificationRead(params.id, user.userId);
  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const user = getAuthUser(request);
  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  await deleteNotification(params.id, user.userId);
  return Response.json({ success: true });
}
