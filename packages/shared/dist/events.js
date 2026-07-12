/**
 * EVT_* analytics event IDs — the documented set (EVT_001…EVT_055) from the PDD
 * analytics taxonomy (PDD §11.1 / §3.0.1). Represented as stable string IDs; the
 * canonical human-readable names, properties, and the pseudonymous envelope are
 * owned by PDD §11 (taxonomy ratification is A13, v1.1). Events carry NO PII
 * (ADR-013/031) and are emitted through the AnalyticsService adapter.
 *
 * A few well-referenced IDs (documented inline across TDD/PDD) are noted for
 * readability; do not invent names beyond what the source docs define.
 *   EVT_012 today rendered · EVT_017 ritual complete · EVT_020/021 streak advance/grace
 *   EVT_029 ask asked · EVT_030 first token · EVT_031 sources · EVT_040/041 notif sent/opened
 *   EVT_045 anon→auth merge · EVT_054 client error
 */
export const EVENT_IDS = Array.from({ length: 55 }, (_, i) => `EVT_${String(i + 1).padStart(3, '0')}`);
//# sourceMappingURL=events.js.map