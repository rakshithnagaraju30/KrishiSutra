/**
 * Part 3.2 — phone OTP registration/login, JWT sessions, profile and roles.
 * Uses the real database and a mock SMS sender (no real SMS is ever sent).
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import type { Express } from 'express';
import { SignJWT } from 'jose';
import request from 'supertest';
import { createApp } from '../../src/app.ts';
import { maskPhone, normaliseIndianMobile } from '../../src/auth/phone.ts';
import { JWT_AUDIENCE, JWT_ISSUER } from '../../src/auth/tokens.ts';
import { ConfigError, loadConfig, type AppConfig } from '../../src/config/env.ts';
import { createLogger } from '../../src/config/logger.ts';
import { prisma } from '../../src/db/prisma.ts';
import { ConsoleSmsSender, type OtpMessage, type SmsSender } from '../../src/integrations/sms/index.ts';

const logger = createLogger({ logLevel: 'silent', nodeEnv: 'test', appVersion: 'test' });
const RUN = String(Date.now() % 10_000_000).padStart(7, '0');
let counter = 0;
/** A unique Indian mobile number for this run: 9 + 7-digit run id + 2-digit counter. */
const newPhone = () => `+919${RUN}${String(counter++).padStart(2, '0')}`;
const local = (e164: string) => e164.slice(3); // "98765…" as a farmer would type it

class MockSms implements SmsSender {
  readonly name = 'mock';
  readonly sent: OtpMessage[] = [];
  fail = false;
  async sendOtp(m: OtpMessage) {
    if (this.fail) throw new Error('provider down');
    this.sent.push(m);
  }
  lastCode(phone: string): string {
    const m = [...this.sent].reverse().find((x) => x.to === phone);
    if (!m) throw new Error(`no SMS sent to ${phone}`);
    return m.code;
  }
  count(phone: string) {
    return this.sent.filter((x) => x.to === phone).length;
  }
}

function build(env: Record<string, string> = {}, sms: SmsSender | null = new MockSms()) {
  const config = loadConfig({
    NODE_ENV: 'test', DATABASE_URL: process.env.DATABASE_URL, RATE_LIMIT_PER_MINUTE: '100000', DEVICE_REGISTRATIONS_PER_HOUR: '1000',
    OTP_REQUESTS_PER_HOUR: '100000', OTP_RESEND_COOLDOWN_SECONDS: '0', OTP_MAX_PER_PHONE_PER_HOUR: '50', ...env,
  });
  return { app: createApp({ config, logger, prisma, smsSender: sms }), config, sms: sms as MockSms };
}

const main = build();
const app: Express = main.app;
const sms = main.sms;
const deviceUserIds: string[] = [];
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

async function register(phone = newPhone(), extra: Record<string, unknown> = {}, a: Express = app) {
  const res = await request(a).post('/api/v1/auth/register').send({ fullName: 'Test Farmer', phone: local(phone), language: 'kn', ...extra });
  return { res, phone };
}
/** Registers and verifies a new farmer; returns tokens and ids. */
async function signedUpFarmer() {
  const { phone } = await register();
  const res = await request(app).post('/api/v1/auth/verify-otp').send({ phone, otp: sms.lastCode(phone) }).expect(200);
  return { phone, userId: res.body.data.user.id as string, ...(res.body.data.tokens as { accessToken: string; refreshToken: string }) };
}
async function loginCode(phone: string, a: Express = app, s: MockSms = sms) {
  await request(a).post('/api/v1/auth/send-otp').send({ phone, purpose: 'LOGIN' }).expect(200);
  return s.lastCode(phone);
}

after(async () => {
  const prefix = `+919${RUN}`;
  await prisma.phoneOtp.deleteMany({ where: { phone: { startsWith: prefix } } });
  await prisma.user.deleteMany({ where: { OR: [{ phone: { startsWith: prefix } }, { id: { in: deviceUserIds } }] } });
  await prisma.$disconnect();
});

// ------------------------------------------------------------------------------------------------
describe('phone numbers', () => {
  it('normalises the usual Indian formats to E.164 and rejects the rest', () => {
    for (const input of ['9876543210', '09876543210', '+91 98765 43210', '+91-98765-43210', '919876543210', '0091 9876543210', '(987) 654-3210']) {
      assert.equal(normaliseIndianMobile(input), '+919876543210', input);
    }
    for (const input of ['12345', '5876543210', '98765432101', '+1 415 555 0100', 'abcdefghij', '+92 9876543210', '']) {
      assert.equal(normaliseIndianMobile(input), null, input);
    }
    assert.equal(maskPhone('+919876543210'), '+91 ••••••3210');
  });
});

