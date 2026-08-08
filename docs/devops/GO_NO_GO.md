# PanchangPal — Pre-launch Go/No-Go (TDD Part 5 §10.1)

Version: 1.1.0
Last Updated: 2026-08-08 (B8.2 — a bundle-size budget now gates NFR-01; item 8's latency half is
still open and §7.1 says so)
Slice: **B8 — Go/no-go & launch**
Pinned by: `apps/backend/tests/release/go-no-go.test.ts`

---

## 0. The answer

# ⛔ NO-GO for a public launch.

**3 of 22** `[MANDATORY]` checklist items are met without qualification. **10** are partially met,
**7** are not met, and **2** are business inputs nobody in engineering can close.

| Verdict | Count | Items |
|---|---:|---|
| ✅ Met | 3 | CI gates · RLS suite · DR restore drill |
| ⚠️ Partial — a real gap inside a box that looks ticked | 10 | seeds · E2E flows · perf/a11y · offline sync · secrets · monitoring · OWASP · rollback · privacy docs · CCPA |
| ⛔ Not met | 7 | RAG corpus · panchang accuracy · AI §10B · IAP config · store submission · pricing instrumentation · activation dashboards |
| ⏳ Business-owned | 2 | temple pilot · runway |

**This is the expected answer and it is not a setback.** §10.4 already states the milestone is
"ready for launch, *conditional on* the §10.1 checklist", and every slice before this one closed at
**verifiable scope** with a named residual. B8's job is to read those residuals together, once, in
one place — because the failure this milestone keeps finding is a control that is documented,
visible, and inert, and that failure is invisible from inside any single document.

**Almost none of the gap is unfinished engineering.** Of the 19 items not fully met:
**7 are content or AI-readiness**, **6 are owner purchases** (a paid Supabase plan, Apple, Google
Play), **2 are business decisions**, and **4 are engineering** — of which two (a performance gate,
paywall instrumentation) were the findings this walk produced.

**Update, B8.2 (2026-08-08):** the first of those two is **half closed**. A release-blocking
bundle-size budget now gates NFR-01 (§7.1). Item 8 stays ⚠️ rather than ✅, because PDD's per-screen
**latency** budgets still have nothing measuring them and a CI emulator cannot measure them honestly
— the counts above are unchanged.

---

## 1. How to read this document

**Each verdict is derived from the repository, not from another document.** That rule exists because
of what closing B7 found: six tracking files had been three increments stale while agreeing with one
another perfectly, since each had been written from the previous one. A status file is not evidence
about the repository. Where a verdict rests on a document, the document is named as the evidence and
its own review state is recorded.

**⚠️ "Partial" is the important column.** A partially-met item is more dangerous than an unmet one,
because the box looks ticked from a distance. `traditions/festivals/rituals seeded` is the clearest
case: traditions *are* seeded, so a quick read passes it — and the festival is literally named
`sample-festival` with the significance text *"Placeholder significance (reviewer content to
follow)."*

**Legend.** ✅ met · ⚠️ partial, gap named · ⛔ not met · ⏳ owner/business-held.
**Owner column:** `ENG` engineering · `$` a purchase · `CONTENT` reviewer/corpus · `BIZ` founder ·
`LEGAL` qualified review.

---

## 2. Product / content

