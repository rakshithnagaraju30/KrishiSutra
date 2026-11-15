import { z } from 'zod';

export const isoDate = z.iso.date('must be a date like 2026-11-15');
const code = z.string().regex(/^[A-Z][A-Z0-9_]*$/, 'must be a code like ACRE');
const text = (max: number) => z.string().trim().min(1).max(max);
const positive = z.number({ error: 'must be a number' }).positive('must be greater than 0').max(1_000_000_000);
const nonNegative = z.number({ error: 'must be a number' }).min(0, 'must be 0 or more').max(1_000_000_000);

export const idParams = z.object({ id: z.uuid('must be a valid id') });

export const createFarmBody = z.object({
  name: text(150),
  state: text(100).optional(),
  district: text(100).optional(),
  taluk: text(100).optional(),
  village: text(150).optional(),
  pincode: z.string().regex(/^\d{6}$/, 'must be a 6-digit PIN code').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  totalArea: positive.optional(),
  totalAreaUnit: code.optional(),
}).refine((v) => (v.totalArea === undefined) === (v.totalAreaUnit === undefined), { message: 'totalArea and totalAreaUnit go together', path: ['totalAreaUnit'] })
  .refine((v) => (v.latitude === undefined) === (v.longitude === undefined), { message: 'latitude and longitude go together', path: ['longitude'] });
export const updateFarmBody = z.object({
  name: text(150).optional(),
  state: text(100).optional(),
  district: text(100).optional(),
  taluk: text(100).optional(),
  village: text(150).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const IRRIGATION_METHODS = ['RAINFED', 'FLOOD', 'FURROW', 'BASIN', 'DRIP', 'SPRINKLER', 'MANUAL', 'OTHER'] as const;
export const createPlotBody = z.object({
  name: text(150),
  area: positive,
  areaUnit: code,
  soilType: code.optional(),
  irrigationMethod: z.enum(IRRIGATION_METHODS).optional(),
  surveyNumber: text(50).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
export const updatePlotBody = createPlotBody.partial();

export const createWaterSourceBody = z.object({
  type: code,
  name: text(150).optional(),
  availability: z.enum(['PERENNIAL', 'SEASONAL', 'UNRELIABLE', 'UNKNOWN']).default('UNKNOWN'),
  availableMonths: z.array(z.number().int().min(1).max(12)).max(12).default([]),
  plotIds: z.array(z.uuid()).max(50).default([]),
});

export const createSoilTestBody = z.object({
  testDate: isoDate,
  source: z.enum(['SOIL_HEALTH_CARD', 'GOVERNMENT_LAB', 'PRIVATE_LAB', 'KRISHI_VIGYAN_KENDRA', 'FIELD_TEST_KIT', 'OTHER']).default('OTHER'),
  laboratoryName: text(200).optional(),
  results: z.array(z.object({ parameter: code, value: nonNegative, unit: code.optional() })).min(1).max(30),
});

export const startCropBody = z.object({
  plotId: z.uuid(),
  cropSlug: z.string().regex(/^[a-z0-9-]+$/),
  varietySlug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  procedureId: z.uuid().optional(),
  season: code.optional(),
  plantingDate: isoDate.optional(),
  cultivatedArea: positive,
  areaUnit: code,
  label: text(150).optional(),
  recommendationItemId: z.uuid().optional(),
});
export const CULTIVATION_STATUSES = ['PLANNED', 'ACTIVE', 'HARVESTING', 'COMPLETED', 'FAILED', 'ABANDONED'] as const;
export const updateFarmCropBody = z.object({
  status: z.enum(CULTIVATION_STATUSES).optional(),
  label: text(150).optional(),
  notes: z.string().max(2000).optional(),
  plantingDate: isoDate.optional(),
  actualHarvestDate: isoDate.optional(),
});

export const updateTaskBody = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'SKIPPED']).optional(),
  dueDate: isoDate.optional(),
  title: text(200).optional(),
  notes: z.string().max(2000).optional(),
  skippedReason: z.string().max(500).optional(),
});
export const createTaskBody = z.object({ title: text(200), description: z.string().max(2000).optional(), dueDate: isoDate.optional() });

export const ACTIVITY_TYPES = [
  'LAND_PREPARATION', 'SEED_TREATMENT', 'NURSERY', 'SOWING', 'TRANSPLANTING', 'IRRIGATION', 'FERTILIZER_APPLICATION',
  'PEST_CONTROL', 'WEEDING', 'INTERCULTURE', 'PRUNING', 'HARVESTING', 'POST_HARVEST', 'OTHER',
] as const;
export const createActivityBody = z.object({
  activityType: z.enum(ACTIVITY_TYPES),
  activityDate: isoDate,
  title: text(200).optional(),
  description: z.string().max(2000).optional(),
  taskId: z.uuid().optional(),
  labourCount: z.number().int().min(0).max(1000).optional(),
});

export const EXPENSE_CATEGORIES = ['SEEDS', 'FERTILIZER', 'ORGANIC_MANURE', 'PEST_CONTROL', 'LABOUR', 'IRRIGATION', 'MACHINERY', 'LAND_RENT', 'TRANSPORT', 'STORAGE', 'MARKETING', 'OTHER'] as const;
export const PAYMENT_MODES = ['CASH', 'UPI', 'BANK_TRANSFER', 'CREDIT', 'OTHER'] as const;
export const createExpenseBody = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  expenseDate: isoDate,
  amount: nonNegative,
  description: text(300).optional(),
  paymentMode: z.enum(PAYMENT_MODES).optional(),
});

export const createHarvestBody = z.object({
  harvestDate: isoDate,
  quantity: nonNegative,
  unit: code,
  qualityGrade: text(50).optional(),
  notes: z.string().max(2000).optional(),
});

export const createSaleBody = z.object({
  saleDate: isoDate,
  quantitySold: positive,
  unit: code,
  pricePerUnit: nonNegative,
  deductions: nonNegative.default(0),
  buyerType: z.enum(['MANDI_TRADER', 'COMMISSION_AGENT', 'FPO', 'PROCESSOR', 'EXPORTER', 'RETAIL_CONSUMER', 'GOVERNMENT_PROCUREMENT', 'OTHER']).optional(),
  buyerName: text(200).optional(),
  marketName: text(200).optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIALLY_PAID', 'PAID']).default('PENDING'),
  paymentMode: z.enum(PAYMENT_MODES).optional(),
});

export type CreateFarmBody = z.infer<typeof createFarmBody>;
export type UpdateFarmBody = z.infer<typeof updateFarmBody>;
export type CreatePlotBody = z.infer<typeof createPlotBody>;
export type UpdatePlotBody = z.infer<typeof updatePlotBody>;
export type CreateWaterSourceBody = z.infer<typeof createWaterSourceBody>;
export type CreateSoilTestBody = z.infer<typeof createSoilTestBody>;
export type StartCropBody = z.infer<typeof startCropBody>;
export type UpdateFarmCropBody = z.infer<typeof updateFarmCropBody>;
export type UpdateTaskBody = z.infer<typeof updateTaskBody>;
export type CreateTaskBody = z.infer<typeof createTaskBody>;
export type CreateActivityBody = z.infer<typeof createActivityBody>;
export type CreateExpenseBody = z.infer<typeof createExpenseBody>;
export type CreateHarvestBody = z.infer<typeof createHarvestBody>;
export type CreateSaleBody = z.infer<typeof createSaleBody>;
