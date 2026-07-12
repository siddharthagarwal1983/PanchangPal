/**
 * SettingsRow (CMP_SETTINGS_ROW, PDD §5) — one labeled row in a settings/profile list:
 * a title, optional description, and an optional trailing slot (value text, chevron, or a
 * control such as CMP_TOGGLE). When `onPress` is set the whole row is a single ≥44 button
 * with a merged accessibility label; otherwise it is a static container that hosts its own
 * focusable control. Tokens-only; `danger` tints destructive entries (e.g. delete account).
 */
import type { ReactNode } from 'react';
import { View, Pressable, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface SettingsRowProps {
  title: string;
  description?: string;
  /** Right-aligned value shown when there is no `trailing` control (e.g. current choice). */
  value?: string;
  /** Interactive control rendered on the right (e.g. <Toggle />); focusable on its own. */
  trailing?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function SettingsRow({
  title,
  description,
  value,
  trailing,
  onPress,
  danger = false,
  disabled = false,
  testID,
}: SettingsRowProps) {
  const { theme } = useTheme();
  const titleColor = danger ? 'danger' : 'primary';

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    minHeight: 44,
    paddingVertical: theme.spacing.sm,
  };

  const content = (
    <>
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <Text variant="bodyLarge" color={titleColor}>
          {title}
        </Text>
        {description ? (
          <Text variant="bodySmall" color="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      {trailing ?? (value ? (
        <Text variant="labelMedium" color="secondary" numberOfLines={1}>
          {value}
        </Text>
      ) : null)}
    </>
  );

  if (onPress) {
    const label = value ? `${title}, ${value}` : title;
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={description}
        accessibilityState={{ disabled }}
        hitSlop={4}
        style={rowStyle}
        testID={testID}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={rowStyle} testID={testID}>
      {content}
    </View>
  );
}
