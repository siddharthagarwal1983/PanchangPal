# TASK.md

# PanchangPal — Current Task

Version: 3.0.0
Last Updated: 2026-07-19

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

# Current Task

## Title
Beta Readiness — B1/B2/B3 remainders (all gated on money, accounts, or later slices)

Status
🟡 **No engineering task is currently blocked on engineering.** B1 ~85%, B2 ~85%, B3 ~80%; none
complete, and every remaining item needs a payment, a store account, or a later slice.

---

# What is actually left, by cost

## Free, and worth doing next
- [x] **Tidy the EAS credential list** (issue #25) — done 2026-07-19. The rotation left two orphan
      keystores (`4c414b1b…`, `e6220a41…`) and an empty credential entry alongside the live default;
      all three deleted via the EAS GraphQL API by explicit UUID rather than the TUI, which names
      credentials generically and gives no signal of which is default. One entry remains.
- [ ] **Back up the Android keystore** — the last unverified item, and now about the *rotated* key.
      EAS holds the only copy of the signing identity for `com.panchangpal.app`; losing it means
      never updating a published app. The backup goes in a password manager, never in the repo.
- [x] **`expo install expo-updates`** + runtimeVersion policy — done in PR #24 (`fingerprint` policy,
      expo-updates@~29.0.19). The eas.json/ota.yml channels now reference something real; B7 unblocked.
- [x] **Make the storage fallback observable** — done in PR #24. The app logs when it degrades to the
      legacy backend and exposes `getStorageBackend()` for programmatic inspection.
- [ ] Generalize the lazy-client fix to the seven remaining `src/data` repositories.
- [ ] Resolve the pg15 (CI) vs pg17 (dev + staging) drift.

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

