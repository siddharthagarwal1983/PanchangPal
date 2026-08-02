# SESSION.md

# PanchangPal — Current Session

Version: 8.0.0
Last Updated: 2026-08-02 (session end — tracking docs reconciled; RNTL 13 → 14 migrated)

---

# Completed

**Progress unchanged at 50%.** Neither piece advances a Beta slice. Branch
`chore/rntl-14-migration`, commit **`9942763`** — not merged, no PR opened.

## 1. The SLO count was reconciled — and BOTH numbers were right

SESSION.md said three proven; five other docs said two. **TDD Part 5 §7.2 names SEVEN and does not
include NFR-07** — that is from the **Part 1 §8 NFR table**. Both figures were correct; the
denominators had been merged. Fixed by making the distinction explicit rather than picking a number.

Three further staleness items corrected in passing: `SLO_ALERTS.md`'s header still described its own
pre-drill-2 state · ADR-034 still recorded as *Proposed* · DECISIONS.md still calling the §6.6 rule
UNRATIFIED and the SDK 54 pin set "complete".

## 2. RNTL 13.3.3 → 14.0.1

**The breaking change is not the renderer swap — the API went ASYNC.** `render`, `renderHook`,
`fireEvent`, `act`, `rerender`, `unmount` all return Promises; queries stay sync. The bump alone
failed all 33 `packages/ui` tests with "`render` function has not been called". 11 files migrated.

**`test-renderer` pinned at 1.1.0, and the pin is load-bearing** — see DECISIONS.md. 1.2.0's
reconciler peer-requires react `^19.2.0` against the SDK-pinned exact 19.1.0, yet is peer-legal as
far as RNTL is concerned, so pnpm would install it under an unmet transitive peer with CI green.

**Verified:** ui **33/33**, mobile **424/424** — *identical to the baseline taken first*, so nothing
was quietly dropped · vitest 144 (+2 skipped) · tsc 11/11 · eslint 0 errors · `expo export` both
platforms · one perturbation failing exactly the right 3 tests.

# Blockers

1. **~$25/mo paid Supabase** — NFR-15 PITR, a stated launch blocker.
2. **Apple $99 + Play $25** — most of B1/B3.
3. **NFR-10** — needs a PDD §11 taxonomy addition or a server metrics sink.
4. **§7.2 dashboards** — ADR-025's `analytics_event` rollup worker is unbuilt.
5. ⚠️ **Pre-launch: confirm no metric monitor has an open issue.** Two remain from the drills, and
   metric-monitor issues cannot be resolved by hand.
6. **`SVC_health`'s 503 branch** is unit-proven, never exercised end to end.
7. Legacy Supabase keys are platform-deprecated; `readEnv` throws without them.

# Recommended next task

1. **Open a PR for `9942763`** and dispatch one E2E run. Test-infrastructure only — no app code, and
   `test-renderer` never reaches the bundle — so the bar is judgement, not ceremony.
2. **Owner:** paid Supabase · store accounts · NFR-10's path · SHA-pin the nine Actions ·
   decide whether `@types/node` follows the engine floor to 22 (see below).
3. **Node 24 with the SDK 55 upgrade** — 22 is maintenance-only, EOL 2027-04-30.

⚠️ **Named, not fixed:** `.github/dependabot.yml`'s `@types/node` block still cites
`NODE_VERSION: '20.11.0'` and `engines.node: >=20.11.0` after #106 moved CI to **22.23.2**. That
block's own rule is that the types move with the engine floor **deliberately**, so raising them
20 → 22 is an owner call rather than a silent edit.
