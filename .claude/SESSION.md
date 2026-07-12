# SESSION.md

# PanchangPal — Current Session

Version: 1.3.0
Last Updated: 2026-07-13

Date/Time: 2026-07-13.

---

# Session Objective

Complete Mobile MVP Milestone 6 (Profile / Household, MOD_you) by implementing the two remaining
increments on the reviewed Increment-1 foundation: Increment 2 — Household, and Increment 3 —
Account deletion. No architecture changes; reuse CMP_* + existing seams.

---

# Work Completed

- **Increment 2 — Household:** household/member domain (pure mapping with safe enum fallbacks +
  rules: sort, initials, canManage, isSolo); `householdRepository` (RLS read via supabase-js +
  SVC_household writes + Realtime member seam); `HOOK_useHousehold` (query + realtime invalidate,
  optimistic member add/edit/remove) and `HOOK_useInvite` (create/preview/accept, idempotent,
  deferred-auth); CMP_MEMBER_ROW / ROLE_PICKER / SHARE_BUTTON / INVITE_* ; SCR_HOUSEHOLD_001
  recomposed from shell to the real feature + SCR_HOUSEHOLD_INVITE_001; i18n; domain + repo tests.
- **Increment 3 — Account deletion:** account domain (F-3 gate mirroring SVC_account
  `canDeleteAccount`); `accountRepository` (reauth / delete / ownership-transfer via SVC_account);
  `useAccountDeletion` (reauth → grace-window request → return to anon session); CMP_CONSEQUENCES_PANEL
  / CMP_DESTRUCTIVE_ACTION; SCR_DELETE_ACCOUNT_001 + authenticated-only Settings entry; i18n; tests.
- **Convention fix:** `householdRepository` switched from a body-`action` dispatch to OpenAPI-path
  `functions.invoke` (matches `account/merge`, `panchang/…`); its test updated. Public methods
  unchanged — no impact on hooks/screens.

M6 (all three increments) is now implemented client-side, awaiting review.

---

# Files Created (22)
domain/household/{types,household,index}.ts · data/householdRepository.ts ·
data/hooks/{useHousehold,useInvite}.ts · ui/{MemberRow,RolePicker,ShareButton,InviteCards}.tsx ·
app/(tabs)/you/invite.tsx · __tests__/{household,householdRepository}.test.* ·
domain/account/{deletion,index}.ts · data/accountRepository.ts · data/hooks/useAccountDeletion.ts ·
ui/{ConsequencesPanel,DestructiveAction}.tsx · app/(tabs)/you/delete-account.tsx ·
__tests__/{account-deletion,accountRepository}.test.*

# Files Modified (4)
packages/ui/src/index.ts (barrel exports) · app/(tabs)/you/household.tsx (shell → feature) ·
app/(tabs)/you/settings.tsx (delete-account entry) · apps/mobile/src/i18n/en-US.ts
(household/invite/deleteAccount keys)

---

# Important Observations
- No backend **SVC_household** Edge Function exists yet — member/invite calls are the client's
  OpenAPI contract (a pending backend deliverable). Transfer/delete use **SVC_account** (exists).
- Sandbox has no installed dependencies → tsc/jest/vitest run in CI. Static verification clean:
  all i18n keys resolve, all `@panchangpal/ui` imports exported, no hardcoded hex, no cross-feature
  imports, en-US braces balanced, all files brace/paren-balanced.
- Deletion is a reversible grace-window request; the server stays authoritative and re-checks F-3.
- A stray empty `.claude/.write_test_5` was left by a write-probe (the `.claude` dir is read-only
  to this session and blocks unlink) — delete it on the Mac: `rm .claude/.write_test_5`.

---

# Blockers (unchanged)
⛔ Canonical Panchang Engine (ADR-033). 🔒 Ask Guru GURU_LIVE gate. Cannot commit/push from the
session (Cowork GitHub connector read-only; user pushes from their Mac).

---

# Pending Work
M6 review (Increments 1–3 + the householdRepository convention fix); then M7 Notifications
(including the `panchangpal://invite/{token}` deep link into the invite-accept screen) and M8
Subscription.

---

# Recommended Next Task
Review M6. On approval, begin **M7 — Notifications** (opt-in priming, per-channel prefs, token
registration, deep-link routing). Do not start M7 until approved.
