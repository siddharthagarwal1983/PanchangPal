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

✅ **One of the seven pages a human, and it has been watched doing it** — NFR-06, proven end to end
by a deliberate trigger on 2026-08-02 (§8). That is the only SLO here that meets §8.4's standard.

| | |
|---|---|
| **Live and PROVEN** | NFR-06 crash-free sessions ✅ |
| **Measurable, no monitor yet** | NFR-07 crash-free users (same Sentry session data, no new instrumentation) |
| **Blocked on engineering** | NFR-14 availability · NFR-10 sync success |
| **Blocked on a gated feature** | NFR-05 AI latency · NFR-16 AI cost · refusal/groundedness (all Ask Guru) · NFR-11 push delivery |

If the app breaks **by crashing**, Sentry notices and the operator is emailed. If it breaks in any
other way — a failing sync, a dead API, a notification never delivered — **nothing detects it at
all.**

---

## 1. The seven, at a glance

| SLO | NFR | Target | Instrument | Status |
|---|---|---|---|---|
| Crash-free sessions | NFR-06 | ≥ 99.5% | Sentry sessions | ✅ **live and proven** — see §2, §8 |
| Availability (core reads) | NFR-14 | ≥ 99.9% | uptime monitor | ⛔ no pollable endpoint |
| Sync success | NFR-10 | ≥ 99.5% | SVC_sync metrics | ⛔ no metric emitted |
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

## 3. NFR-07 — crash-free users ≥ 99.8% 🟡

Not in §7.2's table, but in the NFR table, and it needs **no new instrumentation**: Sentry already
computes it from the same session data (the project dashboard shows it). It is one more monitor of
the same shape as §2, with `crash_free_rate(user)` and a 99.8 threshold.

Recorded here rather than silently skipped, because "we only built what §7.2 listed" is a worse
reason than "we judged it not worth a second page for a solo operator."

---

## 4. NFR-14 — availability ≥ 99.9% ⛔

**Blocked on: there is nothing an uptime probe can poll.**

`supabase/config.toml` notes that **`verify_jwt` defaults to true**, and no function overrides it —
the one planned exception, `revenuecat-webhook`, is explicitly "once the webhook is wired", which has
not happened. So every Edge Function returns 401 to an anonymous request, and an uptime monitor
against any of them measures the auth layer rather than availability.

**What unblocks it:** a public, unauthenticated health endpoint. That is a small piece of
engineering, but it carries a design decision that should not be made by accident — **does "healthy"
mean the function responded, or that it reached the database?** A probe that only proves the Edge
runtime is up will report 99.9% through a total database outage, which is the same
looks-like-coverage failure as a gate that cannot fail. It also must expose nothing: a health
endpoint is unauthenticated by definition and must not leak version, schema, or configuration.

---

## 5. NFR-10 — sync success ≥ 99.5% ⛔

**Blocked on: no metric is emitted.**

The NFR table names "SVC_sync metrics; ERR_SYNC_CONFLICT rate". Neither exists as a measurable rate:
`syncService.ts` and `useOfflineSync.ts` emit **no `EVT_*` at all**, and the nine ids the app does
emit (EVT_012, 015–021, 054) contain nothing about sync.

**A partial proxy exists and is not sufficient.** Sync *failures* surface as `ERR_*` and therefore
reach `EVT_054` through the telemetry seam, so the failure count is observable in `analytics_event`.
But a success *rate* needs a denominator — attempted drains — and nothing counts those. **A failure
count with no denominator cannot be compared against 99.5%**, and treating it as if it could is how a
number gets reported that nobody can act on.

**What unblocks it:** emit drain-attempt and drain-outcome events from `syncService`, then compute
the rate server-side. Both belong to the offline-sync seam
(`STORE_offlineQueue` → `syncService` → `syncRepository` → SVC_sync) and must not be instrumented at
call sites, for the same reason the ritual events are derived from view-model transitions: a metric
that double-fires is worse than none.

---

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

### Reproducing

```bash
node scripts/slo-alert-drill.mjs --dsn "<panchangpal-mobile client DSN>" --confirm
```

Refuses without `--confirm` and rejects a malformed DSN, because its purpose is to write data that
cannot be taken back. **Resolve any open drill issue first**, or the new drop folds into the existing
open period and sends nothing — which reads as a regression when it is not.

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
