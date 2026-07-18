import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { PrimaryButton } from './PrimaryButton';

export interface CompletionMomentProps { title: string; body: string; continueLabel: string; onContinue: () => void; testID?: string; }

/** Dedicated calm outcome state; no confetti, automatic chime, or motion dependency. */
export function CompletionMoment({ title, body, continueLabel, onContinue, testID }: CompletionMomentProps) {
  const { theme } = useTheme();
  // Role + accessible on the text region only, so the completion announces as one alert while the
  // continue button stays an independently focusable sibling (no accessible-container collapse).
  return <View testID={testID} accessibilityLiveRegion="assertive" style={{ gap: theme.spacing.lg }}>
    <View accessible accessibilityRole="alert" style={{ gap: theme.spacing.sm }}><Text variant="titleLarge" color="onInverse">{title}</Text><Text variant="bodyLarge" color="onInverse">{body}</Text></View>
    <PrimaryButton label={continueLabel} onPress={onContinue} testID="ritual-completion-continue" />
  </View>;
}
