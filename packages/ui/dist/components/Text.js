import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Text — typography primitive bound to design tokens (PDD §6.1). All text in the app
 * goes through this so sizes/weights/colors are token-driven and Dynamic Type reflows
 * (no fixed-height text). Display family (Fraunces, P3-A3) is loaded in the Design System
 * task; until then it falls back to the platform serif/system face.
 */
import { Text as RNText } from 'react-native';
import { useTheme } from '../theme';
export function Text({ variant = 'bodyLarge', color = 'primary', style, ...rest }) {
    const { theme } = useTheme();
    const t = theme.typography[variant];
    const resolved = {
        fontSize: t.fontSize,
        lineHeight: t.lineHeight,
        fontWeight: t.fontWeight,
        color: theme.colors.text[color],
    };
    return _jsx(RNText, { style: [resolved, style], ...rest });
}
//# sourceMappingURL=Text.js.map