import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ConversationRow (CMP_CONVERSATION_ROW, PDD §5.6) — a past Ask Guru question in history. Shows
 * the question (truncated), an outcome label (grounded/declined/refused/error — text, not
 * color-only), and a timestamp. Whole row is a labeled ≥44 tap target that reopens the thread.
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function ConversationRow({ question, outcomeLabel, timeLabel, onPress, testID }) {
    const { theme } = useTheme();
    return (_jsxs(Pressable, { onPress: onPress, accessibilityRole: "button", accessibilityLabel: `${question}. ${outcomeLabel}. ${timeLabel}`, hitSlop: 8, testID: testID, style: {
            minHeight: 44,
            paddingVertical: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.subtle,
            gap: theme.spacing.xs,
        }, children: [_jsx(Text, { variant: "bodyLarge", color: "primary", numberOfLines: 2, children: question }), _jsxs(View, { style: { flexDirection: 'row', justifyContent: 'space-between' }, children: [_jsx(Text, { variant: "labelSmall", color: "secondary", children: outcomeLabel }), _jsx(Text, { variant: "labelSmall", color: "tertiary", children: timeLabel })] })] }));
}
//# sourceMappingURL=ConversationRow.js.map