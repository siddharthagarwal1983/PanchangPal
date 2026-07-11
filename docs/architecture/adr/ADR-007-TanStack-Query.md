# ADR-007 — TanStack Query for Server State

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Mobile / Architecture

---

## Context

Two of the product's core requirements are cached-first rendering (returning users see Today in under 500 ms before any network) and offline-first operation of the daily loop (TDD Part 1 §1.6, §1.7). Both depend on a disciplined server-cache layer with staleness handling, retries, and persistence. Hand-rolling this is error-prone.

Relevant sources: TDD Part 1 §1.6, §1.7, §3 Stack row 3, §6 ADR-007.

---

## Decision

Use **TanStack Query with persistence** as the server-state / server-cache layer. It powers stale-while-revalidate reads, retry with backoff, and offline persistence, and is the mechanism behind the cached-first performance budgets. It is paired with Zustand (ADR-008), which owns client/UI state — a deliberate split between server cache and client state.

---

## Alternatives Considered

- **RTK Query.** Rejected as heavier for a solo founder, though functionally capable.
- **Hand-rolled caching.** Rejected: error-prone; reinvents cache invalidation and retry logic.

---

## Consequences

**Positive.** Less boilerplate; robust caching, retries, and offline persistence; directly realizes the cached-first (NFR-02) and offline (NFR-09) targets.

**Trade-offs.** A caching mental model the team must learn and apply consistently (query keys, staleness).

**Operational.** Cache keys for deterministic data include version inputs (`engine_version`/`content_version`) so invalidation is explicit (TDD §7.8).

---

## Dependencies

**Depends on** ADR-001 (React Native).
**Related** ADR-008 (Zustand client state), ADR-015 (offline-first), ADR-010 (deterministic cacheable compute).

---

## Affected Documents

- TDD Part 1 §1.6, §1.7, §3 (Stack row 3), §6 ADR-007, §7.8
- Mobile app architecture: data layer & caching (TDD Part 4)

---

## Review Trigger

None foreseen.
