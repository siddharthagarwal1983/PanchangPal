# ADR-003 — Supabase as the Backend Platform

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Architecture

---

## Context

PanchangPal needs auth, a relational data store, file storage, server-side compute, and realtime household sync — with strong per-user authorization and a place to run RAG retrieval — all operable by one engineer (TDD Part 1 §1.1). The household/membership/entitlement/traceability model is inherently relational, and the product wants row-level authorization as its primary security boundary (§1.5). Deferred sign-in (UX-2) requires that authorization work even before a user creates an account.

Relevant sources: TDD Part 1 §1.5, §2.2, §3 Stack rows 5–8, §6 ADR-003; Decision Log DEC-011.

---

## Decision

Adopt **Supabase** as the single managed backend platform: **Auth**, **PostgreSQL** (with Row-Level Security and pgvector), **Storage** (CDN-fronted), **Edge Functions** (Deno), and **Realtime**. Supabase anonymous auth enables deferred sign-in (ADR-009); pgvector co-locates RAG embeddings with content (ADR-004), avoiding a separate vector vendor.

---

## Alternatives Considered

- **Firebase.** Rejected: a NoSQL model is a weaker fit for the relational household/traceability requirements; RLS-style authorization is harder; a separate vector store would be required for RAG.
- **Self-hosted Node + managed PostgreSQL.** Rejected: more operational burden than a solo founder should carry.

---

## Consequences

**Positive.** One platform covers ~80% of backend needs; PostgreSQL + RLS provide a strong authorization boundary (ADR-018); a single datastore holds relational data and vectors, simplifying consistency and cost.

**Trade-offs.** Some coupling to Supabase, mitigated by hexagonal seams (ADR-017) so domain logic does not depend on vendor specifics.

**Operational.** Scaling is vertical-first for v1 with documented triggers (partitioning, replicas) rather than day-one work (TDD §9 TRISK-07).

---

## Dependencies

**Depended on by** ADR-004 (pgvector), ADR-006 (Edge Functions), ADR-009 (anonymous auth), ADR-012 (region), ADR-013 (Postgres analytics sink), ADR-018 (RLS), ADR-025 (pg_cron jobs).
**Related** ADR-017 (adapter seams limit lock-in).

---

## Affected Documents

- TDD Part 1 §1.5, §2.2, §3 (Stack rows 5–8, 10), §6 ADR-003
- Decision Log DEC-011 (PostgreSQL + Supabase)
- Database: all `TBL_*` + RLS policies (TDD Part 2)

---

## Review Trigger

Revisit on RLS/performance limits at scale, or a data-residency requirement (F-18) forcing a multi-region topology beyond Supabase's comfort.
