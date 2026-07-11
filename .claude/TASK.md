# TASK.md

# PanchangPal — Current Task

Version: 1.0.0

Last Updated: 2026-07-12 02:10

Purpose:
This document defines the current implementation task.
Claude should stay focused on this task and avoid expanding into unrelated work unless explicitly instructed.

---

# Previous Task

## Title

Initialize the Expo Application & Configure GitHub Actions CI

Status

✅ Complete

Outcome

apps/mobile Expo shell (4-tab router today/calendar/guru/you, AppProviders with Query+theme+i18n, Zustand STORE_* skeletons, metro/babel config) + .github CI/CD (ci.yml 6 gates, cd.yml 5-stage pipeline, ota.yml, CODEOWNERS) + scripts/migrate.sh & codegen.sh. Structure/pipeline only; validated.

---

# Current Task

## Title

Backend Foundation — implement the SVC_* Edge Functions

Status

🟡 Ready to Start

Priority

🔴 Critical

Estimated Effort

3–5 Sessions

---

# Objective

Implement the Supabase Edge Functions (Deno) against the approved API_* contracts (TDD Part 2 §5) and the AI/RAG subsystem (TDD Part 3 for SVC_ask_guru). Server-authoritative, idempotent, RLS-respecting; server-only secrets.

---

# Inputs

Use only approved documentation:

- docs/tdd/02_BACKEND_ARCHITECTURE.md §5 (API_* contracts), §4 (RLS), §6 (lifecycle)
- docs/tdd/03_AI_RAG.md (SVC_ask_guru, retrieval, guardrails, streaming)
- docs/tdd/01_SYSTEM_ARCHITECTURE.md §2 (flows), §7 (idempotency, rate limits, timeouts)
- docs/api/openapi.yaml, packages/api (contracts), packages/shared (ERR_*/EVT_*)
- docs/architecture/adr/ (ADR-006, 011, 019, 022, 030)

If documentation is ambiguous or conflicting: Stop, explain, request clarification.

---

# Deliverables (per function, apps/backend/functions/)

- panchang (API_GET_TODAY, panchang detail, calendar, ritual complete)
- ask-guru (API_POST_ASK_GURU — SSE, grounded-or-silent; needs TDD Part 3)
- notify-scheduler (due-notification sweep)
- revenuecat-webhook (signature-verified, idempotent entitlement upsert)
- sync (offline mutation reconciliation)
- account (anon→auth merge, delete, transfer)
- content-ingest (RAG ingestion; TDD Part 3)
- _shared (auth/JWT, logging + correlation IDs, guardrails)

Each with unit tests (Vitest) and idempotency where documented.

---

# Success Criteria

- Each SVC_* implements its API_* contract exactly (request/response/errors).
- Idempotency keys honored; secrets server-only; RLS respected (service role only where documented).
- Errors return the ERR_* envelope; no fabricated AI content.
- Unit tests pass; contract tests green in CI.

---

# Constraints

Do not:
- Change architecture, contracts, or schema.
- Modify MRD, PRD, PDD, or TDD.
- Build mobile feature UI (separate track).

Note: SVC_ask_guru + content-ingest depend on TDD Part 3 (AI/RAG). Read it first; if retrieval/threshold specifics are missing, stop and confirm.

---

# After Completion

1. Update SESSION.md.
2. Update PROJECT_STATUS.md + PROJECT_MEMORY.md (milestone transition to Backend Foundation).
3. Update TASK.md with the next task.
4. Recommend the next task.

The next planned task is:

Design System & Component Library (packages/ui CMP_* + tokens from PDD Part 3 §6).
