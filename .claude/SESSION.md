# SESSION.md

# PanchangPal — Current Session

Version: 2.0.1
Last Updated: 2026-07-26 (End Session — B2 and B5 complete; E2E regression from #50 fixed in #53)

---

# Completed

**B2 — E2E verification ✅.** The E2E build had been failing in `assembleRelease` and then hanging to
the job timeout, so `cancelled` disguised a red build (fixed, PR #35). With it fixed,
`FLOW_SESSION_PERSISTENCE` ran and caught a real defect: `react-native-mmkv@2` cannot install its JSI
bindings under the New Architecture, so ritual sessions silently ran on memory and never survived a
restart. Fixed by v2→v4 (#36); three flows green on a native build.

**B4 — Observability, 3 of 4 increments.** Client `TelemetryAdapter` wired at both error call sites
(#39); the `AnalyticsService` port over `analytics_event` (#40); the Edge Function seam plus
preflight `SENTRY_*` requirements and a release gate that blocks a production build with Sentry
unconfigured (#42); the PDD §11.4 daily habit funnel now emitting, EVT_017 included (#43).

**B5 — Reliability & DR ✅ at verifiable scope.** Runbooks for §8.3's five scenarios and a mechanised
restore drill (#46); the §8.2 degradation policy, exhaustive over the ERR_* taxonomy (#48); §8.4
operator resilience and the onboarding gate (#50).

**Also:** the analytics insert-only contract gated in pgTAP and verified against hosted staging
(#44); the API contract gate B1 de-declared, restored as a real one and proven to fail by three
perturbations (#45); two E2E false reds traced to an emulator ANR dialog and fixed (#41).

# Defects found

MMKV v2 vs the New Architecture · EVT_054 shipped `code`/`surface` where PDD §11.2 specifies
`error_code`/`screen_id` · a `set -e` bug in the release gate, caught pre-commit · emulator ANR
dialogs failing flows against a healthy app · Supabase **filtering** rather than refusing
unauthorised writes (a `throws_ok` assertion would have proven nothing) · `const ONBOARDED = true`,
which blocked FLOW_ONBOARDING and hid an unbuilt screen set for two milestones.

# Open

- **I broke main's E2E with PR #50, and fixed it in #53.** Making the onboarding gate real changed
  what a FRESH device does on first launch — a CI emulator has no stored state, so the app correctly
  opened on SCR_AUTH_001 while all three pre-existing flows launched and asserted Today. 4/4 red,
  with the app behaving correctly and the flows asserting the old behaviour. The three flows now skip
  the gate conditionally; FLOW_ONBOARDING's own assertion was also wrong (Maestro regex-matches the
  WHOLE element text, and the deferred-auth sentence is part of one subtitle string). **The lesson is
  mine, not the gate's:** changing first-launch behaviour necessarily changes what every flow sees on
  a fresh emulator, and I should have worked that through before merging rather than learning it from
  a red main. Unit tests, typecheck, lint and the bundle gate all passed it straight through.
- **A pending E2E run was cancelled by a later merge.** With `cancel-in-progress: false`, a
  concurrency group keeps only the most recent *pending* run, so three rapid merges (#49/#50/#51)
  displaced #50's queued run before it started — the same "a cancelled run reads as no signal"
  pathology PR #32 fixed, in a residual form. Main's tip carries the same code, so coverage is
  deferred rather than lost, but the mechanism is worth closing.
- **PDD owes approved copy for 11 of 24 ERR_* codes** — pinned by a test in `AWAITING_APPROVED_COPY`.
- **SCR_ONBOARDING_* slides remain unbuilt**; the gate no longer hides that.

# Blockers (all owner purchases)

1. **Paid Supabase (~$25/mo)** — no PITR means user data is unrecoverable. **NFR-15 is unmet, and
   this is a launch blocker**, not a B1 chore.
2. **Sentry org + DSN** (free tier) — the only thing between B4 and done.
3. Apple $99 · Google Play $25 → most of B3.

# Recommended next task

**B6 — Security & Privacy** (§5/§6): OWASP Mobile review, CCPA export/delete verified end to end
(F-3/F-10), store privacy labels. The next unstarted slice, and entirely credential-free.
