# DR Runbooks — PanchangPal

**Status:** Active · **Owner:** Solo operator (see §0) · **Source:** TDD Part 5 §8.3
**Last verified:** 2026-07-25 (restore drill mechanised; PITR gap recorded; §8.4 operator-resilience section added)

Five runbooks §8.3 mandates: **DB restore**, **region incident**, **Edge Function outage**,
**secret compromise**, **store outage**. Each names the owner, how the problem is detected, the
steps, and how to know it is actually fixed.

Written for one person under pressure at an inconvenient hour. Steps are literal commands from this
repository, not descriptions of commands.

---

## 0. Before anything — who and what

| | |
|---|---|
| **Owner of every runbook below** | The solo operator. There is no escalation path, which is TRISK-11 and the reason §8.4 exists. |
| **Second pair of hands** | None standing. MRD Risk §12 contemplates contracting specialist help; that arrangement does not exist yet, so assume you are alone. |
| **Source of truth for schema + content** | This repository. `scripts/migrate.sh` + `apps/backend/seed/seed.sql` rebuild a database from nothing. |
| **Source of truth for entitlements** | RevenueCat, not our database (§8.1). Subscriptions survive a total DB loss. |
| **What is NOT recoverable from the repo** | User data: profiles, households, ritual completions, streaks, personal dates, conversations. Only a backup restores those. |

### The gap you need to know about before you need it

**There is no point-in-time backup to restore from.** Supabase PITR is a paid-plan feature and both
hosted projects (dev `msbfcirvtzrsbhqduflr`, staging `sgwuyblzmirynqhkndmr`) are on the free tier.
§8.1's **RPO ≤ 24 h / RTO ≤ 4 h (NFR-15) is therefore currently unmet for user data** — the schema
and seed are recoverable in minutes, and everything a user created is not.

Closing it is a plan change on the production project, and is the same purchase that closes B1
(~$25/month). Until then, do not let the existence of these runbooks imply a recovery capability
that is not there. **Do not launch to real users on the free tier.**

---

## 1. DB restore (PITR / logical)

**Detects as:** data missing or wrong at scale, a bad migration, an accidental destructive
statement, or Supabase reporting an incident.

### Step 1 — Stop the bleeding before restoring anything
A restore into a database that is still taking writes gives you a second inconsistent state.

1. Pause writes: disable the CD workflow's deploy jobs (Actions → CD → disable) so nothing new
   deploys mid-incident.
2. If a bad migration is the cause, do **not** hand-edit production. Prod changes go through CI
   (§1.3) — write a forward migration.

### Step 2 — Choose the recovery path

