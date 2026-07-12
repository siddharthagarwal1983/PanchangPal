import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';
import { ProgressRing } from './ProgressRing';
import { AudioControls } from './AudioControls';
export function RitualStep({ text, current, total, progressLabel, nextLabel, skipLabel, playLabel, audioUnavailableLabel, audioAvailable, canSkip, onNext, onSkip, onPlayAudio, testID }) {
    const { theme } = useTheme();
    return _jsxs(View, { testID: testID, style: { gap: theme.spacing.lg }, children: [_jsx(ProgressRing, { current: current, total: total, label: progressLabel }), _jsx(Text, { variant: "bodyLarge", color: "onInverse", accessibilityLiveRegion: "polite", children: text }), _jsx(AudioControls, { available: audioAvailable, playLabel: playLabel, unavailableLabel: audioUnavailableLabel, onPlay: onPlayAudio }), _jsx(PrimaryButton, { label: nextLabel, onPress: onNext, testID: "ritual-next" }), canSkip ? _jsx(PrimaryButton, { label: skipLabel, onPress: onSkip, testID: "ritual-skip" }) : null] });
}
//# sourceMappingURL=RitualStep.js.map