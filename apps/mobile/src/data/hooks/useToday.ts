/**
 * HOOK_useToday (TDD Part 4 §5.2) — cached-first Today panchang via TanStack Query
 * (< 500ms cached render, NFR-02; long staleTime for deterministic panchang). Depends on the
 * PanchangProvider abstraction, wired to the PRODUCTION provider (never the dev mock). While
 * the engine is blocked (ADR-033) the result is { status: 'unavailable' } and the card shows
 * the calm unavailable state — no fabricated values.
 */
import { useQuery } from '@tanstack/react-query';
import { ProductionPanchangProvider } from '../../domain/panchang/ProductionPanchangProvider';
import { todayRepository } from '../todayRepository';
import type { PanchangResult, TodayQuery } from '../../domain/panchang/PanchangProvider';

const provider = new ProductionPanchangProvider(todayRepository);

export function useToday(q: TodayQuery) {
  return useQuery<PanchangResult>({
    queryKey: ['today', q.localDate, `${q.lat.toFixed(1)},${q.lng.toFixed(1)}`, q.tradition],
    queryFn: () => provider.getToday(q),
    staleTime: 60 * 60 * 1000, // deterministic + cacheable (ADR-010)
  });
}
