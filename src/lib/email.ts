import sgMail from "@sendgrid/mail";
import crypto from "crypto";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@cortexprism.io";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "CortexPrism";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cortexprism.io";
const NEWSLETTER_UNSUBSCRIBE_SECRET = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.JWT_SECRET || "";

const isConfigured = !!SENDGRID_API_KEY;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function buildEmail(
  to: string,
  subject: string,
  html: string,
  customArgs?: Record<string, string>
) {
  return {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    html,
    trackingSettings: {
      openTracking: { enable: true },
      clickTracking: { enable: true, enableText: false },
      subscriptionTracking: { enable: true, substitutionTag: "[unsubscribe]", html: "", text: "" },
    },
    customArgs: customArgs || {},
  };
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  customArgs?: Record<string, string>
): Promise<boolean> {
  if (!isConfigured) {
    console.log(`[email] Skipping email to ${to}: "${subject}" (SendGrid not configured)`);
    return false;
  }
  try {
    await sgMail.send(buildEmail(to, subject, html, customArgs));
    return true;
  } catch {
    console.error(`[email] Failed to send email to ${to}: "${subject}"`);
    return false;
  }
}

function wrapTemplate(title: string, bodyHtml: string, cta?: { text: string; url: string }, footerHtml?: string) {
  const ctaBlock = cta ? `
  <!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHtml(cta.url)}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="#6366f1" fillcolor="#6366f1">
    <w:anchorlock/>
    <center style="color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:16px;font-weight:600;">${escapeHtml(cta.text)}</center>
  </v:roundrect>
  <![endif]-->
  <!--[if !mso]><!-- -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0 0;width:100%">
    <tr>
      <td align="center" style="padding:0">
        <a href="${escapeHtml(cta.url)}" target="_blank" class="cta-button" style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:600;color:#ffffff;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;text-decoration:none;text-align:center;mso-hide:all;">${escapeHtml(cta.text)}</a>
      </td>
    </tr>
  </table>
  <!--<![endif]-->` : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; }
    td { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }
  </style>
  <![endif]-->
  <style type="text/css">
    @media only screen and (max-width: 480px) {
      .body-padding { padding: 20px 12px !important; }
      .card-padding { padding: 28px 20px !important; }
      .h1-mobile { font-size: 20px !important; }
      .body-mobile { font-size: 15px !important; line-height: 1.6 !important; }
      .cta-button { display: block !important; width: auto !important; padding: 14px 20px !important; font-size: 15px !important; }
      .footer-links { font-size: 12px !important; }
      .footer-links td { display: inline-block !important; padding: 2px 6px !important; }
      .social-section { padding-top: 20px !important; }
    }
    @media only screen and (max-width: 375px) {
      .card-padding { padding: 22px 14px !important; }
      .h1-mobile { font-size: 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#050508">
    <!-- Preheader -->
    <tr>
      <td style="height:0;max-height:0;line-height:0;overflow:hidden;display:none;mso-hide:all" aria-hidden="true">
        ${escapeHtml(title)} — from CortexPrism
      </td>
    </tr>
    <!-- Main wrapper -->
    <tr>
      <td align="center" class="body-padding" style="padding:40px 20px 20px">
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
          <!-- Header / Logo -->
          <tr>
            <td style="padding:0 0 28px 0;text-align:center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto">
                <tr>
                  <td style="width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:10px;text-align:center">
                    <span style="font-size:18px;font-weight:800;color:#ffffff;line-height:36px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;mso-line-height-rule:exactly;">C</span>
                  </td>
                  <td style="padding-left:10px">
                    <span style="font-size:20px;font-weight:700;color:#e2e2ea;letter-spacing:-0.4px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">CortexPrism</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Accent bar -->
          <tr>
            <td style="height:3px;line-height:3px;font-size:0;background:linear-gradient(90deg,#6366f1,#a855f7,#ec4899);border-radius:3px 3px 0 0;">&nbsp;</td>
          </tr>
          <!-- Content card -->
          <tr>
            <td class="card-padding" style="background:#0d0d14;border:1px solid rgba(255,255,255,0.06);border-top:none;border-radius:0 0 12px 12px;padding:40px 48px">
              <h1 class="h1-mobile" style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#f0f0f5;line-height:1.3;letter-spacing:-0.3px;">${escapeHtml(title)}</h1>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 24px 0">
                <tr>
                  <td style="width:40px;height:2px;line-height:2px;font-size:0;background:linear-gradient(90deg,#6366f1,transparent);">&nbsp;</td>
                </tr>
              </table>
              <div class="body-mobile" style="font-size:16px;line-height:1.7;color:#a1a1b0;mso-line-height-rule:exactly;">
                ${bodyHtml}
              </div>
              ${ctaBlock}
            </td>
          </tr>
          <!-- Spacer -->
          <tr>
            <td style="height:28px;line-height:28px;font-size:0;">&nbsp;</td>
          </tr>
          <!-- Social + Footer -->
          <tr>
            <td class="social-section" style="text-align:center;padding:0 0 16px 0;">
              ${footerHtml ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 12px auto;">
                <tr><td style="font-size:12px;color:#55556a;line-height:1.5;padding:0 8px;">${footerHtml}</td></tr>
              </table>` : ""}
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="footer-links" style="margin:0 auto;">
                <tr>
                  <td style="font-size:12px;color:#4a4a5e;padding:0 6px;">
                    <a href="https://github.com/CortexPrism/cortex" target="_blank" style="color:#55556a;text-decoration:none;">GitHub</a>
                  </td>
                  <td style="font-size:12px;color:#2a2a36;padding:0 4px;">·</td>
                  <td style="font-size:12px;color:#4a4a5e;padding:0 6px;">
                    <a href="https://discord.gg/wYxbmQeWY3" target="_blank" style="color:#55556a;text-decoration:none;">Discord</a>
                  </td>
                  <td style="font-size:12px;color:#2a2a36;padding:0 4px;">·</td>
                  <td style="font-size:12px;color:#4a4a5e;padding:0 6px;">
                    <a href="${SITE_URL}/docs" target="_blank" style="color:#55556a;text-decoration:none;">Docs</a>
                  </td>
                  <td style="font-size:12px;color:#2a2a36;padding:0 4px;">·</td>
                  <td style="font-size:12px;color:#4a4a5e;padding:0 6px;">
                    <a href="${SITE_URL}" target="_blank" style="color:#55556a;text-decoration:none;">Website</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Tagline -->
          <tr>
            <td style="text-align:center;padding:0 0 20px 0;">
              <p style="margin:0;font-size:11px;color:#3d3d50;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">CortexPrism — Open-Source Agent Operating System</p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateUnsubscribeToken(email: string): string {
  if (!NEWSLETTER_UNSUBSCRIBE_SECRET) {
    throw new Error("NEWSLETTER_UNSUBSCRIBE_SECRET or JWT_SECRET must be set to generate unsubscribe tokens");
  }
  return crypto.createHmac("sha256", NEWSLETTER_UNSUBSCRIBE_SECRET).update(`unsub:${email}`).digest("hex").slice(0, 32);
}

export function hashVerificationToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/ on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/ on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "");
}

export function renderSubmissionApprovedEmail(username: string, itemType: string, itemName: string, itemUrl: string) {
  const safeUsername = escapeHtml(username);
  const safeItemName = escapeHtml(itemName);
  const safeItemUrl = escapeHtml(itemUrl);
  const safeType = escapeHtml(itemType);
  return {
    subject: `Your ${safeType} "${safeItemName}" has been approved`,
    html: wrapTemplate(
      "Submission Approved",
      `<p>Hi ${safeUsername},</p><p>Your ${safeType} <strong style="color:#e2e2ea">${safeItemName}</strong> has been reviewed and approved. It's now live in the CortexPrism marketplace.</p>`,
      { text: `View ${safeType === "plugin" ? "Plugin" : "Agent"}`, url: safeItemUrl }
    ),
  };
}

