import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';
export function RitualIntro({ title, body, beginLabel, onBegin, testID }) {
    const { theme } = useTheme();
    return _jsxs(View, { testID: testID, style: { gap: theme.spacing.lg }, accessibilityRole: "summary", children: [_jsxs(View, { style: { gap: theme.spacing.sm }, children: [_jsx(Text, { variant: "titleLarge", color: "onInverse", children: title }), body ? _jsx(Text, { variant: "bodyLarge", color: "onInverse", children: body }) : null] }), _jsx(PrimaryButton, { label: beginLabel, onPress: onBegin, testID: "ritual-begin" })] });
}
//# sourceMappingURL=RitualIntro.js.map