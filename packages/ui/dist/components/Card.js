import { jsx as _jsx } from "react/jsx-runtime";
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
export function Card({ children, onPress, accessibilityLabel, muted = false, testID }) {
    const { theme } = useTheme();
    const style = {
        backgroundColor: muted ? theme.colors.surface.muted : theme.colors.surface.raised,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.subtle,
        padding: theme.spacing.lg,
    };
    if (onPress) {
        return (_jsx(Pressable, { onPress: onPress, accessibilityRole: "button", accessibilityLabel: accessibilityLabel, style: style, testID: testID, children: children }));
    }
    return (_jsx(View, { style: style, testID: testID, children: children }));
}
//# sourceMappingURL=Card.js.map