import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * StreakCounter (CMP_STREAK_COUNTER, PDD §5.11) — gentle reinforcement (UX-3), NEVER the hero
 * (secondary placement on Home, AC-HOME-06). Grace-day aware with supportive copy — no
 * loss-framing. `accessibilityValue` announces "{n} day streak".
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
export function StreakCounter({ days: _days, graceUsed = false, label, graceCopy, onPress, testID }) {
    const { theme } = useTheme();
    return (_jsxs(View, { accessibilityRole: onPress ? 'button' : 'text', accessibilityValue: { text: label }, onTouchEnd: onPress, testID: testID, style: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }, children: [_jsxs(Text, { variant: "labelMedium", style: { color: theme.colors.accent.warm }, children: ["\u25C6 ", label] }), graceUsed && graceCopy ? (_jsx(Text, { variant: "labelSmall", color: "tertiary", children: graceCopy })) : null] }));
}
//# sourceMappingURL=StreakCounter.js.map