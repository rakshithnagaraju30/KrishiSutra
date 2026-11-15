import { z } from 'zod';
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
