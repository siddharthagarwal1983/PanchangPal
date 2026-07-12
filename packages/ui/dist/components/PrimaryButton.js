import { jsx as _jsx } from "react/jsx-runtime";
/**
 * PrimaryButton (CMP_PRIMARY_BUTTON, PDD §5.2). 52/44pt height, brand fill, radius.md,
 * pressed/disabled/loading states, ≥44 target. Label is localized and passed in.
 */
import { Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function PrimaryButton({ label, onPress, loading = false, disabled = false, testID }) {
    const { theme } = useTheme();
    const isDisabled = disabled || loading;
    const style = {
        minHeight: 52,
        borderRadius: theme.radius.md,
        backgroundColor: isDisabled ? theme.colors.state.disabledBg : theme.colors.brand.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
    };
    return (_jsx(Pressable, { onPress: onPress, disabled: isDisabled, accessibilityRole: "button", accessibilityLabel: label, accessibilityState: { disabled: isDisabled, busy: loading }, hitSlop: 8, style: style, testID: testID, children: loading ? (_jsx(ActivityIndicator, { color: theme.colors.text.onBrand })) : (_jsx(Text, { variant: "labelLarge", style: { color: isDisabled ? theme.colors.state.disabledText : theme.colors.text.onBrand }, children: label })) }));
}
//# sourceMappingURL=PrimaryButton.js.map