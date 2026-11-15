/**
 * Phase 2.5 — database integration tests.
 * Requires a migrated + seeded database (npm run db:deploy && npm run db:seed).
 * Run: npm test
 */
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { prisma } from '../src/db/prisma.ts';
import { ownedFarmCrop } from '../src/db/ownership.ts';
import { expectDbError, inRollback, makeFarmer, makeFarmWithPlot, makePublishedProcedure, ref, testPhone } from './helpers.ts';

after(async () => {
  await prisma.$disconnect();
});

// ------------------------------------------------------------------------------------------------
describe('Module 1 — users and roles', () => {
  it('creates a farmer with a phone number, a role and a preferred language', async () => {
    const user = await inRollback(async (tx) => {
      const farmer = await makeFarmer(tx, 'Lakshmi');
      return tx.user.findUniqueOrThrow({
        where: { id: farmer.id },
        include: { roles: { include: { role: true } }, preferredLanguage: true },
      });
    });
    assert.equal(user.fullName, 'Lakshmi');
    assert.equal(user.passwordHash, null, 'no password is stored for an OTP-only account');
    assert.deepEqual(user.roles.map((r) => r.role.code), ['FARMER']);
    assert.equal(user.preferredLanguage?.code, 'kn');
  });

  it('supports several roles per user (farmer who is also an expert)', async () => {
    const codes = await inRollback(async (tx) => {
      const r = await ref(tx);
      const user = await makeFarmer(tx);
      await tx.userRole.create({ data: { userId: user.id, roleId: await r.role('AGRI_EXPERT') } });
      const roles = await tx.userRole.findMany({ where: { userId: user.id }, include: { role: true } });
      return roles.map((x) => x.role.code).sort();
    });
    assert.deepEqual(codes, ['AGRI_EXPERT', 'FARMER']);
  });

  it('rejects a user with neither email nor phone', async () => {
    await expectDbError((tx) => tx.user.create({ data: { fullName: 'No contact' } }), 'User_email_or_phone_chk');
  });

  it('rejects a non-lower-case email and a malformed phone', async () => {
    await expectDbError((tx) => tx.user.create({ data: { fullName: 'X', email: 'Farmer@Example.com' } }), 'User_email_lowercase_chk');
    await expectDbError((tx) => tx.user.create({ data: { fullName: 'X', phone: '98765' } }), 'User_phone_e164_chk');
  });

  it('rejects a duplicate phone number', async () => {
    const phone = testPhone();
    await expectDbError(async (tx) => {
      await tx.user.create({ data: { fullName: 'A', phone } });
      await tx.user.create({ data: { fullName: 'B', phone } });
    }, 'P2002');
  });
});

// ------------------------------------------------------------------------------------------------
describe('Module 7 — farms, plots, water sources and soil tests', () => {
  it('creates a farm with plots and a borewell shared by two plots', async () => {
    const farm = await inRollback(async (tx) => {
      const r = await ref(tx);
      const farmer = await makeFarmer(tx);
      const { farm, plot } = await makeFarmWithPlot(tx, farmer.id);
      const plot2 = await tx.farmPlot.create({ data: { farmId: farm.id, name: 'West plot', area: '40', areaUnitId: await r.unit('GUNTA') } });
      const borewell = await tx.waterSource.create({
        data: { farmId: farm.id, waterSourceTypeId: await r.waterSourceType('BOREWELL'), availability: 'SEASONAL', availableMonths: [6, 7, 8, 9, 10] },
      });
      await tx.plotWaterSource.createMany({
        data: [
          { plotId: plot.id, waterSourceId: borewell.id, farmId: farm.id, isPrimary: true },
          { plotId: plot2.id, waterSourceId: borewell.id, farmId: farm.id },
        ],
      });
      return tx.farm.findUniqueOrThrow({
        where: { id: farm.id },
        include: { plots: { include: { waterSources: true, areaUnit: true }, orderBy: { name: 'asc' } }, waterSources: true },
      });
    });
    assert.equal(farm.plots.length, 2);
    assert.equal(farm.waterSources.length, 1);
    assert.ok(farm.plots.every((p) => p.waterSources.length === 1));
    assert.deepEqual(farm.plots.map((p) => p.areaUnit.code).sort(), ['ACRE', 'GUNTA']);
  });

  it("rejects linking a plot to another farm's water source (composite FK)", async () => {
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      const farmer = await makeFarmer(tx);
      const a = await makeFarmWithPlot(tx, farmer.id);
      const b = await makeFarmWithPlot(tx, farmer.id);
      const wellOnB = await tx.waterSource.create({ data: { farmId: b.farm.id, waterSourceTypeId: await r.waterSourceType('OPEN_WELL') } });
      await tx.plotWaterSource.create({ data: { plotId: a.plot.id, waterSourceId: wellOnB.id, farmId: a.farm.id } });
    }, 'PlotWaterSource_waterSourceId_farmId_fkey');
  });

  it('keeps soil-test history where each report has different parameters', async () => {
    const tests = await inRollback(async (tx) => {
      const r = await ref(tx);
      const farmer = await makeFarmer(tx);
      const { plot } = await makeFarmWithPlot(tx, farmer.id);
      const kgHa = await r.unit('KG_PER_HECTARE');
      // Older report: pH only.
      await tx.soilTest.create({
        data: {
          plotId: plot.id, testDate: new Date('2025-05-10'), source: 'FIELD_TEST_KIT',
          results: { create: [{ parameterId: await r.param('SOIL_PH'), value: '6.8', unitId: await r.unit('PH') }] },
        },
      });
      // Newer Soil Health Card: pH, OC, N, P (no K, no micronutrients).
      await tx.soilTest.create({
        data: {
          plotId: plot.id, testDate: new Date('2026-04-02'), source: 'SOIL_HEALTH_CARD', laboratoryName: 'Test lab',
          results: {
            create: [
              { parameterId: await r.param('SOIL_PH'), value: '7.1', unitId: await r.unit('PH') },
              { parameterId: await r.param('SOIL_ORGANIC_CARBON'), value: '0.45', unitId: await r.unit('PERCENT'), rating: 'LOW' },
              { parameterId: await r.param('SOIL_AVAILABLE_N'), value: '210', unitId: kgHa },
              { parameterId: await r.param('SOIL_AVAILABLE_P'), value: '18.5', unitId: kgHa },
            ],
          },
        },
      });
      return tx.soilTest.findMany({
        where: { plotId: plot.id },
        orderBy: { testDate: 'desc' },
        include: { results: { include: { parameter: true } } },
      });
    });
    assert.equal(tests.length, 2, 'both tests are kept');
    assert.equal(tests[0]!.results.length, 4);
    assert.equal(tests[1]!.results.length, 1);
    assert.ok(!tests[0]!.results.some((x) => x.parameter.code === 'SOIL_AVAILABLE_K'), 'missing parameters are simply absent');
  });

  it('rejects the same parameter twice in one soil test, and a non-positive plot area', async () => {
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      const { plot } = await makeFarmWithPlot(tx, (await makeFarmer(tx)).id);
      const ph = await r.param('SOIL_PH');
      const unitId = await r.unit('PH');
      await tx.soilTest.create({
        data: { plotId: plot.id, testDate: new Date(), results: { create: [{ parameterId: ph, value: '6', unitId }, { parameterId: ph, value: '7', unitId }] } },
      });
    }, 'P2002');
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      const { farm } = await makeFarmWithPlot(tx, (await makeFarmer(tx)).id);
      await tx.farmPlot.create({ data: { farmId: farm.id, name: 'Zero', area: '0', areaUnitId: await r.unit('ACRE') } });
    }, 'FarmPlot_area_positive_chk');
  });
});

