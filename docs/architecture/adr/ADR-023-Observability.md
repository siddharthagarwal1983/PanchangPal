# ADR-023 — Observability (Sentry + Correlation IDs)

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Platform / Architecture

---

## Context

The NFR targets (startup, latency, crash-free rate, AI first-token, sync success) are SLOs, not vibes — they need dashboards and alerts (TDD Part 1 §1.10, §8). An incident must be traceable across the stack: from a screen interaction to a database query and back. The AI subsystem needs first-class metrics (refusal accuracy, groundedness, first-token latency, cost/query). Telemetry must carry no PII.

Relevant sources: TDD Part 1 §1.10, §3 Stack rows 14–15, §8, §9.

---

## Decision

Adopt **Sentry for errors and Performance** on both client and server, complemented by Supabase metrics and an uptime check. Use **structured JSON logs** in Edge Functions and **one correlation ID** (`request_id`/`correlation_id`) shared across logs, metrics, and traces so a `SCR_*` interaction can be followed to a DB query and back. Every `ERR_*` is observable (client `EVT_054` + server logs with `error_code`). AI is audited as first-class metrics (refusal accuracy, groundedness, first-token latency, cost/query) with a periodic hallucination audit. Logs never contain PII, secrets, or PII-bearing prompts.

---

## Alternatives Considered

- **Vendor-native crash reporting only, no correlation.** Rejected: cannot trace an incident end-to-end across client and server.
- **Uncorrelated logging.** Rejected: makes root-cause analysis slow and unreliable.

---

## Consequences

**Positive.** End-to-end traceability; SLOs become dashboards + alerts; AI quality and cost are measurable and audited.

**Trade-offs.** Correlation-ID propagation and structured-logging discipline must be maintained across every function and client call.

**Operational.** Dashboards per PDD §11; NFR ownership assigned per TDD §9; no PII in any telemetry (ADR-031).

---

## Dependencies

**Depends on** ADR-006 (server logs), ADR-022 (`ERR_*` observability).
**Related** ADR-019/ADR-011 (AI metrics), ADR-031 (no PII).

---

## Affected Documents

- TDD Part 1 §1.10, §3 (Stack rows 14–15), §8 (NFRs), §9 (risk ownership)
- PDD §9.9 (AI metrics), §11 (analytics dashboards)

---

## Review Trigger

Revisit if observability needs outgrow Sentry + Supabase metrics, or a dedicated tracing/log platform is required at scale.
