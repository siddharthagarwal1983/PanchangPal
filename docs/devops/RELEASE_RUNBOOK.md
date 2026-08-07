# Release & Rollback Runbook — PanchangPal

**Covers:** TDD Part 5 §2.4 (OTA policy), §3.1 (versioning & trains), §3.4 (rollback strategy).
**Companion to** `DR_RUNBOOKS.md`, which covers §8.3 *disaster* recovery — data loss, region
incidents, secret compromise. This document covers *release* recovery: a change we shipped is bad and
must be undone.

**Owner:** the operator on duty (solo founder — see §8.4 / DR_RUNBOOKS §7).

---

## 0. The honest state of this runbook

Written during B7.1 (2026-08-07). **Read this section before trusting anything below**, because the
difference between "documented" and "performed" is the whole reason this milestone exists.

| Rollback path | Mechanism exists | Ever performed |
|---|---|---|
| **JS / OTA** — roll back to prior update | ✅ `ota.yml` → `action: rollback` | ✅ **yes — staging, 2026-08-07** |
| **Feature** — disable an `FF_*` flag | ✅ `feature_flag` table, fail-closed client seam | ⛔ **blocked, not skipped** — see §3 |
| **Edge Function** — redeploy prior version | ✅ CD deploys are real | ✅ **yes — staging, 2026-08-07** |
| **AI** — revert to prior `AISET` bundle | ❌ no bundle exists | ❌ blocked: no corpus, `GURU_LIVE=false` |
| **DB migration** — compensating migration | ✅ forward-only + expand/contract | ❌ never |
| **DB migration** — PITR | ❌ **NOT AVAILABLE** (free tier, NFR-15) | ❌ launch blocker |
| **Native binary** — halt phased rollout | ❌ needs a store presence | ❌ blocked on store accounts |

**Nothing here should be read as "we can roll back."** Three of the seven paths have no mechanism at
all, and **two** have now been exercised — the OTA path and the Edge Function path, both on staging. That is the accurate position and it is written down so a
go/no-go decision is made against reality rather than against a runbook's existence.

**What "performed" means for the OTA row** (the Edge Function row is described in §4): on 2026-08-07 an update was
published to the `staging` channel and then rolled back through this workflow — twice, plus a third
run after the branch resolution was simplified. Runs `31166287897` (publish, group
`1d67a505…`) and `31166824122` (rollback, `✔ Republished update group`, zero warnings).
⚠️ **It has NOT been proven to reach a device.** No EAS build exists for the channel, so the publish
job's own reachability check reported **0 matching builds** — correctly. What is proven is that the
mechanism runs, resolves the right update, and republishes it. Delivery to an installed app is a
separate claim and is not yet made.

---

## 1. Decide which surface changed

§3.4's rule is that the rollback path depends on the change surface, and most regressions unwind
**without a store release**. Work down this list; the first match is the path.

1. **Did the app's JS change and nothing native?** → OTA rollback (§2).
2. **Is the bad behaviour behind an `FF_*` flag?** → disable the flag (§3). Fastest of all: no
   deploy, no publish, effective on the next flag read.
3. **Did an Edge Function change?** → redeploy the prior version (§4).
4. **Did a migration change the schema?** → compensating migration (§5). **PITR is not available.**
5. **Is it in the native binary?** → halt the phased rollout and expedite a fix build (§6).

If two apply, unwind the **cheapest reversible one first** — a flag before an OTA, an OTA before a
function redeploy — and only then decide whether the deeper one is still needed.

---

## 2. JS / OTA rollback

**Mechanism.** `.github/workflows/ota.yml`, dispatched with `action: rollback` and the channel.

It resolves the channel's branch and its latest update group itself, because
`eas update:rollback` requires an explicit group id in non-interactive mode and an incident is the
worst moment to be looking one up. `eas update:rollback` republishes the update *before* the latest;
if there is none, it rolls back to the update embedded in the build, which is the correct terminal
behaviour.

```
Actions → OTA → Run workflow
  channel: staging | production
  action:  rollback
```

**Then verify metrics recover** (§3.4 ends every path at *verify*, then a blameless postmortem).
Crash-free sessions and users are live and alerting — NFR-06 and NFR-07 were each proven to reach a
human (B4.4). Watch those, not the dashboard's absence of noise.

