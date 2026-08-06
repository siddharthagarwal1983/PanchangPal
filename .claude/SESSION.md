# SESSION.md

# PanchangPal — Current Session

Version: 8.0.0
Last Updated: 2026-08-02 (session end — tracking docs reconciled; RNTL 13 → 14 migrated)

---

# Completed

**Progress unchanged at 50%.** Neither piece advances a Beta slice. Branch
`chore/rntl-14-migration` (`9942763` + `ebba6e2`) is pushed and **PR #107 is open, not merged**.

⛔ **PR #107's CI is red for reasons entirely external — GITHUB ACTIONS MAJOR OUTAGE, 2026-08-06.**
No repository code ran in any of the three runs: the CI gates failed in `Set up job` at
`Getting action download info` (`Service Unavailable`), the other four gates `skipping` via `needs:`,
and E2E `31119803470` was cancelled after 15 minutes queued with **0 steps**. `githubstatus.com`
confirmed `Actions = major_outage`. **Do not re-run into an outage**, and do not record this red as a
result — ask which gate would have had to fail, exactly as with a suspicious green.
⚠️ `in_progress` is not recovery: a job reaches it on runner assignment and still dies in
`Set up job`. Misreading that cost one wasted re-run.

## E2E `31120798108` — cancelled by the owner after hanging, and the artifact settles it

One run DID get past action resolution and ran. It was **hung**, cancelled manually, and the
uploaded artifact is what explains it — the artifact, not the run log, exactly as the Pixel Launcher
ANRs and the offline-sync race both taught.

**Two flows passed completely before the hang:** FLOW_MORNING_RITUAL **18/18** commands COMPLETED and
FLOW_OFFLINE_SYNC **39/39**, with all six screenshots through `offline-sync-06-network-restored`.
Steps 1–13 of the job were green including **Build APK**. So RNTL 14 bundled, compiled, installed and
drove the hardest flow in the suite on a real device.

**Where it hung, exactly** — FLOW_SESSION_PERSISTENCE, on the launch itself:

```
16:54:49.502  Stop com.panchangpal.app            COMPLETED
16:54:49.524  Clear state of com.panchangpal.app  COMPLETED (16:54:50.012)
16:54:50.012  Launch app "com.panchangpal.app"    RUNNING  <- never returned
```

and logcat carries the known fingerprint 11 s earlier:
`16:54:38.675 I/ActivityTaskManager: Destroy timeout of remove-task, attempt to kill
Task{1812ee4 #10 ... com.panchangpal.app}`.

⚠️ **This is the documented launch race in a WORSE form.** The recorded variant fails ~60 s later on
the first assertion; this one hung on `Launch app` indefinitely. The flow already uses the prescribed
three discrete steps — but **FLOW_OFFLINE_SYNC's `onFlowComplete` teardown ran its own `stopApp` +
`clearState` at 16:54:48–49**, so two clear-states landed ~0.5 s apart with no settle. The hazard is
not just the fused `clearState: true`; it is **any** clear racing a neighbouring flow's teardown.

⛔ **AND THE FLOWS STEP HAS NO TIMEOUT, SO A HANG GOES DARK.** `e2e.yml:253` runs
`maestro test tests/flows/` bare, while `Build APK` (line 184) is wrapped in
`timeout --kill-after=2m 40m` — a guard added on 2026-07-25 precisely because a hung Gradle burned to
the job timeout and reported **`cancelled`**, which the workflow's own comment calls "a red build
wearing a timeout's costume, the exact gate-goes-dark failure this milestone exists to remove".
**The fix was applied to the build step and never to the flows step.** Without the manual cancel this
would have consumed the full 90-minute budget and reported `cancelled` — and a cancelled run is not a
red run, so nobody is told.

✅ **FIXED on `fix/e2e-flow-timeout`** (owner-approved): `timeout --kill-after=1m 25m maestro test
tests/flows/`, with 124/137 annotated as **a HANG, not a flow assertion failure**, so the next reader
is not sent hunting for a product defect. 25m cannot clip a healthy suite — two flows completed
inside 60 s in the run above. **Proven, not asserted:** the extracted fragment was run against a
timeout shim reproducing GNU `timeout`'s exit semantics — hang → 124 + annotation, real failure → 1
with no annotation, pass → 0 — and **the logcat dump runs in all three**, so a killed run still
uploads the artifact that holds the per-flow `commands.json`.
⚠️ Kept OFF the RNTL branch deliberately, as #78 was split out of the Sentry branch: a workflow change
and a test-library migration are two different questions and should not share one verdict.

**RNTL 14 is not implicated**, and the reason is evidence rather than "it is test-only": two flows
passed end to end on the built APK, and the hang is Maestro launching into a task Android was still
destroying.

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
