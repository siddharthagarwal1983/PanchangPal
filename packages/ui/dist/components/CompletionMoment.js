import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';
/** Dedicated calm outcome state; no confetti, automatic chime, or motion dependency. */
export function CompletionMoment({ title, body, continueLabel, onContinue, testID }) {
    const { theme } = useTheme();
    return _jsxs(View, { testID: testID, accessibilityRole: "alert", accessibilityLiveRegion: "assertive", style: { gap: theme.spacing.lg }, children: [_jsxs(View, { style: { gap: theme.spacing.sm }, children: [_jsx(Text, { variant: "titleLarge", color: "onInverse", children: title }), _jsx(Text, { variant: "bodyLarge", color: "onInverse", children: body })] }), _jsx(PrimaryButton, { label: continueLabel, onPress: onContinue, testID: "ritual-completion-continue" })] });
}
//# sourceMappingURL=CompletionMoment.js.map