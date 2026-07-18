import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * CMP_PLAN_CARD (PDD §5 — Subscription Plan Card). Presents one plan (Individual/Family) with its
 * store-localized price + cadence and a CMP_VALUE_LIST of inclusions. The whole card is the select
 * control (≥44 target); the screen owns the purchase (native IAP via the PaymentAdapter) — this is
 * presentational only. "Best value" is conveyed as TEXT, never color alone (a11y). Prices are always
 * passed in from the store; the card never hardcodes a price. States: default / selected / loading.
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { ValueList } from './ValueList';
export function PlanCard({ id, name, priceLabel, periodLabel, benefits, includedLabel, excludedLabel, bestValueLabel, selected = false, loading = false, onSelect, testID, }) {
    const { theme } = useTheme();
    const style = {
        backgroundColor: theme.colors.surface.raised,
        borderRadius: theme.radius.lg,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? theme.colors.border.selected : theme.colors.border.subtle,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
        opacity: loading ? 0.6 : 1,
    };
    // SR reads name → best-value → price → inclusions (PDD a11y), inclusions announced per-item.
    const a11yLabel = [name, bestValueLabel, `${priceLabel} ${periodLabel}`].filter(Boolean).join(', ');
    return (_jsxs(Pressable, { onPress: () => onSelect(id), disabled: loading, accessibilityRole: "radio", accessibilityState: { selected, disabled: loading, busy: loading }, accessibilityLabel: a11yLabel, hitSlop: 8, style: style, testID: testID, children: [_jsxs(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }, children: [_jsx(Text, { variant: "titleLarge", color: "primary", accessibilityElementsHidden: true, importantForAccessibility: "no", children: name }), bestValueLabel ? (_jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no", style: {
                            backgroundColor: theme.colors.brand.brandSubtle,
                            borderRadius: theme.radius.sm,
                            paddingHorizontal: theme.spacing.sm,
                            paddingVertical: theme.spacing.xs,
                        }, testID: testID ? `${testID}-best-value` : undefined, children: _jsx(Text, { variant: "labelSmall", color: "brand", children: bestValueLabel }) })) : null] }), _jsxs(View, { style: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.xs }, children: [_jsx(Text, { variant: "headingLarge", color: "primary", accessibilityElementsHidden: true, importantForAccessibility: "no", children: priceLabel }), _jsx(Text, { variant: "bodyMedium", color: "secondary", accessibilityElementsHidden: true, importantForAccessibility: "no", children: periodLabel })] }), _jsx(ValueList, { items: benefits, includedLabel: includedLabel, excludedLabel: excludedLabel, testID: testID ? `${testID}-values` : undefined })] }));
}
//# sourceMappingURL=PlanCard.js.map