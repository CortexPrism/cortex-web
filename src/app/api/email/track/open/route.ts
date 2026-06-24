import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackEmailEvent } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    prisma.emailLog.findFirst({
      where: { messageId: id },
      select: { id: true, campaignId: true, status: true },
    }).then((log) => {
      if (log) {
        return trackEmailEvent({
          messageId: id,
          eventType: "open",
          campaignId: log.campaignId || undefined,
          ip,
          userAgent,
        });
      }
    }).catch(() => {});
  }

  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  return new Response(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
