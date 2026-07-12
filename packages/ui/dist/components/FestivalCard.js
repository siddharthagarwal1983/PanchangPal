import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * FestivalCard (CMP_FESTIVAL_CARD, PDD §5.4) — today's festival (conditional; hidden if none).
 * Regional name + one-line significance; taps to detail. Illustration is decorative.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Card } from './Card';
import { Text } from './Text';
export function FestivalCard({ name, significance, onPress, openLabel, testID }) {
    const { theme } = useTheme();
    return (_jsx(Card, { onPress: onPress, accessibilityLabel: openLabel ?? `Festival today, ${name}, open details`, testID: testID, children: _jsxs(View, { style: { gap: theme.spacing.xs }, children: [_jsx(Text, { variant: "titleSmall", color: "primary", children: name }), _jsx(Text, { variant: "bodyMedium", color: "secondary", children: significance })] }) }));
}
//# sourceMappingURL=FestivalCard.js.map