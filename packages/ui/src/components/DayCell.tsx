import { Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface DayCellProps { day: number; label: string; selected?: boolean; today?: boolean; onPress: () => void; testID?: string; }

export function DayCell({ day, label, selected = false, today = false, onPress, testID }: DayCellProps) {
  const { theme } = useTheme();
  return <Pressable testID={testID} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm, borderWidth: today ? theme.spacing.borderFocus : 0, borderColor: theme.colors.brand.primary, backgroundColor: selected ? theme.colors.brand.tonalBg : theme.colors.surface.primary }}><Text variant="bodySmall">{String(day)}</Text></Pressable>;
}
