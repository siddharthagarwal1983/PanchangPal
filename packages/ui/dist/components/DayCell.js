import { jsx as _jsx } from "react/jsx-runtime";
import { Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function DayCell({ day, label, selected = false, today = false, onPress, testID }) {
    const { theme } = useTheme();
    return _jsx(Pressable, { testID: testID, onPress: onPress, accessibilityRole: "button", accessibilityLabel: label, accessibilityState: { selected }, style: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm, borderWidth: today ? theme.spacing.borderFocus : 0, borderColor: theme.colors.brand.primary, backgroundColor: selected ? theme.colors.brand.tonalBg : theme.colors.surface.primary }, children: _jsx(Text, { variant: "bodySmall", children: String(day) }) });
}
//# sourceMappingURL=DayCell.js.map