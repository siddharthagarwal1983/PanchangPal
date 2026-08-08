# TASK.md

# PanchangPal — Current Task

Version: 12.0.0
Last Updated: 2026-08-08 (**B8.3 DONE** — the monetization funnel emits. **No credential-free blocking
engineering remains on §10.1**; the store accounts are the critical path)

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
3. **PR #36 (merged as `e1e10d4`) — the fix.** MMKV v2→v4.3.2 (Nitro, bridgeless-compatible) + nitro peer;
   v4 API (`createMMKV()`, `delete`→`remove`) absorbed at the port; jest mock for v4's eager nitro
   import. **E2E on a native build (run 30155737941): all three flows GREEN, FLOW_SESSION_PERSISTENCE
   PASSED.** No memory fallback. 176 tests, tsc, eslint all clean.

**With this, B2 (E2E verification) is COMPLETE** — bundle gate + the three in-scope Maestro flows
green in CI on a real native build. Canonical progress 0% → 13% (1 of 8 Beta slices).

---

# Current Task

## Title
⏳ **OWNER-GATED — no credential-free blocking engineering remains on the §10.1 checklist.**
**Progress stays 63%** (5 of 8; B8 started with B8.1–B8.3 done).

Every remaining §10.1 item needs **money, content, legal review, or a business decision.** The order:

1. **Apple ($99) + Google Play ($25)** — the highest-leverage action in the project. Unblocks §10.2
   step 1 (internal smoke on TestFlight / Play Internal), converts every B7 *"proven in EAS, not on a
   device"* caveat into a real answer, and is what lets **EVT_051** fire at all. The build pipeline,
   signing, source maps and six Maestro flows already work.
2. **~$25/mo paid Supabase** — PITR (NFR-15). A destructive migration against real user data
   currently has **no recovery**; this is the plain launch blocker.
3. **ADR-025's `analytics_event` rollup worker** — the one genuinely useful *unblocked* engineering
   task left. It is the shared blocker behind §10.1 items **11** (dashboards), **19** (pricing test)
   and **21** (activation/retention): the app now records events that **nothing reads**.
4. **Content / AI readiness** — the RAG corpus + reviewer sign-off (items 1, 6) and reviewer-approved
   festival/ritual content (item 2, where the seed is one placeholder festival).
5. **Legal** — the privacy policy and store labels are drafted from a machine-checked inventory and
   **not reviewed** (item 15).
6. **ADR-033** — still the only Proposed ADR, and panchang accuracy (item 3) cannot be worked before
   it is ratified.

**Also owed, and named rather than absorbed:** `SVC_health`'s 503 branch end to end · the deprecated
Supabase key migration · **`@supabase/supabase-js` undeclared in `apps/backend`** (⚠️ which has **no
`package.json` at all**) · ⛔ **two metric monitors with open issues**, which cannot be cleared by
hand and will suppress the next alert of their kind.

---

## ✅ Previous Task — B8.3, DONE 2026-08-08

**The monetization funnel emits.** EVT_049/050/051/052 across both upgrade surfaces, derived purely in
`src/domain/analytics/subscriptionEvents.ts` — the `ritualEvents.ts` pattern, because a screen calling
`track()` inline **double-fires on re-render** and a conversion rate with an inflated denominator is
worse than none. **EVT_051/052 come from the `usePurchase`/`useRestore` seam**, since two surfaces open
a purchase and a funnel a third could join without reporting has a silent hole.

### ⛔ The anchors had been comments for months

Including an **empty `useEffect` whose entire body was `/* analytics: EVT_049 */`**. Written while the
Analytics Adapter was deferred; **B4.2 shipped it and nothing went back.** A test fails if either
anchor returns.

### ⛔ `unavailable` deliberately emits nothing

`NullPaymentAdapter` returns it for every purchase today. Mapping it to `fail` would have fired
EVT_051 on **every tap** and permanently poisoned §11.3's free→paid rate with failures that only meant
"payments are unbuilt" — a **broken** checkout rather than an **unbuilt** one. **A metric wrong in a
plausible direction is worse than one that is absent, because nobody goes looking for it.**

### ✅ The privacy inventory caught the new collection by itself

`data-inventory.test.ts` went red the moment the events became real. **Adding analytics is a privacy
change**, and B6.3's conformance test enforced disclosure before CI would pass — the first occasion it
could. `DATA_INVENTORY.md` now lists all four with their props and records that **no price, store SKU,
receipt or vendor error text** reaches analytics.

**Verified:** mobile jest **450 (+21)** · vitest **219** · tsc **11/11** · eslint **0 errors** ·
**four perturbations**, controls green.

---

## Superseded — B8.3 as scoped

## ✅ Previous Task — B8.2, DONE 2026-08-08

**The first performance gate this repository has ever had.** `scripts/check-bundle-budget.mjs`, wired
into the Bundle gate as **one line**, weighs each platform's Hermes bytecode — what a device
downloads, parses and executes before the first frame (**NFR-01**) — against a checked-in ceiling in
`apps/mobile/performance-budget.json`. **5.04 MiB against 6 MiB**, ~19% headroom. `expo export`
already ran in that job and its output was **thrown away**; the marginal cost is a `stat`.

### ⚠️ A ceiling, not a ratchet — and that was measured, not assumed

The proposal that won approval said *"same source → same bytecode"*. **It was wrong.** Two exports of
the *same commit*: **5,279,878 vs 5,279,857** (android), **5,286,013 vs 5,286,045** (ios). A
zero-tolerance ratchet would fail at random, be switched off, and leave the documentation claiming a
release-blocking control that no longer runs — **worse than having none.**

### ⛔ Every path where it measures nothing exits 1

Missing export dir · a budgeted platform with no bundle · an empty platform dir · **two** bundles for
one platform (ambiguity fails rather than guessing which ships) · an unreadable budget file · **a
platform that built with no budget** — an unbudgeted platform is an ungated one, the
`cd.yml`-omitting-`health` shape. A size gate that passes because it found nothing to weigh goes green
forever the first time a refactor moves the output path.

### ✅ B8.1's guard fired on its own, within hours

`go-no-go.test.ts` asserted no performance gate existed. Building one **failed that test**, with a
message naming the two document sections to update. **Re-pointed, not deleted** — the dangerous
direction inverted, so it now fails if the gate is *removed* while GO_NO_GO still describes it.

### ⚠️ Item 8 stays ⚠️

PDD's per-screen **latency** budgets remain unmeasured; a threshold on a shared-vCPU emulator would
measure the runner (**2m20s and 3m20s observed on one commit**). Instruments are TDD-named — Sentry
app-start, a client trace on EVT_012 — and need real device traffic, so they moved from unbuilt
engineering to the store-gated queue.

`bundle-budget.test.ts` runs the **real script and reads its exit code**, because the gate *is* the
exit code — this repo has twice been burned by tests proving the wrong layer.

**Verified:** vitest **218 (+12)** · tsc **11/11 uncached** · eslint **0 errors** (16-warning
baseline) · **11 perturbations**, controls green at both ends.

---

## Superseded — B8.1

🚧 **B8 STARTED — THE §10.1 CHECKLIST IS WALKED. VERDICT: ⛔ NO-GO, 3 OF 22.**
Main is at `9667600`. **Progress stays 63%** — a slice counts only when complete, and B8's remaining
deliverables are owner-gated on store accounts.

### B8.1 — what shipped

