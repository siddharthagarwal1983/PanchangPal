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
      summary: {
        dateLabel: '14 January 2026',
        city: 'Bengaluru',
        tithi: 'Shukla Paksha Pratipada',
        nakshatra: 'Ashwini',
        festivalHint: 'Makar Sankranti',
      },
      festival: {
        name: 'Makar Sankranti',
        significance: 'Festival of harvest and the Sun’s northward journey.',
      },
    };
  }
}