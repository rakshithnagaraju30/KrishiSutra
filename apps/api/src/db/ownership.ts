/**
 * Ownership filters for farmer-owned records.
 *
 * Every query for farmer data must be scoped to the signed-in user. Spreading these filters into a
 * `where` clause makes another farmer's record behave exactly like a missing record (null / 404),
 * instead of relying on each route to remember a separate check. Soft-deleted rows are excluded.
 *
 *   prisma.farmCrop.findFirst({ where: { id, ...ownedFarmCrop(userId) } })
 */
import type { Prisma } from '../../generated/prisma/client.ts';

export const ownedFarm = (userId: string): Prisma.FarmWhereInput => ({ ownerId: userId, deletedAt: null });

export const ownedPlot = (userId: string): Prisma.FarmPlotWhereInput => ({
  deletedAt: null,
  farm: ownedFarm(userId),
});

export const ownedFarmCrop = (userId: string): Prisma.FarmCropWhereInput => ({
  deletedAt: null,
  farmPlot: ownedPlot(userId),
});

export const ownedSoilTest = (userId: string): Prisma.SoilTestWhereInput => ({
  deletedAt: null,
  plot: ownedPlot(userId),
});

export const ownedCropTask = (userId: string): Prisma.CropTaskWhereInput => ({
  farmCrop: ownedFarmCrop(userId),
});

export const ownedHarvest = (userId: string): Prisma.HarvestRecordWhereInput => ({
  deletedAt: null,
  farmCrop: ownedFarmCrop(userId),
});

export const ownedRecommendation = (userId: string): Prisma.CropRecommendationWhereInput => ({ userId });
