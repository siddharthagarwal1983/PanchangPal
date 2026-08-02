# SLOs & Alerts — PanchangPal

**Status:** Active · **Owner:** Solo operator · **Source:** TDD Part 5 §7.2; NFR table at Part 1 §8
**Last verified:** 2026-08-02 (NFR-06 detects but does NOT notify — proven by drill; the other six audited against the code)

§7.2 names seven SLOs. This document records, for each one, **the instrument, the threshold, the
alert, and — where it does not exist — precisely what is blocking it.**

It is written this way because the failure this milestone keeps finding is a documented control that
nothing implements, with nothing asserting it. A list of seven SLOs with no note of which are real
would be exactly that. §8.4 states the standard: **alerting that never triggers is a plan, not a
capability.**

---

## 0. What is actually alerting today

✅ **Three page a human, and all three have been watched doing it** — NFR-06, NFR-07 and NFR-14,
each proven end to end by a deliberate trigger on 2026-08-02 (§8). Those are the only three here
that meet §8.4's standard.

| | |
|---|---|
| **Live and PROVEN** | NFR-06 crash-free sessions ✅ · NFR-07 crash-free users ✅ · NFR-14 availability ✅ |
| **Blocked on a decision** | NFR-10 sync success — no sync event exists in the PDD §11 taxonomy |
| **Blocked on a gated feature** | NFR-05 AI latency · NFR-16 AI cost · refusal/groundedness (all Ask Guru) · NFR-11 push delivery |

If the app breaks **by crashing**, Sentry notices and the operator is emailed. If it breaks in any
other way — a failing sync, a dead API, a notification never delivered — **nothing detects it at
all.**

---

## 1. The seven, at a glance

| SLO | NFR | Target | Instrument | Status |
|---|---|---|---|---|
| Crash-free sessions | NFR-06 | ≥ 99.5% | Sentry sessions | ✅ **live and proven** — see §2, §8 |
| Crash-free users | NFR-07 | ≥ 99.8% | Sentry sessions | ✅ **live and proven** — see §3; binds tighter than NFR-06 |
| Availability (core reads) | NFR-14 | ≥ 99.9% | `SVC_health` probe | ✅ **live and proven** — see §4, §8 |
| Sync success | NFR-10 | ≥ 99.5% | SVC_sync metrics | ⛔ blocked on a decision (§5) |
| AI first-token latency | NFR-05 | < 2 s | EVT_030 | ⛔ not emitted; feature gated |
| AI cost | NFR-16 | ≤ ceiling | cost dashboard | ⛔ feature gated |
| Push delivery | NFR-11 | ≥ 95% | EVT_040 / Expo receipts | ⛔ not emitted; adapter uninstalled |
| Refusal accuracy / groundedness | Part 3 | ≥ 95% / ≥ 99% | eval harness | ⛔ no corpus, no harness |

---

## 2. NFR-06 — crash-free sessions ≥ 99.5% ✅

The only SLO that measures, alerts, and has been **observed to reach a human** (§8).

| | |
|---|---|
| **Sentry monitor** | *crash_free_rate(session) below 99.5% over past 1 hour* (metric monitor). **Recreated 2026-08-02**, replacing `7968827`, to give the alert an explicit recipient — see §8. |
| **Project / environment** | `panchangpal-mobile` / **`production`** |
| **Detect** | Dataset `Releases`, `crash_free_rate(session)`, 1-hour interval, static threshold |
| **Thresholds** | High **< 99.5** (NFR-06) · Medium < 99.8 · Resolved ≥ 99.8 |
| **Notification** | Email to an explicit **Member**. ⚠️ NOT *Suggested Assignees* — that is what silently reached nobody (§8). |
| **Assignee** | Solo operator |

### Why the environment filter is load-bearing

Scoping to `production` is not tidiness. Until **PR #98** (2026-08-02) the app derived its
environment from `extra.eas.channel`, which only **EAS Build** stamps — and CI builds with
`expo prebuild` + `gradlew assembleRelease` on the runner, where `__DEV__` is also false. Every CI
E2E launch therefore reported as **production**, against a real DSN pulled by
`eas-cli env:pull --environment preview`. At the point this was found, essentially all 91 sessions
in the project were emulator launches counted toward the production SLO, and this alert would have
paged on **every CI run**. CI now reports `environment=ci`.

