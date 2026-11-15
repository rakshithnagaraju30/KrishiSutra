/**
 * Farmer-owned data: farms, plots, water sources, soil tests, cultivations (FarmCrop), tasks,
 * activities, expenses, harvests and sales.
 *
 * Rules:
 * - Every query is scoped with the ownership filters (src/db/ownership.ts): another farmer's record
 *   behaves exactly like a missing one (404).
 * - Starting a crop pins the PUBLISHED procedure version and copies its stages into tasks inside one
 *   transaction. Standard instructions are never modified.
 * - Money is computed with Decimal (no floating-point drift); sale totals match the database CHECKs.
 */
import { Prisma, type PrismaClient } from '../../generated/prisma/client.ts';
import type { UnitDimension } from '../../generated/prisma/enums.ts';
import { ownedFarm, ownedFarmCrop, ownedPlot } from '../db/ownership.ts';
import { HttpError } from '../utils/http-error.ts';
import type { LanguageCode } from '../utils/language.ts';
import type {
  CreateActivityBody, CreateExpenseBody, CreateFarmBody, CreateHarvestBody, CreatePlotBody, CreateSaleBody,
  CreateSoilTestBody, CreateTaskBody, CreateWaterSourceBody, StartCropBody, UpdateFarmBody, UpdateFarmCropBody,
  UpdatePlotBody, UpdateTaskBody,
} from '../validators/farm.schemas.ts';
import { PUBLISHED_CROP } from './catalog.service.ts';
import { loadTranslations } from './translation.ts';

const DAY_MS = 86_400_000;
export const toDate = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
export const dateString = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * DAY_MS);
const num = (v: { toString(): string } | null | undefined) => (v === null || v === undefined ? null : Number(v.toString()));
const notFound = (what: string) => new HttpError(404, 'NOT_FOUND', `${what} not found.`);
const invalid = (message: string, path: string) => new HttpError(400, 'VALIDATION_ERROR', message, [{ path, message, code: 'invalid' }]);

/** Day anchors we can turn into calendar dates from the planting date alone. */
const DATEABLE_ANCHORS = new Set(['SOWING', 'PLANTING', 'PROCEDURE_START']);

type StageForSchedule = { startDay: number | null; endDay: number | null; dayAnchor: string };
export function scheduleFor(stage: StageForSchedule, plantingDate: Date | null) {
  if (!plantingDate || !DATEABLE_ANCHORS.has(stage.dayAnchor)) return { start: null, due: null };
  return {
    start: stage.startDay !== null ? addDays(plantingDate, stage.startDay) : null,
    due: stage.endDay !== null ? addDays(plantingDate, stage.endDay) : stage.startDay !== null ? addDays(plantingDate, stage.startDay) : null,
  };
}

export type FarmService = ReturnType<typeof createFarmService>;

