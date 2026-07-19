# SESSION.md

# PanchangPal — Current Session

Version: 1.9.0
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

# Blockers (unchanged)

Canonical Panchang Engine (ADR-033). Ask Guru `GURU_LIVE` gate. SVC_household,
SVC_notify_scheduler, SVC_revenuecat_webhook remain pending server deliverables.

# Open, gated on money or decision

- **prod Supabase** (~$25/mo) — free tier is 2/2; the last engineering-independent item in B1
- **Apple Developer** ($99/yr) — iOS builds and TestFlight
- **Google Play** ($25) — Play Internal track
- **Android keystore backup** — free, and currently a single point of unrecoverable failure
- **`expo-updates` not installed** — the OTA channels in eas.json and ota.yml reference nothing

# Open defects, documented not fixed

Session persistence unverified and deliberately unobservable (silent memory fallback); seven
`src/data` repositories still construct eagerly; onboarding unreachable (`ONBOARDED = true`);
CI validates migrations on pg15 while both environments run pg17.

---

# Recommended Next Task

**B1's remainder is a payment decision, not engineering.** The cheapest genuinely useful next
steps: back up the Android keystore (free), install `expo-updates` so B7 can begin (free), and
make the storage fallback observable so session persistence stops being a coin flip.

If money is available: the prod Supabase project closes B1, and ~$124 of store accounts closes
most of B3.
