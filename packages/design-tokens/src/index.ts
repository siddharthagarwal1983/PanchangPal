/**
 * @panchangpal/design-tokens — concrete token values from PDD Part 3 §6 (the rank-5
 * source of truth for token values, §3.0A.1). Tokens are the ONLY UI vocabulary
 * (TDD §1.3); components read token names, never literal hex/px/durations.
 *
 * Note: type FAMILIES (P3-A3 Fraunces/system) and the AA audit (Part 5 §10, F-7/F-12/F-13)
 * are ratified in the Design System task; values below are the documented §6 set.
 */

// ---- Color (semantic, light + dark) — PDD §6.2 ------------------------------
export interface ColorScheme {
  brand: {
    primary: string;
    primaryPressed: string;
    tonalBg: string;
    brandSubtle: string;
  };
  accent: { auspicious: string; caution: string; positive: string; warm: string };
  surface: {
    primary: string;
    raised: string;
    elevated: string;
    muted: string;
    input: string;
    chip: string;
    immersive: string;
    inverse: string;
    brand: string;
    dangerSubtle: string;
    skeleton: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    placeholder: string;
    onBrand: string;
    onInverse: string;
    brand: string;
    danger: string;
  };
  border: { default: string; subtle: string; focus: string; selected: string; danger: string };
  state: { disabledBg: string; disabledText: string; pressOverlay: string; trackOff: string };
  icon: { default: string; muted: string };
  notice: { info: string; neutral: string; danger: string };
  scrim: string;
}

export const lightColors: ColorScheme = {
  brand: { primary: '#9C4221', primaryPressed: '#7E3319', tonalBg: '#F6E9DE', brandSubtle: '#FBF0E6' },
  accent: { auspicious: '#2F7A4F', caution: '#B4611A', positive: '#2F7A4F', warm: '#C2701F' },
  surface: {
    primary: '#FFFDF9', raised: '#FFFFFF', elevated: '#FFFFFF', muted: '#F7F2EA', input: '#FFFFFF',
    chip: '#F2ECE1', immersive: '#2A1E17', inverse: '#26201A', brand: '#FBF0E6',
    dangerSubtle: '#FBEAE8', skeleton: '#EFE7DA',
  },
  text: {
    primary: '#1F1B16', secondary: '#5C5348', tertiary: '#6E6456', placeholder: '#8A8073',
    onBrand: '#FFFFFF', onInverse: '#FDF7EF', brand: '#9C4221', danger: '#B3261E',
  },
  border: { default: '#E4DACB', subtle: '#EFE7DA', focus: '#9C4221', selected: '#9C4221', danger: '#B3261E' },
  state: { disabledBg: '#EDE6DB', disabledText: '#A79C8C', pressOverlay: 'rgba(31,27,22,0.06)', trackOff: '#D8CEBE' },
  icon: { default: '#3A322A', muted: '#7A7064' },
  notice: { info: '#EAF1EE', neutral: '#F2ECE1', danger: '#FBEAE8' },
  scrim: 'rgba(20,14,8,0.45)',
};

export const darkColors: ColorScheme = {
  brand: { primary: '#E08A4F', primaryPressed: '#C2701F', tonalBg: '#2A2018', brandSubtle: '#221A13' },
  accent: { auspicious: '#57B37E', caution: '#E0A45A', positive: '#57B37E', warm: '#E0A45A' },
  surface: {
    primary: '#16120E', raised: '#211B15', elevated: '#241E17', muted: '#1C1712', input: '#211B15',
    chip: '#2A231C', immersive: '#120D0A', inverse: '#F3ECE1', brand: '#16120E',
    dangerSubtle: '#2A1615', skeleton: '#241E17',
  },
  text: {
    primary: '#F3ECE1', secondary: '#C3B8A8', tertiary: '#9E9384', placeholder: '#8A8073',
    onBrand: '#1F1B16', onInverse: '#1F1B16', brand: '#E08A4F', danger: '#F2B8B5',
  },
  border: { default: '#3A3128', subtle: '#2C251E', focus: '#E08A4F', selected: '#E08A4F', danger: '#F2B8B5' },
  state: { disabledBg: '#2A231C', disabledText: '#6E6456', pressOverlay: 'rgba(255,255,255,0.08)', trackOff: '#4A4137' },
  icon: { default: '#E3D9CB', muted: '#9E9384' },
  notice: { info: '#1C2620', neutral: '#241E17', danger: '#2A1615' },
  scrim: 'rgba(0,0,0,0.6)',
};

// ---- Typography — PDD §6.1 ---------------------------------------------------
export interface TypeStyle { fontSize: number; lineHeight: number; fontWeight: '400' | '600' | '700'; family: 'display' | 'ui' }
export const typography = {
  displayLarge: { fontSize: 34, lineHeight: 40, fontWeight: '700', family: 'display' },
  displaySmall: { fontSize: 28, lineHeight: 34, fontWeight: '700', family: 'display' },
  headingLarge: { fontSize: 24, lineHeight: 30, fontWeight: '700', family: 'display' },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '600', family: 'display' },
  titleMedium: { fontSize: 18, lineHeight: 24, fontWeight: '600', family: 'ui' },
  titleSmall: { fontSize: 16, lineHeight: 22, fontWeight: '600', family: 'ui' },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400', family: 'ui' },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400', family: 'ui' },
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: '400', family: 'ui' },
  labelLarge: { fontSize: 16, lineHeight: 20, fontWeight: '600', family: 'ui' },
  labelMedium: { fontSize: 14, lineHeight: 18, fontWeight: '600', family: 'ui' },
  labelSmall: { fontSize: 12, lineHeight: 16, fontWeight: '600', family: 'ui' },
} as const satisfies Record<string, TypeStyle>;
export type TypographyToken = keyof typeof typography;

// ---- Spacing / radius / duration — PDD §6.3–6.6 -----------------------------
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, gutter: 16, borderFocus: 2 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;
export const duration = { fast: 120, base: 200, slow: 320, debounce: 250, splash: 1000, reducedCrossfade: 150 } as const;

// Minimum touch target (PDD §5 global rule): 44 (iOS) / 48 (Android).
export const minTouchTarget = { ios: 44, android: 48 } as const;

// ---- Theme ------------------------------------------------------------------
export type ColorSchemeName = 'light' | 'dark';
export interface Theme {
  scheme: ColorSchemeName;
  colors: ColorScheme;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  duration: typeof duration;
}

export function getTheme(scheme: ColorSchemeName): Theme {
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    typography,
    spacing,
    radius,
    duration,
  };
}
