/**
 * Business modules over HTTP: device accounts, catalog, weather, farm tracking, recommendations.
 *
 * A temporary PUBLISHED test crop (with sourced test knowledge and a 3-stage guide) is created before
 * the tests and removed afterwards, together with every user, farm and weather row the tests create.
 * The test knowledge values are made-up test data, never shown to farmers.
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../src/app.ts';
import { loadConfig } from '../../src/config/env.ts';
import { createLogger } from '../../src/config/logger.ts';
import { prisma } from '../../src/db/prisma.ts';

const RUN = Date.now().toString(36);
const SLUG = `test-crop-${RUN}`;
const SLUG_EMPTY = `test-crop-empty-${RUN}`;
const logger = createLogger({ logLevel: 'silent', nodeEnv: 'test', appVersion: 'test' });

let fetchCalls = 0;
let fetchMode: 'ok' | 'fail' = 'ok';
const fakeFetch = (async () => {
  fetchCalls += 1;
  if (fetchMode === 'fail') throw new Error('network down');
  return new Response(JSON.stringify({
    current: { time: '2026-11-15T10:00', temperature_2m: 27.4, relative_humidity_2m: 61, precipitation: 0, weather_code: 2, wind_speed_10m: 9.5 },
    daily: {
      time: ['2026-11-15', '2026-11-16'], weather_code: [2, 63], temperature_2m_max: [30.1, 28.0], temperature_2m_min: [19.2, 18.7],
      precipitation_sum: [0, 12.4], precipitation_probability_max: [10, 80],
    },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}) as typeof fetch;

function buildApp(env: Record<string, string> = {}): Express {
  const config = loadConfig({ NODE_ENV: 'test', DATABASE_URL: process.env.DATABASE_URL, DEVICE_REGISTRATIONS_PER_HOUR: '1000', RATE_LIMIT_PER_MINUTE: '10000', ...env });
  return createApp({ config, logger, prisma, fetchImpl: fakeFetch });
}
const app = buildApp();

let procedureId = '';
const createdUserIds: string[] = [];

async function register(language?: string): Promise<{ token: string; userId: string }> {
  const res = await request(app).post('/api/v1/auth/device').send({ platform: 'android', ...(language ? { language } : {}) }).expect(201);
  createdUserIds.push(res.body.data.user.id);
  return { token: res.body.data.token, userId: res.body.data.user.id };
}
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

before(async () => {
  const id = async <T extends { id: string }>(p: Promise<T>) => (await p).id;
  const unit = (code: string) => id(prisma.measurementUnit.findUniqueOrThrow({ where: { code } }));
  const param = (code: string) => id(prisma.agronomicParameter.findUniqueOrThrow({ where: { code } }));
  const source = await prisma.contentSource.create({ data: { sourceType: 'OTHER', title: `Test source ${RUN}`, licenseType: 'OWN_CONTENT' } });
  const kn = await id(prisma.language.findUniqueOrThrow({ where: { code: 'kn' } }));
  const cereals = await id(prisma.cropCategory.findUniqueOrThrow({ where: { slug: 'cereals' } }));
  const harvesting = await id(prisma.stageType.findUniqueOrThrow({ where: { code: 'HARVESTING' } }));

  const crop = await prisma.crop.create({
    data: {
      slug: SLUG, commonName: `Testcrop ${RUN}`, status: 'PUBLISHED',
      categoryMappings: { create: [{ categoryId: cereals, isPrimary: true }] },
      translations: { create: [{ field: 'NAME', languageId: kn, value: `ಪರೀಕ್ಷೆ ${RUN}` }] },
      varieties: { create: [{ slug: 'v1', name: 'Test variety', status: 'PUBLISHED', verificationStatus: 'SOURCE_CITED', sourceId: source.id }] },
    },
  });
  await prisma.crop.create({ data: { slug: SLUG_EMPTY, commonName: `Testcrop empty ${RUN}`, status: 'PUBLISHED' } });
  await prisma.cropSeasonMapping.create({ data: { cropId: crop.id, seasonId: await id(prisma.season.findUniqueOrThrow({ where: { code: 'KHARIF' } })), sourceId: source.id, verificationStatus: 'SOURCE_CITED' } });
  await prisma.cropSoilSuitability.createMany({
    data: [
      { cropId: crop.id, soilTypeId: await id(prisma.soilType.findUniqueOrThrow({ where: { code: 'RED' } })), suitability: 'SUITABLE', sourceId: source.id, verificationStatus: 'SOURCE_CITED' },
      { cropId: crop.id, soilTypeId: await id(prisma.soilType.findUniqueOrThrow({ where: { code: 'BLACK' } })), suitability: 'NOT_SUITABLE', sourceId: source.id, verificationStatus: 'SOURCE_CITED' },
    ],
  });
  await prisma.cropRequirement.createMany({
    data: [
      { cropId: crop.id, parameterId: await param('SOIL_PH'), minValue: '5.5', maxValue: '7.5', unitId: await unit('PH'), importance: 'MANDATORY', sourceId: source.id, status: 'PUBLISHED', verificationStatus: 'SOURCE_CITED' },
      { cropId: crop.id, parameterId: await param('WATER_NEED'), level: 'MEDIUM', sourceId: source.id, status: 'PUBLISHED', verificationStatus: 'SOURCE_CITED' },
    ],
  });
  await prisma.cropEconomics.create({ data: { cropId: crop.id, referenceYear: 2024, areaUnitId: await unit('ACRE'), costOfCultivationMin: '10000', costOfCultivationMax: '20000', sourceId: source.id, status: 'PUBLISHED', verificationStatus: 'SOURCE_CITED' } });

  const procedure = await prisma.growingProcedure.create({ data: { cropId: crop.id, slug: 'test-guide', name: 'Test guide', status: 'PUBLISHED', isDefault: true } });
  procedureId = procedure.id;
  const now = new Date();
  await prisma.procedureVersion.create({
    data: {
      procedureId: procedure.id, versionNumber: 1, status: 'PUBLISHED', approvedAt: now, publishedAt: now, verificationStatus: 'SOURCE_CITED', sourceId: source.id,
      stages: {
        create: [
          { sequence: 1, title: 'Prepare', startDay: 0, endDay: 10, instructions: { create: [{ sequence: 1, title: 'Step', description: 'Test instruction.', sourceId: source.id }] } },
          { sequence: 2, title: 'Grow', startDay: 11, endDay: 60, dayAnchor: 'TRANSPLANTING' },
          { sequence: 3, title: 'Harvest', startDay: 90, endDay: 100, stageTypeId: harvesting },
        ],
      },
    },
  });
});

after(async () => {
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await prisma.weatherSnapshot.deleteMany({ where: { latitude: { in: ['15.100000', '15.200000'] } } });
  const crops = await prisma.crop.findMany({ where: { slug: { in: [SLUG, SLUG_EMPTY] } }, select: { id: true } });
  const cropIds = crops.map((c) => c.id);
  await prisma.growingProcedure.deleteMany({ where: { cropId: { in: cropIds } } });
  await prisma.cropRequirement.deleteMany({ where: { cropId: { in: cropIds } } });
  await prisma.cropEconomics.deleteMany({ where: { cropId: { in: cropIds } } });
  await prisma.cropVariety.deleteMany({ where: { cropId: { in: cropIds } } });
  await prisma.crop.deleteMany({ where: { id: { in: cropIds } } });
  await prisma.contentSource.deleteMany({ where: { title: `Test source ${RUN}` } });
  await prisma.$disconnect();
});

// ------------------------------------------------------------------------------------------------
describe('device accounts', () => {
  it('registers a device account once and returns a token that only exists hashed in the database', async () => {
    const { token, userId } = await register('kn');
    assert.match(token, /^ks_dev_[A-Za-z0-9_-]{43}$/);
    const stored = await prisma.deviceCredential.findFirstOrThrow({ where: { userId } });
    assert.notEqual(stored.tokenHash, token);
    assert.match(stored.tokenHash, /^[0-9a-f]{64}$/);
    const me = await request(app).get('/api/v1/me').set(auth(token)).expect(200);
    assert.equal(me.body.data.isDeviceAccount, true);
    assert.equal(me.body.data.language, 'kn');
  });

  it('rejects missing, malformed and unknown tokens with 401', async () => {
    for (const header of [undefined, 'Bearer nope', `Bearer ks_dev_${'A'.repeat(43)}`]) {
      const req = request(app).get('/api/v1/me');
      const res = await (header ? req.set('Authorization', header) : req).expect(401);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    }
  });

  it('updates the profile and validates input', async () => {
    const { token } = await register();
    const res = await request(app).patch('/api/v1/me').set(auth(token)).send({ fullName: 'Ravi', language: 'hi' }).expect(200);
    assert.equal(res.body.data.fullName, 'Ravi');
    assert.equal(res.body.data.language, 'hi');
    await request(app).patch('/api/v1/me').set(auth(token)).send({ language: 'xx' }).expect(400);
  });

  it('rate-limits device registration', async () => {
    const limited = buildApp({ DEVICE_REGISTRATIONS_PER_HOUR: '2' });
    for (let i = 0; i < 2; i += 1) {
      const res = await request(limited).post('/api/v1/auth/device').send({}).expect(201);
      createdUserIds.push(res.body.data.user.id);
    }
    const blocked = await request(limited).post('/api/v1/auth/device').send({}).expect(429);
    assert.equal(blocked.body.error.code, 'RATE_LIMITED');
  });
});

// ------------------------------------------------------------------------------------------------
describe('catalog (published knowledge only)', () => {
  it('serves reference data and the category tree with crop counts', async () => {
    const ref = await request(app).get('/api/v1/reference?lang=kn').expect(200);
    assert.ok(ref.body.data.soilTypes.some((s: { code: string }) => s.code === 'RED'));
    assert.ok(ref.body.data.languages.length >= 3);
    const tree = await request(app).get('/api/v1/categories?lang=kn').expect(200);
    const food = tree.body.data.find((c: { slug: string }) => c.slug === 'food-crops');
    assert.equal(food.name, 'ಆಹಾರ ಬೆಳೆಗಳು');
    assert.ok(food.totalCropCount >= 1, 'subcategory crops count towards the parent');
  });

  it('lists only published crops, filters by category (incl. subcategories) and searches local names', async () => {
    const all = await request(app).get('/api/v1/crops').expect(200);
    const slugs = all.body.data.map((c: { slug: string }) => c.slug);
    assert.ok(slugs.includes(SLUG));
    assert.ok(!slugs.includes('cotton'), 'DRAFT demo crops are not served');
    const food = await request(app).get('/api/v1/crops?category=food-crops').expect(200);
    assert.ok(food.body.data.some((c: { slug: string }) => c.slug === SLUG));
    const search = await request(app).get(`/api/v1/crops?q=${encodeURIComponent(`ಪರೀಕ್ಷೆ ${RUN}`)}&lang=kn`).expect(200);
    assert.equal(search.body.data[0]?.slug, SLUG);
    assert.equal(search.body.data[0]?.name, `ಪರೀಕ್ಷೆ ${RUN}`);
    await request(app).get('/api/v1/crops?category=no-such-category').expect(404);
  });

  it('returns crop details with trust labels and sources, and the full guide', async () => {
    const res = await request(app).get(`/api/v1/crops/${SLUG}`).expect(200);
    const crop = res.body.data;
    assert.equal(crop.guides.length, 1);
    assert.equal(crop.guides[0].trust, 'SOURCE_CITED');
    assert.equal(crop.requirements.find((r: { parameter: string }) => r.parameter === 'SOIL_PH').min, 5.5);
    assert.ok(crop.requirements.every((r: { source: unknown }) => r.source));
    const guide = await request(app).get(`/api/v1/procedures/${crop.guides[0].id}`).expect(200);
    assert.deepEqual(guide.body.data.stages.map((s: { title: string }) => s.title), ['Prepare', 'Grow', 'Harvest']);
    assert.equal(guide.body.data.stages[0].instructions[0].source.title, `Test source ${RUN}`);
    await request(app).get('/api/v1/crops/cotton').expect(404);
    await request(app).get('/api/v1/procedures/not-a-uuid').expect(400);
  });
});

// ------------------------------------------------------------------------------------------------
describe('weather', () => {
  it('fetches live data once per grid cell, then serves the cache', async () => {
    fetchMode = 'ok';
    const before = fetchCalls;
    const first = await request(app).get('/api/v1/weather?lat=15.12&lon=75.13').expect(200);
    assert.equal(first.body.data.current.temperatureC, 27.4);
    assert.equal(first.body.data.daily[1].condition, 'RAIN');
    assert.equal(first.body.data.location.latitude, 15.1);
    assert.equal(first.body.data.stale, false);
    await request(app).get('/api/v1/weather?lat=15.14&lon=75.11').expect(200); // same 0.1° cell
    assert.equal(fetchCalls - before, 1, 'second request served from cache');
  });

  it('falls back to the last snapshot (stale) or 503 when the provider is down', async () => {
    fetchMode = 'fail';
    await prisma.weatherSnapshot.updateMany({ where: { latitude: '15.100000' }, data: { fetchedAt: new Date(Date.now() - 2 * 3600_000) } });
    const stale = await request(app).get('/api/v1/weather?lat=15.1&lon=75.1').expect(200);
    assert.equal(stale.body.data.stale, true);
    const none = await request(app).get('/api/v1/weather?lat=15.2&lon=75.2').expect(503);
    assert.equal(none.body.error.code, 'WEATHER_UNAVAILABLE');
    await request(app).get('/api/v1/weather?lat=999&lon=1').expect(400);
    fetchMode = 'ok';
  });
});

// ------------------------------------------------------------------------------------------------
describe('farm and crop tracking', () => {
  it('runs the full flow: farm → plot → water → soil test → start crop → tasks → expenses → harvest → sale', async () => {
    const { token } = await register();
    const farm = await request(app).post('/api/v1/farms').set(auth(token)).send({ name: 'Test farm', village: 'Test village', state: 'Karnataka', latitude: 15.1, longitude: 75.1 }).expect(201);
    const plot = await request(app).post(`/api/v1/farms/${farm.body.data.id}/plots`).set(auth(token)).send({ name: 'East', area: 20, areaUnit: 'GUNTA', soilType: 'RED', irrigationMethod: 'DRIP' }).expect(201);
    assert.equal(plot.body.data.areaUnit, 'GUNTA');
    await request(app).post(`/api/v1/farms/${farm.body.data.id}/water-sources`).set(auth(token)).send({ type: 'BOREWELL', availability: 'PERENNIAL', plotIds: [plot.body.data.id] }).expect(201);
    const soil = await request(app).post(`/api/v1/plots/${plot.body.data.id}/soil-tests`).set(auth(token)).send({ testDate: '2026-10-01', source: 'SOIL_HEALTH_CARD', results: [{ parameter: 'SOIL_PH', value: 6.4 }, { parameter: 'SOIL_AVAILABLE_N', value: 220 }] }).expect(201);
    assert.equal(soil.body.data.results.length, 2);

    const started = await request(app).post('/api/v1/farm-crops').set(auth(token)).send({ plotId: plot.body.data.id, cropSlug: SLUG, varietySlug: 'v1', plantingDate: '2026-11-01', cultivatedArea: 20, areaUnit: 'GUNTA', season: 'KHARIF' }).expect(201);
    const fc = started.body.data;
    assert.equal(fc.guide.procedureId, procedureId);
    assert.deepEqual(fc.tasks.map((t: { dueDate: string | null }) => t.dueDate), ['2026-11-11', null, '2027-02-09'], 'dates only where the anchor is the planting date');
    assert.equal(fc.expectedHarvestDate, '2027-02-09');

    const task = fc.tasks[0];
    const done = await request(app).patch(`/api/v1/tasks/${task.id}`).set(auth(token)).send({ status: 'COMPLETED' }).expect(200);
    assert.ok(done.body.data.completedAt);
    await request(app).patch(`/api/v1/tasks/${fc.tasks[2].id}`).set(auth(token)).send({ status: 'POSTPONED' }).expect(400);
    await request(app).post(`/api/v1/farm-crops/${fc.id}/tasks`).set(auth(token)).send({ title: 'Buy sacks' }).expect(201);
    await request(app).post(`/api/v1/farm-crops/${fc.id}/activities`).set(auth(token)).send({ activityType: 'IRRIGATION', activityDate: '2026-11-05', taskId: task.id }).expect(201);
    await request(app).post(`/api/v1/farm-crops/${fc.id}/expenses`).set(auth(token)).send({ category: 'SEEDS', expenseDate: '2026-10-30', amount: 1250.5, paymentMode: 'UPI' }).expect(201);
    await request(app).post(`/api/v1/farm-crops/${fc.id}/expenses`).set(auth(token)).send({ category: 'LABOUR', expenseDate: '2026-11-02', amount: 800 }).expect(201);
    const harvest = await request(app).post(`/api/v1/farm-crops/${fc.id}/harvests`).set(auth(token)).send({ harvestDate: '2027-02-08', quantity: 12.5, unit: 'QUINTAL' }).expect(201);
    const sale = await request(app).post(`/api/v1/harvests/${harvest.body.data.id}/sales`).set(auth(token)).send({ saleDate: '2027-02-10', quantitySold: 12.5, unit: 'QUINTAL', pricePerUnit: 2183.33, deductions: 150 }).expect(201);
    assert.equal(sale.body.data.grossAmount, 27291.63);
    assert.equal(sale.body.data.netAmount, 27141.63);

    const detail = await request(app).get(`/api/v1/farm-crops/${fc.id}`).set(auth(token)).expect(200);
    assert.deepEqual(detail.body.data.totals, { currency: 'INR', expenses: 2050.5, revenue: 27141.63, balance: 25091.13 });
    assert.equal(detail.body.data.tasks.length, 4);

    // Changing the planting date re-schedules unfinished generated tasks.
    const moved = await request(app).patch(`/api/v1/farm-crops/${fc.id}`).set(auth(token)).send({ plantingDate: '2026-11-11' }).expect(200);
    assert.equal(moved.body.data.tasks[0].dueDate, '2026-11-11', 'completed task keeps its date');
    assert.equal(moved.body.data.tasks[2].dueDate, '2027-02-19');
    assert.equal(moved.body.data.expectedHarvestDate, '2027-02-19');

    const list = await request(app).get('/api/v1/farm-crops').set(auth(token)).expect(200);
    assert.equal(list.body.data[0].tasks.done, 1);
  });

  it("never exposes or changes another farmer's records", async () => {
    const owner = await register();
    const other = await register();
    const farm = await request(app).post('/api/v1/farms').set(auth(owner.token)).send({ name: 'Private' }).expect(201);
    await request(app).get(`/api/v1/farms/${farm.body.data.id}`).set(auth(other.token)).expect(404);
    await request(app).patch(`/api/v1/farms/${farm.body.data.id}`).set(auth(other.token)).send({ name: 'Hacked' }).expect(404);
    await request(app).post(`/api/v1/farms/${farm.body.data.id}/plots`).set(auth(other.token)).send({ name: 'X', area: 1, areaUnit: 'ACRE' }).expect(404);
    const mine = await request(app).get('/api/v1/farms').set(auth(other.token)).expect(200);
    assert.equal(mine.body.data.length, 0);
    await request(app).get('/api/v1/farms').expect(401);
  });

  it('validates input: units, crops, dates and soft delete', async () => {
    const { token } = await register();
    const farm = await request(app).post('/api/v1/farms').set(auth(token)).send({ name: 'F' }).expect(201);
    const badUnit = await request(app).post(`/api/v1/farms/${farm.body.data.id}/plots`).set(auth(token)).send({ name: 'P', area: 1, areaUnit: 'KILOGRAM' }).expect(400);
    assert.equal(badUnit.body.error.details[0].path, 'body.areaUnit');
    const plot = await request(app).post(`/api/v1/farms/${farm.body.data.id}/plots`).set(auth(token)).send({ name: 'P', area: 1, areaUnit: 'ACRE' }).expect(201);
    await request(app).post('/api/v1/farm-crops').set(auth(token)).send({ plotId: plot.body.data.id, cropSlug: 'cotton', cultivatedArea: 1, areaUnit: 'ACRE' }).expect(400);
    await request(app).post('/api/v1/farm-crops').set(auth(token)).send({ plotId: plot.body.data.id, cropSlug: SLUG, cultivatedArea: 1, areaUnit: 'ACRE', plantingDate: '15-11-2026' }).expect(400);
    await request(app).delete(`/api/v1/farms/${farm.body.data.id}`).set(auth(token)).expect(204);
    await request(app).get(`/api/v1/farms/${farm.body.data.id}`).set(auth(token)).expect(404);
  });
});

// ------------------------------------------------------------------------------------------------
describe('recommendations', () => {
  it('explains suitability from published knowledge and stores the run', async () => {
    const { token } = await register();
    const farm = await request(app).post('/api/v1/farms').set(auth(token)).send({ name: 'R', state: 'Karnataka' }).expect(201);
    const plot = await request(app).post(`/api/v1/farms/${farm.body.data.id}/plots`).set(auth(token)).send({ name: 'P', area: 2, areaUnit: 'ACRE', soilType: 'RED' }).expect(201);
    await request(app).post(`/api/v1/farms/${farm.body.data.id}/water-sources`).set(auth(token)).send({ type: 'OPEN_WELL', availability: 'SEASONAL', plotIds: [plot.body.data.id] }).expect(201);
    await request(app).post(`/api/v1/plots/${plot.body.data.id}/soil-tests`).set(auth(token)).send({ testDate: '2026-10-01', results: [{ parameter: 'SOIL_PH', value: 6.8 }] }).expect(201);

    const res = await request(app).post('/api/v1/recommendations').set(auth(token)).send({ plotId: plot.body.data.id, season: 'KHARIF', budget: 30000 }).expect(201);
    const rec = res.body.data;
    assert.equal(rec.ruleSetVersion, 'ks-rules-1.0');
    assert.deepEqual(rec.missingInputs, ['LOCATION']);
    const item = rec.items.find((i: { crop: { slug: string } }) => i.crop.slug === SLUG);
    assert.equal(item.suitability, 'MODERATELY_SUITABLE', 'budget below the sourced reference range → caution');
    assert.deepEqual(item.investment, { min: 20000, max: 40000, currency: 'INR', areaAcres: 2, label: 'ESTIMATE_FROM_SOURCE' });
    const byCriterion = Object.fromEntries(item.reasons.map((r: { criterion: string; result: string }) => [r.criterion, r.result]));
    assert.deepEqual(byCriterion, { SEASON: 'SUITABLE', SOIL_TYPE: 'SUITABLE', SOIL_PH: 'SUITABLE', WATER_NEED: 'SUITABLE', BUDGET: 'CAUTION' });
    assert.ok(item.reasons.every((r: { source: unknown }) => r.source));
    const empty = rec.items.find((i: { crop: { slug: string } }) => i.crop.slug === SLUG_EMPTY);
    assert.equal(empty.suitability, 'UNKNOWN', 'no knowledge → unknown, never guessed');

    const stored = await request(app).get(`/api/v1/recommendations/${rec.id}`).set(auth(token)).expect(200);
    assert.deepEqual(stored.body.data.items.map((i: { crop: { slug: string } }) => i.crop.slug), rec.items.map((i: { crop: { slug: string } }) => i.crop.slug));
    const list = await request(app).get('/api/v1/recommendations').set(auth(token)).expect(200);
    assert.equal(list.body.data[0].id, rec.id);
  });

  it('works without a plot (answers only) and excludes unsuitable soil', async () => {
    const { token } = await register();
    const res = await request(app).post('/api/v1/recommendations').set(auth(token)).send({ soilType: 'BLACK', season: 'KHARIF', waterSources: [{ type: 'RAINWATER' }] }).expect(201);
    const item = res.body.data.items.find((i: { crop: { slug: string } }) => i.crop.slug === SLUG);
    assert.equal(item.suitability, 'NOT_SUITABLE');
    assert.ok(res.body.data.missingInputs.includes('SOIL_TEST'));
    const other = await register();
    await request(app).get(`/api/v1/recommendations/${res.body.data.id}`).set(auth(other.token)).expect(404);
  });
});
