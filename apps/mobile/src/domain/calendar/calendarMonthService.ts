/** Gregorian grid structure only. Panchang-derived event markers stay in CalendarProvider. */
export interface CalendarDayCellModel {
  key: string;
  day: number;
  date: string;
  isToday: boolean;
}

export interface CalendarMonthViewModel {
  monthKey: string;
  label: string;
  weekdayLabels: readonly string[];
  leadingBlankCells: number;
  days: readonly CalendarDayCellModel[];
}

export function toCalendarMonthView(month: Date, today: Date = new Date()): CalendarMonthViewModel {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const todayKey = toDateKey(today);
  const days = Array.from({ length: count }, (_, index) => {
    const value = new Date(start.getFullYear(), start.getMonth(), index + 1);
    const date = toDateKey(value);
    return { key: date, day: index + 1, date, isToday: date === todayKey };
  });
  return {
    monthKey: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
    label: new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(start),
    weekdayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    leadingBlankCells: start.getDay(),
    days,
  };
}

/** Shape CMP_MONTH_GRID consumes. Declared structurally so the domain stays UI-free. */
export interface MonthGridDayModel {
  key: string;
  day: number;
  date: string;
  today: boolean;
  label: string;
}

/**
 * Project month days onto the grid's contract.
 *
 * The domain says `isToday`; CMP_MONTH_GRID's prop is `today`. Spreading the day straight
 * into the component silently dropped the flag — the prop is optional, so it typechecked
 * cleanly and simply defaulted to false, leaving today's date unmarked in every month.
 * Translating explicitly here keeps the boundary honest and, unlike a spread buried in JSX,
 * makes it testable.
 */
export function toMonthGridDays(
  days: readonly CalendarDayCellModel[],
  labelForDate: (date: string) => string,
): MonthGridDayModel[] {
  return days.map((day) => ({
    key: day.key,
    day: day.day,
    date: day.date,
    today: day.isToday,
    label: labelForDate(day.date),
  }));
}

export function moveMonth(month: Date, offset: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + offset, 1);
}

function toDateKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}
