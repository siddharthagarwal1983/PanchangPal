import { jsx as _jsx } from "react/jsx-runtime";
/**
 * ShareButton (CMP_SHARE_BUTTON, PDD §5) — opens the OS share sheet with an invite payload
 * (link / greeting). Uses the platform Share API so the sheet inherits native a11y. Any error
 * (e.g. user dismissal) is swallowed — sharing is best-effort and never blocks the flow.
 */
import { Pressable, Share } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function ShareButton({ message, url, label, onShared, testID }) {
    const { theme } = useTheme();
    const style = {
        minHeight: 44,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        flexDirection: 'row',
    };
    const onPress = async () => {
        try {
            await Share.share(url ? { message, url } : { message });
            onShared?.();
        }
        catch {
            // best-effort; dismissal or unavailable sheet is a no-op
        }
    };
    return (_jsx(Pressable, { onPress: onPress, accessibilityRole: "button", accessibilityLabel: label, hitSlop: 8, style: style, testID: testID, children: _jsx(Text, { variant: "labelLarge", color: "brand", children: label }) }));
}
//# sourceMappingURL=ShareButton.js.map