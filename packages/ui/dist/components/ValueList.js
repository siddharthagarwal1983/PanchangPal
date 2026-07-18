import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * CMP_VALUE_LIST (PDD §5 — Value/Benefit List). A calm checkmark list of plan inclusions used by
 * CMP_PLAN_CARD and SCR_SUBSCRIPTION_001. Meaning is never color-only: every item carries a text
 * equivalent ("included" / "not included") so screen readers announce inclusion without relying on
 * the check glyph or its color (a11y, ADR-029). Static, tokens-only, no business logic.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function ValueList({ items, includedLabel, excludedLabel, testID }) {
    const { theme } = useTheme();
    return (_jsx(View, { style: { gap: theme.spacing.sm }, testID: testID, children: items.map((item) => {
            const included = item.included !== false;
            const equivalent = included ? includedLabel : excludedLabel;
            return (_jsxs(View, { accessibilityRole: "text", accessibilityLabel: `${item.label}, ${equivalent}`, style: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }, testID: `value-item-${item.id}`, children: [_jsx(Text, { variant: "bodyMedium", color: included ? 'primary' : 'tertiary', accessibilityElementsHidden: true, importantForAccessibility: "no", style: { color: included ? theme.colors.accent.positive : theme.colors.text.tertiary }, children: included ? '✓' : '—' }), _jsx(Text, { variant: "bodyMedium", color: included ? 'primary' : 'tertiary', accessibilityElementsHidden: true, importantForAccessibility: "no", style: { flex: 1 }, children: item.label })] }, item.id));
        }) }));
}
//# sourceMappingURL=ValueList.js.map