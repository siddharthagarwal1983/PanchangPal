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

⚠️ **NOT device-verified.** Four E2E runs were dispatched; the concurrency group
(`e2e-${{ github.ref }}`) allows one pending run per ref, so two were cancelled — **dispatch
sequentially, not in a batch.** A ~50% race needs enough samples to beat the failure rate.

# Recommended next task

1. **Read the branch E2E runs and compare against main's 3/3.** Dispatch more, sequentially.
2. If green across enough samples, **open the PR**; then **merge #79**, whose blocker is now closed.
3. Owner: `EXPO_PUBLIC_SENTRY_DSN` into EAS + `SENTRY_DSN` into Supabase Edge secrets; ratify
   ADR-034. Still open: #62, #63, #80–#82 (**#81 is the SDK-pin defect again**).
