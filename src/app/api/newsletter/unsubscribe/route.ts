import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateUnsubscribeToken, hashUnsubscribeToken, SITE_URL_ENV } from "@/lib/email";

const UnsubscribeSchema = z.object({
  token: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = UnsubscribeSchema.parse(body);

    if (token) {
      const tokenHash = hashUnsubscribeToken(token);
      let sub = await prisma.newsletterSubscription.findFirst({
        where: { unsubscribeTokenHash: tokenHash, status: "active" },
        select: { id: true, email: true },
      });

      if (!sub) {
        const allActive = await prisma.newsletterSubscription.findMany({
          where: { status: "active", unsubscribeTokenHash: null },
          select: { id: true, email: true },
        });
        for (const s of allActive) {
          if (generateUnsubscribeToken(s.email) === token) {
            const hash = hashUnsubscribeToken(token);
            await prisma.newsletterSubscription.update({
              where: { id: s.id },
              data: { unsubscribeTokenHash: hash },
            });
            sub = s;
            break;
          }
        }
      }

      if (sub) {
        await prisma.newsletterSubscription.update({
          where: { id: sub.id },
          data: { status: "unsubscribed", unsubscribedAt: new Date(), unsubscribeTokenHash: null },
        });
        return Response.json({ message: "Unsubscribed" });
      }

      return Response.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    return Response.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const campaignId = searchParams.get("cid") || undefined;

  if (!token) {
    return Response.json({ error: "Missing token" }, { status: 400 });
  }

  const tokenHash = hashUnsubscribeToken(token);
  let sub = await prisma.newsletterSubscription.findFirst({
    where: { unsubscribeTokenHash: tokenHash, status: "active" },
    select: { id: true, email: true },
  });

  if (!sub) {
    const allActive = await prisma.newsletterSubscription.findMany({
      where: { status: "active", unsubscribeTokenHash: null },
      select: { id: true, email: true },
    });
    for (const s of allActive) {
      if (generateUnsubscribeToken(s.email) === token) {
        const hash = hashUnsubscribeToken(token);
        await prisma.newsletterSubscription.update({
          where: { id: s.id },
          data: { unsubscribeTokenHash: hash },
        });
        sub = s;
        break;
      }
    }
  }

  if (!sub) {
    return Response.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  await prisma.newsletterSubscription.update({
    where: { id: sub.id },
    data: { status: "unsubscribed", unsubscribedAt: new Date(), unsubscribeTokenHash: null },
  });

  if (campaignId) {
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { unsubscribes: { increment: 1 } },
    }).catch(() => {});
  }

  return Response.redirect(new URL("/?unsubscribed=1", SITE_URL_ENV));
}
