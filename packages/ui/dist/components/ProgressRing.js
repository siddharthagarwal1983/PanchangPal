import { jsx as _jsx } from "react/jsx-runtime";
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
/** Token-bound progress presentation. Text and accessibilityValue ensure it is never color-only. */
export function ProgressRing({ current, total, label, testID }) {
    const { theme } = useTheme();
    return _jsx(View, { testID: testID, accessibilityRole: "progressbar", accessibilityLabel: label, accessibilityValue: { min: 1, max: total, now: current, text: label }, style: { borderRadius: theme.radius.pill, borderWidth: theme.spacing.borderFocus, borderColor: theme.colors.brand.primary, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, alignSelf: 'flex-start' }, children: _jsx(Text, { variant: "labelMedium", color: "onInverse", children: label }) });
}
//# sourceMappingURL=ProgressRing.js.map