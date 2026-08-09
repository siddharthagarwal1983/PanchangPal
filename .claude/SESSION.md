# SESSION.md

# PanchangPal — Current Session

Version: 20.0.0
Last Updated: 2026-08-09 (**ADR-025's rollup is BUILT and pg_cron was watched executing it** —
`analytics_event` stopped being write-only. Plus SDK 57 on both platforms, ADR-033 ratified, and
the activation funnel instrumented as far as the product allows)

---

# Part 6 — the analytics rollup: the app's events can finally be read

**Progress stays 63%.** Three PRs merged (**#125**, **#126**, **#127**); none completes a Beta
slice, but together they close the shared blocker behind §10.1 items **11**, **19** and **21**.

## ⛔ The North Star had no usable day, and no server-side fix was possible

§11.3 defines it as **EVT_017 grouped by `household_id` per ISO week**. Grouping was fine;
**bucketing was not.** The envelope carries only `ts` (UTC) and EVT_017 carried no local date — so
a **07:00 Auckland ritual is 18:00 UTC the previous day**, landing Monday's completion in Sunday
and, across a week boundary, **the wrong ISO week**. Issue #30 one layer up: `localDateIn`/ADR-026
fixed the data model, and the analytics family never got the same treatment. **EVT_012 already
carried `local_date` and its own comment explains exactly this risk** — written once, never
extended to the funnel it describes.
⛔ **And the server cannot repair it**: `user_pseudo_id` is deliberately un-joinable to
`user_profile` (ADR-031), so the zone is unrecoverable. **Pseudonymity and metric correctness are
in genuine tension, and pseudonymity is the one already ratified** — the day travels with the
event (#125). `local_date` is emitted as **null rather than omitted** when the zone is unresolved:
EVT_012 *waits*, which suits a view, but dropping a **completion** under-counts the metric the
product optimises for while guessing mis-attributes it.

## ✅ The rollup (#126) — counts, a window, and a marked fallback

`analytics_rollup_daily` · `rollup_analytics_daily(p_lookback_days)` · hourly pg_cron ·
`analytics_rollup_is_scheduled()`.
**Counts, never ratios** — §11.3 says "EVT_017/opens" and never defines "opens"; a stored rate
freezes an unratified denominator into the data. **Daily grain, weeks derived** — days sum into
ISO weeks; weeks do not divide into days.
⚠️ **The lookback window is the point.** Events arrive late by design (batched 20 per flush, queue
drains on reconnect), so a worker that rolled up "yesterday" once would **permanently under-count
the offline-first usage the product is built around**. The upsert **recomputes rather than
increments**, which is what makes late arrivals correct and re-runs safe.
**`attributed` is a column, not an assumption** — an event with no usable `local_date` is bucketed
by UTC and *marked*, so the North Star can exclude it and an operator can measure how much data
cannot be trusted to a day. **`nulls not distinct`** because a solo user's NULL `household_id`
would otherwise insert unbounded duplicate rows instead of updating one.

✅ **VALIDATED ON A REAL POSTGRES 17, INCLUDING THE BRANCH THAT HAD NEVER RUN.** 17 pgTAP
assertions (66 across four suites) · three perturbations (UTC bucketing fails the Auckland tests;
incrementing fails idempotence; removing the malformed-date guard aborts the run outright) · then
on a **pg_cron-enabled** instance: the job scheduled, re-running the migration twice left exactly
**one** job, and **pg_cron was watched executing the function on its own schedule**
(`status=succeeded`) with the table populated by the scheduler. §8.4's standard — a control nobody
has seen run is a plan, not a capability.

## ⛔ The activation funnel is instrumented only as far as the product allows (#127)

**EVT_003 fires at the GATE, not the screen.** `/(onboarding)/sign-in` is reached from **four**
places and only one is onboarding; the other three push it for users who onboarded weeks ago.
Tracking there would feed them into the funnel's **top** — and §11.3 measures activation as a
**rate**, so a bloated denominator **drags it toward zero while looking like a conversion
problem**. **EVT_005** carries `source` (onboarding has no tradition step, so every selection today
is a later edit) and fires only on a real change.

⛔ **EVT_004 and EVT_011 are NOT instrumented, and neither is unfinished code.** `expo-location`
is uninstalled with no location screen, so EVT_004's flow does not exist. **EVT_011's own
definition** — *"Household + first panchang + notif enabled in first session"* — has **two
structurally impossible conditions**: panchang returns `unavailable` (ADR-033 authorises writing
an engine, never serving one) and `NullNotificationAdapter.requestPermission()` returns
**`'denied'`** deliberately. Implementing it faithfully yields an event firing **zero times
forever**, so the board reads **0% against a ≥55% target** — a catastrophic-looking product failure
that is actually an unbuilt capability. **The B8.3 rule exactly: a metric wrong in a plausible
direction is worse than one that is absent.**
⚠️ **That is now THREE registry entries describing a richer product than exists** — EVT_004,
EVT_011 and NFR-10's absent sync event. The taxonomy was written for the finished product; a
funnel can only be as complete as the features beneath it.

## ⚠️ Three of my own errors, each caught only by running something

`sum()` returns **numeric** so pgTAP's `is()` had no signature · the plan declared **16** against
17 assertions · and **I never re-ran the JS suites after adding a migration that a JS test reads**,
so CI caught `analytics_rollup_daily` as an unclassified table. **Thoroughness in one layer is not
coverage of another.**
⚠️ **And one instrument measured nothing:** I grepped jest output for `✕`, which it does not print
without `--verbose`, saw silence, and nearly concluded my own guards were vacuous. **The summary
line is the instrument** — the same shape as `--detectOpenHandles` and the ring-buffer theory.

✅ **The privacy inventory caught new collection THREE times in two days** — `local_date` on five
events, the `analytics_rollup_daily` table, and EVT_003/EVT_005. ⚠️ **But its prop half is
documented and unenforced**: the coverage tests match event **ids** while the failure message
promises "with the props it carries", so adding `local_date` passed silently. Closed for
`local_date` specifically; **general prop enforcement is recorded as an open gap** rather than
faked, because a regex over dynamically-assembled props would be a parser pretending to be a
checker — which reads as coverage and is worse than nothing.

**Verified:** tsc **11/11** · eslint **0 errors** · vitest **220** · mobile jest **456** · pgTAP
**66** · all five CI gates green on #125/#126/#127.

---

# Part 5 — SDK 57 proven on device, iOS built at last, and ADR-033 ratified

**Progress stays 63%.** Neither item completes a Beta slice: the SDK upgrade is platform
maintenance, and ratifying an ADR surfaces a decision rather than shipping one.

## ⛔ The tracking documents were a whole increment stale again

`chore/expo-sdk-57-upgrade` (`1c4a2f0`) sat **committed locally, unpushed, with no PR and no CI
verdict**, while `PROJECT_MEMORY.md` v3.7.0 already described the SDK 57 baseline as fact and
**SESSION/TASK/DASHBOARD/CURRENT_MILESTONE mentioned it nowhere.** One document had run ahead of
four. **`git log` is the instrument** — the same finding as B7's close, one session later.

## ✅ The upgrade is now verified on both platforms

Opened as **PR #121**. Verdict:

| Layer | Result |
|---|---|
| Five CI gates | green, none `SKIPPED` via `needs:` |
| Counts | mobile **450/450** · ui **33/33** · vitest **219** — identical to the SDK 54 baseline |
| Bundle budget (B8.2) | ios **4.93 MiB** (*down* from 5.04) · android **5.12 MiB**, both under 6 MiB |
| **Android E2E** | **6/6 flows, 2m22s**, run `31291087673` green |
| **iOS** | **native build + app running on the simulator — a project first** |

**The bundle gate answered the plausible worry with a number**: a three-major RN jump made iOS
*smaller*. That is the most useful thing B8.2 has produced.

## ✅ iOS was never "blocked on a $99 membership" — that was distribution

PROJECT_MEMORY recorded iOS as unbuilt and needing an Apple membership. **The simulator needs
none.** What it actually needed was CocoaPods (system Ruby 2.6 is too old — `brew install
cocoapods`) and the **iOS platform/runtime**, which Xcode 26 does not ship: `-showsdks` lists the
simulator SDK while `xcodebuild` reports *"Found no destinations"*, so the ~7 GB
`xcodebuild -downloadPlatform iOS` gates **compiling**, not merely running. **293 pods** resolved
— NitroModules 0.35.10, Hermes, Sentry 8.58.0, ExpoSecureStore.
✅ **And the runtime log shows `MMKV::sync` writing to disk** — the storage seam has real native
backing on iOS, the seam whose v2 failure on Android silently degraded to memory.
✅ **`[telemetry] reporter=none env=development`** — `isUsableDsn()` correctly rejects the
placeholder DSN, and the environment is **not** mislabelled `production`. #98's observable doing
its job on a platform it was never tested on.
⚠️ **A local iOS build fails on the Sentry source-map upload** unless `SENTRY_DISABLE_AUTO_UPLOAD=true`
is set, as `e2e.yml` does. The upload task **fails the build rather than skipping** — recorded from
PR #79 on Gradle, now confirmed identical on iOS. Owed: a line in `SETUP.md`.

## ⛔ A green E2E run reported nothing for 35 minutes after passing

Run `31289038585` showed `6/6 Flows Passed in 6m 37s`, printed `[e2e] captured 12385 logcat
lines`, ran `adb emu kill` → `OK: killing emulator, bye bye` — **and then hung until cancelled.**
The suite had succeeded 35 minutes earlier. Left alone it would have burned to
`timeout-minutes: 90` and reported red.

⚠️ **`timeout` wraps only `maestro test`, so the guard cannot fire for this** — the hang is in the
emulator-runner's teardown, *after* the guarded command. Same shape as B7.3's `promote-production`
turning a successful rollback red: **a run whose colour contradicts the work it did.**
⚠️ **It did NOT recur** on the re-dispatch (2m22s flows, 17m32s total), so it is **intermittent,
not systematic** — recorded rather than fixed. **Judge such a run by the `Flows Passed` line, never
its colour.**
⚠️ **And cancelling did not destroy the evidence** — `Upload Maestro debug output` is `if: always()`
and produced the 1.56 MB artifact that settled all of this.

## ✅ ADR-033 ratified at a narrowed scope — and it found its own gate is unbuildable

Owner rulings recorded in the ADR's new **Ratification Record**: **B-1 JPL DE440** (public domain —
**removes the Swiss Ephemeris AGPL/commercial licence question, the MR-6 legal blocker**) ·
**B-2 Lahiri (Chitrapaksha)** default with per-tradition override · **B-3 `generic` ONLY**, the other
three deferred to a pandit reviewer · **B-4 festival dates exact, N and M deliberately unset**.

⛔ **R1 — THE RATIFIED ACCEPTANCE GATE CANNOT BE BUILT.** TDD §6 needs a golden dataset
cross-checked against Drik/mPanchang. **None existed**, and the seed holds **one** festival —
`sample-festival`, *"Placeholder significance (reviewer content to follow)"*. So "festival dates
exact" has nothing to measure, and a gate would pass vacuously — the shape `ci.yml` bans.
**The engine and the festival corpus are blocked on the same reviewer**, which matters for
scheduling them as if they were independent.
⚠️ **R2 — DE440 is a bigger build than the option it replaced**: JPL binary SPK kernels
(`de440s.bsp` ≈ 32 MB) with Chebyshev interpolation, and no mature JS/Deno SPK reader — the
maintained MIT libraries implement VSOP87/Meeus, **not DE440**. The licence risk removed returns as
implementation surface.
⚠️ **R3 — three seeded traditions become selectable but unserved.**

**Shipped:** `GOLDEN_DATASET.md` + `generic-2027-phase1.csv` — **46 rows, keys only, every value
UNFILLED**, stratified on what is computable without astronomy (DST transitions ±1 day from the
IANA database · solstices/equinoxes incl. Anchorage at 61.2°N · monthly coverage · **no-DST
controls** that separate a DST fault from an astronomy fault). **A uniform year of 365 dates would
agree with any roughly-correct engine.**
⛔ **The rule that makes it worth having: expected values come from independent references and
NEVER from our engine** — nor from a library we are considering adopting, which is the same error
one layer out. Every row carries `source`/`source_url`/`checked_by`/`checked_on`, because **a
golden value without provenance is an assertion, not a reference.**
⚠️ **The circularity is real and Phase 2 breaks it:** the sharpest rows are tithi boundaries within
minutes of sunrise, and choosing those needs an engine. So a candidate engine may **propose** the
dates; the reviewer supplies the answers. **The engine chooses the questions, never the answers.**
✅ **`generic`'s four profile fields are RULED (2026-08-09)** — `month_scheme` **purnimanta** · `tithi_reference` **tithi-at-sunrise** · `sunrise_convention` **upper limb + standard refraction** · `day_division` **sunrise→sunset in 8 equal parts**. ⚠️ Two caveats carried, neither blocking the engine: the **Rahu Kaal weekday→segment mapping is PROVISIONAL** and no engine may read it until the pandit reviewer confirms it, and **`generic` now carries a regional convention (purnimanta = North Indian) under a name TDD §4 calls "neutral"**, so a South Indian user who never opens the tradition picker gets purnimanta month names silently.

**Verified:** CI green on #121 · E2E **6/6** · iOS native build + running app. The ADR/dataset work
is documentation and data only — no code path touched.

---

# Part 4 — B8.3: the monetization funnel emits

**Progress stays 63%.** EVT_049/050/051/052 are wired across both upgrade surfaces, derived purely in
`src/domain/analytics/subscriptionEvents.ts` — the `ritualEvents.ts` pattern, because a screen calling
`track()` inline **double-fires on re-render** and a conversion rate with an inflated denominator is
worse than none. **EVT_051/052 come from the `usePurchase`/`useRestore` seam rather than the screens**:
two surfaces open a purchase, and a funnel a third could join without reporting has a silent hole.

## ⛔ The anchors had been comments for months

Including an **empty `useEffect` whose entire body was `/* analytics: EVT_049 */`** — a no-op effect
existing only to hold a comment. They were written while the Analytics Adapter was deferred; **B4.2
shipped it and nothing went back to finish them.** A test now fails if either anchor returns.

## ⛔ `unavailable` deliberately emits nothing

`NullPaymentAdapter` returns `{outcome: 'unavailable'}` for every purchase today. Mapping it to
`fail` was the easy choice and would have fired EVT_051 on **every tap**, permanently poisoning
§11.3's free→paid rate with failures that only meant "payments are unbuilt" — reading as a **broken**
checkout rather than an **unbuilt** one. **A metric that is wrong in a plausible direction is worse
than one that is absent, because nobody goes looking for it.**

## ✅ The privacy inventory caught the new collection by itself

`data-inventory.test.ts` went red the moment the events became real: *"these EVT_* ids reach
`AnalyticsService.track()` but are not listed in §4."* **Adding analytics is a privacy change**, and
B6.3's conformance test enforced disclosure before CI would go green — the first occasion it could,
doing exactly the job it was built for. `DATA_INVENTORY.md` now lists all four with their props and
records that **no price, store SKU, receipt or vendor error text** reaches analytics.

**And B8.1's guard fired a second time in one day** (after B8.2's), re-pointed rather than deleted —
it now fails if the emission is *removed* while the document claims an instrumented funnel.

