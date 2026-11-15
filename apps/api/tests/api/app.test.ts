/**
 * Part 3.1 — HTTP behaviour of the Express app (supertest, no network port).
 * The database health tests use the real development/test database and a genuinely unreachable one.
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { PrismaPg } from '@prisma/adapter-pg';
import express, { type Express } from 'express';
import request from 'supertest';
import { z } from 'zod';
import { PrismaClient } from '../../generated/prisma/client.ts';
import { createApp } from '../../src/app.ts';
import { loadConfig } from '../../src/config/env.ts';
import { createLogger } from '../../src/config/logger.ts';
import { createDatabaseCheck, type DatabaseCheck } from '../../src/db/health.ts';
import { prisma } from '../../src/db/prisma.ts';
import { createErrorHandler } from '../../src/middleware/error-handler.ts';
import { notFound } from '../../src/middleware/not-found.ts';
import { createRequestLogger } from '../../src/middleware/request-logger.ts';
import { getValidated, validate } from '../../src/middleware/validate.ts';
import { HttpError } from '../../src/utils/http-error.ts';

const ALLOWED_ORIGIN = 'http://localhost:8081';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const logger = createLogger({ logLevel: 'silent', nodeEnv: 'test', appVersion: 'test' });

// A real client pointed at a port where nothing listens → genuine connection failure.
const unreachable = new PrismaClient({
  adapter: new PrismaPg({ connectionString: 'postgresql://krishisutra:not_the_password@127.0.0.1:1/krishisutra', connectionTimeoutMillis: 1000 }),
  log: [],
});

after(async () => {
  await Promise.allSettled([prisma.$disconnect(), unreachable.$disconnect()]);
});

function buildApp(options: { env?: Record<string, string>; checkDatabase?: DatabaseCheck; isShuttingDown?: () => boolean } = {}): Express {
  const config = loadConfig({
    NODE_ENV: 'test',
    DATABASE_URL: process.env.DATABASE_URL,
    CORS_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
    ...options.env,
  });
  return createApp({
    config,
    logger,
    checkDatabase: options.checkDatabase ?? createDatabaseCheck(prisma),
    isShuttingDown: options.isShuttingDown,
  });
}

/** A minimal app with the real middleware, plus test-only routes that fail on purpose. */
function errorTestApp(exposeStack: boolean, register: (app: Express) => void): Express {
  const app = express();
  app.use(createRequestLogger(logger));
  app.use(express.json());
  register(app);
  app.use(notFound);
  app.use(createErrorHandler({ exposeStack }));
  return app;
}

function assertErrorShape(body: unknown, code: string, requestIdHeader?: string) {
  const b = body as { success: boolean; error: { code: string; message: string; requestId?: string } };
  assert.equal(b.success, false);
  assert.equal(b.error.code, code);
  assert.equal(typeof b.error.message, 'string');
  assert.ok(b.error.message.length > 0);
  if (requestIdHeader) assert.equal(b.error.requestId, requestIdHeader);
}

// ------------------------------------------------------------------------------------------------
describe('GET /api/v1 (API root)', () => {
  it('returns API information in the standard success format', async () => {
    const res = await request(buildApp()).get('/api/v1').expect(200).expect('Content-Type', /application\/json/);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'KrishiSutra API');
    assert.equal(res.body.data.apiVersion, 'v1');
    assert.equal(res.body.data.version, '0.1.0');
    assert.deepEqual(
      res.body.data.endpoints.map((e: { path: string }) => e.path),
      ['/api/v1', '/api/v1/health', '/api/v1/health/database'],
    );
    assert.match(res.headers['x-request-id'] ?? '', UUID);
  });
});

describe('GET /api/v1/health', () => {
  it('reports status, environment, timestamp and API version', async () => {
    const before = Date.now();
    const res = await request(buildApp()).get('/api/v1/health').expect(200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'ok');
    assert.equal(res.body.data.environment, 'test');
    assert.equal(res.body.data.apiVersion, 'v1');
    const ts = Date.parse(res.body.data.timestamp);
    assert.ok(ts >= before - 1000 && ts <= Date.now() + 1000, 'timestamp is current');
    assert.equal(typeof res.body.data.uptimeSeconds, 'number');
  });

  it('returns 503 while the server is shutting down', async () => {
    const res = await request(buildApp({ isShuttingDown: () => true })).get('/api/v1/health').expect(503);
    assert.equal(res.body.data.status, 'shutting_down');
  });
});

