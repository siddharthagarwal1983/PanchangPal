import { jsx as _jsx } from "react/jsx-runtime";
/**
 * DestructiveAction (CMP_DESTRUCTIVE_ACTION, PDD §5) — a destructive CTA gated by an explicit
 * confirm. The button label states the consequence ("Delete account") and danger is conveyed by
 * the label + a danger-bordered surface, never color alone. Pressing it opens a native, focus-
 * trapped confirm (Alert) before `onConfirm` runs — the confirm stands in for CMP_DIALOG until
 * that atom exists. Disabled/loading states are supported (e.g. while a transfer is still required).
 */
import { Pressable, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function DestructiveAction({ label, confirmTitle, confirmBody, confirmLabel, cancelLabel, onConfirm, disabled = false, loading = false, testID, }) {
    const { theme } = useTheme();
    const isDisabled = disabled || loading;
    const style = {
        minHeight: 52,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: isDisabled ? theme.colors.border.subtle : theme.colors.border.danger,
        backgroundColor: theme.colors.surface.dangerSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        opacity: isDisabled ? 0.6 : 1,
    };
    const confirm = () => Alert.alert(confirmTitle, confirmBody, [
        { text: cancelLabel, style: 'cancel' },
        { text: confirmLabel, style: 'destructive', onPress: onConfirm },
    ]);
    return (_jsx(Pressable, { onPress: confirm, disabled: isDisabled, accessibilityRole: "button", accessibilityLabel: label, accessibilityState: { disabled: isDisabled, busy: loading }, hitSlop: 8, style: style, testID: testID, children: loading ? (_jsx(ActivityIndicator, { color: theme.colors.text.danger })) : (_jsx(Text, { variant: "labelLarge", color: "danger", children: label })) }));
}
//# sourceMappingURL=DestructiveAction.js.map