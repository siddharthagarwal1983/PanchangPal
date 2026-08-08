# SESSION.md

# PanchangPal — Current Session

Version: 17.0.0
Last Updated: 2026-08-08 (**B8.2** — the first performance gate in the repo; B8.1's own guard fired
within hours and was re-pointed rather than deleted)

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
4. ⚠️ **Pre-launch: no metric monitor may have an open issue** (two remain, not clearable by hand).
5. **NFR-10** needs a PDD §11 taxonomy addition or a server metrics sink · **§7.2 dashboards** need
   ADR-025's unbuilt rollup worker.

# Recommended next task

1. **B8.3 — emit `EVT_049`** from the subscription surface (§10.1 item 19). Now the **last
   credential-free blocking item on the whole checklist**. The id is already in PDD §11's registry, so
   it invents nothing. ⚠️ **Honest limit:** emitting it makes the funnel *recordable*, not *readable*
   — `analytics_event` is INSERT-only and ADR-025's rollup worker is unbuilt (item 21), so the NZ
   pricing test needs both before it can answer anything.
3. **Declare `@supabase/supabase-js` in `apps/backend`** — imported as a bare specifier, declared
   only in `apps/mobile`. ⚠️ Note `apps/backend` has **no `package.json` at all**, so this is a
   slightly larger question than adding a line. It resolves today, which is why it is worth fixing
   before a hoisting change removes it.
4. **Owner — and the store accounts now outrank everything else:** **Apple $99 + Google Play $25**
   unblocks §10.2 step 1 and converts every "proven in EAS, not on a device" caveat into a real
   answer · paid Supabase (PITR) · the Sentry→GitHub webhook for auto-rollback · NFR-10's path ·
   SHA-pin the nine Actions · **Node 24 with the SDK 55 upgrade**.
