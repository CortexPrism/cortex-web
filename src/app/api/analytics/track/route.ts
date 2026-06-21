import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown";
  if (ua.includes("Chrome")) return ua.includes("Edg") ? "Edge" : "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("curl")) return "curl";
  if (ua.includes("bot") || ua.includes("spider") || ua.includes("crawler")) return "Bot";
  return "Other";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { path, referrer } = body as { path?: string; referrer?: string };

    const pagePath = path || "/";
    const pageReferrer = referrer || request.headers.get("referer") || null;

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const ipHash = hashIP(ip);

    const rawUA = request.headers.get("user-agent");
    const userAgent = rawUA ? parseUserAgent(rawUA) : "Unknown";

    const country = request.headers.get("cf-ipcountry") || null;

    let sessionId = request.cookies.get("cortex_session")?.value;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let session = await prisma.analyticsSession.findUnique({
      where: { sessionId },
    });

    if (!session || session.lastVisitAt < thirtyDaysAgo) {
      if (!session) {
        session = await prisma.analyticsSession.create({
          data: {
            sessionId,
            ipHash,
            userAgent,
            country,
            referrer: pageReferrer,
          },
        });
      } else {
        session = await prisma.analyticsSession.update({
          where: { sessionId },
          data: {
            lastVisitAt: new Date(),
            ipHash,
            userAgent,
            country,
            referrer: pageReferrer,
          },
        });
      }
    } else {
      await prisma.analyticsSession.update({
        where: { sessionId },
        data: {
          lastVisitAt: new Date(),
          ipHash,
          userAgent,
          country,
        },
      });
    }

    const DEDUP_WINDOW_MS = 30_000;

    const lastView = await prisma.analyticsPageView.findFirst({
      where: {
        sessionId: session.sessionId,
        path: pagePath,
      },
      orderBy: { timestamp: "desc" },
      select: { timestamp: true },
    });

    const isDuplicate = lastView && (Date.now() - lastView.timestamp.getTime()) < DEDUP_WINDOW_MS;

    if (!isDuplicate) {
      await prisma.analyticsPageView.create({
        data: {
          sessionId: session.sessionId,
          path: pagePath,
          referrer: pageReferrer,
          userAgent,
        },
      });
    }

    const response = NextResponse.json({ ok: true });

    if (!request.cookies.get("cortex_session")) {
      response.cookies.set("cortex_session", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
