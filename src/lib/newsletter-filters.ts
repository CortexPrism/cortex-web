import { FilterCriteriaSchema, FilterCriteria } from "@/lib/schemas/newsletter";

export function buildSubscriberWhere(filterCriteria: string | null): Record<string, unknown> {
  const where: Record<string, unknown> = { status: "active" };

  if (!filterCriteria) return where;

  let fc: FilterCriteria;
  try {
    const parsed = JSON.parse(filterCriteria);
    fc = FilterCriteriaSchema.parse(parsed);
  } catch {
    console.error("[newsletter] Invalid filterCriteria JSON, sending to zero subscribers as safety measure:", filterCriteria);
    return { status: "impossible_value_that_matches_nothing" };
  }

  if (fc && (fc.subscribedAfter || fc.subscribedBefore)) {
    const subscribedAt: Record<string, Date> = {};
    if (fc.subscribedAfter) subscribedAt.gte = new Date(fc.subscribedAfter);
    if (fc.subscribedBefore) subscribedAt.lte = new Date(fc.subscribedBefore);
    where.subscribedAt = subscribedAt;
  }
  if (fc && (fc.createdAfter || fc.createdBefore)) {
    const createdAt: Record<string, Date> = {};
    if (fc.createdAfter) createdAt.gte = new Date(fc.createdAfter);
    if (fc.createdBefore) createdAt.lte = new Date(fc.createdBefore);
    where.createdAt = createdAt;
  }

  return where;
}
