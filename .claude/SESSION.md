# SESSION.md

# PanchangPal — Current Session

Version: 2.6.0
Last Updated: 2026-07-26 (End Session — offline sync + docs + actions bump merged; deps triaged)

**Main is at `d3218f9`, clean and green.** Merged this session: `86b3843` offline sync (#66) ·
`21e24f9` session docs (#67) · `d3218f9` the Dependabot actions group (#60, verified by dispatching
E2E on its branch first, since it edits `e2e.yml` and E2E never runs on PRs — 5/5 flows on
`bf66e42`).

---

# Completed

**Offline sync — implemented, verified, merged as `86b3843` (PR #66).** The launch blocker B6's
review surfaced. `STORE_offlineQueue` was an in-memory zustand slice beneath a header claiming MMKV
persistence — never written to disk, never drained, never dequeued — and **nothing in `src/data`
bound API_POST_SYNC at all**, so SVC_sync (implemented server-side since the Backend Foundation
milestone) was unreachable from the app. Offline, a completion was lost on app kill; online it
worked only because every hook also called its API directly, and the successful entry then leaked.

Shipped in layers, decisions pure and effects thin:

- **`domain/sync`** — FIFO batching, exponential backoff with half-range jitter, capped attempts,
  reconciliation. A conflict counts as ACKNOWLEDGED (§6.3 resolves by rule); anything returned in
  neither `applied` nor `conflicts` is retried. Attempts cap to stop silent retrying, **never to
  discard a completion**.
- **`STORE_offlineQueue`** persisted through the shared `KeyValueStore` seam · **`syncRepository`**
  (the missing binding) · **`syncService`** (single-flight drain) · **`useOfflineSync`** (§6.4's
  three triggers) · **`queryPersistence`** (§6.1 read cache — without it a cold start offline is
  empty and §6.2's `[MANDATORY]` daily loop cannot hold).

**Verification.** Four perturbations each failed the right tests. 350 mobile tests (+51), 82
vitest, tsc clean, eslint 0 errors, bundle gate green. **E2E dispatched on the branch before merge**
(run 30207484940, `a05760d`): **5/5 Maestro flows passed**, FLOW_ONBOARDING and FLOW_RETURNING
included — the ones that would have caught the two new startup effects disturbing a fresh launch.

**The app now runs natively on this machine, for the first time.** Android SDK cmdline-tools + an
AOSP arm64 API-34 system image installed, AVD `ppal_aosp34` created, `expo prebuild` + Gradle
`assembleDebug` run locally, app installed and launched. Today renders; panchang correctly shows
"temporarily unavailable" (ADR-033) and the streak reads 0 (no `.env`, so no backend — repositories
degrade rather than crash, the PR #14 fix working).

# Defects found

1. **The client queued five mutation kinds; SVC_sync accepts three.** `preferences`/`notif_prefs`
   hit the handler's `default:` branch, returned in neither list, so nothing could ever retire
   them. `SYNCABLE_KINDS` narrows the type so those hooks cannot compile, and a test reads the
   kinds out of the handler's SOURCE so the two cannot drift.
2. **Enqueuing before hydration wiped the persisted queue** — a write against an un-hydrated store
   overwrote the previous launch's pending mutations. Caught by a test that failed on first run.

# Open

- **Offline sync has never run against a live backend**, and there is **no `FLOW_OFFLINE_SYNC`
  Maestro flow** — the class of gap a real flow caught for MMKV and unit tests structurally cannot.
- **`STORE_syncStatus` has no UI surface** — PDD specifies none; rendering one would invent UX.
- **Doc/workflow drift: E2E runs 5 flows, not 4.** `FLOW_AUTH_SESSION_PERSISTENCE` was added in B6
  and never counted; `e2e.yml`'s step-summary echo also still lists only four names. Corrected in
  the tracking docs this session; **the workflow echo is still owed** (a code change, not a doc).
- §6.4 wants EVT_* on sync confirm; B4.5 fires them from view-model transitions. Flagged, unchanged.
- PDD owes approved copy for 11 of 24 ERR_* codes; SCR_ONBOARDING_* slides remain unbuilt.
- **Five Dependabot PRs are open and deliberately NOT merged.** Triaged at session close; main is
  unaffected by all of them. Do not merge these without reading why:
  - **Red — merging puts main red.** #63 jest 29.7.0→30.4.2 (`this._moduleMocker.clearMocksOnScope
    is not a function` — all five `@panchangpal/ui` suites fail to *run*, 0 tests execute) · #62
    i18next 23→26 · #61 the production-minor group of 9, whose single failure is most likely the
    same jest break arriving transitively — worth confirming, because a *minor* group failing is
    the odd one.
  - **Green but crossing a pinned boundary.** #64 `@expo/metro-runtime` 6.1.2→**57.0.7** against a
    manifest pinning `~6.1.2` and an installed copy peer-bound to `expo@54.0.36` (57 belongs to a
    much later SDK) · #65 `@babel/runtime` 7.29.7→**8.0.0** against `@babel/core@7.29.7`, an
    unsupported pairing — and `@babel/runtime` is the package whose absence broke every bundle
    (Execution Gap defect #2). **Their green is weaker than it looks**: the bundle gate is
    `expo export`, which can pass while the runtime breaks, and **no dependency PR has ever been
    exercised on a device**, because E2E does not run on PRs. Both belong in a deliberate SDK
    upgrade increment where a native build and the flows actually validate them.

# Blockers (all owner purchases)

1. **Paid Supabase (~$25/mo)** — no PITR; user data unrecoverable. NFR-15 unmet, launch blocker.
2. **Sentry org + DSN** (free tier) — the only thing between B4 and done.
3. Apple $99 · Google Play $25 → most of B3.

# Recommended next task

**B6.3 — the rest of B6**: a data-collection inventory built from the code (every table, field and
`EVT_*` the app actually writes), then a draft privacy policy and store Data Safety / App Privacy
answers derived from it, marked as requiring legal review. The last credential-free slice work.

Cheap follow-ups worth folding in: correct `e2e.yml`'s flow-name echo, and write
`FLOW_OFFLINE_SYNC` now that a local emulator makes iterating on it fast.
