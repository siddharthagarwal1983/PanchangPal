# ADR-013 — Analytics Adapter with Postgres Sink

**Status:** Accepted (resolves F-19)
**Date:** 2026-07-11
**Decision Owner:** Architecture / Product

---

## Context

The product needs analytics from launch — activation, the habit/North Star metric (Weekly Household Ritual Completions), AI, retention, and monetization — but the PDD §11 event taxonomy is vendor-agnostic. Shipping a managed analytics vendor on day one adds cost and a dependency before event volume justifies it, while hard-coding a vendor would lock the tooling.

Relevant sources: TDD Part 1 §2.7, §3 Stack row 13, §6 ADR-013; Decision Log DEC-017.

---

## Decision

Emit all analytics through an **`AnalyticsService` adapter**; the launch sink is a **PostgreSQL `analytics_event` table plus scheduled rollups**. Events use the PDD §11.1 envelope (pseudonymous IDs, `household_id`, no PII), are batched from the client, and feed dashboards. The North Star is computed by grouping the completion event by `household_id` per ISO week. Migrating to a managed platform later swaps the adapter implementation only, not the call sites.

---

## Alternatives Considered

- **PostHog/Amplitude on day one.** Deferred: an added vendor and cost before volume justifies it.
- **No adapter (direct vendor SDK).** Rejected: locks the tooling and scatters vendor calls across the codebase.

---

## Consequences

**Positive.** Zero extra vendor at launch; events co-located for the North Star rollup; optionality preserved.

**Trade-offs.** Funnels and retention analysis are SQL rollups until a managed tool is adopted.

**Operational.** Rollups run on `pg_cron` (ADR-025); no PII enters the event store (ADR-031).

---

## Dependencies

**Depends on** ADR-003 (PostgreSQL), ADR-017 (adapter pattern), ADR-025 (rollup jobs).
**Related** ADR-031 (privacy — no PII in analytics).

---

## Affected Documents

- TDD Part 1 §2.7, §3 (Stack row 13), §6 ADR-013, §10.2/§10.6 (F-19 resolved)
- Decision Log DEC-017 (Analytics Adapter)
- Analytics taxonomy `EVT_*` (PDD §11); `analytics_event` table (TDD Part 2)

---

## Review Trigger

Revisit when event volume/query needs exceed Postgres comfort, or product needs funnels/retention beyond SQL rollups — then adopt PostHog/Amplitude behind the same adapter.
