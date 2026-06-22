import { prisma } from "@/lib/prisma";
import { sendEmail, renderSubmissionApprovedEmail, renderSubmissionRejectedEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

type SubmissionType = "plugin" | "agent";

export async function notifySubmissionAction(
  type: SubmissionType,
  record: { id: string; name: string; slug: string; userId: string | null },
  action: "approved" | "rejected",
  notes?: string,
) {
  if (!record.userId) return;

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) return;

  const prefs = user.preferences ? JSON.parse(user.preferences) : {};
  const notify = prefs.emailNotifications !== false;

  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  const itemUrl = `${siteUrl}/marketplace/${type}s/${record.slug}`;

  if (action === "approved") {
    const { subject, html } = renderSubmissionApprovedEmail(user.username, type, record.name, itemUrl);
    if (notify) await sendEmail(user.email, subject, html);
    await createNotification({
      userId: user.id,
      type: "submission_approved",
      title: `${type === "plugin" ? "Plugin" : "Agent"} approved`,
      body: `Your ${type} "${record.name}" has been approved and is now live.`,
      link: itemUrl,
    });
  } else {
    const { subject, html } = renderSubmissionRejectedEmail(user.username, type, record.name, notes);
    if (notify) await sendEmail(user.email, subject, html);
    await createNotification({
      userId: user.id,
      type: "submission_rejected",
      title: `${type === "plugin" ? "Plugin" : "Agent"} not approved`,
      body: `Your ${type} "${record.name}" was not approved.${notes ? ` Reason: ${notes}` : ""}`,
      link: `/dashboard`,
    });
  }
}
