import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashVerificationToken, hashUnsubscribeToken, generateUnsubscribeToken, sendEmail, renderNewsletterWelcomeEmail, SITE_URL_ENV } from "@/lib/email";

const verifyRateLimitMap = new Map<string, { count: number; windowStart: number }>();
const VERIFY_RATE_LIMIT_WINDOW_MS = 60_000;
const VERIFY_RATE_LIMIT_MAX = 10;

function isVerifyRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = verifyRateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > VERIFY_RATE_LIMIT_WINDOW_MS) {
    verifyRateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  if (entry.count > VERIFY_RATE_LIMIT_MAX) return true;
  return false;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  if (isVerifyRateLimited(ip)) {
    return Response.json({ error: "Too many verification attempts" }, { status: 429 });
  }
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

  const unsubToken = generateUnsubscribeToken(sub.email);
  const unsubTokenHash = hashUnsubscribeToken(unsubToken);

  await prisma.newsletterSubscription.update({
    where: { id: sub.id },
    data: { status: "active", verificationTokenHash: null, unsubscribeTokenHash: unsubTokenHash, subscribedAt: new Date() },
  });

  const welcome = renderNewsletterWelcomeEmail();
  sendEmail(sub.email, welcome.subject, welcome.html, undefined, { type: "newsletter_welcome" }).catch(() => {});

  return Response.redirect(new URL("/?subscribed=1", SITE_URL_ENV));
}
