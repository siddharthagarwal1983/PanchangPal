# SESSION.md

# PanchangPal — Current Session

Version: 3.1.0
Last Updated: 2026-07-28 (the SDK-pinned dependency rule; three PRs closed)

**Main is at `6b5fc0d`, clean, all workflows green** — CD ✅ and **E2E (Maestro) ✅**, so #76's
launch-race fix is verified on main rather than merely merged. **Progress unchanged at 47%**;
dependency hygiene advances no Beta slice.

---

# Completed

**The "SDK-upgrade increment" was investigated and does not exist.** The three PRs queued for it were
checked against the installed peer graph, and none should land on SDK 54:

| PR | Verdict | Evidence |
|---|---|---|
| #64 `@expo/metro-runtime` 6.1.2→57.0.7 | Closed | dist-tags map majors to SDK majors (`sdk-56`→56.x, `latest` 57.0.7→**SDK 57**); `expo-router@6.0.24` peer-requires `^6.1.2` |
| #65 `@babel/runtime` 7→8 | Closed | `babel-preset-expo@54.0.12` peer-requires `^7.20.0` |
| #75 `react` 19.1.0→19.2.8 | Closed | peer-**legal** under RN's `^19.1.0`, but RN 0.81.5 ships a Fabric renderer hardcoded to React `"19.1.0"` |

**PR #77** extends `.github/dependabot.yml`'s ignore list to `react`, `@types/react`, `@expo/*` and
`@babel/runtime`, with the evidence recorded inline. The file already held the correct rule — SDK
packages move together via `expo install --fix`, never alone — and only its **patterns** were short;
`expo-*` never matched a scoped `@expo/` name. No native build or Maestro run was needed: the peer
graph settles it.

# Findings

1. **Green CI is anti-correlated with safety for an SDK-pinned package.** #64 and #65 passed **all
   five gates including the bundle gate**, while #75 — the only peer-legal one — was the sole red.
   `expo export` resolves what fails natively. Third instance, after mmkv v2 under the New
   Architecture and `babel-preset-expo`.
2. **#75's red was a symptom and the queued fix would have hidden it.**
   `@testing-library/react-native`'s `ensure-peer-deps.js` asserts `react-test-renderer` === `react`
   exactly. Moving `react-test-renderer` to 19.2.8, which TASK.md had recorded as the fix, would have
   turned CI green while leaving RN's renderer at 19.1.0.
3. **#61 is closed and was superseded by #75** (Dependabot regenerated the group after #74). Every
   tracking doc still said "#61's react remainder"; all are corrected.
4. **There is nothing to gain from #75 anyway** — every 19.2.x release note is React Server
   Components, which React Native does not use.

# Open

- ⚠️ **`executed_at` is unwritable** — `account_deletion` cascades with its own subject. **TDD owes a
  resolution.**
- ⛔ **No worker consumes the `job` table** — deliberately not built; every `job_type` is blocked on a
  product or vendor decision.
- **⛔ SVC_notify_scheduler is a shell** — `loadDueCandidates()` returns `[]` unconditionally.
- **Apple 5.1.1(v) requires an in-app deletion screen** — needs a PDD affordance and SVC_household.
- Nothing in the privacy documents is legally reviewed.
- PDD owes approved copy for 11 of 24 ERR_* codes; SCR_ONBOARDING_* slides unbuilt.
- **Two Dependabot PRs open** — #62 (i18next 23→26) and #63 (jest 29→30), red for their own unrelated
  reasons and each its own decision. The queue no longer contains an SDK-crossing PR.
- **`pnpm format:check` fails on 248 files**, pre-existing and not a CI gate. Adopt or drop the script.

# Blockers

1. **Paid Supabase (~$25/mo)** — no PITR; user data unrecoverable. NFR-15 unmet, launch blocker.
2. **Sentry org + DSN** (free tier) — the only thing between B4 and done.
3. Apple $99 · Google Play $25 → most of B3.

# Recommended next task

**A credential-free Beta item, since the dependency queue is now clean.** The strongest candidates
are the **TDD resolution the deletion audit owes** (a documentation decision, not code, and it is the
last thing between B6 and an honest privacy claim) and the **in-app deletion screen** Apple 5.1.1(v)
requires — the latter still blocked on a PDD affordance and SVC_household. The `job` table worker
remains deliberately unbuilt: every `job_type` is blocked on a product or vendor decision.
