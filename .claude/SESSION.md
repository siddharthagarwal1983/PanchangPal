# SESSION.md

# PanchangPal — Current Session

Version: 1.7.0
Last Updated: 2026-07-18

Date/Time: 2026-07-18.

---

# Session Objective

M8 Increment 2 approved (already merged to main as PR #4 — no merge was pending). Implement Mobile
MVP Milestone 8 — Subscription, **Increment 3**: contextual paywall sheet, `panchangpal://subscription`
routing, and FF_FAMILY_PLAN. This closes the Subscription slice and the Mobile MVP milestone.

---

# Work Completed (M8 Increment 3 — merged to main as PR #7)

- **CMP_BOTTOM_SHEET (`packages/ui/src/components/BottomSheet.tsx`, new):** the PDD §5.12 component
  was specified but had never been implemented. Built to spec — grabber/title/content, `radius.lg`
  top corners over `colors.scrim`, `height` = auto|half|full, `dismissible` = true|required-decision,
  `accessibilityViewIsModal` (SR focus trap, returns to opener), and Reduced-Motion fade-in-place
  instead of slide (PDD §4). Tokens-only; `reduceMotion` is a prop so the ui package stays a leaf.
- **Contextual paywall (`apps/mobile/app/modal/paywall.tsx`, new):** a COMPOSITION of
  CMP_BOTTOM_SHEET + CMP_PLAN_CARD (no new CMP_*). Built as a **route**, not a shared component:
  MOD_guru and MOD_you both open it, and TDD §2.2 forbids cross-feature imports — contextual
  cross-links go through navigation intents. TDD §3.1 already designates `modal/*` for
  "bottom sheets, dialogs, paywall". Registered in `app/_layout.tsx` as `transparentModal`.
  Capability-specific copy via `?capability=`; always dismissible (AC-SUB-01).
- **Affordance rewiring:** Settings "Content depth → Deep" and the Ask Guru post-answer upsell now
  open the sheet (`/modal/paywall?capability=…`), replacing both inline upsell Cards.
- **Deep-link routing:** `panchangpal://subscription` → `/(tabs)/you/subscription` in
  `navigation/linking.ts` AND in `domain/notifications` (`routeForDeepLink` + `routeForNotifType`) —
  both previously fell back to the You hub because SCR_SUBSCRIPTION_001 didn't exist yet.
- **FF_FAMILY_PLAN:** no client feature-flag read existed. Added `data/featureFlagRepository.ts`
  (public-select read of `feature_flag` + Realtime invalidation, ADR-021) and
  `data/hooks/useFeatureFlag.ts`. **Fails closed** — loading, error, or an absent key all read
  `false`, so unreleased scope can never leak on. Gating applied through the pure
  `visibleOfferings(offerings, familyPlanEnabled)` domain function, used by both the paywall and
  SCR_SUBSCRIPTION_001. It is an OFFERING gate, not a capability gate.
- **i18n:** `actions.notNow`, `subscription.seeAllPlans`.
- **Tests:** `overlay-components.test.tsx` (sheet a11y modal, scrim dismiss, required-decision blocks
  dismiss, Reduced-Motion fade) · `featureFlagRepository.test.ts` (fail-closed mapping) ·
  `visibleOfferings` domain cases · subscription deep-link/tap-routing assertions.

---

# Files Created (5)
packages/ui/src/components/BottomSheet.tsx · apps/mobile/app/modal/paywall.tsx ·
apps/mobile/src/data/featureFlagRepository.ts · apps/mobile/src/data/hooks/useFeatureFlag.ts
(+ tests: packages/ui/.../overlay-components.test.tsx · apps/mobile/.../featureFlagRepository.test.ts)

# Files Modified (11)
packages/ui/src/index.ts · apps/mobile/app/_layout.tsx · app/(tabs)/you/settings.tsx ·
app/(tabs)/you/subscription.tsx · app/(tabs)/guru/chat.tsx · src/navigation/linking.ts ·
src/domain/notifications/notifications.ts · src/domain/subscription/{entitlement,index}.ts ·
src/i18n/en-US.ts (+ 2 test files updated)

---

# Important Observations
- **Verification is green in this sandbox** — `tsc --noEmit` clean for both `apps/mobile` and
  `packages/ui`; eslint reports 0 errors (14 pre-existing `no-non-null-assertion` warnings);
  jest passes **21 suites / 120 tests** (mobile) and **5 suites / 33 tests** (ui).
- **Two SESSION.md notes from the previous session are now stale and were corrected:** jest DOES run
  here (the `transformIgnorePatterns` failure is gone), and the `notifications.ts:156` tsc error no
  longer reproduces (the nullish guard is present).
- Two documented gaps were closed rather than worked around: CMP_BOTTOM_SHEET had never been built
  despite four components declaring it a dependency, and no client ever read the `feature_flag`
  table even though it ships with RLS + seed data.
- `react-native-purchases` still deferred: NullPaymentAdapter returns no offerings, so the paywall
  shows its calm "unavailable" state today. The RevenueCat adapter is a one-line swap.

---

# Blockers (unchanged)
Canonical Panchang Engine (ADR-033). Ask Guru GURU_LIVE gate. Backend SVC_revenuecat_webhook +
SVC_household + SVC_notify_scheduler remain pending server deliverables. Increment 3 is committed
locally only if the owner pushes — this session did not push.

---

# Pending Work
M8 Increment 3 shipped (PR #7, CI + CD green on main). The **Beta Readiness & Platform Hardening**
milestone is now open and sliced B1–B8 in CURRENT_MILESTONE.md. TASK.md is set to **B1 —
Environments & secrets (fail-closed)**.

---

# Milestone transition note (2026-07-18)

Before slicing, the CD pipeline was inspected rather than trusted. Findings that shaped the slicing:

- `scripts/migrate.sh` hard-fails on an empty DB URL (`${1:?}`) and ran 1m22s → the **staging
  Supabase project is real** and migrations genuinely applied. Edge Function deploys are real too.
- The **Maestro E2E job is a placeholder** (`echo "maestro test tests/flows"`); there is no
  `.maestro/` directory and no FLOW_* specs. It "passed" in 5s.
- The **EAS build job is a placeholder**; there is no `eas.json`. It "passed" in 19s.
- `scripts/preflight.sh` **warns** on unset secrets and then `exit 0` — it cannot fail a deploy.

So CD's green status currently overstates what is verified. B1 (environments + fail-closed
preflight) and B2 (real E2E) are sequenced first for that reason.

---

# Recommended Next Task
**B1 — Environments & secrets.** Provision dev + prod Supabase projects alongside staging, place
per-environment secrets per §4.1, and make `preflight.sh` fail closed so a missing required secret
blocks the job. Note the provisioning and credential placement are owner-performed — this session
can prepare scripts, config, and instructions but must not handle credential values.
