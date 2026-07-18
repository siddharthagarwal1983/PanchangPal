import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface ProgressRingProps { current: number; total: number; label: string; testID?: string; }

/** Token-bound progress presentation. Text and accessibilityValue ensure it is never color-only. */
export function ProgressRing({ current, total, label, testID }: ProgressRingProps) {
  const { theme } = useTheme();
  return <View testID={testID} accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 1, max: total, now: current, text: label }} style={{ borderRadius: theme.radius.pill, borderWidth: theme.spacing.borderFocus, borderColor: theme.colors.brand.primary, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, alignSelf: 'flex-start' }}>
    <Text variant="labelMedium" color="onInverse">{label}</Text>
  </View>;
}
