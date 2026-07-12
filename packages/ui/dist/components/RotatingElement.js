import { jsx as _jsx } from "react/jsx-runtime";
/**
 * RotatingElement (CMP_ROTATING_ELEMENT, PDD §5.5) — the daily quote/fact/on-this-day.
 * brandSubtle surface, body.large. Labeled "Today's reflection"; motion is decorative only
 * (Reduced-Motion → none). Never intrusive.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function RotatingElement({ text, label = "Today's reflection", testID }) {
    const { theme } = useTheme();
    return (_jsx(View, { accessibilityLabel: label, testID: testID, style: { backgroundColor: theme.colors.brand.brandSubtle, borderRadius: theme.radius.md, padding: theme.spacing.md }, children: _jsx(Text, { variant: "bodyLarge", color: "primary", children: text }) }));
}
//# sourceMappingURL=RotatingElement.js.map