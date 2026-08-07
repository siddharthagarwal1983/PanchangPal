# SESSION.md

# PanchangPal — Current Session

Version: 10.0.0
Last Updated: 2026-08-07 (Actions recovered; #108 and #107 merged; the flows guard was broken and
CI caught it — the emulator action runs one `sh -c` PER LINE)

---

# Completed

**Progress unchanged at 50%.** Neither merge advances a Beta slice.

## 1. The outage cleared, and both branches got real verdicts

`githubstatus.com` Actions = **operational**, 0 incidents. Yesterday's three reds were confirmed
vacuous and discarded rather than re-read.

**#107 (RNTL 13 → 14) merged as `21e8c13`.** All five CI gates **executed** — none `SKIPPED` via
`needs:`, which is the distinction that made the outage reds meaningless. Against its stated bar:
tsc ×11 ✅ · eslint 0 errors ✅ · **vitest 144 +2 skipped · ui 33/33 · mobile 424/424, identical to
baseline** ✅ · `expo export` both platforms ✅ · **E2E 6/6 on device** ✅.

**#108 (flows-step timeout guard) merged as `610bf12`**, first.

## 2. ⛔ The guard as written (`fb1a2fe`) FAILED EVERY E2E RUN — caught by running it

E2E `31145793824`: **"6/6 Flows Passed in 2m 23s"** and the step went **red, exit 2**.

**`reactivecircus/android-emulator-runner` executes its `script:` input ONE LINE AT A TIME, each in
its own `sh -c`.** So the multi-line `if`/`fi` was a syntax error, and `flows_status=$?` was assigned
into a shell that exited immediately. Two consequences:

1. A green suite goes red.
2. The action stops at the failing line, so **`adb logcat -d` never ran**. Verified against the
   artifacts: the failed run holds the six `commands.json` and **no `maestro-logcat.txt`**; the green
   run holds it. **The device log went missing on exactly the runs that need it** — the opposite of
   what the PR body claimed.

**This also proves the PRE-EXISTING `set +e` / `exit $flows_status` plumbing never worked.** Failures
propagated only because a non-zero line fails the action directly. `e2e.yml`'s comment that "the
flows' exit status is preserved" described a mechanism that was not running — the milestone's
signature defect again.

**Fixed structurally in `scripts/run-maestro-flows.sh`**, invoked as one line: one shell parses one
program, so the bug class is unreachable rather than avoided by careful one-lining.

**Verified with a control** — behaviour (0 / 1 / 124 / 137, annotation only on a hang, logcat in
every branch) · the workflow block replayed one `sh -c` per line · **the old inline block replayed
the same way DOES reproduce the syntax error**, so the harness is not vacuous · and on device
(`31146852463`) **6/6 in 2m 20s with `maestro-logcat.txt` present at 927 KB**.

⚠️ **The earlier shim test was not wrong — it tested the wrong layer.** Same shape as the
`process.env` unit test that passed while the bundler path failed.

## 3. Recorded, not fixed

The mobile suite's `worker process has failed to exit gracefully` warning is **pre-existing on
main** — confirmed against a control branch, not attributed to RNTL 14's async API.

# Modified

`.github/workflows/e2e.yml` · `scripts/run-maestro-flows.sh` (new) · tracking docs

# Blockers

1. **~$25/mo paid Supabase** (NFR-15 PITR, launch blocker) · **Apple $99 + Play $25** (B1/B3).
2. **NFR-10** — needs a PDD §11 taxonomy addition or a server metrics sink.
3. **§7.2 dashboards** — ADR-025's `analytics_event` rollup worker is unbuilt.
4. ⚠️ **Pre-launch: confirm no metric monitor has an open issue** (two remain, not clearable by hand).
5. **`SVC_health`'s 503 branch** unit-proven, never exercised end to end.
6. Legacy Supabase keys are platform-deprecated; `readEnv` throws without them.

# Recommended next task

1. **The double-`clearState` race** — still deliberately unfixed. The guard now makes it fail red
   rather than go dark, so it needs thought, not a sleep.
2. **`--detectOpenHandles`** on the mobile jest suite for the pre-existing teardown leak.
3. **Owner:** paid Supabase · store accounts · NFR-10's path · SHA-pin the nine Actions · whether
   `@types/node` follows the engine floor 20 → 22 (`dependabot.yml` still cites the stale `20.11.0`).
4. **Node 24 with the SDK 55 upgrade** — 22 is maintenance-only, EOL 2027-04-30.
