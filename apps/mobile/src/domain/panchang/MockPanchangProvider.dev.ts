/**
 * Development-only Panchang provider.
 * Returns deterministic mock data so the UI can be developed without
 * a backend connection.
 */

import type {
  PanchangProvider,
  TodayQuery,
  PanchangResult,
} from './PanchangProvider';

export class MockPanchangProvider implements PanchangProvider {
  async getToday(_q: TodayQuery): Promise<PanchangResult> {
    return {
      status: 'ok',
      // Clearly-illustrative (never authoritative): each field is prefixed "Sample" so it can never
      // be mistaken for a real computed panchang in dev builds.
      summary: {
        dateLabel: '14 January 2026',
        city: 'Sample City',
        tithi: 'Sample Tithi (Shukla Paksha Pratipada)',
        nakshatra: 'Sample Nakshatra (Ashwini)',
        festivalHint: 'Sample Festival',
      },
      festival: {
        name: 'Makar Sankranti',
        significance: 'Festival of harvest and the Sun’s northward journey.',
      },
    };
  }
}