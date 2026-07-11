# ADR-008 — Zustand for Client / UI State

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Mobile / Architecture

---

## Context

Beyond cached server data (ADR-007), the app needs a small, ergonomic store for ephemeral and client-owned state: the session, the durable offline mutation queue, user preferences, and UI state. For a solo founder, minimal boilerplate and a clear boundary from server state matter more than a feature-rich store.

Relevant sources: TDD Part 1 §3 Stack rows 4 & 24, §6 ADR-008.

---

## Decision

Use **Zustand** for client/UI state — session, the offline queue, preferences, and transient UI state. Server state stays in TanStack Query (ADR-007); the two are kept strictly separate so the app never duplicates server truth inside Zustand.

---

## Alternatives Considered

- **Redux Toolkit.** Rejected as heavier boilerplate than needed here.
- **Jotai / Recoil.** Rejected: the atom model is unnecessary complexity for these stores.

---

## Consequences

**Positive.** Simple, testable stores with a tiny API and no boilerplate; easy to seed test doubles.

**Trade-offs.** Discipline is required to keep server state out of Zustand and in TanStack Query.

**Operational.** The offline queue store is backed by MMKV so it survives app kill (ADR-015).

---

## Dependencies

**Depends on** ADR-001 (React Native).
**Related** ADR-007 (server state), ADR-015 (offline queue persistence).

---

## Affected Documents

- TDD Part 1 §3 (Stack rows 4, 24), §6 ADR-008
- Mobile app architecture: state management (TDD Part 4)

---

## Review Trigger

Revisit if client state complexity grows beyond simple stores.
