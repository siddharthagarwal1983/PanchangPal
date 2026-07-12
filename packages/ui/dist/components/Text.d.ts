/**
 * Text — typography primitive bound to design tokens (PDD §6.1). All text in the app
 * goes through this so sizes/weights/colors are token-driven and Dynamic Type reflows
 * (no fixed-height text). Display family (Fraunces, P3-A3) is loaded in the Design System
 * task; until then it falls back to the platform serif/system face.
 */
import { type TextProps as RNTextProps } from 'react-native';
import type { TypographyToken, ColorScheme } from '@panchangpal/design-tokens';
type TextColor = keyof ColorScheme['text'];
export interface TextProps extends RNTextProps {
    variant?: TypographyToken;
    color?: TextColor;
}
export declare function Text({ variant, color, style, ...rest }: TextProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Text.d.ts.map