⚠️ **Historical sessions were not relabelled.** Any crash-free figure covering dates before
2026-08-02 is CI traffic and means nothing. Do not quote it at a go/no-go.

### The no-data question

With CI moved to `ci`, `production` sessions will be near zero until a real EAS build reaches a
device, so most hours have no data. Sentry renders empty buckets as `0%` on the chart, which is below
the threshold — but the monitor reports *No ongoing issue*, so empty buckets are **skipped rather
than evaluated as zero**. That is the behaviour we want, and it is an observation from one reading
rather than a documented guarantee. **If issues start appearing during zero-traffic hours, that is
this, and the fix is the no-data setting — not the threshold, which is the NFR.**

---

## 3. NFR-07 — crash-free users ≥ 99.8% ✅

Not in §7.2's table but in the NFR table (Part 1 §8), and it needs **no new instrumentation** —
Sentry computes it from the same session data NFR-06 already uses. It is one more monitor of the
same shape as §2.

| Field | Value |
|---|---|
| Project / environment | `panchangpal-mobile` / `production` |
| Metric | **Crash Free User Rate** (`crash_free_rate(user)`) |
| Dataset · interval | `Releases` · 1 hour |
| High priority | **Below `99.8`** (NFR-07) |
| Medium priority | Below `99.9` |
| Alert | **Notify → Member** (explicit), Email |

