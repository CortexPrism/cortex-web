import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackEmailEvent } from "@/lib/email";

function parseCampaignId(event: Record<string, unknown>): string | undefined {
  if (typeof event.campaign_id === "string") return event.campaign_id;
  try {
    const args = typeof event.custom_args === "string"
      ? JSON.parse(event.custom_args)
      : event.custom_args;
    return typeof (args as Record<string, unknown>)?.campaign_id === "string"
      ? (args as Record<string, unknown>).campaign_id as string
      : undefined;
  } catch {
    return undefined;
  }
}

function parseSendgridMessageId(event: Record<string, unknown>): string | undefined {
  if (typeof event.sg_message_id === "string") return event.sg_message_id;
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const events = await request.json();
    const eventList = Array.isArray(events) ? events : [events];

    for (const event of eventList) {
      const eventType = event.event as string;
      const campaignId = parseCampaignId(event);
      const email = typeof event.email === "string" ? event.email.toLowerCase().trim() : null;
      const sgMessageId = parseSendgridMessageId(event);
      const ip = typeof event.ip === "string" ? event.ip : undefined;
      const userAgent = typeof event.useragent === "string" ? event.useragent : undefined;
      const url = typeof event.url === "string" ? event.url : undefined;

      if (eventType === "unsubscribe" || eventType === "spamreport" || eventType === "bounce" || eventType === "blocked") {
        if (email) {
          await prisma.newsletterSubscription.updateMany({
            where: { email },
            data: {
              status: "unsubscribed",
              unsubscribedAt: new Date(),
            },
          });
        }
      }

      if (sgMessageId) {
        const logBySg = await prisma.emailLog.findFirst({
          where: { sendgridMessageId: sgMessageId },
          select: { id: true, messageId: true },
        });
        if (logBySg) {
          await trackEmailEvent({
            messageId: logBySg.messageId || undefined,
            eventType,
            campaignId,
            ip,
            userAgent,
            clickUrl: url,
          });
        }
      } else if (email && campaignId) {
        await trackEmailEvent({
          to: email,
          campaignId,
          eventType,
          ip,
          userAgent,
          clickUrl: url,
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[newsletter] Webhook processing failed:", error);
    return Response.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
