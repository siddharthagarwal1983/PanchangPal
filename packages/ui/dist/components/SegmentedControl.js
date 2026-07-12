import { jsx as _jsx } from "react/jsx-runtime";
/**
 * SegmentedControl (CMP_SEGMENTED, PDD §5) — a small set of mutually exclusive options
 * rendered as an accessible radio group (tradition, depth, appearance in Settings). Not
 * color-only: the selected segment carries `accessibilityState.selected` and a filled
 * surface. Each segment is a ≥44 target. Tokens-only; the parent owns the value.
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function SegmentedControl({ options, value, onChange, accessibilityLabel, disabled = false, testID, }) {
    const { theme } = useTheme();
    const container = {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface.muted,
        borderRadius: theme.radius.md,
        padding: theme.spacing.xs,
        gap: theme.spacing.xs,
    };
    return (_jsx(View, { style: container, accessibilityRole: "radiogroup", accessibilityLabel: accessibilityLabel, testID: testID, children: options.map((option) => {
            const selected = option.value === value;
            const segment = {
                flex: 1,
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: theme.spacing.sm,
                borderRadius: theme.radius.sm,
                backgroundColor: selected ? theme.colors.surface.raised : 'transparent',
                borderWidth: 1,
                borderColor: selected ? theme.colors.border.selected : 'transparent',
            };
            return (_jsx(Pressable, { onPress: () => onChange(option.value), disabled: disabled, accessibilityRole: "radio", accessibilityState: { selected, disabled }, accessibilityLabel: option.label, hitSlop: 4, style: segment, testID: testID ? `${testID}-${option.value}` : undefined, children: _jsx(Text, { variant: "labelMedium", color: selected ? 'brand' : 'secondary', numberOfLines: 1, children: option.label }) }, option.value));
        }) }));
}
//# sourceMappingURL=SegmentedControl.js.map