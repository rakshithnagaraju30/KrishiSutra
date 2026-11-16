import { z } from 'zod';
import { normaliseIndianMobile } from '../auth/phone.ts';
import { SUPPORTED_LANGUAGES } from '../utils/language.ts';

export const registerDeviceBody = z.object({
  platform: z.enum(['android', 'ios', 'web']).optional(),
  deviceLabel: z.string().trim().min(1).max(100).optional(),
  fullName: z.string().trim().min(1).max(150).optional(),
  language: z.enum(SUPPORTED_LANGUAGES).optional(),
});
export type RegisterDeviceBody = z.infer<typeof registerDeviceBody>;

export const updateMeBody = z
  .object({
    fullName: z.string().trim().min(1).max(150).optional(),
    language: z.enum(SUPPORTED_LANGUAGES).optional(),
  })
  .refine((v) => v.fullName !== undefined || v.language !== undefined, { message: 'Provide fullName or language' });
export type UpdateMeBody = z.infer<typeof updateMeBody>;

// ---------------------------------------------------------------- Part 3.2: phone OTP + JWT

/** Accepts common Indian formats and returns E.164 (+91XXXXXXXXXX). */
export const indianMobile = z
  .string({ error: 'is required' })
  .trim()
  .max(20, 'is too long')
  .transform((value, ctx) => {
    const e164 = normaliseIndianMobile(value);
    if (!e164) {
      ctx.addIssue({ code: 'custom', message: 'must be a valid Indian mobile number (10 digits starting with 6, 7, 8 or 9)' });
      return z.NEVER;
    }
    return e164;
  });
const otpCode = z.string({ error: 'is required' }).regex(/^\d{4,8}$/, 'must be the numeric code from the SMS');
const fullName = z.string().trim().min(1, 'is required').max(150);
const email = z.email('must be a valid email address').max(254).transform((v) => v.toLowerCase());
const platform = z.enum(['android', 'ios', 'web']).optional();
const refreshToken = z.string({ error: 'is required' }).min(1).max(200);

// .strict(): unknown fields (e.g. "role", "status") are rejected, never silently ignored.
export const registerBody = z.object({ fullName, phone: indianMobile, language: z.enum(SUPPORTED_LANGUAGES).optional(), email: email.optional() }).strict();
export const sendOtpBody = z.object({ phone: indianMobile, purpose: z.enum(['REGISTRATION', 'LOGIN']).default('LOGIN') }).strict();
export const verifyOtpBody = z.object({ phone: indianMobile, otp: otpCode, platform }).strict();
export const loginBody = z.object({ phone: indianMobile, otp: otpCode, platform }).strict();
export const refreshBody = z.object({ refreshToken }).strict();
export const logoutBody = z.object({ refreshToken }).strict();
export const updateProfileBody = z
  .object({ fullName: fullName.optional(), email: email.nullable().optional(), language: z.enum(SUPPORTED_LANGUAGES).optional() })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one of fullName, email, language' });

export const ROLE_CODES = ['FARMER', 'AGRI_EXPERT', 'CONTENT_EDITOR', 'ADMIN'] as const;
export const userIdParams = z.object({ id: z.uuid('must be a valid id') });
export const userRoleParams = z.object({ id: z.uuid('must be a valid id'), role: z.enum(ROLE_CODES) });
export const grantRoleBody = z.object({ role: z.enum(ROLE_CODES) }).strict();
export const findUserQuery = z.object({ phone: indianMobile });

export type RegisterBody = z.infer<typeof registerBody>;
export type SendOtpBody = z.infer<typeof sendOtpBody>;
export type VerifyOtpBody = z.infer<typeof verifyOtpBody>;
export type LoginBody = z.infer<typeof loginBody>;
export type UpdateProfileBody = z.infer<typeof updateProfileBody>;