describe('registration (1–3)', () => {
  it('1. registers a farmer as PENDING_VERIFICATION, sends an OTP and returns nothing sensitive', async () => {
    const { res, phone } = await register(undefined, { email: 'Test.Farmer+' + RUN + '@Example.com' });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.status, 'PENDING_VERIFICATION');
    assert.equal(res.body.data.otp.phone, maskPhone(phone));
    const text = JSON.stringify(res.body);
    assert.ok(!text.includes(sms.lastCode(phone)), 'OTP never in the response');
    assert.ok(!/"id"|token/i.test(text), 'no user id or token in the response');

    const user = await prisma.user.findUniqueOrThrow({ where: { phone }, select: { status: true, phoneVerifiedAt: true, email: true, isDeviceAccount: true, roles: { select: { role: { select: { code: true } } } }, preferredLanguage: { select: { code: true } } } });
    assert.equal(user.status, 'PENDING_VERIFICATION');
    assert.equal(user.phoneVerifiedAt, null, 'phone is NOT verified yet');
    assert.equal(user.email, `test.farmer+${RUN}@example.com`, 'email lower-cased');
    assert.deepEqual(user.roles.map((r) => r.role.code), ['FARMER'], 'ordinary registration is FARMER only');
    assert.equal(user.preferredLanguage?.code, 'kn');
    assert.equal(sms.sent.at(-1)?.language, 'kn', 'SMS in the farmer’s language');

    const otp = await prisma.phoneOtp.findFirstOrThrow({ where: { phone }, orderBy: { sentAt: 'desc' } });
    assert.match(otp.codeHash, /^[0-9a-f]{64}$/);
    assert.notEqual(otp.codeHash, sms.lastCode(phone), 'only a hash is stored');
  });

  it('2. rejects a number that is already registered (verified), but lets an unfinished registration be repeated', async () => {
    const { phone } = await register();
    const again = await register(phone, { fullName: 'Corrected Name' });
    assert.equal(again.res.status, 201, 'unverified registration can be repeated');
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { phone } })).fullName, 'Corrected Name');
    await request(app).post('/api/v1/auth/verify-otp').send({ phone, otp: sms.lastCode(phone) }).expect(200);
    const dup = await register(phone);
    assert.equal(dup.res.status, 409);
    assert.equal(dup.res.body.error.code, 'PHONE_ALREADY_REGISTERED');
  });

  it('3. rejects invalid phone numbers and unknown or privileged fields', async () => {
    for (const phone of ['12345', '5876543210', '+1 415 555 0100']) {
      const res = await request(app).post('/api/v1/auth/register').send({ fullName: 'X', phone }).expect(400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.equal(res.body.error.details[0].path, 'body.phone');
    }
    const role = await request(app).post('/api/v1/auth/register').send({ fullName: 'X', phone: local(newPhone()), role: 'ADMIN' }).expect(400);
    assert.equal(role.body.error.code, 'VALIDATION_ERROR', 'a self-assigned role is rejected, not ignored');
  });
});

