import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function SettingsRow({ title, description, value, trailing, onPress, danger = false, disabled = false, testID, }) {
    const { theme } = useTheme();
    const titleColor = danger ? 'danger' : 'primary';
    const rowStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        minHeight: 44,
        paddingVertical: theme.spacing.sm,
    };
    const content = (_jsxs(_Fragment, { children: [_jsxs(View, { style: { flex: 1, gap: theme.spacing.xs }, children: [_jsx(Text, { variant: "bodyLarge", color: titleColor, children: title }), description ? (_jsx(Text, { variant: "bodySmall", color: "secondary", children: description })) : null] }), trailing ?? (value ? (_jsx(Text, { variant: "labelMedium", color: "secondary", numberOfLines: 1, children: value })) : null)] }));
    if (onPress) {
        const label = value ? `${title}, ${value}` : title;
        return (_jsx(Pressable, { onPress: onPress, disabled: disabled, accessibilityRole: "button", accessibilityLabel: label, accessibilityHint: description, accessibilityState: { disabled }, hitSlop: 4, style: rowStyle, testID: testID, children: content }));
    }
    return (_jsx(View, { style: rowStyle, testID: testID, children: content }));
}
//# sourceMappingURL=SettingsRow.js.map