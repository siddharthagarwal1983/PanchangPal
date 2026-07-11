# ADR-015 — Offline-First Architecture

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Mobile / Architecture

---

## Context

The daily habit — the product's entire value — must form on a diaspora commuter's flaky connection. If the core loop (today's panchang, ritual text, checklist, streak) fails without network, the habit does not form (TDD Part 1 §1.2, §1.7; PDD Flow E5). Offline behavior is therefore architectural, not a feature toggled on later.

Relevant sources: TDD Part 1 §1.7, §2.11, §7.11; Decision Log DEC-009.

---

## Decision

Make the **core loop offline-complete**. Cached today's panchang, ritual text, checklist, and streak are fully usable with no network. Offline actions (ritual complete, checklist, personal-date add) are applied **optimistically** and enqueued in a **durable MMKV-backed queue** that survives app kill; on reconnect `SVC_sync` reconciles them under documented conflict rules — **daily completion is client-authoritative for the day**, household/history is unioned, and the longer streak wins. Caching is layered: TanStack Query (in-memory) + a persisted store for panchang/ritual/streak/prefs + a file cache for audio. Network-only features (Ask Guru, invites, auth, uncached calendar months) show a clear "connect to use" state, never a dead end.

---

## Alternatives Considered

- **Online-only with a cache veneer.** Rejected: the habit loop would break on the exact bad-network conditions the target users face.
- **Server-authoritative daily completion.** Rejected for the day-of loop: it would make completion fail offline; reconciliation instead makes the client authoritative for the day and reconciles server-side.

---

## Consequences

**Positive.** The habit loop never loses a completion to a bad network (NFR-09/NFR-10); instant, calm completion UX.

**Trade-offs.** Requires explicit conflict rules, idempotency keys, and a durable queue; reconciliation logic must be tested against conflict cases.

**Operational.** `ERR_SYNC_CONFLICT` surfaces only user-meaningful conflicts; sync success is an SLO (NFR-10).

---

## Dependencies

**Depends on** ADR-007 (query cache), ADR-008 (Zustand queue), ADR-006 (`SVC_sync`), ADR-016 (server-authoritative reconciliation).
**Related** ADR-010 (cached panchang), ADR-012 (hides write latency).

---

## Affected Documents

- TDD Part 1 §1.7, §2.11, §7.11, §8 (NFR-09/10)
- Decision Log DEC-009 (Offline-First); PDD Flow E5
- `ERR_SYNC_CONFLICT`, `ERR_OFFLINE`

---

## Review Trigger

Revisit on a major synchronization redesign or if conflict/data-loss rates exceed NFR-10.
