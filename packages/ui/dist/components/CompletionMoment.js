import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';
/** Dedicated calm outcome state; no confetti, automatic chime, or motion dependency. */
export function CompletionMoment({ title, body, continueLabel, onContinue, testID }) {
    const { theme } = useTheme();
    // Role + accessible on the text region only, so the completion announces as one alert while the
    // continue button stays an independently focusable sibling (no accessible-container collapse).
    return _jsxs(View, { testID: testID, accessibilityLiveRegion: "assertive", style: { gap: theme.spacing.lg }, children: [_jsxs(View, { accessible: true, accessibilityRole: "alert", style: { gap: theme.spacing.sm }, children: [_jsx(Text, { variant: "titleLarge", color: "onInverse", children: title }), _jsx(Text, { variant: "bodyLarge", color: "onInverse", children: body })] }), _jsx(PrimaryButton, { label: continueLabel, onPress: onContinue, testID: "ritual-completion-continue" })] });
}
//# sourceMappingURL=CompletionMoment.js.map