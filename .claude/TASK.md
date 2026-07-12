# TASK.md

# PanchangPal — Current Task

Version: 1.0.0
Last Updated: 2026-07-12 05:10

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
Mobile MVP Milestone 3 — Guided Ritual Player (MOD_today / SCR_RITUAL_001)

Status
✅ COMPLETE — awaiting review/approval

Priority
🔴 Critical

Estimated Effort
2–3 Sessions

---

# Objective
Implement the guided ritual experience: intro, resumable text steps, accessible progress,
audio-control seam with text fallback, optimistic once-per-day completion, and a calm
Reduced-Motion-safe completion moment. Keep server data in TanStack Query and only the
persisted ritual-resume pointer in Zustand. Actual audio playback/file caching requires an
approved audio adapter; do not introduce one without approval.

# Inputs
- docs/pdd/02_USER_FLOWS.md (SCR_RITUAL_001), docs/pdd/03_COMPONENT_LIBRARY.md (§5.9)
- docs/tdd/04_MOBILE_ARCHITECTURE.md (§§3–7, 9)
- docs/architecture/adr/ (ADR-029 accessibility, ADR-008 state, ADR-015 offline)
If ambiguous/conflicting: stop, explain, request clarification.

# Deliverables
- SCR_RITUAL_001 route, navigation from Today, and server-state ritual query hook/repository
- CMP_RITUAL_INTRO, CMP_RITUAL_STEP, CMP_PROGRESS_RING, CMP_AUDIO_CONTROLS, CMP_COMPLETION_MOMENT
- Resume pointer, optimistic completion, leave-confirm flow, i18n, component/domain tests and a11y assertions

# Success Criteria
- All SCR_RITUAL_001 acceptance criteria pass except actual playback/cache, which remains explicitly adapter-blocked.
- Text guidance works offline from cache; audio gracefully degrades to text-only.
- Completion is idempotent, optimistic, queued, and server-derived for streak state.
- Reduced Motion, Dynamic Type, screen-reader semantics, and ≥44/48pt targets are verified.

# Constraints
Do not change architecture; do not touch the panchang engine; do not add an audio framework
or fabricate ritual content/playback.

# Outcome
- Reusable RitualSession model + RitualEngine manage begin, next, skip, pause, resume, leave,
  dedicated completion, and persisted restore.
- RitualSessionRepository persists full sessions locally through MMKV; RitualRepository supplies
  server ritual content via the data layer; UI consumes RitualPlayerViewModel only.
- AudioAdapter / NullAudioAdapter provide text-first, safe audio fallback with no playback library.
- SCR_RITUAL_001 and CMP_RITUAL_INTRO/STEP/PROGRESS_RING/AUDIO_CONTROLS/COMPLETION_MOMENT are
  accessible, token-bound, localized, and covered by domain/repository/component tests.

# After Completion
Stop for review. Recommended next task: Calendar shell (MOD_calendar).

---

# Parallel (owner-driven, not this task)
⛔ Ratify ADR-033 (Canonical Panchang Engine) Part B to unblock SVC_panchang + sunrise/tithi notifications. See docs/architecture/canonical-panchang-engine/.
