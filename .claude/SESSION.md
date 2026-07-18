# SESSION.md

# PanchangPal — Current Session

Version: 1.8.0
Last Updated: 2026-07-18

Date/Time: 2026-07-18.

---

# Session Objective

Produce a runnable demo of the completed Mobile MVP. No feature work planned.

The session became a defect hunt: **the app had never been run**, and six faults had to be fixed
before it would start. Work happened on `chore/expo-sdk-54-upgrade`, six commits, not merged.

---

# Work Completed

**Bundling (the app could not build for any platform)**
- `metro.config.js`: `disableHierarchicalLookup = true` breaks pnpm's nested layout, hiding
  expo-router's own dependencies. Set false with an explanatory comment.
- `metro.config.js`: added a `resolveRequest` shim retrying NodeNext `.js` specifiers without the
  extension — workspace packages are consumed as TS source and tsc/jest remap those, Metro does not.
  Fixed here rather than repointing `packages/*` `exports` at `dist/`, because Edge Functions
  consume that contract via the Deno import map.
- Declared `@babel/runtime`, injected by Babel into every transpiled file, previously unresolvable.

**Expo SDK 51 → 54** (required: Expo Go supports only the newest SDK, and an iOS development build
needs a paid Apple Developer membership, which is not held)
- expo 54.0.36, expo-router 6.0.24, RN 0.81.5, React 19.1, reanimated 4.1.7, New Arch default.
- reanimated 4 moved its Babel plugin to `react-native-worklets/plugin`; SDK 54 needs explicit
  `plugins` in `app.config.ts`; RTL 13 dropped `extend-expect` (both jest configs); `packages/ui`
  aligned to React 19 and had `safe-area-context` pinned, which had been dragging RN 0.74 types in.
- `@expo/metro-runtime` 3.2.3 → 6.1.2, clearing 18 resolution warnings per bundle.

**Runtime**
- `i18n`: `compatibilityJSON: 'v3'` — Hermes has no `Intl.PluralRules`. Inert today (no `_plural` keys).
- `supabase/config.toml`: seeding disabled (it ran against an empty schema because migrations live
  outside the CLI path, rolling the stack back) and an `[auth]` section added enabling anonymous
  sign-ins, without which this anonymous-first app cannot boot locally.
- **`src/data` Realtime bug**: three repositories reused a fixed channel topic; supabase-js returns
  the already-subscribed channel on remount and `.on()` throws, crashing SCR_YOU_001. Added
  `realtimeChannelId.ts` for per-subscription topics; relaxed one over-specific assertion; added a
  regression test. This is the only genuine product defect of the six.

---

# Files Created (2)
apps/mobile/src/data/realtimeChannelId.ts · apps/mobile/.env (gitignored, local demo config)

# Files Modified (14)
.gitignore · apps/mobile/{metro,babel,jest}.config · app.config.ts · package.json ·
packages/ui/{package.json,jest.config.cjs} · pnpm-lock.yaml · supabase/config.toml ·
src/i18n/index.ts · src/data/{subscription,featureFlag,household}Repository.ts (+1 test)

---

# Verification

tsc clean (mobile + ui) · eslint 0 errors / 14 pre-existing warnings · **121 tests pass**
(120 → 121, +1 regression test) · iOS and Android bundles HTTP 200 · local Supabase: 14 migrations,
32 tables, seeded, anonymous JWT issued · app boots on a physical iPhone via Expo Go and renders
Today / Calendar / Ask Guru / You.

**Not verified:** native runtime under the New Architecture — no Xcode or simulator in this
environment. B3 is the first real test of the SDK 54 baseline.

---

# Blockers (unchanged)
Canonical Panchang Engine (ADR-033). Ask Guru `GURU_LIVE` gate. Backend SVC_revenuecat_webhook +
SVC_household + SVC_notify_scheduler remain pending server deliverables.

# New known defects (open, not fixed)
- Nine `src/data/` repositories default-construct with `getSupabase()`, so absent config throws
  during route module evaluation and renders "Page could not be found" instead of a calm error
  state. Generalize the lazy `??=` already in `authRepository.ts:30`.
- `react-native-mmkv` is not available in Expo Go, so the Ritual screen crashes there at any SDK
  version. Behind the `KeyValueStore` port; a development build (B3) removes the constraint.

---

# Pending Work

Branch `chore/expo-sdk-54-upgrade` is **unmerged and unreviewed** (6 commits). It re-baselines the
mobile platform, so it wants a careful review before landing on main. TASK.md remains **B1 —
Environments & secrets (fail-closed)**; B2 has gained a CI bundle gate.

---

# Recommended Next Task

Review and merge `chore/expo-sdk-54-upgrade`, then **B1 — Environments & secrets**. Consider
pulling B2's bundle gate forward: it is a few lines of CI, and it is the control that would have
caught three of this session's six defects at M1. See the Execution Gap section in
CURRENT_MILESTONE.md.