describe('GET /api/v1/health/database', () => {
  it('reports success against the real PostgreSQL database', async () => {
    const res = await request(buildApp()).get('/api/v1/health/database').expect(200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'ok');
    assert.equal(res.body.data.database, 'postgresql');
    assert.equal(typeof res.body.data.latencyMs, 'number');
  });

  it('reports 503 DATABASE_UNAVAILABLE when the database is unreachable, without leaking details', async () => {
    const app = buildApp({ checkDatabase: createDatabaseCheck(unreachable, 5000) });
    const res = await request(app).get('/api/v1/health/database').expect(503);
    assertErrorShape(res.body, 'DATABASE_UNAVAILABLE', res.headers['x-request-id']);
    const text = JSON.stringify(res.body);
    for (const secret of ['postgres', '127.0.0.1', 'not_the_password', 'ECONNREFUSED', 'stack']) {
      assert.ok(!text.includes(secret), `response must not contain "${secret}"`);
    }
  });

  it('fails fast (503) when the database hangs instead of answering', async () => {
    const hanging = { $queryRaw: () => new Promise<never>(() => undefined) } as unknown as Parameters<typeof createDatabaseCheck>[0];
    const started = Date.now();
    const res = await request(buildApp({ checkDatabase: createDatabaseCheck(hanging, 100) })).get('/api/v1/health/database').expect(503);
    assertErrorShape(res.body, 'DATABASE_UNAVAILABLE');
    assert.ok(Date.now() - started < 2000, 'timed out quickly');
  });
});

describe('invalid routes', () => {
  it('returns 404 NOT_FOUND in the standard error format', async () => {
    const res = await request(buildApp()).get('/api/v1/does-not-exist?secret=1').expect(404);
    assertErrorShape(res.body, 'NOT_FOUND', res.headers['x-request-id']);
    assert.equal(res.body.error.message, 'Route GET /api/v1/does-not-exist was not found.');
  });

  it('returns 404 outside the API prefix and for unsupported methods', async () => {
    assertErrorShape((await request(buildApp()).get('/').expect(404)).body, 'NOT_FOUND');
    assertErrorShape((await request(buildApp()).get('/api/v2/health').expect(404)).body, 'NOT_FOUND');
    assertErrorShape((await request(buildApp()).delete('/api/v1/health').expect(404)).body, 'NOT_FOUND');
  });
});

