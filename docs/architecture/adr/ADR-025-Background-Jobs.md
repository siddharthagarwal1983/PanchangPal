# ADR-025 — Background Jobs (pg_cron + Jobs Table)

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Platform / Backend

---

## Context

Several recurring, asynchronous workloads exist: notification scheduling (per-minute windows), win-back segmentation (daily), content ingestion/embedding (on publish), analytics rollups (hourly/daily), and entitlement reconciliation. These need reliable scheduling and a worker pattern without introducing and operating an external queue at v1 (TDD Part 1 §7.10; §3 Stack row 23).

Relevant sources: TDD Part 1 §3 Stack row 23, §7.10; §2.7/§2.9.

---

## Decision

Run background work with **`pg_cron` scheduled triggers plus a `jobs` table worker pattern** in Edge Functions. `pg_cron` fires on schedule; Edge Function workers claim and process jobs idempotently. This covers notification scheduling, win-back segmentation, content ingestion/embedding, analytics rollups, and entitlement reconciliation — all inside Supabase, with no external queue.

---

## Alternatives Considered

- **An external queue (e.g., SQS) + workers.** Rejected: unjustified operational and cost overhead at v1; `pg_cron` + a jobs table meets the need within the existing platform.

---

## Consequences

**Positive.** No extra infrastructure; scheduling and workers live where the data is; idempotent workers make retries safe.

**Trade-offs.** `pg_cron` and Edge Functions have platform limits; very high job throughput or long-running jobs would need a dedicated worker/queue later.

**Operational.** Job workers reuse the idempotency-key discipline (TDD §7.7); the scheduler is idempotent (ADR-020).

---

## Dependencies

**Depends on** ADR-003 (PostgreSQL/pg_cron), ADR-006 (Edge Function workers).
**Related** ADR-020 (notification scheduling), ADR-013 (analytics rollups), ADR-004 (content ingestion/embedding).

---

## Affected Documents

- TDD Part 1 §3 (Stack row 23), §7.10 (background jobs), §7.7 (idempotency)

---

## Review Trigger

Revisit if job volume, throughput, or duration exceeds what `pg_cron` + Edge Functions can serve, warranting a dedicated queue/worker.
