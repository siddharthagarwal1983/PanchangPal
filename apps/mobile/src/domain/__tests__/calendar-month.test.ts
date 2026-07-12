import { moveMonth, ProductionCalendarProvider, toCalendarMonthView } from '../calendar';
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
