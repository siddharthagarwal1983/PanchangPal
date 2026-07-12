/**
 * Deterministic panchang cache key (ADR-010, TDD Part 2 §3.10). Key =
 * hash(local_date, geo_bucket, tradition_code, engine_version). geo_bucket groups
 * nearby coordinates to maximize cache hits. Pure → Vitest-testable.
 */
export const GEO_BUCKET_PRECISION = 1; // ~11km grid; tune with cache-hit metrics (§7)

/** Round lat/lng to a coarse grid so nearby users share a cache entry. */
export function geoBucket(lat: number, lng: number, precision = GEO_BUCKET_PRECISION): string {
  const r = (n: number) => n.toFixed(precision);
  return `${r(lat)},${r(lng)}`;
}

export function cacheKey(
  localDate: string,
  lat: number,
  lng: number,
  tradition: string,
  engineVersion: string,
): string {
  return [localDate, geoBucket(lat, lng), tradition, engineVersion].join('|');
}
