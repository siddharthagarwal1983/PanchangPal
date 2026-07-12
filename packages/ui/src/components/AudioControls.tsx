import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';

export interface AudioControlsProps { available: boolean; playLabel: string; unavailableLabel: string; onPlay: () => void; testID?: string; }

/** Declarative control; playback itself is supplied through the feature's AudioAdapter. */
export function AudioControls({ available, playLabel, unavailableLabel, onPlay, testID }: AudioControlsProps) {
  const { theme } = useTheme();
  return <View testID={testID} style={{ gap: theme.spacing.sm }}>
    {available ? <PrimaryButton label={playLabel} onPress={onPlay} testID="ritual-audio-play" /> : <Text variant="bodyMedium" color="onInverse" accessibilityLiveRegion="polite">{unavailableLabel}</Text>}
  </View>;
}
