/**
 * Launch-crop content (prisma/seed/content): rules checked on the content files themselves, and
 * the seeded result served through the API. Requires the database to be seeded (`npm run db:seed`).
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import request from 'supertest';
import { LAUNCH_CROP_CONTENT } from '../../prisma/seed/content/index.ts';
import { CHEMICAL_CAUTION } from '../../prisma/seed/content/types.ts';
import { createApp } from '../../src/app.ts';
import { loadConfig } from '../../src/config/env.ts';
import { createLogger } from '../../src/config/logger.ts';
import { prisma } from '../../src/db/prisma.ts';

const LAUNCH = ['rice', 'maize', 'tomato', 'chilli', 'groundnut', 'onion'];

/** Chemical pesticide / herbicide / fungicide / fumigant names that must never appear with doses. */
const BANNED = [
  'chlorpyriphos', 'carbofuran', 'furadon', 'phorate', 'quinalphos', 'phosphamidon', 'mancozeb', 'thiram', 'captan', 'carbendazim',
  'copper oxychloride', 'methyl demeton', 'dimethoate', 'butachlor', 'pretilachlor', 'atrazine', 'pendimethalin', 'fluchloralin',
  '2,4-d', 'paraquat', 'aluminium phosphide', 'formaldehyde', 'maleic hydrazide', 'tembotrione', 'topramezone', 'cyhalofop',
];

describe('launch-crop content files', () => {
  it('covers exactly the six launch crops (decision D6)', () => {
    assert.deepEqual(LAUNCH_CROP_CONTENT.map((c) => c.cropSlug).sort(), [...LAUNCH].sort());
  });

  it('cites a known source for every row, and only credible public URLs', () => {
    for (const c of LAUNCH_CROP_CONTENT) {
      const keys = new Set(Object.keys(c.sources));
      for (const s of Object.values(c.sources)) assert.match(s.url, /^https?:\/\/(www\.)?agritech\.tnau\.ac\.in\//, `${c.cropSlug}: ${s.url}`);
      const used = [
        c.guide.source,
        ...(c.requirements ?? []).map((r) => r.source),
        ...(c.soils ?? []).map((r) => r.source),
        ...(c.seasons ?? []).map((r) => r.source),
        ...c.guide.stages.flatMap((s) => [...s.instructions.map((i) => i.source), ...(s.mistakes ?? []).map((m) => m.source)]),
      ];
      for (const key of used) assert.ok(keys.has(key), `${c.cropSlug}: unknown source key ${key}`);
    }
  });

  it('never contains chemical pesticide, herbicide or fumigant names; such steps carry the caution instead', () => {
    for (const c of LAUNCH_CROP_CONTENT) {
      const text = JSON.stringify(c).toLowerCase();
      for (const word of BANNED) assert.ok(!text.includes(word), `${c.cropSlug} mentions "${word}"`);
      for (const stage of c.guide.stages) {
        for (const ins of stage.instructions) {
          if (ins.safety) assert.equal(ins.safety.info, CHEMICAL_CAUTION, `${c.cropSlug}/${stage.title}/${ins.title}`);
        }
      }
    }
  });

  it('keeps day ranges ordered and stage content non-empty', () => {
    for (const c of LAUNCH_CROP_CONTENT) {
      assert.ok(c.guide.stages.length >= 5, c.cropSlug);
      for (const s of c.guide.stages) {
        assert.ok(s.instructions.length >= 1, `${c.cropSlug}/${s.title}`);
        if (s.startDay !== undefined && s.endDay !== undefined) assert.ok(s.startDay <= s.endDay, `${c.cropSlug}/${s.title}`);
      }
      assert.ok(c.guide.description.includes('pending expert review'), `${c.cropSlug}: region/trust note missing`);
    }
  });
});

describe('seeded launch-crop content via the API', () => {
  const logger = createLogger({ logLevel: 'silent', nodeEnv: 'test', appVersion: 'test' });
  const config = loadConfig({ NODE_ENV: 'test', DATABASE_URL: process.env.DATABASE_URL, RATE_LIMIT_PER_MINUTE: '10000' });
  const app = createApp({ config, logger, prisma });
  after(() => prisma.$disconnect());

  it('publishes each launch crop with a source-cited default guide whose steps all cite sources', async () => {
    for (const slug of LAUNCH) {
      const crop = (await request(app).get(`/api/v1/crops/${slug}`).expect(200)).body.data;
      const content = LAUNCH_CROP_CONTENT.find((c) => c.cropSlug === slug)!;
      const guide = crop.guides.find((g: { name: string }) => g.name === content.guide.name);
      assert.ok(guide, `${slug}: guide served`);
      assert.equal(guide.trust, 'SOURCE_CITED');
      const full = (await request(app).get(`/api/v1/procedures/${guide.id}`).expect(200)).body.data;
      assert.equal(full.stages.length, content.guide.stages.length, slug);
      for (const stage of full.stages) for (const ins of stage.instructions) assert.ok(ins.source?.url?.includes('tnau.ac.in'), `${slug}/${stage.title}`);
    }
  });

  it('serves draft Kannada stage titles', async () => {
    const crop = (await request(app).get('/api/v1/crops/rice?lang=kn').expect(200)).body.data;
    const guide = crop.guides.find((g: { name: string }) => g.name === 'ನಾಟಿ ಭತ್ತ');
    assert.ok(guide, 'guide name translated');
    const full = (await request(app).get(`/api/v1/procedures/${guide.id}?lang=kn`).expect(200)).body.data;
    assert.equal(full.stages[0].title, 'ಸಸಿಮಡಿ');
  });
});