// ------------------------------------------------------------------------------------------------
describe('Module 2 — categories', () => {
  it('supports unlimited nesting and walks the path with a recursive query', async () => {
    const path = await inRollback(async (tx) => {
      const r = await ref(tx);
      const leafy = await r.category('leafy-vegetables');
      const micro = await tx.cropCategory.create({ data: { name: 'Microgreens', slug: 'microgreens-test', parentId: leafy.id } });
      const deeper = await tx.cropCategory.create({ data: { name: 'Sprouts', slug: 'sprouts-test', parentId: micro.id } });
      const rows = await tx.$queryRaw<{ name: string; depth: number }[]>`
        WITH RECURSIVE up AS (
          SELECT id, "parentId", name, 0 AS depth FROM "CropCategory" WHERE id = ${deeper.id}::uuid
          UNION ALL
          SELECT c.id, c."parentId", c.name, up.depth + 1 FROM "CropCategory" c JOIN up ON c.id = up."parentId"
        )
        SELECT name, depth FROM up ORDER BY depth DESC`;
      return rows.map((x) => x.name);
    });
    assert.deepEqual(path, ['Vegetable Crops', 'Leafy Vegetables', 'Microgreens', 'Sprouts']);
  });

  it('rejects a category that is its own parent', async () => {
    await expectDbError(async (tx) => {
      const c = await tx.cropCategory.create({ data: { name: 'Loop', slug: 'loop-test' } });
      await tx.cropCategory.update({ where: { id: c.id }, data: { parentId: c.id } });
    }, 'CropCategory_not_own_parent_chk');
  });

  it('lets a crop belong to several categories with exactly one primary', async () => {
    const mappings = await inRollback(async (tx) => {
      const r = await ref(tx);
      const groundnut = await r.crop('groundnut');
      return tx.cropCategoryMapping.findMany({ where: { cropId: groundnut.id }, include: { category: true }, orderBy: { displayOrder: 'asc' } });
    });
    assert.deepEqual(mappings.map((m) => m.category.slug), ['oilseed-crops', 'commercial-cash-crops']);
    assert.deepEqual(mappings.map((m) => m.isPrimary), [true, false]);
  });

  it('rejects a second primary category for the same crop', async () => {
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      const chilli = await r.crop('chilli');
      const spice = await r.category('spice-crops');
      await tx.cropCategoryMapping.update({ where: { cropId_categoryId: { cropId: chilli.id, categoryId: spice.id } }, data: { isPrimary: true } });
    }, 'CropCategoryMapping_one_primary_per_crop');
  });

  it('upserts a mapping without tripping over the partial unique index', async () => {
    const mapping = await inRollback(async (tx) => {
      const r = await ref(tx);
      const maize = await r.crop('maize');
      const fodder = await r.category('fodder-crops');
      return tx.cropCategoryMapping.upsert({
        where: { cropId_categoryId: { cropId: maize.id, categoryId: fodder.id } },
        update: { displayOrder: 5 },
        create: { cropId: maize.id, categoryId: fodder.id, displayOrder: 5 },
      });
    });
    assert.equal(mapping.displayOrder, 5);
  });
});

