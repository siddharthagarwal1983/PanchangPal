# TASK.md

# PanchangPal — Current Task

Version: 1.0.0
Last Updated: 2026-07-12 05:10

Purpose: the current implementation task. Stay focused; avoid unrelated work unless instructed.

---

# Previous Task

## Title
Mobile MVP Milestone 4 — Calendar Shell (MOD_calendar / SCR_CALENDAR_001)

Status
✅ COMPLETE — awaiting review/approval

Outcome
7 SVC_* wired; OpenAI adapters + RAG pipeline; DB repositories + Supabase integration; pgvector retrieval RPC + AI operational migration; Ask Guru rate limiting + cost circuit-breaker; 10 Vitest suites + pgTAP integration; PanchangEngine abstracted (only blocked component); ADR-033 + canonical-panchang-engine work item (MRD/PRD/PDD/TDD).

---

# Current Task

## Title
Mobile MVP Milestone 5 — Ask Guru Client (MOD_guru / SCR_GURU_*)

Status
🟡 IN PROGRESS — authorized 2026-07-12

Priority
🔴 Critical

Estimated Effort
2–3 Sessions

---

# Objective
Build the grounded Ask Guru client: trust-first home, conversation, streamed answer states,
sources, honest declines, and cached history. The client uses the API/SSE adapter only; it never
calls an LLM directly or fabricates an answer. Live answers remain gated by reviewed corpus and
evaluation readiness.

# Inputs
- docs/pdd/02_USER_FLOWS.md (SCR_GURU_*), docs/pdd/03_COMPONENT_LIBRARY.md (§5.10)
- docs/pdd/04_SCREEN_SPECIFICATIONS.md (§9), docs/tdd/03_AI_RAG.md, docs/tdd/04_MOBILE_ARCHITECTURE.md (§7.1)
- docs/architecture/adr/ (ADR-011 AI provider, ADR-029 accessibility)
If ambiguous/conflicting: stop, explain, request clarification.

# Deliverables
- SCR_GURU_HOME_001, SCR_GURU_CHAT_001, and SCR_GURU_HISTORY_001 routes composed from approved
  CMP_AI_* components
- SSE/data adapter, query hooks, source/decline/error/offline states, and cached history
- Localized copy plus component/domain/UI interaction tests and a11y assertions

# Success Criteria
- Every response carries sources or an honest decline; no model/API details reach the user.
- Streaming states are accessible and safely recover from errors/offline interruption.
- Client calls only server-side API/SSE adapters; no direct provider key or LLM access.
- Tokens-only styling, localized strings, and test coverage pass in CI.

# Constraints
Do not change architecture; do not touch the panchang engine; do not add prompts, retrieval logic,
or business rules on the client; do not present a live answer until corpus/eval readiness permits.

# After Completion
Update SESSION.md, PROJECT_STATUS.md, and TASK.md; stop for review. Recommended next task:
profile/household module, or calendar detail after ADR-033 is ratified.

---

# Parallel (owner-driven, not this task)
⛔ Ratify ADR-033 (Canonical Panchang Engine) Part B to unblock SVC_panchang + sunrise/tithi notifications. See docs/architecture/canonical-panchang-engine/.
