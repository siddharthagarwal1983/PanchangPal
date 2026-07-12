import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * BottomTabBar (CMP_BOTTOM_TAB_BAR) — the 4-tab primary navigation (UX-1: Today / Calendar
 * / Ask Guru / You). Presentational + accessible; wired to Expo Router's Tabs via the
 * `tabBar` render prop. Labels always visible (not icon-only, PDD §5.7 a11y); active =
 * brand color + filled state, inactive = muted; not color-only (filled vs outline marker);
 * ≥48 targets; role=tablist with per-tab selected state.
 */
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Text } from './Text';
export function BottomTabBar({ items }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    return (_jsx(View, { accessibilityRole: "tablist", style: {
            flexDirection: 'row',
            backgroundColor: theme.colors.surface.elevated,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.subtle,
            paddingBottom: insets.bottom,
            minHeight: 56 + insets.bottom,
        }, children: items.map((item) => (_jsxs(Pressable, { onPress: item.onPress, accessibilityRole: "tab", accessibilityState: { selected: item.focused }, accessibilityLabel: `${item.label}, tab`, testID: item.testID, style: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.sm }, children: [_jsx(Text, { variant: "labelSmall", style: { color: item.focused ? theme.colors.brand.primary : theme.colors.icon.muted }, children: item.focused ? '●' : '○' }), _jsx(Text, { variant: "labelSmall", style: { color: item.focused ? theme.colors.brand.primary : theme.colors.icon.muted }, children: item.label })] }, item.key))) }));
}
//# sourceMappingURL=BottomTabBar.js.map