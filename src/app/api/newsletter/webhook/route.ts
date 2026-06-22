import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function POST(request: NextRequest) {
  try {
    const events = await request.json();
    const eventList = Array.isArray(events) ? events : [events];

    for (const event of eventList) {
      const eventType = event.event as string;
      const campaignId = parseCampaignId(event);
      const email = typeof event.email === "string" ? event.email.toLowerCase().trim() : null;

      if (campaignId) {
        const campaign = await prisma.newsletterCampaign.findUnique({
          where: { id: campaignId },
          select: { id: true },
        });

        if (campaign) {
          switch (eventType) {
            case "open":
              await prisma.newsletterCampaign.update({
                where: { id: campaignId },
                data: { opens: { increment: 1 } },
              });
              break;

            case "click":
              await prisma.newsletterCampaign.update({
                where: { id: campaignId },
                data: { clicks: { increment: 1 } },
              });
              break;

            case "unsubscribe":
              await prisma.newsletterCampaign.update({
                where: { id: campaignId },
                data: { unsubscribes: { increment: 1 } },
              });
              break;

            case "bounce":
            case "blocked":
              await prisma.newsletterCampaign.update({
                where: { id: campaignId },
                data: { bounces: { increment: 1 } },
              });
              break;

            case "spamreport":
              await prisma.newsletterCampaign.update({
                where: { id: campaignId },
                data: { bounces: { increment: 1 } },
              });
              break;

            case "deferred":
            case "dropped":
              break;

            case "delivered":
              break;

            case "processed":
              break;

            default:
              break;
          }
        }
      }

      if ((eventType === "unsubscribe" || eventType === "spamreport" || eventType === "bounce") && email) {
        await prisma.newsletterSubscription.updateMany({
          where: { email },
          data: {
            status: "unsubscribed",
            unsubscribedAt: new Date(),
          },
        });
      }

      if (eventType === "bounce" && email) {
        await prisma.newsletterSubscription.updateMany({
          where: { email },
          data: { status: "unsubscribed", unsubscribedAt: new Date() },
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[newsletter] Webhook processing failed:", error);
    return Response.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
