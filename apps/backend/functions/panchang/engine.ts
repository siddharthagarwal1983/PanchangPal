/**
 * PanchangEngine — abstract provider interface (ADR-010).
 *
 * ⚠️ THE ONLY BLOCKED COMPONENT IN THE BACKEND. The deterministic astronomical
 * algorithm (ephemeris; tithi/nakshatra/yoga/karana; sunrise/sunset; muhurta; Rahu
 * Kaal) is NOT specified in any MRD/PRD/PDD/TDD and MUST NOT be invented — a wrong
 * tithi destroys trust (MRD Risk §1). See the architecture work item
 * "Canonical Panchang Computation Engine" (ADR-033 [Proposed] +
 * docs/architecture/canonical-panchang-engine/) which decides the ephemeris, ayanamsa,
 * traditions, methodology, validation dataset, and acceptance tolerances.
 *
 * Everything else in the backend depends ONLY on this interface. When the decision is
 * approved, add a concrete implementation (e.g. SwissEphemerisPanchangEngine) and inject
 * it; no caller changes are needed.
 */
import type { TraditionCode } from '@panchangpal/shared';

export interface PanchangInput {
  instant: string; // ISO-8601 UTC
  lat: number;
  lng: number;
  tz: string; // IANA
  tradition: TraditionCode;
}

export interface PanchangResult {
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  muhurta: { name: string; state: string; label: string }[];
  rahu_kaal: string;
}

/** Recurrence query for personal-date tithi (SVC_panchang / personal dates). */
export interface TithiRecurrenceInput {
  tithi: { paksha: string; month: string; tithi: string };
  fromDate: string; // ISO date
  tz: string;
}

export interface PanchangEngine {
  /** Engine version stamped into panchang_cache (ADR-010); bump invalidates cache. */
  readonly engineVersion: string;
  compute(input: PanchangInput): PanchangResult;
  /** Next occurrence(s) of a tithi; returns dual candidates on ambiguity (ERR_TITHI_AMBIGUOUS). */
  nextTithiOccurrence(input: TithiRecurrenceInput): { next_occurrence: string; candidates?: string[] };
}

/** Thrown by the placeholder engine until the canonical engine is approved + implemented. */
export class PanchangEngineUnavailableError extends Error {
  constructor() {
    super(
      'Panchang engine not available: blocked on the "Canonical Panchang Computation Engine" decision (ADR-033, Proposed). Do not implement astronomical calculations until approved.',
    );
    this.name = 'PanchangEngineUnavailableError';
  }
}

/**
 * The ONLY registered engine until the decision lands. It satisfies the interface so the
 * whole backend compiles and runs, but every compute call fails closed (never fabricates).
 */
export const unimplementedPanchangEngine: PanchangEngine = {
  engineVersion: 'panchang-v0-unimplemented',
  compute() {
    throw new PanchangEngineUnavailableError();
  },
  nextTithiOccurrence() {
    throw new PanchangEngineUnavailableError();
  },
};