describe('OTP verification (4–8)', () => {
  it('4. a correct code verifies the phone, activates the account and signs in', async () => {
    const { phone } = await register();
    const res = await request(app).post('/api/v1/auth/verify-otp').send({ phone: local(phone), otp: sms.lastCode(phone), platform: 'android' }).expect(200);
    assert.equal(res.body.data.user.status, 'ACTIVE');
    assert.deepEqual(res.body.data.user.roles, ['FARMER']);
    assert.equal(res.body.data.tokens.tokenType, 'Bearer');
    assert.match(res.body.data.tokens.refreshToken, /^ks_rt_/);
    const user = await prisma.user.findUniqueOrThrow({ where: { phone } });
    assert.ok(user.phoneVerifiedAt && user.lastLoginAt);
    const session = await prisma.authSession.findFirstOrThrow({ where: { userId: user.id } });
    assert.notEqual(session.tokenHash, res.body.data.tokens.refreshToken, 'refresh token stored as a hash only');
    assert.equal(session.platform, 'android');
  });

  it('5. a wrong code is rejected with attempts left; after the limit even the right code fails', async () => {
    const { phone } = await register();
    const right = sms.lastCode(phone);
    const wrong = right === '000000' ? '111111' : '000000';
    const first = await request(app).post('/api/v1/auth/verify-otp').send({ phone, otp: wrong }).expect(400);
    assert.equal(first.body.error.code, 'OTP_INVALID');
    assert.equal(first.body.error.details.attemptsLeft, 4);
    for (let i = 0; i < 4; i++) await request(app).post('/api/v1/auth/verify-otp').send({ phone, otp: wrong }).expect(400);
    const blocked = await request(app).post('/api/v1/auth/verify-otp').send({ phone, otp: right }).expect(400);
    assert.equal(blocked.body.error.code, 'OTP_ATTEMPTS_EXCEEDED');
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { phone } })).phoneVerifiedAt, null);
  });

  it('6. an expired code is rejected', async () => {
    const { phone } = await register();
    await prisma.phoneOtp.updateMany({ where: { phone, consumedAt: null }, data: { sentAt: new Date(Date.now() - 600_000), expiresAt: new Date(Date.now() - 1000) } });
    const res = await request(app).post('/api/v1/auth/verify-otp').send({ phone, otp: sms.lastCode(phone) }).expect(400);
    assert.equal(res.body.error.code, 'OTP_EXPIRED');
  });

  it('7. a code works only once, and a new code replaces the old one', async () => {
    const { phone } = await register();
    const firstCode = sms.lastCode(phone);
    await request(app).post('/api/v1/auth/send-otp').send({ phone, purpose: 'REGISTRATION' }).expect(200);
    const secondCode = sms.lastCode(phone);
    if (firstCode !== secondCode) {
      const old = await request(app).post('/api/v1/auth/verify-otp').send({ phone, otp: firstCode }).expect(400);
      assert.equal(old.body.error.code, 'OTP_INVALID', 'replaced code no longer works');
    }
    await request(app).post('/api/v1/auth/verify-otp').send({ phone, otp: secondCode }).expect(200);
    const reuse = await request(app).post('/api/v1/auth/verify-otp').send({ phone, otp: secondCode }).expect(400);
    assert.equal(reuse.body.error.code, 'OTP_INVALID');

    const code = await loginCode(phone);
    await request(app).post('/api/v1/auth/login').send({ phone, otp: code }).expect(200);
    await request(app).post('/api/v1/auth/login').send({ phone, otp: code }).expect(400);
  });

  it('8. enforces the resend cooldown, the hourly cap per number and the per-IP limit', async () => {
    const strict = build({ OTP_RESEND_COOLDOWN_SECONDS: '60', OTP_MAX_PER_PHONE_PER_HOUR: '50' });
    const { phone } = await register(undefined, {}, strict.app);
    const cool = await request(strict.app).post('/api/v1/auth/send-otp').send({ phone, purpose: 'REGISTRATION' }).expect(429);
    assert.equal(cool.body.error.code, 'OTP_COOLDOWN');
    assert.ok(cool.body.error.details.retryAfterSeconds > 0);

    const capped = build({ OTP_MAX_PER_PHONE_PER_HOUR: '2' });
    const p2 = newPhone();
    await register(p2, {}, capped.app);
    await request(capped.app).post('/api/v1/auth/send-otp').send({ phone: p2, purpose: 'REGISTRATION' }).expect(200);
    const cap = await request(capped.app).post('/api/v1/auth/send-otp').send({ phone: p2, purpose: 'REGISTRATION' }).expect(429);
    assert.equal(cap.body.error.code, 'OTP_LIMIT_REACHED');

    const ipLimited = build({ OTP_REQUESTS_PER_HOUR: '3' });
    const statuses: number[] = [];
    for (let i = 0; i < 4; i++) statuses.push((await request(ipLimited.app).post('/api/v1/auth/send-otp').send({ phone: newPhone(), purpose: 'LOGIN' })).status);
    assert.deepEqual(statuses, [200, 200, 200, 429]);
  });
});

