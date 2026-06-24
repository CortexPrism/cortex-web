import { NextRequest } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (status && ["active", "pending", "unsubscribed"].includes(status)) {
      where.status = status;
    }

    const subscribers = await prisma.newsletterSubscription.findMany({
      where,
      select: { email: true, firstName: true, lastName: true, status: true, subscribedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const header = "first_name,last_name,email,status,subscribed_at,created_at";
    const rows = subscribers.map((s) =>
      [
        s.firstName ? `"${s.firstName.replace(/"/g, '""')}"` : "",
        s.lastName ? `"${s.lastName.replace(/"/g, '""')}"` : "",
        `"${s.email.replace(/"/g, '""')}"`,
        s.status,
        s.subscribedAt?.toISOString() || "",
        s.createdAt.toISOString(),
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("[newsletter] Export failed:", error);
    return Response.json({ error: "Failed to export subscribers" }, { status: 500 });
  }
}
