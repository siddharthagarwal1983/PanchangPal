# SESSION.md

# PanchangPal — Current Session

Version: 4.1.0
Last Updated: 2026-07-29 (session end — offline completion lost on app kill; Sentry blocker 1 closed)

**Main is at `4fdaf10`** (#78). **Progress unchanged at 47%** — nothing this session advanced a Beta
slice, and saying so is the point.

---

# Merged (#78, all six gates green incl. the DR drill)

**The SDK-pinned dependency rule.** The "SDK-upgrade increment" the previous session queued **does
not exist**: #64, #65 and #75 were three symptoms of one gap in `.github/dependabot.yml`'s ignore
**patterns**, checked against the installed peer graph and all closed with their evidence
(`expo-router`'s `^6.1.2` peer and `@expo/metro-runtime`'s SDK-major dist-tags; `babel-preset-expo`'s
`^7.20.0` peer; react-native's Fabric renderer hardcoded to React `"19.1.0"`). The list now covers
`react`, `@types/react`, `@expo/*`, `@babel/runtime`.

**ADR-034 — Account-Deletion Audit Record (Proposed).** TDD **Part 5 §5.1** requires the audit row to
outlive the erasure; **Part 2 §3.15** cascades it away with its own subject. Neither is wrong — one
row is being asked to have two lifetimes. The ADR separates request from audit, retires the
unwritable `executed_at`, and refers **what identifies the subject of a completed erasure** to
Security/Privacy with Legal sign-off. Seven mis-citations of "Part 2 §5.1" corrected — that section
is *Identity, Onboarding & Profile*, API contracts with no threat model.

# ⛔ THE FINDING THAT MATTERS — an offline completion is sometimes LOST ON APP KILL

Chasing the Sentry red E2E found a **product defect, not a Sentry defect**, and it is a launch
blocker under TDD Part 4 §6 ("no failure may lose a completion").

**The failing assertion is `FLOW_OFFLINE_SYNC` line 131 — AFTER the process kill, not before it.**
Proven by which screenshots exist in the artifact: `offline-sync-03-offline-completed` (line 111,
right after the *first* `☑` assertion) IS captured; `offline-sync-04-survived-restart-offline` is
NOT. So the optimistic tick appears correctly and is gone after `stopApp` / `launchApp`. That is the
assertion the flow's own header calls **"THE ASSERTION THIS FLOW EXISTS FOR"**.

**It is intermittent (~50%), which is a race, not a broken path.** The flow taps, asserts,
screenshots, then kills the process immediately — if the MMKV write of `STORE_offlineQueue` is
asynchronous or batched, the kill beats it. A real user completing a ritual offline whose app is
then reclaimed by the OS hits exactly this. **MMKV loads natively in every run** (verified in
logcat), so this is NOT the old mmkv-degradation bug — it is a narrower timing window.

**Do not "fix" it by adding settle time to the flow.** That hides a race users can hit.

**Why it masqueraded as a Sentry regression:** a new native module shifts startup and runtime
timing, which changes the odds of a latent race. Enough to make an unrelated defect look correlated.

**Baseline in flight at session end** — three `e2e.yml` runs dispatched on **main** (no Sentry code
at all) to establish whether this is pre-existing: `30390519585` (6/6 green), `30391501865`,
`30391533413`. If main flakes the same way, #79's E2E blocker dissolves and this becomes its own
issue. **Check those runs first next session.**

# ⚠️ A methodological correction worth more than the finding

I concluded twice that the red was deterministic and therefore caused by my change, reasoning "a
deterministic break cannot pass on re-run". **That inference was wrong**, and the flaw generalises:
the re-run heuristic assumes the two runs are **independent trials**. Two E2E runs minutes apart
share an emulator profile, a staging backend and a timing environment — they are correlated samples.
A ~50% race can present as two identical failures and read as determinism.

**Corrected rule: a re-run discriminates flake from determinism only across enough samples to beat
the failure rate.** This branch went 3/6, 3/6, 6/6, 5/6, 6/6, 3/6 — six runs to see it. One re-run
would have "proved" either answer depending on when you looked.

# Open — PR #79, `feat/sentry-telemetry`, deliberately NOT merged

Sentry is wired behind both ports (client + Edge Functions), PII scrubbing structural, Expo config
plugin for source maps. Two blockers, both found by verification rather than review:

1. ✅ **CLOSED — crash-free sessions were not measurable as built.** `getTelemetryAdapter()` was
   reachable only from inside the two error handlers, so `Sentry.init` ran only after the first
   error: no session ever started in a healthy run and native crash capture never installed. **Fixed**
   by resolving the adapter in AppProviders' mount effect, guarded by a behavioural test **proven to
   fail** when the resolution is removed. **Verified on device**: `[telemetry] reporter=none` appears
   **11 times** in the E2E artifact — once per launch — where previously nothing resolved at all.
   (That absence had been misread as "console.log is stripped in release builds". It is not; the
   line comes through fine. Nothing was resolving the adapter, which was the whole defect.)
2. 🟡 **The red E2E is now attributed elsewhere — see the finding above.** It is an intermittent
   offline-persistence race in the app, reproduced on the branch six times at ~50%, and the main
   baseline is in flight to confirm it is pre-existing. `isUsableDsn()` was very likely a **no-op**:
   `reporter=none` shows Sentry JS never initialised in any of these builds, so the earlier
   "instrumentation caused it" hypothesis is substantially weakened. It survives only if EAS holds a
   **placeholder** DSN — worth one look, since that is the difference between "the fix worked" and
   "I mistook a race for a regression".

# Findings worth keeping

1. **Green CI is anti-correlated with safety for an SDK-pinned package** — #64 and #65 passed all
   five gates including the bundle gate; only the peer-legal #75 was red, and for a symptom whose
   "obvious fix" would have hidden the real mismatch.
2. **`@sentry/cli` was unresolvable under pnpm** — the THIRD instance of the `@babel/runtime` /
   `babel-preset-expo` defect. Caught only by the native build.
3. **The Sentry upload task fails the build rather than skipping** — a comment of mine asserted the
   opposite; corrected in place.
4. **Two of three E2E failures were collateral** from FLOW_OFFLINE_SYNC dying before its
   airplane-mode restore — the "breaks its neighbours" pattern, recurring.
5. **MMKV was suspected and cleared** — logcat shows it loading natively. Disproved, not assumed.

# Blockers

1. **Paid Supabase (~$25/mo)** — no PITR; NFR-15 unmet, launch blocker.
2. **Sentry org + DSN** (free tier) — everything else in B4 is built.
3. Apple $99 · Google Play $25 → most of B3.
4. ⚠️ **Local native builds are broken** — only JDK 26 is installed and Kotlin's version parser
   rejects `"26.0.1"`. A JDK 17 restores local Gradle + Maestro iteration; until then native
   verification goes through CI, which made this session's two defects expensive to find.

# Recommended next task

1. **Read the three main baseline runs first** (`30390519585` green, `30391501865`, `30391533413`).
   They decide whether the offline-persistence race is pre-existing. If main flakes the same way,
   **#79's E2E blocker dissolves** and the race becomes its own issue.
2. **Then chase the race itself** — is `STORE_offlineQueue`'s MMKV write synchronous before the
   process can die? §6 forbids losing a completion, so this is a launch blocker either way. Fix the
   persistence, not the flow.
3. **Make `FLOW_OFFLINE_SYNC`'s radio restore failure-proof.** It restores connectivity as its LAST
   step, so any earlier failure leaves airplane mode on and takes two innocent flows down with it.
   That cascade is why one defect looked like three for most of this session.

Owner actions, unchanged: **`EXPO_PUBLIC_SENTRY_DSN` into EAS** (`preview` + `production`) and
`SENTRY_DSN` into **Supabase Edge secrets** — the four GitHub secrets are placed and validated, but
GitHub is not where the app or the functions read theirs. Then **ratify ADR-034**.
Still open: #62 (i18next), #63 (jest 30), and #80–#82 — of which **#81 is the SDK-pin defect again**
(`@react-native-community/*` is not matched by the `react-native-*` pattern; commented on the PR).
