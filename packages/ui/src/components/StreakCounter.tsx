/**
 * StreakCounter (CMP_STREAK_COUNTER, PDD §5.11) — gentle reinforcement (UX-3), NEVER the hero
 * (secondary placement on Home, AC-HOME-06). Grace-day aware with supportive copy — no
 * loss-framing. `accessibilityValue` announces "{n} day streak".
 */
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface StreakCounterProps {
  days: number;
  graceUsed?: boolean;
  label: string; // localized "{n} day streak"
  graceCopy?: string; // localized supportive line when grace was used
  onPress?: () => void;
  testID?: string;
}

export function StreakCounter({ days, graceUsed = false, label, graceCopy, onPress, testID }: StreakCounterProps) {
  const { theme } = useTheme();
  return (
    <View
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityValue={{ text: label }}
      onTouchEnd={onPress}
      testID={testID}
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}
    >
      <Text variant="labelMedium" style={{ color: theme.colors.accent.warm }}>
        ◆ {label}
      </Text>
      {graceUsed && graceCopy ? (
        <Text variant="labelSmall" color="tertiary">
          {graceCopy}
        </Text>
      ) : null}
    </View>
  );
}
