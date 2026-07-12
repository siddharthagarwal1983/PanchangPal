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

export type RitualState = 'not_started' | 'in_progress' | 'completed';

export interface RitualCardProps {
  title: string;
  descriptor: string;
  durationLabel: string;
  state: RitualState;
  /** Localized button label per state (Begin / Continue / done copy). */
  actionLabel: string;
  stateAnnouncement: string;
  onAction?: () => void;
  testID?: string;
}

export function RitualCard({ title, descriptor, durationLabel, state, actionLabel, stateAnnouncement, onAction, testID }: RitualCardProps) {
  const { theme } = useTheme();
  const done = state === 'completed';
  return (
    <Card testID={testID}>
      <View accessibilityLabel={stateAnnouncement} style={{ gap: theme.spacing.sm }}>
        <Text variant="titleMedium" color="primary">
          {title}
        </Text>
        <Text variant="bodyMedium" color="secondary">
          {descriptor}
        </Text>
        <Text variant="labelSmall" color="tertiary">
          {durationLabel}
        </Text>
        <View style={{ marginTop: theme.spacing.sm }}>
          {done ? (
            <Text variant="labelLarge" color="brand" accessibilityRole="text">
              {actionLabel}
            </Text>
          ) : (
            <PrimaryButton label={actionLabel} onPress={onAction ?? (() => {})} testID="ritual-action" />
          )}
        </View>
      </View>
    </Card>
  );
}
