# SESSION.md

# PanchangPal — Current Session

Version: 2.2.0
Last Updated: 2026-07-26 (main's E2E is GREEN; #53 verified; the ANR cause removed at the image)

---

# Completed

**B2 — E2E verification ✅.** The E2E build had been failing in `assembleRelease` and then hanging to
the job timeout, so `cancelled` disguised a red build (fixed, PR #35). With it fixed,
`FLOW_SESSION_PERSISTENCE` ran and caught a real defect: `react-native-mmkv@2` cannot install its JSI
bindings under the New Architecture, so ritual sessions silently ran on memory and never survived a
restart. Fixed by v2→v4 (#36); three flows green on a native build.

**B4 — Observability, 3 of 4 increments.** Client `TelemetryAdapter` wired at both error call sites
(#39); the `AnalyticsService` port over `analytics_event` (#40); the Edge Function seam plus
preflight `SENTRY_*` requirements and a release gate that blocks a production build with Sentry
unconfigured (#42); the PDD §11.4 daily habit funnel now emitting, EVT_017 included (#43).

**B5 — Reliability & DR ✅ at verifiable scope.** Runbooks for §8.3's five scenarios and a mechanised
restore drill (#46); the §8.2 degradation policy, exhaustive over the ERR_* taxonomy (#48); §8.4
operator resilience and the onboarding gate (#50).

**Also:** the analytics insert-only contract gated in pgTAP and verified against hosted staging
(#44); the API contract gate B1 de-declared, restored as a real one and proven to fail by three
perturbations (#45); two E2E false reds traced to an emulator ANR dialog and fixed (#41).

# Defects found

MMKV v2 vs the New Architecture · EVT_054 shipped `code`/`surface` where PDD §11.2 specifies
`error_code`/`screen_id` · a `set -e` bug in the release gate, caught pre-commit · emulator ANR
dialogs failing flows against a healthy app · Supabase **filtering** rather than refusing
unauthorised writes (a `throws_ok` assertion would have proven nothing) · `const ONBOARDED = true`,
which blocked FLOW_ONBOARDING and hid an unbuilt screen set for two milestones.

# E2E — resolved 2026-07-26 (the previous handoff was wrong)

**Main's E2E is GREEN, and PR #53 is VERIFIED.** The previous handoff opened with "⛔ MAIN'S E2E IS
RED, AND THE FIX IS UNPROVEN — START HERE." Both halves were false by the time they were written.

**What actually happened.** Run 30170796356 (`4ea3f5f`, 19:01) did fail 4/4, and its ANR diagnosis was
correct — every hierarchy shows `"Pixel Launcher isn't responding"` with `Close app` / `Wait` and
nothing of our app on screen. But **two green runs followed the same evening**: 30170895237
(`bbeee1a`, 19:04) and 30171884650 (`0ca0906`, 19:34) — the latter **4/4 including FLOW_ONBOARDING,
in 1m50s**. The handoff was authored from the 19:01 failure and never revisited once the greens
landed, so it shipped a resolved problem as the top priority for the next session.

**The lesson, and it is the same one this repo keeps paying for:** *a written status is not a
verified state.* The Execution Gap taught it about CI, issue #30 taught it about an ADR, and it now
applies to our own handoff notes. Checking CI before acting on a status doc costs one command; not
checking it cost a session's opening analysis and a fix written for a problem that had already
resolved itself.

## What the artifacts show, across all four recent failures

Downloaded and read rather than inferred from run logs (logcat and hierarchies live only in the
uploaded artifact — grepping the run log finds nothing and looks like absence of evidence):

| Run | Commit | On screen at failure | Verdict |
|---|---|---|---|
| 30167565823 | `ae290ea` | `Pixel Launcher isn't responding` ×3 | ANR false-red |
| 30169099087 | `262ac88` | `Pixel Launcher isn't responding` ×3 | ANR false-red |
| 30170189932 | `bfa3ebe` | `Sign in` / `Continue with Apple` ×4 | **real red** — the #50 gate breakage |
| 30170796356 | `4ea3f5f` | `Pixel Launcher isn't responding` ×4 | ANR false-red |

**Three of four failures were false reds** — ~21% of recent runs failing for a cause outside the
app — and `hide_error_dialogs 1` (PR #41) was active for every one of them. It suppresses the
dialog; it does not stop the launcher ANRing.

## PR #55 — the cause removed rather than the symptom suppressed

`e2e.yml`'s AVD moves `target: google_apis` → `default` (AOSP), which ships neither Pixel Launcher
nor the Google app. Nothing under test needs Play Services: `expo-notifications` is uninstalled (M7
ships a NullNotificationAdapter), `react-native-purchases` likewise, and there is no Maps or Play
Billing dependency. `hide_error_dialogs` stays as a second layer, commented so that a third
occurrence is read as a *different* cause rather than obscured.

Verified on run 30196467032 (dispatch on the branch): **4/4 green in 1m23s**, the system image
confirmed as `system-images;android-34;default;x86_64`, **zero `Pixel Launcher` references anywhere
in the artifacts**, and zero failure hierarchies. The absence is structural — a process that is not
installed cannot ANR — which is the claim worth making. "Proven stable over N runs" is not; one green
run does not retire a flake.

Merged as `d56a4cb`, and **confirmed on main**: run 30196966887 passed **4/4 in 1m21s** on the AOSP
image. Two independent green runs on it now (branch dispatch and main's tip), against a ~21% failure
rate before — still not "proven stable", but the mechanism is removed rather than masked.

**#50 → #53 remains an honest entry in the ledger.** Run 30170189932 is the one genuine red: making
the onboarding gate real changed what a FRESH device does on first launch, so a CI emulator correctly
opened SCR_AUTH_001 while three pre-existing flows asserted Today. The three now skip the gate
conditionally, and FLOW_ONBOARDING's own assertion was wrong too (Maestro regex-matches the WHOLE
element text). The lesson is mine: changing first-launch behaviour necessarily changes what every
flow sees on a fresh emulator. Unit tests, typecheck, lint and the bundle gate all passed it through.

# Open

- **A pending E2E run was cancelled by a later merge.** With `cancel-in-progress: false`, a
  concurrency group keeps only the most recent *pending* run, so three rapid merges (#49/#50/#51)
  displaced #50's queued run before it started — the same "a cancelled run reads as no signal"
  pathology PR #32 fixed, in a residual form. Main's tip carries the same code, so coverage is
  deferred rather than lost, but the mechanism is worth closing.
- **PDD owes approved copy for 11 of 24 ERR_* codes** — pinned by a test in `AWAITING_APPROVED_COPY`.
- **SCR_ONBOARDING_* slides remain unbuilt**; the gate no longer hides that.

# Blockers (all owner purchases)

1. **Paid Supabase (~$25/mo)** — no PITR means user data is unrecoverable. **NFR-15 is unmet, and
   this is a launch blocker**, not a B1 chore.
2. **Sentry org + DSN** (free tier) — the only thing between B4 and done.
3. Apple $99 · Google Play $25 → most of B3.

# Recommended next task

**B6 — Security & Privacy** (§5/§6): OWASP Mobile review, CCPA export/delete verified end to end
(F-3/F-10), store privacy labels. The next unstarted slice, and entirely credential-free — nothing in
it waits on the Sentry org, the paid Supabase plan, or the store accounts.

The E2E gate is green and no longer a prerequisite for anything.
