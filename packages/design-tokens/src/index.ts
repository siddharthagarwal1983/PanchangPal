/**
 * @panchangpal/design-tokens — token values are the ONLY UI vocabulary (TDD §1.3).
 * Concrete values (color, spacing, type scale, motion durations) are defined in
 * PDD Part 3 §6 and land here as `tokens.ts` (P3-A2) during design-system setup.
 * This scaffold declares the token namespaces so packages/ui has a stable import.
 */
export interface DesignTokens {
  color: Record<string, string>;
  spacing: Record<string, number>;
  radius: Record<string, number>;
  duration: Record<string, number>;
  typography: Record<string, unknown>;
}

/** Placeholder — populated from PDD Part 3 §6 in the design-system task. */
export const tokens: DesignTokens = {
  color: {},
  spacing: {},
  radius: {},
  duration: {},
  typography: {},
};
