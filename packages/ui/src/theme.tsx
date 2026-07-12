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
  const system = useColorScheme() ?? 'light';
  const scheme: ColorSchemeName = appearance === 'system' ? system : appearance;
  const value = useMemo(() => ({ theme: getTheme(scheme), reducedMotion }), [scheme, reducedMotion]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a <ThemeProvider>');
  return ctx;
}
