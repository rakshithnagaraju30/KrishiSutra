import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setApiLanguage } from '../api/client';
import { strings, type StringKey } from './strings';
import { LANGUAGES, type Lang, type LText } from './types';

const STORAGE_KEY = 'krishisutra.language';

type LanguageContextValue = {
  /** null until the user has chosen a language on first launch. */
  lang: Lang | null;
  ready: boolean;
  setLang: (lang: Lang) => void;
  /** Translate a UI string, replacing {placeholders} with values. */
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  /** Pick the current language from a localised text object. */
  l: (text: LText) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function fill(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value && (LANGUAGES as readonly string[]).includes(value)) {
          setLangState(value as Lang);
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const current: Lang = lang ?? 'en';
    setApiLanguage(current);
    return {
      lang,
      ready,
      setLang,
      t: (key, vars) => fill(strings[key][current], vars),
      l: (text) => text[current] || text.en,
    };
  }, [lang, ready, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