## ⚠️ Item 19 stays ⚠️

**EVT_051 — the metric §11.3 computes free→paid from — cannot fire until payments ship**; EVT_049
fires today, and the top of a funnel is not its answer. The events are also **recordable, not
readable**: `analytics_event` is INSERT-only and ADR-025's rollup worker is unbuilt (item 21's blocker
too).

**Verified:** mobile jest **450 (+21)** · vitest **219** · tsc **11/11 uncached** · eslint **0
errors** (16-warning baseline) · **four perturbations**, incl. the tempting `unavailable → fail`,
each failing exactly the intended tests with controls green.

---

# Part 3 — B8.2: a performance gate, at the layer CI can measure honestly

**Progress stays 63%.** `scripts/check-bundle-budget.mjs` runs in the Bundle gate as **one line** and
weighs each platform's Hermes bytecode — what a device downloads, parses and executes before the first
frame (**NFR-01**) — against a checked-in ceiling in `apps/mobile/performance-budget.json`.
**5.04 MiB against 6 MiB** (~19% headroom). `expo export` already ran there and its output was
**discarded**, so the marginal cost is a `stat`.

## ⚠️ A ceiling, not a ratchet — decided by measuring, not by preference

I proposed this as "same source → same bytecode". **That was wrong.** Two exports of the *same commit*
gave **5,279,878 vs 5,279,857** (android) and **5,286,013 vs 5,286,045** (ios). The bundle is not
byte-reproducible, so a zero-tolerance ratchet would fail at random, get switched off, and leave the
documentation claiming a release-blocking control that no longer runs — **worse than having none.** A
ceiling ignores ~32 bytes and still catches a heavy dependency.

