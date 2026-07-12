import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface MonthNavProps { label: string; previousLabel: string; nextLabel: string; todayLabel: string; onPrevious: () => void; onNext: () => void; onToday: () => void; testID?: string; }

export function MonthNav({ label, previousLabel, nextLabel, todayLabel, onPrevious, onNext, onToday, testID }: MonthNavProps) {
  const { theme } = useTheme();
  const button = { minHeight: 44, minWidth: 44, alignItems: 'center' as const, justifyContent: 'center' as const, paddingHorizontal: theme.spacing.sm };
  return <View testID={testID} accessibilityRole="header" accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }}>
    <Pressable accessibilityRole="button" accessibilityLabel={previousLabel} onPress={onPrevious} style={button} testID="calendar-previous"><Text variant="titleSmall">‹</Text></Pressable>
    <View style={{ alignItems: 'center', gap: theme.spacing.xs }}><Text variant="titleMedium" accessibilityLiveRegion="polite">{label}</Text><Pressable accessibilityRole="button" accessibilityLabel={todayLabel} onPress={onToday} style={button} testID="calendar-today"><Text variant="labelMedium" color="brand">{todayLabel}</Text></Pressable></View>
    <Pressable accessibilityRole="button" accessibilityLabel={nextLabel} onPress={onNext} style={button} testID="calendar-next"><Text variant="titleSmall">›</Text></Pressable>
  </View>;
}
