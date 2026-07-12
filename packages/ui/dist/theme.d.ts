/**
 * Theme context (TDD Part 4 §9.3). Exposes the resolved light/dark Theme from
 * @panchangpal/design-tokens and honors Reduced Motion. Components read tokens via
 * useTheme() — never hard-coded values (lint-enforced, TDD §5). The app wraps its tree
 * with <ThemeProvider>.
 */
import { type ReactNode } from 'react';
import { type Theme } from '@panchangpal/design-tokens';
export type Appearance = 'system' | 'light' | 'dark';
interface ThemeContextValue {
    theme: Theme;
    reducedMotion: boolean;
}
export declare function ThemeProvider({ children, appearance, reducedMotion, }: {
    children: ReactNode;
    appearance?: Appearance;
    reducedMotion?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function useTheme(): ThemeContextValue;
export {};
//# sourceMappingURL=theme.d.ts.map