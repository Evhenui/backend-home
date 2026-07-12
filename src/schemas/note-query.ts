import { z } from 'zod';

export const listQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  sort:   z.enum(['createdAt', 'title']).default('createdAt'),
  order:  z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  tag:    z.string().trim().toLowerCase().optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;