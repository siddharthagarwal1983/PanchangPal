/**
 * Deprecated shim. Theming now lives in @panchangpal/ui (TDD Part 4 §9.3); the app wraps
 * with its ThemeProvider (see src/providers/AppProviders.tsx). Re-exported here only to
 * avoid breaking any lingering import path. Prefer importing from '@panchangpal/ui'.
 */
export { ThemeProvider, useTheme } from '@panchangpal/ui';
