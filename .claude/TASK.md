# TASK.md

# PanchangPal — Current Task

Version: 1.0.0

Last Updated: 2026-07-12 00:45

Purpose:
This document defines the current implementation task.
Claude should stay focused on this task and avoid expanding into unrelated work unless explicitly instructed.

---

# Previous Task

## Title

Generate the Database Schema & Supabase Migrations

Status

✅ Complete

Outcome

11 forward-only migrations in supabase/migrations/ (29 TBL_* tables, RLS on every table, 54 policies, enums, helper functions/triggers, HNSW + F-2 indexes) + supabase/seed.sql + docs/database/ (README + SCHEMA). Faithful to TDD Part 2 §2–§7. Static-validated (no live Postgres in sandbox).

---

# Current Task

## Title

Repository Scaffolding & Shared Packages

Status

🟡 Ready to Start

Priority

🔴 Critical

Estimated Effort

1–2 Sessions

---

# Objective

Scaffold the pnpm + Turborepo monorepo (TDD Part 1 §4) and the shared packages so contracts have a home. Establish structure only — no application features.

---

# Inputs

Use only approved documentation:

- docs/tdd/01_SYSTEM_ARCHITECTURE.md §4 (repository structure), §3 (stack), §5 (standards)
- docs/architecture/adr/ (ADR-014 monorepo, ADR-017 adapters, ADR-022 errors)
- docs/api/openapi.yaml (source for packages/api contracts)
- supabase/migrations/ (source for packages/database types)

If documentation is ambiguous or conflicting: Stop, explain, request clarification.

---

# Deliverables

Scaffold (structure + config, per TDD Part 1 §4):

- Root: pnpm-workspace.yaml, turbo.json, tsconfig.base.json, .eslintrc, .prettierrc, package.json
- apps/mobile (Expo app skeleton), apps/backend (functions/, migrations/ pointer, seed/)
- packages/api (API_* zod contracts from openapi.yaml)
- packages/shared (EVT_*/ERR_* enums, domain types)
- packages/database (generated DB types, RLS helpers)
- packages/ui, packages/design-tokens, packages/ai (stubs)

---

# Success Criteria

- Monorepo structure matches TDD Part 1 §4 exactly.
- No new top-level folders beyond the approved layout.
- packages/api and packages/shared stubs exist so contracts/enums have a home.
- Dependency direction respected (features → domain → data → packages).

---

# Constraints

Do not:
- Change architecture or introduce new technologies.
- Modify MRD, PRD, PDD, or TDD.
- Build application features, screens, or Edge Function business logic.

Structure/config only.

---

# After Completion

1. Update SESSION.md.
2. Update PROJECT_STATUS.md.
3. Update TASK.md with the next task.
4. Recommend the next task.

The next planned task is:

Initialize the Expo application and configure GitHub Actions CI.
