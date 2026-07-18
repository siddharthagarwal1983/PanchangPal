import { moveMonth, ProductionCalendarProvider, toCalendarMonthView, toMonthGridDays } from '../calendar';
import { normalizeCalendarMonth } from '../../data/calendarRepository';

describe('Calendar month shell domain', () => {
  it('creates an aligned Gregorian grid without spiritual event data', () => {
    const view = toCalendarMonthView(new Date(2026, 6, 1), new Date(2026, 6, 12));
    expect(view).toMatchObject({ monthKey: '2026-07', leadingBlankCells: 3 });
    expect(view.days).toHaveLength(31);
    expect(view.days.find((day) => day.day === 12)?.isToday).toBe(true);
  });

  it('moves across calendar month boundaries', () => {
    expect(toCalendarMonthView(moveMonth(new Date(2026, 0, 1), -1)).monthKey).toBe('2025-12');
  });

  it('keeps production calendar markers unavailable while ADR-033 is blocked', async () => {
    await expect(new ProductionCalendarProvider().getMonth({ month: '2026-07', tradition: 'generic' })).resolves.toMatchObject({ status: 'unavailable', reason: 'ERR_PANCHANG_UNAVAILABLE' });
  });

  it('normalizes repository marker data without inventing events', () => {
    const result = normalizeCalendarMonth({ days: [{ date: '2026-07-12', markers: ['festival', 1] }] });
    expect(result.status).toBe('available');
    if (result.status === 'available') expect(result.markers.get('2026-07-12')).toEqual(['festival']);
  });
});

describe('toMonthGridDays', () => {
  const labelFor = (date: string) => `label:${date}`;

  it("marks today using the grid's own prop name", () => {
    // Regression: the screen spread the domain day straight into CMP_MONTH_GRID, so the
    // domain's `isToday` never became the component's `today`. The prop is optional, so it
    // typechecked and silently defaulted to false — today was unmarked in every month.
    const view = toCalendarMonthView(new Date(2026, 6, 1), new Date(2026, 6, 19));
    const days = toMonthGridDays(view.days, labelFor);
    expect(days.filter((d) => d.today).map((d) => d.day)).toEqual([19]);
  });

  it('carries one entry per day, with keys and labels intact', () => {
    const view = toCalendarMonthView(new Date(2026, 6, 1), new Date(2026, 6, 19));
    const days = toMonthGridDays(view.days, labelFor);
    expect(days).toHaveLength(31);
    expect(days[0]).toMatchObject({ day: 1, key: '2026-07-01', label: 'label:2026-07-01', today: false });
  });

  it('marks nothing when today falls outside the month', () => {
    const view = toCalendarMonthView(new Date(2026, 6, 1), new Date(2026, 7, 3));
    expect(toMonthGridDays(view.days, labelFor).some((d) => d.today)).toBe(false);
  });
});
