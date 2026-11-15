/**
 * Part 3.1 — the real server process (src/server.ts): startup validation, refusing to start without
 * a database, serving requests, and graceful shutdown on SIGTERM.
 * Each test spawns `node --import tsx src/server.ts` with a controlled environment
 * (DOTENV_CONFIG_PATH points nowhere, so the local .env file is NOT read).
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const API_DIR = fileURLToPath(new URL('../..', import.meta.url));

type Run = { child: ChildProcess; stdout: () => string; stderr: () => string; exited: Promise<number | null> };

function startServer(env: Record<string, string>): Run {
  const child = spawn(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
    cwd: API_DIR,
    env: { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '', DOTENV_CONFIG_PATH: '/nonexistent/.env', ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let out = '';
  let err = '';
  child.stdout?.on('data', (d: Buffer) => (out += d.toString()));
  child.stderr?.on('data', (d: Buffer) => (err += d.toString()));
  const exited = new Promise<number | null>((resolve) => child.on('exit', (code) => resolve(code)));
  return { child, stdout: () => out, stderr: () => err, exited };
}

async function within<T>(promise: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => (timer = setTimeout(() => reject(new Error(`timed out: ${what}`)), ms)))]);
  } finally {
    clearTimeout(timer);
  }
}

async function waitForLog(run: Run, pattern: RegExp, ms: number): Promise<string> {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const line = run.stdout().split('\n').find((l) => pattern.test(l));
    if (line) return line;
    if (run.child.exitCode !== null) break;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`log line ${pattern} not seen. stdout:\n${run.stdout()}\nstderr:\n${run.stderr()}`);
}

describe('server process', () => {
  it('refuses to start when DATABASE_URL is missing (exit code 1, clear message)', async () => {
    const run = startServer({ NODE_ENV: 'production', CORS_ALLOWED_ORIGINS: 'https://app.example' });
    const code = await within(run.exited, 20_000, 'process exit');
    assert.equal(code, 1);
    assert.match(run.stderr(), /Invalid environment configuration/);
    assert.match(run.stderr(), /DATABASE_URL: is required/);
  });

  it('refuses to start with invalid configuration values', async () => {
    const run = startServer({ DATABASE_URL: 'postgresql://u:p@localhost/db', PORT: 'eighty', NODE_ENV: 'production' });
    assert.equal(await within(run.exited, 20_000, 'process exit'), 1);
    assert.match(run.stderr(), /PORT/);
    assert.match(run.stderr(), /CORS_ALLOWED_ORIGINS: is required in production/);
  });

  it('refuses to start when the database is unreachable, without logging the password', async () => {
    const run = startServer({
      NODE_ENV: 'production',
      CORS_ALLOWED_ORIGINS: 'https://app.example',
      DATABASE_URL: 'postgresql://krishisutra:very_secret_pw@127.0.0.1:1/krishisutra',
      DATABASE_CONNECT_TIMEOUT_MS: '1000',
    });
    assert.equal(await within(run.exited, 20_000, 'process exit'), 1);
    const fatal = await waitForLog(run, /Cannot reach the database/, 1000);
    assert.equal(JSON.parse(fatal).level, 60, 'logged at fatal level');
    assert.ok(!run.stdout().includes('very_secret_pw') && !run.stderr().includes('very_secret_pw'), 'password never logged');
    assert.doesNotMatch(run.stdout(), /listening/, 'never reports that it started');
  });

  it('starts, serves health endpoints from the real database, and shuts down gracefully on SIGTERM', async () => {
    assert.ok(process.env.DATABASE_URL, 'DATABASE_URL must be set for this test (see .env.example)');
    const run = startServer({
      NODE_ENV: 'production',
      PORT: '0',
      HOST: '127.0.0.1',
      LOG_LEVEL: 'info',
      CORS_ALLOWED_ORIGINS: 'https://app.example',
      DATABASE_URL: process.env.DATABASE_URL,
    });
    try {
      await waitForLog(run, /Database connection OK/, 20_000);
      const listening = JSON.parse(await waitForLog(run, /listening/, 10_000)) as { port: number };
      const base = `http://127.0.0.1:${listening.port}/api/v1`;

      const health = await fetch(`${base}/health`);
      assert.equal(health.status, 200);
      assert.equal(((await health.json()) as { data: { environment: string } }).data.environment, 'production');
      const db = await fetch(`${base}/health/database`);
      assert.equal(db.status, 200);

      run.child.kill('SIGTERM');
      assert.equal(await within(run.exited, 15_000, 'graceful exit'), 0);
      await waitForLog(run, /Shutting down/, 100);
      await waitForLog(run, /Shutdown complete/, 100);
    } finally {
      if (run.child.exitCode === null) run.child.kill('SIGKILL');
    }
  });
});
