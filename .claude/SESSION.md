# SESSION.md

# PanchangPal — Current Session

Version: 6.0.0
Last Updated: 2026-08-02 (part 3 — **B4 CLOSED**, two SLOs proven end to end; 47% → 50%)

**B4 — Observability is closed at verifiable scope. 47% → 50%** — the first slice completed since
B6 on 2026-07-27.

---

# What closed B4

**B4.4 delivered two of §7.2's seven SLOs PROVEN, not configured** — the distinction §8.4 exists for:

| SLO | Proof |
|---|---|
| **NFR-06** crash-free sessions ≥ 99.5% | drill → issue → **email 14:43** |
| **NFR-14** availability ≥ 99.9% | `SVC_health` forced red → `PANCHANGPAL-EDGE-3` → **email 16:17** |

⚠️ **NFR-06 took two drills, and the failure is worth more than the success.** Drill 1 detected
perfectly — right threshold, right `production` filter, high-priority issue opened and assigned —
and **told nobody**: both alert rows targeted *Suggested Assignees*, which a metric-monitor issue
cannot resolve (no stack trace, no suspect commit). Every visible signal read "configured".
**Without the deliberate trigger it would have shipped as done**, and §8.4's worst unattended failure
would have played out — a crash affecting every user going unnoticed, because users of a calm ritual
app stop opening it rather than filing bugs. NFR-14 then passed first time purely because that lesson
was applied: an explicit **Member** recipient.

# Merged this session

| PR / commit | What |
|---|---|
| #87 `da9e945` | Dependabot proposes MAJOR action bumps only (closes #83) |
| #88 `652831d` | i18next 23→26 + react-i18next 15→17 as one increment (closes #62, #82) |
| #80 `715e2de` | `@supabase/supabase-js` 2.111.0 |
| #93 `ea71ce6` | `zod` 3→4 |
| #94 `1d035ce` | SDK-pin check is two-sided (closes #89, #91, #92) |
| #98 `a724519` | **CI was reporting itself as production** |
| #99 `b5df897` | §7.2 SLO document + drill script + conformance test |
| #100 `96ac23f` | **`SVC_health`** — the NFR-14 probe |

Plus doc commits recording the drills, the Edge telemetry proof, and the Supabase key deprecation.

# The day's lesson, learned four times

**A change that looks applied is not a change that took effect.**

1. `echo >> .env` with no leading newline **corrupted `EXPO_PUBLIC_SUPABASE_URL`** — the name still
   parsed, so it read as a product defect and failed 4/6 flows.
