# ADR-010 — Deterministic, Cacheable Panchang Engine

**Status:** Accepted (`[TECHNICAL IMPROVEMENT]`)
**Date:** 2026-07-11
**Decision Owner:** Backend / Architecture

---

## Context

Panchang/tithi correctness is the product's trust pillar — a wrong tithi costs disproportionate trust (MRD Risk §1). Panchang is also the highest-volume read path, so recomputing it per request would be wasteful and expensive. The values are a pure function of astronomical inputs, which makes them ideal for aggressive caching if computed deterministically. The same computation must also drive personal-date tithi recurrence.

Relevant sources: TDD Part 1 §1.4, §1.6, §1.11, §2.6, §6 ADR-010.

---

## Decision

Implement the **panchang/tithi engine as a pure function** of `(instant, latitude/longitude, timezone, tradition)`, versioned by an `engine_version`, and **cache the output at the CDN and on the client**. Identical inputs return byte-identical output, enabling near-total cache hit rates. Cache entries are keyed by inputs plus `engine_version`; a version bump invalidates them. Output is validated against reference sources (Drik / mPanchang) and paid reviewers.

---

## Alternatives Considered

- **Per-request recompute, uncached.** Rejected: wasteful of compute and cost, and needless given deterministic inputs.

---

## Consequences

**Positive.** Very high cache hit rates make read latency largely CDN-bound (supporting the single-region choice, ADR-012) and keep marginal cost near zero; determinism enables regression testing against reference sources.

**Trade-offs.** Cache must be invalidated on `engine_version` bumps; accuracy depends on continuous validation against references and regional variants.

**Operational.** The engine underpins offline-first — cached panchang is fully usable with no network (ADR-015).

---

## Dependencies

**Depends on** ADR-006 (`SVC_panchang`).
**Related** ADR-007 (client cache), ADR-012 (region relies on CDN-bound reads), ADR-026 (timezone-local computation).

---

## Affected Documents

- TDD Part 1 §1.4, §1.6, §1.11, §2.6, §6 ADR-010
- TDD §9 TRISK-04 (panchang calculation error); NFR-12
- `ERR_TITHI_AMBIGUOUS`; `engine_version` model

---

## Review Trigger

Revisit on accuracy discrepancies against reference sources, or when new regional/traditional variants must be supported.
