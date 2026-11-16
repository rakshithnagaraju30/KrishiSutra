/**
 * One-time codes: generated with a CSPRNG, stored only as HMAC-SHA256(secret, phone|purpose|code),
 * compared in constant time.
 */
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

export function generateOtp(length: number): string {
  return String(randomInt(0, 10 ** length)).padStart(length, '0');
}

export function hashOtp(secret: string, phone: string, purpose: string, code: string): string {
  return createHmac('sha256', secret).update(`${phone}|${purpose}|${code}`).digest('hex');
}

export function otpMatches(secret: string, phone: string, purpose: string, code: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashOtp(secret, phone, purpose, code), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}
