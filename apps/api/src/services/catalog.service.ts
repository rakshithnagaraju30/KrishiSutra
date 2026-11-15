/**
 * Catalog (shared agricultural knowledge) — read-only, public, PUBLISHED content only.
 *
 * Every agronomic item carries its trust label and source, so the app can show
 * "Verified", "Source-cited — pending expert review", etc. (requirements §9).
 */
import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { VerificationStatus } from '../../generated/prisma/enums.ts';
import { HttpError } from '../utils/http-error.ts';
import type { LanguageCode } from '../utils/language.ts';
import { loadTranslations } from './translation.ts';

export const PUBLISHED_CROP = { status: 'PUBLISHED', isActive: true, deletedAt: null } as const;

export type Trust = 'VERIFIED' | 'SOURCE_CITED' | 'UNVERIFIED';
export function trustLabel(status: VerificationStatus): Trust {
  return status === 'EXPERT_VERIFIED' ? 'VERIFIED' : status === 'SOURCE_CITED' ? 'SOURCE_CITED' : 'UNVERIFIED';
}

type SourceRow = { id: string; title: string; organization: string | null; publicationYear: number | null; url: string | null; sourceType: string };
export function sourceView(s: SourceRow | null | undefined) {
  return s ? { id: s.id, title: s.title, organization: s.organization, year: s.publicationYear, url: s.url, type: s.sourceType } : null;
}
const SOURCE_SELECT = { id: true, title: true, organization: true, publicationYear: true, url: true, sourceType: true } as const;

const num = (v: { toString(): string } | null | undefined) => (v === null || v === undefined ? null : Number(v.toString()));

export type CatalogService = ReturnType<typeof createCatalogService>;

