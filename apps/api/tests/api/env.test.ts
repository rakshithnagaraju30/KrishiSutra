/** Part 3.1 — environment configuration validation (pure unit tests, no database). */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ConfigError, loadConfig } from '../../src/config/env.ts';

const DB = 'postgresql://user:pass@localhost:5432/db?schema=public';

function configError(source: Record<string, string | undefined>): ConfigError {
  try {
    loadConfig(source);
  } catch (error) {
    assert.ok(error instanceof ConfigError, 'expected a ConfigError');
    return error;
  }
  assert.fail('expected loadConfig to throw');
}

describe('environment configuration', () => {
  it('applies safe defaults when only DATABASE_URL is set', () => {
    const config = loadConfig({ DATABASE_URL: DB });
    assert.equal(config.nodeEnv, 'development');
    assert.equal(config.isProduction, false);
    assert.equal(config.host, '0.0.0.0');
    assert.equal(config.port, 3000);
    assert.equal(config.logLevel, 'debug');
    assert.deepEqual(config.corsAllowedOrigins, []);
    assert.equal(config.requestBodyLimit, '100kb');
    assert.equal(config.trustProxy, false);
    assert.equal(config.appVersion, '0.1.0');
  });

  it('parses explicit values', () => {
    const config = loadConfig({
      DATABASE_URL: DB,
      NODE_ENV: 'production',
      PORT: '8080',
      LOG_LEVEL: 'warn',
      CORS_ALLOWED_ORIGINS: ' https://app.example.com , http://localhost:8081 ',
      REQUEST_BODY_LIMIT: '1MB',
      TRUST_PROXY: '1',
    });
    assert.equal(config.isProduction, true);
    assert.equal(config.port, 8080);
    assert.equal(config.logLevel, 'warn');
    assert.deepEqual(config.corsAllowedOrigins, ['https://app.example.com', 'http://localhost:8081']);
    assert.equal(config.requestBodyLimit, '1mb');
    assert.equal(config.trustProxy, 1);
  });

  it('uses quiet logging in test and info in production by default', () => {
    assert.equal(loadConfig({ DATABASE_URL: DB, NODE_ENV: 'test' }).logLevel, 'silent');
    assert.equal(loadConfig({ DATABASE_URL: DB, NODE_ENV: 'production', CORS_ALLOWED_ORIGINS: 'https://a.example' }).logLevel, 'info');
  });

  it('rejects a missing or empty DATABASE_URL', () => {
    assert.match(configError({}).message, /DATABASE_URL: is required/);
    assert.match(configError({ DATABASE_URL: '   ' }).message, /DATABASE_URL: is required/);
  });

  it('rejects a non-PostgreSQL DATABASE_URL without echoing the (secret) value', () => {
    const error = configError({ DATABASE_URL: 'mysql://root:topsecret@db/app' });
    assert.match(error.message, /DATABASE_URL: must be a postgresql:\/\/ connection string/);
    assert.ok(!error.message.includes('topsecret'), 'secret value must not appear in the error');
  });

  it('rejects invalid PORT, NODE_ENV, LOG_LEVEL, body limit and TRUST_PROXY', () => {
    assert.match(configError({ DATABASE_URL: DB, PORT: 'abc' }).message, /PORT/);
    assert.match(configError({ DATABASE_URL: DB, PORT: '70000' }).message, /PORT: must be between 0 and 65535/);
    assert.match(configError({ DATABASE_URL: DB, NODE_ENV: 'staging' }).message, /NODE_ENV: must be one of/);
    assert.match(configError({ DATABASE_URL: DB, LOG_LEVEL: 'loud' }).message, /LOG_LEVEL: must be one of/);
    assert.match(configError({ DATABASE_URL: DB, REQUEST_BODY_LIMIT: 'huge' }).message, /REQUEST_BODY_LIMIT/);
    assert.match(configError({ DATABASE_URL: DB, TRUST_PROXY: 'yes' }).message, /TRUST_PROXY/);
  });

  it('requires explicit, valid CORS origins in production and never allows "*"', () => {
    assert.match(configError({ DATABASE_URL: DB, NODE_ENV: 'production' }).message, /CORS_ALLOWED_ORIGINS: is required in production/);
    assert.match(configError({ DATABASE_URL: DB, CORS_ALLOWED_ORIGINS: '*' }).message, /"\*" is not allowed/);
    assert.match(configError({ DATABASE_URL: DB, CORS_ALLOWED_ORIGINS: 'https://a.example/path' }).message, /not a valid origin/);
    assert.match(configError({ DATABASE_URL: DB, CORS_ALLOWED_ORIGINS: 'a.example' }).message, /not a valid origin/);
  });

  it('reports every problem at once', () => {
    const error = configError({ PORT: '-1', NODE_ENV: 'staging' });
    assert.ok(error.issues.length >= 3, `expected 3+ issues, got ${error.issues.length}`);
    // The production CORS rule must be reported even when other fields are also invalid.
    const prod = configError({ NODE_ENV: 'production', PORT: 'eighty', DATABASE_URL: DB });
    assert.ok(prod.issues.some((i) => i.startsWith('PORT')));
    assert.ok(prod.issues.some((i) => i.startsWith('CORS_ALLOWED_ORIGINS: is required in production')));
  });
});