## ⛔ Every "measured nothing" path exits 1

Missing export dir · a budgeted platform with no bundle · an empty platform dir · **two** bundles for
one platform (ambiguity fails rather than picking the biggest) · an unreadable budget file · **a
platform that built with no budget**, since an unbudgeted platform is an ungated one — the
`cd.yml`-omitting-`health` shape. A size gate that passes because it found nothing to weigh goes green
forever the first time a refactor moves the output path.

## ✅ B8.1's guard fired on its own, within hours

`go-no-go.test.ts` asserted no performance gate existed. Adding one **failed that test**, with a
message naming the two document sections to update. **The assertion was re-pointed, not deleted** —
the dangerous direction inverted, so it now fails if the gate is *removed* while GO_NO_GO still
describes it. First time this milestone a doc-rot guard caught the rot before a human did.

## ⚠️ Item 8 stays ⚠️, deliberately

PDD's per-screen **latency** budgets are still unmeasured. A threshold on a shared-vCPU emulator would
measure the runner — this suite has recorded **2m20s and 3m20s for the same commit**. The instruments
are TDD-named (**Sentry app-start**, a **client trace on EVT_012**) and need real device traffic, so
they moved from "unbuilt engineering" to the store-gated queue. **Calling item 8 closed because a
bundle gate exists would be the overstatement GO_NO_GO exists to avoid.**

