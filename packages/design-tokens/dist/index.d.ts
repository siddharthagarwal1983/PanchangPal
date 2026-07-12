/**
 * @panchangpal/design-tokens — concrete token values from PDD Part 3 §6 (the rank-5
 * source of truth for token values, §3.0A.1). Tokens are the ONLY UI vocabulary
 * (TDD §1.3); components read token names, never literal hex/px/durations.
 *
 * Note: type FAMILIES (P3-A3 Fraunces/system) and the AA audit (Part 5 §10, F-7/F-12/F-13)
 * are ratified in the Design System task; values below are the documented §6 set.
 */
export interface ColorScheme {
    brand: {
        primary: string;
        primaryPressed: string;
        tonalBg: string;
        brandSubtle: string;
    };
    accent: {
        auspicious: string;
        caution: string;
        positive: string;
        warm: string;
    };
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
    border: {
        default: string;
        subtle: string;
        focus: string;
        selected: string;
        danger: string;
    };
    state: {
        disabledBg: string;
        disabledText: string;
        pressOverlay: string;
        trackOff: string;
    };
    icon: {
        default: string;
        muted: string;
    };
    notice: {
        info: string;
        neutral: string;
        danger: string;
    };
    scrim: string;
}
export declare const lightColors: ColorScheme;
export declare const darkColors: ColorScheme;
export interface TypeStyle {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | '600' | '700';
    family: 'display' | 'ui';
}
export declare const typography: {
    readonly displayLarge: {
        readonly fontSize: 34;
        readonly lineHeight: 40;
        readonly fontWeight: "700";
        readonly family: "display";
    };
    readonly displaySmall: {
        readonly fontSize: 28;
        readonly lineHeight: 34;
        readonly fontWeight: "700";
        readonly family: "display";
    };
    readonly headingLarge: {
        readonly fontSize: 24;
        readonly lineHeight: 30;
        readonly fontWeight: "700";
        readonly family: "display";
    };
    readonly titleLarge: {
        readonly fontSize: 22;
        readonly lineHeight: 28;
        readonly fontWeight: "600";
        readonly family: "display";
    };
    readonly titleMedium: {
        readonly fontSize: 18;
        readonly lineHeight: 24;
        readonly fontWeight: "600";
        readonly family: "ui";
    };
    readonly titleSmall: {
        readonly fontSize: 16;
        readonly lineHeight: 22;
        readonly fontWeight: "600";
        readonly family: "ui";
    };
    readonly bodyLarge: {
        readonly fontSize: 16;
        readonly lineHeight: 24;
        readonly fontWeight: "400";
        readonly family: "ui";
    };
    readonly bodyMedium: {
        readonly fontSize: 14;
        readonly lineHeight: 20;
        readonly fontWeight: "400";
        readonly family: "ui";
    };
    readonly bodySmall: {
        readonly fontSize: 13;
        readonly lineHeight: 18;
        readonly fontWeight: "400";
        readonly family: "ui";
    };
    readonly labelLarge: {
        readonly fontSize: 16;
        readonly lineHeight: 20;
        readonly fontWeight: "600";
        readonly family: "ui";
    };
    readonly labelMedium: {
        readonly fontSize: 14;
        readonly lineHeight: 18;
        readonly fontWeight: "600";
        readonly family: "ui";
    };
    readonly labelSmall: {
        readonly fontSize: 12;
        readonly lineHeight: 16;
        readonly fontWeight: "600";
        readonly family: "ui";
    };
};
export type TypographyToken = keyof typeof typography;
export declare const spacing: {
    readonly xs: 4;
    readonly sm: 8;
    readonly md: 16;
    readonly lg: 24;
    readonly xl: 32;
    readonly xxl: 48;
    readonly gutter: 16;
    readonly borderFocus: 2;
};
export declare const radius: {
    readonly sm: 8;
    readonly md: 12;
    readonly lg: 16;
    readonly xl: 24;
    readonly pill: 999;
};
export declare const duration: {
    readonly fast: 120;
    readonly base: 200;
    readonly slow: 320;
    readonly debounce: 250;
    readonly splash: 1000;
    readonly reducedCrossfade: 150;
};
export declare const minTouchTarget: {
    readonly ios: 44;
    readonly android: 48;
};
export type ColorSchemeName = 'light' | 'dark';
export interface Theme {
    scheme: ColorSchemeName;
    colors: ColorScheme;
    typography: typeof typography;
    spacing: typeof spacing;
    radius: typeof radius;
    duration: typeof duration;
}
export declare function getTheme(scheme: ColorSchemeName): Theme;
//# sourceMappingURL=index.d.ts.map