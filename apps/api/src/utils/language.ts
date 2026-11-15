/**
 * Response language: ?lang=kn, else the first supported tag in Accept-Language, else English.
 * Supported codes are the seeded Language rows (en, kn, hi, te, ta, ml).
 */
import type { Request } from 'express';

export const SUPPORTED_LANGUAGES = ['en', 'kn', 'hi', 'te', 'ta', 'ml'] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function resolveLanguage(req: Request): LanguageCode {
  const query = req.query.lang;
  if (isLanguageCode(query)) return query;
  const header = req.headers['accept-language'];
  if (typeof header === 'string') {
    for (const part of header.split(',')) {
      const code = part.split(';')[0]?.trim().toLowerCase().split('-')[0];
      if (isLanguageCode(code)) return code;
    }
  }
  return DEFAULT_LANGUAGE;
}
