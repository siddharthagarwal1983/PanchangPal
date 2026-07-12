import { jsx as _jsx } from "react/jsx-runtime";
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';
/** Declarative control; playback itself is supplied through the feature's AudioAdapter. */
export function AudioControls({ available, playLabel, unavailableLabel, onPlay, testID }) {
    const { theme } = useTheme();
    return _jsx(View, { testID: testID, style: { gap: theme.spacing.sm }, children: available ? _jsx(PrimaryButton, { label: playLabel, onPress: onPlay, testID: "ritual-audio-play" }) : _jsx(Text, { variant: "bodyMedium", color: "onInverse", accessibilityLiveRegion: "polite", children: unavailableLabel }) });
}
//# sourceMappingURL=AudioControls.js.map