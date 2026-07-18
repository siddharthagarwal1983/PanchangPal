import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ErrorState — full-surface error with a calm message + optional retry (PDD §5 error state,
 * §12 fail-calm). Copy is passed in already mapped from an ERR_* code (never a raw error).
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function ErrorState({ message, onRetry, retryLabel = 'Try again', testID }) {
    const { theme } = useTheme();
    return (_jsxs(View, { style: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.xxl, gap: theme.spacing.md }, testID: testID, children: [_jsx(Text, { accessibilityRole: "alert", variant: "titleMedium", color: "primary", style: { textAlign: 'center' }, children: message }), onRetry ? (_jsx(Pressable, { onPress: onRetry, accessibilityRole: "button", accessibilityLabel: retryLabel, hitSlop: 12, style: {
                    minHeight: 44,
                    paddingHorizontal: theme.spacing.lg,
                    justifyContent: 'center',
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.brand.tonalBg,
                }, children: _jsx(Text, { variant: "labelLarge", color: "brand", children: retryLabel }) })) : null] }));
}
//# sourceMappingURL=ErrorState.js.map