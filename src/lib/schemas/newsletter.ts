import { z } from "zod";

export const FilterCriteriaSchema = z.object({
  subscribedAfter: z.string().datetime().optional(),
  subscribedBefore: z.string().datetime().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
}).optional().nullable();

export type FilterCriteria = z.infer<typeof FilterCriteriaSchema>;
