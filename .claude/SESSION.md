# SESSION.md

# PanchangPal — Current Session

Version: 14.0.0
Last Updated: 2026-08-07 (seven PRs merged — B7 STARTED: OTA publish and rollback are real and both
have been performed; verifying it found five defects every local check had passed)

---

# Completed

**Progress unchanged at 50%.** No Beta slice *completed* — **B7 is now started** (1 of 4 increments).
Main: `3cee165`. **No open PRs.**

| PR | Commit | What |
|---|---|---|
| #108 | `610bf12` | Maestro flows-step timeout guard — a hang fails red, not `cancelled` |
| #107 | `21e8c13` | RNTL 13 → 14, on a real verdict once the Actions outage cleared |
| #110 | `afce763` | the double-`clearState` race, fixed at its cause |
| #111 | `693c62f` | the device log, streamed instead of dumped |
| #112 | `42a76f4` | the jest worker leak — TanStack `gcTime` timers |
| #109 | `7b84844` | the dependency group, triaged peer-graph-first |
| #113 | `3cee165` | **B7.1** — OTA publish + rollback, performed on staging |

## B7.1 — the first real Release Management increment

`ota.yml`'s publish was an `echo` (success while shipping nothing), then a deliberate `exit 1`. It
now runs `eas update`, with a rollback counterpart and a typed confirmation on production. **Both
halves PERFORMED on staging** — publish `31166287897`, rollback `31166824122` — which is §8.4's
standard rather than "configured". `RELEASE_RUNBOOK.md` covers §3.4 and opens with what is **not**
true: three of seven rollback paths have no mechanism, PITR is unavailable, staged rollout is
store-gated.

⚠️ **A successful publish can reach NOBODY.** `runtimeVersion: fingerprint` enforces §2.4 mechanically
*and* means an update whose fingerprint moved reaches no installed app. The job counts matching
finished builds and warns at zero — it fired correctly on its first run. **Not proven: delivery to a
device.**

## The through-line: four fixes were wrong on the first attempt, and running them showed it

1. **#108** failed EVERY E2E run, including one reporting "6/6 Flows Passed" — the emulator action
   runs its `script:` block **one `sh -c` per line**, and aborts at the failing line, so
   `adb logcat -d` never ran. It also proved the pre-existing `exit $flows_status` plumbing had never
   worked. PROJECT_MEMORY **rule 5**.
2. **#111** shipped **green and did nothing** — the ring-buffer theory disproved by `adb logcat -g`.
   Streaming fixed it: **1471 → 12,508 lines**.
3. **#112's guard was VACUOUS** — it counted `gcTime:` in comments; the perturbation reproduced the
   hang while the guard passed.
4. **#113's three eas-cli parsers were ALL wrong**, written from `--help`. Two "worked" while
   silently returning empty fields. Five defects found by running it, incl. an error message
   **unreachable for three weeks** and a backtick that would have executed the command it quoted.

**The rules this session earned** (DECISIONS): *a green proves a change broke nothing; it says
nothing about whether the change did what it claimed* · *`--help` documents flags, not output* · *a
warning that fires on a healthy run is a defect* · *a control never exercised is not a control*.

## Also fixed

- **#110** — a flow now establishes its own preconditions and never cleans up for its successor
  (rule 6). Maestro's order is **not** alphabetical.
- **#112** — `worker process has failed to exit gracefully` was never noise: three suites run alone
  **hang indefinitely**. 429 tests, run **3.76 s → 1.28 s**.

# Modified

`e2e.yml` · `ota.yml` · `scripts/run-maestro-flows.sh` · four `tests/flows/*.yaml` · five mobile test
files · `RELEASE_RUNBOOK.md` (new) · three new conformance tests · tracking docs

# Blockers

1. **~$25/mo paid Supabase** (NFR-15 PITR, launch blocker) · **Apple $99 + Play $25** (B1/B3/B7.4).
2. **NFR-10** — needs a PDD §11 taxonomy addition or a server metrics sink.
3. **§7.2 dashboards** — ADR-025's rollup worker is unbuilt.
4. ⚠️ **Pre-launch: no metric monitor may have an open issue** (two remain, not clearable by hand).
5. **`SVC_health`'s 503 branch** unit-proven, never exercised end to end; legacy Supabase keys are
   platform-deprecated (`readEnv` throws without them).

# Recommended next task

1. **B7.2 — version trains & changelog discipline (§3.1)**, then **B7.3** (flag-disable and Edge
   Function rollback *performed*), then **B7.4** (staged rollout — store-gated).
2. **Declare `@supabase/supabase-js` in `apps/backend`** — imported there as a bare specifier while
   declared only in `apps/mobile`. Same shape as the Execution Gap's undeclared dependencies.
3. **Optionally retitle `693c62f`** (needs a force-push) — its squash title names the disproved
   ring-buffer approach. The correction stands in PROJECT_MEMORY rule 3.
4. **Owner:** paid Supabase · store accounts · NFR-10's path · SHA-pin the nine Actions ·
   **Node 24 with the SDK 55 upgrade** (22 is maintenance-only, EOL 2027-04-30).
