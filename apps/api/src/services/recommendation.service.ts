/**
 * Runs the deterministic engine (src/recommendation/engine.ts) and stores an explainable record:
 * CropRecommendation (inputs snapshot, completeness, rule-set version) → items → reasons, each reason
 * linked to the CropRequirement / ContentSource it came from. Only PUBLISHED, non-UNVERIFIED knowledge
 * is used. Investment figures are copied from sourced CropEconomics rows only.
 */
import type { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import { ownedPlot } from '../db/ownership.ts';
import {
  RULE_SET_VERSION, evaluateCrop, missingInputs, rankEvaluations, type CropKnowledge, type FarmerConditions, type Level,
} from '../recommendation/engine.ts';
import { HttpError } from '../utils/http-error.ts';
import type { LanguageCode } from '../utils/language.ts';
import type { RecommendationBody } from '../validators/recommendation.schemas.ts';
import { PUBLISHED_CROP } from './catalog.service.ts';
import { loadTranslations } from './translation.ts';

const VERIFIED = { not: 'UNVERIFIED' } as const;
const num = (v: { toString(): string } | null | undefined) => (v === null || v === undefined ? null : Number(v.toString()));
const src = (s: { id: string; title: string } | null | undefined) => (s ? { id: s.id, title: s.title } : null);

export type RecommendationService = ReturnType<typeof createRecommendationService>;

export function createRecommendationService(prisma: PrismaClient) {
  async function acreFactor() {
    const acre = await prisma.measurementUnit.findUniqueOrThrow({ where: { code: 'ACRE' }, select: { id: true, toBaseFactor: true } });
    return { acreId: acre.id, acreM2: Number(acre.toBaseFactor) };
  }

  /** Farmer conditions from a saved plot, overridden/extended by anything in the request body. */
  async function conditions(userId: string, body: RecommendationBody) {
    let plot: Awaited<ReturnType<typeof loadPlot>> = null;
    async function loadPlot(id: string) {
      return prisma.farmPlot.findFirst({
        where: { id, ...ownedPlot(userId) },
        select: {
          id: true, area: true, areaUnit: { select: { toBaseFactor: true } }, soilType: { select: { id: true, code: true } },
          farm: { select: { state: true, district: true, latitude: true, longitude: true, region: { select: { name: true, parent: { select: { name: true, parent: { select: { name: true } } } } } } } },
          waterSources: { select: { waterSource: { select: { availability: true, deletedAt: true, waterSourceType: { select: { code: true } } } } } },
          soilTests: {
            where: { deletedAt: null }, orderBy: { testDate: 'desc' }, take: 1,
            select: { id: true, results: { select: { value: true, parameter: { select: { code: true } }, unit: { select: { code: true } } } } },
          },
        },
      });
    }
    if (body.plotId) {
      plot = await loadPlot(body.plotId);
      if (!plot) throw new HttpError(404, 'NOT_FOUND', 'Plot not found.');
    }

    const soilValues: FarmerConditions['soilValues'] = {};
    for (const r of plot?.soilTests[0]?.results ?? []) soilValues[r.parameter.code] = { value: Number(r.value), unitCode: r.unit.code };
    for (const r of body.soilTest ?? []) {
      const param = await prisma.agronomicParameter.findUnique({ where: { code: r.parameter }, select: { defaultUnit: { select: { code: true } } } });
      const unitCode = r.unit ?? param?.defaultUnit?.code;
      if (unitCode) soilValues[r.parameter] = { value: r.value, unitCode };
    }

    const waterSources = body.waterSources?.length
      ? body.waterSources.map((w) => ({ typeCode: w.type, availability: w.availability }))
      : (plot?.waterSources ?? []).filter((w) => !w.waterSource.deletedAt).map((w) => ({ typeCode: w.waterSource.waterSourceType.code, availability: w.waterSource.availability }));

    const { acreId, acreM2 } = await acreFactor();
    let areaAcres: number | null = null;
    if (body.area && body.areaUnit) {
      const unit = await prisma.measurementUnit.findUnique({ where: { code: body.areaUnit }, select: { dimension: true, toBaseFactor: true } });
      if (!unit || unit.dimension !== 'AREA' || !unit.toBaseFactor) throw new HttpError(400, 'VALIDATION_ERROR', 'Unknown area unit.', [{ path: 'body.areaUnit', message: 'Unknown area unit', code: 'invalid' }]);
      areaAcres = (body.area * Number(unit.toBaseFactor)) / acreM2;
    } else if (plot?.areaUnit.toBaseFactor) {
      areaAcres = (Number(plot.area) * Number(plot.areaUnit.toBaseFactor)) / acreM2;
    }

    const farm = plot?.farm;
    const regionChain = [farm?.region?.name, farm?.region?.parent?.name, farm?.region?.parent?.parent?.name].filter((x): x is string => !!x);
    const regionNames = [...new Set([...regionChain, farm?.district, farm?.state, body.district, body.state ?? 'Karnataka'].filter((x): x is string => !!x))];
    const latitude = body.latitude ?? num(farm?.latitude);
    const longitude = body.longitude ?? num(farm?.longitude);

    const input: FarmerConditions & { hasLocation: boolean } = {
      seasonCode: body.season ?? null,
      soilTypeCode: body.soilType ?? plot?.soilType?.code ?? null,
      soilValues,
      waterSources,
      regionNames,
      budget: body.budget ?? null,
      areaAcres: areaAcres !== null ? Math.round(areaAcres * 10000) / 10000 : null,
      hasLocation: latitude !== null || !!body.district || !!farm?.district || !!farm?.region,
    };
    return { input, plot, latitude, longitude, acreId, acreM2 };
  }

  async function knowledge(acreM2: number): Promise<CropKnowledge[]> {
    const crops = await prisma.crop.findMany({
      where: PUBLISHED_CROP,
      orderBy: { commonName: 'asc' },
      select: {
        id: true, slug: true, commonName: true,
        seasonMappings: { where: { verificationStatus: VERIFIED, cropVarietyId: null }, select: { season: { select: { code: true } }, source: { select: { id: true, title: true } } } },
        soilSuitabilities: { where: { verificationStatus: VERIFIED, cropVarietyId: null }, select: { suitability: true, soilType: { select: { code: true } }, source: { select: { id: true, title: true } } } },
        regionSuitabilities: { where: { verificationStatus: VERIFIED, cropVarietyId: null }, select: { suitability: true, region: { select: { name: true } }, source: { select: { id: true, title: true } } } },
        requirements: {
          where: { status: 'PUBLISHED', verificationStatus: VERIFIED, cropVarietyId: null, seasonId: null },
          select: { id: true, minValue: true, maxValue: true, level: true, importance: true, parameter: { select: { code: true } }, unit: { select: { code: true } }, source: { select: { id: true, title: true } } },
        },
        economics: {
          where: { status: 'PUBLISHED', verificationStatus: VERIFIED, cropVarietyId: null },
          orderBy: { referenceYear: 'desc' }, take: 1,
          select: { id: true, referenceYear: true, costOfCultivationMin: true, costOfCultivationMax: true, areaUnit: { select: { toBaseFactor: true } }, source: { select: { id: true, title: true } } },
        },
      },
    });
    return crops.map((c) => {
      const e = c.economics[0];
      const perAcre = (v: Prisma.Decimal | null) => (v === null || !e?.areaUnit.toBaseFactor ? null : (Number(v) * acreM2) / Number(e.areaUnit.toBaseFactor));
      return {
        cropId: c.id, slug: c.slug, name: c.commonName,
        seasons: c.seasonMappings.map((s) => ({ code: s.season.code, source: src(s.source) })),
        soils: c.soilSuitabilities.filter((s) => s.suitability !== 'UNKNOWN').map((s) => ({ code: s.soilType.code, suitability: s.suitability as Exclude<typeof s.suitability, 'UNKNOWN'>, source: src(s.source) })),
        regions: c.regionSuitabilities.filter((s) => s.suitability !== 'UNKNOWN').map((s) => ({ name: s.region.name, suitability: s.suitability as Exclude<typeof s.suitability, 'UNKNOWN'>, source: src(s.source) })),
        requirements: c.requirements.map((r) => ({
          id: r.id, parameterCode: r.parameter.code, min: num(r.minValue), max: num(r.maxValue), unitCode: r.unit?.code ?? null,
          level: (r.level as Level | null) ?? null, mandatory: r.importance === 'MANDATORY', source: src(r.source),
        })),
        economics: e ? { id: e.id, referenceYear: e.referenceYear, costMinPerAcre: perAcre(e.costOfCultivationMin), costMaxPerAcre: perAcre(e.costOfCultivationMax), source: src(e.source) } : null,
      };
    });
  }

  const RUN_SELECT = {
    id: true, recommendationDate: true, status: true, ruleSetVersion: true, explanation: true, dataCompletenessPct: true, missingInputs: true,
    season: { select: { code: true } }, soilType: { select: { code: true } }, farmPlotId: true,
    items: {
      orderBy: { rank: 'asc' },
      select: {
        id: true, rank: true, suitabilityLevel: true, summary: true, estimatedInvestmentMin: true, estimatedInvestmentMax: true, areaValue: true, currency: true,
        crop: { select: { id: true, slug: true, commonName: true } },
        reasons: { orderBy: { sequence: 'asc' }, select: { kind: true, criterionCode: true, result: true, reasonCode: true, message: true, observedValue: true, requiredValue: true, source: { select: { id: true, title: true, organization: true, url: true } } } },
      },
    },
  } satisfies Prisma.CropRecommendationSelect;

  async function view(id: string, userId: string, lang: LanguageCode) {
    const rec = await prisma.cropRecommendation.findFirst({ where: { id, userId }, select: RUN_SELECT });
    if (!rec) throw new HttpError(404, 'NOT_FOUND', 'Recommendation not found.');
    const t = await loadTranslations(prisma, 'cropId', rec.items.map((i) => i.crop.id), lang);
    return {
      id: rec.id, date: rec.recommendationDate, ruleSetVersion: rec.ruleSetVersion, explanation: rec.explanation,
      plotId: rec.farmPlotId, season: rec.season?.code ?? null, soilType: rec.soilType?.code ?? null,
      dataCompletenessPct: num(rec.dataCompletenessPct), missingInputs: rec.missingInputs,
      items: rec.items.map((i) => ({
        id: i.id, rank: i.rank, suitability: i.suitabilityLevel, summary: i.summary,
        crop: { slug: i.crop.slug, name: t(i.crop.id, 'NAME', i.crop.commonName) },
        investment: i.estimatedInvestmentMin !== null || i.estimatedInvestmentMax !== null
          ? { min: num(i.estimatedInvestmentMin), max: num(i.estimatedInvestmentMax), currency: i.currency, areaAcres: num(i.areaValue), label: 'ESTIMATE_FROM_SOURCE' }
          : null,
        reasons: i.reasons.map((r) => ({ kind: r.kind, criterion: r.criterionCode, result: r.result, code: r.reasonCode, message: r.message, observed: r.observedValue, required: r.requiredValue, source: r.source })),
      })),
    };
  }

  return {
    async create(userId: string, body: RecommendationBody, lang: LanguageCode) {
      const { input, plot, latitude, longitude, acreId, acreM2 } = await conditions(userId, body);
      const missing = missingInputs(input);
      const ranked = rankEvaluations((await knowledge(acreM2)).map((k) => evaluateCrop(input, k)));
      const completeness = Math.round(((6 - missing.length) / 6) * 10000) / 100;

      const [season, soilType] = await Promise.all([
        input.seasonCode ? prisma.season.findUnique({ where: { code: input.seasonCode }, select: { id: true } }) : null,
        input.soilTypeCode ? prisma.soilType.findUnique({ where: { code: input.soilTypeCode }, select: { id: true } }) : null,
      ]);
      const explanation = ranked.length === 0
        ? 'No crops have published, source-cited suitability information yet.'
        : `Checked ${ranked.length} crops against published, source-cited information using rule set ${RULE_SET_VERSION}. ` +
          'Crops are compared one criterion at a time; missing information is shown as unknown, never guessed. ' +
          'Weather and climate are not used for suitability yet.';

      const created = await prisma.cropRecommendation.create({
        data: {
          userId, farmPlotId: plot?.id, seasonId: season?.id, soilTypeId: soilType?.id, soilTestId: plot?.soilTests[0]?.id,
          latitude, longitude, budgetAmount: input.budget, status: 'COMPLETED', ruleSetVersion: RULE_SET_VERSION, explanation,
          dataCompletenessPct: completeness, missingInputs: missing,
          inputSnapshot: { ...input, request: body } as unknown as Prisma.InputJsonValue,
          items: {
            create: ranked.map((e, index) => ({
              cropId: e.cropId,
              rank: index + 1,
              suitabilityLevel: e.suitability,
              summary: `${e.counts.suitable} suitable, ${e.counts.caution} caution, ${e.counts.unsuitable} not suitable, ${e.counts.unknown} unknown`,
              ...(e.investment && (e.investment.min !== null || e.investment.max !== null)
                ? { cropEconomicsId: e.investment.economicsId, estimatedInvestmentMin: e.investment.min, estimatedInvestmentMax: e.investment.max, areaValue: e.investment.areaAcres, areaUnitId: acreId }
                : {}),
              reasons: {
                create: e.reasons.map((r, i) => ({
                  kind: r.kind, criterionCode: r.criterion, result: r.result, reasonCode: r.reasonCode, message: r.message,
                  observedValue: r.observed?.slice(0, 100) ?? null, requiredValue: r.required?.slice(0, 100) ?? null,
                  cropRequirementId: r.requirementId, sourceId: r.source?.id ?? null, sequence: i + 1,
                })),
              },
            })),
          },
        },
        select: { id: true },
      });
      return view(created.id, userId, lang);
    },

    async list(userId: string) {
      const rows = await prisma.cropRecommendation.findMany({
        where: { userId }, orderBy: { recommendationDate: 'desc' }, take: 20,
        select: { id: true, recommendationDate: true, dataCompletenessPct: true, farmPlotId: true, season: { select: { code: true } }, items: { where: { rank: { lte: 3 } }, orderBy: { rank: 'asc' }, select: { suitabilityLevel: true, crop: { select: { slug: true, commonName: true } } } } },
      });
      return rows.map((r) => ({ id: r.id, date: r.recommendationDate, plotId: r.farmPlotId, season: r.season?.code ?? null, dataCompletenessPct: num(r.dataCompletenessPct), top: r.items.map((i) => ({ slug: i.crop.slug, name: i.crop.commonName, suitability: i.suitabilityLevel })) }));
    },

    get: view,
  };
}
