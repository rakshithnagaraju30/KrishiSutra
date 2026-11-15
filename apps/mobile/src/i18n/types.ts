export const LANGUAGES = ['kn', 'hi', 'en'] as const;
export type Lang = (typeof LANGUAGES)[number];

/** Text in every supported language. */
export type LText = Record<Lang, string>;

export const LANGUAGE_NAMES: Record<Lang, string> = {
  kn: 'ಕನ್ನಡ',
  hi: 'हिन्दी',
  en: 'English',
};

/** BCP-47 tags used for device text-to-speech. */
export const SPEECH_LOCALES: Record<Lang, string> = {
  kn: 'kn-IN',
  hi: 'hi-IN',
  en: 'en-IN',
};
