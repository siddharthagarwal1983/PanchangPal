# ADR-018 — Row-Level Security as the Authorization Boundary

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Security / Backend

---

## Context

PanchangPal stores personal and household data that a user or household must be able to read and write only for their own rows. With a thin client talking directly to PostgreSQL for CRUD (ADR-016), authorization cannot live in application code alone — it must be enforced at the datastore. PostgreSQL Row-Level Security provides exactly this boundary, and Supabase's JWT integrates with it (TDD Part 1 §1.5).

Relevant sources: TDD Part 1 §1.5, §8 (NFR-18), §9 TRISK-08; Decision Log DEC-012.

---

## Decision

Make **Row-Level Security the primary authorization boundary**: every user-owned table ships with an RLS policy, with no exceptions. A user/household can read/write only their own rows. The mobile client uses the anon/authenticated key under RLS; privileged operations (entitlement writes, deletion, admin) run only in Edge Functions with the service role and never on the client. No table ships without an RLS policy — this is a release-blocking security gate.

---

## Alternatives Considered

- **Application-layer authorization only.** Rejected: with direct client→PostgreSQL CRUD, app-only checks are bypassable and error-prone; the datastore must enforce ownership.

---

## Consequences

**Positive.** A strong, uniform authorization boundary at the datastore; works from first launch thanks to anonymous auth (ADR-009); testable per-table.

**Trade-offs.** Every table needs a correct policy and tests; policy mistakes are high-impact, so RLS discipline is the security gate.

**Operational.** RLS coverage is an NFR (NFR-18: RLS on 100% of tables) and verified in the security review and CI.

---

## Dependencies

**Depends on** ADR-003 (Supabase/PostgreSQL), ADR-009 (auth identity for RLS).
**Related** ADR-016 (thin client), ADR-030 (least privilege), ADR-031 (privacy).

---

## Affected Documents

- TDD Part 1 §1.5, §8 (NFR-18), §9 TRISK-08
- Decision Log DEC-012 (Mandatory Row Level Security)
- Database: RLS policies on every `TBL_*` (TDD Part 2)

---

## Review Trigger

Never as a principle; individual policies are reviewed at every security audit.
