import { z } from "zod";

export const AdvancedSearchSchema = z.object({
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  tag: z.string().optional(),
  isFavorite: z.boolean().optional(),
  sizeMin: z.number().optional(),
  sizeMax: z.number().optional(),
  sharedOnly: z.boolean().optional(),
  createdBefore: z.string().datetime().optional(),
  createdAfter: z.string().datetime().optional(),
});

export type AdvancedSearchParams = z.infer<typeof AdvancedSearchSchema>;