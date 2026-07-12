import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function EmptyState({ title, body, action, testID }) {
    const { theme } = useTheme();
    return (_jsxs(View, { style: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.xxl, gap: theme.spacing.sm }, accessibilityRole: "summary", testID: testID, children: [_jsx(Text, { variant: "titleMedium", color: "primary", style: { textAlign: 'center' }, children: title }), body ? (_jsx(Text, { variant: "bodyMedium", color: "secondary", style: { textAlign: 'center' }, children: body })) : null, action ? _jsx(View, { style: { marginTop: theme.spacing.md }, children: action }) : null] }));
}
//# sourceMappingURL=EmptyState.js.map