/** SCR_CALENDAR_001 — declarative Calendar shell. Panchang-derived markers remain provider-owned. */
import { useState } from 'react';
import { View } from 'react-native';
import { Screen, AppHeader, MonthNav, MonthGrid, TraditionSwitcher, Text, Skeleton, useTheme } from '@panchangpal/ui';
import { TRADITION_CODES, type TraditionCode } from '@panchangpal/shared';
import { useOnline } from '../../../src/data/useOnline';
import { moveMonth, toCalendarMonthView } from '../../../src/domain/calendar';
import { useCalendarMonth } from '../../../src/data/hooks/useCalendarMonth';
import { usePrefsStore } from '../../../src/store/prefs';
import { t } from '../../../src/i18n';

const TRADITION_KEYS: Record<TraditionCode, string> = {
  generic: 'calendar.generic', north_indian: 'calendar.northIndian', south_indian_tamil: 'calendar.southIndianTamil', bengali: 'calendar.bengali',
};

export default function CalendarScreen() {
  const online = useOnline();
  const { theme } = useTheme();
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const tradition = usePrefsStore((state) => state.tradition);
  const setPrefs = usePrefsStore((state) => state.setPrefs);
  const view = toCalendarMonthView(month);
  const calendar = useCalendarMonth(view.monthKey, tradition);
  const formatMonth = (value: Date) => toCalendarMonthView(value).label;
  const labelForDate = (date: string) => new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`));

  return (
    <Screen offline={!online} scroll edges={['top']} testID="calendar-screen">
      <AppHeader title={t('tabs.calendar')} />
      <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
        <TraditionSwitcher label={t('calendar.tradition')} selected={tradition} options={TRADITION_CODES.map((value) => ({ value, label: t(TRADITION_KEYS[value]) }))} onSelect={(value) => setPrefs({ tradition: value as TraditionCode })} />
        <MonthNav label={view.label} previousLabel={t('calendar.previousMonth', { month: formatMonth(moveMonth(month, -1)) })} nextLabel={t('calendar.nextMonth', { month: formatMonth(moveMonth(month, 1)) })} todayLabel={t('calendar.today')} onPrevious={() => setMonth((value) => moveMonth(value, -1))} onNext={() => setMonth((value) => moveMonth(value, 1))} onToday={() => setMonth(new Date())} />
        {calendar.isLoading ? <Skeleton height={theme.spacing.xxl} /> : <MonthGrid weekdayLabels={view.weekdayLabels} leadingBlankCells={view.leadingBlankCells} days={view.days.map((day) => ({ ...day, label: labelForDate(day.date) }))} selectedDate={selectedDate} onSelectDay={setSelectedDate} />}
        {calendar.data?.status === 'unavailable' ? <View accessibilityRole="alert" style={{ gap: theme.spacing.xs }}><Text variant="bodyMedium">{t('calendar.unavailable')}</Text><Text variant="bodySmall" color="secondary">{t('calendar.unavailableDetail')}</Text></View> : null}
      </View>
    </Screen>
  );
}
