# SESSION.md

# PanchangPal — Current Session

Version: 1.0.0
Last Updated: 2026-07-12 06:00

Purpose: records the current working session. Not permanent project memory.

---

# Session Objective

Continue and complete Mobile MVP Milestone 5 — Ask Guru Client (SCR_GURU_*). Architecture-first;
client uses the server SSE adapter only; no LLM/fabrication; live answers stay corpus/eval-gated.

---

# Work Completed (this session — M5 completion)

Started from the partial M5 (home + chat streaming + AIChatBubble/ChatInput/GuruHeader/
SourceChip/TypingIndicator + answer-state reducer + UnavailableGuruTransport). Filled the gaps:

- SSE transport: generalized parseGuruSseFrame to also read the server's data-only frames
  (type in JSON) while keeping the tested named-event form. Added ProductionGuruTransport (real
  streaming fetch to SVC_ask_guru; yields token/sources/done; maps network/504 to calm error/
  timeout; never fabricates). Added a readiness-gated factory getGuruTransport() — GURU_LIVE=false,
  so the app streams UnavailableGuruTransport (honest decline) until §10B corpus/eval readiness.
- Cached history (SCR_GURU_HISTORY_001): LocalGuruHistoryRepository (owner-only, records question
  + server outcome only, never an answer; persistence seam for MMKV), useGuruHistory hook,
  record-on-ask in useAskGuru, CMP_CONVERSATION_ROW component, composed history list with empty state.
- Chat refinement: distinct trust-safe copy per PDD §5.4 — refused (out-of-scope) vs declined
  (low-confidence) vs error (calm retry); grounded answers show the bubble + source chips; the
  answer bubble is never shown for non-grounded outcomes. Offline disables input; mid-stream drop
  → calm error + retry.
- i18n: declined/refused/error/retry + history outcome labels.
- Tests: guru-transport (data-frame parse, streaming, network/timeout error, gate off), guru-history
  (record/dedupe/clear/shape), guru-components (ConversationRow/SourceChip/TypingIndicator a11y).
- Visualized Ask Guru states (home, grounded, honest decline, error+retry) in the side panel.

---

# Architecture Compliance

No architecture changes. Client calls only the server SSE adapter — no OpenAI/LLM refs anywhere
(grep-verified), never fabricates, never infers an outcome (server-owned). Live answers gated
(GURU_LIVE=false). No panchang-engine changes; ADR-033 untouched. Tokens-only, localized, a11y.

---

# Validation

New: 5 domain/data files + 1 CMP_* (ConversationRow) + 3 test suites. No hardcoded hex. GURU_LIVE
false + factory returns UnavailableGuruTransport (verified). No live run (offline sandbox) — tsc/jest in CI.

---

# Remaining Work / Blockers

Milestone 5 complete. Blockers:
- ⛔ Canonical Panchang Engine (ADR-033) — unrelated to Ask Guru.
- Ask Guru live answers remain OFF (GURU_LIVE=false) pending reviewed corpus + eval readiness
  (§9/§10B). Flipping GURU_LIVE is the only change to go live once ready.
Deferred: source-chip → source sheet (CMP_INFO_SHEET), helpful rating (EVT_032), conversation
thread persistence to server (client history is the offline cache).

Note: DASHBOARD.md + CURRENT_MILESTONE.md still describe the older "Repository & Platform
Foundation" milestone and are stale vs the Mobile MVP M1–M5 track — worth reconciling.

---

# STOP

Milestone 5 complete. Do NOT begin the next milestone. Awaiting review + approval.
Recommended next: Profile/Household module (MOD_you), or Calendar detail once ADR-033 is ratified.
