/**
 * ProductionPanchangProvider — the real client provider. Calls API_GET_TODAY through the
 * TodayRepository. While the canonical panchang engine is blocked (ADR-033) the server
 * returns ERR_PANCHANG_UNAVAILABLE and this maps to { status: 'unavailable' } — it NEVER
 * fabricates panchang values. This is the ONLY provider production code wires (see
 * useToday); the dev mock is never imported here.
 */
import type { PanchangProvider, PanchangResult, TodayQuery } from './PanchangProvider';
import type { TodayRepository } from '../../data/todayRepository';

export class ProductionPanchangProvider implements PanchangProvider {
  constructor(private repo: TodayRepository) {}

  async getToday(q: TodayQuery): Promise<PanchangResult> {
    return this.repo.getToday(q);
  }
}
