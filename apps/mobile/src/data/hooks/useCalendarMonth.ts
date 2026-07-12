import { useQuery } from '@tanstack/react-query';
import type { TraditionCode } from '@panchangpal/shared';
import { ProductionCalendarProvider } from '../../domain/calendar';

const provider = new ProductionCalendarProvider();

/** Cached-first API_GET_CALENDAR seam. It deliberately returns unavailable until ADR-033. */
export function useCalendarMonth(month: string, tradition: TraditionCode) {
  return useQuery({ queryKey: ['calendar', month, tradition], queryFn: () => provider.getMonth({ month, tradition }), staleTime: 60 * 60 * 1000 });
}