describe('login and tokens (9–14)', () => {
  it('9. signs in an existing farmer with a login code', async () => {
    const f = await signedUpFarmer();
    const before = (await prisma.user.findUniqueOrThrow({ where: { id: f.userId } })).lastLoginAt!;
    const res = await request(app).post('/api/v1/auth/login').send({ phone: local(f.phone), otp: await loginCode(f.phone) }).expect(200);
    assert.equal(res.body.data.user.id, f.userId);
    assert.ok(res.body.data.tokens.accessToken);
    const me = await request(app).get('/api/v1/users/me').set(auth(res.body.data.tokens.accessToken)).expect(200);
    assert.equal(me.body.data.phone, f.phone);
    assert.ok((await prisma.user.findUniqueOrThrow({ where: { id: f.userId } })).lastLoginAt! >= before);
  });

  it('10. rejects wrong codes, does not reveal unknown numbers, and refuses suspended accounts', async () => {
    const f = await signedUpFarmer();
    const code = await loginCode(f.phone);
    const wrong = await request(app).post('/api/v1/auth/login').send({ phone: f.phone, otp: code === '123456' ? '654321' : '123456' }).expect(400);
    assert.equal(wrong.body.error.code, 'OTP_INVALID');

    const unknown = newPhone();
    const sentBefore = sms.sent.length;
    const known = await request(app).post('/api/v1/auth/send-otp').send({ phone: f.phone, purpose: 'LOGIN' }).expect(200);
    const res = await request(app).post('/api/v1/auth/send-otp').send({ phone: unknown, purpose: 'LOGIN' }).expect(200);
    assert.deepEqual(Object.keys(res.body.data).sort(), Object.keys(known.body.data).sort(), 'same response shape');
    assert.equal(res.body.data.message, known.body.data.message, 'same message for unknown numbers');
    assert.equal(sms.count(unknown), 0, 'no SMS for an unknown number');
    assert.equal(sms.sent.length, sentBefore + 1);
    const guess = await request(app).post('/api/v1/auth/login').send({ phone: unknown, otp: '123456' }).expect(400);
    assert.equal(guess.body.error.code, 'OTP_INVALID');

    const s = await signedUpFarmer();
    const sCode = await loginCode(s.phone);
    await prisma.user.update({ where: { id: s.userId }, data: { status: 'SUSPENDED' } });
    const suspended = await request(app).post('/api/v1/auth/login').send({ phone: s.phone, otp: sCode }).expect(403);
    assert.equal(suspended.body.error.code, 'ACCOUNT_NOT_ACTIVE');
    const blocked = await request(app).get('/api/v1/users/me').set(auth(s.accessToken)).expect(403);
    assert.equal(blocked.body.error.code, 'ACCOUNT_NOT_ACTIVE', 'existing tokens stop working too');
  });

  it('11. validates access tokens: signature, expiry, issuer/audience, type', async () => {
    const f = await signedUpFarmer();
    const secret = main.config.auth.jwtSecret!;
    await request(app).get('/api/v1/users/me').set(auth(f.accessToken)).expect(200);

    const [h, p, sig] = f.accessToken.split('.');
    const tampered = `${h}.${p}.${sig!.slice(0, -2)}${sig!.endsWith('AA') ? 'BB' : 'AA'}`;
    await request(app).get('/api/v1/users/me').set(auth(tampered)).expect(401);

    const claims = JSON.parse(Buffer.from(p!, 'base64url').toString()) as { fam: string };
    const sign = (exp: number, opts: { aud?: string; typ?: string; key?: Uint8Array } = {}) =>
      new SignJWT({ typ: opts.typ ?? 'access', fam: claims.fam }).setProtectedHeader({ alg: 'HS256' }).setSubject(f.userId)
        .setIssuer(JWT_ISSUER).setAudience(opts.aud ?? JWT_AUDIENCE).setIssuedAt(exp - 900).setExpirationTime(exp).sign(opts.key ?? secret);
    const now = Math.floor(Date.now() / 1000);
    await request(app).get('/api/v1/users/me').set(auth(await sign(now - 10))).expect(401); // expired
    await request(app).get('/api/v1/users/me').set(auth(await sign(now + 600, { aud: 'someone-else' }))).expect(401);
    await request(app).get('/api/v1/users/me').set(auth(await sign(now + 600, { typ: 'refresh' }))).expect(401);
    await request(app).get('/api/v1/users/me').set(auth(await sign(now + 600, { key: new TextEncoder().encode('x'.repeat(48)) }))).expect(401);
    const none = `${Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')}.${p}.`;
    await request(app).get('/api/v1/users/me').set(auth(none)).expect(401);
    await request(app).get('/api/v1/users/me').set(auth(f.refreshToken)).expect(401); // refresh token is not an access token
    await request(app).get('/api/v1/users/me').set(auth(await sign(now + 600))).expect(200); // control
  });

  it('12. rotates refresh tokens; re-using an old one revokes the whole sign-in', async () => {
    const f = await signedUpFarmer();
    const r1 = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: f.refreshToken }).expect(200);
    assert.notEqual(r1.body.data.refreshToken, f.refreshToken);
    await request(app).get('/api/v1/users/me').set(auth(r1.body.data.accessToken)).expect(200);
    const r2 = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: r1.body.data.refreshToken }).expect(200);

    const reuse = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: f.refreshToken }).expect(401);
    assert.equal(reuse.body.error.code, 'REFRESH_TOKEN_REUSED');
    await request(app).post('/api/v1/auth/refresh').send({ refreshToken: r2.body.data.refreshToken }).expect(401);
    await request(app).get('/api/v1/users/me').set(auth(r2.body.data.accessToken)).expect(401);
    const rows = await prisma.authSession.findMany({ where: { userId: f.userId }, select: { revokedReason: true } });
    assert.ok(rows.every((r) => r.revokedReason !== null), 'every session of the family is revoked');
    assert.ok(rows.some((r) => r.revokedReason === 'REUSE_DETECTED'));

    const expired = await signedUpFarmer();
    await prisma.authSession.updateMany({ where: { userId: expired.userId }, data: { createdAt: new Date(Date.now() - 10 * 86_400_000), expiresAt: new Date(Date.now() - 1000) } });
    await request(app).post('/api/v1/auth/refresh').send({ refreshToken: expired.refreshToken }).expect(401);
    await request(app).post('/api/v1/auth/refresh').send({ refreshToken: 'ks_rt_' + 'A'.repeat(43) }).expect(401);
  });

  it('13. logout revokes the refresh token and the access tokens of that sign-in', async () => {
    const f = await signedUpFarmer();
    const other = await request(app).post('/api/v1/auth/login').send({ phone: f.phone, otp: await loginCode(f.phone) }).expect(200);
    await request(app).post('/api/v1/auth/logout').send({ refreshToken: f.refreshToken }).expect(200);
    await request(app).get('/api/v1/users/me').set(auth(f.accessToken)).expect(401);
    await request(app).post('/api/v1/auth/refresh').send({ refreshToken: f.refreshToken }).expect(401);
    await request(app).get('/api/v1/users/me').set(auth(other.body.data.tokens.accessToken)).expect(200); // the other sign-in is unaffected
    await request(app).post('/api/v1/auth/logout').send({ refreshToken: f.refreshToken }).expect(200); // idempotent
  });

  it('14. rejects unauthenticated access to protected APIs', async () => {
    for (const [method, path] of [['get', '/api/v1/users/me'], ['patch', '/api/v1/users/me'], ['get', '/api/v1/farms'], ['get', '/api/v1/admin/users?phone=9876543210']] as const) {
      const res = await request(app)[method](path).send({});
      assert.equal(res.status, 401, path);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    }
    await request(app).get('/api/v1/users/me').set({ Authorization: 'Bearer not-a-token' }).expect(401);
  });
});

