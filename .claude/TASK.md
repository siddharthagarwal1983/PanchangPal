# TASK.md

# PanchangPal — Current Task

Version: 3.2.0
Last Updated: 2026-07-25

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

# Previous Task — completed 2026-07-25

## Answer the persistence question — DONE. Sessions survive a restart.
Status: ✅ COMPLETE. Three moves, in order:

1. **PR #35 (merged) — E2E build fixed.** The single-ABI run had failed in `assembleRelease` at ~11
   min, then Gradle hung ~80 min until the 90-min timeout killed it as `cancelled` (a red build
   disguised as a timeout). Fixed workflow-only: `timeout --kill-after=2m 40m` + `--stacktrace` on the
   Build APK step, and dropped release-only work the emulator APK doesn't need (release `lintVital`,
   `mergeReleaseNativeDebugMetadata`). Build green in ~10 min; flows finally ran.
2. **Verdict read.** `FLOW_SESSION_PERSISTENCE` failed — sessions did not survive a restart. Logcat
   root cause: `react-native-mmkv@2.12.2` is incompatible with the New Architecture (bridgeless), so
   MMKV's JSI never installed and the ritual store silently ran on its in-memory fallback. A
   dependency-version bug; `ritualSessionRepository` was correct.
3. **PR #36 (open, CI green) — the fix.** MMKV v2→v4.3.2 (Nitro, bridgeless-compatible) + nitro peer;
   v4 API (`createMMKV()`, `delete`→`remove`) absorbed at the port; jest mock for v4's eager nitro
   import. **E2E on a native build (run 30155737941): all three flows GREEN, FLOW_SESSION_PERSISTENCE
   PASSED.** No memory fallback. 176 tests, tsc, eslint all clean.

**With this, B2 (E2E verification) is COMPLETE** — bundle gate + the three in-scope Maestro flows
green in CI on a real native build. Canonical progress 0% → 13% (1 of 8 Beta slices).

---

# Current Task

## Title
Merge PR #36, then start B4 — Observability

Status
🟢 **PR #36 open, CI green, pending merge.** On merge, main's E2E returns green (it went honestly red
after #35 exposed the MMKV bug). Then B4 — Observability (Sentry wiring, source-map upload,
dashboards/alerts, §2.3/§B4) is the next slice with unblocked engineering. B1/B3 remainders stay
owner-gated (prod Supabase ~$25/mo closes B1; Apple $99 + Google Play $25 close most of B3).

The remaining Maestro flows are still out of B2/engineering reach: `FLOW_ONBOARDING` unreachable while
`ONBOARDED = true` (`app/index.tsx:16`); `FLOW_HOUSEHOLD_INVITE` needs SVC_household; `FLOW_ASK_GURU`
only exercises the gated path (GURU_LIVE=false).

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
- [x] **Verify session persistence survives a restart — DONE 2026-07-25.** Fixed the E2E build
      (PR #35, fail-fast + trim), which let `FLOW_SESSION_PERSISTENCE` run; it caught a real bug
      (mmkv v2 incompatible with New Arch → silent memory fallback); fixed by MMKV v2→v4 (PR #36).
      E2E run 30155737941: all three flows GREEN, persistence PASSED. B2 complete.
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

