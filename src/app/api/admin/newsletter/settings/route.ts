import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

const SETTINGS_KEYS = [
  "newsletter_from_name",
  "newsletter_from_email",
  "newsletter_reply_to",
  "newsletter_welcome_subject",
  "newsletter_welcome_body",
  "newsletter_footer_text",
  "newsletter_double_optin",
  "newsletter_default_sender",
] as const;

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: [...SETTINGS_KEYS] } },
    });

    const map: Record<string, string | null> = {};
    for (const key of SETTINGS_KEYS) {
      map[key] = null;
    }
    for (const s of settings) {
      map[s.key] = s.value;
    }

    return Response.json({ settings: map });
  } catch (error) {
    console.error("[newsletter] Failed to load settings:", error);
    return Response.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

const UpdateSettingsSchema = z.object({
  settings: z.record(z.string().min(1), z.string().nullable()).refine(
    (obj) => Object.keys(obj).every((k) => (SETTINGS_KEYS as readonly string[]).includes(k)),
    { message: "Invalid setting key" }
  ),
});

export async function PUT(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser || !requireAdmin(authUser)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { settings } = UpdateSettingsSchema.parse(body);

    for (const [key, value] of Object.entries(settings)) {
      if (value === null || value === "") {
        await prisma.setting.delete({ where: { key } }).catch(() => {});
      } else {
        await prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    await createAuditLog({
      userId: authUser.userId,
      action: "newsletter_settings_updated",
      entity: "Setting",
      metadata: { keys: Object.keys(settings) },
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      return Response.json({ error: `Validation failed: ${messages.join("; ")}` }, { status: 400 });
    }
    console.error("[newsletter] Failed to update settings:", error);
    return Response.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
