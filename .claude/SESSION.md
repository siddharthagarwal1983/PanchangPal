# SESSION.md

# PanchangPal — Current Session

Version: 3.0.0
Last Updated: 2026-07-28 (the #61 dependency split)

**Main is at `0185ea9`, clean.** Merged this session: `0185ea9` #74 — the seven non-SDK bumps split
out of Dependabot's `production-minor` group. **Progress unchanged at 47%**; dependency hygiene
advances no Beta slice.

---

# Completed

**The #61 split (PR #74).** Seven bumps landed on their own: `@typescript-eslint/eslint-plugin` and
`parser` 8.63.0→8.65.0, `prettier` 3.9.5→3.9.6, `turbo` 2.10.4→2.10.7, `@supabase/supabase-js`
2.110.2→**2.110.9**, and both `@tanstack/*` 5.101.2→5.101.4.

`@supabase/supabase-js` resolves to 2.110.9, not the 2.110.8 #61 names — a further patch shipped
after Dependabot opened it, inside the declared `^2.110.8` range.

**`react`, `@types/react` and the lockfile's `react@19.1.0` peer keys were deliberately left
behind.** Bumping `react` 19.1.0→19.2.8 past the exactly-pinned SDK 54 baseline while
`react-test-renderer` stays at 19.1.0 is the **single** cause of the group's red CI.

**Verified:** all five CI gates green on the PR and reproduced locally beforehand — eslint 0 errors
(16 warnings, its baseline), tsc clean across 11 projects, 102 vitest + 33 ui + 350 mobile, and
`expo export --platform all` for both platforms. The lockfile diff is confined to the seven plus the
peer-key rewrites the parser bump forces through `eslint-plugin-import` and `eslint-module-utils`.
Post-merge on main: CD green; **E2E red on attempt 1, green 6/6 on attempt 2 of the same commit.**
See "The E2E red" below — it was the harness, and the bump was investigated before being cleared.

**The launch race is closed across the suite.** All three flows that opened with
`launchApp: clearState: true` — AUTH_SESSION_PERSISTENCE, ONBOARDING, SESSION_PERSISTENCE — now use
the three discrete `stopApp` / `clearState` / `launchApp` steps FLOW_OFFLINE_SYNC adopted. The
tracked "latent E2E hazard" is no longer latent: it fired.

**Also reconciled:** DASHBOARD and PROJECT_STATUS still carried "owner: enable `pg_cron`" as an open
blocker. It was enabled and confirmed on both hosted projects on 2026-07-27 — the same day the entry
was written. Both are corrected.

# The E2E red, and why it was not written off

Main went red immediately after the merge: 5/6 flows passed and
**FLOW_AUTH_SESSION_PERSISTENCE failed at step 21**, the assertion that tradition is still Bengali
after a restart. The hierarchy dump showed it reverted to `generic` — which the flow's own header
documents as meaning **the identity was lost**, the exact defect `secureSessionStorage.ts` exists to
prevent.

**It was not dismissed as a flake, because the merge was a live suspect.** `@supabase/supabase-js`
carries its sub-packages in lockstep, so the bump moved **`@supabase/auth-js` 2.110.2 → 2.110.9** —
the package that owns `persistSession` and the custom `storage` adapter this flow guards. "A
dependency bump broke session persistence" and "the known harness race fired" predict the same
screenshot.

**Re-running the identical commit settled it: 6/6 green.** A deterministic regression cannot pass on
re-run, so the bump is cleared as the cause. Stated precisely: this rules out a *deterministic*
break, not a probabilistic one. If that flow fails again, auth-js goes back on the suspect list.

**The actual cause was the documented launch race**, in the flow that could least afford it: logcat
shows `Destroy timeout of remove-task, attempt to kill Task{...#13}` 130ms into the flow's own
cleared launch. Now fixed in all three flows that open that way.

**The lesson this repeats:** the evidence was in the uploaded artifact — the hierarchy dump and
`device-logcat.txt` — and appears nowhere in the run log. Third time.

# Findings

1. **The previous triage's cause was right and this session confirmed the mechanism** — jest stays
   at 29.7.0; the break is `react` crossing the SDK pin. Worth restating because the triage *before*
   that one guessed jest and was wrong.
2. **`pnpm` is no longer on PATH on the dev Mac** — Node 26 dropped corepack from the Homebrew
   install. `npx --yes pnpm@9.6.0` (the `packageManager` version) works. A bare `pnpm install` now
   fails with `command not found`; that is the toolchain, not the repository.
3. **`pnpm format:check` fails on 248 files, and prettier 3.9.6 did not cause it** — proven by
   running 3.9.5 and 3.9.6 against the tree and getting an identical 248. Pre-existing; not a CI
   gate. The repo should decide deliberately whether to adopt it or drop the script.

# Open

- ⚠️ **`executed_at` is unwritable** — `account_deletion` cascades with its own subject, so a
  completed deletion leaves no record. Contradicts TDD Part 2 §5.1. **The TDD owes a resolution.**
- ⛔ **No worker consumes the `job` table** — investigated 2026-07-27 and deliberately not built;
  every `job_type` is blocked on a product or vendor decision.
- **⛔ SVC_notify_scheduler is a shell** — `loadDueCandidates()` returns `[]` unconditionally. Do not
  schedule it.
- **Apple 5.1.1(v) requires an in-app deletion screen** — needs a PDD affordance and SVC_household.
- Nothing in the privacy documents is legally reviewed.
- ~~**A latent E2E hazard**~~ — **CLOSED 2026-07-28.** It stopped being latent: it fired on
  FLOW_AUTH_SESSION_PERSISTENCE. All three flows opening with a cleared launch now use three
  discrete steps. `FLOW_MORNING_RITUAL` and `FLOW_RETURNING` still end without cleanup — that is the
  other half of the fix and is deliberately not done, because the discrete-step opening makes each
  flow robust regardless of what its predecessor left behind, which is the more local guarantee.
- PDD owes approved copy for 11 of 24 ERR_* codes; SCR_ONBOARDING_* slides unbuilt.
- **Four Dependabot PRs open** — #61 (react remainder), #64, #65 all cross the SDK 54 pin; #62
  (i18next) and #63 (jest 30) are red for their own reasons.

# Blockers

1. **Paid Supabase (~$25/mo)** — no PITR; user data unrecoverable. NFR-15 unmet, launch blocker.
2. **Sentry org + DSN** (free tier) — the only thing between B4 and done.
3. Apple $99 · Google Play $25 → most of B3.

# Recommended next task

**The SDK-upgrade increment: #61's `react` remainder + #64 + #65 together.** All three cross the
exactly-pinned SDK 54 baseline. `react-test-renderer` must move with `react`, and the result needs a
**native build plus the six Maestro flows** — the only method that has caught this class of change
here before. Local Android builds now work on the dev Mac, so it is iterable without CI round trips.
