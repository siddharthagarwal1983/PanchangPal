import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';
import type { CalendarMarkerDataSource, CalendarMonthQuery, CalendarMonthResult } from '../domain/calendar';

/** API_GET_CALENDAR gateway, reserved for use once the canonical calendar engine is available. */
export class CalendarRepository implements CalendarMarkerDataSource {
  constructor(private readonly db: SupabaseClient = getSupabase()) {}

  async getMonth(query: CalendarMonthQuery): Promise<CalendarMonthResult> {
    const { data, error } = await this.db.functions.invoke('panchang/calendar', { body: query });
    if (error || !data) return { status: 'unavailable', reason: 'ERR_CALENDAR_ERROR' };
    return normalizeCalendarMonth(data);
  }
}

export function normalizeCalendarMonth(data: unknown): CalendarMonthResult {
  if (!data || typeof data !== 'object') return { status: 'unavailable', reason: 'ERR_CALENDAR_ERROR' };
  const days = (data as { days?: unknown }).days;
  if (!Array.isArray(days)) return { status: 'unavailable', reason: 'ERR_CALENDAR_ERROR' };
  const markers = new Map<string, readonly string[]>();
  for (const day of days) {
    if (!day || typeof day !== 'object') continue;
    const value = day as { date?: unknown; markers?: unknown };
    if (typeof value.date === 'string' && Array.isArray(value.markers)) markers.set(value.date, value.markers.filter((marker): marker is string => typeof marker === 'string'));
  }
  return { status: 'available', markers };
}

let defaultRepository: CalendarRepository | null = null;

export function getCalendarRepository(): CalendarRepository {
  if (!defaultRepository) defaultRepository = new CalendarRepository();
  return defaultRepository;
}
