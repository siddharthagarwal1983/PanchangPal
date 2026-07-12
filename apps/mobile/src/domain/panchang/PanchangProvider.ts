/**
 * Client-side PanchangProvider abstraction (mirrors the frozen server PanchangEngine seam,
 * ADR-010/ADR-033). The Today feature depends ONLY on this interface — never on a concrete
 * engine or the dev mock. The production provider calls API_GET_TODAY; while the canonical
 * engine is blocked (ADR-033) the server returns ERR_PANCHANG_UNAVAILABLE, which surfaces as
 * the card's calm "unavailable" state (never fabricated values).
 */
import type { PanchangSummary } from '@panchangpal/ui';

export type PanchangResult =
  | { status: 'ok'; summary: PanchangSummary; festival?: { name: string; significance: string } | null }
  | { status: 'unavailable'; reason: 'ERR_PANCHANG_UNAVAILABLE' | 'ERR_OFFLINE' };

export interface TodayQuery {
  lat: number;
  lng: number;
  tz: string;
  tradition: string;
  localDate: string;
}

export interface PanchangProvider {
  getToday(q: TodayQuery): Promise<PanchangResult>;
}
