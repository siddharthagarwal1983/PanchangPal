/**
 * ErrorState — full-surface error with a calm message + optional retry (PDD §5 error state,
 * §12 fail-calm). Copy is passed in already mapped from an ERR_* code (never a raw error).
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  testID?: string;
}

export function ErrorState({ message, onRetry, retryLabel = 'Try again', testID }: ErrorStateProps) {
  const { theme } = useTheme();
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.xxl, gap: theme.spacing.md }}
      testID={testID}
    >
      {/* Role on the message Text (an a11y element) so it announces as an alert while the retry
          button stays an independently focusable sibling (no accessible-container collapse). */}
      <Text accessibilityRole="alert" variant="titleMedium" color="primary" style={{ textAlign: 'center' }}>
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          hitSlop={12}
          style={{
            minHeight: 44,
            paddingHorizontal: theme.spacing.lg,
            justifyContent: 'center',
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.brand.tonalBg,
          }}
        >
          <Text variant="labelLarge" color="brand">
            {retryLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
