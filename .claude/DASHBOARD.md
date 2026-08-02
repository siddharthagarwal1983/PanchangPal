# DASHBOARD.md

# PanchangPal Dashboard

Version: 1.32.0

Last Updated: 2026-08-02 (B4 CLOSED — two SLOs proven end to end; 47% → 50%)

Purpose:
This is the first file Claude should read at the beginning of every session.
It provides a one-minute overview of the project's current state.

For details, consult:

- PROJECT_MEMORY.md
- CURRENT_MILESTONE.md
- SESSION.md
- TASK.md

---

# Project

**Name**

PanchangPal

**Status**

🟢 Active Development

**Health**

🟢 On Track

---

# Current Phase

🚧 Beta Readiness & Platform Hardening (TDD Part 5)

Progress

50%

(Canonical progress metric — **4 of 8 Beta Readiness slices COMPLETE: B2, B4, B5, B6.**
**B4 closed 2026-08-02** when B4.4 landed: two of §7.2's seven SLOs — NFR-06 crash-free sessions and
NFR-14 availability — are live AND **proven end to end by deliberate triggers**, each watched to open
an issue and deliver mail to a human. §8.4's standard is that an alert nobody has seen fire is a
plan, not a capability; both have now been seen.
Counted at **verifiable scope**, the same basis as B5 (no PITR) and B6 (no ratified ADR-034): the
five unproven SLOs are blocked on things engineering does not own — three behind the Ask Guru gate
(`GURU_LIVE = false`), one behind uninstalled `expo-notifications`, and **NFR-10 behind a PDD
taxonomy decision**, since PDD §11's registry contains no sync event and inventing one is forbidden.
Not one is unfinished code. NFR-07 is a free addition whenever wanted.
**Two gaps stated rather than folded in:** `SVC_health`'s 503 branch is proven by unit test but never
exercised end to end (it belongs with the DB-outage runbook drill), and §7.2's dashboards remain
absent — the `analytics_event` rollup worker is still unbuilt.

Prior detail — 3 of 8 slices COMPLETE plus **¾ of B4**:
(3 + ¾)/8 ≈ 47%. **B6 is the third**, and like B2 and B5 it is counted at its VERIFIABLE scope:
all four increments are delivered — B6.1 OWASP review · B6.2 CCPA export + the SVC_account
authorization fix · B6.3 data inventory + privacy policy + store labels · B6.4 §5.2 supply-chain
controls — while **§6.2's delete half is not merely unverified but UNBUILT**, found by B6.3 (see
Current Task). That is recorded as a launch blocker rather than counted as done, exactly as B5's
missing PITR was. The difference is that this one is ordinary engineering, not a purchase.
Prior detail — 2 of 8 slices COMPLETE: **B2 (E2E verification)** and
**B5 (Reliability & DR, at verifiable scope)**, plus
**3 of B4's 4 increments** — B4.1 telemetry seam, B4.2 EVT_* analytics sink, B4.3 server seam +
release gate — plus **B5 ✅ COMPLETE** (runbooks + restore drill · §8.2 degradation policy · §8.4 operator
resilience), giving (1 + 1 + ¾)/8 ≈ 34% by increments — but **B5 is reported as complete only at its
verifiable scope**: NFR-15 cannot be met without PITR, which is a purchase, so the honest figure is
(2 + ¾)/8 ≈ 31% with B5's backup deliverable explicitly outstanding.
**B4 cannot go further without a Sentry org + DSN.** The EVT_* instrumentation, the analytics RLS
gate and the API contract gate do not move this number: they complete or restore work other slices
began, and the percentage counts increments, not commits.)
B1 ~85%, B3 ~80%. B2 is now DONE: the bundle gate plus **four** Maestro flows (FLOW_RETURNING,
FLOW_MORNING_RITUAL, FLOW_SESSION_PERSISTENCE, FLOW_ONBOARDING) are GREEN in CI on a real native
Android build (run 30196966887 on `d56a4cb`, 2026-07-26). FLOW_ONBOARDING joined once PR #50 made the
onboarding gate real. The two still absent — household invite, live Ask Guru — are blocked on other
slices / backends / a gated feature, not on B2's engineering. B1 and B3's remaining items are gated
on money, a store account, or a later slice.
PROJECT_STATUS.md and CURRENT_MILESTONE.md must report this same number; DASHBOARD.md is
authoritative if they diverge.)

Mobile MVP Phase 1: ✅ 100% (M1–M8, merged 2026-07-18) — with one correction recorded 2026-07-26:
**TDD Part 4 §6 (offline-first) was never implemented** despite the milestone being declared
feature-complete. The mutation queue held state in memory beneath a header claiming persistence,
and the read cache was not persisted at all. Both are now built. "Feature-complete" has meant
"written and unit-tested" more than once in this repo; §6 is the third instance.

Prior phases ✅ complete: Documentation → Repository & Platform Foundation → Backend Foundation →
Mobile MVP Phase 1 (M1–M8).

---

# Current Milestone

Beta Readiness & Platform Hardening

See:

CURRENT_MILESTONE.md

---

# Current Task

✅ **B4 — OBSERVABILITY IS CLOSED. 47% → 50%.** The first slice completed since B6 on 2026-07-27.

**B4.4 delivered two SLOs that are PROVEN, not configured** — the distinction §8.4 exists to enforce:

| SLO | Proof |
|---|---|
| **NFR-06** crash-free sessions ≥ 99.5% | Synthetic crashed sessions → issue → **email received 14:43** |
| **NFR-14** availability ≥ 99.9% | `SVC_health` probe forced red → issue `PANCHANGPAL-EDGE-3` → **email 16:17** |

⚠️ **NFR-06 took TWO drills, and the first one is the more valuable half.** Drill 1 detected
perfectly — correct threshold, correct `production` filter, high-priority issue opened and assigned
— and **told nobody.** Both alert rows targeted *Suggested Assignees*, and a metric-monitor issue has
no stack trace and no suspect commit, so the recipient set was empty. Every visible signal said
"configured". **Without a deliberate trigger this would have shipped as done**, and §8.4's worst
unattended failure — a crash affecting every user going unnoticed, because users of a calm ritual app
stop opening it rather than filing bugs — would have played out in full. NFR-14 then worked on the
first attempt purely because that lesson was applied: an explicit **Member** recipient.

**Also delivered in B4.4:** `docs/devops/SLO_ALERTS.md`, all seven §7.2 SLOs with instrument,
threshold, alert and named blocker, pinned by `slo-alerts.test.ts` — which fails when an instrument
**appears** while the doc still calls it missing, the dangerous direction. `SVC_health`
(`verify_jwt = false`, the only unauthenticated surface, body structurally incapable of leaking) and
`scripts/slo-alert-drill.mjs`, a repeatable guarded drill.

**Three defects found along the way, each by asking what a build actually reports rather than what it
should:** CI reporting itself as **production** (#98); the **edge seam having the identical defect**
(`SENTRY_ENVIRONMENT` undocumented, defaulting to production); and `cd.yml`'s hardcoded deploy list
**omitting `health`**, which would have merged green and served nothing.

⚠️ **THE DAY'S LESSON, LEARNED FOUR TIMES: A CHANGE THAT LOOKS APPLIED IS NOT A CHANGE THAT TOOK
EFFECT.** The `.env` newline that corrupted a Supabase URL; the mobile environment default; the edge
environment default; and a secret saved **eight minutes after** the curl meant to verify it. Each
time the tell was a timestamp or a log line, never the thing being changed. The cheapest check of the
day was `sha256("staging")` against Supabase's published digest — it settled a value question in one
step that two screenshots had left ambiguous.

**Not proven, and stated:** `SVC_health`'s 503 branch end to end (permission to deploy a deliberately
broken endpoint was declined — correctly; it belongs with the DB-outage drill), and §7.2's dashboards,
which wait on the unbuilt `analytics_event` rollup worker.

---

**Previously — Sentry ingest.**

