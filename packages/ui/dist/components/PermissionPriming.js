import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PermissionPriming (CMP_PERMISSION_PRIMING, PDD §5.12) — explains the value of a permission
 * BEFORE the OS dialog (UX-4). The primary CTA is the ONLY control that should trigger the OS
 * prompt; "Not now" must never trigger it (the parent wires that). Fully screen-reader readable
 * before the dialog; CTAs ≥44/48. Tokens-only; variant is presentational (notification/location).
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';
export function PermissionPriming({ 
// `kind` is a presentational variant kept on the public props for callers; not read in render yet.
title, body, allowLabel, notNowLabel, onAllow, onNotNow, loading = false, testID, }) {
    const { theme } = useTheme();
    return (_jsxs(View, { accessibilityRole: "summary", testID: testID, style: {
            backgroundColor: theme.colors.surface.raised,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border.subtle,
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
        }, children: [_jsx(Text, { variant: "titleLarge", accessibilityRole: "header", children: title }), _jsx(Text, { variant: "bodyLarge", color: "secondary", children: body }), _jsxs(View, { style: { gap: theme.spacing.sm, paddingTop: theme.spacing.xs }, children: [_jsx(PrimaryButton, { label: allowLabel, onPress: onAllow, loading: loading, testID: testID ? `${testID}-allow` : undefined }), _jsx(Pressable, { onPress: onNotNow, accessibilityRole: "button", accessibilityLabel: notNowLabel, hitSlop: 8, style: { minHeight: 44, alignItems: 'center', justifyContent: 'center' }, testID: testID ? `${testID}-not-now` : undefined, children: _jsx(Text, { variant: "labelLarge", color: "brand", children: notNowLabel }) })] })] }));
}
//# sourceMappingURL=PermissionPriming.js.map