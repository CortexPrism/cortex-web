import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { generateUnsubscribeToken, renderNewsletterCampaignEmail, sendEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";

const TestSendSchema = z.object({
  email: z.string().email(),
});

export async function POST(
  request: NextRequest,
  { params: pp }: { params: Promise<{ id: string }> }
) {
  const params = await pp;
  const user = getAuthUser(request);
  if (!user || !requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email: testEmail } = TestSendSchema.parse(body);

    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "draft" && campaign.status !== "scheduled") {
      return Response.json({ error: "Test sends are only available for draft or scheduled campaigns" }, { status: 400 });
    }

    const token = generateUnsubscribeToken(testEmail);
    const rendered = renderNewsletterCampaignEmail(
      campaign.subject,
      campaign.content,
      token,
      params.id
    );

    const success = await sendEmail(
      testEmail,
      `[TEST] ${rendered.subject}`,
      rendered.html,
      { campaign_id: params.id, subscriber_email: testEmail, test_send: "true" },
      { type: "newsletter_campaign", campaignId: params.id, metadata: { subscriber_email: testEmail, test_send: "true" } }
    );

    if (!success) {
      return Response.json({ error: "Failed to send test email — check server logs" }, { status: 500 });
    }

    await createAuditLog({
      userId: user.userId,
      action: "newsletter_campaign_test_sent",
      entity: "NewsletterCampaign",
      entityId: params.id,
      metadata: { subject: campaign.subject, testEmail },
    });

    return Response.json({ success: true, message: `Test email sent to ${testEmail}` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
      return Response.json({ error: `Validation failed: ${messages.join("; ")}` }, { status: 400 });
    }
    console.error("[newsletter] Test send failed:", error);
    return Response.json({ error: "Failed to send test email" }, { status: 500 });
  }
}
