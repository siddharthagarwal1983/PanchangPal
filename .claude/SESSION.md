# SESSION.md

# PanchangPal — Current Session

Version: 5.0.0
Last Updated: 2026-08-02 (session end — four PRs merged; Sentry live and verified; 47%)

**Progress unchanged at 47%** — four PRs merged, three defects fixed, crash-free sessions made
measurable, and **no Beta slice advanced.** Saying so is the point.

---

# Merged

| PR | Commit | What |
|---|---|---|
| #84 | `45f00c7` | Offline completion lost on app kill — §6 launch blocker |
| #85 | `b8ab528` | SDK-pin rule's third leak; #81 and #63 closed with evidence |
| #86 | `080c710` | Durable preference writes + identity-scoped mutations |
| #79 | `6182955` | Sentry behind both telemetry ports |

# The through-line: a durable queue guarantees DELIVERY, not DISPLAY

Three defects, one shape.

1. **The offline completion** reached MMKV synchronously every time and was never re-derived onto
   the rendered read model. The recorded cause ("an async MMKV write loses to the kill") was
   **wrong**: the tick came from a 1 s-throttled cache snapshot flushed by a handler a process kill
   never runs.
2. **The preference write had no durable path at all.** `useUpdatePreferences` went straight to the
   server, so an app kill inside the request window reverted the setting — and
   `FLOW_AUTH_SESSION_PERSISTENCE` reads the tradition back as its **proof of identity**, so the
   loss presented as identity loss. **Four misattributions**: twice to the launch race, once to
   Sentry (which blocked #79 across two sessions), once to a flake.
3. **My own fix** shipped the durable write path with the read half stale — caught by its own first
   E2E run, not written off as a flake.

# Sentry is live and verified on device

Org `panchang`; projects `panchangpal-mobile` + `panchangpal-edge`. `[telemetry] reporter=sentry`
appears **once per launch (12/12)** where it read `none` before, and the native SDK installs
NDK / ANR / uncaught-exception plus **`AppLifecycleIntegration`** — what crash-free sessions is
computed from. None of those installed under the original defect, where `Sentry.init` ran only after
the first JS error. **NFR-06 is measurable for the first time.**

Six flows stayed green on that run, which finally *tests* — rather than argues against — the
hypothesis that Sentry's instrumentation destabilised E2E.

# Blockers

1. **B4.4 is still open; B4 does not close.** §7.2 SLO dashboards and alerts do not exist, and §8.4
   holds that alerting never triggered is a plan, not a capability.
2. **Unverified:** Sentry ingest (needs the dashboard), the Edge Function path (needs a real server
   error), source-map upload (`e2e.yml` disables it deliberately).
3. ⚠️ **The §6.6 `preferences` conflict rule is UNRATIFIED** and shipped in merged code — LWW, the
   nearest ratified precedent. `resolvePreferences` is the only place a ruling lands.
4. Paid Supabase (~$25/mo, NFR-15) · ADR-034 ratification · Apple $99 + Play $25 · JDK 17 for local
   Gradle builds.

# Recommended next task

1. **Confirm events in the Sentry dashboard**, then filter alerts to `environment:production` so CI
   `preview` runs do not page.
2. **B4.4** — §7.2 dashboards + alerts, proven by a deliberate trigger rather than configured.
3. Remaining dependency PRs, none SDK-pinned: **#80**, **#82** (major), **#83**, **#62** (major).
