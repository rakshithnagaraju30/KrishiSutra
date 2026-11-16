/**
 * Environment configuration — validated once at startup.
 *
 * `loadConfig(source)` is a pure function (no side effects, no process.exit), so it can be unit
 * tested with any input. The server calls it with `process.env` and refuses to start when it throws.
 * Error messages name the variable and the problem, never the value (values may be secrets).
 */
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

export const NODE_ENVS = ['development', 'test', 'production'] as const;
export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

export const SMS_PROVIDERS = ['console', 'none'] as const;
export type SmsProviderName = (typeof SMS_PROVIDERS)[number];

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
  rateLimit: { apiPerMinute: number; registrationsPerHour: number; otpRequestsPerHour: number };
  appVersion: string;
  auth: AuthConfig;
};

/** Phone OTP + JWT settings (Part 3.2). */
export type AuthConfig = {
  /** HMAC key for access tokens; null in production when not configured (phone sign-in disabled). */
  jwtSecret: Uint8Array | null;
  /** HMAC key for OTP hashes; null in production when not configured (phone sign-in disabled). */
  otpSecret: string | null;
  /** True when development/test generated random secrets for this process (tokens die on restart). */
  ephemeralSecrets: boolean;
  accessTokenTtlSeconds: number;
  refreshTokenTtlDays: number;
  smsProvider: SmsProviderName;
  otp: { length: number; ttlSeconds: number; maxAttempts: number; resendCooldownSeconds: number; maxPerPhonePerHour: number };
  /** Phone sign-in works only with both secrets and an SMS provider. */
  phoneAuthEnabled: boolean;
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
    // ---- Part 3.2: phone OTP + JWT
    JWT_ACCESS_SECRET: z.string().min(32, 'must be at least 32 characters (use a long random value)').optional(),
    OTP_HASH_SECRET: z.string().min(32, 'must be at least 32 characters (use a long random value)').optional(),
    ACCESS_TOKEN_TTL_SECONDS: int(60, 3600, 900),
    REFRESH_TOKEN_TTL_DAYS: int(1, 180, 30),
    OTP_LENGTH: int(4, 8, 6),
    OTP_TTL_SECONDS: int(60, 1800, 300),
    OTP_MAX_ATTEMPTS: int(1, 10, 5),
    OTP_RESEND_COOLDOWN_SECONDS: int(0, 600, 60),
    OTP_MAX_PER_PHONE_PER_HOUR: int(1, 50, 5),
    OTP_REQUESTS_PER_HOUR: int(1, 100_000, 60),
    SMS_PROVIDER: z.enum(SMS_PROVIDERS, { error: `must be one of: ${SMS_PROVIDERS.join(', ')}` }).optional(),
  });

function int(min: number, max: number, fallback: number) {
  return z.coerce
    .number({ error: 'must be a number' })
    .int('must be a whole number')
    .min(min, `must be between ${min} and ${max}`)
    .max(max, `must be between ${min} and ${max}`)
    .default(fallback);
}

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
  if (input.NODE_ENV === 'production' && input.SMS_PROVIDER === 'console') {
    issues.push('SMS_PROVIDER: "console" prints codes to the log and is not allowed in production');
  }
  if (input.JWT_ACCESS_SECRET && input.JWT_ACCESS_SECRET === input.OTP_HASH_SECRET) {
    issues.push('OTP_HASH_SECRET: must be different from JWT_ACCESS_SECRET');
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
    rateLimit: { apiPerMinute: env.RATE_LIMIT_PER_MINUTE, registrationsPerHour: env.DEVICE_REGISTRATIONS_PER_HOUR, otpRequestsPerHour: env.OTP_REQUESTS_PER_HOUR },
    appVersion: readAppVersion(),
    auth: authConfig(env),
  };
}

function authConfig(env: z.infer<typeof schema>): AuthConfig {
  const production = env.NODE_ENV === 'production';
  // Development/test: missing secrets are replaced by random per-process values (never hardcoded).
  // Production: missing secrets disable phone sign-in instead of stopping the server.
  const ephemeral = !production && (!env.JWT_ACCESS_SECRET || !env.OTP_HASH_SECRET);
  const jwt = env.JWT_ACCESS_SECRET ?? (production ? null : randomBytes(48).toString('base64url'));
  const otp = env.OTP_HASH_SECRET ?? (production ? null : randomBytes(48).toString('base64url'));
  const smsProvider: SmsProviderName = env.SMS_PROVIDER ?? (production ? 'none' : 'console');
  return {
    jwtSecret: jwt ? new TextEncoder().encode(jwt) : null,
    otpSecret: otp,
    ephemeralSecrets: ephemeral,
    accessTokenTtlSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
    smsProvider,
    otp: {
      length: env.OTP_LENGTH,
      ttlSeconds: env.OTP_TTL_SECONDS,
      maxAttempts: env.OTP_MAX_ATTEMPTS,
      resendCooldownSeconds: env.OTP_RESEND_COOLDOWN_SECONDS,
      maxPerPhonePerHour: env.OTP_MAX_PER_PHONE_PER_HOUR,
    },
    phoneAuthEnabled: jwt !== null && otp !== null && smsProvider !== 'none',
  };
}