describe('roles, profile and protected fields (15–17)', () => {
  it('15. role-based authorisation reads roles from the database', async () => {
    const admin = await signedUpFarmer();
    const target = await signedUpFarmer();
    const denied = await request(app).get(`/api/v1/admin/users/${target.userId}`).set(auth(admin.accessToken)).expect(403);
    assert.equal(denied.body.error.code, 'FORBIDDEN');

    const adminRole = await prisma.role.findUniqueOrThrow({ where: { code: 'ADMIN' } });
    await prisma.userRole.create({ data: { userId: admin.userId, roleId: adminRole.id } });
    await request(app).get(`/api/v1/admin/users/${target.userId}`).set(auth(admin.accessToken)).expect(200); // same token, new DB role
    const found = await request(app).get(`/api/v1/admin/users?phone=${local(target.phone)}`).set(auth(admin.accessToken)).expect(200);
    assert.equal(found.body.data.id, target.userId);

    const granted = await request(app).post(`/api/v1/admin/users/${target.userId}/roles`).set(auth(admin.accessToken)).send({ role: 'CONTENT_EDITOR' }).expect(200);
    assert.deepEqual(granted.body.data.roles, ['CONTENT_EDITOR', 'FARMER']);
    const assignment = await prisma.userRole.findFirstOrThrow({ where: { userId: target.userId, roleId: (await prisma.role.findUniqueOrThrow({ where: { code: 'CONTENT_EDITOR' } })).id } });
    assert.equal(assignment.assignedById, admin.userId);
    // The editor still cannot manage roles.
    await request(app).post(`/api/v1/admin/users/${admin.userId}/roles`).set(auth(target.accessToken)).send({ role: 'ADMIN' }).expect(403);

    const own = await request(app).delete(`/api/v1/admin/users/${admin.userId}/roles/ADMIN`).set(auth(admin.accessToken)).expect(409);
    assert.equal(own.body.error.code, 'CANNOT_REMOVE_OWN_ADMIN');
    await request(app).delete(`/api/v1/admin/users/${target.userId}/roles/CONTENT_EDITOR`).set(auth(admin.accessToken)).expect(200);

    const device = await request(app).post('/api/v1/auth/device').send({ platform: 'android' }).expect(201);
    deviceUserIds.push(device.body.data.user.id);
    const dev = await request(app).post(`/api/v1/admin/users/${device.body.data.user.id}/roles`).set(auth(admin.accessToken)).send({ role: 'ADMIN' }).expect(409);
    assert.equal(dev.body.error.code, 'USER_NOT_VERIFIED', 'device accounts cannot hold privileged roles');
    await request(app).post(`/api/v1/admin/users/${target.userId}/roles`).set(auth(admin.accessToken)).send({ role: 'SUPERUSER' }).expect(400);

    await prisma.userRole.delete({ where: { userId_roleId: { userId: admin.userId, roleId: adminRole.id } } });
    await request(app).get(`/api/v1/admin/users/${target.userId}`).set(auth(admin.accessToken)).expect(403); // revoked immediately
  });

  it('16. returns and updates the profile', async () => {
    const f = await signedUpFarmer();
    const me = await request(app).get('/api/v1/users/me').set(auth(f.accessToken)).expect(200);
    assert.equal(me.body.data.phone, f.phone);
    assert.equal(me.body.data.phoneVerified, true);
    assert.equal(me.body.data.language, 'kn');
    assert.deepEqual(me.body.data.roles, ['FARMER']);

    const email = `farmer.${RUN}.${counter}@example.com`;
    const upd = await request(app).patch('/api/v1/users/me').set(auth(f.accessToken)).send({ fullName: 'Ravi K', email: email.toUpperCase(), language: 'hi' }).expect(200);
    assert.equal(upd.body.data.fullName, 'Ravi K');
    assert.equal(upd.body.data.email, email);
    assert.equal(upd.body.data.emailVerified, false);
    assert.equal(upd.body.data.language, 'hi');

    const other = await signedUpFarmer();
    const dup = await request(app).patch('/api/v1/users/me').set(auth(other.accessToken)).send({ email }).expect(409);
    assert.equal(dup.body.error.code, 'EMAIL_ALREADY_REGISTERED');
    await request(app).patch('/api/v1/users/me').set(auth(f.accessToken)).send({ email: null }).expect(200);
    await request(app).patch('/api/v1/users/me').set(auth(f.accessToken)).send({}).expect(400);
  });

  it('17. protected fields (role, status, phone, verification) cannot be changed through the profile', async () => {
    const f = await signedUpFarmer();
    const attempts = [
      { roles: ['ADMIN'] }, { role: 'ADMIN' }, { status: 'ACTIVE' }, { phone: '9123456789' },
      { phoneVerifiedAt: new Date().toISOString() }, { isDeviceAccount: true }, { id: '00000000-0000-0000-0000-000000000000' },
      { fullName: 'OK', status: 'SUSPENDED' },
    ];
    for (const body of attempts) {
      const res = await request(app).patch('/api/v1/users/me').set(auth(f.accessToken)).send(body).expect(400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR', JSON.stringify(body));
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: f.userId }, select: { fullName: true, status: true, phone: true, roles: { select: { role: { select: { code: true } } } } } });
    assert.equal(user.fullName, 'Test Farmer', 'nothing was changed, not even the allowed field');
    assert.equal(user.status, 'ACTIVE');
    assert.equal(user.phone, f.phone);
    assert.deepEqual(user.roles.map((r) => r.role.code), ['FARMER']);
  });
});

