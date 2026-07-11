# ADR-016 — Thin Client / Server-Authoritative State

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Architecture

---

## Context

PanchangPal must produce consistent, trustworthy truth across devices and household members — panchang values, streak length, entitlements, and RAG answers cannot diverge per device. Placing business logic on the client would scatter truth, complicate cross-device consistency, and risk exposing secrets. The product's trust and correctness requirements push authority to the server (TDD Part 1 §1.2).

Relevant sources: TDD Part 1 §1.2, §2.5, §6 (ADR-006 seam); Decision Log DEC-008.

---

## Decision

Keep the **client thin and the server authoritative for truth**. The mobile app renders and caches; the server (Edge Functions + PostgreSQL) is authoritative for panchang computation, RAG answers, entitlements, streak length, and cross-device state. The **single deliberate exception** is daily completion, which is client-authoritative for the day and reconciled server-side (ADR-015) so the loop works offline. Direct CRUD (household, personal dates, preferences) goes to PostgreSQL under RLS; computed/privileged operations go through Edge Functions.

---

## Alternatives Considered

- **Fat client with local business logic.** Rejected: cross-device divergence, harder consistency, and secret-exposure risk.

---

## Consequences

**Positive.** One source of truth for correctness-critical state; consistent multi-device/household behavior; secrets stay server-side (ADR-030).

**Trade-offs.** More round-trips for computed state, mitigated by cached-first reads (ADR-007) and deterministic caching (ADR-010).

**Operational.** The offline exception (client-authoritative daily completion) is explicit and bounded, not a general pattern.

---

## Dependencies

**Depends on** ADR-006 (Edge Functions), ADR-018 (RLS).
**Related** ADR-015 (offline exception), ADR-010 (cached compute), ADR-014 (shared contracts).

---

## Affected Documents

- TDD Part 1 §1.2 (architecture principles), §2.5 (runtime)
- Decision Log DEC-008 (Thin Client)

---

## Review Trigger

Never (foundational principle); reassess only if a fundamentally different consistency model is adopted.