⚠️ **A published OTA can reach nobody, and only one thing will tell you.** `runtimeVersion` uses the
`fingerprint` policy, so an update is delivered only to builds whose native fingerprint matches. That
is what mechanically enforces §2.4's "no native changes over OTA" — and it means a publish can
succeed while no installed app ever receives it. The publish job prints **"Finished builds on this
channel with a matching runtime version"** and warns when it is zero. **If a rollback appears to do
nothing, check that number before assuming the rollback failed.**

⚠️ **An OTA rollback cannot fix a native crash.** If the regression is in the binary, §6 applies.

---

## 3. Feature flag disable

**Mechanism.** The `feature_flag` table (ADR-021, public-select), read through
`featureFlagRepository` + `HOOK_useFeatureFlag`, cached at launch and Realtime-invalidated.

```sql
update feature_flag set enabled = false where key = 'FF_...';
```

**Why this is the first thing to reach for.** Flags **fail closed** — loading, error, an absent key
and a non-boolean value all read `false` — so disabling one cannot leave a client in a half-on state,
and clients pick it up via Realtime without a release.

**Its limit, stated:** only post-v1 scope is behind `FF_*` (`FF_GREETING_CARD`, `FF_JAIN_MODE`,
`FF_FAMILY_PLAN`, `FF_LIFECYCLE_EMAIL`). **The daily loop is never gated (P4)**, so a regression in
Today, the ritual, or the checklist has no flag to pull — that is deliberate product design, not an
oversight, and it means §2 or §6 is the path for the core experience.

⛔ **BLOCKED, AND THE DISTINCTION MATTERS — this is not "we haven't got round to it."**
`FF_FAMILY_PLAN` gates exactly one thing: the Family **offering**, via `visibleOfferings`, which
filters `o.kind !== 'family'`. **`react-native-purchases` is not installed**, so `NullPaymentAdapter`
returns no offerings — and filtering an empty list yields an empty list whether the flag is on or
off. The disable is therefore **unobservable end to end**, and would stay so even if the SDK were
installed, because `getOfferings()` returns offerings a *store* defines and there is no Apple ($99/yr)
or Play ($25) account with configured IAP products.
**All four flags also seed `false`** (`apps/backend/seed/seed.sql`), so a "disable" drill would have
to enable one first. Attempting it today would write to staging and demonstrate nothing.
**Revisit when the store accounts land** — the same increment that installs the payments SDK, which
must also move E2E back to a `google_apis` emulator image and reintroduces the Pixel Launcher ANR
risk (`e2e.yml` says so at its `target:`).

---

## 4. Edge Function rollback

**Mechanism.** Re-run CD's deploy from the last-good commit. `cd.yml` passes an explicit function
name list to `supabase functions deploy`.

```bash
git tag rollback-<sha> <last-good-sha> && git push origin rollback-<sha>
gh workflow run cd.yml --ref rollback-<sha>     # leave `promote` FALSE
# …verify, then restore:
gh workflow run cd.yml --ref main
git push origin --delete rollback-<sha>
```

A tag is needed because `gh workflow run --ref` takes a branch or tag, not a bare SHA. **Do not name
it `v*`** — that triggers `release-build.yml`.

✅ **PERFORMED — staging, 2026-08-07.** Runs `31169545892` (rolled back to `96ac23f`, seven functions
redeployed from the older commit) and `31169842290` (restored all eight from `main`). This is the row
DR_RUNBOOKS §6 had recorded as never exercised since 2026-07-25.
⚠️ **What that proves and does not:** a prior version can be redeployed on demand. It is not a
behavioural diff — the two commits had no observable difference in a deployed function, so "the older
code is serving" rests on the deploy log naming the older SHA, not on a response changing.

⚠️ **`migrate-staging` runs first and that is safe** — migrations are forward-only, so dispatching an
older commit replays a strict subset and the newer migration is simply not re-run. It does **not**
undo anything. Confirmed in the drill: the migrate job succeeded as a no-op.

⛔ **BEFORE 2026-08-07, A MANUAL CD DISPATCH COULD NEVER REPORT GREEN — READ THIS IF YOU SEE AN OLD
RED RUN.** `promote-production` fails by design (it once reported a completed promotion while
deploying nothing) and used to run on *every* dispatch. So a **successful** rollback produced a
**red** run, and the obvious reading mid-incident — "the rollback failed" — was wrong. Fixed by
gating that job behind an explicit `promote` input, default false; the fail-loud behaviour is
unchanged when promotion is actually requested. **On any run predating this, judge the rollback by
the `Deploy Edge Functions (SVC_*) → staging` job, never by the run's colour.**

