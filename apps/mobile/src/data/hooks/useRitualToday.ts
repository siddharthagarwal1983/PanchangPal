import { useQuery } from '@tanstack/react-query';
import type { ContentDepth, TraditionCode } from '@panchangpal/shared';
import { ritualRepository } from '../ritualRepository';

/** Cached ritual text is available to the player offline; audio is an optional capability. */
export function useRitualToday(tradition: TraditionCode, depth: ContentDepth) {
  return useQuery({
    queryKey: ['ritual', tradition, depth],
    queryFn: () => ritualRepository.getToday(tradition, depth),
    staleTime: 60 * 60 * 1000,
  });
}
