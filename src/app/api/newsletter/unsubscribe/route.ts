import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateUnsubscribeToken } from "@/lib/email";

const UnsubscribeSchema = z.object({
  token: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = UnsubscribeSchema.parse(body);

    if (token) {
      const allActive = await prisma.newsletterSubscription.findMany({
        where: { status: "active" },
        select: { id: true, email: true },
      });
      for (const sub of allActive) {
        if (generateUnsubscribeToken(sub.email) === token) {
          await prisma.newsletterSubscription.update({
            where: { id: sub.id },
            data: { status: "unsubscribed", unsubscribedAt: new Date(), unsubscribeTokenHash: null },
          });
          return Response.json({ message: "Unsubscribed" });
        }
      }
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

  const allActive = await prisma.newsletterSubscription.findMany({
    where: { status: "active" },
    select: { id: true, email: true },
  });
  for (const sub of allActive) {
    if (generateUnsubscribeToken(sub.email) === token) {
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

      return Response.redirect(new URL("/?unsubscribed=1", request.url));
    }
  }

  return Response.json({ error: "Invalid or expired token" }, { status: 400 });
}