describe('error responses and request handling', () => {
  it('rejects malformed JSON with 400 INVALID_JSON', async () => {
    const res = await request(buildApp()).post('/api/v1/health').set('Content-Type', 'application/json').send('{"broken": ').expect(400);
    assertErrorShape(res.body, 'INVALID_JSON', res.headers['x-request-id']);
  });

  it('rejects bodies over REQUEST_BODY_LIMIT with 413 PAYLOAD_TOO_LARGE', async () => {
    const app = buildApp({ env: { REQUEST_BODY_LIMIT: '1kb' } });
    const res = await request(app).post('/api/v1/health').send({ text: 'x'.repeat(5000) }).expect(413);
    assertErrorShape(res.body, 'PAYLOAD_TOO_LARGE');
  });

  it('hides unexpected error details: generic 500 with no stack outside development', async () => {
    const app = errorTestApp(false, (a) => {
      a.get('/boom', () => {
        throw new Error('internal detail: password=hunter2');
      });
    });
    const res = await request(app).get('/boom').expect(500);
    assertErrorShape(res.body, 'INTERNAL_ERROR', res.headers['x-request-id']);
    assert.equal(res.body.error.message, 'An unexpected error occurred.');
    assert.equal(res.body.error.stack, undefined);
    assert.ok(!JSON.stringify(res.body).includes('hunter2'));
  });

  it('includes the stack trace for unexpected errors only in development', async () => {
    const app = errorTestApp(true, (a) => {
      a.get('/boom', async () => {
        throw new Error('async failure'); // rejected promise → Express 5 forwards it
      });
    });
    const res = await request(app).get('/boom').expect(500);
    assert.match(res.body.error.stack, /async failure/);
  });

  it('passes HttpError status/code/details through, and maps known database errors', async () => {
    const app = errorTestApp(false, (a) => {
      a.get('/teapot', () => {
        throw new HttpError(418, 'I_AM_A_TEAPOT', 'Short and stout.', { hint: 'tea' });
      });
      a.get('/duplicate', () => {
        throw Object.assign(new Error('Unique constraint failed on phone=+91...'), { name: 'PrismaClientKnownRequestError', code: 'P2002' });
      });
    });
    const teapot = await request(app).get('/teapot').expect(418);
    assert.deepEqual(teapot.body.error.details, { hint: 'tea' });
    const dup = await request(app).get('/duplicate').expect(409);
    assertErrorShape(dup.body, 'CONFLICT');
    assert.ok(!JSON.stringify(dup.body).includes('+91'), 'database error text is not exposed');
  });

  it('validates requests with zod schemas: 400 VALIDATION_ERROR with details, or parsed values', async () => {
    const schema = z.object({ name: z.string().min(2), acres: z.coerce.number().positive().default(1) });
    const app = errorTestApp(false, (a) => {
      a.post('/items/:id', validate({ params: z.object({ id: z.uuid() }), body: schema }), (req, res) => {
        res.json({ body: req.body, params: getValidated<{ params: { id: string } }>(res).params });
      });
    });
    const bad = await request(app).post('/items/not-a-uuid').send({ name: 'x', acres: -2 }).expect(400);
    assertErrorShape(bad.body, 'VALIDATION_ERROR');
    const paths = bad.body.error.details.map((d: { path: string }) => d.path).sort();
    assert.deepEqual(paths, ['body.acres', 'body.name', 'params.id']);

    const id = '0192f1a2-3b4c-7d5e-8f60-123456789abc';
    const ok = await request(app).post(`/items/${id}`).send({ name: 'Plot', extra: 'dropped' }).expect(200);
    assert.deepEqual(ok.body, { body: { name: 'Plot', acres: 1 }, params: { id } });
  });

  it('reuses a safe incoming X-Request-Id and replaces an unsafe one', async () => {
    const app = buildApp();
    const kept = await request(app).get('/api/v1/health').set('X-Request-Id', 'mobile-req-12345').expect(200);
    assert.equal(kept.headers['x-request-id'], 'mobile-req-12345');
    const replaced = await request(app).get('/api/v1/health').set('X-Request-Id', 'bad id <script>').expect(200);
    assert.match(replaced.headers['x-request-id'] ?? '', UUID);
  });
});

describe('CORS and security headers', () => {
  it('allows listed origins, rejects others with 403, and allows native clients without Origin', async () => {
    const app = buildApp();
    const allowed = await request(app).get('/api/v1/health').set('Origin', ALLOWED_ORIGIN).expect(200);
    assert.equal(allowed.headers['access-control-allow-origin'], ALLOWED_ORIGIN);

    const blocked = await request(app).get('/api/v1/health').set('Origin', 'https://evil.example').expect(403);
    assertErrorShape(blocked.body, 'CORS_ORIGIN_NOT_ALLOWED');

    const native = await request(app).get('/api/v1/health').expect(200);
    assert.equal(native.headers['access-control-allow-origin'], undefined);
  });

  it('answers CORS preflight requests from allowed origins', async () => {
    const res = await request(buildApp())
      .options('/api/v1/health')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type,authorization')
      .expect(204);
    assert.match(res.headers['access-control-allow-methods'] ?? '', /POST/);
    assert.match(res.headers['access-control-allow-headers'] ?? '', /Authorization/);
  });

  it('sets security headers and hides the framework', async () => {
    const res = await request(buildApp()).get('/api/v1/health').expect(200);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.ok(res.headers['content-security-policy']);
    assert.equal(res.headers['x-powered-by'], undefined);
  });
});
