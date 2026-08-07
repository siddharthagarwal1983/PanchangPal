# SESSION.md

# PanchangPal — Current Session

Version: 11.0.0
Last Updated: 2026-08-07 (four PRs merged: #108, #107, #110 double-clearState race, #111 streamed
logcat — and #111's first diagnosis was wrong and shipped green)

---

# Completed

**Progress unchanged at 50%.** Nothing here advances a Beta slice. Main: `693c62f`. No open PRs.

## 1. The outage cleared; #108 then #107 merged on real verdicts

**#107 RNTL 13 → 14 (`21e8c13`)** — all five gates **executed** (none `SKIPPED` via `needs:`, the
distinction that made the outage reds vacuous): **vitest 144+2 · ui 33/33 · mobile 424/424, identical
to baseline** · E2E 6/6. **#108 timeout guard (`610bf12`)**.

## 2. ⛔ The guard's first version failed EVERY E2E run — including one where all 6 flows passed

The emulator action runs its `script:` block **one `sh -c` per line**, so the multi-line `if`/`fi`
was a syntax error (exit 2); the action **aborts at that line**, so `adb logcat -d` never ran and the
device log vanished from every red run. It also proved the **pre-existing** `exit $flows_status`
plumbing had never worked. Fixed in `scripts/run-maestro-flows.sh`. PROJECT_MEMORY **rule 5**.

## 3. #110 — the double-`clearState` race is fixed (`afce763`)

**The duplicate was the cause, not the clear**: flows ended with a trailing `clearState` while every
flow needing a clean device already cleared at its start — two `pm clear` calls ~0.5 s apart per
boundary. **New invariant: a flow establishes its own preconditions and never cleans up for its
successor.** Deleting duplicated work, not adding a settle.
⚠️ It would have **stranded `FLOW_MORNING_RITUAL`**, which relied on inheriting a clean device.
⛔ **Maestro's order is not alphabetical**, and a header claiming it was helped justify the trailing
clear. Pinned by `flow-lifecycle.test.ts` (19 assertions, 4 perturbations). PROJECT_MEMORY **rule 6**.

## 4. #111 — the device log was ~85% missing, and my first fix was wrong (`693c62f`)

`adb logcat -d` held only the **last ~20 s of a ~2m20s run**. Past logcat diagnoses all concerned
failures near the END of a suite; that was luck.
⚠️ **The first diagnosis (256K buffer overflow) shipped GREEN and changed nothing** — `adb logcat -g`
showed `16 MiB (701 KiB consumed)`: never full, nothing evicted. **A green run proves a change broke
nothing; it says nothing about whether it did what it claimed.** Fixed by **streaming**: 1471 →
**12,508 lines**, full 148 s — which then independently confirmed #110 (six `clear data` events
10–30 s apart, **zero** `Killing … remove task`).

## 5. Recorded, not fixed

`worker process has failed to exit gracefully` (mobile suite) is **pre-existing on main**, confirmed
against a control branch — not RNTL 14's async API.
⚠️ **`693c62f`'s title on main is stale**: the squash used the PR's original title, which names the
disproved approach. Body and code are correct; amending needs a force-push.

# Modified

`e2e.yml` · `scripts/run-maestro-flows.sh` · four `tests/flows/*.yaml` ·
`apps/backend/tests/e2e/flow-lifecycle.test.ts` (new) · tracking docs

# Blockers

1. **~$25/mo paid Supabase** (NFR-15 PITR, launch blocker) · **Apple $99 + Play $25** (B1/B3).
2. **NFR-10** — needs a PDD §11 taxonomy addition or a server metrics sink.
3. **§7.2 dashboards** — ADR-025's rollup worker is unbuilt.
4. ⚠️ **Pre-launch: no metric monitor may have an open issue** (two remain, not clearable by hand).
5. **`SVC_health`'s 503 branch** unit-proven, never exercised end to end; legacy Supabase keys are
   platform-deprecated (`readEnv` throws without them).

# Recommended next task

1. **`--detectOpenHandles`** on the mobile jest suite for the pre-existing teardown leak.
2. **Optionally retitle `693c62f`** (needs a force-push) — otherwise the correction stands here and
   in PROJECT_MEMORY rule 3.
3. **Owner:** paid Supabase · store accounts · NFR-10's path · SHA-pin the nine Actions · whether
   `@types/node` follows the engine floor 20 → 22.
4. **Node 24 with the SDK 55 upgrade** — 22 is maintenance-only, EOL 2027-04-30.
