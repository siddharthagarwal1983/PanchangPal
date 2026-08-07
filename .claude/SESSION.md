# SESSION.md

# PanchangPal — Current Session

Version: 13.0.0
Last Updated: 2026-08-07 (six PRs merged and the queue is empty — and three of them had a first
version that was wrong, each caught by running it rather than reading it)

---

# Completed

**Progress unchanged at 50%.** No Beta slice advanced. Main: `7b84844`. **No open PRs.**

| PR | Commit | What |
|---|---|---|
| #108 | `610bf12` | Maestro flows-step timeout guard — a hang fails red instead of reporting `cancelled` |
| #107 | `21e8c13` | RNTL 13 → 14, on a real verdict once the Actions outage cleared |
| #110 | `afce763` | the double-`clearState` race, fixed at its cause |
| #111 | `693c62f` | the device log, streamed instead of dumped |
| #112 | `42a76f4` | the jest worker leak — TanStack `gcTime` timers |
| #109 | `7b84844` | the dependency group, triaged peer-graph-first |

## The through-line: three fixes were wrong on the first attempt, and running them showed it

1. **#108's first version failed EVERY E2E run**, including one reporting "6/6 Flows Passed". The
   emulator action runs its `script:` block **one `sh -c` per line**, so the multi-line `if`/`fi` was
   a syntax error — and because the action aborts at that line, `adb logcat -d` never ran and the
   device log vanished from every red run. It also proved the **pre-existing** `exit $flows_status`
   plumbing had never worked. PROJECT_MEMORY **rule 5**.
2. **#111's first version shipped GREEN and did nothing.** The 256K-ring-buffer theory was disproved
   by `adb logcat -g` (`16 MiB, 701 KiB consumed` — never full). Streaming fixed it properly:
   **1471 → 12,508 lines**, the full 148 s.
3. **#112's guard was VACUOUS** — it counted `gcTime:` in comments, so the perturbation reproduced
   the hang while the guard still passed.

**The rule this session earned:** *a green proves a change broke nothing; it says nothing about
whether the change did what it claimed.* Name the number it should move, and read that number.
Recorded in DECISIONS with a third variant — **#109's green described a tree four merges old**
(424 tests where main had 429).

## Two defects that were never noise

- **#110** — flows ended with a trailing `clearState` while the next flow cleared at its start: two
  `pm clear` calls ~0.5 s apart per boundary. **A flow now establishes its own preconditions and
  never cleans up for its successor** (rule 6). Maestro's order is **not** alphabetical, and a header
  claiming it was helped justify the trailing clear.
- **#112** — `A worker process has failed to exit gracefully` printed on every mobile run for the
  life of the suite. **Three suites run alone HANG INDEFINITELY.** `--detectOpenHandles` cannot find
  it (it implies `--runInBand`, so no worker exists). 429 tests, run **3.76 s → 1.28 s**.

# Modified

`e2e.yml` · `scripts/run-maestro-flows.sh` · four `tests/flows/*.yaml` · five mobile test files ·
two new conformance tests (`flow-lifecycle`, `queryClientGcTime`) · tracking docs

# Blockers

1. **~$25/mo paid Supabase** (NFR-15 PITR, launch blocker) · **Apple $99 + Play $25** (B1/B3).
2. **NFR-10** — needs a PDD §11 taxonomy addition or a server metrics sink.
3. **§7.2 dashboards** — ADR-025's rollup worker is unbuilt.
4. ⚠️ **Pre-launch: no metric monitor may have an open issue** (two remain, not clearable by hand).
5. **`SVC_health`'s 503 branch** unit-proven, never exercised end to end; legacy Supabase keys are
   platform-deprecated (`readEnv` throws without them).

# Recommended next task

1. **Declare `@supabase/supabase-js` in `apps/backend`** — imported there as a bare specifier while
   declared only in `apps/mobile`. Resolves today; same shape as the `@babel/runtime` /
   `babel-preset-expo` defects that broke bundling during the Execution Gap.
2. **Optionally retitle `693c62f`** (needs a force-push) — its squash title names the disproved
   ring-buffer approach. The correction stands in PROJECT_MEMORY rule 3.
3. **Owner:** paid Supabase · store accounts · NFR-10's path · SHA-pin the nine Actions · whether
   `@types/node` follows the engine floor 20 → 22.
4. **Node 24 with the SDK 55 upgrade** — 22 is maintenance-only, EOL 2027-04-30.
