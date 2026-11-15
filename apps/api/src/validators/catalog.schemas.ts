import { z } from 'zod';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a slug like "tomato"').max(160);

export const listCropsQuery = z.object({
  category: slug.optional(),
  q: z.string().trim().max(100).optional(),
  lang: z.string().optional(),
});
export const cropSlugParams = z.object({ slug });
export const procedureIdParams = z.object({ id: z.uuid('must be a valid id') });
