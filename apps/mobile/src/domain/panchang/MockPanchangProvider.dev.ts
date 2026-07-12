/**
 * Development-only Panchang provider.
 * Returns deterministic mock data so the UI can be developed without
 * a backend connection.
 */

import type {
  PanchangProvider,
  PanchangQuery,
  PanchangResult,
} from './PanchangProvider';

export class MockPanchangProvider implements PanchangProvider {
  async getToday(_q: PanchangQuery): Promise<PanchangResult> {
    return {
      date: '2026-01-14',
      sunrise: '06:52',
      sunset: '17:58',

      tithi: {
        name: 'Shukla Paksha Pratipada',
      },

      nakshatra: {
        name: 'Ashwini',
      },

      yoga: {
        name: 'Shubha',
      },

      karana: {
        name: 'Bava',
      },

      rahuKaal: {
        start: '13:30',
        end: '15:00',
      },

      festivals: [],

      muhurta: [],

      metadata: {
        source: 'mock',
        cached: false,
      },
    };
  }
}