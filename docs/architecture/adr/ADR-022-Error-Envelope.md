# ADR-022 — Standard Error Envelope & ERR_* Taxonomy

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Architecture

---

## Context

Errors must be calm, actionable, recoverable where possible, and never leak internals — a trust and security requirement (TDD Part 1 §1.4 "fail calm, never fake"; §1.5). Client and server must agree on error identity so a failure can be mapped to user copy, logged, and observed consistently, and so one component's error does not fail an unrelated surface.

Relevant sources: TDD Part 1 §5, §7.4, §1.10; PDD §12/§13.5.

---

## Decision

Every thrown or returned error maps to an approved **`ERR_*` code**. Edge Functions return a **typed error envelope** `{ code, message, correlation_id, recoverable }` and never leak raw stack traces or model text. The client maps `ERR_*` to user copy (PDD §13.5) and emits an error analytics event (`EVT_054`); a global error boundary handles `ERR_UNKNOWN`. Errors are isolated to the smallest surface (e.g., a panchang-card error does not fail Home).

---

## Alternatives Considered

- **Ad-hoc error strings / raw exceptions to the client.** Rejected: leaks internals, is unmappable to copy, and undermines calm-UX and security.

---

## Consequences

**Positive.** Consistent, safe, observable errors; a stable contract between client and server; localized, recoverable user messaging.

**Trade-offs.** Every error path must be assigned a code and copy; the `ERR_*` set must be curated and never reused.

**Operational.** Every `ERR_*` is observable via `EVT_054` (client) and structured logs with `error_code` (server), feeding dashboards (ADR-023).

---

## Dependencies

**Depends on** ADR-014 (shared `ERR_*` enums in `packages/shared`).
**Related** ADR-006 (Edge Function envelopes), ADR-023 (observability), ADR-030 (no internals leaked).

---

## Affected Documents

- TDD Part 1 §5 (error handling), §7.4, §1.10
- PDD §12 (error states), §13.5 (copy); `ERR_*`, `EVT_054`

---

## Review Trigger

Revisit if the error taxonomy or envelope shape needs to change (e.g., new client platforms or a versioned error contract).
