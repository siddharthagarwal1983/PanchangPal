# CURRENT_MILESTONE.md

# PanchangPal — Current Milestone

Version: 3.1.0

Last Updated: 2026-07-19 (B1/B2/B3 substantially built and verified)

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

0% (0 of 8 slices COMPLETE — B1 ~85%, B2 ~85%, B3 ~80%)

A slice counts only when done. Three are most of the way there, and every remaining item in them
is gated on money, a store account, or a later slice — not on engineering. The number stayed at 0
through a very productive day, which is the honest reading.

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

- **API contract tests** — real tests under `packages/api/src/contracts/*` validating the zod schemas
  against `docs/api/openapi.yaml` (ADR-032). No workflow change needed to restore the gate: the root
  vitest config already includes `packages/**/*.test.ts`, so they will run in `unit-component-a11y`.
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

### B2 — E2E verification · ~85%
Done: Maestro 2.6.1; `tests/flows/FLOW_RETURNING.yaml` (23 steps) and
`tests/flows/FLOW_MORNING_RITUAL.yaml` (14 steps), both green locally on arm64 and in CI on
x86_64; `e2e.yml` builds the APK in CI and runs the flows on an emulator — **2/2 passed in 46s on
its first run**.
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
| `api-contract` | ci.yml | de-declared (B1) |
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
| B2 | E2E verification | bundle gate (done in B1) + Maestro FLOW_*; green in CI (§2.2, §10.1) | 🟡 ~85% — 2 flows green; 3 blocked by backend/vendor gaps |
| B3 | Build & distribution | eas.json profiles, Hermes, signing, source maps, TestFlight / Play Internal (§2.3) | 🟡 ~80% — automated builds work; store accounts + Sentry (B4) remain |
| B4 | Observability | Sentry, telemetry, SLO dashboards + alerts (§7) | ⏳ |
| B5 | Reliability & DR | backups, restore drill, runbooks, graceful degradation (§8) | ⏳ |
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
  - **`react-native-mmkv` is unavailable in Expo Go**, so the Ritual screen crashes there at any SDK
    version. It sits behind the `KeyValueStore` port in `ritualSessionRepository.ts:7`, so an
    Expo Go-compatible fallback is contained — but a development build (B3) removes the constraint
    entirely and is the better answer if EAS lands first.
- ~~**SDK 54 native runtime unverified**~~ — **CLOSED 2026-07-19.** Three Android APKs built and
  run; the New Architecture works natively. iOS remains unbuilt (no Apple membership), so that
  half of the baseline is still unproven.
- **Session persistence is unverified — but no longer unobservable.** Completing a ritual,
  force-stopping, and reopening shows the intro again. The two causes used to be indistinguishable
  from outside: either MMKV is not persisting, or `RitualSessionRepository`'s in-memory fallback
  engaged silently. PR #24 closed the observability half — the app logs when it degrades and
  `getStorageBackend()` (`src/data/ritualSessionRepository.ts:38`) reports the active backend, so
  the two causes are now distinguishable. What remains is the verification itself: nobody has
  confirmed a session survives a restart. **This is the last free engineering item.**
- ~~**Seven `src/data` repositories still throw on absent config.**~~ **Resolved** (PR #14). All ten
  use the lazy `(this._db ??= getSupabase())` getter; the default-parameter pattern is gone, and
  `repository-construction.test.ts` guards against its return.
- ~~**Postgres version drift.**~~ **Resolved** (PR #28). CI runs `pgvector/pgvector:pg17` with
  `postgresql-17-pgtap`, matching dev (17.6.1.147) and staging (17.6.1.141) — both confirmed engine
  17 against the Supabase Management API. The gate now tests what the environments actually run.
- **Onboarding is unreachable and therefore untested** — `app/index.tsx` hardcodes
  `ONBOARDED = true`, so SCR_ONBOARDING_* never renders from launch.
- **Deferred vendor deps** — `react-native-purchases` and `expo-notifications` are still uninstalled;
  purchase and push flows cannot be verified end-to-end until they land on the Mac with keys. Their
  Null adapters keep the app honest but leave those paths E2E-untested.
- **ADR-033 unratified** — constrains what a beta can demonstrate (no panchang, no sunrise/tithi
  notifications).
- **Single-founder resilience (TRISK-11)** — runbooks and DR are the mitigation; B5 is not optional.
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
