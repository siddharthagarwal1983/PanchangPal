# SESSION.md

# PanchangPal — Current Session

Version: 7.0.0
Last Updated: 2026-08-02 (session end — **B4 closed, 47% → 50%**; three SLOs proven; Node off EOL)

---

# Completed

**B4 — Observability CLOSED at verifiable scope. 47% → 50%** — the first slice since B6
(2026-07-27). B4.4 delivered **three SLOs proven end to end** — NFR-06 crash-free sessions, NFR-07
crash-free users, NFR-14 availability — each watched to open an issue *and deliver mail to a human*,
which is §8.4's standard rather than "configured".

**Two ADRs ratified and implemented the same day.** ADR-035 (§6.6 `preferences` = LWW on `local_ts`,
per-column merge) and ADR-034 (deletion audit = one-way digest, service-role only).
**ADR-033 is now the only Proposed ADR.**

**Node 20 → 22** (`f5c018c`). Verified against `nodejs/Release/schedule.json`: Node 20 had been
**EOL since 2026-04-30** — three months on an unsupported runtime with every gate green.

**Dependency queue emptied** — 10 PRs resolved: merged #80, #88, #93, #97, #102; closed #62, #82,
#83, #89, #90, #91, #92, #95 with evidence.

**`SVC_health`** built, deployed to staging, verified anonymously — the only `verify_jwt = false`
surface in the system.

# The through-line

**A check that exists, looks healthy, and is not checking the thing that matters.**

- NFR-06's first alert detected perfectly and **notified nobody** — *Suggested Assignees* cannot
  resolve on a metric-monitor issue. It would have shipped as done.
- §6.6's documented LWW rule **was never implemented**: `resolvePreferences` was passed `null`, so
  the comparison could not fire. Every existing test passed.
- `cd.yml` hardcoded a Node pin **the guard could not see** — the drift was hiding inside the test.
- The pgcrypto migration passed 23/23 against a *faithful* local Postgres 17 and broke CD, because
  Supabase installs pgcrypto into `extensions` rather than `public`.

# Blockers

1. **~$25/mo paid Supabase** — NFR-15 PITR, a stated launch blocker.
2. **Apple $99 + Play $25** — most of B1/B3.
3. **NFR-10** — needs a PDD §11 taxonomy addition or a server metrics sink; no sync event exists.
4. **§7.2 dashboards** — ADR-025's `analytics_event` rollup worker is unbuilt.
5. ⚠️ **Pre-launch: confirm no metric monitor has an open issue.** Today's drills left two, and
   metric-monitor issues **cannot be resolved or deleted by hand** — the only lever is recreating the
   monitor. Harmless now; a trap if the first real traffic is unhealthy.
6. **`SVC_health`'s 503 branch** is unit-proven, never exercised end to end.
7. Legacy Supabase keys (`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are **platform-deprecated**;
   `readEnv` throws without them, so removal breaks every Edge Function.

# Recommended next task

1. **Owner:** paid Supabase · store accounts · NFR-10's path · SHA-pin the nine Actions.
2. **RNTL 14** — unblocked by Node 22. Bounded: 41 call sites, 14 files, codemods shipped.
   Advances no slice. ⚠️ **Correction: #90 is CLOSED, not open** — it was closed at 12:43 because
   RNTL 14 needs Node 22 and the repo ran Node 20; Node 22 merged at 13:15, ~30 minutes later. This
   is a fresh branch, not a merge of a waiting PR.
3. **Node 24 with the SDK 55 upgrade** — 22 is maintenance-only, EOL 2027-04-30.

---

# Addendum — 2026-08-02, tracking docs reconciled

**The SLO count had drifted, and both numbers were right.** SESSION.md said three SLOs proven;
DASHBOARD, CURRENT_MILESTONE, PROJECT_STATUS, IMPLEMENTATION_ROADMAP and TASK.md said two. Checked
against **TDD Part 5 §7.2**, which names seven and **does not include NFR-07** — that comes from the
**Part 1 §8 NFR table**. So "two of §7.2's seven" and "three SLOs proven" are both correct, and the
denominators had been silently merged. Reconciled by making the distinction explicit everywhere
rather than by picking a number; `SLO_ALERTS.md` §1 now says why its table has eight rows.

**Also corrected while reconciling:** `SLO_ALERTS.md`'s own header still read "NFR-06 detects but does
NOT notify", the pre-drill-2 state, contradicting its §0 · PROJECT_STATUS still had ADR-034 as
*Proposed, awaiting ratification* (ratified and implemented, #104) · TASK.md's NEXT TASK listed six
items that were already done.
