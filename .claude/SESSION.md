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

# Blockers

1. ⚠️ **The §6.6 `preferences` conflict rule is UNRATIFIED** and shipped in merged code (LWW).
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

# Recommended next task

1. **NFR-07 crash-free users** — same Sentry wizard, `crash_free_rate(user)` below 99.8, no new
   instrumentation. A third SLO for ~2 minutes.
2. **B1 / B3 remainders** — all owner-gated on money or store accounts.
3. **Owner decisions:** ratify ADR-034 · rule on §6.6 · decide NFR-10's path · SHA-pin the nine
   GitHub Actions (#87 records the case).
4. **Dependency queue, deferred deliberately:** #90 (RNTL 14 migration), #95, #96 (eslint 9 flat
   config), #97 (**zustand 5 — touches `STORE_offlineQueue`**).
