import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { DayCell } from './DayCell';

export interface MonthGridDay { key: string; day: number; label: string; today?: boolean; }
export interface MonthGridProps { weekdayLabels: readonly string[]; leadingBlankCells: number; days: readonly MonthGridDay[]; selectedDate?: string | null; onSelectDay: (date: string) => void; testID?: string; }

export function MonthGrid({ weekdayLabels, leadingBlankCells, days, selectedDate, onSelectDay, testID }: MonthGridProps) {
  const { theme } = useTheme();
  return <View testID={testID} accessibilityLabel="Calendar month grid" style={{ gap: theme.spacing.sm }}>
    <View style={{ flexDirection: 'row' }}>{weekdayLabels.map((day) => <View key={day} style={{ flex: 1, alignItems: 'center' }}><Text variant="labelSmall" color="secondary">{day}</Text></View>)}</View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: theme.spacing.sm }}>
      {Array.from({ length: leadingBlankCells }, (_, index) => <View key={`blank-${index}`} style={{ width: '14.2857%' }} />)}
      {days.map((day) => <View key={day.key} style={{ width: '14.2857%', paddingHorizontal: theme.spacing.xs / 2 }}><DayCell day={day.day} label={day.label} today={day.today} selected={selectedDate === day.key} onPress={() => onSelectDay(day.key)} testID={`calendar-day-${day.key}`} /></View>)}
    </View>
  </View>;
}
