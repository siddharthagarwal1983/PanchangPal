/**
 * Theme provider (TDD Part 4 §9.3). Exposes light/dark token values from
 * @panchangpal/design-tokens; Appearance = System/Light/Dark reads useColorScheme.
 * No hard-coded colors/spacing/durations anywhere else (lint-enforced, TDD §5).
 * Token values are populated from PDD Part 3 §6 in the design-system task.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { tokens, type DesignTokens } from '@panchangpal/design-tokens';

type Appearance = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  tokens: DesignTokens;
  scheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue>({ tokens, scheme: 'light' });

export function ThemeProvider({
  children,
  appearance = 'system',
}: {
  children: ReactNode;
  appearance?: Appearance;
}) {
  const system = useColorScheme() ?? 'light';
  const scheme = appearance === 'system' ? system : appearance;
  return <ThemeContext.Provider value={{ tokens, scheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
