/**
 * @panchangpal/shared — domain types + canonical EVT_*/ERR_* + enum sources.
 * Consumed by the mobile app and Edge Functions so identifiers never diverge
 * (TDD Part 1 §1.3/§4). No runtime dependencies.
 */
export * from './errors.js';
export * from './events.js';
export * from './enums.js';
export * from './types.js';