**Proven 2026-08-02 16:40** — issue `PANCHANGPAL-MOBILE-5`, `crash_free_rate(user)` below 99.8,
environment `production`, **Evaluated Value 85** (the drill's 3 crashed of 20 distinct `did`s), email
received confirming `percentage(users_crashed, users)`.

### ⚠️ NFR-07 is a far tighter bar than NFR-06, and will bind first

This is not obvious from the two numbers and is worth knowing before wiring it to page.

**Crash-free users is mathematically ≤ crash-free sessions.** A user is crash-free only if *every*
one of their sessions was, so with a per-session crash rate `p` and `N` sessions per user:

```
crash-free sessions = 1 − p
crash-free users    = (1 − p)^N        ≤ 1 − p   for N ≥ 1
```

So NFR-07's **stricter** threshold (99.8%) applies to the **lower** of the two metrics. At roughly
five sessions per user, 99.8% crash-free users implies ≈ **99.96%** crash-free sessions — an order
of magnitude tighter than NFR-06's 99.5%.

**Consequences, stated rather than discovered during an incident:**

- **NFR-07 alerts before NFR-06, essentially always.** Whichever way the app degrades, this is the
  page that arrives first, and NFR-06 may never fire at all.
- The two are **not independent signals**. Both firing is one fact reported twice, not corroboration.
- For a solo operator that argues for NFR-07 as the **warning** and NFR-06 as the **page**, or for
  accepting that NFR-07 is simply the real crash SLO and NFR-06 the backstop.

**The thresholds come from the NFR table and are not ours to change here.** What is ours is to notice
that they interact, and to wire the alerting knowing which one actually governs. A second page that
always fires with the first is noise, and noise is how a solo operator learns to ignore alerts —
which is the failure §8.4 is ultimately about.

**Recommendation: create it, but consider Email-only/warning severity** rather than a second page,
until real traffic shows how the two actually move together. Nothing in this project has produced a
real crash-free datapoint yet — every session so far is CI or a drill.

## 4. NFR-14 — availability ≥ 99.9% ✅

**Was blocked on: there was nothing an uptime probe could poll.** `verify_jwt` defaults to true and
every function relied on that default, so an anonymous probe measured the auth layer returning 401
rather than availability.

**Now built: `SVC_health`** (`apps/backend/functions/health/`), the **only** function with
`verify_jwt = false` — and the only unauthenticated surface in the system.

| | |
|---|---|
| **Endpoint** | `GET /health` (also `OPTIONS`; everything else → 405) |
| **Healthy** | `200` · `{"status":"ok","checked":"database"}` |
| **Degraded** | `503` · `{"status":"degraded","checked":"database"}` |
| **Dependency check** | a real read against `feature_flag` with `head: true` |
| **Caching** | `Cache-Control: no-store` |

**It does a real database read, not a bare 200.** A liveness-only probe reports 99.9% straight
through a total outage — a monitor that cannot go red, which is the same defect as a CI gate that
cannot fail. NFR-14 says "core reads", so the probe reaches Postgres too.

**Why `feature_flag`:** tiny, already public-select, carries nothing personal, and is read by the app
at every launch — so the probe exercises a path the product genuinely depends on rather than a
synthetic one. `head: true` returns no rows at all, so nothing from the table can reach the response
even by accident.

**Why the body is a closed shape.** Anything this endpoint returns is public to the internet. A
health endpoint that echoes its dependency error hands out Postgres versions, table names and role
names to anyone who curls it. `evaluateHealth()` takes a **boolean**, so there is no parameter
through which an error could reach the body — the leak cannot be reintroduced by an edit that "adds
a little more detail". Pinned by `probe.test.ts`, and the single-unauthenticated-function invariant
by `tests/rls/unauthenticated-surface.test.ts`.

### ✅ Deployed to staging, 2026-08-02

CD run `30742073745` — `Deployed Functions on project ***: account, ask-guru, content-ingest,
**health**, notify-scheduler, panchang, revenuecat-webhook, sync`.

Verified anonymously, with **no auth header of any kind**:

```
$ curl -i https://<staging-ref>.supabase.co/functions/v1/health
HTTP/2 200
cache-control: no-store
{"status":"ok","checked":"database"}
```

That confirms three things at once: `verify_jwt = false` took effect, the body is the closed shape,
and `no-store` is honoured end to end.

⚠️ **A gap caught before merge, worth remembering.** `cd.yml` hardcodes the list of function names
passed to `supabase functions deploy`, and declaring a function in `config.toml` does **not** add it
to that list. `health` was missing from it: the PR would have merged, CD would have gone green, and
nothing would have been served while this document claimed a probe existed. Now pinned in both
directions by `tests/rls/edge-function-deploy-list.test.ts`.

**On headers, since this is the only anonymous surface.** The body leaks nothing, but the response
carries Supabase gateway headers (`sb-project-ref`, `x-sb-edge-region`, `sb-gateway-version`). Those
were **already public** — an authenticated function returns them alongside its 401, verified. Two
things are genuinely new and both are minor: `endpoint-load-metrics` appears only when a function
actually executes, and `/health` is the only one an anonymous caller can make execute; and our CORS
allow-list is now anonymously readable, naming `x-revenuecat-signature` and
`x-panchangpal-api-version`. `/health` needs no custom headers and could be narrowed.

### ✅ The uptime monitor, created and proven 2026-08-02

| | |
|---|---|
| Project / environment | `panchangpal-edge` / **`staging`** |
| URL | `https://<staging-ref>.supabase.co/functions/v1/health` |
| Interval · timeout | 1 minute · 5 s |
| Assertion | **Status Code = 200** — so a 503 from a degraded probe counts as down |
| Failure / recovery threshold | 3 consecutive failures (~3 min) · 1 success |
| Alert | **Notify → Member** (explicit), Email |

**Scoped to `staging`, deliberately not `production`.** On this project `production` currently means
nothing but two staging errors mislabelled before `SENTRY_ENVIRONMENT` was set (§8) — scoping to it
would have pointed the monitor at an artifact.

The environment field was itself the last blocker: Sentry populates it from observed events, and
`panchangpal-edge` had none — not because the DSN was missing (it was set 2026-08-01) but because
**no Edge error had ever been triggered.**

## 5. NFR-10 — sync success ≥ 99.5% ⛔ blocked on a DECISION, not on engineering

**This was recorded on 2026-08-02 as "ordinary engineering, only blocked by time." That was wrong**,
and the correction is the useful part of this section.

`syncService.ts` and `useOfflineSync.ts` emit **no `EVT_*` at all**. Failures *do* reach `EVT_054`
through the telemetry seam, so a failure count is observable — but a success **rate** needs a
denominator, and nothing counts attempted drains.

**The obvious fix is forbidden.** Emitting a "sync attempted / succeeded" event means adding to the
`EVT_*` taxonomy, and **there is no sync event in it**: PDD §11's registry runs EVT_001–EVT_055 and
contains nothing for sync, queue, drain or conflict (the sole "queue" match is EVT_048, *Account
Deletion Requested*). `packages/shared/src/events.ts` says it outright — *"do not invent names beyond
what the source docs define"* — and CLAUDE.md forbids inventing analytics events. An invented id
would also be **rejected at runtime**: `AnalyticsService` validates against the taxonomy precisely so
a made-up event cannot reach a text column and silently become a dashboard that returns nothing.

**The NFR itself points elsewhere.** Its Measure column reads "**SVC_sync metrics**; ERR_SYNC_CONFLICT
rate" — *server*-side, not a client event. That path invents no taxonomy. But it needs a sink, and
none exists: `analytics_event` is client-fed and insert-only for clients, Sentry's free tier has no
custom metrics, and a counter table would be inventing schema.

### The decision this is actually waiting on

One of:

1. **PDD adds sync events to the §11 taxonomy** (product-owned; then the client emits them like any
   other event), or
2. **A server-side metrics sink is chosen** — structured logs from SVC_sync aggregated in Supabase's
   log explorer is the cheapest and adds no schema, but it is **measurable, not alertable** on the
   current plan, which does not satisfy §7.2's "warn on conflict/failure spike".

Neither is typing. Recording it as blocked-on-engineering would have been the same
documented-control-nothing-implements failure this document exists to name.

## 6. NFR-05, NFR-16, refusal/groundedness — all Ask Guru ⛔

**Blocked on: the Ask Guru readiness gate (`GURU_LIVE = false`), not on observability.**

Live answers are gated off until a reviewed corpus and evaluation readiness exist (TDD Part 3
§9/§10B). `EVT_030` — the NFR-05 instrument — is not among the emitted events. AI cost has no
traffic to cost. Refusal accuracy and groundedness need the evaluation harness that is itself the
gate.

Building alerts for these now would produce three monitors that can never fire, which is worse than
their absence: they would read as coverage on the §10.1 checklist.

---

## 7. NFR-11 — push delivery ≥ 95% ⛔

**Blocked on: `expo-notifications` is not installed.**

The client runs a `NullNotificationAdapter` (permission `undetermined`, no token, nothing
fabricated). `EVT_040` is not emitted, and there are no Expo receipts to read because nothing is
sent. Scheduling is server-side (SVC_notify_scheduler), which is itself a pending backend
deliverable.

---

## 8. What was proven, and what was only configured

§8.4's standard: **an alert nobody has seen fire is a plan, not a capability.** This section records
what has actually been watched happening.

### ✅ NFR-06 IS PROVEN — AND THE FIRST ATTEMPT FAILED AT THE LAST STEP

**Two drills. The first is the reason this section is worth reading.**

### Drill 1 — 2026-08-02 ~12:31 IST · detection fired, nobody was told ⛔

Everything upstream was correct: threshold, `production` filter, 1-hour interval, issue
`PANCHANGPAL-MOBILE-2` opened at **high** priority and assigned to the operator, evaluated value
93.182. **No email arrived.**

**Cause: both alert rows targeted *Suggested Assignees*.** Sentry resolves those from suspect commits
and ownership rules, and a metric-monitor issue has **no stack trace and no suspect commit** — so the
recipient set was empty. The issue *was* assigned, which made it look correct; that came from the
monitor's own **Assign** field, a different mechanism from an alert's recipient resolution.

**A monitor that opens an issue nobody sees is not an alert.** Without a deliberate trigger this
would have shipped as "alerting configured" — correct threshold, correct filter, two alert rows
visibly attached, an issue opening on schedule, and no one told. For a calm ritual app that is
§8.4's worst unattended failure exactly: a crash affecting every user goes unnoticed, because these
users do not file bug reports, they stop opening the app.

### Drill 2 — 2026-08-02 14:43 IST · proven end to end ✅

Monitor recreated with the alert action set to an explicit **Member**. Drill re-run after
**resolving** the previous issue (resolve, *not* archive — archiving mutes notifications and would
have suppressed the very email under test).

| Check | Result |
|---|---|
| A **new** issue opened | ✅ `PANCHANGPAL-MOBILE-4`, distinct from `-2` |
| Evaluated Value | ✅ **85** — matching the predicted 85.0 (40 sessions, 6 crashed), so the window was uncontaminated |
| **Email received** | ✅ *[Critical] crash_free_rate(session) below 99.5% over past 1 hour — panchangpal-mobile*, 14:43 |

The email's own Alert Rule Details confirm the scope independently of the monitor's settings page:
project `panchangpal-mobile`, **environment `production`**, threshold `< 99.5%`, interval `1 hour`,
metric `percentage(sessions_crashed, sessions)`.

**This is the first alert in this project proven to reach a human.**

### ✅ The Edge telemetry path is proven — 2026-08-02

§7.1 is "client **+** Edge Functions", and the server half had never been exercised: `panchangpal-edge`
had zero events since Sentry went live. Not because anything was broken — the DSN had been set since
2026-08-01 — but because **telemetry fires only at `errorResponse()`, and no server error had ever
occurred.** An empty dashboard looks identical whether the seam is broken or merely unexercised.

Triggered deliberately with a `GET /functions/v1/sync`, which throws at `sync/index.ts:31`
(`AppError('ERR_UNKNOWN', 'Method not allowed')`) — chosen because it is **before** line 38's
`currentUserId`, so it touches no database and resolves no user: one intentional error, zero side
effects. The anon key serves as the bearer token because it is itself a signed JWT, which is what
gets past the gateway's `verify_jwt` so our code can run at all.

| # | Time (UTC) | Correlation id | `environment` |
|---|---|---|---|
| 1 | 09:57:16 | `0990dbbd-…` | `production` ⚠️ |
| 2 | 10:10:03 | `7c91cf8b-…` | `production` ⚠️ |
| 3 | **10:25:51** | `03a30d83-…` | **`staging`** ✅ |

All three reached Sentry with the correlation id matching the HTTP response, which is what §7.1's
correlation is for. **The first two were mislabelled**, and that is the finding: `_shared/http.ts`
defaults `SENTRY_ENVIRONMENT` to `production`, and the variable had never been set — so staging
errors landed in the bucket real incidents will, and any `environment:production` alert on this
project would have fired on staging traffic. The identical defect PR #98 fixed on the mobile side,
in the server seam, found the same way.

**The ordering is the whole story, and it cost two false negatives.** The secret was saved at
**10:18:15**, *after* both of the first two curls — so neither could ever have shown `staging`,
and each looked like the fix had failed. Only the third curl (38 s after a deploy that finished
10:25:13) was capable of proving anything. **When a config change does not appear to take, compare
timestamps before touching code.**

Config was ultimately verified without reading the value at all: Supabase shows a SHA-256 digest per
secret, and `sha256("staging")` matches it exactly — ruling out a trailing space, a newline, or a
capitalisation slip, none of which a screenshot would reveal.

---

### ✅ NFR-14 proven — 2026-08-02 16:16 IST

Monitor pointed at `/functions/v1/health-nonexistent` for one failure window, then reverted.

| Check | Result |
|---|---|
| Issue opened | ✅ `PANCHANGPAL-EDGE-3` — *Downtime detected* |
| Assertion did the work | ✅ `Assertion failed`, Status Code **404** against the `= 200` rule |
| Environment scoped correctly | ✅ `staging` |
| **Email received** | ✅ 16:17, *"triggered by **Notify Siddharth Agarwal**"* |
| Recovery | resolves on 1 successful check after the URL is restored |

**Why a bad URL rather than a real outage.** Breaking the database dependency for real would also
have exercised the 503 branch, and was prepared — a one-line change pointing `databaseReachable()`
at a nonexistent table. It was **not run**: deliberately deploying a broken endpoint is an action
that belongs to the owner, not the agent, and permission was declined. **So what is proven here is
detection + notification, not the 503 path.** That gap is covered logically by `probe.test.ts`
(`evaluateHealth(false)` → 503) but not end to end, and it belongs with the DB-outage runbook drill.

**The alert action was set to an explicit Member**, which is the entire reason this succeeded on the
first attempt where NFR-06 needed two — see Drill 1 above.

The check-in log is the drill in ten rows, and matches the configured thresholds exactly:

| Time (IST) | Status | HTTP |
|---|---|---|
| 4:09–4:12 | Uptime | 200 |
| 4:13, 4:14 | Failure (Assertions Failed) | 404 |
| **4:15** | **Downtime** — third consecutive, issue opens | 404 |
| 4:16, 4:17 | Downtime | 404 |
| **4:18** | **Uptime** — resolves on one success | 200 |

⚠️ **Latency headroom is thinner than the timeout suggests.** Healthy checks take **1–2 s**
(observed 1.041 s … 2.057 s) against a **5 s timeout**: Sentry probes from US East/West while the
Supabase project is `ap-south-1` (Mumbai), so every check is a transcontinental round trip *plus* a
real database read. That is normal, not a fault — but a slow moment has less margin than 5 s implies.
The failure threshold of 3 absorbs a single slow check, which is the reason not to raise the timeout
reflexively; if false failures ever appear, raise the **timeout**, not the threshold, because the
threshold is what stops a blip from paging.

The drill also cost the monitor's own uptime figure — it read **70%** immediately afterwards. That is
the six deliberate 404s, not an outage.

---

### Reproducing

```bash
node scripts/slo-alert-drill.mjs --dsn "<panchangpal-mobile client DSN>" --confirm
```

Refuses without `--confirm` and rejects a malformed DSN, because its purpose is to write data that
cannot be taken back. **Resolve any open drill issue first**, or the new drop folds into the existing
open period and sends nothing — which reads as a regression when it is not.

### ⛔ AN OPEN ISSUE SUPPRESSES THE NEXT ALERT — confirmed 2026-08-02

The NFR-07 drill crossed **both** thresholds (85% is below NFR-06's 99.5% and NFR-07's 99.8%), so it
should have produced two emails. **Only NFR-07's arrived.** The reason is not a misconfiguration:
NFR-06's issue from the earlier drill was **still open**, and Sentry folds new occurrences into an
existing open period without notifying again.

**The operational consequence is the serious part.** An issue left open means **the next real
incident of that kind pages nobody.** It is the inverse of alert fatigue — nothing is noisy, nothing
looks wrong, and the alert simply does not arrive. For a solo operator with no second pair of eyes,
that is a plausible way to miss an outage entirely.

**Two rules follow:**

1. **Resolve issues, including drill issues.** A synthetic issue left open is not untidiness; it is a
   disabled alert. Resolve — never *archive*, which mutes notifications outright.
2. **A silent alert is not evidence the threshold held.** Before concluding a metric is healthy,
   check whether its issue is already open.

**Still untested rather than disproven: whether one degradation pages twice.** NFR-06 and NFR-07 are
separate monitors with separate issues, so both *should* fire when neither has an open period — the
argument in §3 for making one of them a warning stands, but it has not been observed yet.

---

### Three questions, not one

1. Did the data land? · 2. Did **detection** fire? · 3. Did **notification** reach a human?

**Only (3) settles it.** Drill 1 passed (1) and (2) and failed (3), which is precisely the state a
settings page cannot show you.

### What the drills cost, permanently

⚠️ **Six synthetic crashes are now in production session data** (3 per drill, 2026-08-02) and cannot
be removed. A crash-free dip on that date is the drills, not a regression. Cheap now — production had
essentially no real sessions, and everything before 2026-08-02 is CI traffic mislabelled as
production (PR #98) — and permanently expensive after launch, which is the argument for having done
it today.

⚠️ **A drill's evaluated value includes whatever else is in the window**, so read it as a lower bound
on the drill's effect rather than a measurement of it. Drill 1 read 93.182 rather than 85 because the
window also held 24 sessions from a broken CI run.

---

## 9. What this document does not cover

- **Dashboards.** §7.1 lists product, AI and performance dashboards (PDD §11, Part 3 §10.1). Sentry's
  default project view covers crash-free sessions/users; the `EVT_*` product dashboards run off the
  `analytics_event` sink and **have no consumer** — ADR-025's rollup worker is unbuilt, and nothing
  in this project runs on a schedule except the deletion sweep.
- **Apdex / performance.** Offered by Sentry and not set up; NFR-01…NFR-04 have no alerting.
- **Error budgets.** §7.3 `[RECOMMENDATION]` asks for one per SLO to decide when to pause feature
  work. Not defined — with no SLO yet paging anyone and no real traffic, a budget would be
  arithmetic on an empty set.