// ------------------------------------------------------------------------------------------------
describe('Module 3 — varieties and requirements', () => {
  it('creates varieties with slugs unique per crop', async () => {
    await inRollback(async (tx) => {
      const r = await ref(tx);
      const tomato = await r.crop('tomato');
      const onion = await r.crop('onion');
      await tx.cropVariety.create({ data: { cropId: tomato.id, name: 'Test variety', slug: 'test-variety' } });
      await tx.cropVariety.create({ data: { cropId: onion.id, name: 'Test variety', slug: 'test-variety' } }); // same slug, other crop: OK
    });
    await expectDbError(async (tx) => {
      const tomato = await (await ref(tx)).crop('tomato');
      await tx.cropVariety.create({ data: { cropId: tomato.id, name: 'Dup', slug: 'demo-variety-a' } });
    }, 'P2002');
  });

  it("rejects a requirement that points at another crop's variety (composite FK)", async () => {
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      const rice = await r.crop('rice');
      const tomatoVariety = await r.variety('tomato');
      await tx.cropRequirement.create({
        data: { cropId: rice.id, cropVarietyId: tomatoVariety.id, parameterId: await r.param('WATER_NEED'), level: 'HIGH' },
      });
    }, 'CropRequirement_cropVarietyId_cropId_fkey');
  });

  it('enforces requirement ranges, units and a source before publishing', async () => {
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      await tx.cropRequirement.create({
        data: { cropId: (await r.crop('rice')).id, parameterId: await r.param('SOIL_PH'), minValue: '8', maxValue: '6', unitId: await r.unit('PH') },
      });
    }, 'CropRequirement_range_chk');
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      await tx.cropRequirement.create({ data: { cropId: (await r.crop('rice')).id, parameterId: await r.param('SOIL_PH'), minValue: '6' } });
    }, 'CropRequirement_numeric_has_unit_chk');
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      await tx.cropRequirement.create({
        data: { cropId: (await r.crop('rice')).id, parameterId: await r.param('WATER_NEED'), level: 'HIGH', status: 'PUBLISHED' },
      });
    }, 'CropRequirement_published_has_source_chk');
  });
});

// ------------------------------------------------------------------------------------------------
describe('Module 4 — growing procedures and versions', () => {
  it('creates a procedure with ordered, crop-specific stages, instructions, resources and mistakes', async () => {
    const stages = await inRollback(async (tx) => {
      const r = await ref(tx);
      const tomato = await r.crop('tomato');
      const procedure = await tx.growingProcedure.create({ data: { cropId: tomato.id, name: 'Test tomato', slug: 'test-tomato' } });
      const version = await tx.procedureVersion.create({ data: { procedureId: procedure.id, versionNumber: 1 } });
      const titles = ['Nursery', 'Transplanting', 'Staking'];
      for (const [i, title] of titles.entries()) {
        await tx.growingStage.create({
          data: {
            procedureVersionId: version.id, procedureId: procedure.id, sequence: i + 1, title,
            instructions: {
              create: [
                { sequence: 1, title: `${title} step 1`, description: 'Test.', instructionType: 'ACTION', durationValue: '2', durationUnitId: await r.unit('DAY') },
                { sequence: 2, title: `${title} safety`, description: 'Test.', instructionType: 'PRECAUTION', safetyLevel: 'WARNING', safetyInfo: 'Wear gloves.' },
              ],
            },
            resources: { create: [{ resourceType: 'TOOL', name: 'Test tool' }] },
            commonMistakes: { create: [{ sequence: 1, title: 'Test mistake', prevention: 'Test prevention.' }] },
          },
        });
      }
      return tx.growingStage.findMany({
        where: { procedureVersionId: version.id },
        orderBy: { sequence: 'asc' },
        include: { instructions: { orderBy: { sequence: 'asc' } }, resources: true, commonMistakes: true },
      });
    });
    assert.deepEqual(stages.map((s) => s.title), ['Nursery', 'Transplanting', 'Staking']);
    assert.ok(stages.every((s) => s.instructions.length === 2 && s.resources.length === 1 && s.commonMistakes.length === 1));
  });

  it('rejects duplicate stage order and a stage attached to another procedure’s version', async () => {
    await expectDbError(async (tx) => {
      const { version, procedure } = await makePublishedProcedure(tx, 'onion');
      await tx.growingStage.create({ data: { procedureVersionId: version.id, procedureId: procedure.id, sequence: 1, title: 'Dup' } });
    }, 'P2002');
    await expectDbError(async (tx) => {
      const a = await makePublishedProcedure(tx, 'onion');
      const b = await makePublishedProcedure(tx, 'onion');
      await tx.growingStage.create({ data: { procedureVersionId: a.version.id, procedureId: b.procedure.id, sequence: 9, title: 'Wrong' } });
    }, 'GrowingStage_procedureVersionId_procedureId_fkey');
  });

  it('allows only one published version, and keeps old versions unchanged', async () => {
    await expectDbError(async (tx) => {
      const { procedure } = await makePublishedProcedure(tx, 'tomato');
      const now = new Date();
      await tx.procedureVersion.create({ data: { procedureId: procedure.id, versionNumber: 2, status: 'PUBLISHED', approvedAt: now, publishedAt: now } });
    }, 'ProcedureVersion_one_published_per_procedure');

    const result = await inRollback(async (tx) => {
      const { procedure, version: v1 } = await makePublishedProcedure(tx, 'tomato', ['A', 'B']);
      const now = new Date();
      // Publishing v2 = supersede v1 and publish v2 in the same transaction.
      await tx.procedureVersion.update({ where: { id: v1.id }, data: { status: 'SUPERSEDED', supersededAt: now } });
      const v2 = await tx.procedureVersion.create({
        data: {
          procedureId: procedure.id, versionNumber: 2, status: 'PUBLISHED', approvedAt: now, publishedAt: now,
          stages: { create: [{ sequence: 1, title: 'A (revised)' }, { sequence: 2, title: 'B' }, { sequence: 3, title: 'C (new)' }] },
        },
      });
      const v1Stages = await tx.growingStage.findMany({ where: { procedureVersionId: v1.id }, orderBy: { sequence: 'asc' } });
      const v2Stages = await tx.growingStage.findMany({ where: { procedureVersionId: v2.id }, orderBy: { sequence: 'asc' } });
      return { v1Stages: v1Stages.map((s) => s.title), v2Stages: v2Stages.map((s) => s.title) };
    });
    assert.deepEqual(result.v1Stages, ['A', 'B']);
    assert.deepEqual(result.v2Stages, ['A (revised)', 'B', 'C (new)']);
  });

  it('rejects publishing without approval dates', async () => {
    await expectDbError(async (tx) => {
      const crop = await (await ref(tx)).crop('maize');
      const procedure = await tx.growingProcedure.create({ data: { cropId: crop.id, name: 'X', slug: 'x-test' } });
      await tx.procedureVersion.create({ data: { procedureId: procedure.id, versionNumber: 1, status: 'PUBLISHED' } });
    }, 'ProcedureVersion_published_has_dates_chk');
  });
});

