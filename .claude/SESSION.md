# SESSION.md

# PanchangPal — Current Session

Version: 2.4.0
Last Updated: 2026-07-26 (offline sync implemented — the launch blocker B6 found)

---

# Completed this session

**Offline sync — the launch blocker is closed at engineering scope.** `STORE_offlineQueue` was an
in-memory zustand slice beneath a header claiming MMKV persistence: never written to disk, never
drained, never dequeued. SVC_sync had been fully implemented server-side since the Backend
Foundation milestone and **nothing in `src/data` bound API_POST_SYNC at all**. Offline the mutation
was lost on app kill; online it worked only because every hook also called its API directly, and
the successful entry then leaked forever.

Shipped, in layers:

- **`domain/sync`** (pure, 17 tests) — FIFO batching, exponential backoff with half-range jitter,
  capped attempts, and reconciliation. A conflict counts as ACKNOWLEDGED (§6.3 resolves by rule);
  anything returned in neither `applied` nor `conflicts` is retried, because assuming a 200 means
  success is exactly how a mutation gets dropped silently.
- **`STORE_offlineQueue`** — persisted through the shared `KeyValueStore` seam, resolved lazily.
- **`syncRepository`** — the missing API_POST_SYNC binding.
- **`syncService`** — single-flight drain, batch loop, non-blocking status. **Nothing is ever
  discarded**: attempts are capped to stop silent retrying, not to drop a completion.
- **`useOfflineSync`** — §6.4's three triggers (connectivity edge, foreground, periodic flush).
- **`queryPersistence`** (§6.1) — the READ half. Without it a cold start offline is empty, so
  §6.2's `[MANDATORY]` offline daily loop could not hold. Allowlisted to §6.1's set; `entitlement`
  and `invite` stay in memory (§6.2 network-only, and the device is not the authority on paid
  access). Built on `dehydrate`/`hydrate` from the declared `@tanstack/react-query` rather than
  `persistQueryClient`, which lives in an undeclared package — reaching into the pnpm store is the
  defect `@babel/runtime` and `babel-preset-expo` already cost this repo twice.

**Proven, not asserted.** Four perturbations, each failing the right tests: persistence disabled
(5 fail), "a 200 means success" (3), an unsyncable kind reintroduced (1), the persist allowlist
ignored (4). 350 mobile tests (+51), 82 vitest, tsc clean, eslint 0 errors, bundle gate green.

# Defects found this session

1. **The client queued five mutation kinds; SVC_sync accepts three.** `preferences` and
   `notif_prefs` hit the handler's `default:` branch — logged as `sync_unknown_kind`, returned in
   neither list, so nothing could ever retire them. `SYNCABLE_KINDS` now narrows the type so those
   hooks cannot compile, and a test reads the kinds out of the handler's SOURCE so the two cannot
   drift. Real offline durability for prefs needs an approved §6.6 conflict rule + a server branch.
2. **Enqueuing before hydration wiped the persisted queue.** Every write persists the whole queue,
   so a write against an un-hydrated store overwrote a previous launch's pending mutations with
   just the new one — losing the completions the store exists to protect. Found by a test that
   failed on its first run; fixed by hydrating before every write.

# Open

- **Not verified against a live backend.** SVC_sync has never been called from the client for real
  — the drain is unit-tested against a fake. Same caveat B6.2's CCPA export carries.
- **No E2E flow.** `FLOW_OFFLINE_SYNC` (airplane mode → complete → kill → restore → assert) is
  unwritten. This is precisely the class a real flow caught for MMKV, and unit tests cannot.
- **STORE_syncStatus has no UI surface** — PDD specifies none, so rendering one would invent UX.
  Owed by PDD, same posture as the eleven missing ERR_* strings.
- §6.4 wants EVT_* on sync confirm; B4.5 fires them from view-model transitions. Unchanged and
  flagged — an `[ASSUMPTION T12]` question, not a defect.
- PDD owes approved copy for 11 of 24 ERR_* codes; SCR_ONBOARDING_* slides remain unbuilt.
- Three Dependabot PRs are red on a jest 30.4.2 runtime/mock mismatch (`clearMocksOnScope`). Main
  is unaffected.

# Blockers (all owner purchases)

1. **Paid Supabase (~$25/mo)** — no PITR, so user data is unrecoverable. NFR-15 unmet; launch blocker.
2. **Sentry org + DSN** (free tier) — the only thing between B4 and done.
3. Apple $99 · Google Play $25 → most of B3.

# Recommended next task

**B6.3 — the rest of B6**: a data-collection inventory built from the code (every table, field and
`EVT_*` the app actually writes), then a draft privacy policy and store Data Safety / App Privacy
answers from it, marked as requiring legal review. It is the last credential-free slice work.

Then: `FLOW_OFFLINE_SYNC` in Maestro, and the residual review findings — zod contracts at the Edge
Function boundaries (M4), `allowBackup=false` plus an explicit network security config (M8).
