# TASK.md

# PanchangPal — Current Task

Version: 1.0.0

Last Updated: 2026-07-12 00:20

Purpose:
This document defines the current implementation task.
Claude should stay focused on this task and avoid expanding into unrelated work unless explicitly instructed.

---

# Previous Task

## Title

Generate the OpenAPI Specification

Status

✅ Complete

Outcome

docs/api/openapi.yaml (OpenAPI 3.1, 65 operations covering all 64 documented API_*) + docs/api/README.md. Anchored to TDD Part 2 §5; auth, ERR_* envelope, versioning, idempotency, and SSE modeled. Validated; no invented endpoints.

---

# Current Task

## Title

Generate the Database Schema & Supabase Migrations

Status

🟡 Ready to Start

Priority

🔴 Critical

Estimated Effort

1–2 Sessions

---

# Objective

Produce the database documentation and Supabase migrations by realizing the approved data model in TDD Part 2 §3 (TBL_* specifications) and §4 (RLS & authorization). Document only the approved schema. Do **not** invent tables, columns, or policies.

---

# Inputs

Use only approved documentation:

- docs/tdd/02_BACKEND_ARCHITECTURE.md (§1 data model, §3 TBL_* specs, §4 RLS, §6 lifecycle, §7 indexing) — authoritative
- docs/tdd/01_SYSTEM_ARCHITECTURE.md (§1.5 security, §7.12 time-zone, ADR refs)
- docs/architecture/adr/ (ADR-003 Supabase, ADR-010 panchang cache, ADR-011 vector(1536), ADR-018 RLS)
- docs/api/openapi.yaml (contracts the schema must serve)

If documentation is ambiguous or conflicting:
- Stop.
- Explain the issue.
- Request clarification.

Do not make assumptions.

---

# Deliverables

Save documentation to:

docs/database/

Save migrations to:

supabase/migrations/

Including:

- Schema documentation (every TBL_*: columns, keys, indexes)
- Enumerated types (TDD Part 2 §2.3)
- RLS policies (one policy set per table, shipped with the table — §6.1)
- Constraints, indexes (incl. HNSW on content_chunk.embedding, partial unique F-2)
- Triggers/functions (set_updated_at, current_household_id, is_household_member/owner)
- Seed data outline (traditions, festivals, rituals, checklist items, feature flags)

---

# Success Criteria

This task is complete when:

- Every TBL_* in TDD Part 2 §3 has a documented table + RLS policy.
- Enumerated types match §2.3.
- Business rules F-1…F-4 are enforced in schema/constraints where documented.
- Migrations are forward-only and ship RLS with each table.
- No undocumented tables/columns/policies introduced.

---

# Constraints

Do not:
- Change architecture.
- Modify MRD, PRD, PDD, or TDD.
- Implement Edge Functions or application features.
- Build the AI/RAG ingestion pipeline (TDD Part 3).

This task is schema + migrations documentation.

---

# After Completion

1. Update SESSION.md.
2. Update PROJECT_STATUS.md.
3. Update TASK.md with the next task.
4. Recommend the next task.

The next planned task is:

Repository scaffolding & shared packages (packages/api, packages/shared, packages/database).