| # | §10.1 item | Verdict | Evidence, and the gap |
|---|---|---|---|
| 1 | RAG corpus complete + reviewer-signed | ⛔ | `GURU_LIVE = false` (`apps/mobile/src/domain/guru/transportFactory.ts:15`). No corpus exists; `content_item` / `content_chunk` are loaded by `SVC_content_ingest` and have never been loaded. The client is complete behind the gate and returns `UnavailableGuruTransport`, which never contacts a model. **Owner: CONTENT** |
| 2 | traditions/festivals/rituals seeded (`F-9`) | ⚠️ | **Traditions: yes** — 4 seeded in `apps/backend/seed/seed.sql` (`generic`, `north_indian`, `south_indian_tamil`, `bengali`). **Festivals and rituals: no.** The seed carries exactly one ritual (`daily-generic`) and one festival (`sample-festival`, significance *"Placeholder significance (reviewer content to follow)"*), and its own header says reviewer-approved content is loaded by `SVC_content_ingest`, **not** raw-seeded. A launch tradition set with one placeholder festival is not seeded content. **Owner: CONTENT** |
| 3 | panchang accuracy validated vs. Drik/mPanchang (TRISK-04) | ⛔ | **ADR-033 (Canonical Panchang Computation Engine) is still `Proposed`** — the last unratified ADR. No astronomical algorithm is implemented; panchang, Calendar festival markers and sunrise/tithi notifications all surface a calm "unavailable" state rather than a computed value. There is nothing to validate *against* yet, so this item cannot be worked before the ADR is ratified. **Owner: ENG, blocked on an ADR decision** |

---

## 3. Engineering

