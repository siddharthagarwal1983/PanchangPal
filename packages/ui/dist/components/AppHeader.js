import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function AppHeader({ title, onBack, backLabel = 'Back', trailing, testID }) {
    const { theme } = useTheme();
    return (_jsxs(View, { accessibilityRole: "header", testID: testID, style: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 56,
            paddingHorizontal: theme.spacing.gutter,
            backgroundColor: theme.colors.surface.elevated,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.subtle,
            gap: theme.spacing.sm,
        }, children: [onBack ? (_jsx(Pressable, { onPress: onBack, accessibilityRole: "button", accessibilityLabel: backLabel, hitSlop: 12, style: { minWidth: 44, minHeight: 44, justifyContent: 'center' }, children: _jsx(Text, { variant: "labelLarge", color: "brand", children: "\u2039" }) })) : null, _jsx(Text, { variant: "titleLarge", color: "primary", style: { flex: 1 }, numberOfLines: 1, children: title }), trailing ? _jsx(View, { children: trailing }) : null] }));
}
//# sourceMappingURL=AppHeader.js.map