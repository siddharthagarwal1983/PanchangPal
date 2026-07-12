/**
 * ⚠️ DOCUMENTATION GAP — panchang astronomical engine.
 *
 * ADR-010 mandates a DETERMINISTIC panchang engine (pure function of instant, lat/lng,
 * tz, tradition, versioned by engine_version) validated against Drik Panchang / mPanchang
 * and paid reviewers (MRD Risk §1). However, the actual astronomical ALGORITHM (ephemeris,
 * tithi/nakshatra/yoga/karana derivation, sunrise/sunset, muhurta, Rahu Kaal) is NOT
 * specified in any TDD/PDD/MRD document. A wrong tithi destroys trust, so it must NOT be
 * invented here.
 *
 * This seam defines the pure contract the engine must satisfy. Implementation is BLOCKED
 * pending the approved algorithm/ephemeris source (e.g. a vetted Swiss Ephemeris-based
 * computation) + the reviewer-validation harness. Flagged to the product/architecture owner.
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

export const ENGINE_VERSION = 'panchang-v0-unimplemented';

/** BLOCKED: requires the approved, reviewer-validated astronomical algorithm (see file header). */
export function computePanchang(_input: PanchangInput): PanchangResult {
  throw new Error(
    'panchang engine not implemented: awaiting approved astronomical algorithm + reviewer validation (ADR-010; documentation gap).',
  );
}
