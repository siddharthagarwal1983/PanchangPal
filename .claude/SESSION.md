# SESSION.md

# PanchangPal — Current Session

Version: 4.2.0
Last Updated: 2026-08-01 (the offline-completion race diagnosed correctly and fixed; #79 unblocked)

**Branch `fix/offline-completion-lost-on-kill` (`dd26ef1`), pushed. Progress unchanged at 47%** —
this closes a TDD Part 4 §6 launch blocker inside a slice already counted, exactly as offline sync
and the deletion executor did.

---

# 1. The baseline settles PR #79 — its E2E blocker dissolves

Three runs were dispatched on main at the last session's end. Read this session:

| Run | Commit | Result |
|---|---|---|
| `30390519585` | `ca354f1` | 6/6 green |
| `30391501865` | `ca354f1` | **3/6** |
| `30391533413` | `ca354f1` | cancelled |

Widening to all of 2026-07-28, **main is 3 green / 3 red** with an identical three-flow signature
(OFFLINE_SYNC `☑`, then SESSION_PERSISTENCE and RETURNING as airplane-mode collateral). One red is
`4fdaf10` (#78) — a commit that changed **only** `.github/dependabot.yml` and ADR markdown, so it
cannot have introduced a runtime race. **Sentry never caused it.** #79's Blocker 2 is closed.

# 2. The recorded root cause was wrong

PROJECT_MEMORY said "an asynchronous or batched MMKV write loses to the kill". It does not:
`keyValueStore.set` is MMKV's **synchronous** JSI call inside the tap handler, the library loads
natively every launch, and no `[sync]` warning is ever emitted. **The queue reached disk every
time.**

**Nothing re-applied it to what was rendered.** The tick after a cold start came only from the
persisted query cache — written on a **1 s trailing throttle** and flushed from an unsubscribe
handler **a process kill never runs**. Offline it was also poisoned: the direct write always fails,
and `useChecklist.onError` reverted the optimistic tick although the mutation was durably queued.
The ~50% was whether the process died before or after that revert-plus-throttle write landed.
**The passing runs passed by luck of timing.**

**The rule: a durable queue guarantees DELIVERY, not DISPLAY.**

# 3. What shipped

`domain/sync/pendingProjection.ts` (pure, completion-only per §6.6's union rule) ·
`reapplyPendingMutations` wired into `installQueryPersistence` after restore, writing only to keys
already cached · `onError` reverting only when nothing remains in the queue to deliver the
completion, keyed on the app's own state rather than a vendor's network message ·
`FLOW_OFFLINE_SYNC` gains an `onFlowComplete` teardown restoring the radio, so one defect stops
presenting as three.

**Verified:** 367 mobile jest (+17), 102 vitest, tsc across 11 projects, eslint 0 errors, `expo
export` both platforms, flow YAML parses. **Two perturbations each failed exactly the right test.**

# 4. Device-verified — 5/5 green, 30/30 flows

| Branch run | Result |
|---|---|
| `30706341043` · `30706351403` · `30707302407` · `30707760317` · `30708217181` | **6/6 green, all five** |

Against main's **3 green / 3 red** on the same suite. If the ~50% race persisted, five consecutive
greens would occur ~3% of the time — so this is a verdict rather than a lucky draw, which is exactly
the distinction the corrected re-run heuristic exists to enforce.

⚠️ **Dispatch E2E runs SEQUENTIALLY.** `e2e.yml`'s concurrency group is `e2e-${{ github.ref }}` with
`cancel-in-progress: false`, which permits one *pending* run per ref — an initial batch of four left
two cancelled and yielded two usable samples.

# 5. Merged this session

- **#84 → `45f00c7`** — the offline-completion fix above.
- **#85 → `b8ab528`** — the SDK-pin rule's **third leak**, closed at its cause. `#81` (netinfo) and
  `#63` (jest) are both this gap and were closed with evidence: Expo SDK 54's
  `bundledNativeModules.json` pins netinfo to exactly the installed 11.4.1, and `jest-expo@54.0.17`
  depends on the **jest 29 family** (`@jest/globals`, `babel-jest`, `jest-environment-jsdom`,
  `jest-snapshot`, all `^29.2.1`). **#63's standing triage was wrong** — it sat for two weeks as
  "red for its own unrelated reasons", classified from its red CI rather than its dependency graph,
  which is the exact mistake #78 documented.
  **The durable fix is naming the authoritative source**: every key in
  `node_modules/expo/bundledNativeModules.json` is SDK-pinned by definition. Scanning it against
  every declared dependency found exactly those two gaps and no others, so the SDK 54 set is now
  complete rather than enumerated reactively.

# 6. Then the flow that failed took the session somewhere else

`FLOW_AUTH_SESSION_PERSISTENCE` failed on #79's second E2E sample — tradition reverted to Generic,
the signature that flow calls **identity loss**. It was neither Sentry nor identity.

**`useUpdatePreferences` wrote directly to the server with NO durable path**, so an app kill inside
the request window silently reverted the setting. The flow reads the tradition back as its proof of
identity, so a lost write and a lost identity are indistinguishable there. **That is four
misattributions**: twice to the launch race, once to Sentry, once to an unexplained flake.

Fixed on `fix/durable-preference-writes`: `preferences` is a syncable kind again, with the server
branch and conflict rule it lacked (⚠️ **§6.6 rule UNRATIFIED** — adopts `personal_date`'s LWW as the
nearest ratified precedent; the TDD owes a ruling), the upsert behind a **column allowlist** (the
payload is client-supplied and the function runs as service role — the SVC_account defect in a new
place), and **mutations stamped with the identity that made them**.

**That last part is load-bearing.** Without it, durable preferences would have created a FALSE GREEN
on the suite's most important flow: a drain ignoring identity recreates the tradition under a newly
minted uid, so the flow passes exactly when the defect it guards occurs.

**My own first E2E run failed, and it was my gap, not a flake** — I shipped the durable write path
and left the read half stale (`onServerState` invalidated `['streak']`/`['checklist']`, not
`['preferences']`). Same "durable but never rendered" shape as the offline completion, from the
opposite direction, twice in one day. Also added a fourth drain trigger: identity resolving, since
session restore is async and the mount drain otherwise burns an attempt and waits 60s.

**Verified:** 377 mobile jest, 111 vitest, tsc × 11, eslint 0 errors, bundle gate. Two perturbations
(allowlist removal fails exactly the three redirect/drop tests; revert-guard removal fails exactly
the still-queued test). E2E **6/6 green on run 2** after run 1 exposed the read-half gap.

# Recommended next task

1. **#79 (Sentry)** — rebased onto `45f00c7`, title corrected, **sample 1 green 6/6** with
   `[telemetry] reporter=none` appearing **12 times, once per launch** (Blocker 1's fix confirmed on
   device). Merge on a second green.
2. Owner: `EXPO_PUBLIC_SENTRY_DSN` into EAS (`preview` + `production`) and `SENTRY_DSN` into
   Supabase Edge secrets — GitHub is not where the app or the functions read theirs. Then ratify
   ADR-034.
3. Remaining dependency queue, none SDK-pinned and so all genuine decisions: **#80**
   (supabase-js 2.111.0), **#82** (react-i18next 15→17, major), **#83** (setup-java), **#62**
   (i18next 23→26, major).
