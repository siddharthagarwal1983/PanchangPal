import { describe, it, expect } from 'vitest';
import { unimplementedPanchangEngine, PanchangEngineUnavailableError } from './engine';

/**
 * Engine-BEHAVIOR tests are intentionally PENDING/SKIPPED — the canonical astronomical
 * algorithm is not yet approved (ADR-033 "Canonical Panchang Computation Engine").
 * They must NOT be written against fabricated expected values. Un-skip and fill in the
 * reviewer-approved validation dataset once the decision is ratified.
 */
describe('PanchangEngine', () => {
  it('placeholder engine fails closed (never fabricates)', () => {
    expect(() => unimplementedPanchangEngine.compute({
      instant: '2026-07-12T00:00:00Z', lat: 40.71, lng: -74.01, tz: 'America/New_York', tradition: 'generic',
    })).toThrow(PanchangEngineUnavailableError);
  });

  // TODO(ADR-033): un-skip once the canonical engine + validation dataset are approved.
  it.skip('computes tithi within acceptance tolerance vs Drik/mPanchang dataset', () => {
    // PENDING: requires approved ephemeris/ayanamsa + reviewer-validated dataset.
    // See docs/architecture/canonical-panchang-engine/TDD.md (validation & tolerances).
  });

  // TODO(ADR-033): un-skip once regional variant rules are approved.
  it.skip('resolves personal-date tithi recurrence with dual candidates on ambiguity', () => {
    // PENDING: ERR_TITHI_AMBIGUOUS behavior depends on the approved methodology.
  });
});
