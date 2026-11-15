/**
 * Test helpers.
 *
 * Every test runs inside a transaction that is ROLLED BACK at the end, so tests never leave data
 * behind and can run against the seeded development database.
 * Negative tests assert that PostgreSQL itself rejects bad data, and check which constraint fired.
 */
import assert from 'node:assert/strict';
import { inspect } from 'node:util';
import type { Prisma } from '../generated/prisma/client.ts';
import { prisma } from '../src/db/prisma.ts';

export type Tx = Prisma.TransactionClient;

class Rollback extends Error {}

const TX_OPTIONS = { timeout: 60_000, maxWait: 10_000 };

/** Run `fn` in a transaction and always roll it back. Returns fn's result. */
export async function inRollback<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  let result: T | undefined;
  try {
    await prisma.$transaction(async (tx) => {
      result = await fn(tx);
      throw new Rollback();
    }, TX_OPTIONS);
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
  return result as T;
}

/** Assert that `fn` fails with a database error whose details mention `needle` (e.g. a constraint name). */
export async function expectDbError(fn: (tx: Tx) => Promise<unknown>, needle: string | RegExp): Promise<void> {
  await assert.rejects(
    prisma.$transaction(async (tx) => {
      await fn(tx);
    }, TX_OPTIONS),
    (error: unknown) => {
      const text = inspect(error, { depth: 8 });
      if (typeof needle === 'string') assert.ok(text.includes(needle), `expected error mentioning "${needle}", got:\n${text.slice(0, 1500)}`);
      else assert.match(text, needle);
      return true;
    },
  );
}

/** Ids of seeded reference rows, looked up by their stable codes/slugs. */
export async function ref(tx: Tx) {
  const unit = async (code: string) => (await tx.measurementUnit.findUniqueOrThrow({ where: { code } })).id;
  const param = async (code: string) => (await tx.agronomicParameter.findUniqueOrThrow({ where: { code } })).id;
  const lang = async (code: string) => (await tx.language.findUniqueOrThrow({ where: { code } })).id;
  const crop = (slug: string) => tx.crop.findUniqueOrThrow({ where: { slug } });
  const variety = async (cropSlug: string, slug = 'demo-variety-a') => {
    const c = await crop(cropSlug);
    return tx.cropVariety.findUniqueOrThrow({ where: { cropId_slug: { cropId: c.id, slug } } });
  };
  const category = (slug: string) => tx.cropCategory.findUniqueOrThrow({ where: { slug } });
  return {
    unit,
    param,
    lang,
    crop,
    variety,
    category,
    soilType: async (code: string) => (await tx.soilType.findUniqueOrThrow({ where: { code } })).id,
    season: async (code: string) => (await tx.season.findUniqueOrThrow({ where: { code } })).id,
    waterSourceType: async (code: string) => (await tx.waterSourceType.findUniqueOrThrow({ where: { code } })).id,
    stageType: async (code: string) => (await tx.stageType.findUniqueOrThrow({ where: { code } })).id,
    role: async (code: string) => (await tx.role.findUniqueOrThrow({ where: { code } })).id,
    demoSource: async () => (await tx.contentSource.findFirstOrThrow({ where: { sourceType: 'INTERNAL_DEMO' } })).id,
  };
}

let phoneCounter = 0;
/** A unique, valid E.164 test number. */
export function testPhone(): string {
  phoneCounter += 1;
  return `+9190000${String(Date.now() % 100000).padStart(5, '0')}${String(phoneCounter).padStart(2, '0')}`.slice(0, 16);
}

export async function makeFarmer(tx: Tx, name = 'Test Farmer') {
  const r = await ref(tx);
  return tx.user.create({
    data: {
      fullName: name,
      phone: testPhone(),
      status: 'ACTIVE',
      preferredLanguageId: await r.lang('kn'),
      roles: { create: [{ roleId: await r.role('FARMER') }] },
    },
  });
}

/** Farmer → farm → one plot (2 acres, red soil). */
export async function makeFarmWithPlot(tx: Tx, ownerId: string) {
  const r = await ref(tx);
  const acre = await r.unit('ACRE');
  const farm = await tx.farm.create({
    data: { ownerId, name: 'Test farm', state: 'Karnataka', district: 'Test district', village: 'Test village', totalArea: '3', totalAreaUnitId: acre },
  });
  const plot = await tx.farmPlot.create({
    data: { farmId: farm.id, name: 'East plot', area: '2', areaUnitId: acre, soilTypeId: await r.soilType('RED'), irrigationMethod: 'DRIP' },
  });
  return { farm, plot };
}

/** A published procedure version with stages + instructions for a crop (test content only). */
export async function makePublishedProcedure(tx: Tx, cropSlug: string, stageTitles = ['Stage one', 'Stage two', 'Stage three']) {
  const r = await ref(tx);
  const crop = await r.crop(cropSlug);
  const source = await r.demoSource();
  const procedure = await tx.growingProcedure.create({
    data: { cropId: crop.id, name: `Test procedure ${Date.now()}`, slug: `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
  });
  const now = new Date();
  const version = await tx.procedureVersion.create({
    data: {
      procedureId: procedure.id,
      versionNumber: 1,
      status: 'PUBLISHED',
      sourceId: source,
      approvedAt: now,
      publishedAt: now,
      stages: {
        create: stageTitles.map((title, i) => ({
          sequence: i + 1,
          title,
          instructions: { create: [{ sequence: 1, title: `${title} instruction`, description: 'Test instruction.' }] },
        })),
      },
    },
    include: { stages: { include: { instructions: true }, orderBy: { sequence: 'asc' } } },
  });
  return { crop, procedure, version };
}