| Situation | Path |
|---|---|
| Schema damaged, user data intact | Forward migration. Never restore. |
| User data lost, PITR available (paid plan) | Supabase Dashboard → Database → Backups → restore to a timestamp **before** the incident. |
| User data lost, no PITR (**today's reality**) | It is not recoverable. Rebuild the schema and seed, and communicate honestly. |
| Fresh/empty project needed | Rebuild from the repo, below. |

### Step 3 — Rebuild from the repo (always available, ~minutes)
```bash
# resolve-db-url.sh takes the raw URL (from its CI secret) and returns a pooler-safe one.
# Usage: scripts/resolve-db-url.sh "$SOME_DB_URL" [region]
export DB_URL="$(scripts/resolve-db-url.sh "$SUPABASE_STAGING_DB_URL")"
bash scripts/migrate.sh "$DB_URL"
psql "$DB_URL" -v ON_ERROR_STOP=1 -f apps/backend/seed/seed.sql
```

### Step 4 — Verify, do not assume
```bash
psql "$DB_URL" -v ON_ERROR_STOP=1 -f apps/backend/tests/dr/restore_invariants.sql
```
This is the same file the monthly drill runs (`.github/workflows/dr-drill.yml`). It fails loudly if
a table is missing, **RLS came back disabled**, policies are absent, `pgvector` is missing, an enum
vanished, or the seed did not load. RLS silently off is the dangerous one: the app looks perfectly
healthy while every household's data is readable.

### Step 5 — Confirm the app, not just the database
Anonymous sign-in works, Today renders, a ritual completes. A green database with a broken app is
not a completed restore.

**Drill status:** mechanised and run monthly against pg17 — rebuild, `pg_dump`/`pg_restore` round
trip, invariants, and seeded row-count equality, timed against the RTO. What it cannot drill is
PITR, because there is nothing to restore from (§0).

---

## 2. Region incident (single region, ADR-012)

**Detects as:** widespread errors across every user, Supabase status page reporting a regional
event.

We are single-region by decision (ADR-012). There is no failover to execute, and pretending
otherwise wastes the hour that matters.

1. **Confirm it is them, not us.** Supabase status page; a second failing project in the same region
   is confirmation.
2. **Expect the client to hold.** The app is offline-first (TDD Part 4 §6): cached Today, cached
   ritual, and the local ritual session all keep working, and writes queue in `STORE_offlineQueue`
   for `SVC_sync` to drain. Panchang already shows a calm unavailable state (ADR-033).
3. **Do not fail writes loudly.** The queue is the mitigation; leave it alone.
4. **Communicate** only if the outage outlasts a daily ritual window in a launch market
   (US/AU/NZ) — that is when a user notices something they cannot work around.
5. **After:** record duration and user-visible impact against the NFR-14 availability SLO (≥99.9%).

---

## 3. Edge Function outage

**Detects as:** one capability failing while the rest of the app works — the SVC_* boundary is the
usual dividing line.

1. **Identify the function.** Every failure carries a `correlation_id` (ADR-022) that threads the
   structured log (`_shared/logging.ts`) and the client's EVT_054.
2. **Check whether it is deployed at all.** `supabase functions list --project-ref <ref>`. A failed
   CD deploy leaves the previous version running — usually the better state.
3. **Roll back** by redeploying the previous commit through CD. Never patch a function in the
   dashboard: the repo is the source of truth (§1.3) and a dashboard edit is invisible to the next
   deploy, which will silently revert your fix.
4. **Degrade, do not fabricate** (§8.2): AI outage → the honest "busy, try later"; payments outage →
   the free tier remains fully functional; notification outage → in-app value is unaffected. Every
   `ERR_*` already has defined calm behaviour (PDD §12).
5. **Verify** with the flow a user would take, not with a curl against the endpoint.

---

## 4. Secret compromise

**Detects as:** a secret in a log, a public commit, a screenshot, a shared file — or gitleaks
failing in CI.

**Rotate first, investigate second.** A rotated key costs an afternoon; a live leaked key costs
everything behind it.

| Secret | Rotate at | Then |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | `supabase secrets set` on each project |
| DB password | Supabase → Settings → Database | update `SUPABASE_*_DB_URL` secrets |
| `SUPABASE_ACCESS_TOKEN` | Supabase account tokens | update the repo secret |
| `EXPO_ACCESS_TOKEN` | expo.dev → account → tokens | update the repo secret |
| `OPENAI_API_KEY` | OpenAI dashboard | `supabase secrets set` |
| `REVENUECAT_WEBHOOK_SECRET` | RevenueCat dashboard | update the production env secret |
| Android keystore | **Cannot be rotated after store submission** | see below |

Notes that matter:
- **The anon key is not a secret.** It ships in every build by design; RLS is the authorization
  boundary (ADR-018). Rotating it is disruptive and pointless.
- **The Android keystore is unrecoverable and unrotatable once an app has shipped under it.** It is
  backed up off-machine (issue #25). Losing it means losing the ability to update the app for
  existing installs — treat it as the single most valuable file in the project.
- **The staging DB password was rotated once already** after an exposure (B1); `resolve-db-url.sh`
  exists so a password stays inside its CI secret rather than passing through a shell.

After rotating: run `bash scripts/preflight.sh <target>` — it fails closed on anything missing, so a
half-finished rotation cannot quietly ship.

---

## 5. Store outage / submission blocked

**Detects as:** App Store Connect or Play Console unavailable, or a submission rejected/stuck.

Neither store being down affects users who already have the app. This is a release-schedule
incident, not a production one — treat it that way and do not rush a workaround.

1. **Do not resubmit repeatedly.** Duplicate submissions confuse review and can extend the delay.
2. **If the fix is JS-only**, ship it over OTA instead (§2.4): channels `staging`/`prod`, bound to a
   runtime version by the `fingerprint` policy, so an update cannot reach a build with different
   native dependencies. Native or config-plugin changes **cannot** go this way (TRISK-10).
3. **If the fix needs native code**, the store is the only path. Queue the submission and
   communicate the timeline.
4. **A rejection is not an outage.** Read the reason, fix it, and record it — store review is a
   known long pole (B8) and repeat rejections compound.

---

## 6. What would make these runbooks true

Honest list of what is documented here but **not yet verified end to end**:

- **PITR restore** — impossible to drill without a paid plan (§0). The single highest-value
  purchase for reliability.
- **Region incident** — never exercised; the offline-first behaviour it relies on is real and
  tested, the operator response is not.
- **Edge Function rollback** — CD deploys are real, but a rollback has never been performed.
- **Secret rotation** — performed once, for the staging DB password, and it worked.

A runbook nobody has walked is a plan, not a capability. These are labelled so the difference is
visible at the moment it matters.

---

## 7. If the operator is unavailable (TRISK-11, §8.4)

The largest reliability risk in this project is not a database or a region. It is that **one person
holds every credential, every decision, and all the operational context**, and the runbooks above
all begin "you". §8.4 names the mitigations; this section states honestly which exist.

### What is already true

| Mitigation (§8.4) | Reality |
|---|---|
| **Managed platforms — fewer things to run** | Real. Supabase, EAS, GitHub Actions, RevenueCat. Nothing is self-hosted; there are no servers to patch and no cluster to keep alive. |
| **Documentation as knowledge capture** | Real, and unusually complete: MRD/PRD/PDD/TDD, 33 ADRs, an OpenAPI spec, this runbook set, and a decision log that records *why* rather than only what. |
| **AI-agent-friendly repository** | Real. `.claude/` carries the operating context, every non-obvious decision is commented at the site of the code, and gates are designed to fail loudly rather than require a human to interpret them. |
| **Alerting that does not require constant attention** | **NOT true yet.** B4 wired the telemetry seams; no Sentry project exists, so nothing pages anyone. Crash-free sessions (NFR-06) is currently unmeasured. |
| **A documented plan to contract specialist help** | **NOT true.** MRD Risk §12 contemplates it; no arrangement, contact, or budget exists. |

### The unattended failure modes, worst first

1. **A crash affecting every user goes unnoticed.** Nothing is watching (see above), and users of a
   calm daily-ritual app do not file bug reports — they stop opening it. Closed by a Sentry project
   plus B4.4's alerts.
2. **User data is lost permanently.** No PITR on the free tier (§0). Closed by the paid plan.
3. **Certificates and tokens expire silently.** `EXPO_ACCESS_TOKEN`, the Apple membership (annual,
   once purchased), and store credentials all lapse on a calendar, not on an incident. A lapsed
   credential is discovered at the next release, which is exactly when it costs the most.
4. **A dependency deprecation breaks the build months later.** The MMKV v2 defect this month is the
   pattern: nothing was wrong until a native build ran under the New Architecture.

### What a handover would need

If someone else has to take this over — for a week or permanently — they need, in this order:

1. **Access:** the GitHub repository and its Actions secrets; the Supabase organisation; the Expo
   account; RevenueCat; the Apple and Google developer accounts once they exist.
2. **The Android keystore**, which is backed up off-machine (issue #25) and **cannot be regenerated**
   — losing it ends the ability to update the app for existing installs.
3. **This documentation set**, starting at `.claude/DASHBOARD.md`, then `CURRENT_MILESTONE.md`, then
   these runbooks.
4. **The standing rule that explains most of the codebase:** a gate is added only when it can fail,
   and a claim in a document is not a verified behaviour.

None of this is a substitute for a second person. It is what makes the first day survivable.
