import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashVerificationToken, sendEmail, renderNewsletterWelcomeEmail, SITE_URL_ENV } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return Response.json({ error: "Missing verification token" }, { status: 400 });
  }

  const tokenHash = hashVerificationToken(token);

  const sub = await prisma.newsletterSubscription.findFirst({
    where: { verificationTokenHash: tokenHash },
  });

  if (!sub) {
    return Response.json({ error: "Invalid or expired verification token" }, { status: 400 });
  }

  await prisma.newsletterSubscription.update({
    where: { id: sub.id },
    data: { status: "active", verificationTokenHash: null, subscribedAt: new Date() },
  });

  const welcome = renderNewsletterWelcomeEmail();
  sendEmail(sub.email, welcome.subject, welcome.html, undefined, { type: "newsletter_welcome" }).catch(() => {});

  return Response.redirect(new URL("/?subscribed=1", SITE_URL_ENV));
}
