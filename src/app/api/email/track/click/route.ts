import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackEmailEvent } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const url = searchParams.get("url");
  const redirectUrl = url || "/";

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
          eventType: "click",
          campaignId: log.campaignId || undefined,
          ip,
          userAgent,
          clickUrl: redirectUrl,
        });
      }
    }).catch(() => {});
  }

  if (!redirectUrl.startsWith("http://") && !redirectUrl.startsWith("https://")) {
    return Response.redirect(new URL(redirectUrl, request.url));
  }

  return Response.redirect(redirectUrl);
}
