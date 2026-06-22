import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const events = await request.json();
    const eventList = Array.isArray(events) ? events : [events];

    for (const event of eventList) {
      const campaignId = event.campaign_id || event.custom_args ? JSON.parse(typeof event.custom_args === "string" ? event.custom_args : "{}").campaign_id : undefined;

      if (!campaignId) continue;

      const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) continue;

      switch (event.event) {
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
          const email = event.email;
          if (email) {
            await prisma.newsletterSubscription.updateMany({
              where: { email: email.toLowerCase().trim() },
              data: { status: "unsubscribed", unsubscribedAt: new Date() },
            });
          }
          break;

        case "bounce":
        case "blocked":
          await prisma.newsletterCampaign.update({
            where: { id: campaignId },
            data: { bounces: { increment: 1 } },
          });
          break;
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[newsletter] Webhook processing failed:", error);
    return Response.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