export function renderSubmissionRejectedEmail(username: string, itemType: string, itemName: string, notes?: string) {
  const safeUsername = escapeHtml(username);
  const safeItemName = escapeHtml(itemName);
  const safeType = escapeHtml(itemType);
  const safeNotes = notes ? escapeHtml(notes) : null;
  return {
    subject: `Your ${safeType} "${safeItemName}" submission update`,
    html: wrapTemplate(
      "Submission Update",
      `<p>Hi ${safeUsername},</p><p>Your ${safeType} <strong style="color:#e2e2ea">${safeItemName}</strong> has been reviewed and was not approved at this time.</p>${safeNotes ? `<div style="margin-top:12px;padding:12px;background:#0a0a0f;border-radius:8px;border:1px solid rgba(255,255,255,0.07)"><p style="margin:0;font-size:13px;color:#9090a8">${safeNotes}</p></div>` : ""}<p style="font-size:13px;margin-top:16px">You can review the feedback and resubmit an updated version.</p>`,
      { text: "View Submission", url: `${SITE_URL}/dashboard` }
    ),
  };
}

export function renderWelcomeEmail(username: string) {
  const safeUsername = escapeHtml(username);
  return {
    subject: "Welcome to CortexPrism",
    html: wrapTemplate(
      "Welcome to CortexPrism",
      `<p>Hi ${safeUsername},</p><p>Welcome to CortexPrism! You now have access to the full marketplace where you can discover and publish plugins and agent configs.</p><p>Here are some things you can do:</p><ul style="padding-left:20px;margin:12px 0;font-size:14px;line-height:1.8;color:#9090a8"><li>Browse the <a href="${SITE_URL}/marketplace" style="color:#6366f1">marketplace</a> for plugins and agents</li><li><a href="${SITE_URL}/marketplace/publish/plugin" style="color:#6366f1">Publish your own plugin</a></li><li>Check out the <a href="${SITE_URL}/docs" style="color:#6366f1">documentation</a> to learn more</li></ul>`,
      { text: "Get Started", url: `${SITE_URL}/getting-started` }
    ),
  };
}

