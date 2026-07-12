import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';
import { ProgressRing } from './ProgressRing';
import { AudioControls } from './AudioControls';

export interface RitualStepProps { text: string; current: number; total: number; progressLabel: string; nextLabel: string; skipLabel: string; playLabel: string; audioUnavailableLabel: string; audioAvailable: boolean; canSkip: boolean; onNext: () => void; onSkip: () => void; onPlayAudio: () => void; testID?: string; }

export function RitualStep({ text, current, total, progressLabel, nextLabel, skipLabel, playLabel, audioUnavailableLabel, audioAvailable, canSkip, onNext, onSkip, onPlayAudio, testID }: RitualStepProps) {
  const { theme } = useTheme();
  return <View testID={testID} style={{ gap: theme.spacing.lg }}>
    <ProgressRing current={current} total={total} label={progressLabel} />
    <Text variant="bodyLarge" color="onInverse" accessibilityLiveRegion="polite">{text}</Text>
    <AudioControls available={audioAvailable} playLabel={playLabel} unavailableLabel={audioUnavailableLabel} onPlay={onPlayAudio} />
    <PrimaryButton label={nextLabel} onPress={onNext} testID="ritual-next" />
    {canSkip ? <PrimaryButton label={skipLabel} onPress={onSkip} testID="ritual-skip" /> : null}
  </View>;
}
