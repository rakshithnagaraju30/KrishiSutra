/**
 * Loads source-cited crop content into the knowledge tables (idempotent).
 *
 * - Sources: one ContentSource per URL.
 * - Crop: published (it now has cited content); description updated.
 * - Requirements / soil suitability: one row per (crop, parameter|soil, source), updated in place.
 * - Guide: GrowingProcedure + ProcedureVersion `version`. If that version does not exist yet it is
 *   created and PUBLISHED, and any previously published version is SUPERSEDED in the same transaction
 *   (farmers already following the old version keep it).
 */
import type { PrismaClient } from '../../../generated/prisma/client.ts';
import { STAGE_TITLE_TRANSLATIONS, type CropContent } from './types.ts';

export async function loadCropContent(prisma: PrismaClient, content: CropContent) {
  const crop = await prisma.crop.findUniqueOrThrow({ where: { slug: content.cropSlug }, select: { id: true } });
  const lang = Object.fromEntries((await prisma.language.findMany({ select: { code: true, id: true } })).map((l) => [l.code, l.id]));

  // ---- sources
  const sourceIds: Record<string, string> = {};
  for (const [key, def] of Object.entries(content.sources)) {
    const data = {
      sourceType: 'AGRICULTURAL_UNIVERSITY' as const,
      title: def.title,
      organization: def.organization,
      url: def.url,
      publicationYear: def.year ?? null,
      licenseType: 'UNKNOWN' as const,
      notes: def.notes ?? 'Text cited from the public page; not copied as a whole. Pending expert review.',
    };
    const existing = await prisma.contentSource.findFirst({ where: { url: def.url }, select: { id: true } });
    sourceIds[key] = existing ? (await prisma.contentSource.update({ where: { id: existing.id }, data })).id : (await prisma.contentSource.create({ data })).id;
  }
  const src = (key: string) => {
    const id = sourceIds[key];
    if (!id) throw new Error(`${content.cropSlug}: unknown source key "${key}"`);
    return id;
  };

  // ---- crop
  await prisma.crop.update({ where: { id: crop.id }, data: { status: 'PUBLISHED', description: content.description ?? null } });

  // ---- requirements
  for (const r of content.requirements ?? []) {
    const parameter = await prisma.agronomicParameter.findUniqueOrThrow({ where: { code: r.parameter }, select: { id: true } });
    const unit = r.unit ? await prisma.measurementUnit.findUniqueOrThrow({ where: { code: r.unit }, select: { id: true } }) : null;
    const data = {
      minValue: r.min ?? null, maxValue: r.max ?? null, unitId: unit?.id ?? null, level: r.level ?? null,
      importance: r.importance ?? 'PREFERRED', notes: r.notes ?? null, status: 'PUBLISHED' as const, verificationStatus: 'SOURCE_CITED' as const,
    };
    const existing = await prisma.cropRequirement.findFirst({ where: { cropId: crop.id, parameterId: parameter.id, sourceId: src(r.source), cropVarietyId: null }, select: { id: true } });
    if (existing) await prisma.cropRequirement.update({ where: { id: existing.id }, data });
    else await prisma.cropRequirement.create({ data: { cropId: crop.id, parameterId: parameter.id, sourceId: src(r.source), ...data } });
  }

  // ---- soil suitability
  for (const s of content.soils ?? []) {
    const soil = await prisma.soilType.findUniqueOrThrow({ where: { code: s.soilType }, select: { id: true } });
    const data = { suitability: s.suitability, notes: s.notes ?? null, verificationStatus: 'SOURCE_CITED' as const };
    const existing = await prisma.cropSoilSuitability.findFirst({ where: { cropId: crop.id, soilTypeId: soil.id, sourceId: src(s.source), cropVarietyId: null }, select: { id: true } });
    if (existing) await prisma.cropSoilSuitability.update({ where: { id: existing.id }, data });
    else await prisma.cropSoilSuitability.create({ data: { cropId: crop.id, soilTypeId: soil.id, sourceId: src(s.source), ...data } });
  }

  // ---- seasons
  if (content.seasons?.length) {
    const karnataka = await prisma.region.findFirst({ where: { type: 'STATE', name: 'Karnataka' }, select: { id: true } });
    for (const s of content.seasons) {
      const season = await prisma.season.findUniqueOrThrow({ where: { code: s.season }, select: { id: true } });
      const regionId = s.region === 'Karnataka' ? (karnataka?.id ?? null) : null;
      const data = { regionId, sowingStartMonth: s.startMonth ?? null, sowingEndMonth: s.endMonth ?? null, notes: s.notes, verificationStatus: 'SOURCE_CITED' as const };
      const existing = await prisma.cropSeasonMapping.findFirst({ where: { cropId: crop.id, seasonId: season.id, sourceId: src(s.source), cropVarietyId: null }, select: { id: true } });
      if (existing) await prisma.cropSeasonMapping.update({ where: { id: existing.id }, data });
      else await prisma.cropSeasonMapping.create({ data: { cropId: crop.id, seasonId: season.id, sourceId: src(s.source), ...data } });
    }
  }

  // ---- guide (versioned)
  const g = content.guide;
  const method = g.method ? await prisma.cultivationMethod.findUniqueOrThrow({ where: { code: g.method }, select: { id: true } }) : null;
  const stageTypes = Object.fromEntries((await prisma.stageType.findMany({ select: { code: true, id: true } })).map((s) => [s.code, s.id]));

  const procedure = await prisma.growingProcedure.upsert({
    where: { cropId_slug: { cropId: crop.id, slug: g.slug } },
    update: { name: g.name, description: g.description, cultivationMethodId: method?.id ?? null, status: 'PUBLISHED', isDefault: true },
    create: { cropId: crop.id, slug: g.slug, name: g.name, description: g.description, cultivationMethodId: method?.id ?? null, status: 'PUBLISHED', isDefault: true },
  });
  // Only one default guide per crop: the demonstration guide (if any) stops being the default.
  await prisma.growingProcedure.updateMany({ where: { cropId: crop.id, id: { not: procedure.id }, isDefault: true }, data: { isDefault: false } });

  const exists = await prisma.procedureVersion.findUnique({ where: { procedureId_versionNumber: { procedureId: procedure.id, versionNumber: g.version } }, select: { id: true } });
  let versionId = exists?.id;
  if (!exists) {
    versionId = await prisma.$transaction(async (tx) => {
      const now = new Date();
      await tx.procedureVersion.updateMany({ where: { procedureId: procedure.id, status: 'PUBLISHED' }, data: { status: 'SUPERSEDED', supersededAt: now } });
      const version = await tx.procedureVersion.create({
        data: {
          procedureId: procedure.id, versionNumber: g.version, status: 'PUBLISHED', verificationStatus: 'SOURCE_CITED',
          sourceId: src(g.source), changeSummary: g.changeSummary, approvedAt: now, publishedAt: now,
        },
        select: { id: true },
      });
      for (const [i, s] of g.stages.entries()) {
        await tx.growingStage.create({
          data: {
            procedureVersionId: version.id, procedureId: procedure.id, sequence: i + 1,
            stageTypeId: s.type ? (stageTypes[s.type] ?? null) : null,
            title: s.title, description: s.description ?? null,
            startDay: s.startDay ?? null, endDay: s.endDay ?? null, dayAnchor: s.anchor ?? 'SOWING', isContinuous: s.continuous ?? false,
            instructions: {
              create: s.instructions.map((ins, j) => ({
                sequence: j + 1, title: ins.title, description: ins.text, instructionType: ins.type ?? 'ACTION',
                safetyLevel: ins.safety?.level ?? 'NONE', safetyInfo: ins.safety?.info ?? null, sourceId: src(ins.source),
              })),
            },
            resources: { create: (s.resources ?? []).map((r, j) => ({ resourceType: r.type, name: r.name, description: r.description ?? null, sequence: j })) },
            commonMistakes: { create: (s.mistakes ?? []).map((m, j) => ({ sequence: j + 1, title: m.title, consequence: m.consequence ?? null, prevention: m.prevention ?? null, sourceId: src(m.source) })) },
          },
        });
      }
      return version.id;
    }, { timeout: 120_000, maxWait: 30_000 });
  }

  // ---- draft translations of guide and stage titles (DRAFT, pending review)
  const stages = await prisma.growingStage.findMany({ where: { procedureVersionId: versionId }, orderBy: { sequence: 'asc' }, select: { id: true } });
  for (const code of ['kn', 'hi'] as const) {
    const t = content.translations?.[code];
    const languageId = lang[code];
    if (!t || !languageId) continue;
    const put = async (target: { growingProcedureId?: string; growingStageId?: string }, field: 'NAME' | 'TITLE', value: string) => {
      const existing = await prisma.translation.findFirst({ where: { ...target, field, languageId }, select: { id: true } });
      if (existing) await prisma.translation.update({ where: { id: existing.id }, data: { value } });
      else await prisma.translation.create({ data: { ...target, field, languageId, value, status: 'DRAFT' } });
    };
    if (t.guide) await put({ growingProcedureId: procedure.id }, 'NAME', t.guide);
    for (const [i, title] of (t.stages ?? []).entries()) {
      const stage = stages[i];
      if (stage && title) await put({ growingStageId: stage.id }, 'TITLE', title);
    }
  }
  // Stage titles with a shared draft translation.
  for (const [i, stage] of g.stages.entries()) {
    const dict = STAGE_TITLE_TRANSLATIONS[stage.title];
    const row = stages[i];
    if (!dict || !row) continue;
    for (const code of ['kn', 'hi'] as const) {
      const languageId = lang[code];
      if (!languageId || content.translations?.[code]?.stages?.[i]) continue;
      const existing = await prisma.translation.findFirst({ where: { growingStageId: row.id, field: 'TITLE', languageId }, select: { id: true } });
      if (existing) await prisma.translation.update({ where: { id: existing.id }, data: { value: dict[code] } });
      else await prisma.translation.create({ data: { growingStageId: row.id, field: 'TITLE', languageId, value: dict[code], status: 'DRAFT' } });
    }
  }
  return { cropSlug: content.cropSlug, procedureId: procedure.id, stages: stages.length };
}
