import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';

export interface CompletionMomentProps { title: string; body: string; continueLabel: string; onContinue: () => void; testID?: string; }

/** Dedicated calm outcome state; no confetti, automatic chime, or motion dependency. */
export function CompletionMoment({ title, body, continueLabel, onContinue, testID }: CompletionMomentProps) {
  const { theme } = useTheme();
  return <View testID={testID} accessibilityRole="alert" accessibilityLiveRegion="assertive" style={{ gap: theme.spacing.lg }}>
    <View style={{ gap: theme.spacing.sm }}><Text variant="titleLarge" color="onInverse">{title}</Text><Text variant="bodyLarge" color="onInverse">{body}</Text></View>
    <PrimaryButton label={continueLabel} onPress={onContinue} testID="ritual-completion-continue" />
  </View>;
}
