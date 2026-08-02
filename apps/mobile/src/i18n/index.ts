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
  // `compatibilityJSON: 'v3'` was removed here when i18next moved 23 → 26, which dropped the
  // option entirely (the type admits only 'v4'). It had been set because Hermes ships a partial
  // Intl without Intl.PluralRules, and the v4 resolver was said to fail at init on every launch.
  //
  // That reason does not survive v26, checked against the installed source and then tested against
  // a simulated partial-Intl engine rather than assumed. PluralResolver's constructor touches no
  // Intl at all (it only builds a cache); `new Intl.PluralRules(...)` is constructed lazily in
  // `getRule`, and if it throws, `getRule` catches and degrades to a dummy rule rather than
  // failing init. So there is no launch-time error on any engine.
  //
  // The plural path IS reached — `streak.label` and `household.memberCount` both pass `count`.
  // What makes that harmless is narrower: both use `count` purely as an INTERPOLATION variable
  // ('{{count}} day streak') and the bundle defines no `_one`/`_other` variants, so the suffixed
  // lookup misses and falls back to the base key whichever rule produced the suffix.
  //
  // THE CONDITION THAT INVALIDATES THIS is therefore a plural-suffixed KEY, not a `count` call
  // site. Adding one makes the rendered form depend on the plural rule, which on a Hermes without
  // Intl.PluralRules is i18next's `one`/`other` dummy — silently wrong for any locale with more
  // than two categories. Pinned by src/i18n/__tests__/pluralization.test.ts; if that test fails,
  // verify Intl.PluralRules on device and add @formatjs/intl-pluralrules if it is absent.
});

/** Typed translate helper. Dot-path keys, e.g. t('auth.title'). */
export function t(key: string, vars?: Record<string, string | number>): string {
  return i18n.t(key, vars) as string;
}

export default i18n;
