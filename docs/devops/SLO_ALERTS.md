# SLOs & Alerts — PanchangPal

**Status:** Active · **Owner:** Solo operator · **Source:** TDD Part 5 §7.2; NFR table at Part 1 §8
**Last verified:** 2026-08-02 (NFR-06 alerting live and proven; the other six SLOs audited against the code)

§7.2 names seven SLOs. This document records, for each one, **the instrument, the threshold, the
alert, and — where it does not exist — precisely what is blocking it.**

It is written this way because the failure this milestone keeps finding is a documented control that
nothing implements, with nothing asserting it. A list of seven SLOs with no note of which are real
would be exactly that. §8.4 states the standard: **alerting that never triggers is a plan, not a
capability.**

---

## 0. What is actually alerting today

**One of the seven.**

| | |
|---|---|
| **Live and proven** | NFR-06 crash-free sessions |
| **Measurable, no monitor yet** | NFR-07 crash-free users (same Sentry session data, no new instrumentation) |
| **Blocked on engineering** | NFR-14 availability · NFR-10 sync success |
| **Blocked on a gated feature** | NFR-05 AI latency · NFR-16 AI cost · refusal/groundedness (all Ask Guru) · NFR-11 push delivery |

Nothing else pages anyone. If the app breaks in a way that is not a crash, **no alert fires.**

---

## 1. The seven, at a glance

| SLO | NFR | Target | Instrument | Status |
|---|---|---|---|---|
| Crash-free sessions | NFR-06 | ≥ 99.5% | Sentry sessions | ✅ **live** — monitor `7968827` |
| Availability (core reads) | NFR-14 | ≥ 99.9% | uptime monitor | ⛔ no pollable endpoint |
| Sync success | NFR-10 | ≥ 99.5% | SVC_sync metrics | ⛔ no metric emitted |
| AI first-token latency | NFR-05 | < 2 s | EVT_030 | ⛔ not emitted; feature gated |
| AI cost | NFR-16 | ≤ ceiling | cost dashboard | ⛔ feature gated |
| Push delivery | NFR-11 | ≥ 95% | EVT_040 / Expo receipts | ⛔ not emitted; adapter uninstalled |
| Refusal accuracy / groundedness | Part 3 | ≥ 95% / ≥ 99% | eval harness | ⛔ no corpus, no harness |

---

## 2. NFR-06 — crash-free sessions ≥ 99.5% ✅

The only SLO that both measures and pages.

| | |
|---|---|
| **Sentry monitor** | `7968827` — "crash_free_rate(session) below 99.5% over past 1 hour" |
| **Project / environment** | `panchangpal-mobile` / **`production`** |
| **Detect** | Dataset `Releases`, `crash_free_rate(session)`, 1-hour interval, static threshold |
| **Thresholds** | High **< 99.5** (NFR-06) · Medium < 99.8 · Resolved ≥ 99.8 |
| **Notification** | Connected alert *Notify Suggested Assignees* → Email; project alert *Send a notification for high priority issues* → Email |
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

§8.4's standard is that an alert nobody has seen fire is a plan. See the record of the deliberate
trigger below; until that row is filled in, **treat NFR-06 alerting as configured rather than
proven.**

| Date | What was triggered | Result |
|---|---|---|
| 2026-08-02 | `scripts/slo-alert-drill.mjs` — 20 synthetic sessions, 3 crashed, into `environment=production`, release `0.1.0` | ✅ Submission accepted (HTTP 200) · ✅ **Detection fired** — issue `PANCHANGPAL-MOBILE-2` opened 12:31 IST, priority **high**, assigned · ⏳ notification unconfirmed |

**What the issue recorded**, which is the proof that the monitor evaluates what it claims to:

| Triggered Condition | |
|---|---|
| Dataset | `Releases` |
| Aggregate | `crash_free_rate(session)` |
| **Environment** | **`production`** |
| Interval | 1 hour |
| Condition | Below 99.5 |
| **Evaluated Value** | **93.182** |

**The evaluated value is not the drill's 85%, and the discrepancy is worth keeping.** 41/44 = 93.18%,
so the window held **44** production sessions: the drill's 20 plus **24 from run `30735155676`** —
the broken E2E run earlier that morning that tagged its sessions `production` before the newline
defect in `e2e.yml` was fixed. It is **not** an ongoing leak: both `main` runs after PR #98
(`30736249752`, `30736362471`) log `env=ci`, 12 each.

Two things follow. **Sessions outnumber launches** — 24 sessions from 8 launches, consistent with
`AppLifecycleIntegration` starting a session per foreground while `[telemetry] reporter=` logs once
per process (inferred from the arithmetic, not measured). And **a drill's evaluated value will
include whatever else is in the window**, so it should be read as a lower bound on the drill's
effect rather than as its measurement.

**Reproduce with:**

```bash
node scripts/slo-alert-drill.mjs --dsn "<panchangpal-mobile client DSN>" --confirm
```

The script refuses without `--confirm` and rejects a malformed DSN, because its whole purpose is to
write data that cannot be taken back.

### The three questions, which are not the same question

Sentry aggregates sessions per interval, so allow ~1 hour (the monitor's interval) before judging.
Then check **in this order** — each failing for a different reason:

1. **Project → Releases/Sessions: does crash-free show the drop?** — did the data land at all.
2. **Monitor `7968827`: is there an ongoing issue?** — did *detection* fire.
3. **Inbox: did the connected alert email arrive?** — did *notification* work.

**Only (3) settles it.** (1) and (2) can both succeed while the alert reaches nobody — which is
exactly the state this monitor was in before its §7 Alert section was filled in, and is the shape of
every failure §8.4 is about. Until (3) is confirmed, NFR-06 alerting is **configured, not proven**.

⚠️ **This drill put 3 synthetic crashes into production session data permanently.** A crash-free dip
dated 2026-08-02 is this, not a regression.

**The trade-off in proving it, stated rather than buried:** the only way to make a
production-scoped crash-free alert fire is to put crashed sessions into production telemetry, which
pollutes the metric being measured. That cost is near zero **right now** — production has
essentially no real sessions and the historical data is already meaningless — and rises permanently
once real users exist. That is an argument for doing it before launch, not after.

---

## 9. What this document does not cover

- **Dashboards.** §7.1 lists product, AI and performance dashboards (PDD §11, Part 3 §10.1). Sentry's
  default project view covers crash-free sessions/users; the `EVT_*` product dashboards run off the
  `analytics_event` sink and **have no consumer** — ADR-025's rollup worker is unbuilt, and nothing
  in this project runs on a schedule except the deletion sweep.
- **Apdex / performance.** Offered by Sentry and not set up; NFR-01…NFR-04 have no alerting.
- **Error budgets.** §7.3 `[RECOMMENDATION]` asks for one per SLO to decide when to pause feature
  work. Not defined — with one live SLO and no real traffic, a budget would be arithmetic on an
  empty set.
