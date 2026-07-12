# TASK.md

# PanchangPal — Current Task

Version: 2.0.0
Last Updated: 2026-07-13

Purpose: the current implementation task. Stay focused; avoid unrelated work unless instructed.

---

# Previous Task

## Title
Mobile MVP Milestone 6 — Profile / Household (MOD_you)

Status
✅ COMPLETE — all three increments delivered (awaiting review).

Outcome
- Increment 1 — Preferences + Settings + Profile (server-authoritative prefs, optimistic + offline;
  SCR_SETTINGS_001, SCR_PROFILE_001; Segmented/Toggle/SettingsRow).
- Increment 2 — Household (members/roles/depth, invites, realtime): household/member domain,
  householdRepository (RLS read + SVC_household writes via OpenAPI paths + Realtime seam),
  HOOK_useHousehold/useInvite, CMP_MEMBER_ROW/ROLE_PICKER/SHARE_BUTTON/INVITE_*; SCR_HOUSEHOLD_001
  recomposed + SCR_HOUSEHOLD_INVITE_001.
- Increment 3 — Account deletion (F-3 gate + grace window): account domain, accountRepository
  (SVC_account reauth/delete/transfer), useAccountDeletion, CMP_CONSEQUENCES_PANEL/DESTRUCTIVE_ACTION;
  SCR_DELETE_ACCOUNT_001 + Settings entry.
Also aligned householdRepository to the OpenAPI-path invoke convention (no public-API change).

---

# Current Task

## Title
Mobile MVP Milestone 7 — Notifications (MOD_notifications)

Status
⏳ NOT STARTED — do not begin until M6 is reviewed/approved.

Priority
🔴 Critical

Estimated Effort
1–2 Sessions

---

# Objective
Build the Notifications slice: opt-in priming, per-channel preferences (server-authoritative),
Expo push-token registration, and deep-link routing — including the `panchangpal://invite/{token}`
route into the invite-accept screen (SCR_HOUSEHOLD_INVITE_001). Reuse CMP_* + existing seams; no new
architecture. Sunrise/tithi-timed notifications remain gated by ADR-033 (calm "unavailable").

# Inputs
- docs/tdd/04_MOBILE_ARCHITECTURE.md (§3 routing/deep links, §4 state, §5 hooks, §5.4 realtime)
- docs/pdd/03_COMPONENT_LIBRARY.md (notification opt-in / settings CMP_*)
- docs/pdd/02_USER_FLOWS.md (notification priming + deep-link flows)
- docs/api/openapi.yaml (notification token registration + preferences endpoints)
- apps/backend/functions/notify-scheduler (existing SVC scheduler)
If ambiguous/conflicting: stop, explain, request clarification.

# Deliverables (to plan at kickoff)
- [ ] Opt-in priming screen/flow (deferred, non-nagging; UX-2)
- [ ] Per-channel notification preferences (server-authoritative, optimistic + offline)
- [ ] Expo push-token registration + NotificationAdapter seam
- [ ] Deep-link routing (incl. panchangpal://invite/{token} → invite accept)
- [ ] Unit/component/domain tests

# Success Criteria
- Screens compose approved CMP_* with tokens-only styling + localized strings; no business logic in
  screens; loading/empty/offline/error states covered.
- Notification prefs are server-authoritative and optimistic; the daily loop is never gated.
- Sunrise/tithi-timed notifications surface a calm "unavailable" state until ADR-033 is ratified.
- Unit/component/domain tests pass in CI.

# Constraints
Do not change architecture; do not touch the panchang engine; no cross-feature imports; no
fabricated data; no hardcoded tokens.

# After Completion
Update SESSION.md, PROJECT_STATUS.md, TASK.md; stop for review.

---

# Parallel (owner-driven, not this task)
⛔ Ratify ADR-033 (Canonical Panchang Engine) Part B. See docs/architecture/canonical-panchang-engine/.
ℹ️ Implement backend SVC_household Edge Function (member/invite endpoints — client contract already coded in M6).