// ------------------------------------------------------------------------------------------------
describe('Modules 5 & 6 — educational media and translations', () => {
  it('attaches several media assets to one stage, with a translated title', async () => {
    const stage = await inRollback(async (tx) => {
      const r = await ref(tx);
      const { version } = await makePublishedProcedure(tx, 'rice');
      const stage = version.stages[0]!;
      const video = await tx.mediaAsset.create({
        data: {
          mediaType: 'VIDEO', title: 'Test video', storageProvider: 'S3', storageKey: `test/video-${Date.now()}.mp4`,
          url: 'https://media.example.invalid/test/video.mp4', durationSeconds: 320, languageId: await r.lang('kn'),
          licenseType: 'PERMISSION_GRANTED', permissionReference: 'Test permission letter', attributionText: 'Test KVK',
          sourceId: await r.demoSource(),
        },
      });
      const photo = await tx.mediaAsset.create({
        data: { mediaType: 'IMAGE', title: 'Test photo', storageProvider: 'CLOUDINARY', storageKey: `test/photo-${Date.now()}`, url: 'https://media.example.invalid/test/photo.jpg', licenseType: 'OWN_CONTENT' },
      });
      await tx.stageMedia.createMany({
        data: [
          { stageId: stage.id, mediaAssetId: video.id, purpose: 'DEMONSTRATION', sequence: 1, isPrimary: true },
          { stageId: stage.id, mediaAssetId: photo.id, purpose: 'REFERENCE_PHOTO', sequence: 2, instructionId: stage.instructions[0]!.id },
        ],
      });
      await tx.translation.create({ data: { mediaAssetId: video.id, field: 'TITLE', languageId: await r.lang('kn'), value: 'ಪರೀಕ್ಷಾ ವೀಡಿಯೊ' } });
      return tx.growingStage.findUniqueOrThrow({
        where: { id: stage.id },
        include: { media: { orderBy: { sequence: 'asc' }, include: { mediaAsset: { include: { translations: true } } } } },
      });
    });
    assert.deepEqual(stage.media.map((m) => m.mediaAsset.mediaType), ['VIDEO', 'IMAGE']);
    assert.equal(stage.media[0]!.mediaAsset.translations[0]!.value, 'ಪರೀಕ್ಷಾ ವೀಡಿಯೊ');
  });

  it('rejects publishing media with an unknown licence', async () => {
    await expectDbError(
      (tx) => tx.mediaAsset.create({ data: { mediaType: 'IMAGE', title: 'X', storageProvider: 'EXTERNAL_URL', url: 'https://example.invalid/x.jpg', status: 'PUBLISHED' } }),
      'MediaAsset_published_licence_known_chk',
    );
  });

  it('requires every translation to target exactly one record, once per field and language', async () => {
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      await tx.translation.create({
        data: { cropId: (await r.crop('rice')).id, soilTypeId: await r.soilType('RED'), field: 'NAME', languageId: await r.lang('ta'), value: 'x' },
      });
    }, 'Translation_exactly_one_target_chk');
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      await tx.translation.create({ data: { field: 'NAME', languageId: await r.lang('ta'), value: 'orphan' } });
    }, 'Translation_exactly_one_target_chk');
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      // Rice already has a Kannada NAME translation from the seed.
      await tx.translation.create({ data: { cropId: (await r.crop('rice')).id, field: 'NAME', languageId: await r.lang('kn'), value: 'dup' } });
    }, 'P2002');
  });

  it('returns the requested language and falls back to English when missing', async () => {
    const names = await inRollback(async (tx) => {
      const r = await ref(tx);
      const pick = async (slug: string, code: string) => {
        const crop = await tx.crop.findUniqueOrThrow({
          where: { slug },
          include: { translations: { where: { field: 'NAME', language: { code } } } },
        });
        return crop.translations[0]?.value ?? crop.commonName;
      };
      await r.lang('ta');
      return { kn: await pick('tomato', 'kn'), ta: await pick('tomato', 'ta') };
    });
    assert.equal(names.kn, 'ಟೊಮೆಟೊ');
    assert.equal(names.ta, 'Tomato', 'no Tamil translation yet → English fallback');
  });
});

