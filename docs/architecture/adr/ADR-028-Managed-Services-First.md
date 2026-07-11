# ADR-028 — Managed-Services-First

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Architecture

---

## Context

PanchangPal is built and operated by one engineer on a tight timeline, where every piece of infrastructure operated in-house is a risk and a time cost that does not differentiate the product (MRD Risk §12; TDD Part 1 §1.1). The moat is trust and household relationships, not owned infrastructure.

Relevant sources: TDD Part 1 §1.1, §1.11, §3, §10.1.

---

## Decision

Adopt a **managed-first, build-least** posture: buy managed platforms (Supabase, RevenueCat, Sentry, Expo/EAS, OpenAI) and write only differentiating logic — the panchang/tithi engine, the RAG content pipeline, and the household habit loop. Managed tiers are sized to milestones and scaled on real usage. Where a managed choice creates vendor coupling, it is bounded by hexagonal adapter seams (ADR-017) so managed does not mean locked-in.

---

## Alternatives Considered

- **Self-hosted / self-built infrastructure** (own servers, custom auth, self-run vector DB, custom billing). Rejected: operational burden a solo founder cannot carry, with no product differentiation.

---

## Consequences

**Positive.** Minimal operations; faster delivery; effort concentrated on the differentiating logic; costs scale with milestones.

**Trade-offs.** Dependence on third-party platforms and their pricing/limits, mitigated by adapters (ADR-017), exportable PostgreSQL data, and documented scale triggers.

**Operational.** Vendor lock-in is an explicitly tracked risk (TRISK-01) with ADR review triggers and quarterly dependency reviews.

---

## Dependencies

**Related** ADR-002 (Expo), ADR-003 (Supabase), ADR-005 (RevenueCat), ADR-023 (Sentry), ADR-011 (OpenAI), ADR-017 (adapters bound lock-in).

---

## Affected Documents

- TDD Part 1 §1.1 (engineering philosophy), §1.11 (cost), §3 (stack), §10.1 (readiness)
- TDD §9 TRISK-01 (vendor lock-in), TRISK-11 (solo-founder SPOF)

---

## Review Trigger

Revisit a specific managed choice when its cost, limits, or capabilities no longer fit — evaluated per-vendor via that vendor's ADR review trigger.
