import { jsx as _jsx } from "react/jsx-runtime";
/**
 * OfflineBanner (CMP_INFO_BANNER, offline variant) — a slim, calm, non-blocking banner
 * shown when the device is offline (PDD §12 #1: "connect to use", never a dead end).
 * Neutral notice color (not alarming). Announced politely to screen readers.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function OfflineBanner({ label = "You're offline — showing saved content.", testID }) {
    const { theme } = useTheme();
    return (_jsx(View, { accessibilityRole: "alert", accessibilityLiveRegion: "polite", testID: testID, style: {
            backgroundColor: theme.colors.notice.neutral,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.gutter,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.subtle,
        }, children: _jsx(Text, { variant: "labelMedium", color: "secondary", children: label }) }));
}
//# sourceMappingURL=OfflineBanner.js.map