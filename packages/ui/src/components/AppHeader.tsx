/**
 * AppHeader (CMP_APP_HEADER) — screen/app header (PDD §5.5). Title (titleLarge) with
 * optional leading (back) + trailing action slots, elevated surface + hairline on scroll.
 * Back affordance is a ≥44/48 target with an explicit label.
 */
import type { ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  trailing?: ReactNode;
  testID?: string;
}

export function AppHeader({ title, onBack, backLabel = 'Back', trailing, testID }: AppHeaderProps) {
  const { theme } = useTheme();
  return (
    <View
      accessibilityRole="header"
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 56,
        paddingHorizontal: theme.spacing.gutter,
        backgroundColor: theme.colors.surface.elevated,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.subtle,
        gap: theme.spacing.sm,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          hitSlop={12}
          style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
        >
          <Text variant="labelLarge" color="brand">
            ‹
          </Text>
        </Pressable>
      ) : null}
      <Text variant="titleLarge" color="primary" style={{ flex: 1 }} numberOfLines={1}>
        {title}
      </Text>
      {trailing ? <View>{trailing}</View> : null}
    </View>
  );
}
