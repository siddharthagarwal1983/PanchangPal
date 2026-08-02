/**
 * Proves the copy that passes `count` still renders correctly on a JS engine WITHOUT
 * Intl.PluralRules — which is what made it safe to drop `compatibilityJSON: 'v3'` when i18next
 * moved 23 → 26 and removed the option (see ../index.ts).
 *
 * WHY THIS IS NOT OBVIOUS, and why it is tested against a simulated engine rather than argued:
 * two call sites do pass `count` — `t('streak.label', { count })` and
 * `t('household.memberCount', { count })` — so i18next's plural path IS reached, and
 * `new Intl.PluralRules(...)` IS constructed. Hermes ships a partial Intl, and the previous
 * `compatibilityJSON: 'v3'` setting existed precisely because of that.
 *
 * What makes it safe is narrower than "pluralization is unused": both keys use `count` only as an
 * INTERPOLATION variable ('{{count}} day streak'), and the bundle defines no `_one`/`_other`
 * variants — so the suffixed lookup misses and i18next falls back to the base key, whichever rule
 * produced the suffix. `household.tsx` additionally branches on `n === 1` itself.
 *
 * The failure mode this guards is silent. Add a `_one`/`_other` pair and the suffixed lookup starts
 * HITTING, so the rendered form comes from the plural rule; where Intl.PluralRules is missing,
 * `getRule` catches and substitutes a dummy rule with no error surfaced to the telemetry seam.
 * For en-US the dummy rule happens to agree with the real one (`one` iff count === 1), so the
 * damage there is limited to whichever form the new key defines — but the dummy rule offers ONLY
 * `one`/`other`, so the first locale with more than two categories (Polish, Arabic, Russian)
 * renders the wrong form outright. Both are silent: no crash, just incorrect copy.
 *
 * If this fails, do NOT relax the assertion. Verify Intl.PluralRules on device and add
 * `@formatjs/intl-pluralrules` if it is absent.
 */
import { createInstance, type i18n as I18nInstance } from 'i18next';
import { enUS } from '../en-US';

/** The init options ../index.ts uses, minus the react-i18next binding and device locale lookup. */
function newInstance(): I18nInstance {
  const instance = createInstance();
  void instance.init({
    resources: { 'en-US': { translation: enUS } },
    lng: 'en-US',
    fallbackLng: 'en-US',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  return instance;
}

/** Runs `fn` with Intl.PluralRules removed, as on a Hermes build that lacks it. */
function withoutIntlPluralRules<T>(fn: () => T): T {
  const original = Intl.PluralRules;
  // @ts-expect-error — deliberately simulating a partial Intl, which is the whole point.
  delete Intl.PluralRules;
  try {
    return fn();
  } finally {
    Intl.PluralRules = original;
  }
}

describe.each([
  ['with Intl.PluralRules (Node, and Hermes where present)', <T,>(fn: () => T) => fn()],
  ['without Intl.PluralRules (partial-Intl Hermes)', withoutIntlPluralRules],
])('count-bearing copy renders correctly %s', (_label, run) => {
  it('interpolates streak.label rather than resolving a plural form', () => {
    run(() => {
      const t = newInstance().t;
      expect(t('streak.label', { count: 5 })).toBe('5 day streak');
      expect(t('streak.label', { count: 1 })).toBe('1 day streak');
      expect(t('streak.label', { count: 0 })).toBe('0 day streak');
    });
  });

  it('interpolates household.memberCount rather than resolving a plural form', () => {
    run(() => {
      const t = newInstance().t;
      expect(t('household.memberCount', { count: 4 })).toBe('4 members');
    });
  });
});

describe('the bundle defines no plural-suffixed key', () => {
  // The condition above holds only while this does. A `_one`/`_other` pair would make the
  // suffixed lookup HIT, at which point the rendered form depends on the plural rule — and on a
  // partial-Intl engine that silently becomes i18next's dummy rule.
  const PLURAL_SUFFIXES = ['plural', 'zero', 'one', 'two', 'few', 'many', 'other'];

  it('so a suffixed lookup always misses and falls back to the base key', () => {
    const keys: string[] = [];
    const walk = (node: unknown, prefix: string): void => {
      if (typeof node !== 'object' || node === null) return;
      for (const [key, value] of Object.entries(node)) {
        keys.push(key);
        walk(value, `${prefix}${key}.`);
      }
    };
    walk(enUS, '');

    // `memberCountOne` is deliberately NOT a match: i18next's suffix separator is `_`, so a
    // camelCase key it can never generate is the app pluralizing by hand, which is the point.
    expect(
      keys.filter((k) => PLURAL_SUFFIXES.some((s) => k.toLowerCase().endsWith(`_${s}`))),
    ).toEqual([]);
  });
});
