# CURRENT_MILESTONE.md

# PanchangPal — Current Milestone

Version: 4.19.0

Last Updated: 2026-08-08 (**B8.3** — the monetization funnel emits, and the privacy inventory caught
the new collection unprompted. Item 19 stays ⚠️: EVT_051 waits on payments)

Purpose:
This document defines the current milestone. Unlike SESSION.md (daily work) or TASK.md (current
task), it changes only when the project moves to a new milestone. Read it to understand the
broader implementation objective before beginning any work.

---

# Current Milestone

## Beta Readiness & Platform Hardening (TDD Part 5)

Status

🟡 In Progress

Overall Progress

63% (**5 of 8 slices COMPLETE — B2 ✅, B4 ✅, B5 ✅, B6 ✅, B7 ✅**, the last four at verifiable
scope; B1 ~85%, B3 ~80%; **B8 🚧 STARTED**)

**2026-08-08 (part 4) — B8.3: THE MONETIZATION FUNNEL EMITS.** Progress stays 63%. EVT_049/050/051/052
are wired across both upgrade surfaces, derived purely in `subscriptionEvents.ts` (the
`ritualEvents.ts` pattern — inline `track()` double-fires on re-render, and an inflated denominator is
worse than no rate). **EVT_051/052 come from the purchase seam, not the screens**, so a third surface
cannot join the funnel silently.

⛔ **THE ANCHORS HAD BEEN COMMENTS FOR MONTHS**, including an **empty `useEffect` whose entire body was
`/* analytics: EVT_049 */`** — a no-op effect existing only to hold a comment, which is this
milestone's signature defect in miniature. They were written while the Analytics Adapter was deferred;
**B4.2 shipped it and nothing went back.** A test now fails if either anchor returns.

⛔ **`unavailable` DELIBERATELY EMITS NOTHING.** `NullPaymentAdapter` returns it for every purchase
today. Mapping it to `fail` — the easy choice — would have fired EVT_051 on every tap and permanently
poisoned §11.3's free→paid rate with failures that only meant "payments are unbuilt", reading as a
**broken** checkout rather than an **unbuilt** one. **A metric wrong in a plausible direction is worse
than one that is absent, because nobody goes looking for it.**

✅ **THE PRIVACY INVENTORY CAUGHT THE NEW COLLECTION BY ITSELF.** `data-inventory.test.ts` went red the
moment the events became real — *"these EVT_* ids reach `AnalyticsService.track()` but are not listed
in §4"*. **Adding analytics is a privacy change**, and B6.3's conformance test enforced disclosure
before CI would go green, on the first occasion it could. `DATA_INVENTORY.md` now lists all four with
their props and records that **no price, store SKU, receipt or vendor error text** reaches analytics.

✅ **And B8.1's guard fired a second time in one day**, re-pointed rather than deleted — it now fails
if the emission is *removed* while the document claims a funnel.

⚠️ **Item 19 stays ⚠️**: EVT_051 — the metric §11.3 computes free→paid from — cannot fire until
payments ship, and the events are **recordable, not readable** while ADR-025's rollup worker is
unbuilt (item 21's blocker as well).

**Verified:** mobile jest **450 (+21)** · vitest **219** · tsc **11/11** · eslint **0 errors** ·
**four perturbations**, controls green.

---

**2026-08-08 (part 3) — B8.2: THE FIRST PERFORMANCE GATE THIS REPOSITORY HAS EVER HAD.** Progress
stays 63%. `scripts/check-bundle-budget.mjs` runs in the Bundle gate as one line and weighs each
platform's Hermes bytecode — what a device downloads, parses and executes before the first frame
(**NFR-01**) — against a checked-in ceiling. Currently **5.04 MiB against 6 MiB** (~19% headroom).
`expo export` already ran there and its output was discarded, so the marginal cost is a `stat`.

⚠️ **THE BUNDLE IS NOT BYTE-REPRODUCIBLE, AND THE DESIGN TURNED ON MEASURING THAT RATHER THAN
ASSUMING IT.** Two exports of the **same commit** produced **5,279,878 vs 5,279,857** (android) and
**5,286,013 vs 5,286,045** (ios). So: **a ceiling, never a ratchet.** A zero-tolerance ratchet would
fail at random, be switched off, and leave the docs claiming a release-blocking control that no longer
runs — worse than having none. (The proposal that won approval said "same source → same bytecode".
That was wrong, and running it twice is what showed it.)

⛔ **EVERY PATH WHERE IT MEASURES NOTHING EXITS 1** — missing export dir · a budgeted platform with no
bundle · an empty platform dir · **two** bundles for one platform · an unreadable budget file · **a
platform that built with no budget**, since an unbudgeted platform is an ungated one (the
`cd.yml`-omitting-`health` shape). A size gate that passes because it found nothing to weigh would go
green forever the first time a refactor moved the output path.

✅ **AND B8.1's GUARD FIRED ON ITS OWN, WITHIN HOURS.** `go-no-go.test.ts` asserted that no
performance gate existed; building one **failed that test**, with a message naming the two document
sections to update. **The assertion was re-pointed, not deleted** — the dangerous direction inverted,
so it now fails if the gate is *removed* while GO_NO_GO still describes it. First time in this
milestone a doc-rot guard caught the rot before a human did.

⚠️ **ITEM 8 STAYS ⚠️, DELIBERATELY.** PDD's per-screen **latency** budgets still have nothing
measuring them, and asserting them on a shared-vCPU emulator would measure the runner — this suite has
recorded **2m20s and 3m20s for the same commit**. Their instruments are TDD-named (Sentry app-start,
a client trace on EVT_012) and need real device traffic. **Calling item 8 closed because a bundle gate
exists would be exactly the overstatement GO_NO_GO was written to avoid.**

**Verified:** vitest **218 (+12)** · tsc **11/11 uncached** · eslint **0 errors** (16-warning
baseline) · **11 perturbations**, controls green at both ends.

---

**2026-08-08 (part 2) — B8 IS STARTED AND THE ANSWER IS ⛔ NO-GO.** `docs/devops/GO_NO_GO.md` walks
all 22 of §10.1's `[MANDATORY]` items: **3 met · 10 partial · 7 not met · 2 business-owned**. Pinned
by `go-no-go.test.ts` (30 assertions), which parses the checklist **out of the TDD** and compares
**both directions** — an item dropped fails, an item invented fails — the same two-way pattern as
`data-inventory.test.ts`. **Progress stays 63%**: B8's other two deliverables need store accounts.

**This is the expected answer, and saying so is the deliverable.** §10.4 already called the milestone
"ready for launch, *conditional on* the §10.1 checklist", and five slices closed at **verifiable
scope** with named residuals. B8 exists to read those residuals **together, once** — because the
failure this milestone keeps finding is a control that is documented, visible and inert, and that is
invisible from inside any single document. **Almost none of the gap is unfinished engineering:** of
the 19 items not fully met, 7 are content/AI readiness, 6 are owner purchases, 2 are business
decisions, and **4 are engineering**.

⚠️ **"PARTIAL" IS THE COLUMN THAT MATTERS, BECAUSE A PARTLY-MET ITEM LOOKS TICKED FROM A DISTANCE.**
The clearest case is *"traditions/festivals/rituals seeded for launch traditions"*: traditions **are**
seeded — four of them — so a quick read passes the item, while the seed carries exactly one ritual and
one festival named `sample-festival`, whose significance text is *"Placeholder significance (reviewer
content to follow)."* The seed's own header says reviewer content is loaded by `SVC_content_ingest`
and not raw-seeded.

⛔ **FINDING 1 — THERE IS NO PERFORMANCE GATE, AND §10.1 CALLS IT RELEASE-BLOCKING.** PDD specifies
numeric per-screen budgets (Today cached render < 500 ms · checklist toggle ack < 100 ms · ritual
"Begin"→first step < 400 ms · completion ack < 100 ms) and **no performance, bundle-size or budget
check exists in any of the eight workflows**. The asymmetry is worth naming: accessibility became
real because it was expressible as a unit assertion, and performance never was. **Deliberately not
bolted on inside a checklist walk** — a threshold measured on a CI emulator says little about a
mid-range phone, and that is exactly the argument that keeps such a gate from being written at all.

⛔ **FINDING 2 — THE PAYWALL IS FULLY BUILT AND EMITS NOTHING.** SCR_SUBSCRIPTION_001, CMP_PLAN_CARD,
the contextual sheet, `visibleOfferings` and the `FF_FAMILY_PLAN` gate are implemented and tested, and
**not one emits an event**; PDD §11 defines `EVT_049` for that surface and nothing fires it. So **the
NZ pricing question the MRD wants answered is unanswerable with the data the app produces**, and that
would have surfaced only after launch, when someone went looking for the funnel. ⚠️ Unlike NFR-10 —
which has **no** sync event in the registry and is therefore genuinely blocked on a PDD decision —
`EVT_049` already exists, so emitting it invents nothing.

⛔ **AND THE PERTURBATION CAUGHT A DEFECT IN MY OWN DOCUMENT, OF THE EXACT CLASS IT CATALOGUES.**
GO_NO_GO §9 and §10 both told the reader the verbatim appendix was "the machine-checked surface", and
the test's first version checked coverage against the **whole file** — so deleting an appendix item
still passed, because the human-readable table above quotes the same words and the assertion matched
there instead. **The appendix was decorative while two sections claimed it was load-bearing.** Fixed
by scoping the check to the appendix, plus a guard that fails if its heading is renamed — which takes
all 22 coverage assertions down with it, proving they are not vacuous. Found by running a
perturbation, not by review; **the third time this milestone that a guard looked convincing and
measured nothing.**

**Verified:** vitest **206 (+30)** · tsc **11/11 uncached** · eslint **0 errors** (16-warning baseline) ·
**seven perturbations**, each failing exactly the intended assertion, controls green at both ends.

**Prior position — B7's close:**

