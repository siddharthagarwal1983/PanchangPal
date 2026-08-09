/**
 * Theme context (TDD Part 4 §9.3). Exposes the resolved light/dark Theme from
 * @panchangpal/design-tokens and honors Reduced Motion. Components read tokens via
 * useTheme() — never hard-coded values (lint-enforced, TDD §5). The app wraps its tree
 * with <ThemeProvider>.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, type Theme, type ColorSchemeName } from '@panchangpal/design-tokens';

export type Appearance = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  reducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  appearance = 'system',
  reducedMotion = false,
}: {
  children: ReactNode;
  appearance?: Appearance;
  reducedMotion?: boolean;
}) {
  // ⚠️ RN 0.86 redefined `ColorSchemeName` as 'light' | 'dark' | 'unspecified' and made
  // `useColorScheme()` NON-NULLABLE — an unknown system scheme now returns the string
  // 'unspecified' rather than null. The previous `useColorScheme() ?? 'light'` therefore became
  // dead: the fallback could never fire, and 'unspecified' would have been passed to getTheme(),
  // which only knows 'light' | 'dark'. Narrowing explicitly restores the original intent (light
  // unless the system says dark) and no longer depends on a nullability that upstream removed.
  const system: ColorSchemeName = useColorScheme() === 'dark' ? 'dark' : 'light';
  const scheme: ColorSchemeName = appearance === 'system' ? system : appearance;
  const value = useMemo(() => ({ theme: getTheme(scheme), reducedMotion }), [scheme, reducedMotion]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a <ThemeProvider>');
  return ctx;
}
