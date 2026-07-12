import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function GuruHeader({ title, trustLine }) {
    const { theme } = useTheme();
    return _jsxs(View, { accessibilityRole: "header", style: { gap: theme.spacing.xs }, children: [_jsx(Text, { variant: "titleLarge", children: title }), _jsx(Text, { variant: "bodyMedium", color: "secondary", children: trustLine })] });
}
//# sourceMappingURL=GuruHeader.js.map