# SESSION.md

# PanchangPal — Current Session

Version: 3.2.0
Last Updated: 2026-07-28 (ADR-034 — the deletion-audit decision; the SDK-pinned dependency rule)

**Main is at `6b5fc0d`, clean, all workflows green** — CD ✅ and **E2E (Maestro) ✅**, so #76's
launch-race fix is verified on main rather than merely merged. **Progress unchanged at 47%**;
dependency hygiene advances no Beta slice.

---

# Completed

**ADR-034 opens the deletion-audit decision the TDD owed (Proposed).** Two approved documents make
incompatible demands of one table: **TDD Part 5 §5.1**'s `[MANDATORY]` threat model names
`TBL_ACCOUNT_DELETION` as the deletion audit mitigating repudiation, which requires the row to
outlive the erasure; **TDD Part 2 §3.15** declares `on delete cascade`, which erases it with its own
subject. Neither is wrong — **one row is being asked to have two lifetimes.** `account_deletion` is
a correct *request* table (pending intent, F-3 grace window, owner-readable) and cannot also be the
durable record of a completed erasure.

ADR-034 settles what is decidable on engineering grounds — separate the request from the audit; the
audit is service-role-only (ADR-030); it records the *fact* of erasure, never content recovered from
deleted rows; **`executed_at` is retired** — and refers the rest to Security/Privacy with Legal
sign-off: **what identifies the subject of a completed erasure** (raw `user_id`, a one-way digest, or
nothing). That decides whether the system keeps a permanent list of identifiers belonging to people
who asked to be forgotten, which is not an engineering preference. The digest form is recommended,
not chosen. **No schema change before ratification.**

**Three findings while writing it.** (1) **The citation was wrong everywhere** — every tracking doc,
`DATA_INVENTORY.md` and the executor migration's own header said "TDD Part 2 §5.1", but **Part 2
§5.1 is "Identity, Onboarding & Profile"**, API contracts with no threat model. The conflict spans
**two Parts**, which is plausibly why reviewing either alone never caught it; seven citations
corrected, and the unrelated correct ones in `openapi.yaml` and three source files left alone.
(2) **`executed_at` is dead schema, not merely unwritten** — its only reader is a `where executed_at
is null` predicate that is unconditionally true, because the column can never hold a value. (3) **A
retention rule agreed today would not be enforced**, since the deletion sweep is the only scheduled
job that runs; the ADR says so rather than specifying a period nothing implements.

---

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

- ⚠️ **`executed_at` is unwritable** — `account_deletion` cascades with its own subject, so a
  completed deletion leaves no record. **Now tracked by ADR-034 (Proposed), and blocked on
  ratification, not on engineering**: Security/Privacy must decide what identifies the subject of a
  completed erasure, with Legal confirming the retention obligation. No schema change until then.
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

**Owner action: ratify ADR-034** (Security/Privacy, with Legal on the retention question). The
implementation behind it is small and entirely blocked on that answer, and implementing the
recommended option first would be inventing the privacy decision the ADR exists to surface.

**Credential-free engineering is now thin, and the honest list is short.** The in-app deletion screen
Apple 5.1.1(v) requires is blocked on a PDD affordance and SVC_household; the `job` table worker
stays deliberately unbuilt because every `job_type` is blocked on a product or vendor decision; PDD
owes approved copy for eleven ERR_* codes. What remains in the milestone is largely owner-gated — a
Sentry org, a paid Supabase plan, and the two store accounts — which is worth saying plainly rather
than finding more hygiene work to fill the gap.
