# CURRENT_MILESTONE.md

# PanchangPal — Current Milestone

Version: 3.0.0

Last Updated: 2026-07-18 (milestone opened)

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

0% (0 of 8 slices complete)

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

The organizing risk: **CD reports green while much of it verifies nothing.** Staging migrations and
Edge Function deploys are genuinely real; four gates are not.

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
| **App bundles at all** | ⚠️ **Was broken until 2026-07-18** — no CI gate invokes Metro (see Execution Gap below) |
| **App runs on a device** | ⚠️ **First ever run 2026-07-18**, Expo Go + local Supabase |
| **Local backend bring-up** | ⚠️ **Was impossible until 2026-07-18** — `supabase start` always rolled back |
| Maestro E2E (FLOW_*) | 🚫 **De-declared** 2026-07-18 — was an `echo`; still no specs, no `.maestro/`. B2 restores it |
| EAS build / distribution | 🟡 `eas.json` + 3 profiles + Hermes landed (B3); CD job de-declared pending credentials |
| Production promotion / OTA | 🔴 **Now fail loudly** — both previously reported success while deploying nothing |
| Preflight secret checks | ✅ **Already fail-closed** (exits 1) — the earlier "warns then exit 0" claim was wrong; see Corrected Premise below |
| **AI eval subset gate** | 🚫 **De-declared** 2026-07-18 — was an `echo`. Restore when the Part 3 §9.4 harness lands |
| **API / zod contract gate** | 🚫 **De-declared** 2026-07-18 — was `--passWithNoTests` against a package with no tests. Owed: real contract tests under `packages/api` |
| **CI bundle gate** | ✅ Added 2026-07-18 (B1) — `expo export` ios+android, 55s; proven to fail on a reintroduced defect |
| dev / prod environments | ❔ Unconfirmed — only staging is proven by a green run |
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
| B1 | Environments & secrets | dev/staging/prod projects, per-env secrets, fail-closed preflight (§1, §4) | ⏳ |
| B2 | E2E verification | **bundle/build gate in CI** + real Maestro FLOW_* replacing the stub; green on staging (§2.2, §10.1) | ⏳ |
| B3 | Build & distribution | eas.json profiles, Hermes, signing, source maps, TestFlight / Play Internal (§2.3) | 🟡 config done; blocked on accounts |
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

- **False-green CI/CD** — the top risk, and confirmed materially worse than first scoped. Beyond the
  placeholder jobs, **CI has never executed the app at all**: six defects (three of them
  bundle-blocking) accumulated across M1–M8 behind a fully green pipeline. See the Execution Gap
  section. B1 and B2 close this first; B2 now carries a bundle gate.
- **Untriaged defects found while demoing (2026-07-18)** — two remain open:
  - **Repositories throw on absent config.** Nine `src/data/` repositories default-construct with
    `getSupabase()`, so a misconfigured build fails during route module evaluation and shows
    "Page could not be found" rather than a calm error state — poor against the trust-first and
    offline-first principles, and a fail-*obscure* rather than fail-closed behaviour that B1 cares
    about. Fix is to generalize the lazy `??=` already present in `authRepository.ts:30`.
  - **`react-native-mmkv` is unavailable in Expo Go**, so the Ritual screen crashes there at any SDK
    version. It sits behind the `KeyValueStore` port in `ritualSessionRepository.ts:7`, so an
    Expo Go-compatible fallback is contained — but a development build (B3) removes the constraint
    entirely and is the better answer if EAS lands first.
- **SDK 54 native runtime unverified** — the platform was re-baselined to Expo 54 / RN 0.81 /
  React 19 with the New Architecture default, verified only through bundling, tests, and Expo Go.
  No simulator or native build has exercised it. B3 is the first real test.
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
