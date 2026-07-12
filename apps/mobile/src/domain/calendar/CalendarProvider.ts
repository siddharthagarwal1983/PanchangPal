import type { TraditionCode } from '@panchangpal/shared';

export interface CalendarMonthQuery { month: string; tradition: TraditionCode; }
export type CalendarMonthResult = { status: 'available'; markers: ReadonlyMap<string, readonly string[]> } | { status: 'unavailable'; reason: 'ERR_CALENDAR_ERROR' | 'ERR_OFFLINE' | 'ERR_PANCHANG_UNAVAILABLE' };

export interface CalendarProvider { getMonth(query: CalendarMonthQuery): Promise<CalendarMonthResult>; }
export interface CalendarMarkerDataSource { getMonth(query: CalendarMonthQuery): Promise<CalendarMonthResult>; }

/** Frozen production seam: no calendar markers can be computed before ADR-033 is ratified. */
export class ProductionCalendarProvider implements CalendarProvider {
  async getMonth(_query: CalendarMonthQuery): Promise<CalendarMonthResult> {
    return { status: 'unavailable', reason: 'ERR_PANCHANG_UNAVAILABLE' };
  }
}
