import { z } from 'zod';

const code = z.string().regex(/^[A-Z][A-Z0-9_]*$/, 'must be a code like RED');

/** Everything is optional: the more the farmer provides, the more criteria can be checked. */
export const recommendationBody = z.object({
  plotId: z.uuid().optional(),
  season: code.optional(),
  soilType: code.optional(),
  waterSources: z.array(z.object({ type: code, availability: z.enum(['PERENNIAL', 'SEASONAL', 'UNRELIABLE', 'UNKNOWN']).default('UNKNOWN') })).max(10).optional(),
  soilTest: z.array(z.object({ parameter: code, value: z.number().min(0).max(100000), unit: code.optional() })).max(30).optional(),
  budget: z.number().min(0).max(1_000_000_000).optional(),
  area: z.number().positive().max(100000).optional(),
  areaUnit: code.optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  district: z.string().trim().min(1).max(100).optional(),
  state: z.string().trim().min(1).max(100).optional(),
}).refine((v) => (v.area === undefined) === (v.areaUnit === undefined), { message: 'area and areaUnit go together', path: ['areaUnit'] });
export type RecommendationBody = z.infer<typeof recommendationBody>;
