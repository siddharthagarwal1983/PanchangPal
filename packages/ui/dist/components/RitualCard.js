import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * RitualCard (CMP_RITUAL_CARD, PDD §5.4) — today's ritual with a state-driven primary action.
 * state = not-started (Begin) | in-progress (Continue at step N) | completed (Done for today).
 * The completed state is calm (no confetti, P1). State is announced to the screen reader.
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Card } from './Card';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';
export function RitualCard({ title, descriptor, durationLabel, state, actionLabel, stateAnnouncement, onAction, testID }) {
    const { theme } = useTheme();
    const done = state === 'completed';
    return (_jsx(Card, { testID: testID, children: _jsxs(View, { accessibilityLabel: stateAnnouncement, style: { gap: theme.spacing.sm }, children: [_jsx(Text, { variant: "titleMedium", color: "primary", children: title }), _jsx(Text, { variant: "bodyMedium", color: "secondary", children: descriptor }), _jsx(Text, { variant: "labelSmall", color: "tertiary", children: durationLabel }), _jsx(View, { style: { marginTop: theme.spacing.sm }, children: done ? (_jsx(Text, { variant: "labelLarge", color: "brand", accessibilityRole: "text", children: actionLabel })) : (_jsx(PrimaryButton, { label: actionLabel, onPress: onAction ?? (() => { }), testID: "ritual-action" })) })] }) }));
}
//# sourceMappingURL=RitualCard.js.map