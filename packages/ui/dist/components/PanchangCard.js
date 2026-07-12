import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PanchangCard (CMP_PANCHANG_CARD, PDD §5.4) — today's panchang summary. States:
 * default / loading (skeleton) / offline (cached + chip) / error (card-isolated micro-error
 * + retry) / unavailable (engine blocked, ADR-033 — a calm "temporarily unavailable", NEVER
 * fabricated values). The card-level error/unavailable is isolated so the rest of Home stays
 * usable (AC-HOME-04). SR reads date → location → tithi → nakshatra → festival.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Card } from './Card';
import { Text } from './Text';
import { Skeleton } from './Skeleton';
import { LocationChip } from './LocationChip';
export function PanchangCard({ data, loading = false, offline = false, unavailable = null, onPress, openLabel = "Today's panchang, open details", retryLabel = 'Try again', testID, }) {
    const { theme } = useTheme();
    if (loading) {
        return (_jsx(Card, { testID: testID, children: _jsxs(View, { style: { gap: theme.spacing.sm }, children: [_jsx(Skeleton, { width: "40%", height: 14 }), _jsx(Skeleton, { width: "70%", height: 26 }), _jsx(Skeleton, { width: "55%", height: 14 })] }) }));
    }
    if (unavailable || !data) {
        return (_jsx(Card, { testID: testID, children: _jsxs(View, { style: { gap: theme.spacing.sm }, accessibilityRole: "summary", children: [_jsx(Text, { variant: "labelMedium", color: "secondary", children: "Today's panchang" }), _jsx(Text, { variant: "titleMedium", color: "primary", children: unavailable?.message ?? 'Temporarily unavailable' }), unavailable?.onRetry ? (_jsx(Text, { variant: "labelLarge", color: "brand", onPress: unavailable.onRetry, accessibilityRole: "button", testID: "panchang-retry", children: retryLabel })) : null] }) }));
    }
    return (_jsx(Card, { onPress: onPress, accessibilityLabel: openLabel, testID: testID, children: _jsxs(View, { style: { gap: theme.spacing.sm }, children: [_jsxs(View, { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Text, { variant: "labelMedium", color: "secondary", children: data.dateLabel }), _jsx(LocationChip, { city: data.city })] }), _jsx(Text, { variant: "displaySmall", color: "primary", children: data.tithi }), _jsx(Text, { variant: "titleSmall", color: "secondary", children: data.nakshatra }), data.festivalHint ? (_jsx(Text, { variant: "bodyMedium", color: "brand", children: data.festivalHint })) : null, offline ? (_jsx(Text, { variant: "labelSmall", color: "tertiary", children: "Saved from your last connection" })) : null] }) }));
}
//# sourceMappingURL=PanchangCard.js.map