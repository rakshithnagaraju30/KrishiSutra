/**
 * Environment configuration — validated once at startup.
 *
 * `loadConfig(source)` is a pure function (no side effects, no process.exit), so it can be unit
 * tested with any input. The server calls it with `process.env` and refuses to start when it throws.
 * Error messages name the variable and the problem, never the value (values may be secrets).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

export const NODE_ENVS = ['development', 'test', 'production'] as const;
export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];
export type LogLevel = (typeof LOG_LEVELS)[number];

export type AppConfig = {
  nodeEnv: NodeEnv;
  isProduction: boolean;
  host: string;
  port: number;
  databaseUrl: string;
  corsAllowedOrigins: string[];
  logLevel: LogLevel;
  requestBodyLimit: string;
  /** Express "trust proxy" setting: false, true, or number of proxy hops. */
  trustProxy: boolean | number;
  rateLimit: { apiPerMinute: number; registrationsPerHour: number };
  appVersion: string;
};

export class ConfigError extends Error {
  readonly issues: string[];
  constructor(issues: string[]) {
    super(`Invalid environment configuration:\n${issues.map((i) => `  - ${i}`).join('\n')}`);
    this.name = 'ConfigError';
    this.issues = issues;
  }
}

/** A browser origin: scheme + host (+ port), no path. */
function isValidOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin === value;
  } catch {
    return false;
  }
}

const schema = z
  .object({
    NODE_ENV: z.enum(NODE_ENVS, { error: `must be one of: ${NODE_ENVS.join(', ')}` }).default('development'),
    HOST: z.string().min(1).default('0.0.0.0'),
    PORT: z.coerce
      .number({ error: 'must be a number' })
      .int('must be a whole number')
      .min(0, 'must be between 0 and 65535')
      .max(65535, 'must be between 0 and 65535')
      .default(3000),
    DATABASE_URL: z
      .string({ error: 'is required' })
      .regex(/^postgres(ql)?:\/\/.+/, 'must be a postgresql:// connection string'),
    CORS_ALLOWED_ORIGINS: z
      .string()
      .default('')
      .superRefine((value, ctx) => {
        for (const origin of splitList(value)) {
          if (origin === '*') ctx.addIssue({ code: 'custom', message: 'must list explicit origins; "*" is not allowed' });
          else if (!isValidOrigin(origin)) ctx.addIssue({ code: 'custom', message: `"${origin}" is not a valid origin (expected e.g. https://app.example.com)` });
        }
      }),
    LOG_LEVEL: z.enum(LOG_LEVELS, { error: `must be one of: ${LOG_LEVELS.join(', ')}` }).optional(),
    REQUEST_BODY_LIMIT: z
      .string()
      .regex(/^\d+(b|kb|mb)$/i, 'must look like 100kb or 1mb')
      .default('100kb'),
    TRUST_PROXY: z
      .string()
      .regex(/^(true|false|\d+)$/, 'must be true, false or a number of proxy hops')
      .default('false'),
    RATE_LIMIT_PER_MINUTE: z.coerce.number({ error: 'must be a number' }).int().min(1, 'must be at least 1').default(300),
    DEVICE_REGISTRATIONS_PER_HOUR: z.coerce.number({ error: 'must be a number' }).int().min(1, 'must be at least 1').default(20),
  });

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const KEYS = Object.keys(schema.shape) as (keyof typeof schema.shape)[];

/** Reads the package version (works from src/ and from the compiled dist/ folder). */
function readAppVersion(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i += 1) {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { name?: string; version?: string };
      if (pkg.name === '@krishisutra/api' && pkg.version) return pkg.version;
    } catch {
      // keep walking up
    }
    dir = dirname(dir);
  }
  return '0.0.0';
}

export function loadConfig(source: Record<string, string | undefined>): AppConfig {
  // Treat empty strings as "not set", so `PORT=` behaves like a missing PORT.
  const input: Record<string, string | undefined> = {};
  for (const key of KEYS) {
    const value = source[key];
    input[key] = value === undefined || value.trim() === '' ? undefined : value.trim();
  }

  const parsed = schema.safeParse(input);
  const issues = parsed.success ? [] : parsed.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`);

  // Cross-field rule, checked separately so it is reported even when other fields are invalid.
  if (input.NODE_ENV === 'production' && splitList(input.CORS_ALLOWED_ORIGINS ?? '').length === 0) {
    issues.push('CORS_ALLOWED_ORIGINS: is required in production (comma-separated list of web app origins)');
  }
  if (!parsed.success || issues.length > 0) throw new ConfigError(issues);

  const env = parsed.data;
  const defaultLogLevel: Record<NodeEnv, LogLevel> = { development: 'debug', test: 'silent', production: 'info' };
  return {
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    host: env.HOST,
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
    corsAllowedOrigins: splitList(env.CORS_ALLOWED_ORIGINS),
    logLevel: env.LOG_LEVEL ?? defaultLogLevel[env.NODE_ENV],
    requestBodyLimit: env.REQUEST_BODY_LIMIT.toLowerCase(),
    trustProxy: env.TRUST_PROXY === 'true' ? true : env.TRUST_PROXY === 'false' ? false : Number(env.TRUST_PROXY),
    rateLimit: { apiPerMinute: env.RATE_LIMIT_PER_MINUTE, registrationsPerHour: env.DEVICE_REGISTRATIONS_PER_HOUR },
    appVersion: readAppVersion(),
  };
}