describe('device accounts, configuration and SMS', () => {
  it('upgrades the calling device account when it registers a phone (farms are kept)', async () => {
    const device = await request(app).post('/api/v1/auth/device').send({ platform: 'android' }).expect(201);
    const deviceId = device.body.data.user.id as string;
    deviceUserIds.push(deviceId);
    const farm = await request(app).post('/api/v1/farms').set(auth(device.body.data.token)).send({ name: 'Home field' }).expect(201);

    const phone = newPhone();
    const reg = await request(app).post('/api/v1/auth/register').set(auth(device.body.data.token)).send({ fullName: 'Lakshmi', phone }).expect(201);
    assert.equal(reg.body.data.upgradedDeviceAccount, true);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: deviceId } })).phone, null, 'phone set only after verification');
    const ver = await request(app).post('/api/v1/auth/verify-otp').send({ phone, otp: sms.lastCode(phone) }).expect(200);
    assert.equal(ver.body.data.user.id, deviceId, 'same account');

    const farms = await request(app).get('/api/v1/farms').set(auth(ver.body.data.tokens.accessToken)).expect(200);
    assert.ok(farms.body.data.some((x: { id: string }) => x.id === farm.body.data.id), 'farm data kept');
    const me = await request(app).get('/api/v1/users/me').set(auth(device.body.data.token)).expect(200);
    assert.equal(me.body.data.isDeviceAccount, false);
    assert.equal(me.body.data.phoneVerified, true);
  });

  it('answers 503 when no SMS provider is configured, and 502 when sending fails', async () => {
    const off = build({}, null);
    const res = await request(off.app).post('/api/v1/auth/register').send({ fullName: 'X', phone: newPhone() }).expect(503);
    assert.equal(res.body.error.code, 'OTP_UNAVAILABLE');
    await request(off.app).post('/api/v1/auth/send-otp').send({ phone: newPhone() }).expect(503);

    const failing = build();
    failing.sms.fail = true;
    const fail = await request(failing.app).post('/api/v1/auth/register').send({ fullName: 'X', phone: newPhone() }).expect(502);
    assert.equal(fail.body.error.code, 'OTP_SEND_FAILED');
  });

  it('configuration: production never uses the console sender; missing secrets disable phone sign-in', async () => {
    const base = { NODE_ENV: 'production', DATABASE_URL: 'postgresql://u:p@h/db', CORS_ALLOWED_ORIGINS: 'https://app.example' };
    assert.throws(() => loadConfig({ ...base, SMS_PROVIDER: 'console' }), (e: unknown) => e instanceof ConfigError && e.issues.some((i) => i.startsWith('SMS_PROVIDER')));
    assert.throws(() => loadConfig({ ...base, JWT_ACCESS_SECRET: 'short' }), ConfigError);
    const same = 'z'.repeat(40);
    assert.throws(() => loadConfig({ ...base, JWT_ACCESS_SECRET: same, OTP_HASH_SECRET: same }), ConfigError);
    const prod: AppConfig = loadConfig(base);
    assert.equal(prod.auth.smsProvider, 'none');
    assert.equal(prod.auth.jwtSecret, null);
    assert.equal(prod.auth.phoneAuthEnabled, false);
    const dev = loadConfig({ NODE_ENV: 'development', DATABASE_URL: 'postgresql://u:p@h/db' });
    assert.equal(dev.auth.ephemeralSecrets, true);
    assert.notDeepEqual(dev.auth.jwtSecret, loadConfig({ NODE_ENV: 'development', DATABASE_URL: 'postgresql://u:p@h/db' }).auth.jwtSecret, 'random, not hardcoded');
    await assert.rejects(new ConsoleSmsSender(logger, 'production').sendOtp({ to: '+919876543210', code: '123456', purpose: 'LOGIN', language: 'en', expiresInMinutes: 5 }));
  });
});
