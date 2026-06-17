import { NextRequest } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { getIndexNowKey } from "@/lib/settings";
import { setSetting } from "@/lib/settings";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const key = await getIndexNowKey();
  return Response.json({
    indexnow_api_key: key ? "configured" : "not set",
    _env_indexnow_api_key: process.env.INDEXNOW_API_KEY ? "set" : "not set",
  });
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key } = body;

    if (key === undefined) {
      return Response.json({ error: "Key is required" }, { status: 400 });
    }

    if (!key || key.length < 8) {
      return Response.json(
        { error: "Key must be at least 8 characters" },
        { status: 400 },
      );
    }

    await setSetting("indexnow_api_key", key);
    return Response.json({ success: true, message: "IndexNow API key saved" });
  } catch {
    return Response.json(
      { error: "Failed to update IndexNow key" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  await setSetting("indexnow_api_key", null);
  return Response.json({ success: true, message: "IndexNow API key removed" });
}
