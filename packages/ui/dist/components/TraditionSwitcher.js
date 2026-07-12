import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function TraditionSwitcher({ selected, options, label, onSelect, testID }) {
    const { theme } = useTheme();
    return _jsxs(View, { testID: testID, accessibilityLabel: label, style: { gap: theme.spacing.sm }, children: [_jsx(Text, { variant: "labelMedium", children: label }), _jsx(View, { accessibilityRole: "menu", style: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }, children: options.map((option) => _jsx(Pressable, { accessibilityRole: "menuitem", accessibilityLabel: option.label, accessibilityState: { selected: option.value === selected }, onPress: () => onSelect(option.value), style: { minHeight: 44, justifyContent: 'center', paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: option.value === selected ? theme.colors.brand.tonalBg : theme.colors.surface.raised }, children: _jsx(Text, { variant: "labelMedium", children: option.label }) }, option.value)) })] });
}
//# sourceMappingURL=TraditionSwitcher.js.map