**Two of my own errors, both caught by running things:** a missing comma left the budget JSON invalid
(the gate's own "cannot read budget file" path would have failed CI correctly), and I wrote "~13%
headroom" by **mixing decimal MB with binary MiB** — Expo prints 5.29 MB for the same 5.04 MiB bundle.
Actual headroom is 19%; the file now states its units. Also corrected: the eslint baseline is **16**
warnings, not the 14 recorded in Part 2 — turbo had cached the `@panchangpal/ai` task and only
mobile's output showed.

**Verified:** vitest **218 (+12)** · tsc **11/11 uncached** · eslint **0 errors** (16-warning
baseline) · **11 perturbations**, controls green at both ends.

---

# Part 2 — B8 started: the §10.1 checklist is walked

**⛔ The answer is NO-GO. 3 of 22 `[MANDATORY]` items are met**, 10 partial, 7 unmet, 2
business-owned. **Progress stays 63%** — B8's other deliverables (internal smoke, beta cohort) are
owner-gated on store accounts.

**Shipped:** `docs/devops/GO_NO_GO.md` — every item walked with its verdict, evidence and owner, each
derived from the repository rather than from another document · `apps/backend/tests/release/go-no-go.test.ts`
(30 assertions), which parses §10.1 **out of the TDD** and checks coverage **both ways**, then pins
the rot-prone claims **in the dangerous direction**.

**This is the expected answer and stating it is the deliverable.** §10.4 always said "ready for
launch, *conditional on* the §10.1 checklist". Of the 19 items not fully met, **7 are content/AI
readiness, 6 are owner purchases, 2 are business decisions, 4 are engineering.**

⚠️ **"Partial" is the dangerous column** — *"traditions/festivals/rituals seeded"* reads as ticked
because the four traditions are seeded, while the seed's one festival is named `sample-festival` with
the significance text *"Placeholder significance (reviewer content to follow)."*

## Two findings

1. ⛔ **There is no performance gate**, though §10.1 calls it release-blocking and PDD sets numeric
   budgets (Today cached render < 500 ms · checklist ack < 100 ms · ritual "Begin"→first step
   < 400 ms). Nothing in the eight workflows measures any of them. Accessibility has a gate because
   it was expressible as a unit assertion; performance never was. **Deliberately not bolted on** — a
   CI-emulator threshold says little about a mid-range phone, and that is the very reason it has
   never been written.
2. ⛔ **The fully-built paywall emits no analytics.** `EVT_049` is in PDD §11 and is never fired, so
   **the MRD's NZ pricing question is unanswerable with the data the app produces** — discoverable
   only after launch. Unlike NFR-10 (no sync event exists at all), emitting it invents nothing.

## ⛔ And a perturbation caught a defect in my own document

GO_NO_GO §9 and §10 both told the reader the verbatim appendix was "the machine-checked surface",
while the test's first version checked coverage against the **whole file** — so deleting an appendix
item still passed, because the table above quotes the same words and the assertion matched there.
**The appendix was decorative while two sections claimed it was load-bearing**: a documented control
nothing implements, one layer inside the document written to catalogue exactly that. Fixed by scoping
to the appendix plus a heading guard, which takes all 22 coverage assertions down when tripped —
proving they are not vacuous. **Third time this milestone a guard looked convincing and measured
nothing.**

**Verified:** vitest **206 (+30)** · tsc **11/11 uncached** · eslint **0 errors** (16-warning baseline) ·
**seven perturbations**, each failing exactly the intended assertion, controls green at both ends.

---

# Part 1 — Completed

**B7 — Release Management is CLOSED. 50% → 63%**, the fifth of eight Beta slices and the first
completed since B4 on 2026-08-02. Main: `9667600`. **No open PRs.**

| PR | Commit | What |
|---|---|---|
| #114 | `76e9764` | **B7.2** — version trains; tag ↔ `app.config.ts` ↔ `CHANGELOG.md` enforced |
| #115 | `fd1aa83` | **B7.3** — the Edge Function rollback, performed |
| #116 | `9667600` | **B7.4** — the staged OTA rollout, performed through its whole lifecycle |

All four increments were **performed** against real infrastructure, not configured — §8.4's standard.
`RELEASE_RUNBOOK.md` §0 now counts **eight** rollback paths: **three exercised**, one blocked, **three
with no mechanism at all**, PITR absent.

## The session's finding is about the tracking system, not the code

**B7.2, B7.3 and B7.4 had each completed without the Increment Checkpoint running**, so all six status
files read "B7 is 1 of 4" while the work sat merged on main. **Nothing looked wrong from inside the
documentation, because each file had been written from the previous one.** `git log` is the
instrument; a status file is not evidence about the repository.

**The same shape one level down: B7.4 was recorded as store-gated in every document, and only half of
it was.** §2.4's staged rollout is about **OTA**, which `eas channel:rollout` does today; only the
phased rollout of a *binary* needs a store account. **A blocker recorded once propagates through
every document that cites it** — as the merged SLO denominator did across five files.

## What each increment found

- **B7.2** — a version mismatch would have **corrupted the crash-free SLOs**. Sentry derives the
  release from the **native app version**, and NFR-06/NFR-07 are read per release, so a build tagged
  `v0.2.0` from a config saying `0.1.0` files its crashes in the old bucket and **looks healthy**.
- **B7.3** — `promote-production` fails by design and ran on **every** dispatch, so a **successful
  rollback produced a red run**. A control built against a false green was manufacturing a false red
  **on the recovery path**, where a misread costs most.
- **B7.4** — performed 10% → 50% → revert on staging. `rollout_outcome` defaults to `revert`, pinned
  by a test: the dangerous default is the one that keeps a bad update live. ⚠️ `--runtime-version` is
  required and unmarked in `--help` — the **fourth** eas-cli assumption this slice got wrong.

# Modified

`ota.yml` · `cd.yml` · `release-build.yml` · `CHANGELOG.md` (new) · `RELEASE_RUNBOOK.md` ·
`version-consistency.test.ts` (new) · `release-runbook.test.ts` · six tracking docs

# Verified

vitest **176** · tsc **11/11 uncached** · eslint **0 errors** (16-warning baseline) · five CI gates
green on #116 · four perturbations each failing exactly one assertion

# Blockers

1. ⛔ **Auto-rollback is NOT automated** — the action is proven, **nothing triggers it**. Needs a
   Sentry webhook + a GitHub credential (owner). Deliberately not stubbed.
2. ⚠️ **No release path is proven to reach a device** — no EAS build on any channel.
3. **~$25/mo paid Supabase** (NFR-15 PITR, launch blocker) · **Apple $99 + Play $25** (B1/B3/B7 store
   half).
4. ~~⚠️ **Pre-launch: no metric monitor may have an open issue** (two remain)~~ — ✅ **CLEARED
   2026-08-08.** Both crash-free monitors recreated, which is the only lever; `-4` and `-5` went with
   them. ✅ **Both are drill-proven and target an explicit Member** — each watched delivering its own
   email, and the Member field was drill 1's exact failure. **All three properties hold at once**
   (proven · correctly addressed · no open issue), the strongest alerting state this project has
   recorded. ⚠️ A later drill re-opens an issue, so re-check before launch; `SLO_ALERTS.md` §9 records
   how both properties are reached together.
5. **NFR-10** needs a PDD §11 taxonomy addition or a server metrics sink · **§7.2 dashboards** need
   ADR-025's unbuilt rollup worker.

# Recommended next task

⛔ **No credential-free BLOCKING engineering remains on the §10.1 checklist.** Every remaining item
needs money, content, legal review, or a business decision. That makes the order unusually clear:

1. **Owner — Apple ($99) + Google Play ($25).** The highest-leverage action in the project: unblocks
   §10.2 step 1 (internal smoke), converts B7's "proven in EAS, not on a device" caveats into real
   answers, and is what lets **EVT_051** fire at all.
2. **Owner — ~$25/mo paid Supabase** for PITR (NFR-15), the plain launch blocker.
3. **ADR-025's `analytics_event` rollup worker** — the one genuinely useful *unblocked* engineering
   task left, and the shared blocker behind items 11, 19 and 21. The app now records events that
   **nothing reads**.
4. **Declare `@supabase/supabase-js` in `apps/backend`** — ⚠️ note it has **no `package.json` at
   all**, so this is a slightly larger question than adding a line.
3. **Declare `@supabase/supabase-js` in `apps/backend`** — imported as a bare specifier, declared
   only in `apps/mobile`. ⚠️ Note `apps/backend` has **no `package.json` at all**, so this is a
   slightly larger question than adding a line. It resolves today, which is why it is worth fixing
   before a hoisting change removes it.
4. **Owner — and the store accounts now outrank everything else:** **Apple $99 + Google Play $25**
   unblocks §10.2 step 1 and converts every "proven in EAS, not on a device" caveat into a real
   answer · paid Supabase (PITR) · the Sentry→GitHub webhook for auto-rollback · NFR-10's path ·
   SHA-pin the nine Actions · **Node 24 with the SDK 55 upgrade**.