export function createCatalogService(prisma: PrismaClient) {
  /** All active categories, flat (used for the tree and for descendant filtering). */
  async function activeCategories() {
    return prisma.cropCategory.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true, parentId: true, slug: true, name: true, description: true, iconName: true,
        _count: { select: { cropMappings: { where: { crop: PUBLISHED_CROP } } } },
      },
    });
  }

  function descendantsOf(all: { id: string; parentId: string | null }[], rootId: string): string[] {
    const ids = [rootId];
    for (let i = 0; i < ids.length; i += 1) for (const c of all) if (c.parentId === ids[i]) ids.push(c.id);
    return ids;
  }

  return {
    async reference(lang: LanguageCode) {
      const [languages, soilTypes, seasons, waterSourceTypes, units, methods] = await Promise.all([
        prisma.language.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' }, select: { code: true, name: true, nativeName: true, isDefault: true } }),
        prisma.soilType.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' }, select: { id: true, code: true, name: true, colorHex: true } }),
        prisma.season.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' }, select: { id: true, code: true, name: true } }),
        prisma.waterSourceType.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' }, select: { id: true, code: true, name: true } }),
        prisma.measurementUnit.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' }, select: { code: true, name: true, symbol: true, dimension: true, isLocal: true } }),
        prisma.cultivationMethod.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' }, select: { id: true, code: true, name: true } }),
      ]);
      const [tSoil, tSeason, tWater, tMethod] = await Promise.all([
        loadTranslations(prisma, 'soilTypeId', soilTypes.map((x) => x.id), lang),
        loadTranslations(prisma, 'seasonId', seasons.map((x) => x.id), lang),
        loadTranslations(prisma, 'waterSourceTypeId', waterSourceTypes.map((x) => x.id), lang),
        loadTranslations(prisma, 'cultivationMethodId', methods.map((x) => x.id), lang),
      ]);
      return {
        languages,
        soilTypes: soilTypes.map((s) => ({ code: s.code, name: tSoil(s.id, 'NAME', s.name), colorHex: s.colorHex })),
        seasons: seasons.map((s) => ({ code: s.code, name: tSeason(s.id, 'NAME', s.name) })),
        waterSourceTypes: waterSourceTypes.map((w) => ({ code: w.code, name: tWater(w.id, 'NAME', w.name) })),
        cultivationMethods: methods.map((m) => ({ code: m.code, name: tMethod(m.id, 'NAME', m.name) })),
        units,
      };
    },

    async categoryTree(lang: LanguageCode) {
      const all = await activeCategories();
      const t = await loadTranslations(prisma, 'cropCategoryId', all.map((c) => c.id), lang);
      type Node = { slug: string; name: string; description: string | null; iconName: string | null; cropCount: number; children: Node[] };
      const nodes = new Map<string, Node>();
      for (const c of all) {
        nodes.set(c.id, {
          slug: c.slug,
          name: t(c.id, 'NAME', c.name),
          description: t.optional(c.id, 'DESCRIPTION', c.description),
          iconName: c.iconName,
          cropCount: c._count.cropMappings,
          children: [],
        });
      }
      const roots: Node[] = [];
      for (const c of all) {
        const node = nodes.get(c.id)!;
        const parent = c.parentId ? nodes.get(c.parentId) : undefined;
        (parent ? parent.children : roots).push(node);
      }
      // A parent's count includes its subcategories' crops (a crop counted once per path).
      const total = (n: Node): number => n.cropCount + n.children.reduce((sum, ch) => sum + total(ch), 0);
      const withTotals = (n: Node): Node & { totalCropCount: number } => ({ ...n, totalCropCount: total(n), children: n.children.map(withTotals) });
      return roots.map(withTotals);
    },

    async listCrops(lang: LanguageCode, filter: { category?: string; q?: string }) {
      let categoryIds: string[] | undefined;
      if (filter.category) {
        const all = await activeCategories();
        const root = all.find((c) => c.slug === filter.category);
        if (!root) throw new HttpError(404, 'NOT_FOUND', 'Category not found.');
        categoryIds = descendantsOf(all, root.id);
      }
      const q = filter.q?.trim();
      const crops = await prisma.crop.findMany({
        where: {
          ...PUBLISHED_CROP,
          ...(categoryIds ? { categoryMappings: { some: { categoryId: { in: categoryIds } } } } : {}),
          ...(q
            ? { OR: [{ commonName: { contains: q, mode: 'insensitive' } }, { translations: { some: { field: 'NAME', value: { contains: q, mode: 'insensitive' } } } }] }
            : {}),
        },
        orderBy: { commonName: 'asc' },
        select: {
          id: true, slug: true, commonName: true, scientificName: true,
          heroImage: { select: { url: true, thumbnailUrl: true, status: true } },
          categoryMappings: { orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }], select: { isPrimary: true, category: { select: { id: true, slug: true, name: true } } } },
          _count: { select: { growingProcedures: { where: { status: 'PUBLISHED', deletedAt: null, versions: { some: { status: 'PUBLISHED' } } } } } },
        },
      });
      const tCrop = await loadTranslations(prisma, 'cropId', crops.map((c) => c.id), lang);
      const tCat = await loadTranslations(prisma, 'cropCategoryId', crops.flatMap((c) => c.categoryMappings.map((m) => m.category.id)), lang);
      return crops.map((c) => ({
        slug: c.slug,
        name: tCrop(c.id, 'NAME', c.commonName),
        scientificName: c.scientificName,
        imageUrl: c.heroImage?.status === 'PUBLISHED' ? (c.heroImage.thumbnailUrl ?? c.heroImage.url) : null,
        categories: c.categoryMappings.map((m) => ({ slug: m.category.slug, name: tCat(m.category.id, 'NAME', m.category.name), isPrimary: m.isPrimary })),
        guideCount: c._count.growingProcedures,
      }));
    },

    async cropDetail(lang: LanguageCode, slug: string) {
      const crop = await prisma.crop.findFirst({
        where: { slug, ...PUBLISHED_CROP },
        select: {
          id: true, slug: true, commonName: true, scientificName: true, description: true, lifeCycle: true,
          heroImage: { select: { url: true, status: true, attributionText: true } },
          categoryMappings: { orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }], select: { isPrimary: true, category: { select: { id: true, slug: true, name: true } } } },
          varieties: { where: { status: 'PUBLISHED', deletedAt: null }, orderBy: { name: 'asc' }, select: { id: true, slug: true, name: true, description: true, releasingInstitution: true, releaseYear: true, isHybrid: true, verificationStatus: true, source: { select: SOURCE_SELECT } } },
          seasonMappings: { where: { verificationStatus: { not: 'UNVERIFIED' } }, select: { sowingStartMonth: true, sowingEndMonth: true, notes: true, verificationStatus: true, season: { select: { id: true, code: true, name: true } }, region: { select: { name: true } }, source: { select: SOURCE_SELECT } } },
          soilSuitabilities: { where: { verificationStatus: { not: 'UNVERIFIED' } }, select: { suitability: true, notes: true, verificationStatus: true, soilType: { select: { id: true, code: true, name: true } }, source: { select: SOURCE_SELECT } } },
          requirements: {
            where: { status: 'PUBLISHED' },
            select: {
              minValue: true, maxValue: true, optimalMinValue: true, optimalMaxValue: true, level: true, importance: true, notes: true, verificationStatus: true,
              parameter: { select: { id: true, code: true, name: true } }, unit: { select: { code: true, symbol: true } },
              season: { select: { code: true } }, region: { select: { name: true } }, source: { select: SOURCE_SELECT },
            },
          },
          growingProcedures: {
            where: { status: 'PUBLISHED', deletedAt: null, versions: { some: { status: 'PUBLISHED' } } },
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
            select: {
              id: true, name: true, description: true, isDefault: true,
              cultivationMethod: { select: { id: true, code: true, name: true } }, season: { select: { code: true } }, region: { select: { name: true } },
              versions: { where: { status: 'PUBLISHED' }, take: 1, select: { versionNumber: true, verificationStatus: true, publishedAt: true, _count: { select: { stages: true } } } },
            },
          },
        },
      });
      if (!crop) throw new HttpError(404, 'NOT_FOUND', 'Crop not found.');

      const [tCrop, tCat, tVar, tSeason, tSoil, tParam, tProc, tMethod] = await Promise.all([
        loadTranslations(prisma, 'cropId', [crop.id], lang),
        loadTranslations(prisma, 'cropCategoryId', crop.categoryMappings.map((m) => m.category.id), lang),
        loadTranslations(prisma, 'cropVarietyId', crop.varieties.map((v) => v.id), lang),
        loadTranslations(prisma, 'seasonId', crop.seasonMappings.map((s) => s.season.id), lang),
        loadTranslations(prisma, 'soilTypeId', crop.soilSuitabilities.map((s) => s.soilType.id), lang),
        loadTranslations(prisma, 'agronomicParameterId', crop.requirements.map((r) => r.parameter.id), lang),
        loadTranslations(prisma, 'growingProcedureId', crop.growingProcedures.map((p) => p.id), lang),
        loadTranslations(prisma, 'cultivationMethodId', crop.growingProcedures.flatMap((p) => (p.cultivationMethod ? [p.cultivationMethod.id] : [])), lang),
      ]);

      return {
        slug: crop.slug,
        name: tCrop(crop.id, 'NAME', crop.commonName),
        scientificName: crop.scientificName,
        description: tCrop.optional(crop.id, 'DESCRIPTION', crop.description),
        lifeCycle: crop.lifeCycle,
        image: crop.heroImage?.status === 'PUBLISHED' ? { url: crop.heroImage.url, attribution: crop.heroImage.attributionText } : null,
        categories: crop.categoryMappings.map((m) => ({ slug: m.category.slug, name: tCat(m.category.id, 'NAME', m.category.name), isPrimary: m.isPrimary })),
        varieties: crop.varieties.map((v) => ({
          slug: v.slug, name: tVar(v.id, 'NAME', v.name), description: tVar.optional(v.id, 'DESCRIPTION', v.description),
          releasingInstitution: v.releasingInstitution, releaseYear: v.releaseYear, isHybrid: v.isHybrid,
          trust: trustLabel(v.verificationStatus), source: sourceView(v.source),
        })),
        seasons: crop.seasonMappings.map((s) => ({
          code: s.season.code, name: tSeason(s.season.id, 'NAME', s.season.name), region: s.region?.name ?? null,
          sowingStartMonth: s.sowingStartMonth, sowingEndMonth: s.sowingEndMonth, notes: s.notes,
          trust: trustLabel(s.verificationStatus), source: sourceView(s.source),
        })),
        soils: crop.soilSuitabilities.map((s) => ({
          code: s.soilType.code, name: tSoil(s.soilType.id, 'NAME', s.soilType.name), suitability: s.suitability, notes: s.notes,
          trust: trustLabel(s.verificationStatus), source: sourceView(s.source),
        })),
        requirements: crop.requirements.map((r) => ({
          parameter: r.parameter.code, name: tParam(r.parameter.id, 'NAME', r.parameter.name),
          min: num(r.minValue), max: num(r.maxValue), optimalMin: num(r.optimalMinValue), optimalMax: num(r.optimalMaxValue),
          unit: r.unit?.symbol ?? null, level: r.level, importance: r.importance, season: r.season?.code ?? null, region: r.region?.name ?? null,
          notes: r.notes, trust: trustLabel(r.verificationStatus), source: sourceView(r.source),
        })),
        guides: crop.growingProcedures.map((p) => ({
          id: p.id, name: tProc(p.id, 'NAME', p.name), description: tProc.optional(p.id, 'DESCRIPTION', p.description), isDefault: p.isDefault,
          method: p.cultivationMethod ? { code: p.cultivationMethod.code, name: tMethod(p.cultivationMethod.id, 'NAME', p.cultivationMethod.name) } : null,
          season: p.season?.code ?? null, region: p.region?.name ?? null,
          version: p.versions[0]!.versionNumber, stageCount: p.versions[0]!._count.stages,
          trust: trustLabel(p.versions[0]!.verificationStatus), publishedAt: p.versions[0]!.publishedAt,
        })),
      };
    },

    /** The complete published guide: ordered stages with instructions, resources, mistakes, media and sources. */
    async procedure(lang: LanguageCode, procedureId: string) {
      const procedure = await prisma.growingProcedure.findFirst({
        where: { id: procedureId, status: 'PUBLISHED', deletedAt: null, crop: PUBLISHED_CROP },
        select: {
          id: true, name: true, description: true,
          crop: { select: { id: true, slug: true, commonName: true } },
          cultivationMethod: { select: { id: true, code: true, name: true } },
          versions: {
            where: { status: 'PUBLISHED' },
            take: 1,
            select: {
              id: true, versionNumber: true, publishedAt: true, verificationStatus: true, changeSummary: true, source: { select: SOURCE_SELECT },
              stages: {
                orderBy: { sequence: 'asc' },
                select: {
                  id: true, sequence: true, title: true, description: true, startDay: true, endDay: true, dayAnchor: true, isContinuous: true, isOptional: true,
                  stageType: { select: { code: true, iconName: true } },
                  instructions: { orderBy: { sequence: 'asc' }, select: { id: true, sequence: true, title: true, description: true, instructionType: true, durationValue: true, durationUnit: { select: { symbol: true } }, safetyLevel: true, safetyInfo: true, source: { select: SOURCE_SELECT } } },
                  resources: { orderBy: { sequence: 'asc' }, select: { id: true, resourceType: true, name: true, description: true, isOptional: true } },
                  commonMistakes: { orderBy: { sequence: 'asc' }, select: { id: true, title: true, consequence: true, prevention: true, source: { select: SOURCE_SELECT } } },
                  media: {
                    where: { mediaAsset: { status: 'PUBLISHED', deletedAt: null } },
                    orderBy: { sequence: 'asc' },
                    select: { purpose: true, isPrimary: true, caption: true, mediaAsset: { select: { id: true, mediaType: true, title: true, url: true, thumbnailUrl: true, durationSeconds: true, attributionText: true, licenseType: true, language: { select: { code: true } } } } },
                  },
                },
              },
            },
          },
        },
      });
      const version = procedure?.versions[0];
      if (!procedure || !version) throw new HttpError(404, 'NOT_FOUND', 'Growing guide not found.');

      const stages = version.stages;
      const [tProc, tCrop, tStage, tIns, tRes, tMis, tMedia] = await Promise.all([
        loadTranslations(prisma, 'growingProcedureId', [procedure.id], lang),
        loadTranslations(prisma, 'cropId', [procedure.crop.id], lang),
        loadTranslations(prisma, 'growingStageId', stages.map((s) => s.id), lang),
        loadTranslations(prisma, 'stageInstructionId', stages.flatMap((s) => s.instructions.map((i) => i.id)), lang),
        loadTranslations(prisma, 'stageResourceId', stages.flatMap((s) => s.resources.map((r) => r.id)), lang),
        loadTranslations(prisma, 'stageCommonMistakeId', stages.flatMap((s) => s.commonMistakes.map((m) => m.id)), lang),
        loadTranslations(prisma, 'mediaAssetId', stages.flatMap((s) => s.media.map((m) => m.mediaAsset.id)), lang),
      ]);

      return {
        id: procedure.id,
        name: tProc(procedure.id, 'NAME', procedure.name),
        description: tProc.optional(procedure.id, 'DESCRIPTION', procedure.description),
        crop: { slug: procedure.crop.slug, name: tCrop(procedure.crop.id, 'NAME', procedure.crop.commonName) },
        method: procedure.cultivationMethod?.code ?? null,
        version: version.versionNumber,
        publishedAt: version.publishedAt,
        trust: trustLabel(version.verificationStatus),
        source: sourceView(version.source),
        stages: stages.map((s) => ({
          id: s.id,
          sequence: s.sequence,
          type: s.stageType?.code ?? null,
          icon: s.stageType?.iconName ?? null,
          title: tStage(s.id, 'TITLE', s.title),
          description: tStage.optional(s.id, 'DESCRIPTION', s.description),
          startDay: s.startDay, endDay: s.endDay, dayAnchor: s.dayAnchor, isContinuous: s.isContinuous, isOptional: s.isOptional,
          instructions: s.instructions.map((i) => ({
            sequence: i.sequence, type: i.instructionType,
            title: tIns(i.id, 'TITLE', i.title), description: tIns(i.id, 'DESCRIPTION', i.description),
            duration: i.durationValue ? `${num(i.durationValue)} ${i.durationUnit?.symbol ?? ''}`.trim() : null,
            safetyLevel: i.safetyLevel, safetyInfo: tIns.optional(i.id, 'SAFETY_INFO', i.safetyInfo),
            source: sourceView(i.source),
          })),
          resources: s.resources.map((r) => ({ type: r.resourceType, name: tRes(r.id, 'NAME', r.name), description: tRes.optional(r.id, 'DESCRIPTION', r.description), isOptional: r.isOptional })),
          mistakes: s.commonMistakes.map((m) => ({
            title: tMis(m.id, 'TITLE', m.title), consequence: tMis.optional(m.id, 'CONSEQUENCE', m.consequence), prevention: tMis.optional(m.id, 'PREVENTION', m.prevention),
            source: sourceView(m.source),
          })),
          media: s.media.map((m) => ({
            type: m.mediaAsset.mediaType, purpose: m.purpose, isPrimary: m.isPrimary,
            title: tMedia(m.mediaAsset.id, 'TITLE', m.mediaAsset.title), caption: m.caption,
            url: m.mediaAsset.url, thumbnailUrl: m.mediaAsset.thumbnailUrl, durationSeconds: m.mediaAsset.durationSeconds,
            language: m.mediaAsset.language?.code ?? null, attribution: m.mediaAsset.attributionText, license: m.mediaAsset.licenseType,
          })),
        })),
      };
    },
  };
}
