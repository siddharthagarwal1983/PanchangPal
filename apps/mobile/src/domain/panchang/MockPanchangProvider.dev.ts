/**
 * ⚠️ DEVELOPMENT-ONLY MockPanchangProvider.
 *
 * Per the milestone rule: "If Panchang data is needed for UI development, use the existing
 * provider abstraction with a development-only MockPanchangProvider. Production code must
 * never depend on the mock provider." This file returns representative (clearly illustrative,
 * NOT authoritative) panchang so the PanchangCard UI can be built/previewed/tested. It does
 * NOT implement astronomical calculations (ADR-033) — the values are static placeholders.
 *
 * Enforcement:
 *  - `.dev.ts` suffix + this guard keep it out of production bundles.
 *  - It is imported ONLY by tests / a dev preview harness, never by useToday or any screen.
 */
import type { PanchangProvider, PanchangResult, TodayQuery } from './PanchangProvider';

const DEV_ONLY = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export class MockPanchangProvider implements PanchangProvider {
  constructor() {
    if (!DEV_ONLY) {
      throw new Error('MockPanchangProvider must never run in production (ADR-033).');
    }
  }

  async getToday(_q: TodayQuery): Promise<PanchangResult> {
    // Static, clearly-illustrative placeholder data for UI development ONLY. NOT a panchang.
    return {
      status: 'ok',
      summary: {
        dateLabel: 'Sample date',
        city: 'Sample City',
        tithi: 'Sample Tithi',
        nakshatra: 'Sample Nakshatra',
        festivalHint: undefined,
      },
      festival: null,
    };
  }
}