**`docs/devops/GO_NO_GO.md`** walks all 22 `[MANDATORY]` items across five categories — **3 met · 10
partial · 7 not met · 2 business-owned** — each with its verdict, evidence and owner, and **each
derived from the repository rather than from another document** (the rule B7's close earned).
**`apps/backend/tests/release/go-no-go.test.ts`** (30 assertions) parses §10.1 **out of the TDD** and
checks coverage **both ways** — an item dropped fails, an item invented fails — then pins the claims
that will rot **in the dangerous direction**: it fails when a performance gate appears, when
`EVT_049` starts being emitted, when `GURU_LIVE` flips, or when `react-native-purchases` is
installed. A doc that keeps saying "blocked" after the blocker clears makes the gap **invisible**,
which is how TDD Part 4 §6 stayed unimplemented across two milestones.

**Saying NO-GO is the deliverable, not a setback.** §10.4 always read "ready for launch, *conditional
on* the §10.1 checklist". Of the 19 items not fully met, **7 are content/AI readiness, 6 are owner
purchases, 2 are business decisions, and 4 are engineering.**

⚠️ **"Partial" is the column that matters** — *"traditions/festivals/rituals seeded"* looks ticked
because the four traditions are seeded, while the seed carries one ritual and one festival named
`sample-festival` whose significance is *"Placeholder significance (reviewer content to follow)."*

### The two findings

1. ⛔ **NO PERFORMANCE GATE EXISTS**, though §10.1 calls it release-blocking. PDD sets numeric
   budgets (Today cached render < 500 ms · checklist ack < 100 ms · ritual "Begin"→first step
   < 400 ms · completion ack < 100 ms) and **nothing in the eight workflows measures any of them**.
   Accessibility has a gate because it was expressible as a unit assertion; performance never was.
2. ⛔ **THE PAYWALL IS FULLY BUILT AND EMITS NOTHING.** SCR_SUBSCRIPTION_001, CMP_PLAN_CARD, the
   contextual sheet and `visibleOfferings` are implemented and tested; `EVT_049` is defined in PDD
   §11 and never fired. **The MRD's NZ pricing question is therefore unanswerable with the data the
   app produces** — discoverable only after launch, when someone went looking for the funnel.

### ⛔ A perturbation caught a defect in my own document

§9 and §10 of GO_NO_GO both told the reader the verbatim appendix was "the machine-checked surface",
while the test's first version checked coverage against the **whole file** — so deleting an appendix
item still passed, because the human-readable table above quotes the same words and the assertion
matched there instead. **The appendix was decorative while two sections claimed it was
load-bearing.** Fixed by scoping the check to the appendix, plus a guard that fails if its heading is
renamed — tripping it takes all 22 coverage assertions down, which proves they are not vacuous.
**Third time this milestone that a guard looked convincing and measured nothing.**

**Verified:** vitest **206 (+30)** · tsc **11/11 uncached** · eslint **0 errors** (16-warning baseline) ·
**seven perturbations**, each failing exactly the intended assertion, controls green at both ends.

### Next, in order

1. **B8.2 — a performance gate.** ⚠️ Carries a real design question and should not be rushed: a
   threshold measured on a CI emulator says little about a mid-range phone, which is exactly why this
   gate has never been written. Likely instrument — a Maestro assertion on the already-green device
   runs, since PDD's budgets are user-visible latencies the flows already wait on.
2. **B8.3 — emit `EVT_049`.** Small, and it invents nothing: the id is already in PDD §11, unlike
   NFR-10's sync metric, which has no event in the taxonomy and is genuinely blocked on a PDD
   decision.
3. **Owner — the store accounts now outrank every other purchase.** Apple ($99) + Google Play ($25)
   unblock §10.2 step 1 (internal smoke), and simultaneously convert every *"proven in EAS, not on a
   device"* caveat from B7 into a real answer. Nothing else on the checklist is reachable first.

**Still owed, and named rather than absorbed:** `SVC_health`'s 503 branch end to end · §7.2
dashboards (ADR-025's rollup worker is unbuilt) · the deprecated Supabase key migration ·
**`@supabase/supabase-js` undeclared in `apps/backend`** — ⚠️ and note `apps/backend` has **no
`package.json` at all**, so that fix is a slightly larger question than adding a line.

---

## ✅ Previous Task — B7, COMPLETE 2026-08-08

**Merged: #114 `76e9764` (B7.2) · #115 `fd1aa83` (B7.3) · #116 `9667600` (B7.4)**, joining B7.1
`3cee165`. All four increments **PERFORMED** against real infrastructure rather than configured.
`RELEASE_RUNBOOK.md` §0 now counts **eight** rollback paths: **three exercised**, one blocked, **three
with no mechanism at all**, PITR absent.

### ⛔ The docs had been three increments stale — and were internally consistent throughout

B7.2, B7.3 and B7.4 each completed without the Increment Checkpoint running, so all six status files
still said "B7 is 1 of 4" while the work sat merged on main. **No file contradicted another, because
each had been written from the previous one.** `git log` is the instrument; a status file is not
evidence about the repository.

### ⛔ And B7.4's recorded blocker was half false

Every document had B7.4 as owner-gated on Play/Apple accounts. §2.4's requirement is about **OTA**,
and `eas channel:rollout` does exactly what §3.2 describes — only the phased rollout of a **binary**
needed a store account. **A blocker recorded once propagates through every document that cites it**,
the same shape as the merged SLO denominator across five files.

### B7.2 — the stake was the crash-free SLOs, not tidiness

Sentry sets no explicit release, so `@sentry/react-native` derives it from the **native app version**.
A build tagged `v0.2.0` from an `app.config.ts` still saying `0.1.0` files its crashes under
**`0.1.0`** — and NFR-06/NFR-07 are read **per release**, so the new build **looks healthy** because
its crashes landed in the previous bucket. Same class as CI reporting itself as `production` (#98).
`CHANGELOG.md` did not exist. `release-build.yml` now fails **before building** on disagreement, split
deliberately by what can violate each half: config↔changelog in the unit suite (checkable per PR),
tag↔config in the workflow (only a tag push can violate it, and it must fail rather than produce a
mislabelled artifact).

### B7.3 — a successful rollback produced a RED run

Performed: `31169545892` (seven functions redeployed from an older commit) → `31169842290` (all eight
restored from `main`). ⚠️ That proves redeploy-on-demand, **not** a behavioural diff — the two commits
had no observable difference, so "the older code is serving" rests on the deploy log naming the older
SHA, and the runbook says so.
⛔ **`promote-production` fails by design and ran on every `workflow_dispatch`**, so asking to roll
back staging implied asking to promote — and a successful rollback went red. Mid-incident the obvious
reading of red is "the rollback failed," and the next move is riskier. **A control built to prevent a
false green was manufacturing a false red on the recovery path.** Gated behind an explicit `promote`
input, default `false`; fail-loud behaviour unchanged when promotion is actually requested.
**The flag-disable path moved to BLOCKED, not "never performed"** — `FF_FAMILY_PLAN` gates only the
Family offering and `react-native-purchases` is uninstalled, so filtering an empty offering list
proves nothing either way, and would not even with the SDK installed.

### B7.4 — the staged OTA rollout, whole lifecycle

`31170893305` publish candidate → `31171165323` 10% → `31171256503` 50% → `31171329608` revert.
Staging is back where it started. `publish` gained an optional `--branch`, because a rollout splits
traffic between **two** branches and publishing with `--channel` targets the one the channel already
points at. **`rollout_outcome` defaults to `revert`**, pinned by a test — the dangerous default is the
one that keeps a bad update live.
⚠️ **The monitoring between stages is the point, not the percentages**; advancing on a timer is a slow
deploy. And an open Sentry issue suppresses the next alert, so "no new alert" is not health.
⚠️ **`--runtime-version` is required to create a rollout** — unmarked in `--help`, found only by run
`31171046705` failing, and **derived** from the candidate branch rather than typed. The **fourth**
eas-cli assumption this slice got wrong (three JSON shapes, one mandatory flag), every one surfaced by
running against real EAS.

### ⛔ Auto-rollback is not automated, and the runbook says so in those words

§2.4 says "auto-rollback on a crash spike". The **action** is proven; **nothing triggers it** — that
needs a Sentry alert webhook plus a credential to call GitHub, an owner action. A
`repository_dispatch` receiver was deliberately **not** added: a trigger with no sender is the
placeholder shape B1 spent its time removing, the same reasoning that left the `job` table worker
unbuilt. A test holds the disclosure in place, because "auto-rollback" in a TDD and a manually
dispatched revert are different claims.

**Verified:** vitest **176** · tsc **11/11 uncached** · eslint **0 errors** at its 16-warning baseline
· five CI gates green on #116 · four perturbations each failing exactly one assertion.

---

## Superseded — B7 as scoped at its start

🚧 **B7 — RELEASE MANAGEMENT IS STARTED. B7.1 MERGED (`3cee165`, PR #113).**
Main is at `3cee165`; **no open PRs**. **Progress stays 50%** — a slice counts only when complete and
B7 is **1 of 4** increments.

### B7.1 — what shipped

`ota.yml`'s publish step was an `echo` reporting SUCCESS while shipping nothing until 2026-07-19,
then a deliberate `exit 1`. **It now runs `eas update`**, with the rollback half §3.4's flowchart
requires (resolving the branch and latest update group itself, because `eas update:rollback` needs an
explicit group id non-interactively and an incident is the worst moment to look one up) and a **typed
confirmation** guarding production, since §3.2's staged rollout cannot be expressed until a store
presence exists.

**PERFORMED, not configured** (§8.4's standard): publish `31166287897` → `✔ Published!`, rollback
`31166824122` → `✔ Republished update group`, zero warnings.
⚠️ **NOT proven: delivery to a device.** No EAS build exists for the channel, so the reachability
check correctly reports 0.

⚠️ **THE GUARD THAT MATTERS.** `runtimeVersion: { policy: 'fingerprint' }` is what mechanically
enforces §2.4's "no native changes over OTA" — and the same mechanism means an update whose
fingerprint has moved reaches **no installed app** while the job goes green. The publish job counts
finished builds with a matching runtime version and warns at zero. A warning, not a failure: before a
channel's first EAS build the count is legitimately zero, and a perpetually-red step is the
placeholder shape B1 removed.

**`docs/devops/RELEASE_RUNBOOK.md`** covers §3.4's surfaces and opens with what is **not** true —
three of seven rollback paths have no mechanism at all, PITR is unavailable (NFR-15), staged rollout
is store-gated. Pinned by `release-runbook.test.ts`, 5 assertions / 5 perturbations.

### ⛔ Verifying it found FIVE defects that every local check had passed

1. **The old scaffold's error message was UNREACHABLE for three weeks** — it mapped only
   `EXPO_ACCESS_TOKEN`, so preflight died on `SUPABASE_STAGING_DB_URL` before the workflow reached
   its own `exit 1`. Documented, wired, inert; nobody had dispatched it.
2. **`branch` is a STRING, not an object** — `first.branch.name` returned empty while `group` and
   `runtimeVersion` worked. A parser that half-works and reports success.
3. **`channel:view` returns `{currentPage: […]}`** whose entries carry no `name`. Three guesses
   missed; the parse was **deleted** rather than guessed a fourth time — the branch is the channel's
   name by construction and `update:list` proves it exists.
4. **A warning fired on every HEALTHY rollback** — alert fatigue on an incident path.
5. **A backtick inside a double-quoted bash string** would have **executed** the command it quoted.

**All three eas-cli parsers were written from `--help`, and all three were wrong.** `--help`
documents flags, not output schemas. Confirmed shapes are in PROJECT_MEMORY.

### Next

**B7.2** version trains + changelog/tag discipline (§3.1) · **B7.3** flag-disable and Edge Function
rollback **performed** (DR_RUNBOOKS §6 has recorded that gap since 2026-07-25) · **B7.4** staged
rollout + crash-spike auto-rollback, **owner-gated** on Play/Apple accounts.

---

## Superseded — the six merges that preceded B7

✅ **FIVE MERGED — #108 `610bf12` · #107 `21e8c13` · #110 `afce763` · #111 `693c62f` · #112
`42a76f4`**, plus **#109** `7b84844` (the dependency group).

### #112 — the jest worker leak (`42a76f4`)

`A worker process has failed to exit gracefully` printed on **every** mobile run for the life of the
suite. **Three suites run alone HANG INDEFINITELY** — the force-exit path only applies to workers.
TanStack Query schedules a GC `setTimeout` (**default 5 minutes**) per cached query/mutation when its
last observer detaches; `qc.clear()` does not retract it and neither does an explicit `unmount()`.
Fixed with `gcTime: Infinity` in all four suites that build a QueryClient, pinned by
`queryClientGcTime.test.ts`. **429 tests, warning gone, 3.76 s → 1.28 s.**
⚠️ **`--detectOpenHandles` cannot find it** (implies `--runInBand`; no worker, so no worker warning).
Use `process.getActiveResourcesInfo()` in an `afterAll`, and judge by whether the process EXITS.
⚠️ **My first guard was vacuous** — counted `gcTime:` in comments; the perturbation reproduced the
hang while it passed. ⚠️ **`expect(value, message)` is vitest, not jest.**

### #110 and #111 — see DASHBOARD; both merged and verified on device.

---

## Superseded title — the first two of the five

✅ **BOTH MERGED — #108 `610bf12` (flows-step timeout guard) then #107 `21e8c13` (RNTL 13 → 14).**
The GitHub Actions outage cleared (status API `operational`, 0 incidents), both branches were given
**real** verdicts, and the guard PR turned out to be broken in a way only running it could reveal.

**Progress unchanged at 50%.** Neither merge advances a Beta slice.

### #107 — verified against the bar set before the work started

All five CI gates **executed** (none `SKIPPED` via `needs:` — the distinction that made the outage
reds vacuous): tsc ×11 · eslint 0 errors · **vitest 144 +2 skipped · ui 33/33 · mobile 424/424,
identical to the pre-migration baseline** · `expo export` both platforms · **E2E 6/6 on device**.
The counts are part of the bar because a migration that quietly drops tests passes every other gate.

⚠️ **E2E is corroboration here, not proof** — `test-renderer` never reaches the shipped bundle, so
the CI gates carry this verdict.

### ⛔ #108's first attempt (`fb1a2fe`) FAILED EVERY E2E RUN — including runs where all flows passed

E2E `31145793824`: **"6/6 Flows Passed in 2m 23s"**, step **red, exit 2**.

**`reactivecircus/android-emulator-runner` executes its `script:` input ONE LINE AT A TIME, each in
its own `sh -c`:**

```
[command]/usr/bin/sh -c if [ "$flows_status" = "124" ] || [ "$flows_status" = "137" ]; then
/usr/bin/sh: 1: Syntax error: end of file unexpected (expecting "fi")
##[error]The process '/usr/bin/sh' failed with exit code 2
```

So a multi-line `if`/`fi` is a syntax error, and a variable assigned on one line is gone by the next.
**The action stops at the failing line, so `adb logcat -d` never ran** — the failed run's artifact
holds the six `commands.json` and **no `maestro-logcat.txt`**, while the green run's holds it. The
device log went missing on exactly the runs that need it, the opposite of what the PR body claimed.

**This also establishes that the PRE-EXISTING `set +e` / `flows_status=$?` / `exit $flows_status`
plumbing never worked.** Failures propagated only because a non-zero line fails the action directly;
`e2e.yml`'s comment that "the flows' exit status is preserved" described a mechanism that was not
running. **The milestone's signature defect — a documented control, never implemented, with nothing
asserting it.**

**Fixed structurally**: the logic lives in `scripts/run-maestro-flows.sh`, invoked as **one line**.
One shell parses one program, so the bug class is unreachable rather than avoided by careful
one-lining — the same preference as `evaluateHealth()` taking a boolean so no parameter exists
through which an error could leak.

**Verified with a control, at both layers:** behaviour (pass → 0 · flow failure → 1 with **no** hang
annotation · 124 and 137 → hang annotation · adb failure warns and does not mask the flow result ·
logcat in every branch) · the workflow block replayed one `sh -c` per line · **the old inline block
replayed the same way DOES reproduce the syntax error** · on device (`31146852463`) **6/6 in 2m 20s
with `maestro-logcat.txt` present at 927 KB**.

⚠️ **The earlier local shim test was not wrong — it tested the wrong layer.** It proved `timeout`'s
exit-code semantics and could not see the per-line `sh -c` execution. Same shape as the `process.env`
unit test that passed while the bundler path failed.

### Recorded, not fixed

The mobile jest suite's `worker process has failed to exit gracefully` warning is **pre-existing on
main**, confirmed against a control branch (main + a workflow-only change). Attributing it to RNTL
14's async API would have been the obvious and wrong call. Worth a `--detectOpenHandles` pass.

### Resolved — the 2026-08-06 outage block, kept short rather than deleted

~~"PR #107 has no CI verdict — Actions is in a major outage"~~ — **cleared 2026-08-07.** The status
API read `operational` with 0 incidents; the three outage reds were confirmed vacuous and discarded
rather than re-read. Two rules from that day survive and are worth keeping: **a red can be vacuous
exactly as a green can** (ask which gate would have had to fail), and **`in_progress` is not
recovery** — a job enters it on runner assignment and can still die inside `Set up job`, so the
status API is the instrument and the job state is not.

~~"`fix/e2e-flow-timeout` (`fb1a2fe`) is proven, held back from PR"~~ — **it was NOT proven, and the
word is the lesson.** Its verification ran the fragment against a local GNU-`timeout` shim, which
established the exit-code semantics correctly and **could not see the layer that broke** — the
emulator action's per-line `sh -c` execution. See the Current Task block above. The claim that "the
logcat dump runs in all three branches" was false in CI, where the action aborted before reaching it.

⚠️ **Deliberately NOT fixed: the double-`clearState` race.** A flow's opening clear can race the
previous flow's `onFlowComplete` teardown. A settle is the obvious fix and may be the wrong one —
this repo's standing rule is that added settle time can mask a race real users hit. The timeout guard
downgrades it from "gate goes dark" to "gate goes red", so it is no longer urgent.

### What the migration actually was

**Not the renderer swap — the API went ASYNC.** `render`, `renderHook`, `fireEvent`, `act`,
`rerender` and `unmount` all return Promises (React 19's rendering model); queries stay sync. The
version bump alone failed all 33 `packages/ui` tests with "`render` function has not been called",
because `screen` is populated only after the awaits resolve. 11 test files migrated; **no behaviour
changed and no test was dropped** — counts are identical to a baseline taken before any edit.

⚠️ **`test-renderer` is pinned at 1.1.0, and the constraint is two levels down:**

```
test-renderer@1.1.0 -> react-reconciler@~0.32.0 -> peer react ^19.1.0   satisfied
test-renderer@1.2.0 -> react-reconciler@~0.33.0 -> peer react ^19.2.0   NOT satisfiable
```

`react` is pinned at exactly 19.1.0 (RN 0.81.5's Fabric renderer is hardcoded to it). **RNTL's own
peer is only `^1.0.0`, so 1.2.0 is peer-LEGAL** and Dependabot has every reason to propose it —
**pnpm would record the unmet transitive peer and install anyway**, green, with a reconciler built for
a React the app does not run. **Read the reconciler's peer, not RNTL's.** Ignored in
`.github/dependabot.yml` with the evidence inline. **Sixth pinning mechanism, and the first where the
constraint lives in a transitive dependency's peer rather than anywhere in our own graph** — neither
side of the two-sided SDK check reports it.

`react-test-renderer` remains in the tree via **`jest-expo@54.0.17`'s direct dependency**. Expected;
it is simply no longer what RNTL renders with, and it was never declared by us.

### The docs half

The SLO count drift was **two merged denominators, not a stale number**: §7.2 names seven and
**NFR-07 is not among them** (Part 1 §8 NFR table), so both figures in circulation were correct.
Fixed by making the distinction explicit in six documents. Three further staleness items corrected —
`SLO_ALERTS.md`'s header describing its own pre-drill-2 state, ADR-034 recorded as Proposed, and
DECISIONS.md calling the §6.6 rule UNRATIFIED and the SDK 54 set "complete".

### Verified

ui **33/33** · mobile **424/424** (both identical to baseline) · vitest 144 (+2 skipped) · tsc 11/11 ·
eslint 0 errors · `expo export` both platforms · **one perturbation** — dropping a single
`await wrap(...)` fails exactly those 3 tests and no others.

**Not done, and stated:** no native build, no Maestro run. Test infrastructure only; `test-renderer`
never reaches the shipped bundle.

---

## Superseded — the task as scoped at the start

🚧 **RNTL 13 → 14 — the testing-infrastructure migration (`@testing-library/react-native`).**

**Progress stays at 50%.** This advances no Beta slice; it is testing infrastructure, in the same
category as the dependency queue. It is picked up now because it is the largest piece of bounded,
credential-free engineering left — every other candidate is owner-gated on money or a store account.

**Why it is a migration and not a bump.** RNTL 14 **replaces the `react-test-renderer` peer with
`test-renderer@^1.0.0`**, so the whole `packages/ui` + `apps/mobile` component suite fails on the
version bump alone. Scope recorded when #90 was triaged: **41 call sites across 14 files**, with
upstream codemods available.

⚠️ **#90 IS CLOSED, NOT OPEN — and the reason matters.** It was closed at 12:43 on 2026-08-02 because
**RNTL 14 requires Node 22 and the repo ran Node 20** (`1e33869`). Node 22 landed ~30 minutes later
(#106, `f5c018c`, merged 13:15), so the stated blocker is gone but the PR is not waiting to be
merged — this is a fresh branch, and Dependabot's diff is only the starting point.

⚠️ **`react` stays pinned.** RNTL's `ensure-peer-deps.js` asserting a renderer version is the **#75
trap** this repo has already paid for once: satisfying the assertion is not the same as satisfying
what the assertion defends. The SDK 54 pin on `react` / `@types/react` is unchanged by this work.

**Verification bar, set before starting:** tsc across 11 projects · eslint at its 0-error baseline ·
the full jest + vitest suites green with **no reduction in test count** · `expo export` both
platforms. A migration that quietly drops tests passes every gate — so the count is part of the bar.

---

## Superseded — B4

✅ **B4 — OBSERVABILITY IS CLOSED (2026-08-02, part 3). 47% → 50%.**

First slice completed since B6 on 2026-07-27. **B4.4 delivered two of §7.2's seven SLOs PROVEN end
to end**, which is §8.4's standard rather than "configured":

| SLO | Proof |
|---|---|
| **NFR-06** crash-free sessions ≥ 99.5% | drill → issue → **email 14:43** |
| **NFR-14** availability ≥ 99.9% | `SVC_health` forced red → `PANCHANGPAL-EDGE-3` → **email 16:17** |

✅ **And NFR-07 crash-free users ≥ 99.8% was proven the same day — a THIRD SLO, but NOT one of §7.2's
seven.** It is from the **Part 1 §8 NFR table**; SLO_ALERTS.md tracks it because it reuses NFR-06's
session data and **binds tighter**, so it is the page that arrives first. "Two of §7.2's seven" and
"three SLOs proven" are both correct — do not merge the denominators.

⚠️ **NFR-06 needed two drills and the first is the finding.** It detected perfectly and **told
nobody** — both alert rows targeted *Suggested Assignees*, which a metric issue cannot resolve. Every
visible signal said configured. **It would have shipped as done.** NFR-14 passed first time only
because that lesson was applied: an explicit **Member** recipient.

⛔ **NFR-07's drill found the other half: AN OPEN ISSUE SUPPRESSES THE NEXT ALERT.** It crossed both
thresholds and only NFR-07 emailed — NFR-06's earlier issue was still open, and Sentry folds new
occurrences into an existing open period. So an issue left open means **the next real incident of that
kind pages nobody**, and a **metric-monitor issue cannot be resolved or deleted by hand** (no Resolve,
Delete disabled; only Archive, which mutes). It closes only on a healthy reading; the only lever is
recreating the monitor. **Pre-launch checklist item, not today's work.**

**Shipped:** `docs/devops/SLO_ALERTS.md` (all seven SLOs, instrument/threshold/alert/blocker, pinned
by `slo-alerts.test.ts` which fails when an instrument *appears* while the doc calls it missing) ·
`SVC_health` (`verify_jwt = false`, only unauthenticated surface, body structurally unable to leak) ·
`scripts/slo-alert-drill.mjs` · three environment/deploy defects fixed (#98 CI-as-production, the
identical edge defect, `cd.yml` omitting `health` from its deploy list).

**Closed at verifiable scope** — same basis as B5 (no PITR) and B6 (no ratified ADR-034). Five SLOs
unproven, none unfinished engineering: three behind the Ask Guru gate, one behind uninstalled
`expo-notifications`, NFR-10 behind a PDD taxonomy decision.

## NEXT TASK

**Done since this block was written, and struck rather than deleted so the drift is visible:**
~~NFR-07~~ ✅ proven the same day · ~~ratify ADR-034~~ ✅ ratified + implemented (#104) ·
~~rule on §6.6 `preferences`~~ ✅ ratified as ADR-035, LWW on `local_ts` (#103) · ~~#96 eslint 9 flat
config~~ ✅ merged (#102) · ~~#97 zustand 5~~ ✅ merged · ~~#95~~ closed.
**ADR-033 (Canonical Panchang Computation Engine) is now the only Proposed ADR.**

1. ~~Open a PR for `9942763`~~ ✅ **done 2026-08-06 — PR #107.** ⛔ **But it has NO CI VERDICT**, and
   the outage reds on it are not a result. **When Actions is `operational` again, in this order:**
   open a PR for **`fix/e2e-flow-timeout`** (`fb1a2fe`) · let #107's five gates re-run · dispatch
   **one** E2E run (SEQUENTIALLY per ref — a batch cancels itself) · merge #107 on that evidence.
   **Check `githubstatus.com`'s Actions component first** — `in_progress` is not recovery, and
   re-running into an outage buys more uninformative reds, not more information.
2. ⚠️ **Open, deliberately: the double-`clearState` race.** A flow's opening clear can race the
   previous flow's `onFlowComplete` teardown (Maestro rule 4). The timeout guard makes it fail red
   rather than go dark, so it is no longer urgent — but a settle is the obvious fix and may be the
   wrong one, since added settle time can mask a race real users hit. Needs thought, not a sleep.
3. **B1 / B3 remainders** — all owner-gated on money or a store account.
3. ⚠️ **Named rather than fixed: `.github/dependabot.yml`'s `@types/node` block cites
   `NODE_VERSION: '20.11.0'` and `engines.node: >=20.11.0`, both stale after #106 moved CI to
   22.23.2.** That block's own rule is that the types follow the engine floor **deliberately**, so
   raising them 20 → 22 is an owner call, not a silent edit.
4. **Owner decisions still open:** **NFR-10's path** (a PDD §11 taxonomy addition vs a server metrics
   sink — no sync event exists and inventing one is forbidden) · **SHA-pin the nine GitHub Actions**
   (#87 records the case and deliberately left it open) · **~$25/mo paid Supabase** for NFR-15 PITR,
   a stated launch blocker · **Apple $99 + Play $25**.
3. **Owed, and named rather than absorbed:** `SVC_health`'s **503 branch** end to end (belongs with
   the DB-outage runbook drill), §7.2 **dashboards** (ADR-025's rollup worker is unbuilt), and the
   **deprecated Supabase key migration** (`readEnv` throws without them).
4. **Pre-launch checklist:** confirm **no metric monitor has an open issue** — today's drills left
   two, and a metric-monitor issue cannot be resolved by hand.
5. **Node 24 with the SDK 55 upgrade** — Node 22 is maintenance-only, EOL 2027-04-30. A deliberate SDK
   increment requiring a native build plus the six Maestro flows, not a bump.

---

## Superseded — Sentry ingest

## ✅ SENTRY INGEST CONFIRMED — AND CI WAS REPORTING AS PRODUCTION (2026-08-02, part 2)

**Merged #98 `a724519`.** Ingest works (91 sessions, release `0.1.0`, one error). But
`sentryEnvironment()` derived the environment from `extra.eas.channel`, **which only EAS Build
stamps** — `e2e.yml` builds with `expo prebuild` + `gradlew assembleRelease`, so no channel, and
`__DEV__` is false in a release APK. It fell through to `'production'` while pulling a **real DSN**.

**Evidence:** logcat resolves to project `4511814237290496` = `panchangpal-mobile`; sessions climbed
**87 → 91 while a `main` E2E run was mid-flight** with no user activity. Essentially all 91 were CI.
So "100% crash-free" measured an emulator, and `environment:production` — §7.2's alert scope — would
have paged on every CI run. ⚠️ **Historical sessions stay labelled `production`**; forward-only fix.

⚠️ **My first attempt broke the suite (4/6 vs main's 6/6 twice).** (1) `echo >> .env` with no leading
newline concatenated onto the last variable's VALUE, corrupting `EXPO_PUBLIC_SUPABASE_URL` — the name
still parsed, so it read as a product defect; the build log's `env: export` line had listed three
names with mine absent. (2) The override was read from `process.env` only, which relies on Babel
inlining; the gradle `export:embed` path did not deliver it. Now read from
`extra.sentryEnvironment` via `app.config.ts`, as `sentryDsn` already is.
**The broken path passed its unit test** — jest sets `process.env` and never runs the bundler.

**Device-verified (`30735709985`):** variable in `env: export` · **6/6 flows** ·
**12 × `[telemetry] reporter=sentry env=ci`**.

---

## Previously — THE DEPENDENCY QUEUE: THREE PRs MERGED, THREE CLOSED WITH EVIDENCE

**Progress unchanged at 47%.** Dependency hygiene advances no Beta slice. All four queued PRs are
resolved and two were not what they were filed as.

⛔ **"Zero open PRs" held for four minutes.** Dependabot re-ran on the new lockfile and opened five
majors (#89–#93), **since triaged the same way**: **#93 merged** (`ea71ce6`, zod 4) · **#89/#91/#92
closed** via **#94** (`1d035ce`) · **#90 left open** as real work.

**#89 is a FOURTH LEAK, and it corrected the rule rather than extending it.** `babel-preset-expo`
54.0.12 → 57.0.5 is pinned by `expo@54.0.36`'s own `~54.0.12` range, matched by no pattern, and **not
in `bundledNativeModules.json` — which lists NATIVE modules only.** That falsifies PROJECT_MEMORY's
"the SDK 54 set is now complete". **The check is two-sided: the manifest, plus expo's own dependency
ranges.**

**Three different pinning mechanisms in one batch**, none reported by the manifest: a direct SDK
range (#89), a **transitive babel-7 plugin family** with no declared peer anywhere (#92 — v8 is
ESM-only, every plugin `require()`s it), and a **vendored exact version** (#91 —
`@sentry/react-native@7.2.0` depends on `@sentry/cli` at exactly `"2.55.0"`).

⚠️ **#91 is the clearest case yet that a green gate can be VACUOUS.** All five gates passed, and had
to: `e2e.yml` sets `SENTRY_DISABLE_AUTO_UPLOAD` and **no gate runs `sentry.gradle`**, so the only
consumer of `@sentry/cli` is never exercised. **Ask which gate would have to fail.**

**#93 survived the check that killed #82:** `zod-validation-error@4.0.2` peer-requires
`zod: ^3.25.0 || ^4.0.0` — genuinely **satisfied**, not merely unenforced.

**#90 (RNTL 13→14) is OPEN and deliberately NOT ignored** — it replaces the `react-test-renderer`
peer with `test-renderer@^1.0.0` and fails the whole `packages/ui` suite. A migration with a named
scope, not a bump.

**Merged:** #87 `da9e945` (Dependabot majors-only for actions) · #88 `652831d` (i18next 23→26 +
react-i18next 15→17 as one increment) · #80 `715e2de` (supabase-js 2.111.0).
**Closed with evidence:** #83, #82, #62.

## #82 and #62 were always one change

`react-i18next@17.0.11` peer-requires **`i18next >= 26.2.0`**; the repo had 23.16.8. **#82 was GREEN
on all five gates while shipping a violated peer** — its own lockfile reads
`react-i18next@17.0.11(i18next@23.16.8)` beneath `i18next: '>= 26.2.0'`, because **pnpm records an
unmet peer without failing**. Fourth instance of green being anti-correlated with safety, and the
first by a mechanism **unrelated to the SDK pin** — neither package is in
`bundledNativeModules.json`, so that rule never applied. #62's red was the other half and its message
pointed nowhere near #82.

## The trap, and the guard that caught my own error

`compatibilityJSON: 'v3'` carried a **runtime** justification (Hermes' partial Intl). Flipping it to
`'v4'` to clear the type error is the **#75 `react-test-renderer` pattern**. Checked against the
installed i18next source: `PluralResolver`'s constructor touches no Intl, and `new Intl.PluralRules()`
is lazy inside a `getRule` that catches and degrades — the justification does not survive v26.

**My first guard asserted "no call site passes `count`" and failed on its first run** —
`streak.label` and `household.memberCount` both do. The real invariant: both use `count` only as an
**interpolation variable** and no `_one`/`_other` variants exist, so the suffixed lookup misses and
falls back to the base key. **The invalidating condition is a plural-suffixed KEY.** The test runs the
real bundle with `Intl.PluralRules` **deleted** rather than grepping for a legitimate pattern.

## #83 was not an upgrade

All nine actions are major-pinned and publishers move the major tag, so `@v5` already gets 5.x.
`5 → 5.6.0` would **freeze** one action while eight float; `JAVA_VERSION: '17'` is set separately, so
it changed nothing. #87 fixes the cause — the `github-actions` block had no `update-types` filter.

## Verified

`tsc` 11/11 · eslint 0 errors (16 warnings, baseline) · **418 mobile jest (+5)** · 118 vitest ·
`expo export` both platforms · **E2E 6/6 for #88 and #80** (`30733670783`, `30733470569`), incl.
`FLOW_AUTH_SESSION_PERSISTENCE` — the flow guarding the auth-js adapter #80 moves. One perturbation
failing exactly three assertions with controls green. Main re-verified after the merges.
⚠️ One E2E sample each; meaningful now that #84 fixed the ~50% race, but not a verdict.

## NEXT TASK

1. **Confirm events arrive in the Sentry dashboard**, then set `panchangpal-mobile` alert rules to
   `environment:production` so CI `preview` runs do not page.
2. **B4.4** — §7.2 SLO dashboards + alerts, proven by a deliberate trigger (§8.4: alerting never
   triggered is a plan, not a capability). The last engineering increment in B4.
3. **Owner:** ratify ADR-034 · rule on the §6.6 `preferences` conflict rule (shipped unratified as
   LWW) · decide whether to **SHA-pin all nine GitHub Actions**, which #87 records and deliberately
   left open as a security-posture call.
4. **#90 (RNTL 14)** when the testing-infrastructure migration is wanted: add `test-renderer@^1.0.0`,
   drop `react-test-renderer`, migrate the component tests across `packages/ui` and `apps/mobile`.
   Not urgent; open rather than ignored because it is a wanted upgrade.

---

## Superseded — the Sentry session

## ✅ SESSION COMPLETE (2026-08-02) — FOUR PRs MERGED, SENTRY LIVE AND VERIFIED ON DEVICE

**Merged:** #84 `45f00c7` (offline completion) · #85 `b8ab528` (SDK-pin third leak) · #86 `080c710`
(durable preference writes) · #79 `6182955` (Sentry).

**Sentry is provisioned and verified:** org `panchang`, projects `panchangpal-mobile` +
`panchangpal-edge`; `[telemetry] reporter=sentry` once per launch (12/12) where it read `none`
before, with `AppLifecycleIntegration` installed — so **crash-free sessions (NFR-06) is measurable
for the first time**. **B4 still does not close**: B4.4's §7.2 dashboards and alerts do not exist.

**The session's general finding: a durable queue guarantees DELIVERY, not DISPLAY.** Three defects
had that shape, including one of my own. See DECISIONS.md (2026-08-02) for all four decisions
recorded, and SESSION.md for the narrative.

## NEXT TASK

1. **B4.4** — §7.2 SLO dashboards + alert rules on `panchangpal-mobile`, scoped to
   `environment:production` (now trustworthy, per #98), proven by a **deliberate trigger** rather
   than configured (§8.4: alerting never triggered is a plan, not a capability). The dashboard
   currently shows "Create Alert" — **zero rules**, confirmed rather than assumed. This is the last
   engineering increment in B4, and closing B4 moves the milestone **47% → 50%**.
   ⚠️ **Do not set thresholds off the current 100% crash-free**: that is historical CI traffic
   mislabelled as production, and #98 does not relabel it.
3. **Owner:** ratify ADR-034; rule on the **§6.6 `preferences` conflict rule**, which shipped
   unratified as last-writer-wins.
4. Dependency queue, none SDK-pinned: **#80**, **#82** (major), **#83**, **#62** (major).

---

## Superseded — the offline-completion race

✅ DIAGNOSED, FIXED, AND VERIFIED ON DEVICE (5/5 green) — merged as #84 `45f00c7`

**Progress unchanged at 47%.** This closes a TDD Part 4 §6 launch blocker inside a slice already
counted, exactly as offline sync and the deletion executor did.

## 1. The baseline settles #79

Main flakes identically **without any Sentry code**: 3 green / 3 red across 2026-07-28, every red
the same three-flow signature (OFFLINE_SYNC `☑`, then SESSION_PERSISTENCE and RETURNING as
airplane-mode collateral). One red is `4fdaf10` (#78), which changed **only**
`.github/dependabot.yml` and ADR markdown and therefore cannot have introduced a runtime race.
**PR #79's Blocker 2 is closed** — it was never Sentry.

## 2. The recorded root cause was wrong

"An asynchronous or batched MMKV write loses to the kill" is refuted: `keyValueStore.set` is MMKV's
**synchronous** JSI call made inside the tap handler, the library loads natively in every launch,
and no `[sync]` warning is ever emitted. **The queue reached disk every time.**

The defect is that **nothing rendered it**. `STORE_offlineQueue` was read only by the drain, so the
tick after a cold start came solely from the persisted query cache — written on a **1 s trailing
throttle** and flushed from an unsubscribe handler **a process kill never runs**. Offline it was
additionally poisoned: the direct write always fails with no network, and `useChecklist.onError`
reverted the optimistic tick although the mutation was durably queued. The ~50% was whether the
process died before or after that revert-plus-throttle write landed. **The passing runs passed by
luck of timing.**

**The rule this establishes: a durable queue guarantees DELIVERY, not DISPLAY.**

## 3. What shipped

| Piece | Where |
|---|---|
| Pure projection of the queue onto a read model | `src/domain/sync/pendingProjection.ts` |
| Correction of the restored snapshot at launch | `reapplyPendingMutations` in `queryPersistence.ts` |
| Revert only when nothing is left to deliver it | `src/data/hooks/useChecklist.ts` |
| Radio restore that survives failure | `onFlowComplete` in `FLOW_OFFLINE_SYNC.yaml` |

Completion-only, matching §6.6's union rule — the payload carries no desired state, so
un-completing is not expressible in the queue. Writes only to keys already cached; seeding one
would render a completion against rows the screen cannot name. Server truth still wins the moment
the drain invalidates `['checklist']`.

**Verified:** 367 mobile jest (+17), 102 vitest, tsc across 11 projects, eslint 0 errors, `expo
export` both platforms, flow YAML parses with the hook. **Two perturbations, each failing exactly
the right test** — removing the reapply wiring failed only the launch-correction test; removing the
revert guard failed only the still-queued test, with both controls still green.

## ✅ Device-verified — 5/5 green, 30/30 flows

`30706341043` · `30706351403` · `30707302407` · `30707760317` · `30708217181`, all **6/6**, against
main's **3 green / 3 red** on the same suite. If the ~50% race persisted, five consecutive greens
would occur ~3% of the time — a verdict rather than a lucky draw, which is the distinction the
corrected re-run heuristic exists to enforce.

⚠️ **Dispatch E2E runs SEQUENTIALLY.** `e2e.yml`'s concurrency group is `e2e-${{ github.ref }}` with
`cancel-in-progress: false`, which permits one *pending* run per ref — an initial batch of four left
two cancelled and yielded only two usable samples.

## Merged

**#84 → `45f00c7`** (this fix) and **#85 → `b8ab528`** (the SDK-pin rule's third leak; `#81` and
`#63` closed with evidence, `bundledNativeModules.json` named as the authoritative source).

## Open — `fix/durable-preference-writes`

**A preference write had no durable path at all.** `useUpdatePreferences` called the server directly
with an optimistic update, so an app kill inside the request window silently reverted the setting —
and `FLOW_AUTH_SESSION_PERSISTENCE` reads the tradition back as its proof of identity, so the loss
presented as IDENTITY LOSS. **Four misattributions**: twice to the launch race, once to Sentry, once
to an unexplained flake.

`preferences` is a syncable kind again, with the server branch and conflict rule it lacked.
⚠️ **The §6.6 rule is UNRATIFIED** — it adopts `personal_date`'s last-writer-wins as the nearest
ratified precedent, and `resolvePreferences` is the only place a different ruling lands.
The upsert is behind a **column allowlist** (client-supplied payload + service role = the
SVC_account defect in a new place), and **mutations carry the identity that made them** —
without which durable preferences would create a **false green** on the suite's most important flow.

**Run 1 failed on my own gap**, not a flake: the durable write path shipped without the read half
(`onServerState` did not invalidate `['preferences']`). Fixed, plus a fourth drain trigger for
identity resolving. **Run 2: 6/6 green.**

## Next task, in order

1. **Merge #79** — rebased onto `45f00c7`, title corrected, sample 1 green 6/6 with
   `[telemetry] reporter=none` appearing 12 times (once per launch), which confirms Blocker 1's fix
   on device. Merging lands verified code but reports nothing until a DSN exists; **B4.4 stays open**.
2. Owner: `EXPO_PUBLIC_SENTRY_DSN` into EAS + `SENTRY_DSN` into Supabase Edge secrets; ratify
   ADR-034.
3. Remaining dependency queue, none SDK-pinned: **#80**, **#82** (major), **#83**, **#62** (major).

## Superseded framing — Sentry

## 🟡 SENTRY IS BUILT AND BLOCKED — PR #79, NOT MERGED · (#78 MERGED: SDK-pin rule + ADR-034)

**Blocker 1 is now CLOSED**: the startup-init defect is fixed, guarded by a behavioural test proven
to fail without it, and **verified on device** — `[telemetry] reporter=none` appears 11 times in the
E2E artifact, once per launch, where previously nothing resolved at all. Blocker 2 is reattributed
to the race above, pending the baseline.

**Progress unchanged at 47%.** B4.1–B4.3 were already counted and B4.4 still needs a real Sentry
project, so nothing here advances a slice.

## Merged this session — #78 (`4fdaf10`), all six gates green

The **SDK-pinned dependency rule** (`react`, `@types/react`, `@expo/*`, `@babel/runtime` added to
the Dependabot ignore list, with per-package peer evidence inline; #64/#65/#75 closed) and
**ADR-034 — Account-Deletion Audit Record (Proposed)**, plus seven corrected "TDD Part 2 §5.1"
mis-citations. Both were split out of the Sentry branch precisely so they could land while Sentry
stays behind its own verification.

## Open — PR #79 `feat/sentry-telemetry`, deliberately NOT merged

`@sentry/react-native` ~7.2.0 behind both ports: client reporter, Edge Function client (§7.1 is
"client **+** Edge Functions"), the Expo config plugin for source maps, PII scrubbing made
structural (messages rewritten to their ERR_* code while the stack survives; automatic breadcrumbs
dropped; `request`/`extra` stripped; identity reduced to the pseudonymous id). 378 mobile jest,
109 vitest, three perturbations each failing the right tests.

### ⛔ Blocker 1 — crash-free sessions are NOT measurable as built

**I claimed they were, across five documents, and it was wrong.** `Sentry.init` starts the session,
but `getTelemetryAdapter()` is called from exactly two places — `installGlobalErrorHandler.ts:40`
and `ErrorBoundary.tsx:39` — and **both are inside error handlers**. Nothing resolves the adapter at
startup, so init runs only after the FIRST ERROR: a healthy session never starts one, and native
crash capture never installs. NFR-06 / §7.2 remain unmeasurable — the entire justification for the
work.

**Fix:** resolve the adapter once at startup in AppProviders, plus a test that fails when that
resolution is removed. Deliberately not yet done — it changes *when* Sentry's network
instrumentation installs, which is the leading suspect in Blocker 2, and stacking them blind would
make the next E2E result uninterpretable.

### ⛔ Blocker 2 — a deterministic red E2E whose mechanism is unconfirmed

FLOW_OFFLINE_SYNC, FLOW_SESSION_PERSISTENCE and FLOW_RETURNING failed **twice on the identical
commit** where main is 6/6 green. Diagnosed from the artifact: no crash; **MMKV loads natively**
(that hypothesis raised and disproved); two failures are **collateral** from FLOW_OFFLINE_SYNC dying
at step 22 before its airplane-mode restore, leaving the radio dead — the documented "breaks its
neighbours" pattern; root failure is an offline checklist tap producing no optimistic tick, that
flow hanging **3m20s** against 31s on main.

Green 6/6 after `isUsableDsn()` rejected the placeholder DSN — **but that is not proof.** The
`[telemetry] reporter=` line added to settle it never logged, *because* of Blocker 1. The leading
hypothesis (an offline error lazily running `Sentry.init` mid-flight, installing fetch/XHR
instrumentation partway through a session) fits every observation and remains a hypothesis.

### Two defects already found and fixed in #79

1. **`@sentry/cli` unresolvable under pnpm** — `sentry.gradle` falls back to a flat-`node_modules`
   path. **Third instance** of the `@babel/runtime` / `babel-preset-expo` defect; fixed by declaring
   it, as precedent.
2. **The upload task fails the build rather than skipping** — a comment of mine claimed otherwise.
   `e2e.yml` now sets `SENTRY_DISABLE_AUTO_UPLOAD=true`; `release-build.yml` deliberately does not.

Both were caught by the **native build** — the bundle gate, tsc, eslint and 487 unit tests all
passed with them present.

## Next task

**Fix the startup-init defect, then get two consecutive green E2E runs.** That closes both blockers
together. Then: owner creates a free-tier **Sentry org + DSN** (closes B4), and **ratifies ADR-034**.

---

## Superseded — ADR-034

## ✅ ADR-034 OPENS THE DELETION-AUDIT DECISION THE TDD OWED (Proposed)

**Progress unchanged at 47%.** A Proposed ADR surfaces a decision; it does not ratify one, so B6's
open deliverable stays open — but it is now a decision with an owner and a deadline instead of a
note in a migration comment.

## The contradiction, stated precisely

Two approved documents make incompatible demands of the same table:

- **TDD Part 5 §5.1** (STRIDE threat model, `[MANDATORY]`) names `TBL_ACCOUNT_DELETION` as the
  **deletion audit** mitigating repudiation. An audit must outlive the action it records.
- **TDD Part 2 §3.15** declares `account_deletion(user_id uuid pk references app_user(id) on delete
  cascade, …)`. The row is erased together with its own subject.

**Neither document is wrong; the schema is under-specified for the role the threat model assigns
it.** `account_deletion` is a good *request* table — pending intent, F-3 grace window,
owner-readable, correctly cascading as operational state about a live account. It cannot also be the
durable record of a completed erasure. **One row is being asked to have two lifetimes.**

## What ADR-034 settles, and what it deliberately does not

**Decided (engineering grounds):** the request and the audit are separate records; the audit is
service-role-only (ADR-030 — `authenticated` includes anonymous users, and anyone can mint an
anonymous JWT); the audit records the *fact* of erasure and never content recovered from the deleted
rows; and **`executed_at` is retired**.

**Referred to Security/Privacy with Legal sign-off:** *what identifies the subject of a completed
erasure* — the raw `user_id`, a one-way digest of it, or nothing. That determines whether the system
keeps a permanent list of identifiers belonging to people who asked to be forgotten, which is a
privacy decision with legal weight, not an engineering preference. **Recommendation recorded: the
digest form** — it verifies a specific claim without the table being a readable roster.
**No schema change before ratification.**

## Three findings while writing it

1. **The citation was wrong everywhere.** Every tracking doc, `DATA_INVENTORY.md`, and the executor
   migration's own header cited "TDD Part 2 §5.1". **Part 2 §5.1 is "Identity, Onboarding &
   Profile"** — API contracts, no threat model. The real conflict is **Part 5 §5.1 vs Part 2 §3.15**,
   across two Parts, which is plausibly why review of either alone never caught it. Seven citations
   corrected; the unrelated (and correct) Part 2 §5.1 references in `openapi.yaml`,
   `account/index.ts`, `accountRepository.ts` and `authRepository.ts` were left alone.
2. **`executed_at` is dead schema, not merely unwritten.** Its only reader is
   `sweep_due_account_deletions`'s `where executed_at is null` — a predicate that is unconditionally
   true, because the column can never hold a value. A column exists to record an event that destroys
   the row it lives on.
3. **A retention rule agreed today would not be enforced.** The only scheduled job that runs in this
   project is the deletion sweep; nothing consumes `job`. The ADR says so rather than specifying a
   period nothing implements — which is the exact failure it exists to resolve.

## Files

`docs/architecture/adr/ADR-034-Account-Deletion-Audit-Record.md` (new) · `adr/README.md` index ·
the executor migration's header comment (comment-only; `migrate.sh` replays idempotent SQL with no
checksum, so this is safe) · `DATA_INVENTORY.md` · the seven corrected citations.
6 vitest privacy tests still green.

## Next task

**Owner action: ratify ADR-034** (Security/Privacy, with Legal on the retention question). The
implementation behind it is small and entirely blocked on that answer.

Credential-free engineering meanwhile is thin, and the honest list is short: the **in-app deletion
screen** Apple 5.1.1(v) requires is blocked on a PDD affordance and SVC_household; the **`job` table
worker** stays deliberately unbuilt because every `job_type` is blocked on a product or vendor
decision; **PDD owes approved copy for eleven ERR_* codes**. The remaining Beta work is owner-gated
(Sentry org, paid Supabase, store accounts).

---

## Superseded — the dependency queue

## ✅ THE SDK-UPGRADE INCREMENT WAS INVESTIGATED AND DOES NOT EXIST · THREE PRs CLOSED (PR #78)

**Progress unchanged at 47%.** Dependency hygiene advances no Beta slice.

## What the investigation found

The three PRs queued as "one deliberate SDK-upgrade increment" were checked against the **installed
peer graph** rather than their release notes. None should land on SDK 54, and the reason is the same
for all three: `.github/dependabot.yml` already carried the correct rule — *an SDK-pinned package is
upgraded with the SDK via `expo install --fix`, never alone, because a lone bump produces a build
that resolves and then fails natively* — and only its **patterns** were short.

| PR | Verdict | Evidence |
|---|---|---|
| **#64** `@expo/metro-runtime` 6.1.2→57.0.7 | Closed | dist-tags map package majors to **SDK majors** (`sdk-55`→55.x, `sdk-56`→56.x, `latest` 57.0.7→**SDK 57**). This app is SDK 54 (the 6.1.x line); `expo-router@6.0.24` peer-requires `^6.1.2`. `expo-*` never matched a scoped `@expo/` name. |
| **#65** `@babel/runtime` 7→8 | Closed | `babel-preset-expo@54.0.12` peer-requires `^7.20.0`. Also one of the two undeclared transitive deps that broke bundling during the Execution Gap. |
| **#75** `react` 19.1.0→19.2.8 | Closed | RN 0.81.5's peer is `^19.1.0`, so 19.2.8 is peer-**LEGAL**. But react-native ships its own Fabric renderer built against React `"19.1.0"`, hardcoded in `Libraries/Renderer/implementations/ReactFabric-{dev,prod}.js`. |

**#61 was closed and superseded by #75** — Dependabot regenerated the group after #74 landed. Every
tracking document said "#61's react remainder"; all are corrected.

## Two things the previous framing got wrong

1. **"All three are red because they cross the SDK pin" was false.** #64 and #65 passed **all five CI
   gates, including the bundle gate.** #75 — the only peer-legal one — was the sole red. Green is
   anti-correlated with safety here: `expo export` resolves what fails natively. That is the third
   time this repo has paid for the lesson, after mmkv v2 under the New Architecture and
   `babel-preset-expo`.
2. **The recorded fix for #75 would have hidden the defect.** Its red is
   `Incorrect version of "react-test-renderer" detected`, thrown by
   `@testing-library/react-native`'s `build/helpers/ensure-peer-deps.js`, which asserts
   `react-test-renderer` === `react` **exactly**. Moving `react-test-renderer` to 19.2.8 — what
   TASK.md recorded as the required step — would have turned CI green while leaving RN's renderer at
   19.1.0, silencing the one assertion that noticed. There is nothing to gain either way: every
   19.2.x release note is React Server Components, which React Native does not use.

## What shipped (PR #78)

`.github/dependabot.yml`'s ignore list extended to `react`, `@types/react`, `@expo/*` and
`@babel/runtime`, with the per-package evidence recorded inline so the next session does not
re-derive it. Config only — no dependency or source change; YAML validated, both `updates` blocks
intact, `production-minor` group unchanged.

**No native build or Maestro run was required.** The saved plan called for both; the peer graph
answered the question first, which is the cheaper experiment and was available all along.

## Open queue

**#62** (i18next 23→26, red on lint/typecheck) and **#63** (jest 29→30, red on unit tests). Both are
majors, red for their own unrelated reasons, and each is its own decision. The queue no longer
contains an SDK-crossing PR.

## Next task

A **credential-free Beta item**. The strongest candidate is the **TDD resolution the deletion audit
owes** — `account_deletion.executed_at` is unwritable because the row cascades with its own subject,
contradicting TDD Part 5 §5.1's use of the table as the repudiation-mitigating deletion audit. It is
a documentation decision rather than code, and it is the last thing between B6 and an honest privacy
claim. The **in-app deletion screen** Apple 5.1.1(v) requires remains blocked on a PDD affordance and
SVC_household; the **`job` table worker** remains deliberately unbuilt, because every `job_type` is
blocked on a product or vendor decision.

---

## Superseded — the #61 split

## ✅ #61 IS SPLIT AND MERGED (PR #74)

**Progress unchanged at 47%.** Dependency hygiene advances no Beta slice.

## What shipped (PR #74, `0185ea9`)

Seven non-SDK bumps, landed on their own with all five CI gates green:

| Package | From | To |
|---|---|---|
| `@typescript-eslint/eslint-plugin` · `parser` | 8.63.0 | 8.65.0 |
| `prettier` | 3.9.5 | 3.9.6 |
| `turbo` | 2.10.4 | 2.10.7 |
| `@supabase/supabase-js` | 2.110.2 | **2.110.9** |
| `@tanstack/query-async-storage-persister` · `react-query` | 5.101.2 | 5.101.4 |

`@supabase/supabase-js` resolves to 2.110.9 rather than the 2.110.8 #61 names — a further patch
shipped after Dependabot opened it, inside the declared `^2.110.8` range.

**`react`, `@types/react` and the lockfile's `react@19.1.0` peer keys are deliberately untouched.**
Bumping `react` 19.1.0 → 19.2.8 past the exactly-pinned SDK 54 baseline while `react-test-renderer`
stays at 19.1.0 is the **single** reason the group was red — `Incorrect version of
"react-test-renderer" detected` — and the earlier triage had guessed the wrong cause (jest, which
stays at 29.7.0).

**Verified:** eslint 0 errors / 16 warnings (its baseline), tsc clean across 11 projects, 102 vitest
+ 33 ui + 350 mobile, `expo export --platform all` green for both platforms — locally and again on
CI's clean checkout. The lockfile diff is confined to the seven plus the peer-key rewrites the
parser bump forces through `eslint-plugin-import` and `eslint-module-utils`; no transitive drift.

## The E2E red after the merge — the harness, proven rather than assumed

Main went red on E2E immediately after the merge: 5/6 passed, **FLOW_AUTH_SESSION_PERSISTENCE failed
at step 21** with the tradition reverted to `generic`. That flow's own header documents that result
as **identity loss** — the defect `secureSessionStorage.ts` exists to prevent.

It was not dismissed as a flake, because the merge was a genuine suspect: `@supabase/supabase-js`
carries its sub-packages in lockstep, so the bump moved **`@supabase/auth-js` 2.110.2 → 2.110.9**,
which owns `persistSession` and the custom `storage` adapter that flow guards. Both hypotheses
predicted the same screenshot.

**Re-running the identical commit went 6/6 green**, which a deterministic regression cannot do. The
cause was the launch race this repo had already documented: logcat shows
`Destroy timeout of remove-task` 130ms into the flow's own cleared launch. **Fixed in all three
flows that opened with a fused `launchApp: clearState: true`** — AUTH_SESSION_PERSISTENCE,
ONBOARDING, SESSION_PERSISTENCE — matching FLOW_OFFLINE_SYNC's three discrete steps.

Stated precisely: this clears a **deterministic** auth-js regression, not a probabilistic one. If
that flow fails again, auth-js goes back on the suspect list rather than being treated as settled.

## Two incidental findings

1. **`pnpm` is no longer on PATH on the dev Mac.** Node 26 dropped corepack from the Homebrew
   install. `npx --yes pnpm@9.6.0 …` (the version in `packageManager`) works and is what every
   command here used. Expect a bare `pnpm install` to fail with `command not found` and do not read
   that as a repository problem.
2. **`pnpm format:check` fails on 248 files, and the prettier bump did not cause it.** Verified by
   running 3.9.5 and 3.9.6 against the tree: identical, 248 either way. Pre-existing, not a CI gate.
   Reformatting 248 files behind a dependency bump would have buried the diff — but it is worth
   deciding deliberately whether the repo adopts `format:check` or drops the script.

## Next task — the SDK-upgrade increment

> ⚠️ **Superseded and partly WRONG — do not act on this section.** Investigated 2026-07-28 (see
> Current Task): there is no increment here, and the claim below that "all three are red" is false.
> **#64 and #65 passed all five CI gates**, including the bundle gate; only #75 (which replaced #61)
> was red, and for a symptom. All three are closed, and `.github/dependabot.yml` now covers the four
> SDK-pinned packages so they are not regenerated.

**#61's `react` remainder + #64 (`@expo/metro-runtime` 6.1.2→57.0.7) + #65 (`@babel/runtime` 7→8),
as one increment.** All three cross the exactly-pinned SDK 54 baseline, which is why they are three
red PRs rather than three merges.

It is **not** a lockfile exercise. `react-test-renderer` has to move with `react`, and the result
must be validated by a **native build plus the six Maestro flows**, because that is the only method
that has ever caught this class of change here: the SDK 54 re-baseline was verified by bundling and
Expo Go alone, and a native build later found that mmkv v2 was silently degrading to memory under
the New Architecture. Local Android builds now work on the dev Mac (AVD `ppal_aosp34`), so it is
iterable without 20-minute CI cycles. `@babel/runtime` 7→8 deserves particular care: it is one of
the two undeclared-transitive-dependency defects that broke bundling during the Execution Gap.

#62 (i18next 23→26) and #63 (jest 29→30) are red for their own unrelated reasons and are separate
work.

---

## Superseded — the three owed follow-ups

## ✅ THE THREE OWED FOLLOW-UPS ARE CLOSED · E2E RUNS 6 FLOWS

**Progress unchanged at 47%.** None of this advances a Beta slice; it closes owed items and a
defect inside B6.

## What shipped (#72, #73)

- **The CCPA export omitted every message.** `EXPORT_TABLES` fetches with `.eq('user_id', …)` but
  `message` keys on `conversation_id`, so the export returned conversation HEADERS with none of
  their content — silently, because an empty row set and an unreachable one look identical. Fixed
  with a scoped second query and five tests. The sharper perturbation: widening the `in` clause
  past the caller's own conversations fails, because an unscoped fetch would turn a data-rights
  feature into a data breach.
- **`e2e.yml`'s flow echo** now derives from the directory Maestro runs, so it cannot drift again.
- **`FLOW_OFFLINE_SYNC`** — the flow PR #66 shipped without. Green on main; **E2E runs 6 flows.**

## Four E2E cycles, and none of the three defects were in offline sync

1. **A launch race.** `launchApp: clearState: true` fuses the clear and the launch; the stale TASK —
   not the process — was still being destroyed 1.1s in, so Android killed the process it had just
   created. The app never started and the flow failed 60s later looking exactly like a product
   defect. `stopApp` alone did not fix it; three discrete steps did.
2. **The flow broke a neighbour.** FLOW_AUTH_SESSION_PERSISTENCE lost a server-written preference,
   because a cleared offline banner proves the app *thinks* it is online, not that it is — NetInfo
   reports `isConnected` from a link-level signal with no usable route. The flow now makes the app
   prove connectivity with a cleared cold start before ending, so a dead radio fails the flow that
   turned the radio off rather than poisoning the next one.
3. **Both were visible only in the uploaded ARTIFACT** — the hierarchy holding nothing but the
   status-bar clock, and the logcat kill sequence. Neither appears in the run log. The lesson this
   project already paid for with the Pixel Launcher ANRs.

## Next task — split the seven non-SDK bumps out of #61

`@supabase/supabase-js`, both `@tanstack/*`, `@typescript-eslint/*`, `prettier`, `turbo`. The group
is red for one reason and it is not jest: it bumps `react` 19.1.0 → 19.2.8 past the **exactly
pinned** SDK 54 baseline, and `react-test-renderer` stays at 19.1.0 —
`Incorrect version of "react-test-renderer" detected`. Landing the seven shrinks the open queue from
five to a coherent three (#61's react half, #64, #65) that all cross the SDK pin and belong in one
deliberate upgrade increment with a native build and the flows validating them.

---

## Superseded — the deletion executor

## ✅ THE ACCOUNT-DELETION EXECUTOR SHIPPED

**Progress unchanged at 47%** — this closes a defect inside B6, a slice already counted, exactly as
offline sync closed a §6 gap without advancing one.

## What shipped

| Piece | Where |
|---|---|
| Atomic per-user erasure | `execute_account_deletion(uuid)` — `20260727000110_account_deletion_executor.sql` |
| Due-row sweep, one subtransaction per user | `sweep_due_account_deletions()` — same migration |
| pg_cron schedule, daily 03:15 UTC, idempotent | `20260727000120_account_deletion_schedule.sql` |
| Assertable state | `account_deletion_sweep_is_scheduled()` |
| Operator trigger (TDD §6.5's "scheduled SVC_account job") | `POST /account/sweep` |
| Proof | `apps/backend/tests/integration/account_deletion.test.sql` — 17 pgTAP assertions |

**SQL, not TypeScript.** The erasure spans nine tables and supabase-js has no transaction across
calls, so a failure midway would leave an account half-erased with no way to tell how far it got.
A function body is one transaction. The Edge action calls it and never reimplements it.

**Six foreign keys needed explicit handling.** Four RESTRICT — `household.owner_id`,
`invite.inviter_id`, `invite.accepted_by`, `referral.referred_user_id` — so a bare
`delete from auth.users` errors outright. Two more, `household_member` and `support_ticket`, use
**ON DELETE SET NULL**, which keeps the row and drops only the link: the deleted user's
`display_name` stays in the household, their `email` and free-text `body` stay in the ticket. Both
are deleted outright now. `referral.referred_user_id` is **nulled rather than deleted**, because
that row belongs to the referrer and one user's erasure must not destroy another person's record.

**Authorization.** The sweep is not authorized by identity: `withHandler` proves only that a bearer
token is present, and anonymous sign-in means anyone can mint one. A provisioned
`ACCOUNT_SWEEP_SECRET` authorizes it, compared in constant time, and **an unconfigured secret
refuses everyone** — "not protected yet" is how an endpoint that deletes accounts ships open.
Required at preflight's production tier (proven: exit 1 without, exit 0 with).

## A perturbation caught a defect in my own test

Removing the `support_ticket` delete did **not** fail the suite. The assertion counted rows
`where user_id = ...` — the exact column `ON DELETE SET NULL` had just nulled — so it read zero
while the email address sat in the table. The assertions now count by **content** (`email`,
`display_name`) and the same perturbation fails. A test written against the identifier a deletion
removes cannot detect a deletion that only removed the identifier.

## Verified against a real Postgres 17, not asserted

- Migrations applied from scratch: 32 tables, clean.
- **17 pgTAP assertions**, checking the rows are gone table by table rather than that the function
  returned without error.
- **Five SQL perturbations**, each failing the right assertions: support_ticket, household_member,
  referral-deleted-instead-of-nulled, the F-3 ownership gate, the grace window.
- **Two TypeScript perturbations** on the sweep authorization, each failing at both the pure-rule
  and handler layers.
- **The pg_cron branch exercised with the extension actually installed** — schedules, stays at
  exactly one job on re-run, and reports `false` when an operator disables it.
- The DR restore invariant fails with the executor dropped.
- 97 vitest (+9), eslint at its pre-existing baseline, RLS and DB suites still green.

## ⚠️ Two residuals, stated rather than implied

1. **pg_cron must be enabled on the hosted projects** — a Supabase dashboard action a migration
   cannot perform. The migration schedules the sweep where the extension exists and raises a
   **warning** where it does not. Until then, deletions execute only via the operator trigger.
2. **`executed_at` cannot be written.** `account_deletion.user_id` cascades with `app_user`, so the
   request row is erased along with its own subject and there is nothing left to stamp. This
   contradicts TDD Part 5 §5.1, which names the table as the **deletion audit** mitigating
   repudiation. Changing the foreign key would invent a privacy decision (the surviving row names a
   uid), so the executor implements the schema as declared and **the TDD owes a resolution**. A
   completed deletion currently leaves no record that it happened.

## Next tasks, in order

1. **Owner: enable `pg_cron`** (Dashboard → Database → Extensions) on dev/staging/prod, then re-run
   `20260727000120`. Verify `select account_deletion_sweep_is_scheduled();` returns true. This is
   the last step between the executor and a truthful store Data Safety answer.
2. **The `job` table worker (ADR-025).** The deletion sweep proved the pg_cron half; nothing
   consumes `job`, so `analytics_rollup`, `notify_schedule`, `winback_segment`, `content_ingest`
   and `entitlement_reconcile` are enum values with no consumer. The analytics rollup and prune, the
   personal-date tombstone sweep and the `panchang_cache` TTL are all waiting on it.
3. **The in-app deletion screen** — Apple 5.1.1(v) requires in-app account deletion. Needs a PDD
   affordance (none is specified) and SVC_household for the ownership transfer F-3 requires.

---

## Superseded — B6.3

## ✅ B6.3 COMPLETE — B6 CLOSED AT VERIFIABLE SCOPE

**44% → 47%** (3 of 8 Beta slices: B2, B5, B6 — the latter two at verifiable scope — plus ¾ of B4).

## What shipped

Three documents in `docs/devops/`, each derived from the one before it, plus the test that keeps the
first one honest:

- **`DATA_INVENTORY.md`** — all 32 tables classified (Identifying / Personal / Pseudonymous /
  Non-personal), with what each holds, who writes it, and whether it is collected **today** rather
  than merely anticipated by the schema; the **nine** `EVT_*` ids actually emitted with their props
  (the PDD §11 registry is the permitted vocabulary, not the emitted set); six on-device storage
  keys; six third-party processors; permissions — **none requested today**.
- **`PRIVACY_POLICY_DRAFT.md`** — `[LEGAL REVIEW REQUIRED]`, with `[UNBUILT]` markers wherever a
  normal policy sentence would be false today, and a §7.2 that refuses to promise deletion.
- **`STORE_PRIVACY_LABELS.md`** — Play Data Safety + Apple App Privacy answers, each carrying the
  ⚠️ trigger that changes it when `expo-location`, `expo-notifications`, `react-native-purchases` or
  `GURU_LIVE` lands.
- **`apps/backend/tests/privacy/data-inventory.test.ts`** — parses `create table` out of the
  migrations and quoted `'EVT_*'` literals out of `apps/mobile/{app,src}`, and compares both against
  the document **in both directions**. An unclassified new table is collection nobody disclosed; a
  classified table the schema lacks is a disclosure for data the product does not hold. The pattern
  `SYNCABLE_KINDS` already uses against SVC_sync's handler source.

**Deliberately parsed from the migrations rather than from `packages/database`'s `TABLES` registry —
which had itself already drifted, 29 names against 32 tables.** A hand-maintained list of tables fell
behind the schema inside one milestone; that is the failure this test exists to prevent, with a
worked example already in the repo.

**Verified:** four perturbations, each failing exactly the right test — a new table in a migration,
a table row deleted from the doc, a newly emitted `EVT_029`, an event row deleted from the doc.
88 vitest (+6), eslint 0 errors.

## ⛔ The finding: deletion is recorded and never carried out

`POST /account/delete` gates the request correctly (F-3: an owner with other members must transfer
ownership first) and writes `account_deletion` with `requested_at` and a 30-day `execute_after`.

**Nothing ever reads that row back.** No Edge Function queries the table; no runner processes `job`
(`analytics_rollup`, `notify_schedule` are enum values with no consumer); `pg_cron` is **commented
out** in `20260712000001_extensions.sql`; `executed_at` is never set by any code path. TDD Part 5
§6.2 specifies deletion that "hard-deletes owned rows" — that code does not exist in this repository.

**Why this is worse than an ordinary missing feature.** The row it writes makes the system *look*
like the request is being honoured, and it is the basis on which a privacy policy and two store
forms would claim a deletion capability. CCPA §1798.105 grants a right to deletion, not a right to
have a request logged. It is the fourth instance of this milestone's signature defect — a documented
control, never implemented, with nothing asserting it — and the most consequential of the four.

**Same root cause, four more symptoms.** There is **no scheduled execution in this project at all**,
so nothing rolls up or prunes analytics, nothing removes personal-date tombstones, and
`panchang_cache` has no TTL sweep. One fix, not five.

**Also found:** the CCPA export omits `message` rows (incomplete the day Ask Guru goes live); no
in-app affordance exists for export or deletion, and **Apple 5.1.1(v) requires in-app account
deletion**, making it mandatory rather than a nicety; a user-deleted personal date is a `deleted_at`
tombstone rather than an erasure and must be disclosed.

**Not done, and stated:** nothing here is legally reviewed, and no document is publishable until the
executor exists.

## Next task — the account-deletion executor

An Edge Function (or `pg_cron`-invoked routine) that reads `account_deletion` rows past
`execute_after`, hard-deletes the `OWNED_TABLES` set, sets `executed_at`, and removes the
`auth.users` row — **plus something to invoke it**, which this project has never had. That second
half is the wider fix: every retention sweep is waiting on the same capability.

Its in-app half is a three-part dependency: the executor (engineering), a deletion screen (PDD
specifies none), and **SVC_household** for the ownership transfer F-3 requires.

Prove it as this repo proves things: a test that fails with the executor removed, and an assertion
that a deleted user's rows are genuinely gone rather than orphaned.

---

## Superseded — the previous task framing

## ✅ OFFLINE SYNC MERGED (`86b3843`, PR #66)

**Merged 2026-07-26 after verification, not before it.** Five CI gates green, and E2E dispatched on
the branch (run 30207484940 on `a05760d`) passed **5/5 Maestro flows** in 5m16s — FLOW_ONBOARDING
and FLOW_RETURNING included, which is what proves the two new startup effects (query-cache restore,
drain on mount) did not disturb a fresh launch. E2E does not run on PRs (`e2e.yml` triggers on push
to main + dispatch), so dispatching on the branch is the only way to get that signal pre-merge —
the precedent PR #55 set.

## Offline sync — what shipped

The queue was in-memory beneath a header claiming MMKV persistence, never drained and never
dequeued, and **nothing in `src/data` bound API_POST_SYNC at all** — SVC_sync had been implemented
server-side since the Backend Foundation milestone and was unreachable from the app. This
contradicted **offline-first**, a permanent architecture decision, and §10.1's "offline loop + sync
verified".

Built in layers, decisions pure and effects thin:

- **`src/domain/sync/`** — FIFO batching, exponential backoff with half-range jitter (full jitter
  can return ~0, i.e. retry instantly into a radio that is still down), capped attempts,
  reconciliation. A conflict is ACKNOWLEDGED, per §6.3's resolve-by-rule; anything the server
  returned in neither list is retried.
- **`STORE_offlineQueue`** — persisted through the shared `KeyValueStore` seam, lazily resolved.
- **`src/data/syncRepository.ts`** — the missing API_POST_SYNC binding. Sends contract fields only;
  local retry bookkeeping is none of the server's business.
- **`src/data/syncService.ts`** — single-flight drain, batch loop, non-blocking status. Attempts
  are capped to stop silent retrying, **never to discard a mutation** (§6 forbids losing one).
- **`useOfflineSync`** — §6.4's three triggers, mounted renderless in AppProviders.
- **`src/data/queryPersistence.ts`** (§6.1) — the READ half, which `queryClient.ts` had assigned to
  "the offline-queue task". Without it a cold start offline shows nothing, so §6.2's `[MANDATORY]`
  cached daily loop could not hold. Allowlisted to §6.1's set plus `checklist`; `entitlement` and
  `invite` are excluded (§6.2 network-only; a stale entitlement off disk would grant or deny
  premium from a snapshot the server has already changed).

**Two defects found while building it**, both now guarded:

1. **Five client kinds vs three server kinds.** `preferences` / `notif_prefs` reached SVC_sync's
   `default:` branch and were returned in neither `applied` nor `conflicts`, so no drain could ever
   retire them. The type now narrows to the server's contract, and a test reads the kinds out of
   the handler's SOURCE so client and server cannot drift apart silently.
2. **Enqueuing before hydration wiped the persisted queue** — a write against an un-hydrated store
   overwrote the previous launch's pending mutations. Caught by a test that failed on first run.

**Verified:** four perturbations each failed the right tests (persistence off → 5; "200 means
success" → 3; unsyncable kind → 1; allowlist ignored → 4). 350 mobile tests (+51), 82 vitest, tsc
clean, eslint 0 errors, `expo export` green.

**NOT done, and stated rather than implied:** never exercised against a live backend; no
`FLOW_OFFLINE_SYNC` Maestro flow; `STORE_syncStatus` has no UI surface because PDD specifies none.

**Progress is unchanged at 44%** — offline sync is a TDD Part 4 §6 gap in the Mobile MVP found
during B6, not one of the eight Beta slices. It closes a launch blocker without advancing a slice.

## Next task — B6.3

Data-collection inventory built from the code (every table, field and `EVT_*` the app actually
writes), then a draft privacy policy and store Data Safety / App Privacy answers derived from it,
marked as requiring legal review. The last credential-free slice work.

---

## Superseded — the previous task framing

## B6 — Security & Privacy: what shipped (PRs #57, #58)

**B6.1 OWASP Mobile Top 10 review ✅** — `docs/devops/OWASP_MOBILE_REVIEW.md`, every category against
the app as built with file:line evidence. Two categories were launch-blocking:

- **M1/M9 — the auth session was never persisted.** `persistSession: true` with no `storage`
  adapter falls back to memory in React Native; because the app is anon-first that minted a fresh
  anonymous uid every cold start, orphaning the user's profile, household, streak, completions,
  personal dates and conversations. Fixed with a Keychain/Keystore adapter; proven by
  `FLOW_AUTH_SESSION_PERSISTENCE`, which FAILS with the fix reverted.
- **M3 — SVC_account had no authorization.** It read the acting identity from the request body while
  running with the service role. `POST /account/merge {"anon_uid": "<victim>"}` reassigned a victim's
  rows across every owned table (account takeover); `/account/delete` deleted any named account.
  Every action now derives the caller from the JWT; `merge` requires the anon session's ACCESS TOKEN
  as proof of ownership. Proven to fail on the reintroduced defect.

**B6.2 CCPA export ✅ at verifiable scope** — the five §6.4 row sets behind a versioned envelope
(`panchangpal.export.v1`, `format_status: awaiting_ratification`) because F-10 is product-owned and
unratified. **No UI consumes it**: PDD specifies no screen, so adding one would invent UX — the
affordance is owed by the PDD. NOT yet exercised end-to-end against a live backend (needs a redeploy).

**B6.4 §5.2 controls ✅** — SBOM via pinned cdxgen, Dependabot (grouped), and `eas-cli@latest` pinned
at all four call sites, including the one that signs the release artifact.

**B6.3 remains:** data-collection inventory → draft privacy policy + store Data Safety labels.

## Next task — offline sync (launch blocker)

`STORE_offlineQueue` is in-memory despite its header claiming MMKV persistence, is **never drained**
to SVC_sync, and is **never dequeued** on success. Four hooks enqueue into it. Online the app works,
because every hook also calls the API directly; offline, the mutation is silently lost on app kill,
and successful ones leak. SVC_sync is fully implemented server-side and unreachable from the client.

This contradicts **offline-first**, a permanent architecture decision, and §10.1's
"☐ offline loop + sync verified". Needs drain orchestration, persistence, retry/backoff and
`ERR_SYNC_CONFLICT` handling per TDD Part 4 §6.

---

## Superseded — B6 as originally scoped

## Status — the E2E gate is green; the previous "red main" task was based on a stale handoff
**Closed 2026-07-26.** Main's E2E was already green when the previous session handed it off as the
top ⛔ priority: run 30171884650 (`0ca0906`) passed **4/4 including FLOW_ONBOARDING** at 19:34, half
an hour after the 19:01 failure the handoff was written from. **PR #53 is verified, not unproven.**

Reading the artifacts (not the run logs — logcat and hierarchies are only in the uploaded artifact)
showed **3 of the 4 recent failures were Pixel Launcher ANR false-reds**, ~21% of runs, all of them
with `hide_error_dialogs 1` already active. The one genuine red was the #50 onboarding-gate breakage,
correctly diagnosed and correctly fixed by #53.

**PR #55 (merged, `d56a4cb`)** removes the cause instead of the symptom: AVD `target: google_apis` →
`default` (AOSP — no Pixel Launcher, no Google app). Nothing under test needs Play Services. Verified
4/4 green in 1m23s on run 30196467032, with zero `Pixel Launcher` references anywhere in the
artifacts and the image confirmed as `system-images;android-34;default;x86_64`.

**Progress is unchanged at 31%** — B2 was already complete, and repairing a flaky gate is not a new
increment.

Status
🟡 **B4.1 ✅ (PR #39, `25275ff`) · B4.2 ✅ (PR #40, `c099263`) · B4.3 ✅ to its credential-free limit
(branch `feat/b4-source-maps`, unreviewed) · B4.4 blocked.** Canonical progress 19% → 22%.

**B4 cannot progress further on engineering alone.** Both remaining pieces — the source-map upload
and the §7.2 dashboards/alerts — need a Sentry org and DSN to be real rather than configured. The
free tier suffices, so this is an owner action, not a cost.

### B4.1 — done
`TelemetryAdapter` port + `NullTelemetryAdapter` (`src/domain/telemetry/`), composed in
`src/data/telemetryAdapter.ts`; pure `toErrorCode()` / `toClientErrorEvent()` mapping every ERR_* to
EVT_054 (§7.1); both call sites wired — `ErrorBoundary.componentDidCatch` (replacing its TODO) and a
global `ErrorUtils` handler. No PII by construction. 205 tests (+29), tsc clean, eslint 0 errors.

**It reports nothing.** Sentry is deferred (`@sentry/react-native` uninstalled, no DSN), so the Null
adapter drops every report and crash-free sessions (NFR-06, §7.2) stay unmeasurable — B4 cannot close
on the seam. `getTelemetryBackend()` returns `'none'` and a DSN without an adapter warns, so the gap
is visible rather than silent. Turning it on: install the SDK, provision a Sentry org + DSN (free
tier suffices), swap one line in the composition root.

### B4.2 — done
`AnalyticsService` port + batching implementation over `analytics_event` (ADR-013): batches of 20,
capped at 200 oldest-first, flushed on backgrounding, failed batches re-queued in order, insert-only
under RLS. Every ERR_* now lands as EVT_054, so error rates are measurable without Sentry. Three
privacy decisions recorded in DECISIONS.md: a device-minted random `user_pseudo_id` never derived
from an identity, primitives-only props, and rejection of any event id outside the PDD §11 taxonomy.
229 tests (+24), tsc clean, eslint 0 errors. **Not verified against a live database** — the insert
path has only run against a fake repository, never a real `analytics_event` under RLS.

### B4.3 — done, to the limit credentials allow
- **Edge Function telemetry seam.** Every ERR_* now passes through a `ServerTelemetry` port at
  `errorResponse()` — the one exit all of them already shared — carrying the function name and the
  correlation id that threads the structured logs and the client's EVT_054. `NullServerTelemetry`
  drops them; no message is ever included, because a server-side unknown error is usually a
  library's and will happily put a query or a token in its text.
- **preflight:** `SENTRY_DSN` / `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` required at
  the production tier, warn-only at staging — the asymmetry B1 set for `REVENUECAT_WEBHOOK_SECRET`.
  Proven by running it: exit 1 unset, exit 0 set.
- **release-build.yml:** a readiness gate that BLOCKS a production build with Sentry unconfigured
  and warns on staging. A production release without crash reporting cannot be measured against
  NFR-06, which §10.1 gates on.

**Not done, and not fakeable:** the source-map upload itself. Hermes maps must be uploaded from
inside the EAS build that produced the bundle (what `@sentry/react-native`'s Expo config plugin
does); maps from a separate `expo export` belong to a different bundle, so uploading them yields
symbolication that is confidently wrong. The SDK is not installed, so the gate says so out loud
rather than a step pretending to upload.

### Blocked on the owner — a Sentry org + DSN (free tier)
With it: install `@sentry/react-native` + its config plugin, swap one line in
`src/data/telemetryAdapter.ts` and one in `_shared/http.ts`, and B4.3's upload plus B4.4's
dashboards/alerts become verifiable. Without it, B4 stops here.

### EVT_* instrumentation — DONE (branch `feat/b4-evt-instrumentation`, unreviewed)
The daily habit funnel (PDD §11.4) emits: EVT_012 Today Viewed · EVT_015 Ritual Started · EVT_016
Step Advanced · **EVT_017 Ritual Completed** (the North Star input) · EVT_018 Abandoned · EVT_019
Checklist Item Completed · EVT_020/021 Streak Advanced / Grace Used. Registry events only, §11.2
property schemas. Ritual events derive from view-model transitions via a pure mapper, so a
re-render cannot double-count; EVT_020/021 come from the server's streak, never a client guess.
Also fixed EVT_054's props — B4.1 shipped `code`/`surface` where §11.2 specifies
`error_code`/`screen_id`. 244 tests (+15).

### Analytics insert-only contract — DONE (branch `test/analytics-rls-gate`, unreviewed)
Five pgTAP assertions in the RLS suite, using the exact envelope `buildEnvelope()` emits (including
the null-household / null-session case an anonymous user produces), so a schema or policy change
that breaks the client fails in CI. Verified additionally against the hosted **staging** project
with its anon key: INSERT `201` · SELECT `200 []` · UPDATE `200 []` · DELETE `200 []`.

Writing it surfaced a subtlety now recorded in DECISIONS.md: Supabase grants clients broad table
privileges and lets RLS filter, so an unauthorised UPDATE/DELETE **modifies nothing rather than
raising** — `throws_ok` would have failed, `lives_ok` would have passed while proving nothing. The
assertions use `is_empty(… returning 1)`.

### API contract tests — DONE (branch `test/api-contract-tests`, unreviewed)
`openapi-conformance.test.ts` compares the zod contracts against `docs/api/openapi.yaml`: eight
shared enums vs the components that mirror them, ErrorEnvelope's required set, and API_GET_TODAY's
required query params + response properties (equality both ways). **Proven to fail** by three
perturbations — a dropped `tz` param, an invented ERR_* in the spec, a renamed response property —
each failing exactly one test. Deliberately NOT a suite that parses a valid object with zod, which
would restate the schema and pass forever.

Of B1's two de-declared gates, only the **AI eval harness** (refusal + golden-set subset, TDD Part 3
§9.4) remains owed; it needs the corpus, which is a separate blocker.

### B5 increment 1 — DONE (branch merged, PR #46)
`docs/devops/DR_RUNBOOKS.md` covers §8.3's five scenarios with literal repo commands.
`.github/workflows/dr-drill.yml` builds from repo, `pg_dump` → `pg_restore --exit-on-error`, re-runs
the SAME invariants on the restored database, and compares seeded row counts — monthly, and on any PR
touching migrations or seed. First run: restore 1s, invariants OK both sides.

### ⛔ Found while doing it: NFR-15 is UNMET, and it is a launch blocker
There is **no point-in-time backup to restore from**. PITR is a paid-plan feature; both hosted
projects are free-tier. Schema and seed rebuild in minutes from the repo; **user data — profiles,
households, completions, streaks, personal dates, conversations — is simply not recoverable.**
Shipping to real users in this state means one incident is permanent data loss. Closed by the same
~$25/month purchase that closes B1, which makes that purchase a reliability decision rather than an
environments one.

### B5 increment 2 — DONE (PR #48, merged)
`DEGRADATION_POLICIES`: a tested policy per ERR_* (surface, retry, queueing, daily-loop impact, copy
key, §12 row), exhaustive over the shared taxonomy. Invariants asserted: no failure blocks the daily
loop, honest declines offer no retry, offline/sync queue, location redirects, only uncaught failures
go global. Copy is §13.5 verbatim; the eleven codes it does not cover are pinned in
`AWAITING_APPROVED_COPY`. **PDD owes those eleven strings** — a documentation deliverable, not a
coding one.

### B5 increment 3 — DONE (PR #50, merged)
§8.4 operator resilience recorded honestly (what exists vs what does not), plus the onboarding gate:
`const ONBOARDED = true` replaced by a persisted flag through the shared `KeyValueStore` seam, both
gate exits marking it, and **FLOW_ONBOARDING written** — B2's sixth flow, unwritable until now.

### Next
1. **B6 — Security & Privacy** (§5/§6): OWASP Mobile review, CCPA export/delete verified end to end
   (F-3/F-10), store privacy labels. The next unstarted slice, and entirely credential-free.
2. **AI eval harness** (§9.4) — the last de-declared gate, blocked on the reviewed corpus.

(`FLOW_ONBOARDING` was listed here as unreachable while `app/index.tsx` hardcoded `ONBOARDED = true`.
Both are resolved: PR #50 made the gate a persisted flag, and the flow now passes in CI.)

Still owner-gated: a **Sentry org + DSN** (free tier) closes B4.3's source-map upload and unblocks
B4.4; prod Supabase (~$25/mo) closes B1; Apple $99 + Google Play $25 close most of B3.

B1/B3 remainders stay owner-gated (prod Supabase ~$25/mo closes B1; Apple $99 + Google Play $25 close
most of B3).

The remaining Maestro flows are still out of B2/engineering reach: `FLOW_HOUSEHOLD_INVITE` needs
SVC_household; `FLOW_ASK_GURU` only exercises the gated path (GURU_LIVE=false). `FLOW_ONBOARDING` is
no longer among them — it is written and green (4 flows now run in CI, not 3).

Everything else in B1/B2/B3 remains gated on money, a store account, or a later slice.

## Standing inventory — what is left in B1/B2/B3, by cost

*(Historical as of 2026-07-19, superseded where it conflicts with the Current Task above: B2 is
COMPLETE and its free engineering item — session persistence — is closed. B1 ~85% and B3 ~80% stand,
with every remainder gated on money, a store account, or a later slice.)*

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
      react-native-purchases. (`FLOW_ONBOARDING` was here; done and green since PR #50.)

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