export function createFarmService(prisma: PrismaClient) {
  async function unitId(code: string, dimensions: UnitDimension[], path: string) {
    const unit = await prisma.measurementUnit.findUnique({ where: { code }, select: { id: true, dimension: true, isActive: true } });
    if (!unit || !unit.isActive || !dimensions.includes(unit.dimension)) throw invalid(`Unknown or unsuitable unit "${code}".`, path);
    return unit.id;
  }

  async function requireFarm(userId: string, farmId: string) {
    const farm = await prisma.farm.findFirst({ where: { id: farmId, ...ownedFarm(userId) }, select: { id: true } });
    if (!farm) throw notFound('Farm');
    return farm;
  }
  async function requirePlot(userId: string, plotId: string) {
    const plot = await prisma.farmPlot.findFirst({ where: { id: plotId, ...ownedPlot(userId) }, select: { id: true, farmId: true } });
    if (!plot) throw notFound('Plot');
    return plot;
  }
  async function requireFarmCrop(userId: string, farmCropId: string) {
    const fc = await prisma.farmCrop.findFirst({ where: { id: farmCropId, ...ownedFarmCrop(userId) }, select: { id: true, plantingDate: true, procedureVersionId: true } });
    if (!fc) throw notFound('Crop record');
    return fc;
  }

  const plotView = (p: {
    id: string; name: string; area: Prisma.Decimal; surveyNumber: string | null; irrigationMethod: string | null; latitude: Prisma.Decimal | null; longitude: Prisma.Decimal | null;
    areaUnit: { code: string; symbol: string }; soilType: { code: string; name: string } | null; waterSources?: { waterSource: { id: string } }[];
  }) => ({
    id: p.id, name: p.name, area: num(p.area), areaUnit: p.areaUnit.code, areaUnitSymbol: p.areaUnit.symbol,
    soilType: p.soilType?.code ?? null, irrigationMethod: p.irrigationMethod, surveyNumber: p.surveyNumber,
    latitude: num(p.latitude), longitude: num(p.longitude),
    waterSourceIds: p.waterSources?.map((w) => w.waterSource.id) ?? [],
  });
  const PLOT_SELECT = {
    id: true, name: true, area: true, surveyNumber: true, irrigationMethod: true, latitude: true, longitude: true,
    areaUnit: { select: { code: true, symbol: true } }, soilType: { select: { code: true, name: true } },
    waterSources: { select: { waterSource: { select: { id: true } } } },
  } as const;

  return {
    // ---------------------------------------------------------------- farms
    async listFarms(userId: string) {
      const farms = await prisma.farm.findMany({
        where: ownedFarm(userId),
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, village: true, district: true, state: true, latitude: true, longitude: true, _count: { select: { plots: { where: { deletedAt: null } } } } },
      });
      return farms.map((f) => ({ id: f.id, name: f.name, village: f.village, district: f.district, state: f.state, latitude: num(f.latitude), longitude: num(f.longitude), plotCount: f._count.plots }));
    },

    async getFarm(userId: string, farmId: string) {
      const farm = await prisma.farm.findFirst({
        where: { id: farmId, ...ownedFarm(userId) },
        select: {
          id: true, name: true, state: true, district: true, taluk: true, village: true, pincode: true, latitude: true, longitude: true, totalArea: true,
          totalAreaUnit: { select: { code: true } },
          plots: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' }, select: PLOT_SELECT },
          waterSources: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' }, select: { id: true, name: true, availability: true, availableMonths: true, waterSourceType: { select: { code: true, name: true } } } },
        },
      });
      if (!farm) throw notFound('Farm');
      return {
        id: farm.id, name: farm.name, state: farm.state, district: farm.district, taluk: farm.taluk, village: farm.village, pincode: farm.pincode,
        latitude: num(farm.latitude), longitude: num(farm.longitude), totalArea: num(farm.totalArea), totalAreaUnit: farm.totalAreaUnit?.code ?? null,
        plots: farm.plots.map(plotView),
        waterSources: farm.waterSources.map((w) => ({ id: w.id, name: w.name, type: w.waterSourceType.code, availability: w.availability, availableMonths: w.availableMonths })),
      };
    },

    async createFarm(userId: string, body: CreateFarmBody) {
      const totalAreaUnitId = body.totalAreaUnit ? await unitId(body.totalAreaUnit, ['AREA'], 'body.totalAreaUnit') : undefined;
      const farm = await prisma.farm.create({
        data: {
          ownerId: userId, name: body.name, state: body.state, district: body.district, taluk: body.taluk, village: body.village, pincode: body.pincode,
          latitude: body.latitude, longitude: body.longitude, totalArea: body.totalArea, totalAreaUnitId,
        },
        select: { id: true },
      });
      return this.getFarm(userId, farm.id);
    },

    async updateFarm(userId: string, farmId: string, body: UpdateFarmBody) {
      await requireFarm(userId, farmId);
      await prisma.farm.update({ where: { id: farmId }, data: body });
      return this.getFarm(userId, farmId);
    },

    async deleteFarm(userId: string, farmId: string) {
      await requireFarm(userId, farmId);
      await prisma.farm.update({ where: { id: farmId }, data: { deletedAt: new Date() } });
    },

    // ---------------------------------------------------------------- plots & water
    async createPlot(userId: string, farmId: string, body: CreatePlotBody) {
      await requireFarm(userId, farmId);
      const areaUnitId = await unitId(body.areaUnit, ['AREA'], 'body.areaUnit');
      const soilType = body.soilType ? await prisma.soilType.findUnique({ where: { code: body.soilType }, select: { id: true } }) : null;
      if (body.soilType && !soilType) throw invalid(`Unknown soil type "${body.soilType}".`, 'body.soilType');
      const plot = await prisma.farmPlot.create({
        data: {
          farmId, name: body.name, area: body.area, areaUnitId, soilTypeId: soilType?.id, irrigationMethod: body.irrigationMethod,
          surveyNumber: body.surveyNumber, latitude: body.latitude, longitude: body.longitude,
        },
        select: PLOT_SELECT,
      });
      return plotView(plot);
    },

    async updatePlot(userId: string, plotId: string, body: UpdatePlotBody) {
      await requirePlot(userId, plotId);
      const areaUnitId = body.areaUnit ? await unitId(body.areaUnit, ['AREA'], 'body.areaUnit') : undefined;
      let soilTypeId: string | undefined;
      if (body.soilType) {
        const soil = await prisma.soilType.findUnique({ where: { code: body.soilType }, select: { id: true } });
        if (!soil) throw invalid(`Unknown soil type "${body.soilType}".`, 'body.soilType');
        soilTypeId = soil.id;
      }
      const plot = await prisma.farmPlot.update({
        where: { id: plotId },
        data: {
          name: body.name, area: body.area, areaUnitId, soilTypeId, irrigationMethod: body.irrigationMethod,
          surveyNumber: body.surveyNumber, latitude: body.latitude, longitude: body.longitude,
        },
        select: PLOT_SELECT,
      });
      return plotView(plot);
    },

    async deletePlot(userId: string, plotId: string) {
      await requirePlot(userId, plotId);
      await prisma.farmPlot.update({ where: { id: plotId }, data: { deletedAt: new Date() } });
    },

    async createWaterSource(userId: string, farmId: string, body: CreateWaterSourceBody) {
      await requireFarm(userId, farmId);
      const type = await prisma.waterSourceType.findUnique({ where: { code: body.type }, select: { id: true } });
      if (!type) throw invalid(`Unknown water source type "${body.type}".`, 'body.type');
      const plots = await prisma.farmPlot.findMany({ where: { id: { in: body.plotIds }, farmId, deletedAt: null }, select: { id: true } });
      if (plots.length !== new Set(body.plotIds).size) throw invalid('Every plot must belong to this farm.', 'body.plotIds');
      const source = await prisma.$transaction(async (tx) => {
        const created = await tx.waterSource.create({
          data: { farmId, waterSourceTypeId: type.id, name: body.name, availability: body.availability, availableMonths: [...new Set(body.availableMonths)].sort((a, b) => a - b) },
          select: { id: true },
        });
        if (plots.length) await tx.plotWaterSource.createMany({ data: plots.map((p) => ({ plotId: p.id, waterSourceId: created.id, farmId })) });
        return created;
      });
      return { id: source.id, type: body.type, name: body.name ?? null, availability: body.availability, plotIds: plots.map((p) => p.id) };
    },

    // ---------------------------------------------------------------- soil tests
    async createSoilTest(userId: string, plotId: string, body: CreateSoilTestBody) {
      await requirePlot(userId, plotId);
      const codes = body.results.map((r) => r.parameter);
      if (new Set(codes).size !== codes.length) throw invalid('Each parameter can appear only once.', 'body.results');
      const params = await prisma.agronomicParameter.findMany({
        where: { code: { in: codes }, category: { in: ['SOIL', 'NUTRIENT'] }, isActive: true },
        select: { id: true, code: true, defaultUnitId: true },
      });
      const byCode = new Map(params.map((p) => [p.code, p]));
      const results = [];
      for (const [i, r] of body.results.entries()) {
        const param = byCode.get(r.parameter);
        if (!param) throw invalid(`Unknown soil parameter "${r.parameter}".`, `body.results.${i}.parameter`);
        const unitIdValue = r.unit ? await unitId(r.unit, ['CONCENTRATION', 'RATIO', 'RATE', 'OTHER'], `body.results.${i}.unit`) : param.defaultUnitId;
        if (!unitIdValue) throw invalid(`A unit is required for "${r.parameter}".`, `body.results.${i}.unit`);
        results.push({ parameterId: param.id, value: r.value, unitId: unitIdValue });
      }
      const test = await prisma.soilTest.create({
        data: { plotId, testDate: toDate(body.testDate), source: body.source, laboratoryName: body.laboratoryName, isUserConfirmed: true, results: { create: results } },
        select: { id: true },
      });
      return (await this.listSoilTests(userId, plotId)).find((t) => t.id === test.id)!;
    },

    async listSoilTests(userId: string, plotId: string) {
      await requirePlot(userId, plotId);
      const tests = await prisma.soilTest.findMany({
        where: { plotId, deletedAt: null },
        orderBy: { testDate: 'desc' },
        select: { id: true, testDate: true, source: true, laboratoryName: true, results: { select: { value: true, parameter: { select: { code: true, name: true } }, unit: { select: { code: true, symbol: true } } } } },
      });
      return tests.map((t) => ({
        id: t.id, testDate: dateString(t.testDate), source: t.source, laboratoryName: t.laboratoryName,
        results: t.results.map((r) => ({ parameter: r.parameter.code, name: r.parameter.name, value: num(r.value), unit: r.unit.code, unitSymbol: r.unit.symbol })),
      }));
    },

    // ---------------------------------------------------------------- cultivations
    async startCrop(userId: string, body: StartCropBody) {
      const plot = await requirePlot(userId, body.plotId);
      const crop = await prisma.crop.findFirst({ where: { slug: body.cropSlug, ...PUBLISHED_CROP }, select: { id: true } });
      if (!crop) throw invalid(`Crop "${body.cropSlug}" is not available.`, 'body.cropSlug');
      const variety = body.varietySlug
        ? await prisma.cropVariety.findFirst({ where: { cropId: crop.id, slug: body.varietySlug, status: 'PUBLISHED', deletedAt: null }, select: { id: true } })
        : null;
      if (body.varietySlug && !variety) throw invalid(`Variety "${body.varietySlug}" is not available for this crop.`, 'body.varietySlug');

      const procedure = await prisma.growingProcedure.findFirst({
        where: { cropId: crop.id, status: 'PUBLISHED', deletedAt: null, ...(body.procedureId ? { id: body.procedureId } : {}), versions: { some: { status: 'PUBLISHED' } } },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          versions: {
            where: { status: 'PUBLISHED' }, take: 1,
            select: { id: true, stages: { orderBy: { sequence: 'asc' }, select: { id: true, sequence: true, title: true, startDay: true, endDay: true, dayAnchor: true, stageType: { select: { code: true } } } } },
          },
        },
      });
      if (body.procedureId && !procedure) throw invalid('That growing guide is not available for this crop.', 'body.procedureId');
      const version = procedure?.versions[0];

      const season = body.season ? await prisma.season.findUnique({ where: { code: body.season }, select: { id: true } }) : null;
      if (body.season && !season) throw invalid(`Unknown season "${body.season}".`, 'body.season');
      const areaUnitId = await unitId(body.areaUnit, ['AREA'], 'body.areaUnit');

      if (body.recommendationItemId) {
        const item = await prisma.cropRecommendationItem.findFirst({ where: { id: body.recommendationItemId, cropId: crop.id, recommendation: { userId } }, select: { id: true } });
        if (!item) throw invalid('Recommendation not found for this crop.', 'body.recommendationItemId');
      }

      const plantingDate = body.plantingDate ? toDate(body.plantingDate) : null;
      const stages = version?.stages ?? [];
      const harvestDue = stages
        .filter((s) => s.stageType?.code === 'HARVESTING')
        .map((s) => scheduleFor(s, plantingDate).due)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      const today = toDate(new Date().toISOString().slice(0, 10));

      const created = await prisma.$transaction(async (tx) => {
        const fc = await tx.farmCrop.create({
          data: {
            farmPlotId: plot.id, cropId: crop.id, cropVarietyId: variety?.id, growingProcedureId: procedure?.id, procedureVersionId: version?.id,
            seasonId: season?.id, recommendationItemId: body.recommendationItemId, label: body.label,
            plantingDate, expectedHarvestDate: harvestDue ?? null, cultivatedArea: body.cultivatedArea, areaUnitId,
            status: plantingDate && plantingDate <= today ? 'ACTIVE' : 'PLANNED',
          },
          select: { id: true },
        });
        if (stages.length) {
          await tx.cropTask.createMany({
            data: stages.map((s) => {
              const sched = scheduleFor(s, plantingDate);
              return { farmCropId: fc.id, growingStageId: s.id, title: s.title, sequence: s.sequence, scheduledStartDate: sched.start, dueDate: sched.due };
            }),
          });
        }
        return fc;
      });
      return this.getFarmCrop(userId, created.id, 'en');
    },

    async listFarmCrops(userId: string, lang: LanguageCode) {
      const rows = await prisma.farmCrop.findMany({
        where: ownedFarmCrop(userId),
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true, label: true, status: true, plantingDate: true, expectedHarvestDate: true,
          crop: { select: { id: true, slug: true, commonName: true } },
          farmPlot: { select: { id: true, name: true, farm: { select: { id: true, name: true } } } },
          tasks: { select: { status: true, dueDate: true } },
        },
      });
      const t = await loadTranslations(prisma, 'cropId', rows.map((r) => r.crop.id), lang);
      const today = dateString(new Date())!;
      return rows.map((r) => {
        const open = r.tasks.filter((x) => x.status === 'PENDING' || x.status === 'IN_PROGRESS' || x.status === 'POSTPONED');
        const next = open.map((x) => dateString(x.dueDate)).filter((d): d is string => d !== null).sort()[0] ?? null;
        return {
          id: r.id, label: r.label, status: r.status,
          crop: { slug: r.crop.slug, name: t(r.crop.id, 'NAME', r.crop.commonName) },
          plot: { id: r.farmPlot.id, name: r.farmPlot.name }, farm: { id: r.farmPlot.farm.id, name: r.farmPlot.farm.name },
          plantingDate: dateString(r.plantingDate), expectedHarvestDate: dateString(r.expectedHarvestDate),
          tasks: { total: r.tasks.length, done: r.tasks.filter((x) => x.status === 'COMPLETED').length, overdue: open.filter((x) => x.dueDate && dateString(x.dueDate)! < today).length, nextDueDate: next },
        };
      });
    },

    async getFarmCrop(userId: string, farmCropId: string, lang: LanguageCode) {
      const fc = await prisma.farmCrop.findFirst({
        where: { id: farmCropId, ...ownedFarmCrop(userId) },
        select: {
          id: true, label: true, status: true, notes: true, plantingDate: true, expectedHarvestDate: true, actualHarvestDate: true, cultivatedArea: true,
          areaUnit: { select: { code: true, symbol: true } },
          crop: { select: { id: true, slug: true, commonName: true } },
          cropVariety: { select: { slug: true, name: true } },
          season: { select: { code: true } },
          growingProcedureId: true,
          procedureVersion: { select: { versionNumber: true, verificationStatus: true } },
          farmPlot: { select: { id: true, name: true, farm: { select: { id: true, name: true } } } },
          tasks: { orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }], select: { id: true, title: true, status: true, isCustom: true, scheduledStartDate: true, dueDate: true, completedAt: true, growingStageId: true, notes: true } },
          activityLogs: { where: { deletedAt: null }, orderBy: { activityDate: 'desc' }, take: 50, select: { id: true, activityType: true, activityDate: true, title: true, description: true } },
          expenses: { where: { deletedAt: null }, orderBy: { expenseDate: 'desc' }, select: { id: true, category: true, expenseDate: true, amount: true, currency: true, description: true, paymentMode: true } },
          harvests: {
            where: { deletedAt: null }, orderBy: { harvestNumber: 'asc' },
            select: {
              id: true, harvestNumber: true, harvestDate: true, quantity: true, qualityGrade: true, unit: { select: { code: true, symbol: true } },
              sales: { where: { deletedAt: null }, orderBy: { saleDate: 'asc' }, select: { id: true, saleDate: true, quantitySold: true, pricePerUnit: true, grossAmount: true, deductions: true, netAmount: true, buyerName: true, marketName: true, paymentStatus: true, unit: { select: { code: true } } } },
            },
          },
        },
      });
      if (!fc) throw notFound('Crop record');
      const t = await loadTranslations(prisma, 'cropId', [fc.crop.id], lang);
      const tStage = await loadTranslations(prisma, 'growingStageId', fc.tasks.flatMap((x) => (x.growingStageId && !x.isCustom ? [x.growingStageId] : [])), lang);
      const totalExpenses = fc.expenses.reduce((sum, e) => sum.plus(e.amount), new Prisma.Decimal(0));
      const totalRevenue = fc.harvests.flatMap((h) => h.sales).reduce((sum, s) => sum.plus(s.netAmount), new Prisma.Decimal(0));
      return {
        id: fc.id, label: fc.label, status: fc.status, notes: fc.notes,
        crop: { slug: fc.crop.slug, name: t(fc.crop.id, 'NAME', fc.crop.commonName) },
        variety: fc.cropVariety, season: fc.season?.code ?? null,
        guide: fc.growingProcedureId ? { procedureId: fc.growingProcedureId, version: fc.procedureVersion?.versionNumber ?? null } : null,
        plot: { id: fc.farmPlot.id, name: fc.farmPlot.name }, farm: { id: fc.farmPlot.farm.id, name: fc.farmPlot.farm.name },
        plantingDate: dateString(fc.plantingDate), expectedHarvestDate: dateString(fc.expectedHarvestDate), actualHarvestDate: dateString(fc.actualHarvestDate),
        cultivatedArea: num(fc.cultivatedArea), areaUnit: fc.areaUnit.code, areaUnitSymbol: fc.areaUnit.symbol,
        tasks: fc.tasks.map((x) => ({
          id: x.id,
          title: x.growingStageId && !x.isCustom ? tStage(x.growingStageId, 'TITLE', x.title) : x.title,
          status: x.status, isCustom: x.isCustom, stageId: x.growingStageId,
          startDate: dateString(x.scheduledStartDate), dueDate: dateString(x.dueDate), completedAt: x.completedAt, notes: x.notes,
        })),
        activities: fc.activityLogs.map((a) => ({ id: a.id, type: a.activityType, date: dateString(a.activityDate), title: a.title, description: a.description })),
        expenses: fc.expenses.map((e) => ({ id: e.id, category: e.category, date: dateString(e.expenseDate), amount: num(e.amount), currency: e.currency, description: e.description, paymentMode: e.paymentMode })),
        harvests: fc.harvests.map((h) => ({
          id: h.id, number: h.harvestNumber, date: dateString(h.harvestDate), quantity: num(h.quantity), unit: h.unit.code, unitSymbol: h.unit.symbol, qualityGrade: h.qualityGrade,
          sales: h.sales.map((s) => ({ id: s.id, date: dateString(s.saleDate), quantitySold: num(s.quantitySold), unit: s.unit.code, pricePerUnit: num(s.pricePerUnit), grossAmount: num(s.grossAmount), deductions: num(s.deductions), netAmount: num(s.netAmount), buyerName: s.buyerName, marketName: s.marketName, paymentStatus: s.paymentStatus })),
        })),
        totals: {
          currency: 'INR',
          expenses: Number(totalExpenses.toFixed(2)),
          revenue: Number(totalRevenue.toFixed(2)),
          /** Revenue minus recorded expenses — computed from the farmer's own records, not an estimate. */
          balance: Number(totalRevenue.minus(totalExpenses).toFixed(2)),
        },
      };
    },

    async updateFarmCrop(userId: string, farmCropId: string, body: UpdateFarmCropBody) {
      const fc = await requireFarmCrop(userId, farmCropId);
      const plantingDate = body.plantingDate ? toDate(body.plantingDate) : undefined;
      await prisma.$transaction(async (tx) => {
        await tx.farmCrop.update({
          where: { id: farmCropId },
          data: {
            status: body.status, label: body.label, notes: body.notes, plantingDate,
            actualHarvestDate: body.actualHarvestDate ? toDate(body.actualHarvestDate) : undefined,
          },
        });
        // A new planting date re-schedules the generated tasks that are not finished yet.
        if (plantingDate && fc.procedureVersionId) {
          const tasks = await tx.cropTask.findMany({
            where: { farmCropId, isCustom: false, status: { in: ['PENDING', 'IN_PROGRESS'] }, growingStageId: { not: null } },
            select: { id: true, growingStage: { select: { startDay: true, endDay: true, dayAnchor: true, stageType: { select: { code: true } } } } },
          });
          for (const task of tasks) {
            if (!task.growingStage) continue;
            const sched = scheduleFor(task.growingStage, plantingDate);
            await tx.cropTask.update({ where: { id: task.id }, data: { scheduledStartDate: sched.start, dueDate: sched.due } });
          }
          const harvestStages = await tx.growingStage.findMany({ where: { procedureVersionId: fc.procedureVersionId, stageType: { code: 'HARVESTING' } }, select: { startDay: true, endDay: true, dayAnchor: true } });
          const due = harvestStages.map((s) => scheduleFor(s, plantingDate).due).filter((d): d is Date => d !== null).sort((a, b) => b.getTime() - a.getTime())[0];
          await tx.farmCrop.update({ where: { id: farmCropId }, data: { expectedHarvestDate: due ?? null } });
        }
      });
      return this.getFarmCrop(userId, farmCropId, 'en');
    },

    async deleteFarmCrop(userId: string, farmCropId: string) {
      await requireFarmCrop(userId, farmCropId);
      await prisma.farmCrop.update({ where: { id: farmCropId }, data: { deletedAt: new Date() } });
    },

    // ---------------------------------------------------------------- tasks
    async updateTask(userId: string, taskId: string, body: UpdateTaskBody) {
      const task = await prisma.cropTask.findFirst({ where: { id: taskId, farmCrop: ownedFarmCrop(userId) }, select: { id: true, status: true, dueDate: true } });
      if (!task) throw notFound('Task');
      if (body.status === 'POSTPONED' && !body.dueDate) throw invalid('A new due date is required to postpone a task.', 'body.dueDate');
      const data: Prisma.CropTaskUpdateInput = { title: body.title, notes: body.notes };
      if (body.status) {
        data.status = body.status;
        data.completedAt = body.status === 'COMPLETED' ? new Date() : null;
        if (body.status === 'SKIPPED') data.skippedReason = body.skippedReason ?? null;
        if (body.status === 'POSTPONED') data.postponedFromDate = task.dueDate;
      }
      if (body.dueDate) data.dueDate = toDate(body.dueDate);
      const updated = await prisma.cropTask.update({ where: { id: taskId }, data, select: { id: true, title: true, status: true, dueDate: true, completedAt: true, postponedFromDate: true, notes: true } });
      return { ...updated, dueDate: dateString(updated.dueDate), postponedFromDate: dateString(updated.postponedFromDate) };
    },

    async createTask(userId: string, farmCropId: string, body: CreateTaskBody) {
      await requireFarmCrop(userId, farmCropId);
      const last = await prisma.cropTask.aggregate({ where: { farmCropId }, _max: { sequence: true } });
      const task = await prisma.cropTask.create({
        data: { farmCropId, title: body.title, description: body.description, isCustom: true, sequence: (last._max.sequence ?? 0) + 1, dueDate: body.dueDate ? toDate(body.dueDate) : null },
        select: { id: true, title: true, status: true, dueDate: true, isCustom: true },
      });
      return { ...task, dueDate: dateString(task.dueDate) };
    },

    // ---------------------------------------------------------------- activities, expenses, harvests, sales
    async createActivity(userId: string, farmCropId: string, body: CreateActivityBody) {
      await requireFarmCrop(userId, farmCropId);
      if (body.taskId) {
        const task = await prisma.cropTask.findFirst({ where: { id: body.taskId, farmCropId }, select: { id: true } });
        if (!task) throw invalid('Task not found for this crop.', 'body.taskId');
      }
      const a = await prisma.cropActivityLog.create({
        data: { farmCropId, activityType: body.activityType, activityDate: toDate(body.activityDate), title: body.title, description: body.description, taskId: body.taskId, labourCount: body.labourCount, performedById: userId },
        select: { id: true, activityType: true, activityDate: true, title: true, description: true },
      });
      return { id: a.id, type: a.activityType, date: dateString(a.activityDate), title: a.title, description: a.description };
    },

    async createExpense(userId: string, farmCropId: string, body: CreateExpenseBody) {
      await requireFarmCrop(userId, farmCropId);
      const e = await prisma.cropExpense.create({
        data: { farmCropId, category: body.category, expenseDate: toDate(body.expenseDate), amount: new Prisma.Decimal(body.amount).toDecimalPlaces(2), description: body.description, paymentMode: body.paymentMode },
        select: { id: true, category: true, expenseDate: true, amount: true, currency: true, description: true, paymentMode: true },
      });
      return { id: e.id, category: e.category, date: dateString(e.expenseDate), amount: num(e.amount), currency: e.currency, description: e.description, paymentMode: e.paymentMode };
    },

    async deleteExpense(userId: string, expenseId: string) {
      const e = await prisma.cropExpense.findFirst({ where: { id: expenseId, deletedAt: null, farmCrop: ownedFarmCrop(userId) }, select: { id: true } });
      if (!e) throw notFound('Expense');
      await prisma.cropExpense.update({ where: { id: expenseId }, data: { deletedAt: new Date() } });
    },

    async createHarvest(userId: string, farmCropId: string, body: CreateHarvestBody) {
      await requireFarmCrop(userId, farmCropId);
      const unit = await unitId(body.unit, ['MASS', 'COUNT', 'VOLUME'], 'body.unit');
      const h = await prisma.$transaction(async (tx) => {
        const last = await tx.harvestRecord.aggregate({ where: { farmCropId }, _max: { harvestNumber: true } });
        return tx.harvestRecord.create({
          data: { farmCropId, harvestNumber: (last._max.harvestNumber ?? 0) + 1, harvestDate: toDate(body.harvestDate), quantity: new Prisma.Decimal(body.quantity).toDecimalPlaces(3), unitId: unit, qualityGrade: body.qualityGrade, notes: body.notes },
          select: { id: true, harvestNumber: true, harvestDate: true, quantity: true, qualityGrade: true },
        });
      });
      return { id: h.id, number: h.harvestNumber, date: dateString(h.harvestDate), quantity: num(h.quantity), unit: body.unit, qualityGrade: h.qualityGrade };
    },

    async createSale(userId: string, harvestId: string, body: CreateSaleBody) {
      const harvest = await prisma.harvestRecord.findFirst({ where: { id: harvestId, deletedAt: null, farmCrop: ownedFarmCrop(userId) }, select: { id: true } });
      if (!harvest) throw notFound('Harvest');
      const unit = await unitId(body.unit, ['MASS', 'COUNT', 'VOLUME'], 'body.unit');
      const quantity = new Prisma.Decimal(body.quantitySold).toDecimalPlaces(3);
      const price = new Prisma.Decimal(body.pricePerUnit).toDecimalPlaces(2);
      const deductions = new Prisma.Decimal(body.deductions).toDecimalPlaces(2);
      const gross = quantity.times(price).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      if (deductions.greaterThan(gross)) throw invalid('Deductions cannot be more than the sale amount.', 'body.deductions');
      const s = await prisma.salesRecord.create({
        data: {
          harvestRecordId: harvestId, saleDate: toDate(body.saleDate), quantitySold: quantity, unitId: unit, pricePerUnit: price,
          grossAmount: gross, deductions, netAmount: gross.minus(deductions),
          buyerType: body.buyerType, buyerName: body.buyerName, marketName: body.marketName, paymentStatus: body.paymentStatus, paymentMode: body.paymentMode,
        },
        select: { id: true, saleDate: true, quantitySold: true, pricePerUnit: true, grossAmount: true, deductions: true, netAmount: true, paymentStatus: true },
      });
      return { id: s.id, date: dateString(s.saleDate), quantitySold: num(s.quantitySold), unit: body.unit, pricePerUnit: num(s.pricePerUnit), grossAmount: num(s.grossAmount), deductions: num(s.deductions), netAmount: num(s.netAmount), paymentStatus: s.paymentStatus };
    },
  };
}
