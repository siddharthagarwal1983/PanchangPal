import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Theme context (TDD Part 4 §9.3). Exposes the resolved light/dark Theme from
 * @panchangpal/design-tokens and honors Reduced Motion. Components read tokens via
 * useTheme() — never hard-coded values (lint-enforced, TDD §5). The app wraps its tree
 * with <ThemeProvider>.
 */
import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme } from '@panchangpal/design-tokens';
const ThemeContext = createContext(null);
export function ThemeProvider({ children, appearance = 'system', reducedMotion = false, }) {
    const system = useColorScheme() ?? 'light';
    const scheme = appearance === 'system' ? system : appearance;
    const value = useMemo(() => ({ theme: getTheme(scheme), reducedMotion }), [scheme, reducedMotion]);
    return _jsx(ThemeContext.Provider, { value: value, children: children });
}
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx)
        throw new Error('useTheme must be used within a <ThemeProvider>');
    return ctx;
}
//# sourceMappingURL=theme.js.map