# SESSION.md

# PanchangPal — Current Session

Version: 9.0.0
Last Updated: 2026-08-06 (session end — #107 opened, no CI verdict on a GitHub Actions outage; E2E
hang diagnosed; flows-step timeout gap fixed)

---

# Completed

**Progress unchanged at 50%.** Nothing this session advances a Beta slice.

## 1. PR #107 opened for RNTL 14 — and it has NO CI VERDICT

`chore/rntl-14-migration` (`9942763` · `ebba6e2` · `f259be2`) pushed; **#107 open, not merged.**

⛔ **GitHub Actions was in a MAJOR OUTAGE all session** (`githubstatus.com`, still red at session
end). Both CI attempts died in **`Set up job`** at `Getting action download info`
(`Service Unavailable`); the other four gates read `skipping` only via `needs:`. One E2E run sat
**queued 15 min with 0 steps**, cancelled platform-side.
⚠️ **A red can be vacuous exactly as a green can** — ask which gate would have had to fail; none
reached the code. ⚠️ **`in_progress` is not recovery** (runner assigned, still dies in `Set up job`)
— that misreading cost a wasted re-run.

## 2. The E2E hang — RNTL 14 is not implicated

E2E `31120798108` ran, hung, and was cancelled by the owner. The artifact settles it:
**FLOW_MORNING_RITUAL 18/18** and **FLOW_OFFLINE_SYNC 39/39** passed on a green **Build APK**, then
FLOW_SESSION_PERSISTENCE hung on `Launch app` 0.5 s after its own `clearState` — itself following
FLOW_OFFLINE_SYNC's teardown, with `Destroy timeout of remove-task` in logcat 11 s earlier.
**Maestro Rule 1's three discrete steps are necessary and NOT sufficient: the clear can race a
*neighbouring* flow's teardown.** Recorded as rule 4 in PROJECT_MEMORY.

## 3. `fix/e2e-flow-timeout` (`fb1a2fe`) — a hang fails red instead of going dark

`maestro test tests/flows/` ran bare while `Build APK` has had `timeout --kill-after=2m 40m` since
2026-07-25: **the guard was applied to one step and never the other**, so a hang burns 90 min and
reports `cancelled`, which nobody reads as red. Now capped at 25m, 124/137 annotated as **a HANG, not
a flow failure**, **proven** against a GNU-`timeout` shim and dumping logcat in every branch. Off
`main`, **not PR'd** — it should not land on vacuous reds.

# Modified

`.github/workflows/e2e.yml` (fix branch) · eight `.claude/*.md` tracking documents

# Blockers

1. ⛔ **GitHub Actions outage** — both branches unverified. Clears on its own.
2. **~$25/mo paid Supabase** (NFR-15 PITR, launch blocker) · **Apple $99 + Play $25** (B1/B3).
3. **NFR-10** — needs a PDD §11 taxonomy addition or a server metrics sink.
4. **§7.2 dashboards** — ADR-025's `analytics_event` rollup worker is unbuilt.
5. ⚠️ **Pre-launch: confirm no metric monitor has an open issue** (two remain, not clearable by hand).
6. **`SVC_health`'s 503 branch** unit-proven, never exercised end to end.
7. Legacy Supabase keys are platform-deprecated; `readEnv` throws without them.

# Recommended next task

1. **When Actions recovers, in order:** PR `fix/e2e-flow-timeout` · re-run #107's five gates ·
   **one** E2E run (sequential per ref) · merge #107 on that evidence.
2. **The double-`clearState` race** — deliberately unfixed; a settle can mask a race real users hit.
3. **Owner:** paid Supabase · store accounts · NFR-10's path · SHA-pin the nine Actions · whether
   `@types/node` follows the engine floor 20 → 22 (`dependabot.yml` still cites the stale `20.11.0`).
4. **Node 24 with the SDK 55 upgrade** — 22 is maintenance-only, EOL 2027-04-30.
