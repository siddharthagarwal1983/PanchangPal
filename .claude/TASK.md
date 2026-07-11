# TASK.md

# PanchangPal — Current Task

Version: 1.0.0

Last Updated: 2026-07-12 01:30

Purpose:
This document defines the current implementation task.
Claude should stay focused on this task and avoid expanding into unrelated work unless explicitly instructed.

---

# Previous Task

## Title

Repository Scaffolding & Shared Packages

Status

✅ Complete

Outcome

pnpm + Turborepo monorepo scaffolded per TDD Part 1 §4: root config; packages/shared (ERR_*/EVT_*/enums), packages/api (zod contracts), packages/database (TBL_* + RLS refs), packages/ui + design-tokens + ai stubs; apps/mobile Expo skeleton; apps/backend functions placeholders; scripts/tests/.github READMEs. JSON valid, no dependency cycles, layout matches §4.

---

# Current Task

## Title

Initialize the Expo Application & Configure GitHub Actions CI

Status

🟡 Ready to Start

Priority

🔴 Critical

Estimated Effort

1–2 Sessions

---

# Objective

Turn the apps/mobile skeleton into a runnable Expo app (toolchain + core runtime deps + navigation skeleton + theme provider), and stand up the GitHub Actions CI/CD pipeline per ADR-024. Structure/pipeline only — no product features.

---

# Inputs

Use only approved documentation:

- docs/tdd/01_SYSTEM_ARCHITECTURE.md §2.3/§2.4 (app internals, deployment), §3 (stack), §5 (standards)
- docs/tdd/04_MOBILE_ARCHITECTURE.md (mobile architecture)
- docs/tdd/05_PLATFORM_DEVOPS.md (CI/CD gates)
- docs/architecture/adr/ (ADR-002 Expo/EAS, ADR-024 delivery/OTA, ADR-029 a11y gate)

If documentation is ambiguous or conflicting: Stop, explain, request clarification.

---

# Deliverables

- apps/mobile: Expo runtime deps, Expo Router 4-tab skeleton (UX-1), theme provider bound to @panchangpal/design-tokens, Zustand + TanStack Query providers wired (no features).
- .github/workflows: CI pipeline (lint/typecheck/test → migrations → function deploy → EAS build), with accessibility + RLS-policy-suite + API-contract gates.
- scripts/: migrate / codegen wrappers as needed by CI.

---

# Success Criteria

- `pnpm install` + `pnpm typecheck` pass in CI.
- Expo app boots to an empty 4-tab shell.
- CI pipeline defined with the ADR-024 stages and release-blocking gates.
- No product features or Edge Function business logic added.

---

# Constraints

Do not:
- Change architecture or introduce new technologies.
- Modify MRD, PRD, PDD, or TDD.
- Build product screens, ritual/AI/household features, or SVC_* business logic.

---

# After Completion

1. Update SESSION.md.
2. Update PROJECT_STATUS.md.
3. Update TASK.md with the next task.
4. Recommend the next task.

The next planned task is:

Backend Foundation — implement the SVC_* Edge Functions against the API_* contracts.
