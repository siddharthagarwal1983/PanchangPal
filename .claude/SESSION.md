# SESSION.md

# PanchangPal — Current Session

Version: 1.10.0
Last Updated: 2026-07-19

---

# Session Objective

"How do I get a demo of the app?" The answer turned out to be that **the app had never been
executed** — not in CI, not locally, not anywhere — and nothing in the pipeline could have said so.

14 PRs merged. 12 defects fixed. B1/B2/B3 moved from documented intent to verified behaviour.

---

# What changed

**The app runs.** Six defects had to be fixed before it would start: three bundle-blockers
(Metro/pnpm resolution, undeclared `@babel/runtime`, workspace `.js` specifiers), two
local-backend faults (`supabase start` always rolled back; anonymous auth disabled), and one
crashing product bug (three repositories reusing a fixed Realtime channel topic). It now runs on
an iPhone via Expo Go, on an Android emulator, and as three native APKs.

**The platform was re-baselined to Expo SDK 54** (RN 0.81, React 19, New Architecture). Forced,
not chosen: Expo Go supports only the newest SDK, and an iOS development build needs a paid Apple
membership. Verified by bundling, 161 tests, Expo Go, and three native Android builds.

**CI executes the app.** A bundle gate (`expo export`, ios+android) runs on every PR — proven to
FAIL on a reintroduced resolver defect, not merely to pass. It would have caught three of the
twelve defects at M1.

**CD stopped overstating itself.** Six placeholders were found where the milestone had recorded
two. Four removed; the two manual deploy jobs (`promote-production`, `publish-ota`) now fail
loudly, because a job that silently reports a successful production promotion is worse than one
that is missing.

**Environments are real.** dev provisioned, migrated (32 tables), seeded, anonymous auth verified.
Staging likewise, plus a DB password rotation after an exposure. CD now seeds staging on every
deploy.

**Releases are automated.** `eas.json`, store identifiers, Hermes pinned, and `release-build.yml`
producing a signed APK unattended from a `v*` tag or dispatch, behind a credential probe.

**E2E exists.** Two Maestro flows — `FLOW_RETURNING` (23 steps) and `FLOW_MORNING_RITUAL` (14
steps) — green locally on arm64 and in CI on x86_64, 2/2 in 46s on the first CI run.

---

# Six defects found only by looking

Once the app ran, screenshots found what no gate could: the tab bar rendering all twelve routes;
nothing focused inside nested stacks; today never marked in the calendar (**this one typechecked
perfectly** — an optional prop plus object spread accepted `isToday` as excess and `today` as
absent); the ritual screen crashing on MMKV; "Light the lamp" repeated five times from a seed that
was not idempotent; and `babel-preset-expo` undeclared, which broke every native build.

Full ledger in CURRENT_MILESTONE.md → Execution Gap.

---

# Verification

161 tests · tsc clean · eslint 0 errors · iOS+Android bundles · 3 native APKs · E2E 2/2 in CI ·
dev + staging both 32 tables and seeded.

---

# Android signing key leaked and rotated (issue #25)

**B7 shipped (PR #24) and leaked the Android keystore doing it.** `git add -A` swept
`@siddharth2008__panchangpal.jks` — the signing identity for `com.panchangpal.app` — into commit
`3357884` on a public repository.

**Rotated the same day, which closed it.** The leaked keystore (alias `6767934f…`) was deleted from
EAS and replaced; the build default is now alias `42f01e40…`, created `2026-07-19T16:02:54Z`. Nothing
had shipped to Play, so no Play App Signing rotation was needed. The published copy signs nothing.

**The history rewrite was a mistake and is not repeatable.** `git filter-repo` + force-push changed 30
SHAs on `main` and permanently stripped GPG Verified badges from merged PR commits — and did not
remove the key: `refs/pull/24/head` still serves it, and GitHub PR refs cannot be deleted. Rotation
was the fix; the rewrite bought nothing. Recorded in DECISIONS.md so it is not retried.

**The credential list is now clean.** The rotation left two orphan keystores (`4c414b1b…`,
`e6220a41…`) and an empty credential entry; all three were deleted via the EAS GraphQL API by
explicit UUID rather than the interactive TUI, which labels credentials with generated names and
gives no on-screen signal of which one is the live default. `com.panchangpal.app` now has exactly one
entry — alias `42f01e40…`, default, fingerprint unchanged across the deletions.

Any test device holding an old-key build must uninstall before installing a new one — signature
mismatch blocks the update.

---

# Blockers (unchanged)

Canonical Panchang Engine (ADR-033). Ask Guru `GURU_LIVE` gate. SVC_household,
SVC_notify_scheduler, SVC_revenuecat_webhook remain pending server deliverables.

# Open, gated on money or decision

- **prod Supabase** (~$25/mo) — free tier is 2/2; the last engineering-independent item in B1
- **Apple Developer** ($99/yr) — iOS builds and TestFlight
- **Google Play** ($25) — Play Internal track
(The Android keystore backup was here. Resolved 2026-07-19: key rotated, backup stored off-machine,
local copies deleted. See issue #25.)

# Open defects, documented not fixed

Onboarding unreachable — `ONBOARDED = true` is hardcoded at `app/index.tsx:16`. CI validates
migrations on pg15 (`ci.yml:151`, and `supabase/config.toml` pins `major_version = 15`) while dev and
staging run pg17, so migrations are proven on a major version neither environment uses.

Session persistence is now **observable** but still **unverified**: `getStorageBackend()`
(`src/data/ritualSessionRepository.ts:38`) exposes the backend and the app logs when it degrades, so a
failure is no longer silent — but nobody has confirmed a session actually survives a restart.

Two entries that stood here were already fixed and are removed: the silent memory fallback (PR #24)
and the seven eagerly-constructing repositories (all ten `src/data` repositories use the lazy
`(this._db ??= getSupabase())` getter).

---

# Recommended Next Task

**Confirm the production keystore is in a password manager.** Issue #25 is otherwise closed — key
rotated, credential list down to one entry — but EAS is now the sole holder of the only key that can
sign updates to `com.panchangpal.app`, and the orphan copies that were an accidental fallback are
gone. This is the last unverified item and the only one that is unrecoverable if wrong.

**Then B1's remainder is a payment decision, not engineering.** `expo-updates` is installed and the
storage fallback is observable (PR #24), so the free items are spent.

If money is available: the prod Supabase project closes B1, and ~$124 of store accounts closes
most of B3.