2. The **mobile** environment defaulted to `production`, so CI reported as production (#98).
3. The **edge** seam had the identical defect — `SENTRY_ENVIRONMENT` undocumented, same default.
4. A secret saved **eight minutes after** the curl meant to verify it, producing two false negatives.

Each time the tell was a **timestamp or a log line**, never the thing being changed. The cheapest
check of the day was `sha256("staging")` against Supabase's published digest — one step, where two
screenshots had left the value ambiguous.

# Dependency queue, part 3 (after B4 closed)

**Progress unchanged at 50%** — dependency work advances no slice.

| PR | Verdict |
|---|---|
| **#97** `zustand` 4→5 | ✅ **merged** `4812316` — E2E **6/6 on device** |
| **#95** `@types/node` 20→26 | ❌ closed via **#101** `3434538` |
| **#96** `eslint` 8→9 | ✅ **merged** `18ab1c4` — `.eslintrc.cjs` ported to flat config |
| **#90** RNTL 13→14 | ❌ **closed** — requires **Node 22**; this repo runs Node 20 |

**#95 was green and wrong — the fourth time this session.** `@types/node` describes the runtime, and
newer types only *add* APIs, so a bump always compiles. With `NODE_VERSION: '20.11.0'` and
`engines.node: >=20.11.0`, moving to 26 makes TypeScript accept built-ins the runtime lacks. #101
adds the ignore rule **and** asserts the invariant — including that every workflow's `NODE_VERSION`
agrees with the engine floor — because that ignore list has leaked **four times** and does not stop a
human. Perturbed with #95's exact bump.

**#97 was safer than predicted.** I expected zustand 5's curried `create<T>()(fn)` to break all five
stores; the non-curried form still compiles. None of v5's breaking surfaces are used — no default
import, no two-arg `useStore(sel, equalityFn)`, and the six `persist(` calls are **our own function**
in `offlineQueue.ts`, not zustand middleware. Verified anyway on device because
`STORE_offlineQueue` produced two defects this week: **6/6 flows**, including FLOW_OFFLINE_SYNC.

**#96 done (`18ab1c4`).** One `.eslintrc.cjs` → `eslint.config.mjs`, rule-for-rule: all 7 packages
lint at **0 errors / 16 warnings**, matching the baseline exactly. The ADR-026 guard still fires —
perturbed by reintroducing `toISOString().slice(0,10)` — and `time.test.ts` stays exempt. Four flat
specifics, each found by running it: `react-hooks` needs `configs.flat.recommended` (not
`recommended-latest`, which adds a 17th rule); **`import/parsers` keyed by module NAME breaks under
pnpm's nesting** and needed an absolute path — the fourth flat-`node_modules` assumption to fail here
after `@babel/runtime`, `babel-preset-expo` and `@sentry/cli`; `react-native`'s entry is **Flow** and
unparseable, so `import/ignore` is scoped to that one module rather than disabling `import/namespace`
wholesale; and `ignores` replaces `ignorePatterns`.

❌ **#90 closed — RNTL 14 declares `engines: { node: "^22.13.0 || >=24" }` and this repo pins Node
20.11.0 in every workflow.** A declared constraint, not documentation.

⚠️ **My first reading was wrong.** I attributed the failures to `jest-expo@54`'s preset and guessed
SDK coupling. The package ships `docs/guides/migration-v14.md`, which says the real cause: **`render`,
`renderHook`, `fireEvent` and `act` are now async.** That explains both symptoms exactly — `wrap()`
never awaits `render`, so `screen` is unpopulated; `renderHook` returns a promise, so `result.current`
is undefined. **Reading the package's own migration guide would have settled it in one step**, far
cheaper than debugging renderer internals.

**The prerequisite is a Node 20 → 22 upgrade**, which is a platform increment in its own right: it
moves `NODE_VERSION` in every workflow, `engines.node`, and `@types/node` — and
`types-node-matches-engine.test.ts` now *forces* those to move together, which turns it into one
coherent change instead of drift. Notably **`expo@54.0.36` already depends on `@types/node ^22.14.0`**,
so SDK 54 expects Node 22 and the upgrade is likely owed regardless. The async migration after it is
bounded: 41 call sites across 14 files, with codemods shipped.

# Two owner decisions ratified and implemented the same day

| | |
|---|---|
| **ADR-035** — §6.6 `preferences` | ✅ Accepted `0083cab` — LWW on `local_ts`, per-column merge |
| **ADR-034** — deletion audit | ✅ Accepted `a1208a0` — Alternative C, one-way digest |

**Both ratifications exposed a defect in the thing being ratified.**

**§6.6:** the documented LWW rule **was not implemented** — `resolvePreferences` was passed `null`,
so its comparison could never fire, and the upsert was unguarded. Actual behaviour was
last-drain-wins with `updated_at` free to move backwards. Every existing test passed, because they
called `resolvePreferences` directly. Fixed via `applyPreferences` (read → decide → write only on
`applied`), pinned by sequencing tests; perturbing it back fails exactly 3 while all 16 pre-existing
assertions still pass.

**ADR-034:** a completed erasure left **no record at all**, while §5.1 named that record as the
repudiation mitigation. Now `account_deletion_audit` — no FK to `app_user`, service-role only, a
**frozen** `sha256(uuid::text)` digest so an operator can verify a specific claim without the table
being a readable roster. `executed_at` retired with its unconditionally-true predicate.
**Verified against a real Postgres 17** (`pgvector/pgvector:pg17`, the CI image): 23/23 pgTAP, whole
DB suite clean, two perturbations. The **DR drill also passed**, so the table survives a
backup/restore round trip with its RLS intact.

⚠️ **A mistake worth carrying:** I rewrote `execute_account_deletion`'s body from memory rather than
copying it, and paraphrased the F-3 check as `m.status = 'active'` when the column is `m.is_active`.
plpgsql does not resolve columns until execution, and the sweep's per-user exception handler
**swallowed the error** — so a typo presented as 20 of 23 assertions failing with nothing erased.
**When replacing a `create or replace function`, copy the body verbatim and add only what is new.**

**ADR-033 is now the only ADR still Proposed.**

# Blockers

1. ✅ **§6.6 `preferences` is RATIFIED (ADR-035, Accepted) — and the defect found while drafting it
   is fixed in the same change.** Product ruled **last-writer-wins on `local_ts`**, with the
   per-column merge stated. TDD Part 2 §6.6 now carries the fourth rule.
   ⛔ **The finding:** the documented rule was **not implemented**. `resolvePreferences` had one
   non-test call site and was passed **`null`**, so its comparison could never fire; the upsert was
   unguarded and stamped `updated_at` regardless. Actual behaviour was **last-drain-wins with
   `updated_at` free to move backwards** — identical to LWW for one device (FIFO drain matches
   `local_ts`) and divergent exactly where a conflict rule earns its keep. **Every existing test
   passed**, because they called `resolvePreferences` directly and nothing exercised the handler's
   use of it. Fixed via `applyPreferences` (read → decide → write only on `applied`), pinned by
   sequencing tests that fail against the original defect while all pre-existing tests still pass.
   ⚠️ Accepted limitation: read-then-write is not atomic, so two devices syncing in the same instant
   can both observe the older timestamp. Cross-request only; narrowing it further would move the
   decision out of `resolvePreferences`.
2. **NFR-10 needs a product decision** — PDD §11's registry has no sync event, and inventing one is
   forbidden by `events.ts` and rejected at runtime. Either PDD adds sync events, or a server-side
   metrics sink is chosen. Not engineering.
3. **`SVC_health`'s 503 branch is unit-proven, never exercised end to end.** Belongs with the
   DB-outage runbook drill. Deploying a deliberately broken endpoint needs owner permission.
4. **§7.2 dashboards do not exist** — ADR-025's `analytics_event` rollup worker is unbuilt, and
   nothing scheduled runs in this project except the deletion sweep.
5. ⚠️ **Both legacy Supabase keys are DEPRECATED by the platform.** `readEnv` requires them and
   **throws** if absent, so removal breaks every Edge Function. Not scheduled; `SVC_health` would at
   least surface it as 503.
6. Paid Supabase (~$25/mo, NFR-15) · ADR-034 ratification · Apple $99 + Play $25 · JDK 17 locally.

# ✅ NODE 20 → 22 DONE — it was end-of-life, and nothing was watching

Verified against `nodejs/Release/schedule.json` rather than assumed: **Node 20 reached EOL on
2026-04-30**, and every workflow still pinned `20.11.0` on 2026-08-02. **CI ran an unsupported
runtime for three months with every gate green**, because no gate asks that question.

Merged as **`f5c018c`**. `NODE_VERSION` in `ci.yml`/`e2e.yml`/`release-build.yml`, `cd.yml`'s
hardcoded pin, `engines.node >=22.13.0` and `@types/node ^22.20.1` all moved together —
`types-node-matches-engine.test.ts` enforces exactly that.

**Verified as a runtime change, not on unit tests:** E2E on a **native Android build** — 6/6 flows —
with **MMKV's Nitro bindings loading natively and no memory fallback**, which is the seam a
toolchain change degrades silently (mmkv v2 cost a week that way, and `expo export` cannot see it).
CD then applied migrations and deployed all eight Edge Functions on main under Node 22.

**22, not Active-LTS 24, deliberately.** `expo@54.0.36` depends on `@types/node ^22.14.0`, so SDK 54
was built against 22, and the toolchain is SDK-pinned (`jest-expo`, `babel-preset-expo`,
`@expo/metro-runtime`) — betting against SDK pins has failed four times here. This buys ~9 months
(22 EOL 2027-04-30); **Node 24 belongs with the SDK 55 upgrade.**

⚠️ **Two guard gaps this exposed, both now closed.** `cd.yml` hardcoded `node-version: 20.11.0` on
the step rather than reading the env var, and the guard matched only `NODE_VERSION:` — *the drift the
test existed to prevent was hiding inside the test*. And nothing asserted that the engine floor is a
supported major, which is how three months passed unnoticed. Both are now asserted, the first
perturbation-proven.

**Also unblocked: #90 (RNTL 14)**, whose only blocker was `engines: node ^22.13.0 || >=24`. Bounded:
41 call sites across 14 files, codemods shipped.

# Recommended next task

1. **NFR-07 crash-free users** — same Sentry wizard, `crash_free_rate(user)` below 99.8, no new
   instrumentation. A third SLO for ~2 minutes.
2. **B1 / B3 remainders** — all owner-gated on money or store accounts.
3. **Owner decisions:** ratify ADR-034 · rule on §6.6 · decide NFR-10's path · SHA-pin the nine
   GitHub Actions (#87 records the case).
4. **Dependency queue, deferred deliberately:** #90 (RNTL 14 migration), #95, #96 (eslint 9 flat
   config), #97 (**zustand 5 — touches `STORE_offlineQueue`**).
