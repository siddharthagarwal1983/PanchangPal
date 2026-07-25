# CURRENT_MILESTONE.md

# PanchangPal — Current Milestone

Version: 3.6.0

Last Updated: 2026-07-25 (B5 opened — runbooks + drill; the PITR gap is now explicit)

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

25% (1 of 8 slices COMPLETE — **B2 ✅** — plus 3 of B4's 4 and 1 of B5's 3; B1 ~85%, B3 ~80%)

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

Remaining, and NOT achievable within B2: `FLOW_ONBOARDING` is unreachable because
`app/index.tsx` hardcodes `ONBOARDED = true`; `FLOW_HOUSEHOLD_INVITE` needs the unimplemented
`SVC_household`; the subscription path can only assert "unavailable" while
`react-native-purchases` is deferred; `FLOW_ASK_GURU` can only exercise the gated path.

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
| B2 | E2E verification | bundle gate (done in B1) + Maestro FLOW_*; green in CI (§2.2, §10.1) | ✅ COMPLETE (2026-07-25) — bundle gate + 3 in-scope flows GREEN in CI on a native build (incl. FLOW_SESSION_PERSISTENCE); other 3 flows blocked on other slices/backends/gated feature |
| B3 | Build & distribution | eas.json profiles, Hermes, signing, source maps, TestFlight / Play Internal (§2.3) | 🟡 ~80% — automated builds work; store accounts + Sentry (B4) remain |
| B4 | Observability | Sentry, telemetry, SLO dashboards + alerts (§7) | 🟡 ~75% — B4.1 seam ✅ · B4.2 sink ✅ · B4.3 server seam + prod release gate ✅ · EVT_* daily-habit funnel now emitting (§11.4, incl. the North Star input EVT_017); **upload + B4.4 owner-gated on a Sentry org (free tier)** |
| B5 | Reliability & DR | backups, restore drill, runbooks, graceful degradation (§8) | 🟡 ~33% — runbooks (§8.3) + a mechanised restore drill ✅; **PITR undrillable on the free tier, so NFR-15 is UNMET for user data**; §8.2 degradation verification pending |
| B6 | Security & privacy | OWASP Mobile review, CCPA export/delete verification, store privacy labels (§5, §6) | ⏳ |
| B7 | Release management | versioning/trains, OTA policy + channels, staged rollout, rollback verification (§3) | ⏳ |
| B8 | Go/no-go & launch | §10.1 checklist execution, internal → beta cohort, sign-off | ⏳ |

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
      - [ ] §8.2 graceful degradation verified end to end; §8.4 single-founder mitigations recorded.
- [ ] **B6** — OWASP Mobile review completed; CCPA export/delete verified end-to-end (F-3/F-10);
      privacy policy + store privacy labels accurate.
- [ ] **B7** — version trains, OTA channels (`staging`/`prod`) with runtime-version binding and
      crash-spike auto-rollback; rollback paths verified (§3.4).
- [ ] **B8** — the §10.1 checklist walked; internal smoke on TestFlight/Play Internal; beta cohort.

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
- ~~**Session persistence unverified.**~~ **VERIFIED 2026-07-25.** `FLOW_SESSION_PERSISTENCE`
  (PR #32) — complete the ritual, `stopApp`, relaunch, assert `Done for today`, with `adb logcat`
  captured so the two candidate causes are separable — finally executed once the E2E build was fixed
  (PR #35). It first failed, correctly: logcat showed the "Persistent storage unavailable" fallback,
  i.e. MMKV was degrading to memory (mmkv v2 vs New Arch). After the v2→v4 fix (PR #36), the flow
  PASSES with no fallback (run 30155737941). Sessions now survive a restart. The domain logic was
  never the suspect — `advanceSession` leaves `stepIndex` on the last step, so a completed session
  restores as completed; the store was the problem.
- **⚠️ The E2E gate produced two FALSE REDS on 2026-07-25 (fixed, PR #41).** After B4.1 merged it
  reported 3/3 flows failed, and the re-run failed identically — a `"Pixel Launcher isn't responding"`
  dialog from the emulator's own Google apps covered the app while Maestro asserted, with logcat
  showing the app healthy throughout. Fixed with `hide_error_dialogs`; verified 3/3 green in 1m18s
  (run 30165186141). The mechanism is the mirror of the outage below: **a false red costs what a
  false green costs** — the first occurrence was dismissed as a flake, so the second had to be
  diagnosed from scratch before it could be dismissed, and the next would have been blamed on
  whatever had just merged.
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
- **Onboarding is unreachable and therefore untested** — `app/index.tsx` hardcodes
  `ONBOARDED = true`, so SCR_ONBOARDING_* never renders from launch.
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
