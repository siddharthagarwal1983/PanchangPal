# ADR-006 — Edge Functions (Deno) for Privileged & Compute Logic

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Architecture / Backend

---

## Context

Several operations must not run on the client: they hold secrets (OpenAI, service-role, webhook keys), reach third parties, or compute authoritative state (panchang, RAG answers, entitlements, sync, account merge/deletion). The architecture is client-thin and server-authoritative-for-truth (TDD Part 1 §1.2), and secrets must never reach the device (§1.5). The team also wants stateless, idempotent server units with no server to operate.

Relevant sources: TDD Part 1 §1.2, §1.5, §2.2, §6 ADR-006.

---

## Decision

Run privileged and compute logic in **Supabase Edge Functions (Deno)** — stateless, idempotent units that are the only place holding secrets and performing third-party egress. Named services include `SVC_panchang`, `SVC_ask_guru`, `SVC_notify_scheduler`, `SVC_revenuecat_webhook`, `SVC_sync`, `SVC_account`, and `SVC_content_ingest`. All state lives in PostgreSQL; Edge Functions carry none.

---

## Alternatives Considered

- **Client-side compute.** Rejected: would leak secrets and place authoritative logic on an untrusted device.
- **A separate Node service.** Rejected: more operations to run than a solo founder should own; Edge Functions come with the Supabase platform.

---

## Consequences

**Positive.** A clean, secret-holding server boundary; stateless functions scale horizontally as a platform concern; idempotency keys make retries and webhook redeliveries safe (TDD §7.7).

**Trade-offs.** Deno runtime constraints and cold-start latency on hot paths, mitigated by keeping hot paths warm and caching (ADR-010).

**Operational.** If a hot path (e.g., `SVC_ask_guru`) hits execution-limit or cold-start issues, a dedicated service is the documented escape hatch.

---

## Dependencies

**Depends on** ADR-003 (Supabase).
**Depended on by** ADR-004 (RAG runs server-side), ADR-005 (webhook), ADR-011 (model calls server-side), ADR-020 (scheduler), ADR-025 (jobs).

---

## Affected Documents

- TDD Part 1 §1.2, §1.5, §2.2, §6 ADR-006, §7.5–7.7
- API/Services: all `SVC_*` definitions (TDD Part 2)

---

## Review Trigger

Revisit if cold-start or execution-limit issues appear on hot paths, warranting a dedicated service for a specific function.
