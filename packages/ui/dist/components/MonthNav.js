import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function MonthNav({ label, previousLabel, nextLabel, todayLabel, onPrevious, onNext, onToday, testID }) {
    const { theme } = useTheme();
    const button = { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.sm };
    return _jsxs(View, { testID: testID, accessibilityRole: "header", accessibilityLabel: label, style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }, children: [_jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: previousLabel, onPress: onPrevious, style: button, testID: "calendar-previous", children: _jsx(Text, { variant: "titleSmall", children: "\u2039" }) }), _jsxs(View, { style: { alignItems: 'center', gap: theme.spacing.xs }, children: [_jsx(Text, { variant: "titleMedium", accessibilityLiveRegion: "polite", children: label }), _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: todayLabel, onPress: onToday, style: button, testID: "calendar-today", children: _jsx(Text, { variant: "labelMedium", color: "brand", children: todayLabel }) })] }), _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: nextLabel, onPress: onNext, style: button, testID: "calendar-next", children: _jsx(Text, { variant: "titleSmall", children: "\u203A" }) })] });
}
//# sourceMappingURL=MonthNav.js.map