// ------------------------------------------------------------------------------------------------
describe('Module 8 — crop recommendations', () => {
  it('stores an explainable recommendation run separately from crop knowledge', async () => {
    const rec = await inRollback(async (tx) => {
      const r = await ref(tx);
      const farmer = await makeFarmer(tx);
      const { plot } = await makeFarmWithPlot(tx, farmer.id);
      const source = await r.demoSource();
      const requirement = await tx.cropRequirement.create({
        data: { cropId: (await r.crop('groundnut')).id, parameterId: await r.param('WATER_NEED'), level: 'MEDIUM', sourceId: source },
      });
      const weather = await tx.weatherSnapshot.create({
        data: {
          provider: 'OPEN_METEO', snapshotType: 'FORECAST', latitude: '12.970000', longitude: '77.590000',
          periodStart: new Date('2026-06-01'), periodEnd: new Date('2026-06-07'), rainfallMm: '42.5', rawPayload: { note: 'test payload' },
        },
      });
      return tx.cropRecommendation.create({
        data: {
          userId: farmer.id, farmPlotId: plot.id, seasonId: await r.season('KHARIF'), soilTypeId: await r.soilType('RED'),
          status: 'COMPLETED', ruleSetVersion: 'test-rules-0.1', dataCompletenessPct: '66.67', missingInputs: ['SOIL_TEST', 'BUDGET'],
          inputSnapshot: { soilType: 'RED', waterSources: ['BOREWELL'], season: 'KHARIF' },
          weatherSnapshots: { create: [{ weatherSnapshotId: weather.id }] },
          items: {
            create: [
              {
                cropId: (await r.crop('groundnut')).id, rank: 1, suitabilityLevel: 'SUITABLE',
                reasons: {
                  create: [
                    { kind: 'REASON', criterionCode: 'WATER_NEED', result: 'SUITABLE', reasonCode: 'reason.water.matches', cropRequirementId: requirement.id, sourceId: source, sequence: 1 },
                    { kind: 'MISSING_DATA', criterionCode: 'SOIL_TEST', result: 'UNKNOWN', reasonCode: 'missing.soil_test', sequence: 2 },
                  ],
                },
              },
              { cropId: (await r.crop('rice')).id, rank: 2, suitabilityLevel: 'UNKNOWN' },
            ],
          },
        },
        include: { items: { orderBy: { rank: 'asc' }, include: { reasons: { orderBy: { sequence: 'asc' } }, crop: true } }, weatherSnapshots: true },
      });
    });
    assert.equal(rec.items.length, 2);
    assert.equal(rec.items[0]!.crop.slug, 'groundnut');
    assert.deepEqual(rec.items[0]!.reasons.map((x) => x.kind), ['REASON', 'MISSING_DATA']);
    assert.equal(rec.items[0]!.suitabilityScore, null, 'no score without a documented method');
    assert.equal(rec.weatherSnapshots.length, 1);
  });

  it('rejects a score without a scoring method, and yield/investment figures without a verified source row', async () => {
    const base = async (tx: Parameters<Parameters<typeof inRollback>[0]>[0]) => {
      const farmer = await makeFarmer(tx);
      return tx.cropRecommendation.create({ data: { userId: farmer.id, ruleSetVersion: 'test', inputSnapshot: {} } });
    };
    await expectDbError(async (tx) => {
      const rec = await base(tx);
      await tx.cropRecommendationItem.create({ data: { recommendationId: rec.id, cropId: (await (await ref(tx)).crop('rice')).id, rank: 1, suitabilityScore: '87.5' } });
    }, 'CropRecommendationItem_score_has_method_chk');
    await expectDbError(async (tx) => {
      const rec = await base(tx);
      await tx.cropRecommendationItem.create({
        data: { recommendationId: rec.id, cropId: (await (await ref(tx)).crop('rice')).id, rank: 1, estimatedInvestmentMin: '1000', estimatedInvestmentMax: '2000' },
      });
    }, 'CropRecommendationItem_figures_have_source_chk');
    // With a sourced CropEconomics row, the copied figures are accepted.
    await inRollback(async (tx) => {
      const r = await ref(tx);
      const rec = await base(tx);
      const rice = await r.crop('rice');
      const economics = await tx.cropEconomics.create({
        data: { cropId: rice.id, referenceYear: 2025, areaUnitId: await r.unit('ACRE'), costOfCultivationMin: '1', costOfCultivationMax: '2', sourceId: await r.demoSource() },
      });
      await tx.cropRecommendationItem.create({
        data: { recommendationId: rec.id, cropId: rice.id, rank: 1, cropEconomicsId: economics.id, estimatedInvestmentMin: '1', estimatedInvestmentMax: '2', areaValue: '1', areaUnitId: await r.unit('ACRE') },
      });
    });
  });
});

