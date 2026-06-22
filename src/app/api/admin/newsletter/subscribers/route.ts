import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { sendEmail, renderNewsletterVerificationEmail, hashVerificationToken } from "@/lib/email";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const rawLimit = parseInt(searchParams.get("limit") || "20", 10);
    const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, 1000);
    const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 50);

    const where: Record<string, unknown> = {};
    if (search) where.email = { contains: search };
    if (status && ["pending", "active", "unsubscribed"].includes(status)) where.status = status;

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.newsletterSubscription.count({ where }),
    ]);

    return Response.json({
      subscribers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[newsletter] Failed to list subscribers:", error);
    return Response.json({ error: "Failed to list subscribers" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser || !requireAdmin(authUser)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return Response.json({ error: "Subscriber ID is required" }, { status: 400 });
    }

    const sub = await prisma.newsletterSubscription.findUnique({ where: { id } });
    await prisma.newsletterSubscription.delete({ where: { id } });

    await createAuditLog({
      userId: authUser.userId,
      action: "newsletter_subscriber_deleted",
      entity: "NewsletterSubscription",
      entityId: id,
      metadata: sub ? { email: sub.email, status: sub.status } : undefined,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}

const ActivateSchema = z.object({
  action: z.enum(["activate", "activate_all_pending", "resend_verification"]),
  id: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser || !requireAdmin(authUser)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, id } = ActivateSchema.parse(body);

    if (action === "activate_all_pending") {
      const result = await prisma.newsletterSubscription.updateMany({
        where: { status: "pending" },
        data: { status: "active", subscribedAt: new Date(), verificationTokenHash: null },
      });

      await createAuditLog({
        userId: authUser.userId,
        action: "newsletter_subscribers_activated_all",
        entity: "NewsletterSubscription",
        metadata: { count: result.count },
      });

      return Response.json({ activated: result.count });
    }

    if (!id) {
      return Response.json({ error: "Subscriber ID is required" }, { status: 400 });
    }

    const sub = await prisma.newsletterSubscription.findUnique({ where: { id } });

    if (!sub) {
      return Response.json({ error: "Subscriber not found" }, { status: 404 });
    }

    if (action === "activate") {
      await prisma.newsletterSubscription.update({
        where: { id },
        data: { status: "active", subscribedAt: new Date(), verificationTokenHash: null },
      });

      await createAuditLog({
        userId: authUser.userId,
        action: "newsletter_subscriber_activated",
        entity: "NewsletterSubscription",
        entityId: id,
        metadata: { email: sub.email },
      });

      return Response.json({ message: "Activated" });
    }

    if (action === "resend_verification") {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenHash = hashVerificationToken(verificationToken);

      await prisma.newsletterSubscription.update({
        where: { id },
        data: { verificationTokenHash },
      });

      await sendEmail(
        sub.email,
        renderNewsletterVerificationEmail(sub.email, verificationToken).subject,
        renderNewsletterVerificationEmail(sub.email, verificationToken).html
      );

      return Response.json({ message: "Verification email sent" });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
      return Response.json({ error: `Validation failed: ${messages.join("; ")}` }, { status: 400 });
    }
    console.error("[newsletter] Subscriber action failed:", error);
    return Response.json({ error: "Failed to perform action" }, { status: 500 });
  }
}

const ImportSchema = z.object({
  emails: z.array(z.string().min(1)).min(1).max(5000),
});

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

function extractValidEmails(raw: string[]): string[] {
  const seen = new Set<string>();
  const valid: string[] = [];
  for (const entry of raw) {
    const match = entry.match(EMAIL_RE);
    if (match) {
      const email = match[0].toLowerCase();
      if (!seen.has(email)) {
        seen.add(email);
        valid.push(email);
      }
    }
  }
  return valid;
}

export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser || !requireAdmin(authUser)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { emails: rawEmails } = ImportSchema.parse(body);

    const emails = extractValidEmails(rawEmails);

    if (emails.length === 0) {
      return Response.json({ error: "No valid email addresses found in the input" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;

    for (const email of emails) {
      const existing = await prisma.newsletterSubscription.findUnique({
        where: { email },
      });

      if (existing) {
        if (existing.status === "unsubscribed") {
          await prisma.newsletterSubscription.update({
            where: { email },
            data: {
              status: "active",
              unsubscribedAt: null,
            },
          });
          created++;
        } else if (existing.status !== "active") {
          await prisma.newsletterSubscription.update({
            where: { email },
            data: { status: "active" },
          });
          created++;
        } else {
          skipped++;
        }
      } else {
        await prisma.newsletterSubscription.create({
          data: { email, status: "active" },
        });
        created++;
      }
    }

    await createAuditLog({
      userId: authUser.userId,
      action: "newsletter_subscribers_imported",
      entity: "NewsletterSubscription",
      metadata: { count: emails.length, rawCount: rawEmails.length, created, skipped },
    });

    return Response.json({ created, skipped, total: emails.length, rawTotal: rawEmails.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
      return Response.json({ error: `Validation failed: ${messages.join("; ")}` }, { status: 400 });
    }
    console.error("[newsletter] Import failed:", error);
    return Response.json({ error: "Failed to import subscribers" }, { status: 500 });
  }
}