✅ **SENTRY INGEST IS CONFIRMED — AND CONFIRMING IT FOUND THAT CI WAS REPORTING AS PRODUCTION**
(fixed and merged, **#98** `a724519`).

Ingest works: **91 sessions**, release `0.1.0`, one error captured — sessions existing at all is the
direct evidence `AppLifecycleIntegration` installed. The stray `react-native-9n` project (from the
failed `sentry-wizard` run on 2026-07-28) has been deleted by the owner.

⛔ **But `sentryEnvironment()` derived the environment from `extra.eas.channel`, which only EAS Build
stamps.** `e2e.yml` builds with `expo prebuild` + `gradlew assembleRelease` on the runner — no
channel — and `__DEV__` is false in a release APK, so it fell through to **`'production'`**. It pulls
a REAL DSN (`eas-cli env:pull --environment preview`), so this was live, not theoretical.
**Evidence:** the artifact's logcat resolves to project `4511814237290496` — the `panchangpal-mobile`
id in the dashboard URL — and sessions climbed **87 → 91 while a `main` E2E run was mid-flight** with
no user activity. At 12 launches per run, **essentially all 91 sessions were CI.**

**Two consequences.** "100% crash-free" was measuring an emulator — worse than a sampling caveat,
because the sessions were **labelled** production. And `environment:production`, the alert scope §7.2
wants, **would have paged on every CI run**. ⚠️ **Historical sessions stay labelled `production`**;
the fix is forward-only, so treat the crash-free figure as meaningless until real traffic accrues.

⚠️ **MY FIRST ATTEMPT AT THAT FIX BROKE THE SUITE — 4/6 against main's 6/6 on two runs**, a real
regression established by baseline rather than by re-running. Two defects, both kept in history:
(1) `echo "..." >> .env` had **no leading newline**, so it concatenated onto the last variable's
VALUE — `EXPO_PUBLIC_SUPABASE_URL=https://real.supabase.coEXPO_PUBLIC_SENTRY_ENVIRONMENT=ci`. The
name still parses, so the file looks fine while the value is garbage; a corrupted Supabase URL failed
every backend call, and it read as a product defect. **The build log had said so all along:
`env: export` listed three names, mine absent.** (2) The override was read from `process.env` only,
which relies on Babel inlining `EXPO_PUBLIC_*`; the gradle `export:embed` path did not deliver it.
It now reads `extra.sentryEnvironment`, threaded through `app.config.ts` exactly as `sentryDsn` is.
**The second is the worse one: the broken path PASSED its unit test**, because jest sets
`process.env` directly and never exercises the bundler — the perturbations were sound and tested the
wrong layer.

**Device-verified (`30735709985`), all three checks named in advance:** the variable appears in
`env: export` · **6/6 flows** · **12 × `[telemetry] reporter=sentry env=ci`**.

**B4.4's precondition is now met** — `environment:production` finally means something — but the §7.2
dashboards and alert rules are still unbuilt (the dashboard shows "Create Alert": **zero rules**,
confirmed). Closing B4 takes the milestone **47% → 50%**.

---

**Previously this session — the dependency queue.**

✅ **ALL FOUR QUEUED DEPENDENCY PRs RESOLVED — THREE MERGED, THREE CLOSED WITH EVIDENCE.**
⛔ **"The queue is empty" was true for four minutes**: Dependabot re-ran against the new lockfile and
opened **five fresh majors (#89–#93)** — **since triaged the same way.** Merged **#93** `ea71ce6`
(zod 4) and **#94** `1d035ce`; closed **#89 / #91 / #92** with evidence; **#90 left open** as real
work. **Nine dependency PRs resolved across the session; one open, and it is a wanted upgrade rather
than a defect.**

**#89 is a FOURTH LEAK that corrected the rule rather than extending it.** `babel-preset-expo`
54.0.12 → **57.0.5** is pinned by `expo@54.0.36`'s own `~54.0.12` range and matched by no pattern.
**It falsifies PROJECT_MEMORY's claim that the SDK 54 set was "complete"**: `bundledNativeModules.json`
lists **NATIVE** modules and is authoritative in one direction only, so SDK-pinned *build* packages
never appear in it. **The check is two-sided** — the manifest, plus `expo`'s own dependency ranges.

**Three different pinning mechanisms in one batch**, none of them reported by the manifest: a direct
SDK range (#89) · a **transitive babel-7 plugin family** with no declared peer anywhere (#92 —
`@babel/core` 8 is ESM-only and every plugin `require()`s it) · a **vendored exact version** (#91 —
`@sentry/react-native@7.2.0` depends on `@sentry/cli` at exactly `"2.55.0"`).

⚠️ **#91 is the clearest case yet that a green gate can be VACUOUS.** It passed all five gates and
**had to**: `e2e.yml` sets `SENTRY_DISABLE_AUTO_UPLOAD` and **no gate runs `sentry.gradle`**, so
`@sentry/cli`'s only consumer is never exercised. **Ask which gate would have to fail** — if none
touches the package's consumer, the colour carries no information. Third distinct mechanism behind
this signature, after native resolution and unenforced peers.

**#93 survived the very check that killed #82:** `zod-validation-error@4.0.2` peer-requires
`zod: ^3.25.0 || ^4.0.0` — genuinely **satisfied**, not merely unenforced. Verified locally before
merging (tsc 11/11, 118 vitest, 16 conformance tests that carry their own positive *and* negative
assertion, so they cannot pass vacuously).
Merged: **#87** `da9e945` (Dependabot majors-only for actions) · **#88** `652831d` (i18next 23→26 +
react-i18next 15→17 as **one** increment) · **#80** `715e2de` (supabase-js 2.111.0). Closed: #83,
#82, #62. **Progress unchanged at 47%** — dependency hygiene advances no Beta slice.

**Two of the four were not what they were filed as.** **#82 and #62 are one change**:
`react-i18next@17.0.11` peer-requires **`i18next >= 26.2.0`** and the repo had 23.16.8. **#82 was
GREEN on all five gates while shipping a violated peer** — its lockfile reads
`react-i18next@17.0.11(i18next@23.16.8)` beneath the declared `>= 26.2.0`, because **pnpm records an
unmet peer without failing**. Fourth instance of green being anti-correlated with safety, and the
**first by a mechanism unrelated to the SDK pin** — neither package is in
`bundledNativeModules.json`. #62's red was the other half, and its message pointed nowhere near #82.

**The trap inside #62:** `compatibilityJSON: 'v3'` carried a *runtime* justification (Hermes' partial
Intl), so flipping it to `'v4'` to clear the type error is the **#75 `react-test-renderer` pattern**.
Read against the installed source instead: `PluralResolver`'s constructor touches no Intl, and
`new Intl.PluralRules()` is lazy inside a `getRule` that **catches and degrades** — the justification
does not survive v26.

⚠️ **My own first guard failed on its first run, and that was the finding.** It asserted "no call site
passes `count`"; `streak.label` and `household.memberCount` both do, so the plural path *is* reached.
The real invariant is narrower — both use `count` only as an **interpolation variable** and no
`_one`/`_other` variants exist, so the suffixed lookup misses and falls back to the base key.
**The invalidating condition is a plural-suffixed KEY, not a `count` call site**, and the first locale
with more than two plural categories would render the wrong form *silently*. The test now runs the
real bundle with `Intl.PluralRules` **deleted** rather than grepping for a legitimate pattern.

**#83 was not an upgrade at all.** All nine actions are major-pinned and publishers move the major
tag, so `@v5` already receives 5.x; `5 → 5.6.0` would have **frozen** one action while eight float,
and `JAVA_VERSION: '17'` is set separately. #87 fixes the cause — no `update-types` filter on the
`github-actions` block. **SHA-pinning all nine is recorded and deliberately left to the owner.**

**Verified:** tsc 11/11, eslint 0 errors, **418 mobile jest (+5)**, 118 vitest, `expo export` both
platforms, and **E2E 6/6 on device for both #88 and #80** — including
`FLOW_AUTH_SESSION_PERSISTENCE`, the flow guarding the auth-js storage adapter #80's bump moves.
⚠️ One sample each: meaningful now that #84 fixed the ~50% race, but not a verdict.

---

**Previously — the offline-completion race.**