// ------------------------------------------------------------------------------------------------
describe('Module 9 — farmer crop lifecycle, expenses, harvest and sales', () => {
  it('starts a crop on a pinned procedure version, generates tasks, and never changes the standard instructions', async () => {
    const out = await inRollback(async (tx) => {
      const r = await ref(tx);
      const farmer = await makeFarmer(tx);
      const { plot } = await makeFarmWithPlot(tx, farmer.id);
      const { crop, procedure, version } = await makePublishedProcedure(tx, 'tomato', ['Nursery', 'Transplanting', 'Harvest']);
      const instructionBefore = version.stages[0]!.instructions[0]!;
      const variety = await r.variety('tomato');

      // Creating the cultivation and its tasks is one transaction (we are already inside one).
      const farmCrop = await tx.farmCrop.create({
        data: {
          farmPlotId: plot.id, cropId: crop.id, cropVarietyId: variety.id, growingProcedureId: procedure.id, procedureVersionId: version.id,
          seasonId: await r.season('RABI'), plantingDate: new Date('2026-10-01'), cultivatedArea: '1.5', areaUnitId: await r.unit('ACRE'), status: 'ACTIVE',
        },
      });
      await tx.cropTask.createMany({
        data: version.stages.map((s) => ({
          farmCropId: farmCrop.id, growingStageId: s.id, stageInstructionId: s.instructions[0]!.id,
          title: s.instructions[0]!.title, sequence: s.sequence,
        })),
      });
      const tasks = await tx.cropTask.findMany({ where: { farmCropId: farmCrop.id }, orderBy: { sequence: 'asc' } });
      await tx.cropTask.update({ where: { id: tasks[0]!.id }, data: { status: 'COMPLETED', completedAt: new Date(), title: 'My own wording' } });
      await tx.cropTask.update({ where: { id: tasks[1]!.id }, data: { status: 'POSTPONED', postponedFromDate: new Date('2026-10-20'), dueDate: new Date('2026-10-25') } });
      await tx.cropTask.update({ where: { id: tasks[2]!.id }, data: { status: 'SKIPPED', skippedReason: 'Test' } });
      await tx.cropTask.create({ data: { farmCropId: farmCrop.id, title: 'Farmer’s own task', isCustom: true } });
      await tx.taskReminder.create({ data: { taskId: tasks[1]!.id, remindAt: new Date('2026-10-24T03:30:00Z') } });

      const instructionAfter = await tx.stageInstruction.findUniqueOrThrow({ where: { id: instructionBefore.id } });
      const statuses = (await tx.cropTask.findMany({ where: { farmCropId: farmCrop.id }, orderBy: { sequence: 'asc' } })).map((t) => t.status);
      return { instructionBefore, instructionAfter, statuses };
    });
    assert.deepEqual(out.statuses.sort(), ['COMPLETED', 'PENDING', 'POSTPONED', 'SKIPPED']);
    assert.equal(out.instructionAfter.title, out.instructionBefore.title, 'standard instruction is unchanged');
    assert.equal(out.instructionAfter.updatedAt.getTime(), out.instructionBefore.updatedAt.getTime());
  });

  it('rejects a cultivation pinned to a version of a different procedure, or a version without its procedure', async () => {
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      const { plot } = await makeFarmWithPlot(tx, (await makeFarmer(tx)).id);
      const a = await makePublishedProcedure(tx, 'tomato');
      const b = await makePublishedProcedure(tx, 'tomato');
      await tx.farmCrop.create({
        data: { farmPlotId: plot.id, cropId: a.crop.id, growingProcedureId: a.procedure.id, procedureVersionId: b.version.id, cultivatedArea: '1', areaUnitId: await r.unit('ACRE') },
      });
    }, 'FarmCrop_procedureVersionId_growingProcedureId_fkey');
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      const { plot } = await makeFarmWithPlot(tx, (await makeFarmer(tx)).id);
      const a = await makePublishedProcedure(tx, 'tomato');
      await tx.farmCrop.create({ data: { farmPlotId: plot.id, cropId: a.crop.id, procedureVersionId: a.version.id, cultivatedArea: '1', areaUnitId: await r.unit('ACRE') } });
    }, 'FarmCrop_version_needs_procedure_chk');
  });

  it('records activities, irrigation, input use, expenses, several harvests and sales', async () => {
    const out = await inRollback(async (tx) => {
      const r = await ref(tx);
      const farmer = await makeFarmer(tx);
      const { farm, plot } = await makeFarmWithPlot(tx, farmer.id);
      const crop = await r.crop('chilli');
      const kg = await r.unit('KILOGRAM');
      const farmCrop = await tx.farmCrop.create({ data: { farmPlotId: plot.id, cropId: crop.id, cultivatedArea: '1', areaUnitId: await r.unit('ACRE'), status: 'ACTIVE' } });
      const well = await tx.waterSource.create({ data: { farmId: farm.id, waterSourceTypeId: await r.waterSourceType('OPEN_WELL') } });

      await tx.cropActivityLog.create({
        data: { farmCropId: farmCrop.id, activityType: 'IRRIGATION', activityDate: new Date('2026-11-01'), performedById: farmer.id,
          irrigationLog: { create: { waterSourceId: well.id, method: 'DRIP', durationMinutes: 90 } } },
      });
      const manure = await tx.farmInput.create({ data: { inputType: 'ORGANIC_MANURE', name: 'Test manure', createdById: farmer.id } });
      const purchase = await tx.inputPurchase.create({
        data: { userId: farmer.id, farmId: farm.id, farmInputId: manure.id, itemName: 'Test manure', quantity: '500', unitId: kg, totalAmount: '1500.00', purchaseDate: new Date('2026-10-28') },
      });
      const application = await tx.cropActivityLog.create({
        data: { farmCropId: farmCrop.id, activityType: 'FERTILIZER_APPLICATION', activityDate: new Date('2026-11-02'),
          inputApplication: { create: { farmInputId: manure.id, inputPurchaseId: purchase.id, quantity: '250', unitId: kg } } },
      });
      await tx.cropExpense.createMany({
        data: [
          { farmCropId: farmCrop.id, category: 'ORGANIC_MANURE', expenseDate: new Date('2026-10-28'), amount: '1500.00', inputPurchaseId: purchase.id },
          { farmCropId: farmCrop.id, category: 'LABOUR', expenseDate: new Date('2026-11-02'), amount: '800.00', activityLogId: application.id, paymentMode: 'UPI' },
        ],
      });

      const h1 = await tx.harvestRecord.create({ data: { farmCropId: farmCrop.id, harvestNumber: 1, harvestDate: new Date('2027-01-10'), quantity: '320', unitId: kg, qualityGrade: 'A' } });
      const h2 = await tx.harvestRecord.create({ data: { farmCropId: farmCrop.id, harvestNumber: 2, harvestDate: new Date('2027-01-25'), quantity: '280', unitId: kg } });
      await tx.salesRecord.create({ data: { harvestRecordId: h1.id, saleDate: new Date('2027-01-11'), quantitySold: '300', unitId: kg, pricePerUnit: '42.50', grossAmount: '12750.00', deductions: '450.00', netAmount: '12300.00', buyerType: 'MANDI_TRADER', marketName: 'Test market' } });
      await tx.salesRecord.create({ data: { harvestRecordId: h2.id, saleDate: new Date('2027-01-26'), quantitySold: '280', unitId: kg, pricePerUnit: '40.00', grossAmount: '11200.00', netAmount: '11200.00', paymentStatus: 'PAID' } });

      const expenses = await tx.cropExpense.aggregate({ where: { farmCropId: farmCrop.id, deletedAt: null }, _sum: { amount: true } });
      const revenue = await tx.salesRecord.aggregate({ where: { harvestRecord: { farmCropId: farmCrop.id }, deletedAt: null }, _sum: { netAmount: true } });
      const timeline = await tx.cropActivityLog.findMany({ where: { farmCropId: farmCrop.id }, include: { irrigationLog: true, inputApplication: true }, orderBy: { activityDate: 'asc' } });
      return { expenses: expenses._sum.amount?.toString(), revenue: revenue._sum.netAmount?.toString(), timeline };
    });
    assert.equal(out.expenses, '2300');
    assert.equal(out.revenue, '23500');
    assert.ok(out.timeline[0]!.irrigationLog && out.timeline[1]!.inputApplication);
  });

  it('rejects inconsistent sale totals and a repeated harvest number', async () => {
    const setup = async (tx: Parameters<Parameters<typeof inRollback>[0]>[0]) => {
      const r = await ref(tx);
      const { plot } = await makeFarmWithPlot(tx, (await makeFarmer(tx)).id);
      const fc = await tx.farmCrop.create({ data: { farmPlotId: plot.id, cropId: (await r.crop('onion')).id, cultivatedArea: '1', areaUnitId: await r.unit('ACRE') } });
      const kg = await r.unit('KILOGRAM');
      const h = await tx.harvestRecord.create({ data: { farmCropId: fc.id, harvestDate: new Date('2027-02-01'), quantity: '100', unitId: kg } });
      return { fc, h, kg };
    };
    await expectDbError(async (tx) => {
      const { h, kg } = await setup(tx);
      await tx.salesRecord.create({ data: { harvestRecordId: h.id, saleDate: new Date(), quantitySold: '10', unitId: kg, pricePerUnit: '20', grossAmount: '999', netAmount: '999' } });
    }, 'SalesRecord_gross_amount_chk');
    await expectDbError(async (tx) => {
      const { fc, kg } = await setup(tx);
      await tx.harvestRecord.create({ data: { farmCropId: fc.id, harvestNumber: 1, harvestDate: new Date('2027-02-02'), quantity: '5', unitId: kg } });
    }, 'P2002');
  });

  it('protects knowledge that farmer records depend on (cannot delete a variety in use)', async () => {
    await expectDbError(async (tx) => {
      const r = await ref(tx);
      const { plot } = await makeFarmWithPlot(tx, (await makeFarmer(tx)).id);
      const variety = await tx.cropVariety.create({ data: { cropId: (await r.crop('maize')).id, name: 'In use', slug: 'in-use-test' } });
      await tx.farmCrop.create({ data: { farmPlotId: plot.id, cropId: variety.cropId, cropVarietyId: variety.id, cultivatedArea: '1', areaUnitId: await r.unit('ACRE') } });
      await tx.cropVariety.delete({ where: { id: variety.id } });
    }, 'FarmCrop_cropVarietyId_cropId_fkey');
  });

  it("hides another farmer's records through the ownership filters", async () => {
    const out = await inRollback(async (tx) => {
      const r = await ref(tx);
      const owner = await makeFarmer(tx, 'Owner');
      const other = await makeFarmer(tx, 'Other');
      const { plot } = await makeFarmWithPlot(tx, owner.id);
      const fc = await tx.farmCrop.create({ data: { farmPlotId: plot.id, cropId: (await r.crop('rice')).id, cultivatedArea: '1', areaUnitId: await r.unit('ACRE') } });
      return {
        asOwner: await tx.farmCrop.findFirst({ where: { id: fc.id, ...ownedFarmCrop(owner.id) } }),
        asOther: await tx.farmCrop.findFirst({ where: { id: fc.id, ...ownedFarmCrop(other.id) } }),
      };
    });
    assert.ok(out.asOwner);
    assert.equal(out.asOther, null);
  });
});