| # | §10.1 item | Verdict | Evidence, and the gap |
|---|---|---|---|
| 4 | All CI gates green (§2.2) | ✅ | Five gates, all green on the most recent merge (#116, run `31172717242`): Lint + Typecheck · Unit + Component + Accessibility · Bundle (`expo export`, ios + android) · RLS policy + DB integration · Secret + dependency scan. |
| 5 | RLS policy suite green | ✅ | `apps/backend/tests/rls/rls_policies.test.sql` (pgTAP) runs in the §4.4 security gate against a real Postgres 17 with migrations applied from scratch. Joined by `unauthenticated-surface.test.ts`, which fails if a **second** Edge Function goes anonymous — Edge Functions run with the service role, so RLS is not a backstop. |
| 6 | AI §10B passed for `AISET-2026.07` | ⛔ | No evaluation harness exists (TDD Part 3 §9.4 owes it) and no `AISET` bundle has been built. Same root as item 1. **Owner: CONTENT + ENG** |
| 7 | E2E `FLOW_*` pass on staging | ⚠️ | **6 flows green on a real native Android build**, against **staging** config (`e2e.yml` pulls the EAS `preview` environment, which `eas.json` binds to the staging profile; the flows assert seeded staging content). ⚠️ **Two flows named in B2's scope do not exist**: household invite (needs `SVC_household`) and live Ask Guru (gated off). So the daily loop, ritual, onboarding, both persistence paths and offline sync are covered; two product surfaces are not. **Owner: ENG, blocked on other slices** |
| 8 | Performance + accessibility gates pass (**release-blocking**) | ⚠️ | **Accessibility: yes** — a11y assertions ride in the "Unit + Component + Accessibility" gate and every delivered slice carries them. **Performance: PARTLY, as of B8.2 (2026-08-08).** A release-blocking **bundle-size budget** now runs in the Bundle gate (`scripts/check-bundle-budget.mjs`): the Hermes bytecode a device must download, parse and execute before the first frame is weighed against a checked-in 6 MiB ceiling, currently 5.04 MiB. That is the largest single lever engineering holds on **NFR-01**, and it fails loudly on every path where it measures nothing. ⛔ **Still absent: PDD's per-screen latency budgets** — Today cached render < 500 ms, checklist toggle ack < 100 ms, ritual "Begin"→first step < 400 ms, completion ack < 100 ms. Those are user-perceived timings on real hardware and **a shared-vCPU CI emulator cannot measure them honestly**; their named instruments (Sentry app-start for NFR-01, a client trace for NFR-02) need real device traffic, which is store-gated. **Owner: ENG + $ — see §7.1** |
| 9 | Offline loop + sync verified | ⚠️ | Built and covered: `STORE_offlineQueue` → `syncService` → `syncRepository` → `SVC_sync`, the §6.1 persisted read cache, and `FLOW_OFFLINE_SYNC` green on device — including the assertion its header exists for (a completion made offline survives an app kill). ⚠️ **Never exercised against a live backend.** The drain has only ever run against staging seed data through the emulator; no real user has ever synced. **Owner: ENG** |

---

## 4. Ops / Security

| # | §10.1 item | Verdict | Evidence, and the gap |
|---|---|---|---|
| 10 | Secrets provisioned + scanned | ⚠️ | **Scanned: yes** — `gitleaks/gitleaks-action@v3` runs per PR in the Secret + dependency scan gate. **Provisioned: staging and dev only.** No production Supabase project exists: the free tier allows two and both are used, so `SUPABASE_PROD_DB_URL` / `SUPABASE_PROD_REF` have nowhere to point. `preflight.sh` correctly fails at its production tier. ⚠️ Legacy Supabase keys are platform-deprecated and `readEnv` throws without them — a migration that is owed and not started. **Owner: $ + ENG** |
| 11 | Monitoring dashboards + alerts live (§7) | ⚠️ | **Alerts: three SLOs proven end to end** by deliberate drill, each watched to open an issue *and deliver mail to a human* — NFR-06 crash-free sessions, NFR-14 availability (via `SVC_health`), and NFR-07 crash-free users. That is §8.4's standard rather than "configured". ⛔ **Dashboards: absent** — §7.2's dashboards need ADR-025's `analytics_event` rollup worker, which is unbuilt. ⛔ **And two metric monitors currently have OPEN issues from those drills.** An open issue suppresses the next alert of its kind, and a metric-monitor issue **cannot be cleared by hand** — it closes only on a healthy reading. If the first real traffic is unhealthy, the metric never recovers and a genuine incident pages nobody. **This must be cleared before any launch step.** **Owner: ENG** |
| 12 | DR restore drill done (§8.1) | ✅ | `.github/workflows/dr-drill.yml` — mechanised, monthly, and also on any PR touching migrations or seed; `apps/backend/tests/dr/restore_invariants.sql` asserts the rebuilt schema. ⚠️ Recorded here rather than against this item, because it is item 14's problem and NFR-15's: schema and seed rebuild in minutes, **user data does not**, because there is no PITR. |
| 13 | OWASP Mobile review + (recommended) pen test | ⚠️ | **Review: done** (B6.1, `docs/devops/OWASP_MOBILE_REVIEW.md`), and it found the two most serious defects of the milestone — an auth session that never persisted (every cold start minted a new anonymous identity and orphaned the user's data) and `SVC_account` taking the acting identity from the request body while running with the service role. Both fixed, each proven by reintroducing the defect. ⛔ **Pen test: not done.** Marked *(recommended)* in §10.1, so it does not block on its own. **Owner: $ (external) — optional** |
| 14 | Rollback paths verified (§3.4) | ⚠️ | **3 of 8 paths exercised** (B7): OTA rollback, Edge Function redeploy, staged OTA rollout — all on staging, all with run ids in `RELEASE_RUNBOOK.md`. One blocked, **three have no mechanism at all**, and ⛔ **PITR does not exist**, so a destructive migration against real user data has **no recovery** (NFR-15). ⚠️ **None of the three is proven to reach a device** — no EAS build exists for any channel, so each proves its mechanism works in EAS or Supabase, not that a phone changed behaviour. ⛔ **"Auto-rollback on a crash spike" (§2.4) is not automated**: the revert action is proven and nothing triggers it. **Owner: $ (PITR) + ENG (webhook)** |

---

## 5. Compliance / Store

| # | §10.1 item | Verdict | Evidence, and the gap |
|---|---|---|---|
| 15 | Privacy policy + store privacy labels accurate (§6) | ⚠️ | Both exist and are **derived from a machine-checked source**: `DATA_INVENTORY.md` classifies all 32 tables and is pinned to the schema *and* the emitted `EVT_*` set in both directions by `data-inventory.test.ts`, so an undisclosed new table and a disclosure for deleted data both fail. `PRIVACY_POLICY_DRAFT.md` and `STORE_PRIVACY_LABELS.md` derive from it. ⛔ **Nothing is legally reviewed** — the draft carries 15 `[LEGAL REVIEW REQUIRED]` / `[UNBUILT]` markers and its own header forbids publishing it. "Accurate" in §10.1 means accurate *and* approved. **Owner: LEGAL** |
| 16 | CCPA export/delete working | ⚠️ | **Delete: built and proven** — `execute_account_deletion()` (atomic, SQL, spanning nine tables), `sweep_due_account_deletions()` (per-user subtransactions), a daily `pg_cron` schedule **enabled and confirmed on both hosted projects**, the `POST /account/sweep` operator trigger, and 17 pgTAP assertions checking rows are gone table by table. ADR-034 is ratified and implemented, so a completed erasure leaves a one-way-digest audit record. ⚠️ **Export: unit-tested and proven-to-fail, never run against a live backend.** ⛔ **No in-app affordance for either — and Apple 5.1.1(v) requires in-app account deletion**, which needs a PDD affordance and `SVC_household` for ownership transfer. That is a store-review rejection, not a nice-to-have. **Owner: ENG + PDD** |
| 17 | IAP + RevenueCat prod config | ⛔ | `react-native-purchases` is **not declared** in `apps/mobile/package.json`; the app runs `NullPaymentAdapter`, which returns no offerings and never fabricates a purchase. Even with the SDK installed, `getOfferings()` returns what a *store* defines, and no Apple ($99/yr) or Google Play ($25) account exists with configured IAP products. Entitlement remains server-authoritative and read-only on device throughout. **Owner: $** |
| 18 | Store review submitted | ⛔ | No store accounts, no binary submitted, no EAS build produced for any channel. Blocked behind item 17, and behind item 16's in-app deletion affordance. **Owner: $** |

---

## 6. Business

| # | §10.1 item | Verdict | Evidence, and the gap |
|---|---|---|---|
| 19 | NZ paywall/pricing signal test instrumented (MRD §13) | ⛔ | **No paywall, subscription or pricing event is emitted anywhere in the app.** The emitted set is nine ids — `EVT_012`, `015`–`021`, `054` — the daily-habit funnel plus the error event. PDD §11 defines `EVT_049` (Subscription row viewed) and it is never fired; SCR_SUBSCRIPTION_001 and the contextual paywall sheet at `app/modal/paywall` are fully built and **emit nothing**. A pricing signal test with no signal cannot run, and this would have been discovered only after launch, when the data was expected. **Owner: ENG — see §7** |
| 20 | Temple-partnership pilot ready | ⏳ | Business relationship; no engineering dependency. **Owner: BIZ** |
| 21 | Activation/retention dashboards live | ⛔ | Same root cause as item 11: events are written INSERT-only to `analytics_event` and **nothing reads them back**. ADR-025's rollup worker is unbuilt, and no `job_type` has a consumer. The North Star (Weekly Household Ritual Completions) is computable in principle — `EVT_017` grouped by `household_id` — and is computed by nothing. **Owner: ENG** |
| 22 | Runway confirmed | ⏳ | The MRD's standing Go/No-Go condition, `[PRD FOLLOW-UP]`, business-owned and the sole business input still open across the entire plan (§10.4). **Owner: BIZ** |

---

## 7. The two findings this walk produced

Everything above was already known somewhere except these two, and both are the milestone's signature
shape — a control specified in an approved document, with nothing implementing it and nothing
noticing.

### 7.1 ⚠️ The performance gate — half of it now exists (B8.2), and the honest half is the one that does not

**When this document was first written there was no performance gate at all** — not in `ci.yml`, not
in `e2e.yml`, nowhere in the eight workflows — while §10.1 lists "performance + accessibility gates
pass" as **release-blocking** and PDD specifies numeric budgets throughout. The asymmetry was worth
naming: accessibility became real because it was expressible as an assertion in the unit suite, and
performance never was.

**What B8.2 built.** A bundle-size budget in the Bundle gate. `expo export` already ran there and its
output was discarded; the gate now weighs each platform's Hermes bytecode — what a device downloads,
parses and executes before the first frame — against a checked-in ceiling in
`apps/mobile/performance-budget.json` (6 MiB; currently **5.04 MiB**, ~19% headroom).

**Why a ceiling rather than a ratchet, and why that was measured rather than assumed.** Two exports
of the *same commit* produced **different bytes**: 5,279,878 vs 5,279,857 (android) and 5,286,013 vs
5,286,045 (ios). The bundle is not byte-reproducible, so a zero-tolerance ratchet would fail at
random and be switched off — and a disabled release-blocking gate is worse than none, because the
documentation goes on claiming a control that no longer runs. A ceiling with real headroom is
unaffected by ~32 bytes of jitter and still catches a heavy dependency.

**Every path where it measures nothing exits non-zero** — a missing export directory, a platform with
no bundle, two bundles for one platform, an unreadable budget file, or a platform that built without
a budget. A size gate that passes because it found nothing to weigh is this milestone's signature
defect wearing a new hat, and it would go green forever the moment a refactor moved the output path.

⛔ **What is still missing, and it is the part §10.1 most plainly means.** PDD's per-screen budgets —
Today cached render < 500 ms · checklist toggle ack < 100 ms · ritual "Begin"→first step < 400 ms —
are **user-perceived latencies on real hardware, and nothing measures any of them.** A threshold
asserted against a shared-vCPU GitHub emulator would measure the runner: this repository's own E2E
suite has recorded 2m20s and 3m20s for the *same* commit. Their instruments are already named by the
TDD — **Sentry app-start** for NFR-01 and a **client trace / EVT_012 timing** for NFR-02 — and both
need real device traffic, which is store-gated. This belongs with the other capabilities blocked on
§10.2 step 1, not with unfinished engineering.

**So item 8 stays ⚠️.** Calling it closed because a bundle gate exists would be the overstatement this
whole document was written to avoid.

### 7.2 ⛔ The paywall is fully built and emits no analytics at all

SCR_SUBSCRIPTION_001, `CMP_PLAN_CARD`, the contextual paywall sheet, `visibleOfferings` and the
`FF_FAMILY_PLAN` gate are all implemented and tested. **Not one of them emits an event.** PDD §11
defines `EVT_049` for the subscription surface and nothing fires it.

The consequence is item 19, but the shape is worth stating on its own: **the pricing question the MRD
wants answered is unanswerable with the data the app currently produces**, and that would surface
only after a launch, when someone went looking for the funnel. Adding the event is small; noticing
that it is missing is the whole value of walking this list.

⚠️ **Both fixes are in-scope engineering under an existing taxonomy.** `EVT_049` is already in PDD
§11, so emitting it invents nothing — unlike NFR-10's sync metric, which has **no** event in the
registry and is therefore genuinely blocked on a PDD decision rather than on typing.

---

## 8. The near-term question is not this checklist

§10.1 gates a **public launch**. §10.2's launch sequence starts three steps earlier, and the useful
question today is whether step 1 is reachable:

| §10.2 step | Reachable? | What it needs |
|---|---|---|
| 1. **Internal** on TestFlight / Play Internal → smoke `FLOW_*` | ⛔ **No** | Apple ($99) + Google Play ($25) accounts. Nothing else — the build pipeline, signing, source maps and the six flows already work. **This is the single highest-leverage purchase in the project**, because it also converts every "proven in EAS, not on a device" caveat in §4 into a real answer. |
| 2. Beta cohort / canary | ⛔ No | Step 1, plus item 11's dashboards to watch it with, plus the two open metric-monitor issues cleared. |
| 3. Phased store rollout (10%→50%→100%) | ⛔ No | Steps 1–2, plus item 17/18, plus PITR before real user data exists. **The OTA half of staged rollout already works and is performed** (B7.4); it is the *binary* rollout that is store-gated. |
| 4. Post-launch (NZ pricing test, dashboards, hallucination audit) | ⛔ No | Items 19 and 21 — neither of which is instrumented today. |

**The ordering that follows from this table:** the store accounts unblock more of the checklist than
any engineering task available, and the two engineering findings in §7 are the only items on the list
that are both credential-free and currently blocking.

---

## 9. What this document is pinned to

`apps/backend/tests/release/go-no-go.test.ts` parses §10.1 **out of the TDD itself** and asserts this
document covers every item, in both directions — an item silently dropped fails, and an item invented
here fails. It then pins the claims that will rot, **in the dangerous direction**: this file must stop
saying "no performance gate exists" the moment one appears, must stop saying the paywall is
uninstrumented the moment `EVT_049` is emitted, and must not record a **GO** while any item above is
unmet.

That polarity is deliberate and is the same as `slo-alerts.test.ts`. A document overstating what
exists fails loudly the first time someone looks for the thing. A document that keeps saying
"blocked" after the blocker clears makes the gap **invisible**, because a file everyone trusts says
it is expected — and that is how TDD Part 4 §6 stayed unimplemented across two milestones.

**Deliberately NOT asserted:** that any item is *complete*. A test cannot check whether a lawyer read
the privacy policy, whether a reviewer signed the corpus, or whether a founder confirmed runway. The
verdicts above are a human's reading of the repository on 2026-08-08, and the gap between them and a
test is exactly the gap this milestone exists to keep visible.

---

## 10. Appendix — §10.1 verbatim

**This is the machine-checked surface.** The tables above paraphrase for readability; the list below
quotes TDD Part 5 §10.1 **word for word**, and `go-no-go.test.ts` asserts that every item in the TDD
appears here and that nothing here was invented. If the TDD's checklist changes, this list fails
until it is re-walked — which is the point, since a go/no-go that silently stops covering an item is
worse than one that is out of date loudly.

**Product/content**

- ⛔ **1.** RAG corpus complete + reviewer-signed (Part 3 launch dependency)
- ⚠️ **2.** traditions/festivals/rituals seeded for launch traditions (`F-9`)
- ⛔ **3.** panchang accuracy validated vs. Drik/mPanchang + reviewers (TRISK-04)

**Engineering**

- ✅ **4.** all CI gates green (§2.2)
- ✅ **5.** RLS policy suite green
- ⛔ **6.** AI §10B passed for `AISET-2026.07`
- ⚠️ **7.** E2E `FLOW_*` pass on staging
- ⚠️ **8.** performance + accessibility gates pass (release-blocking)
- ⚠️ **9.** offline loop + sync verified

**Ops/Security**

- ⚠️ **10.** secrets provisioned + scanned
- ⚠️ **11.** monitoring dashboards + alerts live (§7)
- ✅ **12.** DR restore drill done (§8.1)
- ⚠️ **13.** OWASP Mobile review + (recommended) pen test (§5)
- ⚠️ **14.** rollback paths verified (§3.4)

**Compliance/Store**

- ⚠️ **15.** privacy policy + store privacy labels accurate (§6)
- ⚠️ **16.** CCPA export/delete working
- ⛔ **17.** IAP + RevenueCat prod config
- ⛔ **18.** store review submitted

**Business**

- ⛔ **19.** NZ paywall/pricing signal test instrumented (MRD §13)
- ⏳ **20.** temple-partnership pilot ready
- ⛔ **21.** activation/retention dashboards live
- ⏳ **22.** runway confirmed (the MRD's still-open Go/No-Go condition — `[PRD FOLLOW-UP]`, business-owned)
