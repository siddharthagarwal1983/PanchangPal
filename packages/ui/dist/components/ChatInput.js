import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function ChatInput({ value, placeholder, sendLabel, disabled = false, disabledHint, onChangeText, onSend }) {
    const { theme } = useTheme();
    return _jsxs(View, { style: { gap: theme.spacing.sm }, children: [_jsxs(View, { style: { flexDirection: 'row', gap: theme.spacing.sm }, children: [_jsx(TextInput, { value: value, placeholder: placeholder, editable: !disabled, onChangeText: onChangeText, accessibilityLabel: placeholder, multiline: true, style: { flex: 1, minHeight: 44, borderColor: theme.colors.border.default, borderWidth: theme.spacing.borderFocus, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.sm, color: theme.colors.text.primary } }), _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: sendLabel, accessibilityState: { disabled }, disabled: disabled || value.trim().length === 0, onPress: onSend, style: { minHeight: 44, justifyContent: 'center', paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.brand.primary }, children: _jsx(Text, { variant: "labelMedium", color: "onBrand", children: sendLabel }) })] }), disabled && disabledHint ? _jsx(Text, { variant: "bodySmall", color: "secondary", children: disabledHint }) : null] });
}
//# sourceMappingURL=ChatInput.js.map