// ------------------------------------------------------------------------------------------------
describe('Module 10 — diseases, pests and diagnosis', () => {
  it('never publishes an unverified chemical treatment or dose', async () => {
    const make = async (tx: Parameters<Parameters<typeof inRollback>[0]>[0]) => {
      const disease = await tx.cropDisease.create({ data: { name: 'Test disease', slug: `test-disease-${Date.now()}`, pathogenType: 'FUNGAL' } });
      return { disease, unitId: await (await ref(tx)).unit('MILLILITRE') };
    };
    await expectDbError(async (tx) => {
      const { disease, unitId } = await make(tx);
      await tx.diseaseTreatment.create({
        data: { diseaseId: disease.id, treatmentType: 'CHEMICAL', title: 'X', description: 'X', doseValue: '2', doseUnitId: unitId, doseBasis: 'PER_LITRE_WATER', status: 'PUBLISHED', verificationStatus: 'SOURCE_CITED', regulatoryReference: 'REF' },
      });
    }, 'DiseaseTreatment_published_dose_verified_chk');
    await expectDbError(async (tx) => {
      const { disease } = await make(tx);
      await tx.diseaseTreatment.create({
        data: { diseaseId: disease.id, treatmentType: 'CHEMICAL', title: 'X', description: 'X', status: 'PUBLISHED', verificationStatus: 'EXPERT_VERIFIED', approvedAt: new Date() },
      });
    }, 'DiseaseTreatment_published_chemical_registered_chk');
    // Expert-verified, approved, registered → allowed. A cultural practice can be published when source-cited.
    await inRollback(async (tx) => {
      const { disease, unitId } = await make(tx);
      await tx.diseaseTreatment.create({
        data: { diseaseId: disease.id, treatmentType: 'CHEMICAL', title: 'X', description: 'X', doseValue: '2', doseUnitId: unitId, status: 'PUBLISHED', verificationStatus: 'EXPERT_VERIFIED', approvedAt: new Date(), regulatoryReference: 'TEST-REF' },
      });
      await tx.diseaseTreatment.create({ data: { diseaseId: disease.id, treatmentType: 'CULTURAL', title: 'Y', description: 'Y', status: 'PUBLISHED', verificationStatus: 'SOURCE_CITED' } });
    });
  });

  it('keeps AI suggestions separate from the expert-confirmed diagnosis', async () => {
    const out = await inRollback(async (tx) => {
      const r = await ref(tx);
      const farmer = await makeFarmer(tx);
      const expert = await makeFarmer(tx, 'Expert');
      await tx.userRole.create({ data: { userId: expert.id, roleId: await r.role('AGRI_EXPERT') } });
      const disease = await tx.cropDisease.create({ data: { name: 'Test blight', slug: `test-blight-${Date.now()}` } });
      await tx.cropDiseaseMapping.create({ data: { cropId: (await r.crop('tomato')).id, diseaseId: disease.id } });
      await tx.diseaseSymptom.create({ data: { diseaseId: disease.id, plantPart: 'LEAF', description: 'Test symptom' } });
      const diagnosis = await tx.cropDiagnosis.create({
        data: {
          requestedById: farmer.id, cropId: (await r.crop('tomato')).id, status: 'AI_SUGGESTED',
          aiCandidates: { create: [{ modelName: 'test-model', modelVersion: '0.1', rank: 1, diseaseId: disease.id, confidence: '0.8125' }, { modelName: 'test-model', modelVersion: '0.1', rank: 2, labelText: 'unknown_label', confidence: '0.1100' }] },
        },
      });
      const confirmed = await tx.cropDiagnosis.update({
        where: { id: diagnosis.id },
        data: { status: 'EXPERT_CONFIRMED', confirmedDiseaseId: disease.id, confirmedById: expert.id, confirmedAt: new Date(), expertNotes: 'Test' },
        include: { aiCandidates: { orderBy: { rank: 'asc' } } },
      });
      return confirmed;
    });
    assert.equal(out.aiCandidates.length, 2);
    assert.ok(out.confirmedDiseaseId && out.confirmedById);
  });

  it('rejects an expert confirmation with no result, and a symptom attached to both a disease and a pest', async () => {
    await expectDbError(async (tx) => {
      const farmer = await makeFarmer(tx);
      await tx.cropDiagnosis.create({ data: { requestedById: farmer.id, status: 'EXPERT_CONFIRMED', confirmedAt: new Date() } });
    }, 'CropDiagnosis_confirmed_complete_chk');
    await expectDbError(async (tx) => {
      const d = await tx.cropDisease.create({ data: { name: 'D', slug: `d-${Date.now()}` } });
      const p = await tx.cropPest.create({ data: { commonName: 'P', slug: `p-${Date.now()}` } });
      await tx.diseaseSymptom.create({ data: { diseaseId: d.id, pestId: p.id, description: 'X' } });
    }, 'DiseaseSymptom_exactly_one_target_chk');
  });
});
