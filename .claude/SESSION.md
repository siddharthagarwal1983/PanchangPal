# SESSION.md

# PanchangPal — Current Session

Version: 1.0.0
Last Updated: 2026-07-12 05:10

Purpose: records the current working session. Not permanent project memory.

---

# Session Objective

Implement Mobile MVP Milestone 5 — Ask Guru Client (SCR_GURU_*) within MOD_guru.
Architecture-first; panchang stays behind the frozen abstraction; do not touch ADR-033.

---

# Work Completed (Milestone 2 — Today / SCR_HOME_001)

- Today components (9 CMP_* in @panchangpal/ui): Card, PrimaryButton, LocationChip,
  PanchangCard (default/loading/offline/error/UNAVAILABLE states), RitualCard (3 states),
  StreakCounter (grace-aware, secondary, no loss-framing), Checklist (+item, role=checkbox,
  optimistic), RotatingElement, FestivalCard (conditional). Tokens-only, a11y, no hardcoded hex.
- Panchang provider abstraction (client mirror of the frozen PanchangEngine seam):
  PanchangProvider interface; ProductionPanchangProvider (API_GET_TODAY → 'unavailable' while
  engine blocked, ADR-033, never fabricated); dev-only MockPanchangProvider.dev.ts imported
  ONLY by tests (verified) — production code never depends on it.
- Data: TodayRepository (API_GET_TODAY, ritual complete, checklist); hooks useToday
  (cached-first), useChecklist + useToggleChecklistItem (optimistic + offline-queue + revert),
  useCompleteRitual (optimistic + server-derived streak).
- Domain: StreakService, RitualProgressService (pure view logic).
- SCR_HOME_001 composed from CMP_* + hooks + domain — no business logic in the screen.
  Panchang card shows the calm "temporarily unavailable" state; ritual/streak/checklist/
  reflection are functional. i18n keys added.
- Visualized the Today screen in the side panel (production unavailable + dev-mock preview).
- Tests: today-domain (streak/ritual/mock), today-components (panchang states, checklist role/
  toggle, ritual states).

---

# Work Completed (Milestone 3 — Guided Ritual Player / SCR_RITUAL_001)

- Reusable ritual domain: `RitualSession`, pure session model, and `RitualEngine` own begin,
  next, skip, pause, resume, leave, restore, and a dedicated `completed` state. Screens consume
  `RitualPlayerViewModel` and only forward intents.
- Persistence/data: MMKV-backed `RitualSessionRepository` saves the complete session for offline
  app-restores; `RitualRepository` + `useRitualToday` keep server ritual content in Query.
- Audio is deliberately an `AudioAdapter` port with `NullAudioAdapter`; written guidance remains
  fully functional and announces the audio-unavailable fallback. No playback library was added.
- UI: SCR_RITUAL_001 route plus CMP_RITUAL_INTRO, RITUAL_STEP, PROGRESS_RING, AUDIO_CONTROLS,
  and COMPLETION_MOMENT; token-bound, localized, screen-reader labeled, Reduced-Motion safe.
- Tests: RitualEngine transitions/audio port/restore; RitualSessionRepository persistence;
  ritual component interactions, progress semantics, text-only fallback, completion alert.

---

# Work Completed (Milestone 4 — Calendar Shell / SCR_CALENDAR_001)

- Calendar month domain models the Gregorian grid and safe month navigation only; it has no
  spiritual-calendar or event-computation logic.
- ProductionCalendarProvider reports `ERR_PANCHANG_UNAVAILABLE` while ADR-033 remains blocked;
  CalendarRepository and `useCalendarMonth` establish the future API/cache seam without
  fabricating festival, vrat, or panchang markers.
- SCR_CALENDAR_001 now composes CMP_MONTH_NAV, CMP_MONTH_GRID, CMP_DAY_CELL, and
  CMP_TRADITION_SWITCHER. It supports selected dates, Today/previous/next controls, Dynamic Type,
  screen-reader labels, and a calm unavailable message.
- Tests cover month layout/navigation, provider/repository normalization, and calendar component
  interactions and accessibility semantics.

---

# Architecture Compliance

No architecture changes. Panchang stays behind PanchangProvider; ADR-033 untouched; NO
astronomical calculations; MockPanchangProvider is dev/test-only (production uses the real
provider → unavailable). No business logic in the screen. Tokens-only; localized strings;
loading/empty/offline/error states. Reused M1 Screen/AppHeader; extended the component library.

---

# Validation

20 CMP_* components; 9 M2 domain/data files; 2 M2 test suites. Mock imported only by tests
(grep-verified). No hardcoded hex. JSON valid. No live run (offline sandbox) — tsc/jest in CI.

---

# Remaining Work / Blockers

Milestone 4 complete. Blocker unchanged: ⛔ Canonical Panchang Engine (ADR-033) — Today's
panchang card + festival stay "unavailable"/hidden until ratified. Ritual audio playback is
intentionally not implemented: the NullAudioAdapter preserves the full text-guided flow until a
production audio adapter is separately approved. Verification could not complete in this sandbox
because package-manager dependency downloads fail after the network is unavailable.

---

# Current Work

Milestone 5 was authorized on 2026-07-12. Scope: Ask Guru client (home, conversation, and
history) with server-owned SSE, sources, honest declines, and accessible streaming states. Live
answers remain gated by reviewed corpus/evaluation readiness; the client must never fabricate an
answer or call an LLM directly.
