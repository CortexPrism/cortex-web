import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUnsubscribeToken, sendEmail, sendCampaignToSubscribers, renderAutomationEmail } from "@/lib/email";
import { buildSubscriberWhere } from "@/lib/newsletter-filters";

const BATCH_SIZE = 100;
const CRON_SECRET = process.env.CRON_SECRET;

function authorized(request: NextRequest): boolean {
  if (!CRON_SECRET) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${CRON_SECRET}`;
}

async function processScheduledCampaigns(): Promise<number> {
  const now = new Date();
  const due = await prisma.newsletterCampaign.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
    },
    select: { id: true, subject: true, content: true, filterCriteria: true },
    take: 5,
  });

  for (const campaign of due) {
    const updateResult = await prisma.newsletterCampaign.updateMany({
      where: { id: campaign.id, status: "scheduled", scheduledAt: { lte: now } },
      data: { status: "sending" },
    });

    if (updateResult.count === 0) continue;

    const subscriberWhere = buildSubscriberWhere(campaign.filterCriteria);
    const totalCount = await prisma.newsletterSubscription.count({ where: subscriberWhere });

    if (totalCount === 0) {
      await prisma.newsletterCampaign.update({
        where: { id: campaign.id },
        data: { status: "error" },
      });
      continue;
    }

    processCampaignSend(campaign.id, campaign.subject, campaign.content, campaign.filterCriteria, totalCount, subscriberWhere)
      .catch((e) => console.error(`[cron] Campaign ${campaign.id} send failed:`, e));
  }

  return due.length;
}

async function processCampaignSend(
  campaignId: string,
  subject: string,
  content: string,
  filterCriteria: string | null,
  totalCount: number,
  subscriberWhere: Record<string, unknown>
) {
  try {
    const { sent, failed } = await sendCampaignToSubscribers(campaignId, subject, content, subscriberWhere);

    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        status: "sent",
        sentAt: new Date(),
        sentCount: sent,
      },
    });

    console.log(`[cron] Campaign ${campaignId} completed: ${sent} sent, ${failed} failed`);
  } catch (error) {
    console.error(`[cron] Campaign ${campaignId} failed:`, error);
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { status: "error" },
    }).catch(() => {});
  }
}

async function processAutomations(): Promise<number> {
  const automations = await prisma.newsletterAutomation.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  let processed = 0;

  for (const automation of automations) {
    const subscriberWhere: Record<string, unknown> = { status: "active" };

    if (automation.type === "welcome" && automation.trigger === "on_subscribe") {
      if (automation.delayMinutes > 0) {
        const delayMs = automation.delayMinutes * 60 * 1000;
        const cutoff = new Date(Date.now() - delayMs);
        (subscriberWhere as Record<string, unknown>).subscribedAt = { gte: cutoff };
      }
    } else if (automation.type === "reengagement" && automation.trigger === "on_inactive") {
      const delayMs = automation.delayMinutes * 60 * 1000;
      const inactiveCutoff = new Date(Date.now() - delayMs - 30 * 24 * 60 * 60 * 1000);
      (subscriberWhere as Record<string, unknown>).subscribedAt = { lte: inactiveCutoff };
    }

    if (automation.filterCriteria) {
      try {
        const extra = JSON.parse(automation.filterCriteria);
        Object.assign(subscriberWhere, extra);
      } catch { /* ignore invalid JSON */ }
    }

    const newSubs = await prisma.newsletterSubscription.findMany({
      where: subscriberWhere,
      select: { id: true, email: true, firstName: true, lastName: true },
      take: BATCH_SIZE,
      orderBy: { id: "asc" },
    });

    if (newSubs.length === 0) continue;

    const subEmails = newSubs.map(s => s.email);

    const alreadySentLogs = await prisma.emailLog.findMany({
      where: {
        to: { in: subEmails },
        type: "newsletter_automation",
        metadata: { contains: automation.id },
      },
      select: { to: true },
    });

    const alreadySentEmails = new Set(alreadySentLogs.map(l => l.to));
    let sentInBatch = 0;

    for (const sub of newSubs) {
      if (alreadySentEmails.has(sub.email)) continue;

      const unsubscribeToken = generateUnsubscribeToken(sub.email);
      const emailResult = renderAutomationEmail(
        automation.subject, automation.content, unsubscribeToken,
        sub.firstName, sub.lastName, sub.email
      );

      const customArgs: Record<string, string> = { subscriber_email: sub.email };

      await sendEmail(sub.email, emailResult.subject, emailResult.html, customArgs, {
        type: "newsletter_automation",
        metadata: { automation_id: automation.id, automation_name: automation.name },
      });

      sentInBatch++;
      processed++;
    }

    if (sentInBatch > 0) {
      await prisma.newsletterAutomation.update({
        where: { id: automation.id },
        data: { sendCount: { increment: sentInBatch }, lastSentAt: new Date() },
      });
    }
  }

  return processed;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [campaignsProcessed, automationsProcessed] = await Promise.all([
    processScheduledCampaigns(),
    processAutomations(),
  ]);

  return Response.json({
    success: true,
    scheduledCampaignsTriggered: campaignsProcessed,
    automationsSent: automationsProcessed,
    timestamp: new Date().toISOString(),
  });
}
