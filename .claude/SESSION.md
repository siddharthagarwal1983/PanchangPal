# SESSION.md

# PanchangPal — Current Session

Version: 5.1.0
Last Updated: 2026-08-02 (part 2 — the dependency queue is empty; three PRs merged; 47%)

**Progress unchanged at 47%** — dependency hygiene advances no Beta slice. All four queued PRs are
resolved, and two of the four were not what they were filed as.

⛔ **"THE QUEUE IS EMPTY" WAS TRUE FOR FOUR MINUTES.** Dependabot re-ran against the new lockfile the
moment the merges landed and opened **five fresh majors** (#89–#93) at 05:29–05:31 — majors are not
in the `production-minor` group, so they arrive individually. The claim is corrected here rather than
left standing. **One of them is a real finding: see "A fourth leak" below.**

---

# Merged

| PR | Commit | What |
|---|---|---|
| #87 | `da9e945` | Dependabot proposes MAJOR action bumps only (closes #83) |
| #88 | `652831d` | i18next 23→26 + react-i18next 15→17 as **one** increment (closes #62, #82) |
| #80 | `715e2de` | `@supabase/supabase-js` 2.110.9 → 2.111.0 |

**Closed with evidence, as #64/#65/#75 were:** #83, #82, #62.

# The finding: #82 and #62 were always one change

`react-i18next@17.0.11` peer-requires **`i18next >= 26.2.0`**; the repo had 23.16.8. They sat in the
queue for a week as two independent items — one green, one red.

**#82 was GREEN on all five gates while shipping a violated peer.** Its own lockfile said so:
`react-i18next@17.0.11(i18next@23.16.8)` beneath `i18next: '>= 26.2.0'`. **pnpm records an unmet peer
without failing.** Fourth instance of green being anti-correlated with safety, after mmkv v2,
`babel-preset-expo`, and #64/#65 — and the **first by a mechanism unrelated to the SDK pin**: neither
package is in `bundledNativeModules.json`, so that rule never applied.

**#62's red was the other half**, and its message pointed nowhere near #82: i18next 26 removed
`compatibilityJSON`, whose type now admits only `'v4'`.

# The trap inside it, and the guard that caught my own error

`compatibilityJSON: 'v3'` was not incidental — its comment recorded a **runtime** reason (Hermes
ships a partial Intl). Flipping it to `'v4'` clears the type error and changes device behaviour: the
**#75 `react-test-renderer` pattern** exactly. Checked against the installed i18next source instead —
`PluralResolver`'s constructor touches no Intl, and `new Intl.PluralRules()` is lazy inside a
`getRule` that catches and degrades. The original justification does not survive v26.

**My first guard asserted "no call site passes `count`" and failed on its first run.** `streak.label`
and `household.memberCount` both do. The real invariant is narrower: both use `count` only as an
**interpolation variable** and no `_one`/`_other` variants exist, so the suffixed lookup misses and
falls back to the base key. **The invalidating condition is a plural-suffixed KEY, not a `count` call
site.** The test now runs the real bundle with `Intl.PluralRules` **deleted** rather than grepping.

# #83 was not an upgrade

All nine actions are **major-pinned**, and publishers move the major tag — so `@v5` already gets 5.x.
Merging `5 → 5.6.0` would have **frozen** one action while eight float, and `JAVA_VERSION: '17'` is
set separately, so it changed nothing. #87 fixes the cause: the `github-actions` block had no
`update-types` filter and would have regenerated it monthly, for every action.

# Verified

`tsc` 11/11 · eslint **0 errors** (16 warnings, baseline) · **418 mobile jest (+5)** · 118 vitest ·
`expo export` ios + android · **E2E 6/6 on device for both #88 and #80** (runs `30733670783`,
`30733470569`), including `FLOW_AUTH_SESSION_PERSISTENCE` — the flow guarding the auth-js storage
adapter that #80's bump moves. Perturbation on the new test: adding `label_one`/`label_other` fails
exactly three assertions, controls green. Main re-verified green after all three merges.

⚠️ **One E2E sample each, not a verdict.** Main's suite is no longer the ~50% race it was before #84,
so a single 6/6 is meaningful — but the corrected re-run heuristic says one sample cannot rule out a
low-rate flake.

# A fourth leak of the SDK-pin rule, and a correction to permanent memory

**#89 proposes `babel-preset-expo` 54.0.12 → 57.0.5.** That is SDK 57's line — majors track SDK
majors, exactly as `@expo/metro-runtime`'s do. It is pinned by **`expo@54.0.36`'s own direct
dependency range, `~54.0.12`**, and **no ignore pattern matches it** (`expo-*` does not match a
`babel-preset-` prefix — the same shape as the `@expo/` and `@react-native-community/` misses).

**It falsifies a claim this repo recorded a week ago.** PROJECT_MEMORY said scanning
`bundledNativeModules.json` "found those two gaps and no others, so the SDK 54 set is now complete."
**The manifest lists NATIVE modules.** It is authoritative in one direction only — a hit means
SDK-pinned — and says nothing about SDK-pinned *build* packages, which never appear in it. The check
is two-sided: the manifest, **plus** `expo`'s own dependency ranges. Corrected in PROJECT_MEMORY.

That `babel-preset-expo` is the leak is pointed: it is one of the two undeclared transitive
dependencies that broke bundling during the Execution Gap, and the dependabot config already says it
**gets extra care, not less**.

**The rest of the new batch, untriaged:** #90 `@testing-library/react-native` 13→14 (the package
whose `ensure-peer-deps.js` asserts `react-test-renderer === react` exactly — see #75) · #91
`@sentry/cli` 2→3 (declared in #79 specifically to fix pnpm resolution for `sentry.gradle`) · #92
`@babel/core` 7→8 · #93 `zod` 3→4 (`packages/api` contracts, and the OpenAPI conformance test).

# Blockers

1. **B4.4 is still open; B4 does not close.** §7.2 SLO dashboards and alerts do not exist, and §8.4
   holds that alerting never triggered is a plan, not a capability.
2. **Unverified:** Sentry ingest (needs the dashboard), the Edge Function path (needs a real server
   error), source-map upload (`e2e.yml` disables it deliberately).
3. ⚠️ **The §6.6 `preferences` conflict rule is UNRATIFIED** and shipped in merged code — LWW, the
   nearest ratified precedent. `resolvePreferences` is the only place a ruling lands.
4. **Not answered, and made moot rather than resolved:** whether Hermes actually ships
   `Intl.PluralRules`. Android's Intl lives in the prebuilt AAR, not the npm package. The test
   removes the dependence on the answer; the first plural key restores it.
5. Paid Supabase (~$25/mo, NFR-15) · ADR-034 ratification · Apple $99 + Play $25 · JDK 17 for local
   Gradle builds.

# Recommended next task

1. **Confirm events in the Sentry dashboard**, then filter alerts to `environment:production` so CI
   `preview` runs do not page.
2. **B4.4** — §7.2 dashboards + alerts, proven by a deliberate trigger rather than configured. The
   last engineering increment in B4.
3. **Owner:** ratify ADR-034; rule on the §6.6 `preferences` conflict rule. Decide whether to
   SHA-pin all nine GitHub Actions (#87 records the case and deliberately left it open).
