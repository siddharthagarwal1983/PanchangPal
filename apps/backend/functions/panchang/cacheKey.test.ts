import { describe, it, expect } from 'vitest';
import { geoBucket, cacheKey } from './cacheKey';

describe('panchang cache key (ADR-010)', () => {
  it('buckets nearby coordinates together', () => {
    expect(geoBucket(40.7128, -74.006)).toBe(geoBucket(40.71, -74.01));
  });

  it('is deterministic and includes engine_version', () => {
    const a = cacheKey('2026-07-12', 40.71, -74.01, 'generic', 'v1');
    const b = cacheKey('2026-07-12', 40.71, -74.01, 'generic', 'v1');
    const c = cacheKey('2026-07-12', 40.71, -74.01, 'generic', 'v2');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