**2026-08-08 — B7 CLOSED, and three increments had shipped without a checkpoint.** B7.2 (`76e9764`,
#114), B7.3 (`fd1aa83`, #115) and B7.4 (`9667600`, #116) complete Release Management. Every increment
was **performed** against real infrastructure rather than configured — the standard B4 set and §8.4
states. `RELEASE_RUNBOOK.md` §0 now opens on the count: of **eight** rollback paths, **three
exercised** (OTA rollback, Edge Function redeploy, staged OTA rollout), **one blocked**, **three with
no mechanism at all**, **PITR absent**.

⚠️ **NONE OF THE THREE IS PROVEN TO REACH A DEVICE.** No EAS build exists for any channel, so each
proves its mechanism runs correctly in EAS or Supabase — not that a user's phone changed behaviour.
That is written into §0 rather than left to be inferred, because it is exactly the kind of gap a
go/no-go conversation should not have to discover for itself.

⛔ **AND "AUTO-ROLLBACK ON A CRASH SPIKE" (§2.4) IS NOT AUTOMATED.** The revert action is proven and
**nothing triggers it** — that needs a Sentry alert webhook plus a credential to call GitHub, an
owner action. A `repository_dispatch` receiver was deliberately **not** added: a trigger with no
sender is the placeholder shape B1 spent its time removing, and the same reasoning that left the
`job` table worker unbuilt. Today a crash spike pages a human (proven in B4.4) and the human
dispatches the revert. **A test holds that disclosure in the runbook in those words**, because
"auto-rollback" in a TDD and a manually dispatched revert are different claims, and the distance
between them is what this milestone keeps finding.

⛔ **THE TRACKING DOCUMENTS HAD BEEN THREE INCREMENTS STALE, AND EVERY ONE OF THEM AGREED WITH THE
OTHERS.** B7.2, B7.3 and B7.4 each completed without the Increment & Milestone Completion Checkpoint
running, so all six status files still said "B7 is 1 of 4" while the work sat merged on main. Nothing
looked wrong from inside the documentation, because each file had been written from the previous one.
**`git log` is the instrument; a status file is not evidence about the repository.**

⛔ **AND B7.4's RECORDED BLOCKER WAS HALF FALSE.** Every document had B7.4 as owner-gated on Play and
Apple accounts. §2.4's requirement — *"OTA rollouts are staged and monitored (Sentry crash-free),
auto-rollback on a crash spike"* — is about **OTA**, and `eas channel:rollout` does exactly what §3.2
describes. The store-side phased rollout of a *binary* is genuinely blocked; **the OTA side never
was**, and had been deferred on an assumption nobody had tested. **A blocker recorded once propagates
through every document that cites it** — the same shape as the SLO count, where five files repeated
one merged denominator, and it is the second time in this milestone that re-reading a stated blocker
against the tool was worth more than the engineering behind it.

**Prior position — 4 of 8 slices, 50%:**

**2026-08-07 — no slice moved, and both open branches merged.** The Actions outage cleared, so
**#107** (RNTL 13 → 14) got a real verdict and merged as `21e8c13`: all five CI gates **executed**
(none `SKIPPED` via `needs:`), giving tsc ×11 · eslint 0 errors · **vitest 144 +2 skipped · ui 33/33
· mobile 424/424, identical to baseline** · `expo export` both platforms · **E2E 6/6 on device**.
Test infrastructure only — it advances no slice.

**B2's gate got three fixes, none of which change its scope.** The **double-`clearState` race** that
hung the suite is fixed at its cause (#110 `afce763`): the trailing clears that collided with the next
flow's opening clear are gone, under a new invariant — **a flow establishes its own preconditions and
never cleans up for its successor** — pinned by a 19-assertion test with four perturbations. And the
**device log, which had been ~85% missing on every run** (`adb logcat -d` held only the last ~20 s of
a ~2m20s suite), is now streamed: **12,508 lines covering the full run** (#111 `693c62f`). ⚠️ That
second fix's FIRST version shipped **green and did nothing** — the ring-buffer theory was disproved by
`adb logcat -g` showing the buffer was never full. **A green run says nothing about whether a change
did what it claimed.**

**And the timeout guard's first version was broken.** `#108` merged as `610bf12`,
but `fb1a2fe` — the version written on 2026-08-06 — **failed every E2E run, including one reporting
"6/6 Flows Passed in 2m 23s"**, because `reactivecircus/android-emulator-runner` runs its `script:`
block **one `sh -c` per line**, making the multi-line `if`/`fi` a syntax error (exit 2).
⛔ **And because the action aborts at the failing line, `adb logcat -d` never ran** — the failed run's
artifact holds the six `commands.json` and **no `maestro-logcat.txt`**. A gate change intended to
make failures legible was instead deleting the evidence, which is the sharper half of the finding.
It also established that the **pre-existing** exit-status plumbing had never worked. Fixed
structurally in `scripts/run-maestro-flows.sh` (one line, one shell, one program) and **verified with
a control** that reproduces the original syntax error, plus **6/6 in 2m 20s on device with logcat
present at 927 KB**.

**B4 — Observability closed 2026-08-02**, the first slice completed since B6 on 2026-07-27. B4.4
delivered two of §7.2's seven SLOs **proven end to end** rather than configured: NFR-06 crash-free
sessions and NFR-14 availability, each watched to open an issue and deliver mail to a human. §8.4's
standard is that an alert nobody has seen fire is a plan, not a capability.

✅ **A third SLO, NFR-07 crash-free users, was proven the same day — and is deliberately NOT one of
§7.2's seven.** It comes from the Part 1 §8 NFR table; SLO_ALERTS.md tracks it because it runs on the
session data NFR-06 already produces and **binds tighter** (99.8% against a structurally lower
metric), making it the page that arrives first. So "two of the seven" and "three SLOs proven" are both
true — keep the denominators apart.

⛔ **Its drill produced the day's sharpest operational finding: an OPEN ISSUE SUPPRESSES THE NEXT
ALERT.** The drill crossed both NFR-06's and NFR-07's thresholds and only NFR-07 emailed, because
NFR-06's earlier drill issue was still open and Sentry folds new occurrences into the existing open
period. An issue left open means **the next real incident of that kind pages nobody** — the inverse of
alert fatigue, since nothing looks wrong. And a **metric-monitor issue cannot be resolved or deleted
by hand**; it closes only on a healthy reading, so the only lever is recreating the monitor. Harmless
pre-launch, a trap if the first real traffic is unhealthy. It is on the pre-launch checklist.

⚠️ **NFR-06 needed two drills, and the failure is the finding.** The first detected perfectly — right
threshold, right `production` filter, high-priority issue opened and assigned — and reached **nobody**,
because both alert rows resolved recipients from suspect commits that a metric-monitor issue does not
have. Everything visible said "configured". **This would have shipped as done.** It is the
milestone's signature defect one layer further out: not a control that was never implemented, but one
implemented, visible, and inert.

**Closed at verifiable scope**, the same basis as B5 (no PITR) and B6 (no ratified ADR-034). The five
unproven SLOs are blocked on what engineering does not own: three behind the Ask Guru gate, one
behind uninstalled `expo-notifications`, and **NFR-10 behind a PDD taxonomy decision** — PDD §11's
registry has no sync event, and inventing one is forbidden by `events.ts` and rejected at runtime.
None is unfinished code.

**Two gaps stated rather than absorbed:** `SVC_health`'s 503 branch is unit-proven but never
exercised end to end (it belongs with the DB-outage runbook drill), and §7.2's dashboards remain
absent because ADR-025's `analytics_event` rollup worker is unbuilt.

**B6 closed on 2026-07-27 with B6.3**, and closing it found a launch blocker. The data-collection
inventory, the privacy policy draft and the store Data Safety / App Privacy answers now exist in
`docs/devops/`, each derived from the one before it, and §2/§4 of the inventory are **pinned to the
schema and to the emitted `EVT_*` set by a conformance test** — an unclassified new table is
undisclosed collection, and a classified table the schema no longer has is a disclosure for data the
product does not hold. Both directions fail. Four perturbations proved it.

✅ **AND THE FINDING IS NOW CLOSED (same day).** The account-deletion executor exists: an atomic
per-user erasure in SQL, a sweep that isolates each user in its own subtransaction, a pg_cron
schedule, the operator-triggered `POST /account/sweep` action §6.5 names, and
`account_deletion_sweep_is_scheduled()` so the state is assertable rather than assumed. Proven
against a real Postgres 17 by **17 pgTAP assertions** checking the rows are gone table by table,
**five SQL perturbations**, **two TypeScript perturbations** on the sweep authorization, and a DR
invariant that fails with the executor dropped.

Building it surfaced **six foreign keys** a naive `delete from auth.users` gets wrong — four that
RESTRICT, and two using ON DELETE SET NULL that keep the row and drop only the link, leaving a
deleted user's display name in a household and their email in a support ticket. It also caught a
defect in the *test*: asserting `where user_id = ...` passes against exactly that leak, because
that is the column being nulled. The assertions key on content instead.

**Residual, and stated:** pg_cron must be enabled on the hosted project (an owner dashboard
action — done 2026-07-27), and `executed_at` cannot be written because the audit row cascades with
its own subject — a collision with **Part 5** §5.1's deletion-audit claim, **now opened as ADR-034
(Proposed, 2026-07-28)** and blocked on owner ratification rather than on engineering.

**The original finding, for the record:**

⛔ **The CCPA deletion right was recorded and never carried out.**
`POST /account/delete` gates correctly (F-3) and writes `account_deletion` with a 30-day
`execute_after`. Nothing reads that row back — no Edge Function queries the table, no runner
processes `job`, `pg_cron` is **commented out**, and `executed_at` is never set. TDD Part 5 §6.2
specifies deletion that "hard-deletes owned rows"; that code does not exist. Like B5's missing PITR
this is recorded as a launch blocker rather than counted as done — but unlike PITR it is ordinary
engineering, not a purchase.

**It is the fourth instance of this milestone's signature defect** — a documented control, never
implemented, with nothing asserting it — and the most consequential, because the row it writes makes
the system *look* like it is honouring the request. A privacy policy promising deletion and a store
answer of "users can request deletion" would each be a false statement backed by a paper trail.

**The same absence explains every retention gap**: no analytics rollup or prune, no removal of
personal-date tombstones, no `panchang_cache` TTL. There is no scheduled execution in this project
at all. One fix, not five.

**Offline sync was implemented on 2026-07-26 and does NOT move this number.** TDD Part 4 §6 is a
Mobile MVP deliverable that B6's review found unbuilt, not one of the eight Beta slices. It closes
a launch blocker — the queue was in memory beneath a header claiming persistence, was never
drained, and **nothing bound API_POST_SYNC at all**, so SVC_sync had been unreachable from the app
since the Backend Foundation milestone — while advancing no slice. Counting it would inflate the
percentage with work that belongs to a milestone already reported at 100%.

**It is the third time "feature-complete" has meant "written and unit-tested."** The Execution Gap
found twelve defects behind a green pipeline; issue #30 found an ADR nobody had implemented; §6 was
documented in the header of the very file that did not implement it. The pattern is now specific
enough to act on: a claim written in a comment is not a claim anyone has tested.

**B6 — Security & Privacy is three-quarters through, and it found the two most serious defects of
the milestone.** B6.1 OWASP Mobile Top 10 review ✅ · B6.2 CCPA export + the SVC_account
authorization fix ✅ · B6.4 §5.2 supply-chain controls ✅ · **B6.3** (data-collection inventory,
draft privacy policy, store labels) remains.

Both defects share the shape this milestone keeps finding: **a documented control that was never
implemented, with nothing asserting it.** The auth session claimed `persistSession: true` and got
memory; SVC_account was documented as service-role-with-JWT-validation and validated only that a
token was present. Neither was reachable by any existing test, and both were found by reading the
claim against the implementation rather than by running the suite.

**B4 is three-quarters through, and now owner-gated (2026-07-25).** It is sliced into four increments so the number above
is auditable: **B4.1 telemetry seam ✅** (TelemetryAdapter port + the two error call sites) ·
**B4.2 EVT_* analytics sink ✅** (AnalyticsService port → `analytics_event`, ADR-013) · B4.3
**B4.3 server seam + release gate ✅** · B4.4 SLO dashboards + alerts. Counting the three gives
(1 + ¾)/8 ≈ 22%.

**B4 cannot progress further on engineering alone.** The source-map upload and the §7.2
dashboards/alerts both need a Sentry org + DSN to be *verifiable* rather than merely configured —
free tier, so an owner action rather than a cost. B4.3 delivered what could be made real without it:
the Edge Function telemetry seam at `errorResponse()`, `SENTRY_*` required at preflight's production
tier (proven by running it), and a release-build gate that BLOCKS a production build with Sentry
unconfigured. The upload itself was deliberately not written: Hermes maps must come from inside the
EAS build that produced the bundle, so maps from a separate `expo export` would symbolicate
confidently wrong — the gate says so instead of pretending.

**What is now measurable, and what is not.** B4.2 gives EVT_054 a working destination, so error
*rates* land in `analytics_event` today — that half of §7.1 is real. Crash *reporting* is not: the
concrete Sentry adapter stays deferred (`@sentry/react-native` uninstalled, no DSN), so
`NullTelemetryAdapter` drops the diagnostic copy, crash-free sessions (NFR-06, §7.2) cannot be
measured, and B4 cannot close. `getTelemetryBackend()` reports `'none'` so that status is
inspectable rather than assumed.

**Privacy decisions this forced, recorded in DECISIONS.md rather than left implicit:**
`user_pseudo_id` is a device-minted random UUID never derived from an identity (a reinstall mints a
new one; the household-grain North Star is unaffected); props are primitives only, since an object
or array is how an error or a server response would carry user content into the store; and an event
id outside the PDD §11 taxonomy is rejected, because `event_id` is only a text column.

**B2 (E2E verification) is now COMPLETE (2026-07-25).** The bundle gate plus all three in-scope
Maestro flows — FLOW_RETURNING, FLOW_MORNING_RITUAL, FLOW_SESSION_PERSISTENCE — are GREEN in CI on a
real native Android build (run 30155737941). Getting there took fixing the E2E build (which was
failing disguised as a timeout — PR #35) and then fixing a real bug the working gate caught: mmkv v2
is incompatible with the New Architecture, so ritual sessions silently ran on memory and never
survived a restart (fixed by MMKV v2→v4, PR #36). The three flows still absent — onboarding,
household invite, live Ask Guru — are blocked on other slices / backends / a gated feature, not on
B2's engineering, so B2 is done at its verifiable scope.

A slice counts only when done. B1 and B3 remain most of the way there, with every remaining item
gated on money, a store account, or a later slice — not on engineering.

Previous Milestones

✅ Documentation Complete
✅ Repository & Platform Foundation
✅ Backend Foundation (SVC_* Edge Functions)
✅ Mobile MVP — Phase 1 (M1–M8, feature-complete 2026-07-18)

Next Milestone

Phased Production Release (US / AU / NZ)

---

# Milestone Objective

Take the feature-complete Mobile MVP to a shippable beta. **No new product scope.** This milestone
is environments, verification, observability, security, and release mechanics — everything in the
TDD Part 5 §10.1 pre-launch go/no-go checklist that engineering owns.

The organizing risk was that **CD reported green while much of it verified nothing** — six
placeholder jobs, of which the milestone had recorded two.

**That risk is now closed (2026-07-19).** Every gate in CI, CD, and E2E does real work and can
fail: four placeholders were removed, two manual deploy jobs were made to fail loudly, and a
bundle gate plus real E2E flows were added. The app itself — which had never been executed
anywhere when this milestone opened — now runs on hardware, in an emulator, and in CI.

---

# Corrected Premise (2026-07-18, during B1)

The milestone was opened stating that `scripts/preflight.sh` "only warns on unset secrets and exits
0 — it cannot fail a deploy". **That was false.** `require_var` calls `fail()`, and the script exits
1; `cd.yml` invokes it without `|| true` in all four jobs. Verified by running it with the secrets
unset: exit code 1, four required items reported missing, "Stopping deployment."

The single `|| true` is in `ci.yml`'s db-tests job and is explicitly commented as advisory, which
reads as deliberate.

So B1's headline deliverable was already satisfied before B1 began. The real fail-open gaps were
different, and are fixed in `feat/b1-bundle-gate`:

- **`SUPABASE_PROD_REF` did not exist.** Staging requires a project ref for
  `supabase functions deploy --project-ref`; production required only a DB URL, so a promotion could
  pass preflight with no way to deploy Edge Functions at all. Now required, and registered.
- **Production treated billing secrets as warnings.** `REVENUECAT_WEBHOOK_SECRET` is now required at
  the production tier — absent, a live release ships with webhook signatures unverifiable.
- **No `dev` target existed.** preflight accepted `staging|production|ci|local` while §1.1 mandates
  three isolated environments. `dev` added (`SUPABASE_DEV_DB_URL`, `SUPABASE_DEV_REF`,
  `SUPABASE_ACCESS_TOKEN`), distinct from `local`, which is the fully-local `supabase start` stack.

Two further placeholders were found that the milestone had not recorded: the **AI eval subset** gate
was an `echo`, and the **API / zod contract** gate ran `--passWithNoTests` against a package with no
test files. Both were declared release-blocking and validated nothing.

**Both were de-declared on 2026-07-18** rather than left green. A gate that cannot fail is worse than
an absent one — it reads as coverage, which is precisely the mechanism that let six defects reach M8.
Removing them makes CI's true coverage legible. What is now owed, tracked in the workflow itself:

- ~~**API contract tests**~~ — **DELIVERED 2026-07-25.** `packages/api/src/contracts/openapi-conformance.test.ts`
  compares the zod contracts against `docs/api/openapi.yaml` (ADR-032): eight shared enums against
  the components that mirror them, ErrorEnvelope's required set, and API_GET_TODAY's required query
  parameters and response properties — equality in both directions, since a field the spec requires
  and the client omits is a 4xx, and one the client sends undocumented is a hidden dependency.
  **Proven to fail** by three perturbations (dropped param, invented ERR_*, renamed response
  property). No workflow change was needed: the root vitest config already includes
  `packages/**/*.test.ts`, so it runs in `unit-component-a11y`.
- **AI eval harness** — refusal + golden-set subset (TDD Part 3 §9.4), re-added as a job that can
  fail once the harness exists. AI regressions must block merge (ADR-029).

Standing rule recorded in `ci.yml`: **a gate is added when it can fail**, never as a placeholder.

## Where each slice actually stands (2026-07-19)

### B1 — Environments & secrets · ~85%
Done: preflight fails closed on all three targets (proven by running it with secrets unset);
`dev` target added; `SUPABASE_PROD_REF` and `REVENUECAT_WEBHOOK_SECRET` made required for prod;
CI bundle gate; two hollow CI gates removed. **dev Supabase project provisioned**
(`msbfcirvtzrsbhqduflr`), migrated to 32 tables, seeded, anonymous sign-in verified. Staging
likewise, and its DB password was rotated after an exposure.
Remaining: **the prod project needs a paid plan** — the free tier allows two projects per org and
both are used. `promote-production` cannot be exercised end-to-end until B7/B8 implement it.

### B2 — E2E verification · ~75%
Done: Maestro 2.6.1; `tests/flows/FLOW_RETURNING.yaml` (23 steps) and
`tests/flows/FLOW_MORNING_RITUAL.yaml` (14 steps), both green locally on arm64 and in CI on
x86_64; `e2e.yml` builds the APK in CI and runs the flows on an emulator — **2/2 passed in 46s on
its first run**.
**The gate then went dark for three days (found 2026-07-22).** `expo-updates` (PR #24, `bbb7ac4`,
2026-07-19 15:48 UTC) brought Kotlin/KSP compilation into the Android graph and the build outgrew
`timeout-minutes: 45`. Six subsequent runs were cancelled by `cancel-in-progress` when pushes
raced; the first uncontended run, on 2026-07-22, was killed by the timeout still building. **A
cancelled run is not a red run** — nothing was reported broken, so the tracking docs kept citing
the 2026-07-19 result. PR #32 fixes all of it: no cancel-on-push for a 20-40 minute job, a
90-minute budget, a Gradle cache, and building one ABI rather than four (the emulator is x86_64;
three quarters of the native build was compiled and discarded every run).

**Update (2026-07-25):** PR #35 fixed a further layer — the single-ABI `assembleRelease` was itself
failing at ~11 min and Gradle then hung to the 90-min timeout, so it still reported `cancelled`.
Wrapping the Build APK step in `timeout` + `--stacktrace` and trimming release-only work made it fail
fast and go green. `FLOW_SESSION_PERSISTENCE` then executed for the first time, caught a real bug
(mmkv v2 vs New Arch), and — after the v2→v4 fix (PR #36) — now **PASSES** on a native build.

**Update (2026-07-26):** `FLOW_ONBOARDING` is no longer among the blocked flows — PR #50 made the
onboarding gate a persisted flag, the flow was written, and it passes in CI. **Four flows now run,
not three.** Still NOT achievable within B2: `FLOW_HOUSEHOLD_INVITE` needs the unimplemented
`SVC_household`; the subscription path can only assert "unavailable" while `react-native-purchases`
is deferred; `FLOW_ASK_GURU` can only exercise the gated path.

### B3 — Build & distribution · ~80%
Done: `eas.json` with three profiles and an explicit environment each; store identifiers
(`com.panchangpal.app`, changeable until first submission); Hermes pinned; **three Android APKs
built**; `release-build.yml` produces one unattended from a `v*` tag or dispatch; a credential
probe that reports an unauthorized token in seconds rather than after a dependency install.
Remaining: iOS needs an Apple Developer membership ($99/yr); the Play Internal track needs a
Google Play account ($25); Sentry source-map upload depends on B4.

---

## Placeholder audit (2026-07-18, completed during B3)

The milestone opened recording **two** placeholders. A full sweep of all three workflows found
**six**. All are now resolved one way or the other:

| Placeholder | Where | Resolution |
|---|---|---|
| `api-contract` | ci.yml | de-declared (B1) → **restored 2026-07-25** as real conformance tests, proven to fail |
| `ai-eval-subset` | ci.yml | de-declared (B1) |
| `e2e-staging` | cd.yml | de-declared (B3) — B2 restores it |
| `eas-build` | cd.yml | de-declared (B3) — pending credentials |
| `promote-production` | cd.yml | **fails loudly** — manual dispatch previously reported a completed promotion |
| `publish-ota` | ota.yml | **fails loudly** — previously reported a shipped OTA |

Automatic gates were **removed** (a fake gate reads as coverage). Manual deploy jobs were **kept and
made to fail**, because a missing job hides a capability while a silently-succeeding one actively
misleads an operator into believing production was promoted. That asymmetry is the rule going
forward.

What remains genuinely real in CD: staging migrations and Edge Function deploys.

## B2 depends on B3 (discovered 2026-07-18)

B2 cannot be done before B3. Maestro drives a **built app binary**, and none can be produced: no
`eas.json` existed, there are no native projects (managed workflow), and no Android SDK, Java, or
Xcode is available locally. The B1–B8 ordering was written from documentation rather than from the
dependency graph.

Two of B2's five flows are also blocked on missing backends rather than on tooling:
`FLOW_HOUSEHOLD_INVITE` needs **SVC_household**, which is an unimplemented Edge Function, and the
subscription path can only assert the "unavailable" state while `react-native-purchases` is
deferred. `FLOW_ASK_GURU` can only exercise the gated path (`GURU_LIVE=false`). Realistic B2 scope
is therefore **three** flows: `FLOW_ONBOARDING`, `FLOW_RETURNING`, `FLOW_MORNING_RITUAL`.

**Lesson for the remaining slices:** the B1–B8 scoping was written from documentation rather than
from the code. Verify each slice's premise against the repository before implementing it.

---

# Starting position (verified 2026-07-18)

| Capability | Actual state |
|---|---|
| Staging Supabase project | ✅ Real — `migrate.sh` hard-fails on an empty URL and applied migrations in 1m22s |
| Edge Functions → staging | ✅ Real — `supabase functions deploy` against `SUPABASE_STAGING_REF` |
| CI gates (§2.2) | ✅ Real — lint/typecheck, unit+a11y, secret scan, RLS suite, zod contracts, AI eval subset |
| **App bundles at all** | ✅ Fixed 2026-07-18; a CI bundle gate now proves it on every PR |
| **App runs on a device** | ✅ iPhone (Expo Go), Android emulator, and three native APKs |
| **Local backend bring-up** | ✅ Fixed — `supabase start` + migrate + seed documented and working |
| Maestro E2E (FLOW_*) | ✅ **Two real flows, green in CI** (e2e.yml) — FLOW_RETURNING, FLOW_MORNING_RITUAL |
| EAS build / distribution | ✅ Automated: `v*` tag or dispatch produces a signed APK unattended (release-build.yml) |
| Production promotion / OTA | 🔴 **Now fail loudly** — both previously reported success while deploying nothing |
| Preflight secret checks | ✅ **Already fail-closed** (exits 1) — the earlier "warns then exit 0" claim was wrong; see Corrected Premise below |
| **AI eval subset gate** | 🚫 **De-declared** 2026-07-18 — was an `echo`. Restore when the Part 3 §9.4 harness lands |
| **API / zod contract gate** | 🚫 **De-declared** 2026-07-18 — was `--passWithNoTests` against a package with no tests. Owed: real contract tests under `packages/api` |
| **CI bundle gate** | ✅ Added 2026-07-18 (B1) — `expo export` ios+android, 55s; proven to fail on a reintroduced defect |
| dev / prod environments | 🟡 **dev provisioned, migrated, seeded, anon-auth verified**; prod needs a paid plan (free tier 2/2) |
| Sentry / dashboards / alerts | ❌ Not wired |
| DR restore drill | ❌ Not performed |
| OWASP Mobile review | ❌ Not performed |

---

# The Execution Gap (discovered 2026-07-18)

The milestone opened on the premise that CD's green status overstates what is verified because two
jobs are placeholders. Attempting a developer demo of the finished MVP found that the gap is
**wider than placeholder jobs**: no verification in this project — CI or local — has ever executed
the application. `lint`, `typecheck`, and `jest` all pass without invoking Metro, and the E2E job
that would have is the `echo` stub.

Six defects had accumulated undetected across M1–M8. All were found in a single session, in the
order they blocked progress:

| # | Defect | Impact before fix | Commit |
|---|---|---|---|
| 1 | `metro.config.js` set `disableHierarchicalLookup = true`, which breaks pnpm's nested layout | **No platform could bundle** — expo-router's own deps unresolvable | `00aa7f8` |
| 2 | `@babel/runtime` undeclared, though Babel injects it into every transpiled file | Bundle failure | `c822cbf` |
| 3 | Workspace `.js` NodeNext specifiers unresolvable by Metro (tsc/jest remap them; Metro does not) | Bundle failure | `00aa7f8` |
| 4 | `supabase/config.toml` seeds on init while migrations sit outside the CLI path | **`supabase start` always rolled back** | `fc10528` |
| 5 | No `[auth]` section, so `enable_anonymous_sign_ins` defaulted false | Anonymous-first app unusable locally (UX-2 / ADR-009) | `fc10528` |
| 6 | Three repositories reused a fixed Realtime channel topic | **SCR_YOU_001 crashed on render**; Household would have too | `3d1bb7d` |

Defect 6 is the significant one: a genuine product bug in `src/data/`, invisible to every existing
test, and reachable only by running the app against a live backend. Defects 1–5 are build and
environment faults that gated the ability to find it.

Six more were found on 2026-07-19, once the app could actually be run and a backend actually
held data. Every one of them needed *execution* — none would have been caught by typecheck, lint,
unit tests, or the bundle gate:

| # | Defect | How it presented | Commit |
|---|---|---|---|
| 7 | Tab bar mapped `state.routes` directly, ignoring `href: null` | all twelve routes in the tab bar, raw names as labels | `74a0586` |
| 8 | Tab focus compared array positions, not route keys | nothing highlighted inside any nested stack | `74a0586` |
| 9 | Calendar spread `isToday` into a prop named `today` | today never marked — **and it typechecked**, since the prop is optional and spread supplies extras | `74a0586` |
| 10 | `new MMKV()` as a default parameter, throwing synchronously | ritual screen crashed via the ErrorBoundary; a `.catch()` could not see it | `0769dc2` |
| 11 | Bare `on conflict do nothing` with no supporting constraint | seven duplicate checklist rows per seeded item; "Light the lamp" five times | `252c381` |
| 12 | `babel-preset-expo` undeclared | `./gradlew assembleRelease` could not bundle; `expo run:android` broken for everyone | `c52c7c8` |

**#9 is the instructive one.** `today?: boolean` is optional and object spread freely supplies
extra properties, so `isToday` was accepted as excess and `today` as absent — simultaneously. It
typechecked perfectly while doing nothing.

**#12 hid behind a passing gate.** `expo export` resolves the preset through Expo's own dependency
tree, so the bundle gate stayed green; Gradle invokes the React Native CLI, which resolves from the
project directory, where pnpm had not linked it. Same source, two build paths, one broken.

**A recurring shape, four times now:** an eager side effect in a default parameter —
`getSupabase()` across nine repositories, `new MMKV()` in the session store — plus two undeclared
transitive dependencies (`@babel/runtime`, `babel-preset-expo`) that pnpm's strict layout will not
resolve. Both classes fail far from where they are written. A lint rule for the first and a
dependency-declaration check for the second would pay for themselves.

A separate consequence surfaced while diagnosing: nine repositories in `src/data/` default-construct
with `getSupabase()` as a default parameter, so absent configuration throws during **module
evaluation** of a route. expo-router then sees no default export and renders "Page could not be
found" instead of a calm error state. `authRepository.ts:30` already carries a lazy `??=` fix and a
comment describing this exact hazard — diagnosed once, never generalized. Not yet fixed; tracked
below.

**Implication for the milestone:** B1 and B2 were scoped to make CD honest. They must also make CI
*execute the app*, or this class of defect keeps accumulating. A bundle gate is the cheapest
possible fix and would have caught defects 1–3 at M1.

---

# Scope — the eight slices

| # | Slice | Covers | Status |
|---|---|---|---|
| B1 | Environments & secrets | dev/staging/prod projects, per-env secrets, fail-closed preflight (§1, §4) | 🟡 ~85% — prod blocked on a paid plan |
| B2 | E2E verification | bundle gate (done in B1) + Maestro FLOW_*; green in CI (§2.2, §10.1) | ✅ COMPLETE — bundle gate + **6 flows GREEN** on a native build (RETURNING · MORNING_RITUAL · SESSION_PERSISTENCE · AUTH_SESSION_PERSISTENCE · ONBOARDING · **OFFLINE_SYNC**), 6/6 on run 30261926062 (2026-07-27). The count was recorded as 4 until 2026-07-26: FLOW_AUTH_SESSION_PERSISTENCE arrived with B6 and was never added to the tally, and `e2e.yml`'s echo is now DERIVED from the flows directory, so it cannot drift again. Gate hardened at its cause: the launcher-ANR false-red is gone with the move to the AOSP image (PR #55). Remaining 2 flows blocked on other slices/backends/gated feature |
| B3 | Build & distribution | eas.json profiles, Hermes, signing, source maps, TestFlight / Play Internal (§2.3) | 🟡 ~80% — automated builds work; store accounts + Sentry (B4) remain |
| B4 | Observability | Sentry, telemetry, SLO dashboards + alerts (§7) | 🟡 ~75% — B4.1 seam ✅ · B4.2 sink ✅ · B4.3 server seam + prod release gate ✅ · EVT_* daily-habit funnel emitting (§11.4, incl. the North Star input EVT_017). **The concrete Sentry implementation (PR #79) is verified and ready**: both blockers closed 2026-08-01/02 — the startup-init defect is fixed and guarded by a behavioural test, and the E2E red was never Sentry (it was the preference-durability defect, fixed in #86). **The DSN is now provisioned and VERIFIED on device (2026-08-02)** — org `panchang`, projects `panchangpal-mobile` + `panchangpal-edge`; `[telemetry] reporter=sentry` appears once per launch in the E2E artifact (12/12, where it read `none` before), with the native SDK installing NDK/ANR/uncaught-exception and — the one that matters — `AppLifecycleIntegration`, which is what crash-free sessions is computed from. **Crash-free sessions is therefore MEASURABLE for the first time.** **B4.4 is still the open increment and B4 does not close**: the §7.2 SLO dashboards and alerts do not exist, and §8.4's rule stands that alerting never triggered is a plan, not a capability. Also unverified: ingest into Sentry itself (needs the dashboard), the Edge Function path (needs a real server error), and the source-map upload (`e2e.yml` sets `SENTRY_DISABLE_AUTO_UPLOAD=true` deliberately; only `release-build.yml` exercises it) |
| B5 | Reliability & DR | backups, restore drill, runbooks, graceful degradation (§8) | ✅ COMPLETE at verifiable scope — runbooks (§8.3) · mechanised restore drill · §8.2 degradation policy · §8.4 operator resilience. **One deliverable is NOT engineering-closable: NFR-15 needs PITR, which is a purchase.** Recorded as a launch blocker rather than counted as done. |
| B6 | Security & privacy | OWASP Mobile review, CCPA export/delete verification, store privacy labels (§5, §6) | ✅ COMPLETE at verifiable scope — OWASP review ✅ (2 critical defects found + fixed, each proven by reintroducing it) · CCPA export + SVC_account authz ✅ · **B6.3 data inventory + privacy policy draft + store labels ✅**, the inventory pinned to the schema and the emitted `EVT_*` set by a conformance test proven to fail four ways · §5.2 SBOM/Dependabot/pinning ✅. **Two deliverables are NOT engineering-closed and are recorded rather than counted: (a) ⛔ deletion is never EXECUTED** — the request is written to `account_deletion` and nothing carries it out, which is ordinary engineering and a launch blocker; **(b)** nothing is legally reviewed, and no policy or label is publishable until (a) is fixed. Export remains at verifiable scope: unit-tested and proven-to-fail, never run against a live backend |
| B7 | Release management | versioning/trains, OTA policy + channels, staged rollout, rollback verification (§3) | ✅ **COMPLETE at verifiable scope (2026-08-08)** — all four increments **PERFORMED**, not configured. **B7.1** (`3cee165`) OTA publish + rollback on staging (`31166287897`, `31166824122`). **B7.2** (`76e9764`) version trains: `CHANGELOG.md` created and `release-build.yml` now fails **before building** when a `v*` tag disagrees with `app.config.ts` or the changelog lacks its entry — ⚠️ because Sentry derives the release from the **native app version**, a mismatch files a new build's crashes under the OLD release and NFR-06/NFR-07 are read per release, so **a mislabelled build looks healthy**. **B7.3** (`fd1aa83`) Edge Function rollback performed (`31169545892` → `31169842290`) — ⛔ and it found that `promote-production` ran on every dispatch and fails by design, so **a successful rollback produced a RED run**: a control built against a false green was manufacturing a false red on the recovery path. **B7.4** (`9667600`) the staged OTA rollout performed through its whole lifecycle (`31170893305` → `31171165323` → `31171256503` → `31171329608`), `rollout_outcome` defaulting to `revert` because the dangerous default is the one that keeps a bad update live. ⚠️ **NOT proven: delivery to a device** — no EAS build exists for any channel. ⛔ **Auto-rollback is NOT automated** — the action is proven, nothing triggers it (owner: a Sentry webhook + a GitHub credential). **Blocked, not skipped:** the store-side phased rollout of a binary (Play/Apple accounts) and the flag-disable drill (`FF_FAMILY_PLAN` gates only the Family offering, and `react-native-purchases` is uninstalled, so filtering an empty list proves nothing either way) |
| B8 | Go/no-go & launch | §10.1 checklist execution, internal → beta cohort, sign-off | 🚧 **STARTED 2026-08-08** — the §10.1 checklist is **walked**: `docs/devops/GO_NO_GO.md` records **⛔ NO-GO, 3 of 22 items met** (10 partial · 7 unmet · 2 business-owned), pinned by `apps/backend/tests/release/go-no-go.test.ts` (30 assertions), which parses §10.1 **out of the TDD** and checks coverage **both ways**. ⚠️ *Partial* is the dangerous column — *"traditions/festivals/rituals seeded"* reads as ticked because traditions are, while the festival is named `sample-festival` with placeholder significance text. **Two findings:** ⛔ **no performance gate exists** in any of the eight workflows though §10.1 calls it release-blocking and PDD sets numeric budgets; ⛔ **the fully-built paywall emits no analytics** (`EVT_049` is defined in PDD §11 and never fired), so the MRD's NZ pricing test has no signal. Remaining: internal smoke on TestFlight / Play Internal · beta cohort — both **owner-gated** on Apple + Play accounts |

One slice per session, same cadence as M1–M8: implemented, self-verified, reviewed, then the next.

---

# Milestone Deliverables

- [ ] **B1** — dev + prod Supabase projects provisioned alongside staging (owner-performed);
      per-environment secrets placed per §4.1; RevenueCat sandbox wired for dev/staging.
      - [x] CI **bundle gate** (`expo export`, ios+android) — pulled forward from B2; verified to
            fail on a reintroduced resolver defect, not merely to pass on green.
      - [x] preflight `dev` target added; `SUPABASE_PROD_REF` required; `REVENUECAT_WEBHOOK_SECRET`
            required at the production tier.
      - [x] ~~make preflight fail-closed~~ — **already was**; premise corrected above.
- [ ] **B2** — a **bundle gate** (`expo export` for ios+android) added to CI so a change that cannot
      build fails the PR — this alone would have caught three of the six defects above at M1;
      Maestro installed in CD; `FLOW_*` specs authored for the daily loop, ritual, Ask Guru,
      household invite, and subscription paths; the placeholder step deleted; green on staging.
- [ ] **B3** — `eas.json` with dev/staging/prod profiles; Hermes on; EAS Build + Submit wired;
      Sentry source maps uploaded per build; a real build distributed to TestFlight / Play Internal.
- [ ] **B4** — Sentry (crash-free tracking) + the §7.1 telemetry set; SLO dashboards and alerts live.
- [ ] **B5** — backup policy confirmed; a real DR restore drill executed and documented (§8.1/§8.3).
      - [x] **Runbooks** for all five §8.3 scenarios, with literal repo commands and named owner.
      - [x] **Restore drill mechanised** (`dr-drill.yml`): build-from-repo → `pg_dump` →
            `pg_restore --exit-on-error` → the same invariants file re-run on the restored database →
            seeded row-count equality. Monthly, plus on any PR touching migrations or seed. First
            run: restore 1s, invariants OK both sides.
      - [ ] **Backup policy cannot be confirmed** — there is no PITR to confirm (see the risk below).
      - [x] **§8.2 graceful degradation encoded and tested** — a policy per ERR_* (surface, retry,
            queueing, daily-loop impact, copy key, §12 row), exhaustive over the shared taxonomy,
            with the invariants asserted: no failure blocks the daily loop, honest declines offer no
            retry, offline/sync queue, location redirects, only uncaught failures go global.
      - [x] **§8.4 single-founder mitigations recorded**, separating the ones that exist (managed
            platforms, documentation, agent-friendly repo) from the ones that do not (unattended
            alerting; a plan to contract help), with the unattended failure modes and what a
            handover would need.
- [ ] **B6** — OWASP Mobile review completed; CCPA export/delete verified end-to-end (F-3/F-10);
      privacy policy + store privacy labels accurate.
      - [x] **B6.1 OWASP Mobile Top 10 review** against the app as built, with file:line evidence.
            Two launch-blocking defects found and each proven by reintroducing it.
      - [x] **B6.2 CCPA export** to the §6.4 row set behind a versioned envelope, plus the
            SVC_account authorization fix (identity from the JWT, never the body).
      - [x] **B6.3 data-collection inventory → privacy policy draft → store privacy labels**, all
            three in `docs/devops/`, derived from the code and pinned by a conformance test.
      - [x] **B6.4 §5.2 supply-chain controls** — SBOM, Dependabot, `eas-cli` pinning.
      - [x] **Deletion executor built and proven** (2026-07-27) — atomic SQL erasure, sweep,
            pg_cron schedule, secret-authorized operator trigger, 17 pgTAP assertions, five SQL
            and two TypeScript perturbations.
      - [ ] **Enable pg_cron on the hosted projects** (owner, dashboard) — until then deletions
            execute only via the manual trigger.
      - [ ] **The deletion audit — opened as ADR-034 (Proposed, 2026-07-28), awaiting ratification.**
            `executed_at` is unwritable under the declared cascade, contradicting Part 5 §5.1's
            repudiation mitigation. The ADR settles the engineering half (request and audit are
            separate records; audit is service-role-only; `executed_at` retired) and refers the
            privacy half — what identifies the subject of a completed erasure — to Security/Privacy
            with Legal sign-off. Not closable by engineering alone.
      - [ ] Legal review of the policy draft and the store answers (owner-held).
- [ ] **B7** — version trains, OTA channels (`staging`/`prod`) with runtime-version binding and
      crash-spike auto-rollback; rollback paths verified (§3.4).
      - [x] **B7.1 OTA publish + rollback** (`3cee165`) — `ota.yml`'s publish was an `echo`
            reporting success while shipping nothing, then a deliberate `exit 1`; it now runs
            `eas update` with a rollback counterpart and a typed production confirmation.
            **Both halves PERFORMED on staging**, not configured. Runtime-version binding was
            already mechanical via `runtimeVersion: fingerprint` — and the publish job now counts
            builds that actually match it, because the same mechanism lets a green publish reach
            nobody.
      - [x] **§3.4 rollback runbook** — `docs/devops/RELEASE_RUNBOOK.md`, pinned by
            `apps/backend/tests/release/release-runbook.test.ts` (5 assertions, 5 perturbations).
            Updated through B7.2–B7.4: it now records that of **eight** rollback paths, **three have
            been exercised** (OTA rollback, Edge Function redeploy, staged OTA rollout), one is
            blocked, **three have no mechanism at all**, and PITR does not exist — plus the fact that
            **none of the three is proven to reach a device**.
      - [x] **B7.2** — version trains + changelog/tag discipline (§3.1), `76e9764` (#114).
            `CHANGELOG.md` created per §3.0A.4 with the bump rules restated where they are used;
            `release-build.yml` fails **before building** on a tag/config/changelog disagreement.
            ⚠️ The stake is the crash-free SLOs, not tidiness: Sentry derives the release from the
            **native app version**, so a mislabelled build files its crashes under the previous
            release and reads as healthy. Split by what can violate each half — config↔changelog in
            the unit suite (checkable per PR), tag↔config in the workflow (only a tag push can
            violate it, and it must fail rather than produce a mislabelled artifact).
      - [x] **B7.3** — the Edge Function rollback **performed**, `fd1aa83` (#115). Runs
            `31169545892` (seven functions redeployed from an older commit) and `31169842290` (all
            eight restored from `main`). ⚠️ It proves a prior version can be redeployed on demand,
            **not** a behavioural diff — the two commits had no observable difference, so "the older
            code is serving" rests on the deploy log naming the older SHA, and the runbook says so.
            ⛔ **The drill's real finding: a manual CD dispatch could never report green**, because
            `promote-production` fails by design and ran on every `workflow_dispatch`. Fixed with an
            explicit `promote` input, default `false`.
      - [x] **B7.3 — the flag-disable path is BLOCKED, not "never performed"**, and the distinction
            is the point. `FF_FAMILY_PLAN` gates exactly one thing — the Family **offering**, via
            `visibleOfferings` — and `react-native-purchases` is uninstalled, so `NullPaymentAdapter`
            returns no offerings and filtering an empty list yields an empty list either way. It
            would stay unobservable **even with the SDK installed**, because `getOfferings()` returns
            what a *store* defines and no Apple or Play account exists. Revisit with the store
            accounts — the same increment that installs the payments SDK, which must also move E2E
            back to a `google_apis` image and reintroduces the Pixel Launcher ANR risk PRs #41 and
            #55 spent effort eliminating.
      - [x] **B7.4** — staged OTA rollout (§3.2), `9667600` (#116), **performed through its whole
            lifecycle** on staging: publish candidate `31170893305` → 10% `31171165323` → 50%
            `31171256503` → revert `31171329608`, leaving staging where it started. `publish` gained
            an optional `--branch`, because a rollout splits traffic between **two** branches and
            publishing with `--channel` targets the one the channel already points at, which splits
            nothing. `rollout_outcome` defaults to **`revert`**, pinned by a test.
            ⚠️ **The monitoring between stages is the point, not the percentages** — advancing on a
            timer is a slow deploy. And since an open Sentry issue suppresses the next alert, "no new
            alert" is not evidence of health if one is already open.
            ⚠️ **`--runtime-version` is required to create a rollout**, unmarked as mandatory in
            `--help` and found only by a failing run; it is **derived** from the candidate branch,
            because a 40-character fingerprint is not something to copy by hand mid-incident.
      - [ ] ⛔ **Auto-rollback is NOT automated** (§2.4) — the revert action is proven and **nothing
            triggers it**. Needs a Sentry alert webhook plus a credential to call GitHub, an owner
            action. A `repository_dispatch` receiver is deliberately not added: a trigger with no
            sender is the placeholder shape B1 removed. Today a crash spike pages a human and the
            human dispatches.
      - [ ] **The STORE-side phased rollout stays blocked** — phased percentages live in the Play
            Console / App Store Connect and neither account exists. (The OTA half was never blocked;
            recording the two as one is the error this increment corrected.)
      - [ ] **Delivery to a device is unproven** — no EAS build exists for any channel, so the
            reachability check correctly reports 0. The mechanisms are proven; delivery is not.
- [ ] **B8** — the §10.1 checklist walked; internal smoke on TestFlight/Play Internal; beta cohort.
      - [x] **B8.1 — the §10.1 checklist WALKED** (2026-08-08). `docs/devops/GO_NO_GO.md`:
            **⛔ NO-GO, 3 of 22 met** (10 partial · 7 unmet · 2 business-owned), every verdict derived
            from the repository rather than from another document. Pinned by
            `apps/backend/tests/release/go-no-go.test.ts`, which parses §10.1 out of the TDD and
            checks coverage both ways, then pins the claims that will rot **in the dangerous
            direction** — it fails when a performance gate appears, when `EVT_049` starts being
            emitted, when `GURU_LIVE` flips, or when `react-native-purchases` is installed, because a
            document that keeps saying "blocked" after the blocker clears makes the gap invisible.
      - [x] **B8.2 — a performance gate, at the layer CI can measure honestly** (2026-08-08).
            `scripts/check-bundle-budget.mjs` in the Bundle gate: Hermes bytecode against a
            checked-in ceiling (`apps/mobile/performance-budget.json`), 5.04 MiB / 6 MiB today.
            **A ceiling rather than a ratchet, because the bundle is not byte-reproducible** — two
            exports of the same commit differ by ~32 bytes, and a ratchet would fail at random, get
            disabled, and leave the docs claiming a control that no longer runs. Every
            measured-nothing path exits 1. Pinned by `bundle-budget.test.ts`, which runs the real
            script and reads its **exit code**, because the gate is the exit code and this repo has
            twice been burned by tests that proved the wrong layer.
      - [ ] ⛔ **The per-screen LATENCY budgets remain unmeasured**, and this is the half §10.1 most
            plainly means. A threshold on a shared-vCPU emulator would measure the runner (2m20s vs
            3m20s observed on one commit). Instruments are TDD-named — **Sentry app-start** (NFR-01)
            and a **client trace on EVT_012** (NFR-02) — and both need real device traffic, so this
            belongs with the capabilities blocked on §10.2 step 1, not with unfinished engineering.
      - [x] **B8.3 — the monetization funnel emits** (2026-08-08). EVT_049/050/051/052 across both
            upgrade surfaces, derived purely in `subscriptionEvents.ts`; EVT_051/052 from the
            purchase seam so a third surface cannot join silently. The anchors had been comments for
            months, including an **empty `useEffect` holding only `/* analytics: EVT_049 */`**.
            ⛔ **`unavailable` emits nothing on purpose** — mapping it to `fail` would have fired
            EVT_051 on every tap and poisoned §11.3's free→paid rate with failures that only meant
            payments were unbuilt. ✅ **`data-inventory.test.ts` caught the new collection unprompted**
            and forced disclosure before CI would pass — adding analytics is a privacy change.
      - [ ] ⛔ **EVT_051 still cannot fire, and it is the metric that matters.** §11.3 computes
            free→paid from it; `react-native-purchases` is uninstalled, so every purchase resolves
            `unavailable`. Unblocked by the store accounts, not by engineering.
      - [ ] ⛔ **And nothing reads the rows.** `analytics_event` is INSERT-only for clients and
            ADR-025's rollup worker is unbuilt — the same blocker as item 21. The events are
            recordable, not readable.
      - [ ] **Internal smoke on TestFlight / Play Internal** (§10.2 step 1) — **owner-gated**: Apple
            ($99) + Google Play ($25). The single highest-leverage purchase in the project: it also
            converts every "proven in EAS, not on a device" caveat into a real answer.
      - [ ] **Beta cohort / canary** (§10.2 step 2) — needs step 1 and §7.2's dashboards. ✅ The two
            open metric-monitor issues that also stood here are **cleared (2026-08-08)** by recreating
            both monitors; ⚠️ re-check before launch, since a drill re-opens one.
      **Residuals that decide the eventual verdict, none of them unfinished code:** PITR absent
      (NFR-15) · no release path proven to reach a device · auto-rollback not automated.
      ~~**two metric monitors with open issues**~~ — ✅ **closed 2026-08-08**; recreation cleared both,
      confirming that is the only lever. ✅ Both are also **drill-proven** (each watched delivering its
      own email) and target an explicit **Member**, so all three properties hold at once: proven ·
      correctly addressed · no open issue. ⚠️ The *rule* survives the fix — a later drill re-opens an
      issue, so re-check before launch.

---

# Out of Scope (this milestone)

- Any new product feature or screen. The MVP is feature-complete; changes here are non-functional.
- Astronomical panchang calculations — still frozen behind PanchangEngine until **ADR-033** is
  ratified. A panchang-inclusive launch is gated on it; a beta without panchang is not.
- Live Ask Guru answers — `GURU_LIVE` stays off until reviewed corpus + eval readiness (Part 3 §10B).
- Post-v1 `FF_*` flags (Jain mode, greeting card, family plan, lifecycle email) — staged post-launch.
- Business go/no-go conditions (runway, temple partnership, NZ pricing test) — owner-held, not
  engineering deliverables.

---

# Success Criteria

A clean clone builds, migrates, and runs against a live environment. Every CD job does real work —
no placeholders. `FLOW_*` E2E green on staging. Alerting proven by a deliberate trigger, not just
configured. A DR restore actually performed. No unresolved OWASP findings. A real beta build in
testers' hands.

---

# Current Risks

- ~~**False-green CI/CD**~~ — **CLOSED 2026-07-19.** Was the top risk and proved worse than scoped:
  twelve defects accumulated behind a fully green pipeline, and the app had never been executed
  anywhere. Now every gate does real work — bundle gate per PR, E2E flows green in CI, four
  placeholders removed, two manual deploy jobs made to fail loudly. See the Execution Gap section
  for the full ledger.
- **Untriaged defects found while demoing (2026-07-18)** — one remains open:
  - ~~**Repositories throw on absent config.**~~ **Resolved** (PR #14). The lazy `??=` that existed
    only in `authRepository.ts` was generalized: all ten `src/data` repositories now resolve their
    client through `(this._db ??= getSupabase())`, so construction no longer requires configuration
    and a misconfigured build cannot fail during route module evaluation.
  - ~~**`react-native-mmkv` unavailable / broken.**~~ **RESOLVED (2026-07-25, PR #36).** Two layers:
    (1) it throws in Expo Go / on absent native modules — handled since PR #24 by the lazy
    `createDeviceStore` degrading to memory with a warning instead of crashing; (2) the deeper bug the
    now-working E2E gate exposed — **mmkv v2 is incompatible with the New Architecture (bridgeless)**,
    so MMKV's JSI never installed and it degraded to memory even on a native build, meaning ritual
    sessions never persisted. Fixed by the v2→v4 upgrade (Nitro line), verified by a green
    FLOW_SESSION_PERSISTENCE on a native emulator build (run 30155737941).
- ~~**SDK 54 native runtime unverified**~~ — **CLOSED 2026-07-19.** Three Android APKs built and
  run; the New Architecture works natively. iOS remains unbuilt (no Apple membership), so that
  half of the baseline is still unproven.
- ~~**No local Android toolchain**~~ — **CHANGED 2026-07-26.** The B2 scoping note ("no Android SDK,
  Java, or Xcode is available locally", which is why B2 was said to depend on B3) is now out of
  date for Android. The dev Mac has cmdline-tools, an AOSP arm64 API-34 system image, the AVD
  `ppal_aosp34`, and a working `expo prebuild` + Gradle build; the app has been installed and run
  on the emulator, with Metro serving the bundle. **This makes Maestro flows iterable locally
  instead of only in CI** — which matters directly for the owed `FLOW_OFFLINE_SYNC`, since a
  flow involving airplane mode and app-kill is painful to develop through 20-minute CI runs.
  Two practical notes for whoever picks it up: build with
  `-PreactNativeArchitectures=arm64-v8a` (the default builds four ABIs and discards three, the
  same waste PR #32 removed from CI), and a **debug APK contains no JS bundle** — it needs Metro
  plus `adb reverse tcp:8081 tcp:8081`, whereas `assembleRelease` embeds the bundle and runs
  standalone (it signs with the checked-in debug keystore, so it needs no credentials). iOS is
  unchanged: still no Apple membership, still unbuilt.
- ~~**Session persistence unverified.**~~ **VERIFIED 2026-07-25.** `FLOW_SESSION_PERSISTENCE`
  (PR #32) — complete the ritual, `stopApp`, relaunch, assert `Done for today`, with `adb logcat`
  captured so the two candidate causes are separable — finally executed once the E2E build was fixed
  (PR #35). It first failed, correctly: logcat showed the "Persistent storage unavailable" fallback,
  i.e. MMKV was degrading to memory (mmkv v2 vs New Arch). After the v2→v4 fix (PR #36), the flow
  PASSES with no fallback (run 30155737941). Sessions now survive a restart. The domain logic was
  never the suspect — `advanceSession` leaves `stepIndex` on the last step, so a completed session
  restores as completed; the store was the problem.
- ~~**⚠️ The E2E gate produced two FALSE REDS on 2026-07-25 (fixed, PR #41).**~~ **PR #41 was a
  symptom patch, and it stopped working. CLOSED PROPERLY 2026-07-26 (PR #55).** The
  `"Pixel Launcher isn't responding"` dialog kept covering the app while Maestro asserted;
  `hide_error_dialogs 1` bought three green runs and then the launcher ANR'd through it. Reading the
  uploaded artifacts across all four recent failures — logcat and hierarchies exist ONLY in the
  artifact, so grepping the run log finds nothing and reads as absence of evidence — gives the real
  rate: **3 of 4 failures were launcher ANRs (~21% of runs), every one with `hide_error_dialogs`
  already active.** The fourth was the genuine #50 gate breakage.
  **Fixed at the cause:** AVD `target: google_apis` → `default` (AOSP), which ships neither Pixel
  Launcher nor the Google app. Nothing under test needs Play Services (`expo-notifications` and
  `react-native-purchases` both uninstalled; no Maps, no Play Billing). Verified 4/4 in 1m23s (run
  30196467032) with **zero `Pixel Launcher` references anywhere in the artifacts**. The absence is
  structural — an uninstalled process cannot ANR — which is a stronger claim than "green once."
  **a false red costs what a false green costs**, and this one collected its bill: the first
  occurrence was dismissed as a flake, the second had to be diagnosed from scratch, and the third
  was written into a session handoff as a red main that had in fact gone green half an hour earlier.
  A gate failing a fifth of the time for reasons outside the code teaches everyone to shrug at red.
- **⚠️ The E2E gate reported nothing between 2026-07-19 and 2026-07-22.** See B2 above. The
  mechanism matters more than the outage: `cancel-in-progress: true` on a 20-40 minute job means a
  busy afternoon produces no signal at all, and a cancelled run reads as "not run" rather than
  "broken". Fixed in PR #32.
- ~~**Seven `src/data` repositories still throw on absent config.**~~ **Resolved** (PR #14). All ten
  use the lazy `(this._db ??= getSupabase())` getter; the default-parameter pattern is gone, and
  `repository-construction.test.ts` guards against its return.
- ~~**Postgres version drift.**~~ **Resolved** (PR #28). CI runs `pgvector/pgvector:pg17` with
  `postgresql-17-pgtap`, matching dev (17.6.1.147) and staging (17.6.1.141) — both confirmed engine
  17 against the Supabase Management API. The gate now tests what the environments actually run.
- **PDD owes approved copy for eleven ERR_* codes (found 2026-07-25, B5).** §13.5 approves calm
  copy for nine codes; the taxonomy has twenty-four. The rest now degrade with the approved generic
  ERR_UNKNOWN string, which is honest but less useful than the handling §12 specifies for them —
  `ERR_AUTH_EXPIRED`, `ERR_NOTIF_DENIED`, `ERR_SUBSCRIPTION_INVALID` and `ERR_SYNC_CONFLICT` in
  particular deserve their own. The list is pinned in `AWAITING_APPROVED_COPY` and by a test, so it
  cannot grow silently. Writing the strings in code would be inventing UX and would hide the gap.
- ~~**Onboarding is unreachable and therefore untested.**~~ **RESOLVED 2026-07-26.** `app/index.tsx`
  had hardcoded `ONBOARDED = true` beneath a comment claiming the flag was persisted elsewhere; it
  never was, so SCR_AUTH_001 had never rendered from a cold launch and B2 could not write
  FLOW_ONBOARDING. The flag now persists through the shared `KeyValueStore` seam, both exits from
  the gate mark it, and `FLOW_ONBOARDING` asserts the first launch, the skip, and — the half that
  matters — a relaunch that does not ask again. The remaining SCR_ONBOARDING_* slides are a separate
  product deliverable that has never been built; the gate no longer hides that fact.
- **Crash reporting is wired but silent (2026-07-25, B4.1/B4.2)** — the TelemetryAdapter port and
  both error call sites exist, and the diagnostic copy of every error is dropped:
  `@sentry/react-native` is not installed and no DSN is provisioned. Crash-free sessions (NFR-06,
  §7.2) cannot be measured, so a beta shipped in this state would fly blind on the one metric §10.1
  gates on. **Partially mitigated by B4.2:** every ERR_* is now recorded as EVT_054 in
  `analytics_event`, so error rates are visible even while stack-level reporting is not. Closing it
  needs a Sentry org + DSN (free tier suffices) and B4.3–B4.4. `getTelemetryBackend()` returns
  `'none'` while this holds, and a DSN configured with no adapter warns at startup.
- ~~**Analytics is unverified against a live database.**~~ **CLOSED 2026-07-25.** Five pgTAP
  assertions now gate `analytics_event`'s insert-only contract in CI, using the exact envelope
  `buildEnvelope()` emits, and the contract was additionally verified against the hosted **staging**
  project with its anon key: INSERT `201`, SELECT `200 []`, UPDATE `200 []`, DELETE `200 []`. Writing
  the tests surfaced a real subtlety — Supabase grants clients broad table privileges and lets RLS
  filter, so an unauthorised UPDATE/DELETE **modifies nothing rather than raising**; `throws_ok`
  would have failed and `lives_ok` would have passed while proving nothing. (The staging probe row
  is permanent — client DELETE is denied, which is the property under test — and is identifiable by
  a `user_pseudo_id` starting `probe-`.)
- ~~**⛔ The app is not offline-first in practice.**~~ **RESOLVED 2026-07-26.** `STORE_offlineQueue`
  held pending mutations in memory beneath a header claiming MMKV persistence, was never drained
  and never dequeued, and no client code bound API_POST_SYNC — SVC_sync was fully implemented and
  unreachable. Offline, a completion was lost the moment the OS reclaimed the process; online, the
  app worked only because every hook also called its API directly, leaving the queue to grow
  forever. Now: durable queue through the shared `KeyValueStore` seam, a single-flight drain with
  FIFO batching and jittered backoff, dequeue on server acknowledgement, and the §6.1 persisted
  read cache so a cold start offline is not empty. ~~**Residual risk:** never run against a live backend, and no `FLOW_OFFLINE_SYNC`.~~ **CLOSED
  2026-07-27.** `FLOW_OFFLINE_SYNC` is written and green against staging on a native build, proving
  the queue reaches disk, the §6.1 cache renders a cold start with no network, and the drain does
  not revert the completion.
  ⛔ **REOPENED AND RE-FIXED 2026-08-01: a completion made offline was not SHOWN after an app
  kill.** The flow caught it at ~50% and the recorded cause — "an asynchronous MMKV write loses to
  the kill" — was **wrong**. `keyValueStore.set` is MMKV's synchronous JSI call inside the tap
  handler; the queue reached disk every time. **Nothing re-derived it onto the rendered read
  model**: the tick after a cold start came only from the persisted query cache, written on a 1 s
  trailing throttle and flushed from an unsubscribe handler a process kill never runs, and offline
  `useChecklist.onError` reverted the optimistic tick even though the mutation was durably queued.
  **The rule this establishes: a durable queue guarantees DELIVERY, not DISPLAY.** Fixed on
  `fix/offline-completion-lost-on-kill` (pure projection + startup correction + a revert guard
  keyed on the queue rather than on a vendor's error text), with two perturbations each failing
  exactly the right test. **Device-verified: 5/5 green, 30/30 flows**, against main's 3 green / 3 red
  on the same suite — ~3% likely by chance if the race persisted. Getting it green found three E2E-harness defects and none in offline
  sync itself — a launch race where the stale TASK's destroy-timeout killed the newly started
  process, the flow breaking a neighbour because a cleared offline banner is not proof of a usable
  route, and both being visible only in the uploaded artifact rather than the run log.
- ~~**⛔ ACCOUNT DELETION IS NEVER EXECUTED**~~ — **CLOSED 2026-07-27 at engineering scope.** The
  executor (`execute_account_deletion`), the sweep (`sweep_due_account_deletions`), the pg_cron
  schedule, the secret-authorized `POST /account/sweep` trigger, and 17 pgTAP assertions all exist
  and were verified against a real Postgres 17. **Two residuals:**
  (a) **pg_cron must be enabled on the hosted projects** — a Supabase dashboard action a migration
  cannot perform. The migration schedules the sweep where the extension exists and raises a
  **warning** where it does not; `account_deletion_sweep_is_scheduled()` makes the state assertable
  (false if the extension is absent, the job is missing, *or* an operator disabled it), it is
  checked by the DR restore drill, and `ACCOUNT_SWEEP_SECRET` is required at preflight's production
  tier. Until it is enabled, deletions run only when an operator triggers the sweep by hand.
  (b) **`executed_at` cannot be written** — see the next entry.
- **✅ Sentry: both blockers closed (2026-08-01/02, PR #79) — the second was never Sentry.**
  Blocker (a), the startup-init defect, is fixed and guarded by a behavioural test proven to fail
  without it; `[telemetry] reporter=none` now appears once per launch on device where nothing
  resolved before. Blocker (b), the "deterministic" E2E red, was the **preference-durability
  defect** (#86): `useUpdatePreferences` had no durable path, so an app kill inside the request
  window reverted the tradition — which `FLOW_AUTH_SESSION_PERSISTENCE` reads back as proof of
  identity. **Four misattributions** before it was found. Main flaked identically with no Sentry
  code, including on `4fdaf10`, a commit touching only `dependabot.yml` and ADR markdown.
  **B4 still does not close**: without a DSN the adapter resolves to Null and reports nothing.
  The original entry follows, for the record.
- **⚠️ Sentry is built but NOT merged, and NOT measurable as built (2026-07-28, PR #79).**
  `@sentry/react-native` ~7.2.0 is wired behind both telemetry ports with PII scrubbing made
  structural and the Expo config plugin for source maps. It is held back for two reasons:
  **(a)** ✅ **CLOSED.** `getTelemetryAdapter()` was called only from inside the two error
  handlers, so `Sentry.init` ran only after the FIRST ERROR — a healthy session never started one
  and native crash capture never installed. Fixed by resolving the adapter in AppProviders' mount
  effect, guarded by a behavioural test proven to fail without it, and verified on device
  (`[telemetry] reporter=none` appears once per launch in the E2E artifact).
  **(b)** ✅ **CLOSED 2026-08-01 — and it was never Sentry.** The red was attributed to Sentry
  because three flows failed twice on an identical commit. **The main baseline refutes that**: main
  flakes the same way with no Sentry code at all — **3 green / 3 red across 2026-07-28**, every red
  the identical three-flow signature — and one of the reds is `4fdaf10` (#78), a commit that changed
  **only** `.github/dependabot.yml` and ADR markdown and so cannot have introduced a runtime race.
  The real defect is the offline-completion race (see its own entry), now fixed on
  `fix/offline-completion-lost-on-kill`. **#79 is ready to merge once that lands.**
  **B4.4 remains the open increment; B4 does not close**, still owner-gated on a Sentry org + DSN.
- **⚠️ Local native builds are broken — a JDK regression (found 2026-07-28).** Only **JDK 26** is
  installed on the dev Mac and Kotlin's version parser throws on `"26.0.1"`, so `./gradlew` fails
  resolving `com.facebook.react.settings` before compiling anything. The 2026-07-26 note that
  "Gradle auto-provisions JDK 17 regardless of `JAVA_HOME`" is **out of date** — the same class of
  toolchain drift as pnpm losing corepack under Node 26. Native verification goes through CI
  (dispatch `e2e.yml` on the branch) until a JDK 17 is installed, and that detour is what made this
  session's two Sentry defects expensive rather than immediate.
- **The deletion audit contradicts the schema — now opened as ADR-034 (Proposed, 2026-07-28).**
  The conflict is real and is **across two Parts**, which is plausibly why review of either alone
  never caught it: **Part 5 §5.1**'s `[MANDATORY]` threat model requires the audit row to outlive the
  erasure, and **Part 2 §3.15**'s schema erases it with its own subject. (Every prior record here,
  in `DATA_INVENTORY.md` and in the executor migration's own header cited this as "Part 2 §5.1" —
  which is *Identity, Onboarding & Profile*, API contracts with no threat model. Seven citations
  corrected.)
  **Neither document is wrong; the schema is under-specified for the role assigned it.**
  `account_deletion` is a correct *request* table and cannot also be the durable record of a
  completed erasure — one row with two lifetimes. ADR-034 separates them, makes the audit
  service-role-only, confines it to the *fact* of erasure, and **retires `executed_at`** (dead
  schema: its only reader is a predicate that is unconditionally true, because the column can never
  hold a value).
  **Still owed, and deliberately not decided:** what identifies the subject of a completed erasure —
  raw `user_id`, a one-way digest, or nothing. That is a privacy decision with legal weight, referred
  to Security/Privacy with Legal sign-off; the digest form is recommended, not chosen. **No schema
  change before ratification**, and a retention period agreed now would not be enforced anyway, since
  the deletion sweep remains the only scheduled job that runs.
- **The original entry, for the record (found 2026-07-27).** TDD Part 5 §5.1's threat model
  names `TBL_ACCOUNT_DELETION` as the **deletion audit** mitigating repudiation, which requires the
  row to survive the erasure. §3's schema declares `user_id ... on delete cascade`, which erases the
  request row along with its own subject — so after a successful deletion there is nothing left to
  stamp and `executed_at` is unreachable by construction. The executor implements the schema as
  declared rather than changing a foreign key, because the surviving row would name a uid and that
  is a privacy decision, not an implementation detail. **The TDD owes a resolution.** Consequence
  today: a completed deletion leaves no record that it happened.
- **⛔ SVC_notify_scheduler IS A SHELL (found 2026-07-27).** The Edge Function exists, is deployed,
  and returns `200` — and its repository methods do nothing. `loadDueCandidates()` issues the query,
  discards the result with `void data`, and returns `[]` **unconditionally**; `sendDue()` returns
  `0` without sending. `suppressIfCompleted()` is implemented in `logic.ts` and **never called from
  `index.ts`**. What IS real is the pure logic — `applyQuietHours` (with a correct midnight wrap)
  and `withinFrequencyCap`.
  **Why it is recorded here rather than fixed:** the send path needs `expo-notifications`, which is
  deferred, so completing it now would be writing an unrunnable path. But nothing said the sweep
  was hollow, and the shape is this milestone's signature defect — a function that returns success
  while doing nothing. It was found while evaluating whether to schedule it on pg_cron; **doing so
  would have made notification scheduling look live while provably sending nothing.** Do not
  schedule it until the repository methods are real.
- **The "SDK-upgrade increment" does not exist, and the three PRs are closed (2026-07-28, PR #78).**
  The set queued below as one deliberate upgrade was checked against the **installed peer graph**
  rather than release notes, and none of it belongs on SDK 54. The cause is single:
  `.github/dependabot.yml` already carried the right rule — *an SDK-pinned package is upgraded with
  the SDK via `expo install --fix`, never alone, because a lone bump produces a build that resolves
  and then fails natively* — and only its **patterns** were short. `expo-*` never matched a scoped
  `@expo/` name, and nothing covered `react`, `@types/react` or `@babel/runtime`.
  **#64** `@expo/metro-runtime` 6.1.2→57.0.7: the package's dist-tags map majors to **SDK majors**
  (`sdk-55`→55.x, `sdk-56`→56.x, `latest` 57.0.7→**SDK 57**), and `expo-router@6.0.24` peer-requires
  `^6.1.2`. **#65** `@babel/runtime` 7→8: `babel-preset-expo@54.0.12` peer-requires `^7.20.0`.
  **#75** (which superseded #61 after #74 landed) `react` 19.1.0→19.2.8: peer-**LEGAL** under RN's
  `^19.1.0` and therefore the most dangerous of the three, because react-native ships its own Fabric
  renderer built against React `"19.1.0"`, hardcoded in
  `Libraries/Renderer/implementations/ReactFabric-{dev,prod}.js`.
  **Two claims in the entry below are now known to be wrong.** (1) "All three are red because they
  cross the SDK pin": **#64 and #65 passed all five CI gates, including the bundle gate**, and #75 —
  the peer-legal one — was the only red. **Green is anti-correlated with safety for an SDK-pinned
  package**, because `expo export` resolves what fails natively; that is the third instance after
  mmkv v2 under the New Architecture and `babel-preset-expo`. (2) "`react-test-renderer` has to move
  with `react`": that is the assertion in
  `@testing-library/react-native`'s `build/helpers/ensure-peer-deps.js`, which compares
  `react-test-renderer` to `react` **exactly** — so satisfying it would have turned CI green while
  leaving the renderer at 19.1.0, silencing the one check that noticed. Every 19.2.x release note is
  React Server Components, so there was nothing to gain either way.
  **No native build or Maestro run was needed**; the peer graph was the cheaper experiment and was
  available from the start. A genuine Expo SDK upgrade remains future work, is not a milestone
  deliverable, and when it happens must still be validated by a native build plus the six flows.
- **The #61 group is split, and the queue is now coherent (2026-07-28, PR #74).** The seven
  non-SDK bumps landed on main on their own — `@typescript-eslint/eslint-plugin` and `parser`
  8.63.0→8.65.0, `prettier` 3.9.5→3.9.6, `turbo` 2.10.4→2.10.7, `@supabase/supabase-js`
  2.110.2→**2.110.9** (a further patch shipped after Dependabot opened #61, inside the declared
  `^2.110.8` range), and both `@tanstack/*` 5.101.2→5.101.4. All five CI gates green.
  `react`, `@types/react` and the lockfile's `react@19.1.0` peer keys were deliberately NOT touched.
  **What remains open is now three PRs that all cross the same pin** — #61's `react` remainder, #64
  (`@expo/metro-runtime` 6.1.2→57.0.7) and #65 (`@babel/runtime` 7→8) — plus #62 and #63, red for
  unrelated reasons. That set belongs in one deliberate SDK-upgrade increment behind a native build
  and the Maestro flows: the last mobile re-baseline was verified only by bundling and Expo Go, and
  a native build later found the MMKV/New-Architecture defect no unit test could see.
  **The merge went red on E2E and the red was the harness, proven rather than assumed.**
  FLOW_AUTH_SESSION_PERSISTENCE failed at the assertion that the tradition preference survives a
  restart, reverting to `generic` — the flow's own header documents that as identity loss, the
  defect `secureSessionStorage.ts` exists to prevent. It was NOT dismissed: `@supabase/supabase-js`
  moves its sub-packages in lockstep, so the bump carried **`@supabase/auth-js` 2.110.2 → 2.110.9**,
  the package owning `persistSession` and the custom `storage` adapter that flow guards. Re-running
  the identical commit went **6/6 green**, which rules out a deterministic regression (not a
  probabilistic one — if it recurs, auth-js returns to the suspect list). The real cause was the
  documented launch race: logcat shows `Destroy timeout of remove-task` 130ms into the flow's own
  cleared launch. **All three flows opening with a fused `launchApp: clearState: true` now use three
  discrete steps**, so the hazard recorded below as latent is closed.
  Two incidental findings worth keeping: `pnpm` is no longer on PATH on the dev Mac (Node 26 dropped
  corepack from the Homebrew install — the pinned `pnpm@9.6.0` via `npx` works), and
  **`pnpm format:check` fails on 248 files**, identically under prettier 3.9.5 and 3.9.6. It is a
  pre-existing repository condition and not a CI gate; it was verified rather than assumed by
  running both versions against the tree.
- **Three Dependabot PRs cross the Expo SDK 54 pin, not two (corrected 2026-07-27).** The triage in
  `44b402a` guessed #61's single failure was "most likely the same jest break arriving
  transitively" and flagged it as worth confirming. **Confirmed, and the guess was wrong.** jest
  stays at 29.7.0 in #61; the failure is
  `Incorrect version of "react-test-renderer" detected. Expected "19.2.8", but found "19.1.0"`,
  because the group bumps **`react` 19.1.0 → 19.2.8** while `react-test-renderer` stays behind.
  `react` and `react-native` are **exactly pinned** in both `apps/mobile` and `packages/ui` — they
  are the SDK 54 baseline — so #61 belongs with #64 and #65 in a deliberate SDK-upgrade increment,
  not in the "red for its own reasons" bucket. **(Superseded 2026-07-28: there is no such increment.
  All three were closed against the peer graph and the ignore list now covers the four SDK-pinned
  packages — see the top entry of this list. The diagnosis of #61's failure below is correct; the
  conclusion that it implies an upgrade increment is not.)** The other seven bumps in the group
  (`@supabase/supabase-js`, both `@tanstack/*`, `@typescript-eslint/*`, `prettier`, `turbo`) are not
  SDK-coupled and could be split out and landed independently.
- **⛔ No job runner processes the `job` table.** `analytics_rollup`, `notify_schedule`,
  `winback_segment`, `content_ingest` and `entitlement_reconcile` are enum values with no consumer.
  The deletion sweep proved the pg_cron half of ADR-025; the worker pattern is still unbuilt, and it
  is what the analytics rollup and prune, the personal-date tombstone sweep and the
  `panchang_cache` TTL are all waiting on.
- **The CCPA export omits `message` rows (found 2026-07-27, B6.3).** `EXPORT_TABLES` returns the
  `conversation` header without the messages in it, so the export becomes incomplete the day
  `GURU_LIVE` is enabled — the moment the text actually exists. Cheap to fix, easy to forget,
  recorded so it is not discovered by a data-rights request.
- **No in-app affordance exists for export or deletion (B6.3).** Both endpoints work; no screen calls
  either. PDD specifies no screen, so building one would invent UX — the affordance is owed by the
  PDD, and Apple's guideline makes it mandatory rather than a nicety.
- **Deferred vendor deps** — `react-native-purchases` and `expo-notifications` are still uninstalled;
  purchase and push flows cannot be verified end-to-end until they land on the Mac with keys. Their
  Null adapters keep the app honest but leave those paths E2E-untested.
- **ADR-033 unratified** — constrains what a beta can demonstrate (no panchang, no sunrise/tithi
  notifications).
- **⛔ NFR-15 IS UNMET: there is no point-in-time backup to restore from (found 2026-07-25, B5).**
  Supabase PITR is a paid-plan feature and both hosted projects are on the free tier, so RPO ≤ 24 h /
  RTO ≤ 4 h holds for schema and seed (minutes, from the repo) and **not at all for user data** —
  profiles, households, completions, streaks, personal dates, conversations. This is a launch
  blocker, not a nice-to-have: shipping to real users in this state means a single incident is
  unrecoverable data loss. Closed by the same ~$25/month purchase that closes B1.
- **Single-founder resilience (TRISK-11)** — runbooks and DR are the mitigation; B5 is not optional.
  Runbooks now exist (`docs/devops/DR_RUNBOOKS.md`) and the restore drill is mechanised, but §6 of
  that document lists what is written and **never walked**: PITR (impossible), region response, Edge
  Function rollback. A runbook nobody has exercised is a plan, not a capability.
- **Store review latency** — submission is a long pole; B8 should start the compliance work early.

---

# Definition of Done

All eight slices implemented and reviewed; the §10.1 engineering, ops/security, and compliance
columns fully checked; a beta build distributed and smoke-tested; documentation synchronized.

---

# Milestone Transition

On completion:
1. Update PROJECT_STATUS.md.
2. Update PROJECT_MEMORY.md if permanent knowledge changed.
3. Replace this file with the next milestone (Phased Production Release).

---

# Milestone Summary

> **Current focus: make the feature-complete MVP genuinely shippable — real environments, real E2E,
> real builds, real observability, and a real DR drill. The first job is removing the placeholders
> that let CD report green without verifying anything.**
