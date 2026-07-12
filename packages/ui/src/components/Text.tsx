/**
 * Text — typography primitive bound to design tokens (PDD §6.1). All text in the app
 * goes through this so sizes/weights/colors are token-driven and Dynamic Type reflows
 * (no fixed-height text). Display family (Fraunces, P3-A3) is loaded in the Design System
 * task; until then it falls back to the platform serif/system face.
 */
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme';
import type { TypographyToken, ColorScheme } from '@panchangpal/design-tokens';

type TextColor = keyof ColorScheme['text'];

export interface TextProps extends RNTextProps {
  variant?: TypographyToken;
  color?: TextColor;
}

export function Text({ variant = 'bodyLarge', color = 'primary', style, ...rest }: TextProps) {
  const { theme } = useTheme();
  const t = theme.typography[variant];
  const resolved: TextStyle = {
    fontSize: t.fontSize,
    lineHeight: t.lineHeight,
    fontWeight: t.fontWeight,
    color: theme.colors.text[color],
  };
  return <RNText style={[resolved, style]} {...rest} />;
}
