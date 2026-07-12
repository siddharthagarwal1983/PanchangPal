# TASK.md

# PanchangPal — Current Task

Version: 1.0.0
Last Updated: 2026-07-12 03:40

Purpose: the current implementation task. Stay focused; avoid unrelated work unless instructed.

---

# Previous Task

## Title
Backend Foundation — SVC_* Edge Functions

Status
🟢 Independent work COMPLETE (engine-dependent compute blocked by ADR-033)

Outcome
7 SVC_* wired; OpenAI adapters + RAG pipeline; DB repositories + Supabase integration; pgvector retrieval RPC + AI operational migration; Ask Guru rate limiting + cost circuit-breaker; 10 Vitest suites + pgTAP integration; PanchangEngine abstracted (only blocked component); ADR-033 + canonical-panchang-engine work item (MRD/PRD/PDD/TDD).

---

# Current Task

## Title
Design System & Component Library

Status
🟡 Ready to Start

Priority
🔴 Critical

Estimated Effort
2–3 Sessions

---

# Objective
Populate packages/design-tokens with the PDD Part 3 §6 token values and build the CMP_*
component library in packages/ui (accessibility-first, ADR-029), bound to tokens. Structure +
components only; no product screens.

# Inputs
- docs/pdd/03_COMPONENT_LIBRARY.md (CMP_*), docs/pdd Part 3 §6 (tokens)
- docs/tdd/04_MOBILE_ARCHITECTURE.md §9 (theming/a11y/i18n)
- docs/architecture/adr/ (ADR-029 accessibility, ADR-008 state)
If ambiguous/conflicting: stop, explain, request clarification.

# Deliverables
- packages/design-tokens: tokens.ts (color/spacing/type/radius/motion, light+dark) from PDD Part 3 §6
- packages/ui: CMP_* components with role/label/state, loading/disabled/error, Reduced-Motion; component tests + a11y assertions
- theme provider wired to real tokens

# Success Criteria
- Tokens match PDD Part 3 §6; no hard-coded values in components (lint).
- Core CMP_* implemented with accessibility assertions (release-blocking, ADR-029).
- Component tests pass in CI.

# Constraints
Do not change architecture; do not build product screens/features; do not touch the panchang engine.

# After Completion
Update SESSION.md, PROJECT_STATUS.md, TASK.md; recommend next task.
Next planned task: Mobile feature slices (MOD_today first).

---

# Parallel (owner-driven, not this task)
⛔ Ratify ADR-033 (Canonical Panchang Engine) Part B to unblock SVC_panchang + sunrise/tithi notifications. See docs/architecture/canonical-panchang-engine/.
