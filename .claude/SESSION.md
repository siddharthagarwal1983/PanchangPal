# SESSION.md

# PanchangPal — Current Session

Version: 1.11.0
Last Updated: 2026-07-22

---

# Session Objective

Verify that a ritual session survives a process restart — the last free engineering item in B1/B2/B3.

**That question is still unanswered.** Everything below is what stood between it and an answer.

---

# The E2E gate has produced no signal since 2026-07-19

The last completed E2E run was 2026-07-19 11:59 UTC (build 19 min, flows 2/2). `expo-updates`
landed at 15:48 UTC that day (PR #24), bringing Kotlin/KSP into the Android build. Since then:
six runs **cancelled** by `cancel-in-progress` when pushes raced, and the first uncontended run —
this session's — killed by `timeout-minutes: 45` still building.

**A cancelled run is not a red run.** Nothing announced a failure, so DASHBOARD kept citing the
2026-07-19 result for three days. Same shape as the placeholder gates this milestone removed, one
layer up.

Fixed in PR #32: `cancel-in-progress: false`, timeout 45 → 90, a Gradle cache, and building **one
ABI instead of four** (the emulator is x86_64; three quarters of the native build was discarded).

---

# Issue #30 — dates were computed in UTC, not the user's zone

Found while reading the ritual code. Both Today and Ritual derived the day with
`new Date().toISOString().slice(0, 10)` — UTC by definition, used as `local_date`, which the
schema documents as "user-tz date (client-authoritative)" under a one-per-day unique constraint.

In **New Zealand and Australia that named yesterday for the entire local morning** — the morning
ritual, in two of three primary launch markets. It type-checked perfectly; only the value was
wrong. IST agrees with UTC 18.5 hours a day, which is why local testing never saw it.

Second defect, same lines: module-scope constants, so an app open across midnight kept yesterday's
date — and that value keys ritual session storage, so an in-progress ritual became unreachable.

Fixed in PR #31 (4 commits): the tz utility ADR-026 always mandated but nobody wrote; adopting the
device zone into `user_profile.timezone`, which **nothing had ever written**; `useLocalDate` in the
screens; and an ESLint rule, proven to fail by reintroducing the exact expression.

---

# iOS runs in Expo Go

Manifest + bundle fetch as Expo Go does: HTTP 200, 8.55 MB. Load with `exp://192.168.1.10:8081`.
Session persistence **cannot** be verified there — MMKV is absent from Expo Go, so the store
degrades to memory by design.

---

# Verification

176 mobile + 14 shared tests · tsc clean · eslint 0 errors across 7 packages · iOS bundle builds ·
PR #31 CI: lint/typecheck, unit/component/a11y, secret scan all pass.

---

# Open

- **Session persistence: still unverified.** No run has reached the emulator.
- PRs #31, #32 open; docs checkpoint is this branch.
- Local Android build needs `JAVA_HOME` + `ANDROID_HOME` (not in the shell profile); machine is at
  **99% disk**, which killed a local build at `mergeReleaseNativeLibs`.
- Onboarding still unreachable — `ONBOARDED = true`, `app/index.tsx:16`.

# Recommended Next Task

Land #31 and #32, then re-run E2E and read the persistence verdict from the flow plus its logcat.
