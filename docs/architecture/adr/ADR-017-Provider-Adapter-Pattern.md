# ADR-017 — Provider Adapter Pattern (Hexagonal Boundaries)

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Architecture

---

## Context

PanchangPal depends on several external vendors — the LLM provider, analytics, payments, and notifications. Vendor lock-in is a top technical risk (TDD §9 TRISK-01), and any one vendor may need to be swapped as cost, scale, or capability changes. Domain logic must not depend on vendor-specific SDKs or data shapes if the system is to remain replaceable and testable (TDD Part 1 §1.2 "clear seams / hexagonal boundaries").

Relevant sources: TDD Part 1 §1.2, §9 TRISK-01; Decision Log DEC-010, DEC-006, DEC-016.

---

## Decision

Isolate **every external dependency behind an adapter interface**, with domain logic depending on the interface, not the vendor. Concrete adapters exist for AI (`LLMProvider`/`EmbeddingProvider`, ADR-011), analytics (`AnalyticsService`, ADR-013), payments (Payment Provider Adapter with RevenueCat as the launch implementation, ADR-005), and notifications (Expo Push behind the scheduler, ADR-020). Swapping a vendor means writing a new adapter implementation, not editing call sites.

---

## Alternatives Considered

- **Direct vendor SDK calls in domain/app code.** Rejected: locks the codebase to vendors, scatters vendor logic, and makes testing and migration costly.

---

## Consequences

**Positive.** Vendors are swappable with contained blast radius; adapters are natural seams for test doubles; lock-in risk is bounded and exportable data (PostgreSQL) reinforces portability.

**Trade-offs.** A small amount of indirection and interface maintenance; teams must resist reaching around the adapter for a vendor-only feature.

**Operational.** ADR review triggers and a quarterly dependency review watch for lock-in creep (TRISK-01).

---

## Dependencies

**Related** ADR-005 (payments impl), ADR-011 (AI impl), ADR-013 (analytics impl), ADR-020 (notifications impl), ADR-003 (Supabase seam).

---

## Affected Documents

- TDD Part 1 §1.2 (architecture principles), §9 TRISK-01
- Decision Log DEC-010 (Provider Adapter Pattern), DEC-006 (Provider-Agnostic AI), DEC-016 (Payment Provider Adapter)

---

## Review Trigger

Revisit when adding a new class of third-party integration, to confirm it is introduced behind an adapter.
