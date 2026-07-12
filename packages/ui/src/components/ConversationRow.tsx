/**
 * ConversationRow (CMP_CONVERSATION_ROW, PDD §5.6) — a past Ask Guru question in history. Shows
 * the question (truncated), an outcome label (grounded/declined/refused/error — text, not
 * color-only), and a timestamp. Whole row is a labeled ≥44 tap target that reopens the thread.
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface ConversationRowProps {
  question: string;
  outcomeLabel: string;
  timeLabel: string;
  onPress: () => void;
  testID?: string;
}

export function ConversationRow({ question, outcomeLabel, timeLabel, onPress, testID }: ConversationRowProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${question}. ${outcomeLabel}. ${timeLabel}`}
      hitSlop={8}
      testID={testID}
      style={{
        minHeight: 44,
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.subtle,
        gap: theme.spacing.xs,
      }}
    >
      <Text variant="bodyLarge" color="primary" numberOfLines={2}>
        {question}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="labelSmall" color="secondary">
          {outcomeLabel}
        </Text>
        <Text variant="labelSmall" color="tertiary">
          {timeLabel}
        </Text>
      </View>
    </Pressable>
  );
}
