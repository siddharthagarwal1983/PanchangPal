# ADR-012 — Single US Supabase Region for Launch

**Status:** Accepted (resolves F-18)
**Date:** 2026-07-11
**Decision Owner:** Platform / Architecture

---

## Context

The launch markets are the US, Australia, and New Zealand, with the US the largest (MRD §3). A multi-region topology adds operational complexity and cost a solo founder should avoid at launch. Because panchang reads are served from a deterministic CDN cache (ADR-010), read latency is largely CDN-bound rather than database-region-bound, which weakens the case for co-locating databases near AU/NZ users at v1.

Relevant sources: TDD Part 1 §2.4, §6 ADR-012, §10.2; Decision Log DEC-013.

---

## Decision

Deploy a **single Supabase project in one US region** (e.g., `us-east`) for launch, serving AU/NZ through Storage/CDN and cache-first reads. A read replica or additional region is a documented future trigger, not day-one work.

---

## Alternatives Considered

- **Multi-region / read replicas.** Deferred: premature operations and cost for the launch scale.
- **AU/NZ-local primary region.** Rejected: worse for the larger US user base.

---

## Consequences

**Positive.** Simplest possible operations; CDN caching covers most read latency for AU/NZ.

**Trade-offs.** AU/NZ writes incur trans-Pacific latency, mitigated by optimistic writes and the offline queue (ADR-015).

**Operational.** Field latency and any data-residency obligation are watched as triggers to add a replica/region.

---

## Dependencies

**Depends on** ADR-003 (Supabase).
**Related** ADR-010 (CDN-bound reads make this viable), ADR-015 (optimistic writes hide write latency).

---

## Affected Documents

- TDD Part 1 §2.4, §6 ADR-012, §10.2/§10.6 (F-18 resolved), §10.5 (T1)
- Decision Log DEC-013 (Single Launch Region)
- TDD §9 TRISK-07, TRISK-12 (scaling, data residency)

---

## Review Trigger

Revisit if AU/NZ latency NFRs (NFR-03/04) are missed in field data, or a market-specific data-residency requirement emerges (TRISK-12).