⚠️ **The deploy list is hardcoded and has been wrong before** — `health` was missing from it, which
would have merged green and served nothing (fixed 2026-08-02, pinned by
`tests/rls/edge-function-deploy-list.test.ts`). **Check the list covers the function you are rolling
back**, or the redeploy will silently not touch it. Note also that `supabase functions deploy <list>`
deploys only the named functions — it does **not** delete ones absent from the list, which is why
rolling back to a commit predating `health` leaves `/health` (and NFR-14's probe) untouched.

---

## 5. Database rollback

**Forward-only, expand-then-contract** (TDD Part 2 §6.1). There is no "down" migration; recovery is a
*new* compensating migration.

⛔ **PITR IS NOT AVAILABLE.** Supabase point-in-time recovery is a paid-plan feature and the projects
are free-tier, so **NFR-15 is not met**: schema and seed rebuild from the repo in minutes while user
data is unrecoverable. This is a stated launch blocker, not a rollback path. Until it is bought, a
destructive migration against real user data has **no recovery**.

The monthly restore drill (`dr-drill.yml`) proves the repo can rebuild a database; it does not prove
anything about recovering user data, and must not be read as if it did.

---

## 6. Native binary — halt and expedite

**Blocked on a store presence.** Phased rollout percentages live in the Play Console / App Store
Connect, and neither account exists (Play $25, Apple $99/yr). When they do:

1. **Halt the staged rollout** at its current percentage.
2. Decide whether the fix is JS-only. If it is, §2 is faster than a new binary and reaches users
   already on the bad build.
3. Otherwise expedite a fix build and resume the rollout from the lowest stage.

§3.2 requires stages — internal → beta/canary → phased store (10% → 50% → 100%) — with crash-free,
error-rate and key-funnel monitoring **between** stages. Until the store accounts exist, "staged
rollout" is a plan rather than a capability, and this runbook says so rather than implying otherwise.

---

## 7. Versioning & release trains (§3.1)

- **Semantic versioning** per PDD §3.0A.4 — the bump is chosen by the *nature* of the change, not
  its size. The rules are restated at the top of `CHANGELOG.md` so they are read where they are used.
- **Build numbers are remote and auto-incremented** — `eas.json` sets
  `cli.appVersionSource: "remote"` with `autoIncrement: true` on the `staging` and `production`
  profiles, so build numbers are EAS's to allocate and cannot collide by hand-editing.
- **Release train:** `main` is always releasable; cut a build when a shippable increment is ready —
  weekly or on demand, not on a calendar. Hotfix via OTA where the change is JS-only (§2).

### Cutting a release

1. Move the `[Unreleased]` entries under a new `## [X.Y.Z] — YYYY-MM-DD` heading in `CHANGELOG.md`.
2. Set the same `X.Y.Z` as `version` in `apps/mobile/app.config.ts`.
3. Tag `vX.Y.Z` and push — `release-build.yml` triggers on `v*`.

**All three are enforced, not merely asked for:**

| Check | Where | Fails when |
|---|---|---|
| app version ↔ CHANGELOG | `apps/backend/tests/release/version-consistency.test.ts` (every PR) | the shipping version has no entry, or the newest entry is not it |
| tag ↔ app version ↔ CHANGELOG | `release-build.yml`, first step | a `v*` tag disagrees with either |

⚠️ **Why the tag mismatch matters beyond tidiness.** **Sentry sets no explicit release**, so it is
derived from the native app version. A `v0.2.0` release built from an `app.config.ts` still saying
`0.1.0` files its crashes under `0.1.0` — and the crash-free SLOs (NFR-06, NFR-07) are read *per
release*, so the new build would look healthy because its crashes landed in the previous release's
bucket. That is the same shape as CI reporting itself as `production` (#98): a real signal attributed
to the wrong thing.

---

## 8. After any rollback

§3.4 ends every path the same way, and both halves are required:

1. **Verify the metrics recover.** Not "the error stopped appearing" — the metric that detected it.
   ⚠️ **An open Sentry issue suppresses the next alert of its kind.** Resolve the issue (never
   *archive*, which mutes), or the next occurrence pages nobody. A metric-monitor issue cannot be
   resolved by hand at all; it closes only on a healthy reading.
2. **Blameless postmortem** (Part 1 §1.10). What was the surface, what did we roll back, how long did
   detection take, and what would have caught it earlier.