✅ **DIAGNOSED CORRECTLY, FIXED, VERIFIED (5/5 green), AND MERGED**
as **`45f00c7` (#84)**. Also merged: **`b8ab528` (#85)**, the SDK-pin rule's **third leak** — `#81`
(netinfo) and `#63` (jest, via `jest-expo`'s jest-29 dependency family) closed with evidence, and
`bundledNativeModules.json` named as the authoritative source so the next triage checks the manifest
rather than release notes.

**Progress unchanged at 47%.** This closes a TDD Part 4 §6 launch blocker inside a slice already
counted, exactly as offline sync and the deletion executor did.

**#79 IS UNBLOCKED.** The main baseline came back and main flakes identically with **no Sentry code
at all** — 3 green / 3 red across 2026-07-28, every red the same three-flow signature. One of the
reds is `4fdaf10` (#78), a commit that changed **only** `.github/dependabot.yml` and ADR markdown
and therefore cannot have introduced a runtime race. Sentry was never the cause.

⚠️ **THE RECORDED ROOT CAUSE WAS WRONG, AND THE CORRECTION IS THE FINDING.** "An asynchronous or
batched MMKV write loses to the kill" is refuted: `keyValueStore.set` is MMKV's **synchronous** JSI
call made inside the tap handler, the library loads natively in every launch, and no `[sync]`
warning is ever emitted. **The queue reached disk every time.**

**Nothing rendered it.** `STORE_offlineQueue` was read only by the drain, so the tick after a cold
start came solely from the persisted query cache — written on a **1 s trailing throttle** and
flushed from an unsubscribe handler **a process kill never runs**. Offline it was additionally
poisoned: the direct write always fails, and `useChecklist.onError` reverted the optimistic tick
although the mutation was durably queued. The ~50% was whether the process died before or after
that revert-plus-throttle write landed — **the passing runs passed by luck of timing.**

**The rule: a durable queue guarantees DELIVERY, not DISPLAY.** Pending state is now re-derived
from the queue onto the read model at startup (`pendingProjection` + `reapplyPendingMutations`),
and `FLOW_OFFLINE_SYNC` restores the radio in an `onFlowComplete` teardown so one defect stops
presenting as three.

**Verified:** 367 mobile jest (+17), 102 vitest, tsc across 11 projects, eslint 0 errors, bundle
gate both platforms, two perturbations each failing exactly the right test — **and device-verified
5/5 green, 30/30 flows** against main's **3 green / 3 red** on the same suite. Five consecutive
greens against a ~50% race is ~3% likely by chance, so this is a verdict rather than a lucky draw.
**Dispatch E2E runs SEQUENTIALLY**: the concurrency group permits one pending run per ref, so an
initial batch of four left two cancelled.

⚠️ **AND A SECOND DEFECT OF THE SAME CLASS, found by #79's red E2E: a preference write had no
durable path at all.** `useUpdatePreferences` wrote straight to the server, so an app kill inside the
request window silently reverted the setting — and because `FLOW_AUTH_SESSION_PERSISTENCE` reads the
tradition back as its proof of identity, that loss presented as **identity loss** and was
misattributed **four times** (twice to the launch race, once to Sentry, once to a flake). Fixed on
`fix/durable-preference-writes`: `preferences` is a syncable kind again with a server branch and an
**unratified** §6.6 rule (LWW, the nearest ratified precedent), the upsert behind a **column
allowlist**, and **mutations stamped with the identity that made them** — without which durable
preferences would create a **false green** on the suite's most important flow. My own run 1 failed on
the read half (no `['preferences']` invalidation); run 2 is 6/6.

**A durable queue guarantees DELIVERY, not DISPLAY** — the same lesson, twice in one day, from
opposite directions.

---

---

**Previously — two things landed and one is deliberately held back. Main is at `4fdaf10` (#78).**

**Progress unchanged at 47%.** Nothing this session advanced a Beta slice.

**✅ MERGED — #78, all six gates green (incl. the DR drill).** The **SDK-pinned dependency rule**:
the "SDK-upgrade increment" the tracking docs had queued **does not exist**. #64, #65 and #75 were
three symptoms of one gap in `.github/dependabot.yml`'s ignore *patterns*, checked against the
installed peer graph and closed with their evidence; the list now covers `react`, `@types/react`,
`@expo/*`, `@babel/runtime`. Plus **ADR-034 — Account-Deletion Audit Record (Proposed)** and seven
corrected "TDD Part 2 §5.1" mis-citations.

**🟡 OPEN AND HELD BACK — PR #79 `feat/sentry-telemetry`.** Sentry is wired behind both ports with
PII scrubbing structural and the Expo config plugin for source maps, but it is **not merged**, for
two reasons found by verification rather than review:

1. ⛔ **Crash-free sessions are NOT measurable as built** — and this session claimed they were,
   across five documents, before catching it. `getTelemetryAdapter()` is called only from inside the
   two error handlers, so `Sentry.init` runs only after the **first error**: a healthy session never
   starts one and native crash capture never installs. NFR-06 / §7.2 stay unmeasurable, which was
   the entire justification for the work. Fix is a one-line startup resolution plus a test that
   fails without it.
2. ⛔ **A deterministic red E2E whose mechanism is unconfirmed** — three flows failed twice on the
   identical commit (main is 6/6 green), then went green once after `isUsableDsn()` rejected a
   placeholder DSN. **One green run after a deterministic red is not a verdict**, and the diagnostic
   that would have proven causation never logged — because of Blocker 1.

The two are deliberately **not** stacked: fixing (1) changes *when* Sentry's network instrumentation
installs, which is the leading suspect in (2), so they must be verified together.

**Two defects already found and fixed inside #79**, both caught by the **native build** while the
bundle gate, tsc, eslint and 487 unit tests all passed: `@sentry/cli` unresolvable under pnpm's
nested layout (the **third** instance of the `@babel/runtime` / `babel-preset-expo` defect), and the
source-map upload task failing the build rather than skipping — which a comment of mine had asserted
the opposite of.

---

**Previously — ADR-034 opens the deletion-audit decision the TDD owed — Proposed, and deliberately not decided
here.**

**Progress unchanged at 47%.** A Proposed ADR surfaces a decision; it does not ratify one, so B6's
open deliverable stays open. What changed is that it is now a decision with a named owner rather
than a note in a migration comment.

**The contradiction, stated precisely.** **TDD Part 5 §5.1** (STRIDE, `[MANDATORY]`) names
`TBL_ACCOUNT_DELETION` as the **deletion audit** mitigating repudiation — which requires the row to
outlive the erasure. **TDD Part 2 §3.15** declares `user_id ... on delete cascade` — which erases it
along with its own subject. **Neither document is wrong; the schema is under-specified for the role
the threat model assigns it.** `account_deletion` is a correct *request* table — pending intent, F-3
grace window, owner-readable, cascading as operational state about a live account — and cannot also
be the durable record of a completed erasure. **One row is being asked to have two lifetimes.**

**Decided on engineering grounds:** the request and the audit are separate records; the audit is
service-role-only (ADR-030 — `authenticated` includes anonymous users, and anyone can mint an
anonymous JWT for free); it records the *fact* of erasure and never content recovered from the
deleted rows; and **`executed_at` is retired**.

**Referred to Security/Privacy, with Legal sign-off:** *what identifies the subject of a completed
erasure* — the raw `user_id`, a one-way digest of it, or nothing at all. That determines whether the
system keeps a permanent list of identifiers belonging to people who asked to be forgotten, which is
a privacy decision with legal weight rather than an engineering preference. **The digest form is
recommended, not chosen** — it verifies a specific claim without the table being a readable roster.
**No schema change before ratification.**

**Three findings while writing it.** (1) **The citation was wrong everywhere** — every tracking
document, `DATA_INVENTORY.md`, and the executor migration's own header cited "TDD Part 2 §5.1", but
**Part 2 §5.1 is "Identity, Onboarding & Profile"**: API contracts, no threat model. The real
conflict spans **two Parts**, which is plausibly why reviewing either alone never caught it. Seven
citations corrected; the unrelated and correct Part 2 §5.1 references in `openapi.yaml` and three
source files were left alone. (2) **`executed_at` is dead schema, not merely unwritten** — its only
reader is `where executed_at is null`, a predicate that is unconditionally true because the column
can never hold a value. A column exists to record an event that destroys the row it lives on.
(3) **A retention rule agreed today would not be enforced**: the deletion sweep is still the only
scheduled job that runs. The ADR says so rather than specifying a period nothing implements — the
exact failure it exists to resolve.

---

**Previously — the "SDK-upgrade increment" was investigated and does not exist. Three PRs closed; the rule that
should have prevented them is fixed** (PR #78).

**Progress unchanged at 47%.** Dependency hygiene advances no Beta slice.

The three PRs queued as one deliberate SDK-upgrade increment were checked against the **installed
peer graph** rather than their release notes. None should land on SDK 54, and the cause is single:
`.github/dependabot.yml` already carried the correct rule — *an SDK-pinned package is upgraded with
the SDK via `expo install --fix`, never alone, because a lone bump produces a build that resolves and
then fails natively* — and only its **patterns** were short.

- **#64** `@expo/metro-runtime` 6.1.2→57.0.7 — the package's dist-tags map majors to **SDK majors**
  (`sdk-55`→55.x, `sdk-56`→56.x, `latest` 57.0.7→**SDK 57**). This app is SDK 54, the 6.1.x line, and
  `expo-router@6.0.24` peer-requires `^6.1.2`. `expo-*` never matched a scoped `@expo/` name.
- **#65** `@babel/runtime` 7→8 — `babel-preset-expo@54.0.12` peer-requires `^7.20.0`. Also one of the
  two undeclared transitive dependencies that broke bundling during the Execution Gap.
- **#75** `react` 19.1.0→19.2.8 (which **superseded #61**, regenerated after #74 landed) — RN 0.81.5's
  peer is `^19.1.0`, so this is peer-**LEGAL** and looks routine. It is not: react-native ships its
  own Fabric renderer built against React `"19.1.0"`, hardcoded in
  `Libraries/Renderer/implementations/ReactFabric-{dev,prod}.js`.

**Two things the previous framing had wrong.** (1) "All three are red because they cross the SDK pin"
is false — **#64 and #65 passed all five CI gates, including the bundle gate**, and #75, the only
peer-legal one, was the sole red. **Green is anti-correlated with safety for an SDK-pinned package**:
`expo export` resolves what fails natively, the third instance after mmkv v2 under the New
Architecture and `babel-preset-expo`. (2) The recorded fix for #75 would have **hidden** the defect —
its red is `@testing-library/react-native`'s `ensure-peer-deps.js` asserting `react-test-renderer`
=== `react` exactly, so moving `react-test-renderer` to 19.2.8 (what TASK.md prescribed) would have
turned CI green while leaving the renderer at 19.1.0. There was nothing to gain regardless: every
19.2.x release note is React Server Components, which React Native does not use.

**PR #78** extends the ignore list to `react`, `@types/react`, `@expo/*` and `@babel/runtime` with
the evidence recorded inline. **No native build or Maestro run was needed** — the saved plan called
for both, and the peer graph answered it first, which was the cheaper experiment all along.

The open queue is now **#62** (i18next 23→26) and **#63** (jest 29→30), red for their own unrelated
reasons. No SDK-crossing PR remains.

---

**Previously — the #61 dependency group is split, and the open queue is now coherent** (PR #74, `0185ea9`).

**Progress unchanged at 47%.** This advances no Beta slice — it is dependency hygiene that unblocks
seven bumps held hostage by two, exactly as offline sync and the deletion executor closed gaps
without moving a slice.

Dependabot's `production-minor` group was red for **one** reason, and the earlier triage had guessed
the wrong one. It is not jest: the group bumps **`react` 19.1.0 → 19.2.8** past the **exactly
pinned** Expo SDK 54 baseline while `react-test-renderer` stays at 19.1.0, so every jest suite fails
with `Incorrect version of "react-test-renderer" detected`. The other seven bumps are not SDK-coupled
and were simply stuck behind it.

**Landed on their own:** `@typescript-eslint/eslint-plugin` + `parser` 8.63.0→8.65.0 · `prettier`
3.9.5→3.9.6 · `turbo` 2.10.4→2.10.7 · `@supabase/supabase-js` 2.110.2→**2.110.9** (a further patch
shipped after Dependabot opened #61; it is inside the declared `^2.110.8` range) · both
`@tanstack/*` 5.101.2→5.101.4.

**Deliberately left behind:** `react`, `@types/react`, and the lockfile's `react@19.1.0` peer keys.
They belong with #64 and #65 in **one** SDK-upgrade increment validated by a native build and the
Maestro flows — the last mobile re-baseline was verified only by bundling and Expo Go, and a native
build later found the MMKV/New-Architecture defect no unit test could see. The open queue is now
three PRs crossing the same pin (#61's remainder, #64, #65) plus #62/#63, red for their own reasons.

**Verified:** all five CI gates green on the PR and locally — eslint 0 errors (16 warnings, its
baseline), tsc clean across 11 projects, 102 vitest + 33 ui + 350 mobile, and `expo export
--platform all` for both platforms. The lockfile diff is confined to the seven plus the peer-key
rewrites the parser bump forces through `eslint-plugin-import`; no unrelated transitive drift.

**The merge went red on E2E, and the red was the harness — proven, not assumed.**
FLOW_AUTH_SESSION_PERSISTENCE failed at the assertion that the tradition preference survives a
restart, reverting to `generic` — which that flow's header documents as **identity loss**, the exact
defect `secureSessionStorage.ts` exists to prevent. It was not written off, because
`@supabase/supabase-js` moves its sub-packages in lockstep and the bump therefore carried
**`@supabase/auth-js` 2.110.2 → 2.110.9**, the package that owns `persistSession` and the custom
`storage` adapter that flow guards. Re-running the **identical commit** went **6/6 green**, which a
deterministic regression cannot do. Cause: the documented launch race — logcat shows
`Destroy timeout of remove-task` 130ms into the flow's own cleared launch. **All three flows that
opened with a fused `launchApp: clearState: true` now use three discrete steps**, closing a hazard
the tracking docs had carried as latent since 2026-07-27. (Precisely: this clears a *deterministic*
auth-js regression, not a probabilistic one. A recurrence puts it back on the list.)

**Two incidental findings, recorded rather than left to be rediscovered.** `pnpm` is no longer on
PATH on the dev Mac — Node 26 dropped corepack from the Homebrew install, and the pinned
`pnpm@9.6.0` via `npx` is what works. And **`pnpm format:check` fails on 248 files** — *not* caused
by the prettier bump: running 3.9.5 and 3.9.6 against the tree gives an identical 248 either way. It
is a pre-existing repository condition, is not a CI gate, and reformatting 248 files behind a
dependency bump would have buried the diff.

---

**Previously — the three owed follow-ups are closed, and E2E now runs six flows.**

- **The CCPA export omitted every message.** `EXPORT_TABLES` fetches with `.eq('user_id', …)` but
  `message` keys on `conversation_id`, so the export returned conversation HEADERS with none of
  their content — silently, because an empty row set and an unreachable one look identical. Fixed
  with a scoped second query and five tests; two perturbations prove it, the sharper one being that
  widening the `in` clause past the caller's own conversations fails, since an unscoped fetch would
  turn a data-rights feature into a data breach.
- **`e2e.yml`'s flow echo said four while five ran.** Now DERIVED from the directory Maestro
  actually runs, so it cannot drift again.
- **`FLOW_OFFLINE_SYNC` is written and green** — the flow PR #66 shipped without and said so. It
  proves three things unit tests cover individually and never together: the queue reaches DISK, the
  §6.1 persisted cache renders a cold start with no network, and the completion is not reverted by
  the drain.

**Four E2E cycles, and none of the three defects were in offline sync.** (1) A launch race:
`launchApp: clearState: true` fuses the clear and the launch, and the stale TASK — not process —
was still being destroyed 1.1s in, so Android killed the process it had just created; the app never
started and the flow failed 60s later looking exactly like a product defect. `stopApp` alone did not
fix it; three discrete steps did. (2) The flow then broke a NEIGHBOUR: FLOW_AUTH_SESSION_PERSISTENCE
lost a server-written preference, because the offline banner clearing proves the app *thinks* it is
online, not that it is — NetInfo reports `isConnected` from a link-level signal with no usable
route. The flow now makes the app prove connectivity with a cleared cold start before ending, so a
dead radio fails the flow that turned it off rather than poisoning the next one. (3) Both were found
by reading the uploaded ARTIFACT — the hierarchy holding nothing but the status-bar clock, and the
logcat kill sequence — neither of which appears in the run log. The lesson this project already paid
for with the Pixel Launcher ANRs.

**Also corrected:** `DATA_INVENTORY.md` v1.0 attributed an analytics prune to ADR-025, which
mentions pruning zero times, while TDD §6.4 says deletion leaves analytics intact. **No retention
period is specified for `analytics_event` anywhere** — a documentation gap, not an unimplemented
intent.

**Verified:** 6/6 flows green on main (run 30261926062), 102 vitest, 43 pgTAP, five CI gates green.

---

**Previously — the account-deletion executor — the launch blocker B6.3 found is closed at engineering scope.**

`SVC_account.delete` had written an `account_deletion` row with a 30-day grace window since the
Backend Foundation milestone, and nothing had ever read it back. Now:

- **`execute_account_deletion(uuid)`** — atomic per-user erasure. SQL, not TypeScript, because the
  erasure spans nine tables and supabase-js has no transaction across calls: a failure midway would
  leave an account half-erased with no way to tell how far it got.
- **`sweep_due_account_deletions()`** — each user in its own subtransaction, so one blocked account
  cannot stop every other erasure.
- **pg_cron schedule** (daily 03:15 UTC), idempotent, warning loudly where the extension is absent.
- **`POST /account/sweep`** — the operator trigger §6.5 names, authorized by a provisioned secret,
  never by a user JWT. **An unconfigured secret refuses everyone**, because "not protected yet" is
  how an endpoint that deletes accounts ships open.
- **`account_deletion_sweep_is_scheduled()`** — makes "is it actually running?" answerable. False if
  pg_cron is absent, the job is missing, **or an operator disabled it**. Checked by the DR drill;
  `ACCOUNT_SWEEP_SECRET` required at preflight's production tier (proven: exit 1 without, 0 with).

**Six foreign keys needed explicit handling.** Four RESTRICT (`household.owner_id`,
`invite.inviter_id`, `invite.accepted_by`, `referral.referred_user_id`) so a naive
`delete from auth.users` errors outright. Two more — `household_member` and `support_ticket` — use
**ON DELETE SET NULL**, which keeps the row and only drops the link, leaving the deleted user's
display name in a household and their email and free-text body in a support ticket.
`referral.referred_user_id` is **nulled, not deleted**: that row belongs to the referrer, and one
user's erasure must not destroy another's record.

**A perturbation caught a defect in my own test.** Asserting `where user_id = ...` passed against
the SET NULL leak, because that is exactly the column being nulled. The assertions now key on
**content** — the email address, the display name — and the perturbation fails as it should.

**Verified against a real Postgres 17**, not asserted: migrations applied from scratch (32 tables),
**17 pgTAP assertions** checking the rows are gone table by table, **five SQL perturbations** each
failing the right assertions (support_ticket, household_member, referral, the F-3 gate, the grace
window), **two TypeScript perturbations** on the sweep authorization failing at both the pure-rule
and handler layers, the pg_cron branch exercised with the extension actually installed (schedules,
idempotent on re-run, reports false when disabled), and the DR invariant failing with the executor
dropped. 97 vitest (+9), eslint at its pre-existing baseline.

⚠️ **Two residuals, stated rather than implied.** (1) **pg_cron must be enabled on the hosted
project** — a dashboard action, so until then the only execution path is the operator trigger.
(2) **`executed_at` cannot be written**: `account_deletion` cascades with `app_user`, so the request
row is erased with its own subject and there is no row left to stamp. That collides with TDD Part 2
§5.1, which names the table as the *deletion audit* mitigating repudiation. Changing the foreign key
would invent a schema decision with its own privacy cost, so the executor implements the schema as
declared and **the TDD owes a resolution**. A completed deletion currently leaves no record.

---

**Previously — B6.3 — the data inventory, the privacy policy draft, and the store labels. B6 is complete at its
verifiable scope. The inventory found that the CCPA deletion right is never carried out.**

Three documents, each derived from the one above it, and the first pinned by a test:

- **`docs/devops/DATA_INVENTORY.md`** — all 32 tables classified (Identifying / Personal /
  Pseudonymous / Non-personal), the nine `EVT_*` ids the app actually emits with their props, the
  six on-device storage keys, the six third-party processors, and the permissions. Built from the
  migrations and the mobile source, **not** from the documentation, because that is the third time
  this milestone that reading the claim against the implementation was the thing that worked.
- **`docs/devops/PRIVACY_POLICY_DRAFT.md`** — user-facing draft, `[LEGAL REVIEW REQUIRED]`, with
  `[UNBUILT]` markers where a normal policy sentence would be false today.
- **`docs/devops/STORE_PRIVACY_LABELS.md`** — Play Data Safety + Apple App Privacy answers, with
  the ⚠️ triggers that change each answer when a deferred dependency lands.

**The inventory is machine-checked** (`apps/backend/tests/privacy/data-inventory.test.ts`): it parses
`create table` out of the migrations and quoted `'EVT_*'` literals out of `apps/mobile/{app,src}`,
and compares both against the document **in both directions** — an unclassified new table is
undisclosed collection, and a classified missing table is a disclosure for data that no longer
exists. Same pattern as `SYNCABLE_KINDS` reading SVC_sync's source. Proven by four perturbations
(new table · deleted table row · new emitted event · deleted event row), each failing the right test.

⛔ **THE FINDING: account deletion is scheduled and never executed.** `POST /account/delete` gates
the request correctly and writes `account_deletion` with a 30-day `execute_after`. **Nothing ever
reads that row back.** No Edge Function queries the table, no job runner processes `job`, `pg_cron`
is **commented out** in `20260712000001_extensions.sql`, and `executed_at` is never set by any code
path. TDD Part 5 §6.2 specifies that deletion "hard-deletes owned rows"; that hard delete does not
exist anywhere in the repository. The system records an intention to delete and keeps the data
indefinitely — and the row it writes makes it *look* like the request is being honoured.

This is the fourth instance of the milestone's signature defect, and the most pointed: a privacy
policy promising deletion and a store answer of "users can request deletion" would both be false
statements, with a paper trail saying they were checked. CCPA §1798.105 gives a right to deletion,
not a right to have a request logged.

**The same root cause explains every retention gap**: there is **no scheduled execution in this
project at all**, so analytics never roll up or prune, personal-date tombstones are never removed,
and `panchang_cache` has no TTL sweep. One fix, not five.

**Also found:** the CCPA export omits `message` rows, so it becomes incomplete the day Ask Guru goes
live; there is no in-app affordance for export or deletion (**Apple 5.1.1(v) requires in-app account
deletion** — a three-part dependency: executor + screen + SVC_household for ownership transfer); a
user-deleted personal date is a tombstone rather than an erasure and must be disclosed; and
`packages/database`'s `TABLES` registry had already drifted from the schema (29 names against 32).

**Verified:** 88 vitest (+6), eslint 0 errors, four perturbations each failing the right test.

**Not done, and stated:** nothing here is legally reviewed, and no document is publishable until the
deletion executor exists.

---

**Previously — offline sync — MERGED as `86b3843` (PR #66). The launch blocker B6 found is closed at
engineering scope.** Verified before merge: five CI gates green, and E2E dispatched on the branch (run
30207484940, `a05760d`) passed **5/5 Maestro flows** — FLOW_ONBOARDING and FLOW_RETURNING included,
which is what proves the two new startup effects did not disturb a fresh launch.

**Also this session: the app ran natively on the development Mac for the first time.** Android SDK
cmdline-tools + an AOSP arm64 API-34 image installed, AVD `ppal_aosp34` created, `expo prebuild` +
Gradle build run locally, app installed and launched. Today renders correctly, with panchang
showing "temporarily unavailable" (ADR-033) and a 0 streak (no `.env`, so no backend — the
repositories degrade rather than crash, which is PR #14's fix working).

`STORE_offlineQueue` was an in-memory zustand slice beneath a header claiming MMKV persistence:
never written to disk, never drained, never dequeued. **Nothing in `src/data` bound API_POST_SYNC
at all** — SVC_sync has been fully implemented server-side since the Backend Foundation milestone
and was unreachable from the app. Offline, a completion was lost on app kill; online it worked only
because every hook also called its API directly, and the successful entry then leaked forever.
This contradicted **offline-first**, a permanent architecture decision.

Now built in layers — decisions pure and tested, effects thin: `domain/sync` (FIFO batching,
exponential backoff with half-range jitter, capped attempts, reconciliation) · a persisted
`STORE_offlineQueue` through the shared `KeyValueStore` seam · `syncRepository` (the missing
API_POST_SYNC binding) · `syncService` (single-flight drain, non-blocking status) · `useOfflineSync`
(§6.4's three triggers) · **`queryPersistence` (§6.1)**, the READ half, without which a cold start
offline is empty and §6.2's `[MANDATORY]` cached daily loop cannot hold.

A conflict counts as **acknowledged** (§6.3 resolves by rule); anything returned in neither
`applied` nor `conflicts` is retried, because treating a 200 as success is exactly how a mutation
gets dropped silently. Attempts are capped to stop silent retrying, **never to discard a
completion**.

**Two defects found while building it.** (1) The client queued five mutation kinds and SVC_sync
accepts three — `preferences` and `notif_prefs` hit the handler's `default:` branch and were
returned in neither list, so nothing could ever retire them; the type now narrows to the server's
contract and a test reads the kinds out of the handler's SOURCE so the two cannot drift. (2)
Enqueuing before hydration overwrote the previous launch's pending mutations — caught by a test
that failed on its first run.

**Proven, not asserted:** four perturbations, each failing the right tests. 350 mobile tests (+51),
82 vitest, tsc clean, eslint 0 errors, bundle gate green.

**Not done, and stated:** never exercised against a live backend; no `FLOW_OFFLINE_SYNC` flow;
`STORE_syncStatus` has no UI surface because PDD specifies none.

**Progress unchanged at 44%** — this is a TDD Part 4 §6 gap in the Mobile MVP found during B6, not
one of the eight Beta slices. It closes a launch blocker without advancing a slice.

---

**Previously — B6 — Security & Privacy. Two critical defects found; both fixed and proven.**

**1. The auth session was never persisted (OWASP M1/M9, PR #57).** `supabaseClient.ts` asked for
`persistSession: true` and passed no `storage` adapter; React Native has no `localStorage`, so
auth-js fell back to memory. Because the app is anon-first this cost **identity**, not login:
`restore()` returned null every cold start and a FRESH anonymous uid was minted, orphaning that
user's profile, household, streak, completions, personal dates and conversations. Fixed with a
Keychain/Keystore adapter (`secureSessionStorage.ts`) and proven by
`FLOW_AUTH_SESSION_PERSISTENCE`, which **fails with the fix reverted** and passes with it.

**2. SVC_account had no authorization (OWASP M3, PR #58).** `withHandler` proves only that a bearer
token is PRESENT, and the function runs with the SERVICE ROLE — so RLS is not a backstop. It read
the acting identity from the request body: `delete` took `body.user_id`, `merge` took
`body.auth_uid`/`body.anon_uid`. Anonymous sign-in is enabled, so anyone can mint a valid JWT for
free. `POST /account/merge {"anon_uid": "<victim>", "auth_uid": "<attacker>"}` reassigned a victim's
rows across every owned table — **account takeover**, after which the attacker read them under
ordinary RLS. Household member lists expose `user_id`, so co-members were directly targetable.
Both actions were ALSO broken for legitimate use (the client never sent those fields), which is why
nothing surfaced it. Every action now derives the caller from the JWT; `merge` requires the anon
session's **access token** as proof of ownership. Proven to fail on the reintroduced defect.

**Also:** CCPA export built to the §6.4 row set behind a versioned envelope (F-10 unratified);
§5.2's SBOM, Dependabot and `eas-cli@latest` pinning closed.

**Found and recorded, not fixed:** the offline queue is never persisted, never drained and never
dequeued, so the app is **not offline-first in practice**. A missing feature rather than a
vulnerability — tracked as its own launch blocker.

---

**The E2E gate is green, and the handoff that said otherwise was wrong.**

The previous session closed with "⛔ MAIN'S E2E IS RED, AND THE FIX IS UNPROVEN — START HERE."
Both halves were already false when written: main went **4/4 green including FLOW_ONBOARDING** on
run 30171884650 (`0ca0906`) at 19:34, half an hour after the 19:01 failure the note was written
from. **PR #53 is verified.** A written status is not a verified state — the same lesson the
Execution Gap taught about CI and issue #30 taught about an ADR, now applied to our own notes.

**The gate had a ~21% false-red rate, and it is fixed at the cause.** Reading the artifacts (not the
run logs — logcat and hierarchies live only in the uploaded artifact) shows **3 of 4 recent failures
were `Pixel Launcher isn't responding` dialogs** covering a healthy app, every one of them with
`hide_error_dialogs 1` from PR #41 already active. The fourth was the one genuine red, the #50
onboarding-gate breakage, correctly fixed by #53.

**PR #55 (`d56a4cb`):** AVD `target: google_apis` → `default` (AOSP), which ships neither Pixel
Launcher nor the Google app. Nothing under test needs Play Services — `expo-notifications` and
`react-native-purchases` are both uninstalled, no Maps, no Play Billing. Verified 4/4 in 1m23s on
run 30196467032 and again 4/4 in 1m21s on main (run 30196966887), image confirmed `system-images;android-34;default;x86_64`, **zero `Pixel Launcher`
references anywhere in the artifacts.** The absence is structural: a process that is not installed
cannot ANR. That is the claim; "stable over N runs" is not one green run's to make.

Progress is **unchanged at 31%** — B2 was already complete, and repairing a flaky gate is not a new
increment.

---

**B5 complete at its verifiable scope — and the onboarding gate was never a gate.**

**§8.4 operator resilience.** The runbook now states which of §8.4's mitigations exist (managed
platforms, the documentation set, the agent-friendly repo) and which do **not**: alerting that needs
no attention — there is no Sentry project, so crash-free sessions is unmeasured — and a plan to
contract specialist help, which MRD Risk §12 contemplates and nobody has arranged. Worst unattended
failure first: a crash affecting every user goes unnoticed, because users of a calm ritual app do not
file bug reports, they stop opening it.

**The onboarding gate.** `app/index.tsx` carried `const ONBOARDED = true` beneath a comment claiming
the flag was persisted "in the onboarding task". That task shipped the sign-in screens and never the
flag, so **SCR_AUTH_001 has never rendered from a cold launch in the app's history**, and B2 recorded
FLOW_ONBOARDING as unwritable because of it. The flag now persists through the shared `KeyValueStore`
seam; storage unavailable reads `false` (showing sign-in twice beats hiding the only auth entry
point); OTP marks it only after the anon→auth merge succeeds.

**FLOW_ONBOARDING — B2's sixth flow — is written**: cleared state, cold start, gate, skip, Today,
then relaunch *without* clearing and assert the user is not asked again. That second half is the
failure this repo has now had twice.

---

**B5 §8.2 — every ERR_* has a defined, tested calm behaviour.**

The i18n bundle had **three error strings for a taxonomy of 24 codes**; §8.2's "each `ERR_*` has a
defined calm behavior" was prose in PDD §12 that nothing enforced. `DEGRADATION_POLICIES` is that
table as data — surface, retry, queues, `blocksDailyLoop`, copy key, and the §12 row each entry
encodes — with an exhaustive test over `ERROR_CODES`, so a new code cannot enter the taxonomy
without a degradation decision, and every copy key must resolve in the bundle.

The tests assert the invariants rather than the table: **no failure blocks the daily loop** (P4);
the honest-decline codes deliberately offer **no retry** (a decline is correct, and "try again"
invites retrying into a fabricated answer); AI failures do retry; offline/sync failures queue;
location failures redirect to city entry rather than erroring; only genuinely uncaught failures take
the whole screen.

**Copy is PDD §13.5 verbatim, or absent — never invented.** §13.5 approves nine codes; the other
eleven fall back to the approved ERR_UNKNOWN string and are listed in `AWAITING_APPROVED_COPY`,
pinned by a test. **PDD owes copy for those eleven** — it is a documentation deliverable, and
writing plausible calm strings would both invent UX and hide the gap.

---

**B5 — Reliability & DR opened: runbooks exist, and the drill is mechanised.**

`docs/devops/DR_RUNBOOKS.md` covers §8.3's five scenarios (DB restore, region incident, Edge Function
outage, secret compromise, store outage) with literal commands from this repo. A monthly
`dr-drill.yml` builds from migrations + seed, does a `pg_dump` → `pg_restore --exit-on-error` round
trip, and re-runs the **same** invariants file against the restored database — catching what comes
back subtly wrong and looks healthy: missing tables, **RLS silently disabled**, absent policies,
post-v1 `FF_*` restored ON, `pgvector` gone, enums missing. It also runs on any PR touching
migrations or seed, so an un-restorable schema fails review rather than an incident. First run:
restore in **1s**, invariants OK both sides, seeded row counts equal.

⛔ **Stated, not buried: there is no PITR to restore from.** Both hosted projects are free-tier, so
**NFR-15's RPO ≤ 24 h / RTO ≤ 4 h is UNMET for user data** — schema and seed rebuild in minutes,
everything a user created does not. The runbook says plainly not to launch to real users in that
state. It is the same ~$25/month that closes B1.

---

**B4 — the sink receives more than errors. The North Star input fires.**

**B4.5 — EVT_* instrumentation (the daily habit funnel, PDD §11.4).** EVT_012 Today Viewed ·
EVT_015 Ritual Started · EVT_016 Step Advanced · **EVT_017 Ritual Completed** · EVT_018 Abandoned ·
EVT_019 Checklist Item Completed · EVT_020/021 Streak Advanced / Grace Used. Registry events only,
with §11.2's property schemas.

Ritual events are derived from view-model **transitions** by a pure mapper, not tracked at six call
sites: a screen that tracks inline double-fires the moment a re-render repeats a state, and for the
metric the North Star sums an inflated count is worse than none. Tests pin the three ways that goes
wrong — a repeated render, a restore mistaken for a start, a resume mistaken for a start.
EVT_020/021 fire from the **server's** streak, never a client guess.

**Defect fixed from B4.1:** EVT_054 carried `code`/`surface`; PDD §11.2 specifies
`error_code`/`screen_id`. Nothing would have caught it — `event_id` is a text column and `props` a
jsonb blob, so a wrong property name fails months later as a dashboard query returning nothing.

244 tests (+15), tsc clean, eslint 0 errors.

---

**B4 proper is 3 of 4 increments done, and blocked on an owner action, not on engineering.**

**B4.3 — the server seam and a release gate that can fail.** Edge Function errors now leave through
a `ServerTelemetry` port at `errorResponse()` (the one exit every ERR_* already shared), carrying the
function name and correlation id and **no message** — on the server an unknown error is usually a
library's, and a Postgres or fetch failure puts a query or a token in its text. preflight now
requires `SENTRY_DSN`/`SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` at the production tier
(proven: exit 1 unset, exit 0 set), and `release-build.yml` blocks a production build when Sentry is
unconfigured — a release with no crash reporting cannot be measured against NFR-06, which §10.1
gates on.

**The source-map upload is deliberately NOT wired.** Hermes maps must be uploaded from inside the
EAS build that produced the bundle (`@sentry/react-native`'s config plugin); maps from a separate
`expo export` belong to a different bundle, so uploading them gives symbolication that is
confidently wrong. The gate says so rather than a step pretending to upload.

⛔ **B4 stops here without a Sentry org + DSN** (free tier).

---

**B4.2 — the EVT_* analytics sink** (merged, PR #40).

**B4.2 — the EVT_* analytics sink.** `AnalyticsService` port + a batching implementation over the
`analytics_event` table (ADR-013; insert-only under RLS, no client read, rollups service-side).
Batches of 20, capped at 200 with oldest-first drop, flushed on backgrounding; a failed batch
re-queues ahead of newer events. The queue stays in memory — persisting user-behaviour data to disk
is what ADR-031 argues against, and a lost metric costs a row where a lost ritual session costs a
user their place.

Two guarantees are structural: props are primitives only (an object or array is how an error or a
server response would carry user content into the store), and an event id outside the PDD §11
EVT_* taxonomy is rejected, since `event_id` is only a text column and nothing downstream would
catch an invented event.

**`user_pseudo_id` is a device-minted random UUID**, never derived from the auth uid — no document
specified a derivation, so it is recorded as a decision. A reinstall mints a new id and two devices
count twice; the North Star groups EVT_017 by `household_id`, so it is unaffected.

**Every ERR_* now lands as EVT_054** in `analytics_event` — what §7.1 asked for and B4.1 could only
map. The crash reporter stays a separate destination, so error-rate reporting no longer waits on
Sentry. 229 tests (+24), tsc clean, eslint 0 errors.

---

**B4.1 — the telemetry seam** (earlier, merged as PR #39).

`TelemetryAdapter` port + `NullTelemetryAdapter` (deferred Sentry, mirroring NotificationAdapter and
PaymentAdapter); pure `toErrorCode()` / `toClientErrorEvent()` mapping every ERR_* to EVT_054 per
§7.1; both call sites wired — `ErrorBoundary.componentDidCatch` (replacing its TODO) and a global
`ErrorUtils` handler for throws no React tree is on the stack for. No PII by construction: an
unrecognised error yields `ERR_UNKNOWN` rather than its message, EVT_054's props are a closed
four-key shape, and `componentStack` is not forwarded. 205 tests (+29), tsc clean, eslint 0 errors.

**What it does not buy:** nothing is reported anywhere. `@sentry/react-native` is uninstalled and no
DSN is provisioned, so crash-free sessions (NFR-06) still cannot be measured and B4 cannot close on
the seam. `getTelemetryBackend()` returns `'none'`, and a DSN configured with no adapter warns —
because an app that reports nothing otherwise looks exactly like an app with no errors.

Still true after B4.2: **crash reports go nowhere.** EVT_054 now lands in `analytics_event`, so error
*rates* are measurable, but crash-free sessions (NFR-06, §7.2) still require a real reporter.

Next: **B4.3** — source-map upload (the item B3 deferred) + Edge Function Sentry.

---

Earlier the same session — the question that stood open for a week, does a ritual session survive a
process restart, was answered: **yes, now.** The path there:

1. **PR #35 — the E2E build was failing, disguised as a timeout.** The single-ABI run had failed in
   `assembleRelease` at ~11 min, then Gradle hung ~80 min until the 90-min job timeout killed it and
   it reported `cancelled` — the "gate goes dark" pathology, one layer down. Fixed: cap the build
   step with `timeout` + `--stacktrace`, and drop release-only work the emulator APK doesn't need
   (release lint + native-debug-metadata). Build then went green (~10 min) and the flows finally ran.

2. **The flow ran and caught a real bug.** `FLOW_SESSION_PERSISTENCE` failed: sessions did not
   survive a restart. Logcat proved the cause — **`react-native-mmkv@2.12.2` is incompatible with
   the New Architecture's bridgeless runtime**, so MMKV's JSI never installed, every instance threw,
   and `ritualSessionRepository` silently ran on its in-memory fallback. A dependency-version bug,
   not a storage-logic bug.

3. **PR #36 — the fix.** Upgrade `react-native-mmkv` v2→**v4.3.2** (Nitro line, bridgeless-compatible)
   + its `react-native-nitro-modules` peer; absorb the v4 API changes (`createMMKV()` factory,
   `delete`→`remove`) at the port boundary; jest mock so v4's eager nitro import doesn't crash suites.
   **E2E on a native build (run 30155737941): all three flows GREEN, `FLOW_SESSION_PERSISTENCE`
   PASSED.** MMKV v4 loads and persists under New Arch; no memory fallback.

Verified end-to-end. **PR #36 merged to main as `e1e10d4`**; the docs checkpoint followed as PR #37
(`45f1b0d`). Main's E2E is green again (run 30156615768). See TASK.md.

# Today's Objective

Session of 2026-08-02 (part 3). **Close B4.** Outcome: **B4 CLOSED at verifiable scope, 47% → 50%** —
the first slice completed since B6. Two SLOs proven end to end by deliberate trigger, the first of
which **failed at the notification step and would otherwise have shipped as configured**. Three
environment/deploy defects found on the way, all of the same shape. Next: **B1/B3 remainders** (all
owner-gated on money or store accounts), or **NFR-07** for a third SLO.

---

Session of 2026-08-02 (part 2). **Work the dependency queue, then confirm Sentry ingest.** Outcome:
nine dependency PRs resolved across three regenerating batches (#90 left open as real work), the
SDK-pin rule corrected to a **two-sided** check after #89 falsified last week's "the SDK 54 set is
complete", and **ingest confirmed — which found that CI had been reporting itself as production**,
fixed and merged as #98. The sharpest finding of the day: **#91 passed all five gates and had to**,
because no gate runs `sentry.gradle` at all — *ask which gate would have to fail*. The most
uncomfortable: **my own fix broke the suite 4/6**, and its unit tests passed against the broken
version because they exercised `process.env` while the bundler used `extra`.
**Progress unchanged at 47%; no Beta slice advanced.** Next: **B4.4** — the alert rules, now that
`environment:production` means something. Closing B4 takes the milestone to **50%**.

---

Session of 2026-08-02 (part 1). **Merge the verified work, then provision Sentry end to end.**
Outcome: **four PRs merged** — #84 (offline completion), #85 (SDK-pin third leak), #86 (durable
preference writes), #79 (Sentry) — and **Sentry is live and verified on device**:
`[telemetry] reporter=sentry` once per launch (12/12), with `AppLifecycleIntegration` installed, so
**crash-free sessions is measurable for the first time**. The session's general finding, arrived at
three times: **a durable queue guarantees DELIVERY, not DISPLAY.** The preference-durability defect
behind it had been misattributed **four times**, twice to a launch race and once to Sentry — which
is what blocked #79 across two sessions. **Progress unchanged at 47%; no Beta slice advanced.**
Next: confirm ingest in the dashboard, then **B4.4** (§7.2 dashboards + alerts).

---

Session of 2026-08-01. **Read the main baseline, then fix the offline-persistence race.** Outcome:
the baseline **clears Sentry** (main is 3 green / 3 red with no Sentry code, one red on a
config-and-docs-only commit), so #79's E2E blocker dissolves; and the race's recorded cause turned
out to be **wrong** — MMKV writes synchronously and the queue always reached disk, while nothing
re-derived it onto the rendered read model, which a throttled snapshot and an `onError` revert then
raced. Fixed on `fix/offline-completion-lost-on-kill` with a pure projection, two perturbations, and
a failure-proof radio teardown. **Progress unchanged at 47%.** Next: device verification, then the
PR, then merge #79.

---

Session of 2026-07-28 (parts 3–4, session end). **Resolve the deletion audit, then implement
Sentry.** Outcome: **ADR-034 (Proposed)** and the **SDK-pinned dependency rule** merged as #78 with
all six gates green; **Sentry built but held back on PR #79** behind two blockers — it is not
measurable as built (init happens only after the first error), and its one green E2E followed two
deterministic reds, which is not a verdict. The branch was **split** so the verified half could land
without the unverified half. **Progress unchanged at 47%.** Next: fix the startup-init defect and
get two consecutive green E2E runs.

---

Session of 2026-07-28 (part 3). **Resolve the deletion audit the TDD owes.** Outcome: **ADR-034,
Proposed** — the request record and the audit record have opposite lifetimes and cannot be one row,
so the ADR separates them, retires the unwritable `executed_at`, and refers the one genuinely
undecidable question (what identifies the subject of a completed erasure) to Security/Privacy with
Legal sign-off, recommending the digest form without choosing it. Also found: the contradiction was
**mis-cited in seven places** as "TDD Part 2 §5.1", which is actually Identity/Onboarding API
contracts — the real conflict is Part 5 §5.1 vs Part 2 §3.15, across two Parts. **Progress unchanged
at 47%**: a Proposed ADR opens a decision, it does not close one. Next: **owner ratification**.

---

Session of 2026-07-28 (part 2). **Execute the SDK-upgrade increment — and establish first whether it
is one.** Outcome: it is not. Checked against the installed peer graph, all three PRs are the same
defect — `.github/dependabot.yml` held the right rule and the wrong patterns — so #64, #65 and #75
are closed with their evidence and PR #78 extends the ignore list to the four SDK-pinned packages
(`react`, `@types/react`, `@expo/*`, `@babel/runtime`). The sharpest finding: **#64 and #65 passed
all five gates including the bundle gate**, while the peer-legal #75 was the only red — and its
recorded fix would have turned CI green while leaving RN's renderer mismatched. **Progress unchanged
at 47%.** Next: a credential-free Beta item — the **TDD resolution the deletion audit owes**.

---

Session of 2026-07-28 (part 1). **Split the seven non-SDK bumps out of #61.** Take the dependency queue from
five PRs — one of them a nine-package group red for a single SDK-pin reason — down to a coherent
set, without smuggling a React version bump past the SDK 54 baseline behind a linter update.
Outcome: PR #74 merged with all five gates green, `react`/`@types/react` untouched, and the queue
now three PRs that all cross the same pin and want one deliberate upgrade increment. **Progress
unchanged at 47%** — no Beta slice advanced. Next: **the SDK-upgrade increment** (#61's remainder,
#64, #65) behind a native build and the flows.

---

Session of 2026-07-27. **B6.3 — data inventory, privacy policy, store labels.** Build the
data-collection inventory from the code rather than the docs, then derive the policy draft and the
store answers from it. Outcome: three documents, the inventory pinned to the schema and the emitted
event set by a conformance test proven to fail four ways — and one launch blocker found, the
deletion right that records a request and never carries it out. **B6 complete at verifiable scope;
44% → 47%.** Next: **the account-deletion executor**, which is now the highest-value credential-free
engineering work in the milestone.

---

Session of 2026-07-26 (part 3). **Offline sync.** Close the launch blocker B6 surfaced: make the
mutation queue durable, drain it to SVC_sync, and persist the read cache so the daily loop is
genuinely usable offline rather than only documented as such. Outcome: implemented across six
modules with the drain rules pure and tested, two further defects found and guarded, four
perturbations proven to fail. No product scope. Next: **B6.3**.

---

Session of 2026-07-26 (part 2). **B6 — Security & Privacy.** The §5.2 OWASP Mobile Top 10 review,
performed against the app as built rather than as documented. It found two critical defects — the
auth session that never persisted, and SVC_account trusting the request body for identity — both now
fixed and each proven by reintroducing the defect and watching the test fail. CCPA export built;
§5.2's supply-chain controls closed. B6.3 (inventory, privacy policy, store labels) remains.

---

Session of 2026-07-26 (part 1). Establish what the E2E gate is actually reporting, and make it trustworthy.
Outcome: main was already green (the handoff was stale), PR #53 is verified, and the launcher-ANR
false-red — 3 of the last 4 failures — is removed at its cause by moving the emulator to the AOSP
system image (PR #55). No product scope. Next: **B6 — Security & Privacy**.

---

Session of 2026-07-25. Two things closed. First, the week-old question — does a ritual session
survive a restart — is **answered: yes, now** (fix the E2E build, read the verdict it produced, ship
the MMKV v2→v4 fix); **B2 is complete**. Second, **B4 opened** with its telemetry seam: errors now
leave the app through one port, at both call sites, with the EVT_054 mapping settled and no PII
possible by construction — while reporting nothing at all until a real adapter and a DSN land.

Then **B4 opened and reached its halfway point**: B4.1 gave errors one exit (the TelemetryAdapter
port at both call sites, EVT_054 mapping, no PII possible by construction), and B4.2 gave that
mapping somewhere to go — the AnalyticsService port over the `analytics_event` sink, with a
device-minted pseudonymous id and primitives-only props. Crash *reporting* is still deferred.

No new product scope.

# Overall Progress

| Area | Status |
|--------|--------|
| Product Research | ✅ |
| MRD | ✅ |
| PRD | ✅ |
| PDD | ✅ |
| TDD | ✅ |
| AI Knowledge Base | ✅ |
| Repository & Platform Foundation | ✅ |
| Backend Foundation (SVC_*) | ✅ (panchang engine blocked; SVC_household/notify/revenuecat pending) |
| Mobile — App Shell / Today / Ritual / Calendar / Ask Guru | ✅ M1–M5 |
| Mobile — Profile / Household | ✅ M6 |
| Mobile — Notifications | ✅ M7 |
| Mobile — Subscription | ✅ M8 |
| AI Platform | 🟡 adapters done; corpus + eval pending |
| Testing | 🟢 452 unit/component/domain (350 mobile + 102 vitest) + 43 pgTAP (17 RLS + 9 DB + **17 for the F-3 deletion executor**) + a monthly DR restore drill + **6 Maestro flows, all green** · bundle gate per PR · 🟢 **E2E green in CI** — **6/6** on a real native Android build (RETURNING · MORNING_RITUAL · SESSION_PERSISTENCE · AUTH_SESSION_PERSISTENCE · ONBOARDING · **OFFLINE_SYNC**) in 5m16s, run 30207484940 on `a05760d`, 2026-07-26. (The count read "4" until this session: FLOW_AUTH_SESSION_PERSISTENCE was added in B6 and never counted. `e2e.yml`'s echo is now DERIVED from the flows directory, so the count cannot drift again.); gate fails fast (PR #35) and the launcher-ANR false-red is removed at its cause (PR #55 — `hide_error_dialogs` alone had stopped being sufficient) · AI-eval de-declared (owed: §9.4 harness); api-contract restored |
| Beta | 🚧 In progress — **B2 ✅**; **B5 ✅ at verifiable scope** (NFR-15 blocked on PITR — a purchase); **B6 ✅ at verifiable scope** (OWASP review ✅ · CCPA export + SVC_account authz ✅ · B6.3 inventory/policy/labels ✅ · §5.2 controls ✅ — ⛔ **but deletion is never executed**, an engineering-closable launch blocker); **B4 🟡 ~75%** (owner-gated on a Sentry org); B1/B3 owner-gated; B7–B8 pending |
| Production | ⏳ |

---

# Current Priorities

1. ~~**⛔ Account deletion is never executed**~~ — **CLOSED 2026-07-27 at engineering scope.** The
   executor, the sweep, the schedule, the operator trigger and 17 pgTAP assertions all exist, and
   **`pg_cron` is now enabled and confirmed on both hosted projects**, so the sweep runs daily
   rather than only when an operator triggers it. **One residual:** `executed_at` is unwritable
   because the audit row cascades with its own subject. **Now opened as ADR-034 (Proposed,
   2026-07-28)** and awaiting owner ratification — Security/Privacy on what identifies the subject
   of a completed erasure, Legal on the retention obligation. No schema change until then.
   Still open separately: **Apple 5.1.1(v) requires an in-app deletion screen**, which needs a PDD
   affordance and SVC_household for ownership transfer.
2. ~~**B6.3 — data inventory, privacy policy, store labels**~~ — **DONE 2026-07-27.** Three
   documents in `docs/devops/`, the inventory pinned to the schema and the emitted `EVT_*` set by a
   conformance test. Nothing is legally reviewed; that is owner/legal work.
3. ~~**⛔ Offline sync is not implemented**~~ — **CLOSED 2026-07-26.** The queue is persisted,
   drained and dequeued; the §6.1 read cache is persisted too. Residual, and honest: it has never
   run against a live backend, and there is no `FLOW_OFFLINE_SYNC` Maestro flow — the class of gap
   a real flow caught for MMKV and unit tests cannot.
3. **Owner: create a Sentry org + DSN (free tier)** — B4's remaining work (source-map upload, §7.2 dashboards/alerts) needs a real project to be verifiable. B4.1 ✅ · B4.2 ✅ · B4.3 ✅ to its credential-free limit · B4.4 blocked.
2. **PDD owes approved copy for eleven ERR_* codes** (listed in `AWAITING_APPROVED_COPY`) — they currently show the calm generic message where §12 specifies something more useful.
3. **Credential-free engineering: start B6 — Security & Privacy** (§5/§6) — OWASP Mobile review, CCPA export/delete verified end to end (F-3/F-10), store privacy labels. B5 is complete and `FLOW_ONBOARDING` is written and green, so this is the next unstarted slice.
3. Owner decisions: prod Supabase (~$25/mo, closes B1) · Apple $99 (iOS) · Google Play $25 (internal track)
3. ⛔ Canonical Panchang Engine decision (ADR-033) — unblocks Today panchang, Calendar markers, notifications
3. AI corpus ingestion + eval readiness — unblocks live Ask Guru (GURU_LIVE)
4. Backend Edge Functions: SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook (client contracts coded)
5. Apply migrations to a live Supabase project + integration run
6. E2E (Maestro FLOW_*) + first live CI run

---

# Active Branch

main

---

# Blockers

✅ **Resolved (2026-07-27): `pg_cron` is enabled on both hosted projects and confirmed** — staging
through CD (`account_deletion_sweep_is_scheduled()` returns true and the ⚠️ annotation is gone) and
dev through a dispatched `dev-migrate`. It is the **first scheduled job that has ever run in this
project**. (This entry read "🟡 owner action pending" until 2026-07-28; it had been done the day it
was written. A blocker list is only useful if it is closed as promptly as it is opened.)
There is no prod project to enable it on yet — the free tier allows two, and both are used.

⛔ **No job runner processes the `job` table.** `analytics_rollup` and `notify_schedule` remain enum
values with no consumer, so analytics never roll up or prune, personal-date tombstones are never
removed, and `panchang_cache` has no TTL. The deletion sweep proved the scheduling mechanism; the
general worker pattern ADR-025 describes is still unbuilt.

⛔ Canonical Panchang Engine (ADR-033, Proposed): astronomical algorithm undocumented — panchang
compute, Calendar/festival markers, and sunrise/tithi notifications stay unavailable until Part B
is ratified. Everything else is unblocked. See docs/architecture/canonical-panchang-engine/.

🔒 Ask Guru live answers are gated OFF (GURU_LIVE=false) until reviewed corpus + eval readiness
(TDD Part 3 §9/§10B). The client is complete; flipping the flag goes live.

ℹ️ Vendor deps deferred: `expo-notifications` (M7) and `react-native-purchases` (M8) are not yet
installed. Their adapters ship as pure ports + Null impls; concrete adapters are one-line swaps once
the deps + keys land on the Mac. (The lockfile *can* be regenerated here — proven 2026-07-18 by the
SDK 54 upgrade — so this deferral is now a choice, not a constraint.)

⚠️ Platform re-baselined to **Expo SDK 54 / RN 0.81 / React 19 / New Architecture** on
`chore/expo-sdk-54-upgrade` (unmerged). Verified by bundling, 121 tests, and Expo Go on device;
**not** verified against a native build — no Xcode here. B3 is the first real test.

✅ Resolved (2026-07-25): the `react-native-mmkv` defect. Two layers — (1) it threw in Expo Go / on
absent native modules, handled since PR #24 by the `KeyValueStore` port degrading to memory rather
than crashing; (2) the deeper bug the working E2E gate exposed — **mmkv v2 is incompatible with the
New Architecture (bridgeless)**, so it degraded to memory even on a native build and ritual sessions
never persisted. Fixed by the v2→v4 upgrade (PR #36), verified by a green FLOW_SESSION_PERSISTENCE on
a native emulator build. The repositories-throw-on-absent-config defect alongside it was already
resolved (PR #14).

---

# Next Deliverable

**Engineering: close both Sentry blockers together on `feat/sentry-telemetry` (PR #79).** Resolve
the telemetry adapter once at startup in AppProviders — with a test that fails when that resolution
is removed — then re-run E2E for **two consecutive greens**. They are one task because the fix
changes when Sentry's network instrumentation installs, which is the leading suspect for the
deterministic red.

**Then owner action: a free-tier Sentry org + DSN.** Everything else in B4 is built; without a DSN
the adapter resolves to Null, nothing has been observed reaching Sentry, and B4.4 (SLO dashboards +
alerts) cannot start.

⚠️ **Also worth an hour: install a JDK 17.** Only JDK 26 is present and Kotlin's version parser
rejects `"26.0.1"`, so local Gradle builds fail before compiling. That is why this session's two
Sentry defects cost CI round trips instead of minutes.

**Then: ratify ADR-034** — Security/Privacy on what identifies the subject of a completed
erasure, Legal on whether a records-of-request retention obligation applies and for how long. The
implementation behind it is small and entirely blocked on that answer; building the recommended
option first would be inventing the privacy decision the ADR exists to surface.

**Credential-free engineering is now genuinely thin, and that is worth stating plainly rather than
filling with hygiene work.** Still blocked, deliberately: the **in-app deletion screen** Apple
5.1.1(v) requires needs a PDD affordance and SVC_household; the **`job` table worker** stays unbuilt
because every `job_type` is blocked on a product or vendor decision; **PDD owes approved copy for
eleven ERR_* codes**. What remains in the milestone is largely owner-gated — a Sentry org (free
tier) closes B4, a paid Supabase plan (~$25/mo) closes B1 *and* makes NFR-15 achievable, and Apple
($99) + Google Play ($25) close most of B3.

(**The "SDK-upgrade increment" that stood here is retired.** Investigated 2026-07-28: the three PRs
were not an increment but a gap in `.github/dependabot.yml`'s patterns, and none belonged on SDK 54.
All three are closed and the ignore list now covers the four SDK-pinned packages — PR #78. A real
Expo SDK upgrade remains future work, is not a milestone deliverable, and when it happens it must
still be validated by a native build plus the six Maestro flows, because that is the only method that
has ever caught this class of change here.)

(`pg_cron` is no longer a blocker — it was enabled and confirmed on both hosted projects on
2026-07-27, and is the first scheduled job that has ever run in this project.)

Then, credential-free: the **`job` table worker** ADR-025 specifies — investigated on 2026-07-27 and
deliberately not built, because every `job_type` is blocked on a product or vendor decision and it
would be a mechanism with nothing to process; the **TDD resolution** the deletion audit owes; and
the **in-app deletion screen** Apple 5.1.1(v) requires, which needs a PDD affordance and
SVC_household first.

Two owner purchases still gate reliability itself, not just convenience: **a Sentry org + DSN** (free
tier) closes B4, and **a paid Supabase plan** (~$25/mo) closes B1 *and* makes NFR-15 achievable — no
PITR means no recovery of user data. B1/B3 remainders stay owner-gated: prod Supabase (~$25/mo)
closes B1; Apple ($99) + Google Play ($25) close most of B3.

---

# After Current Deliverable

B2 E2E → B3 builds/distribution → B4 observability → B5 DR → B6 security/privacy → B7 release
mechanics → B8 go/no-go → phased production release (US/AU/NZ)

---

# Documentation Status

MRD ✅ Approved · PRD ✅ Approved · PDD ✅ Approved · TDD ✅ Approved · Architecture Stable ✅ Yes

---

# Architecture Snapshot

Frontend: React Native + Expo (Expo Router, Zustand, TanStack Query)
Backend: Supabase (Postgres + RLS + Edge Functions)
AI: GPT-5 mini + RAG (behind adapters; live answers gated)
Payments: RevenueCat (behind PaymentAdapter; entitlement household-grain, read-only on device)
State: Zustand + TanStack Query

---

# Startup Checklist

Before coding: read PROJECT_MEMORY.md · CURRENT_MILESTONE.md · SESSION.md · TASK.md · ARCHITECTURE_SUMMARY.md.
Only retrieve additional documentation if required.

---

# Increment / Milestone Completion Checklist

Run this at EVERY increment or milestone boundary — not only at End Session (see the Increment &
Milestone Completion Checkpoint in CLAUDE.md):

□ Update DASHBOARD.md (progress %, current task/objective) · □ Update PROJECT_STATUS.md ·
□ Update CURRENT_MILESTONE.md (slice/increment status) · □ Update IMPLEMENTATION_ROADMAP.md ("where we are")
□ Update SESSION.md · □ Update TASK.md · □ Keep the progress % identical across DASHBOARD / PROJECT_STATUS / CURRENT_MILESTONE
□ Update DECISIONS.md (only if a permanent decision was made) · □ Update PROJECT_MEMORY.md (only if permanent knowledge changed)

# End Session Checklist

□ Update SESSION.md · □ Update PROJECT_STATUS.md · □ Update TASK.md · □ Update DECISIONS.md (if needed)
□ Update PROJECT_MEMORY.md (only if permanent knowledge changed) · □ Recommend next task

---

# Executive Summary

Documentation and architecture are frozen. The repository, platform foundation, backend SVC_*, and
**the full Mobile MVP (M1–M8)** are complete and merged to main. The project is now in **Beta
Readiness & Platform Hardening** (TDD Part 5), sliced B1–B8: environments, E2E, builds,
observability, DR, security/privacy, release mechanics, and go/no-go.

The defining issue at the start of this milestone is that CD's green status overstates what is
actually verified. Four gates checked nothing; two of them (AI eval subset, API/zod contract) were
**de-declared** in B1 rather than left green, and CD's Maestro E2E and EAS build remain placeholders
for B2/B3. Preflight, contrary to the milestone's original claim, already fails closed. CI now runs a
real bundle gate. The only architectural blocker is the Canonical Panchang Engine
decision (ADR-033); Ask Guru live answers are intentionally gated until corpus/eval readiness.
