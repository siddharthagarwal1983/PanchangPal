# TASK.md

# PanchangPal — Current Task

Version: 3.1.0
Last Updated: 2026-07-22

Purpose: the current implementation task. Stay focused; avoid unrelated work unless instructed.

---

# Previous Tasks

## M7 — Notifications (MOD_notifications)
Status: ✅ COMPLETE — reviewed/approved 2026-07-18. Opt-in priming, per-channel server-authoritative
prefs, push-token registration behind the NotificationAdapter seam, notification-tap deep-link routing
(incl. panchangpal://invite/{token}). Sunrise/tithi content gated by ADR-033.

## M8 Increment 1 — Entitlement read + gating foundation
Status: ✅ COMPLETE (approved). Household-grain (F-4) entitlement read via supabase-js RLS +
realtime seam; pure mapping/rules (isEntitled/hasFamily/activeKind); PremiumCapability registry
(deep_dive_content, extended_ask_guru) + usePremiumGate; PaymentAdapter port + NullPaymentAdapter.
Client never writes entitlements. Domain + repository tests.

## M8 Increment 2 — SCR_SUBSCRIPTION_001 + affordance wiring
Status: ✅ COMPLETE (approved; merged to main as PR #4). CMP_PLAN_CARD / CMP_VALUE_LIST / CMP_LEGAL_FOOTNOTE (a11y:
radio, text-not-color best-value, SR text equivalents); SCR_SUBSCRIPTION_001 with all states
(default/skeleton/empty/offline/error/success + already-premium) + You-hub entry + route registration;
usePlans/usePurchase/useRestore via the PaymentAdapter seam (no receipt logic on device; entitlement
never granted client-side); usePremiumGate wired at deep-dive (Settings depth) + extended Ask Guru
(contextual, dismissible). Component + hook tests. tsc-clean (jest runs in CI).

---

## M8 Increment 3 — Contextual paywall sheet + routing + FF_FAMILY_PLAN
Status: ✅ COMPLETE (merged to main as PR #7). CMP_BOTTOM_SHEET built to PDD §5.12 (it had never been
implemented); contextual paywall composed from it + CMP_PLAN_CARD at the `app/modal/paywall` route
(TDD §3.1) and reached by navigation intent so MOD_guru never imports MOD_you (§2.2); Settings
deep-dive and Ask Guru upsells now open the sheet; `panchangpal://subscription` →
SCR_SUBSCRIPTION_001 in both the linking table and notification tap routing; FF_FAMILY_PLAN offering
gate via a new fail-closed feature-flag seam (featureFlagRepository + HOOK_useFeatureFlag, ADR-021)
applied through the pure `visibleOfferings`. tsc + eslint clean; 153 tests green across mobile + ui.

**With this, Mobile MVP Phase 1 (M1–M8) is feature-complete.**

---

# Interposed (2026-07-18): first-run defect fixes — `chore/expo-sdk-54-upgrade`

Status: ✅ COMPLETE — merged to main as PR #9 (squashed, `9d22f42`). All CI gates green.

A demo attempt established that **the app had never been run**. Six defects were fixed to get it
booting on a physical iPhone: three bundle-blockers (Metro/pnpm resolution, undeclared
`@babel/runtime`, workspace `.js` specifiers), two local-backend faults (`supabase start` always
rolled back; anonymous auth disabled), and one genuine product bug (three repositories reused a
fixed Realtime channel topic, crashing SCR_YOU_001). The platform was re-baselined to Expo SDK 54
along the way, because Expo Go supports only the newest SDK and an iOS dev build needs a paid Apple
Developer membership.

It re-baselines the mobile platform (RN 0.81 / React 19 / New Architecture) and is verified only by
bundling, 121 tests, and Expo Go — **no native build has exercised it**; B3 is the first real test.
Full narrative in SESSION.md and CURRENT_MILESTONE.md → Execution Gap.

Two defects found and deliberately left open (see CURRENT_MILESTONE.md → Current Risks): repositories
throwing on absent config, and `react-native-mmkv` being unavailable in Expo Go.

---

# Previous Task — completed 2026-07-22

## Issue #30 — dates computed in UTC rather than the user's time zone
Status: ✅ COMPLETE (PR #31, all CI gates green). Four increments: the tz-aware utility ADR-026
mandated but nobody wrote (`packages/shared/src/time.ts`); adoption of the device zone into
`user_profile.timezone`, which nothing had ever written; `useLocalDate` consumed by Today and
Ritual, with null propagated rather than defaulted; and an ESLint guard **proven to fail** by
reintroducing the exact expression. 190 tests green.

## E2E gate restored
Status: ✅ COMPLETE (PR #32, all CI gates green). The gate had produced no signal since
2026-07-19: `expo-updates` pushed the Android build past its 45-minute timeout, and six runs were
cancelled by `cancel-in-progress` before any could report it. Fixed: no cancel-on-push, 90-minute
budget, Gradle cache, one ABI instead of four.

---

# Current Task

## Title
Answer the persistence question, then resume B1/B2/B3 remainders

Status
🔴 **Session persistence is still unverified.** `FLOW_SESSION_PERSISTENCE` is written and asserts
the intended post-restart state, but **no E2E run has reached the emulator**. It cannot be answered
in Expo Go either — MMKV is absent there and the store degrades to memory by design.

Next steps, in order:
1. Re-run E2E on main once #31 and #32 are merged (the single-ABI build is the one to watch).
2. Read the verdict from the flow, and from `maestro-logcat.txt` if red — the presence of
   `[ritual] Persistent storage unavailable` distinguishes "MMKV fell back to memory" from
   "MMKV was active and the session was never persisted". The two produce identical screenshots.
3. If red, fix; if green, B2 gains a real persistence assertion.

Everything else in B1/B2/B3 remains gated on money, a store account, or a later slice.

Status
🟡 **Two free engineering items remain; everything else needs a payment, a store account, or a later
slice.** B1 ~85%, B2 ~85%, B3 ~80%, none complete. The pg15/pg17 drift is closed (PR #28), leaving
one free item: verifying session persistence end-to-end.

This list was reconciled against the code on 2026-07-19 after four separate entries turned out to
describe work that had already shipped. Claims here are verified, with a file:line where one exists.
Anything that cannot be checked against the repo (hosted environment state, owner purchases) is
marked as such rather than asserted.

---

# What is actually left, by cost

## Free, and worth doing next
- [x] **Tidy the EAS credential list** (issue #25) — done 2026-07-19. The rotation left two orphan
      keystores (`4c414b1b…`, `e6220a41…`) and an empty credential entry alongside the live default;
      all three deleted via the EAS GraphQL API by explicit UUID rather than the TUI, which names
      credentials generically and gives no signal of which is default. One entry remains.
- [x] **Back up the Android keystore** — done 2026-07-19. The rotated key is stored off-machine;
      the downloaded copy and its plaintext `credentials.json` were deleted from the working tree,
      and both are now gitignored. EAS remains the second copy. Issue #25.
- [x] **`expo install expo-updates`** + runtimeVersion policy — done in PR #24 (`fingerprint` policy,
      expo-updates@~29.0.19). The eas.json/ota.yml channels now reference something real; B7 unblocked.
- [x] **Make the storage fallback observable** — done in PR #24. The app logs when it degrades to the
      legacy backend and exposes `getStorageBackend()` for programmatic inspection.
- [x] Generalize the lazy-client fix to the remaining `src/data` repositories — done in PR #14.
      All ten use the lazy `(this._db ??= getSupabase())` getter; none construct eagerly.
- [x] **Resolve the pg15 (CI) vs pg17 drift** — done in PR #28. CI runs `pgvector/pgvector:pg17`
      with `postgresql-17-pgtap`, and `supabase/config.toml` pins `major_version = 17`. Hosted
      versions were confirmed against the Supabase Management API first: dev 17.6.1.147, staging
      17.6.1.141, both engine 17. The db-tests job passed on 17 with pgTAP 1.3.4 from PGDG.
      Anyone with a local stack needs `supabase stop --no-backup` before the next `supabase start`.
- [ ] Verify session persistence actually survives a restart. Observable since PR #24
      (`getStorageBackend()`) and now ENCODED as `FLOW_SESSION_PERSISTENCE` (PR #32) — but the flow
      has never executed, because the E2E gate was dark. Still the last free engineering item.
- [x] **Fix issue #30 — UTC dates** (PR #31, 2026-07-22). Not on the original list; found while
      reading the ritual code. The daily loop stored UTC days as the user's local date, which in
      AU/NZ meant the morning ritual was recorded against yesterday all morning.
- [x] **Restore the E2E gate** (PR #32, 2026-07-22). It had reported nothing for three days.

## Costs money — owner decision
- [ ] **prod Supabase project** (~$25/mo; free tier is 2/2) — the last item in B1
- [ ] **Apple Developer** ($99/yr) — iOS builds, TestFlight; unblocks the iOS half of B3
- [ ] **Google Play** ($25 one-time) — Play Internal track

## Blocked on other slices
- [ ] `promote-production` end-to-end — B7/B8 must implement the job first
- [ ] Sentry source-map upload (§2.3) — depends on B4
- [ ] `FLOW_HOUSEHOLD_INVITE` — needs SVC_household; subscription flow — needs
      react-native-purchases; `FLOW_ONBOARDING` — unreachable while `ONBOARDED = true`

---

# Constraints
No product/architecture change. Prod changes go through CI only (§1.3). Secrets are never printed
or committed — the pooler resolver exists so a DB password stays inside its CI secret permanently.
Provisioning cloud projects and placing credentials is owner-performed.

---

# Previous Task — B1/B2/B3 build-out (2026-07-18/19)
See SESSION.md and CURRENT_MILESTONE.md → Execution Gap. 14 PRs, 12 defects, the app executed for
the first time, CI/CD/E2E all made to do real work.

---

