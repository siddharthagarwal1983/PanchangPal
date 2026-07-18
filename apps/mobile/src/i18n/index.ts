/**
 * i18n setup (TDD Part 4 §9.2). i18next + expo-localization; v1 en-US; ICU-ready; RTL-ready.
 * All strings are externalized keys — no literals in components. `t()` is the typed accessor
 * used across the shell.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { enUS } from './en-US';

void i18n.use(initReactI18next).init({
  resources: { 'en-US': { translation: enUS } },
  lng: getLocales()[0]?.languageTag ?? 'en-US',
  fallbackLng: 'en-US',
  interpolation: { escapeValue: false },
  returnNull: false,
  // Hermes ships only a partial Intl and lacks Intl.PluralRules, so i18next's v4 plural
  // resolver cannot initialize and logs a console error on every launch. v3 plural handling
  // is self-contained and correct for en-US (`_plural` suffix keys). Revisit when adding a
  // locale with more than two plural forms, which would need an Intl.PluralRules polyfill.
  compatibilityJSON: 'v3',
});

/** Typed translate helper. Dot-path keys, e.g. t('auth.title'). */
export function t(key: string, vars?: Record<string, string | number>): string {
  return i18n.t(key, vars) as string;
}

export default i18n;
