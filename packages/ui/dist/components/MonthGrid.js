import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import { DayCell } from './DayCell';
export function MonthGrid({ weekdayLabels, leadingBlankCells, days, selectedDate, onSelectDay, testID }) {
    const { theme } = useTheme();
    return _jsxs(View, { testID: testID, accessibilityLabel: "Calendar month grid", style: { gap: theme.spacing.sm }, children: [_jsx(View, { style: { flexDirection: 'row' }, children: weekdayLabels.map((day) => _jsx(View, { style: { flex: 1, alignItems: 'center' }, children: _jsx(Text, { variant: "labelSmall", color: "secondary", children: day }) }, day)) }), _jsxs(View, { style: { flexDirection: 'row', flexWrap: 'wrap', rowGap: theme.spacing.sm }, children: [Array.from({ length: leadingBlankCells }, (_, index) => _jsx(View, { style: { width: '14.2857%' } }, `blank-${index}`)), days.map((day) => _jsx(View, { style: { width: '14.2857%', paddingHorizontal: theme.spacing.xs / 2 }, children: _jsx(DayCell, { day: day.day, label: day.label, today: day.today, selected: selectedDate === day.key, onPress: () => onSelectDay(day.key), testID: `calendar-day-${day.key}` }) }, day.key))] })] });
}
//# sourceMappingURL=MonthGrid.js.map