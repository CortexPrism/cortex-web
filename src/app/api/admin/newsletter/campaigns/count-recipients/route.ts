import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { FilterCriteriaSchema } from "@/lib/schemas/newsletter";
import { buildSubscriberWhere } from "@/lib/newsletter-filters";

const CountRecipientsSchema = z.object({
  filterCriteria: FilterCriteriaSchema,
});

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { filterCriteria } = CountRecipientsSchema.parse(body);

    const totalActive = await prisma.newsletterSubscription.count({
      where: { status: "active" },
    });

    const matching = await prisma.newsletterSubscription.count({
      where: buildSubscriberWhere(filterCriteria ? JSON.stringify(filterCriteria) : null),
    });

    return Response.json({ matching, totalActive });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    console.error("[newsletter] Failed to count recipients:", error);
    return Response.json({ error: "Failed to count recipients" }, { status: 500 });
  }
}