export function renderNewsletterVerificationEmail(email: string, token: string) {
  const safeEmail = escapeHtml(email);
  const verifyUrl = `${SITE_URL}/api/newsletter/verify?token=${encodeURIComponent(token)}`;
  return {
    subject: "Confirm your CortexPrism newsletter subscription",
    html: wrapTemplate(
      "Confirm your subscription",
      `<p>Hi there,</p><p>Please confirm your newsletter subscription by clicking the button below:</p><p style="font-size:13px;color:#55556a">This email was requested for <strong style="color:#e2e2ea">${safeEmail}</strong>. If you didn't request this, you can safely ignore this email.</p>`,
      { text: "Confirm Subscription", url: verifyUrl }
    ),
  };
}

export function renderNewsletterCampaignEmail(
  subject: string,
  content: string,
  unsubscribeToken: string,
  campaignId?: string
) {
  const cid = campaignId ? `&cid=${encodeURIComponent(campaignId)}` : "";
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}${cid}`;
  return {
    subject,
    html: wrapTemplate(
      subject,
      sanitizeHtml(content),
      undefined,
      `<p style="margin:8px 0 0 0;font-size:11px"><a href="${unsubscribeUrl}" style="color:#55556a;text-decoration:underline">Unsubscribe</a> from the CortexPrism newsletter</p>`
    ),
  };
}

export async function sendBulkEmails(
  recipients: { email: string; unsubscribeToken: string }[],
  subject: string,
  content: string,
  campaignId?: string,
  onProgress?: (sent: number, total: number) => void
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i++) {
    const { email: to, unsubscribeToken } = recipients[i];
    const emailHtml = renderNewsletterCampaignEmail(subject, content, unsubscribeToken, campaignId).html;
    const customArgs: Record<string, string> = { subscriber_email: to };
    if (campaignId) customArgs.campaign_id = campaignId;
    const success = await sendEmail(to, subject, emailHtml, customArgs);
    if (success) {
      sent++;
    } else {
      failed++;
    }
    onProgress?.(sent + failed, recipients.length);
    if (i < recipients.length - 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return { sent, failed };
}
