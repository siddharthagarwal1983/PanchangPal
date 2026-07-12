/**
 * EmptyState (CMP_EMPTY_STATE) — calm, non-alarming empty state (PDD §5.13). Centered,
 * generous vertical rhythm (spacing.xxl), optional action slot.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface EmptyStateProps {
  title: string;
  body?: string;
  action?: ReactNode;
  testID?: string;
}

export function EmptyState({ title, body, action, testID }: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.xxl, gap: theme.spacing.sm }}
      accessibilityRole="summary"
      testID={testID}
    >
      <Text variant="titleMedium" color="primary" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {body ? (
        <Text variant="bodyMedium" color="secondary" style={{ textAlign: 'center' }}>
          {body}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: theme.spacing.md }}>{action}</View> : null}
    </View>
  );
}
