import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';
import type { CalendarMarkerDataSource, CalendarMonthQuery, CalendarMonthResult } from '../domain/calendar';

/** API_GET_CALENDAR gateway, reserved for use once the canonical calendar engine is available. */
export class CalendarRepository implements CalendarMarkerDataSource {
  private _db?: SupabaseClient;

  // Lazy client. `getSupabase()` as a default parameter is evaluated at CONSTRUCTION, which
  // for a module-level singleton means at import — so an absent EXPO_PUBLIC_SUPABASE_URL threw
  // "supabaseUrl is required." while a route module was still evaluating, and expo-router
  // then reported "Page could not be found" instead of a calm error state. It also made these
  // repositories untestable, since importing one detonated. Resolve on first real use.
  constructor(db?: SupabaseClient) {
    this._db = db;
  }

  private get db(): SupabaseClient {
    return (this._db ??= getSupabase());
  }

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
