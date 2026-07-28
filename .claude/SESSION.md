# SESSION.md

# PanchangPal — Current Session

Version: 4.0.0
Last Updated: 2026-07-28 (session end — SDK-pin rule + ADR-034 merged; Sentry open and blocked)

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

# Open — PR #79, `feat/sentry-telemetry`, deliberately NOT merged

Sentry is wired behind both ports (client + Edge Functions), PII scrubbing structural, Expo config
plugin for source maps. Two blockers, both found by verification rather than review:

1. ⛔ **Crash-free sessions are NOT measurable as built**, and this session claimed otherwise across
   five documents before catching it. `getTelemetryAdapter()` is called only from inside the two
   error handlers, so `Sentry.init` runs only after the FIRST ERROR: a healthy session never starts
   one and native crash capture never installs. Fix is a one-line startup resolution plus a test that
   fails without it.
2. ⛔ **A deterministic red E2E whose mechanism is unconfirmed.** Three flows failed twice on the
   identical commit (main is 6/6 green); green once after `isUsableDsn()`. **One green run after a
   deterministic red is not a verdict.**

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

**Fix the Sentry startup-init defect on `feat/sentry-telemetry`** — one line in AppProviders plus a
test that fails without it — then re-run E2E for **two consecutive greens**. That closes both
blockers together, which is exactly why they were not stacked.

Then owner actions: a free-tier **Sentry org + DSN** (closes B4), and **ratify ADR-034**.
Still open and unchanged: #62 (i18next) and #63 (jest 30), each its own decision.
