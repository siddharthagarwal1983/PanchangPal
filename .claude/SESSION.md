# SESSION.md

# PanchangPal — Current Session

Version: 5.2.0
Last Updated: 2026-08-02 (part 2 — dependency queue worked; Sentry ingest confirmed; CI was reporting as production; 47%)

**Progress unchanged at 47%** — dependency hygiene advances no Beta slice. All four queued PRs are
resolved, and two of the four were not what they were filed as.

⛔ **"THE QUEUE IS EMPTY" WAS TRUE FOR FOUR MINUTES.** Dependabot re-ran against the new lockfile the
moment the merges landed and opened **five fresh majors** (#89–#93) at 05:29–05:31 — majors are not
in the `production-minor` group, so they arrive individually. The claim is corrected here rather than
left standing.

**Those five were then triaged the same way** — two-sided SDK check, then the installed peer graph.
Result: **#93 merged** (zod 4, genuinely peer-legal), **#89 / #91 / #92 closed** as SDK-pinned by
three *different* mechanisms via **#94**, and **#90 left open** as real work. **Only one open PR
remains, and it is a wanted upgrade rather than a defect.**

---

# Merged

| PR | Commit | What |
|---|---|---|
| #87 | `da9e945` | Dependabot proposes MAJOR action bumps only (closes #83) |
| #88 | `652831d` | i18next 23→26 + react-i18next 15→17 as **one** increment (closes #62, #82) |
| #80 | `715e2de` | `@supabase/supabase-js` 2.110.9 → 2.111.0 |
| #93 | `ea71ce6` | `zod` 3.25.76 → 4.4.3 |
| #94 | `1d035ce` | The SDK-pin check is two-sided (closes #89, #91, #92) |
| #98 | `a724519` | CI was reporting itself as production — B4.4 precondition |

**Closed with evidence, as #64/#65/#75 were:** #83, #82, #62, #89, #91, #92.
**Nine dependency PRs resolved; one left open (#90) as real work.**

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

# The second batch, triaged (#89–#93)

| PR | Verdict | Mechanism |
|---|---|---|
| **#89** `babel-preset-expo` 54→57 | Closed via **#94** | `expo@54.0.36` depends on it as `~54.0.12`; majors track SDK majors |
| **#92** `@babel/core` 7→8 | Closed via **#94** | Pinned by the **babel 7 plugin family**, no declared peer; v8 is **ESM-only** and every plugin `require()`s it |
| **#91** `@sentry/cli` 2→3 | Closed via **#94** | `@sentry/react-native@7.2.0` depends on it at **exactly `"2.55.0"`** |
| **#90** RNTL 13→14 | **Left open** | Not pinned by either side — a real migration, see below |
| **#93** `zod` 3→4 | **MERGED** `ea71ce6` | Genuinely peer-legal |

**Three different pinning mechanisms in one batch**, none of which the manifest reports: a direct
SDK dependency range, a transitive plugin family, and a vendored exact version. The list is less
useful than the shape.

⚠️ **#91 is the clearest case yet that a green gate can be VACUOUS.** It passed all five gates —
and **had to**: `e2e.yml` sets `SENTRY_DISABLE_AUTO_UPLOAD: 'true'` and **no gate runs
`sentry.gradle` at all**, so `@sentry/cli`'s only consumer is never exercised. **Ask which gate would
have to fail**; if none touches the package's consumer, the colour carries no information. Third
distinct mechanism behind this signature, after native resolution and unenforced peers.

**#93 is the one that survived, and it survived the check that killed #82.**
`zod-validation-error@4.0.2` peer-requires `zod: ^3.25.0 || ^4.0.0` — **satisfied**, not merely
unenforced. API usage is basic (`z.string/object/number/enum/array/boolean`), no production code
consumes zod error shapes, and the 16 OpenAPI conformance tests pass under zod 4 — with a positive
*and* a negative assertion, so they cannot be vacuously green. Verified locally on the branch before
merging: tsc 11/11, 118 vitest.

**#90 is left OPEN, deliberately not ignored.** RNTL 14 replaces the `react-test-renderer` peer with
**`test-renderer@^1.0.0`**, which fails the entire `packages/ui` suite — a migration with a named
scope, not a bump. Ignoring a wanted upgrade is the "looks like coverage" failure the config's own
header warns about. Worth recording: RNTL 14 **removes the `react-test-renderer === react` assertion
that made #75 red** — but it does not unblock `react`, which stays SDK-pinned for the independent
Fabric-renderer reason. It removes the *detector*, not the constraint.

# Sentry ingest is confirmed — and confirming it found a defect

**Ingest works.** 91 sessions, release `0.1.0`, 1 error captured, Crash Free Sessions 100%. Sessions
existing at all is the direct evidence `AppLifecycleIntegration` installed. The stray
`react-native-9n` project (created by the failed `sentry-wizard` run on 2026-07-28 — its 33-byte log
is just `pnpm: command not found`, the documented corepack breakage) has been deleted by the owner.

⛔ **BUT CI WAS REPORTING ITSELF AS PRODUCTION** (fixed, **#98** `a724519`). `sentryEnvironment()`
derived the environment from `extra.eas.channel`, **which only EAS Build stamps**. `e2e.yml` builds
with `expo prebuild` + `gradlew assembleRelease` on the runner — no channel — and `__DEV__` is false
in a release APK, so it fell through to `'production'`. It pulls a REAL DSN via
`eas-cli env:pull --environment preview`, so this was live.

**Evidence, not inference:** the artifact's logcat shows the DSN resolving to project
`4511814237290496`, which is the `panchangpal-mobile` id in the dashboard URL; sessions climbed
**87 → 91 while a `main` E2E run was mid-flight** with no user activity. At 12 launches per run,
essentially all 91 sessions were CI.

**Two consequences.** "100% crash-free" was measuring an emulator — worse than a sampling caveat,
because those sessions were **labelled** production. And `environment:production`, the alert scope
§7.2 wants, **would have paged on every CI run**. This had to land before any alert exists.

⚠️ **Historical CI sessions stay labelled `production`** — the fix is forward-only. Treat the
crash-free figure as meaningless until `ci`-tagged or real-user sessions accumulate.

# My first attempt at that fix broke the suite — both defects kept in history

Run `30735155676`: **4/6 flows failed against main's 6/6 on two runs** — a real regression,
established by baseline rather than by re-running.

1. **`echo "..." >> .env` had no leading newline.** `eas env:pull` does not guarantee a trailing one,
   so the line concatenated onto the **last variable's value**:
   `EXPO_PUBLIC_SUPABASE_URL=https://real.supabase.coEXPO_PUBLIC_SENTRY_ENVIRONMENT=ci`. The name
   still parses, so the file looks fine while the value is garbage. A corrupted Supabase URL fails
   every backend call — four flows failed, the two not needing a backend passed, and it read as a
   product defect. **The build log had said so: `env: export` listed three names, mine absent.**
2. **The override was read from `process.env` only**, relying on Babel inlining `EXPO_PUBLIC_*`; the
   gradle-driven `export:embed` path did not deliver it. It now reads
   `Constants.expoConfig.extra.sentryEnvironment`, threaded through `app.config.ts` exactly as
   `sentryDsn` is — the path proven to work in CI every run.

**The second is the worse one: the broken path PASSED its unit test**, because jest sets
`process.env` directly and never exercises the bundler. The perturbations were sound and told me
nothing, because they tested the wrong layer.

**Device-verified (`30735709985`), all three checks named in advance:** the variable now appears in
`env: export`; **6/6 flows**; **12 × `[telemetry] reporter=sentry env=ci`**.

# Blockers

1. **B4.4 is still open; B4 does not close.** §7.2 SLO dashboards and alerts do not exist — the
   dashboard shows "Create Alert", i.e. **zero rules**, confirmed rather than assumed. §8.4 holds
   that alerting never triggered is a plan, not a capability. **Its precondition is now met**: the
   environment a build reports is correct and observable, so `environment:production` finally means
   something. Closing B4 takes the milestone **47% → 50%**.
2. **Unverified:** the Edge Function path (needs a real server error), source-map upload (`e2e.yml`
   disables it deliberately). **Sentry ingest is now CONFIRMED** — 91 sessions in the dashboard.
3. ⚠️ **The §6.6 `preferences` conflict rule is UNRATIFIED** and shipped in merged code — LWW, the
   nearest ratified precedent. `resolvePreferences` is the only place a ruling lands.
4. **Not answered, and made moot rather than resolved:** whether Hermes actually ships
   `Intl.PluralRules`. Android's Intl lives in the prebuilt AAR, not the npm package. The test
   removes the dependence on the answer; the first plural key restores it.
5. Paid Supabase (~$25/mo, NFR-15) · ADR-034 ratification · Apple $99 + Play $25 · JDK 17 for local
   Gradle builds.

# Recommended next task

1. **B4.4** — §7.2 SLO dashboards + alert rules, scoped to `environment:production` (which is now
   trustworthy), proven by a **deliberate trigger** rather than configured. The last engineering
   increment in B4, and the only one that moves the milestone number.
   ⚠️ Ignore the current 100% crash-free when setting thresholds: it is historical CI traffic
   mislabelled as production, and is not relabelled by #98.
3. **Owner:** ratify ADR-034; rule on the §6.6 `preferences` conflict rule. Decide whether to
   SHA-pin all nine GitHub Actions (#87 records the case and deliberately left it open).
4. **#90 (RNTL 14) when the testing-infrastructure migration is wanted** — add `test-renderer`, drop
   `react-test-renderer`, migrate `packages/ui` + `apps/mobile` component tests. Not urgent, and
   deliberately not ignored.
