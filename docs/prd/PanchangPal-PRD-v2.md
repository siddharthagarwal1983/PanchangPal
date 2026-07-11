# PanchangPal — v2 MVP Product Requirements Document

> **Vision:** Make it effortless for every Hindu family living abroad to preserve and practice their traditions every day.

**Status:** Draft for review
**Supersedes:** `PanchangPal-v1-PRD.md`. Built from the v1 PRD plus accepted recommendations from `PanchangPal-Review-v1.md` (2026-07-05).
**Scope:** v1 launch — Hindu, single persona, US + Australia + New Zealand. Jain module and second-gen-specific work moved to explicit v1.1 fast-follow.
**Team:** Solo founder

**What changed vs. v1, at a glance:** single-persona focus (Jain module → v1.1); New Zealand added to launch geography; regionalized ritual scripts and festival calendar for top 2–3 traditions; new shraddha/personal-date-tracking feature; streak grace days; role-aware household content; RAG-grounded Ask Guru; explicit AI Non-Goals; onboarding and navigation fixes; festival greeting-card virality feature and lifecycle email sequence added to roadmap; family-plan pricing tier; roadmap rebuilt into 90-day/6-month/12-month/24-month horizons.

---

## Problem Statement

Unchanged in substance from v1, with one addition carried from the MRD v2: the diaspora Hindu population in the US, Australia, and New Zealand (~4.5M, v2 launch geography) is underserved by existing apps in the same ways identified in v1 (ad-laden, India-timezone-default, transactional-not-daily-guidance). **New framing carried from MRD v2:** the subscription-for-daily-utility revenue model this product is built around is the least-proven part of the plan — every proven revenue dollar in this category so far is transactional (Sri Mandir, VAMA). This PRD proceeds on the v1 scope regardless, but treats validating that assumption quickly and cheaply (via the New Zealand launch market, see Timeline Considerations) as a first-order goal, not a footnote.

## Goals

1. **Retention differentiation** (unchanged): D7 ≥30%, D30 ≥15% in the first 90 days.
2. **Habit formation** (unchanged): 40%+ of DAU complete one ritual/checklist item daily by month 2.
3. **AI feature validation** (unchanged): 25%+ of WAU engage with Ask Guru weekly.
4. **Early adoption** (updated): 12,000–19,000 installs across **US, Australia, and New Zealand** within 90 days of public launch (New Zealand added; absolute install target unchanged, but New Zealand is included specifically to improve capital efficiency of reaching it, not to raise the target further).
5. **Jain module proof-of-concept** (updated): now explicitly a v1.1 goal, not v1 — validate that a second faith module can be added at low incremental cost/time as an isolated post-launch experiment, informing both the Jain module's own launch and whether a Sikh module is worth building later.
6. **New — subscription-thesis validation goal:** run an early, low-cost paywall/pricing signal test in the New Zealand market specifically because of its low CAC and low competition, to get real data on the single riskiest assumption in the MRD (§13 there) before committing further acquisition spend in the more expensive US/Australia markets.

## Non-Goals

Unchanged from v1 (Sikh content, Buddhist content, temple booking/e-commerce/live puja, astrology/Kundli, UK/Canada/NZ... **correction: New Zealand is no longer a non-goal — it moves to v1 scope, see Requirements below**). Canada remains a non-goal for v1 but is explicitly reconsidered for a 12-month entry (see Timeline Considerations) using narrow "Hindu & Jain Panchang" branding marketed only through Hindu/Jain community channels — not a blanket exclusion going forward.

**New Non-Goals, explicit in v2 (previously just absent from scope, now deliberately named so they aren't added ad hoc):**
- **AI conversation memory.** Adds privacy/data-retention complexity for no proven retention benefit yet.
- **Voice AI.** Real accessibility value for elderly users; a defensible P2, not a v1 gap.
- **Vision AI** (e.g., photograph-your-altar features). Not planned at any horizon — real risk of the AI misjudging a home altar in a culturally insensitive way, for unvalidated demand.
- **A full content recommendation engine.** Premature against a small v1 content library.
- **Knowledge graph architecture.** Appropriate at scale, overkill for v1's narrowly-scoped Q&A.
- **Agentic AI workflows** (proactive planning/autonomous content drafting). Inappropriate risk/complexity pre-PMF.

## User Stories

### Primary persona (v1's only design target): diaspora Hindu professional ("Priya")

Unchanged from v1 — location-aware Panchang, guided prayer flow, Ask Guru, streak/reminder, household profile.

### v1.1 fast-follow personas (moved out of v1-concurrent scope)

**Jain diaspora user** and **second-generation youth with limited ritual background** — both retain their full v1 user stories unchanged, but are now explicitly sequenced as v1.1/fast-follow rather than built in parallel with the primary persona's v1 features. The quick-vs-deep-dive content toggle (originally framed as second-gen-specific) remains in v1 scope as a general-purpose, persistent setting available to all users (see Requirements, below) — it's useful regardless of generation and costs little to keep universal.

### New user story, added in v2

- As a diaspora Hindu user, I want to track personal family dates (death anniversaries/shraddha) so that I never miss an observance the way I might with a generic festival-only calendar. *(Directly evidenced by a real competitor complaint about broken shraddha-date auto-updates — see MRD v2 §7.)*

### Edge cases

Unchanged from v1.

## Requirements

**Platform decision:** unchanged — React Native (Expo), iOS + Android.

**Launch geography:** **US + Australia + New Zealand** (v2 change — New Zealand added as a low-CAC, low-competition validation market per MRD v2 §4; see Timeline Considerations for the GTM rationale).

### Must-Have (P0) — v1

1. **Location-aware daily Panchang engine** — unchanged from v1.
2. **Festival and vrat calendar with push notifications** — **v2 addition:** support regional calendar variants (e.g., Bengali Panjika, Tamil Panchangam) for the top 2–3 diaspora sub-traditions by population, not a single generic "Hindu calendar." Which traditions to prioritize should be validated against actual household onboarding region data once available, not assumed in advance.
   - *AC (new):* Given a household selects a specific regional tradition at onboarding, when the calendar loads, then festival dates and naming reflect that regional variant where it differs from the generic calendar.
3. **Guided ritual flows (text + audio)** — **v2 addition:** regionalize scripts for the same top 2–3 traditions as item 2, rather than a single generic English script. Sub-tasks: write/source region-specific script variants; record additional audio narration; extend the flow UI to select a variant.
4. **AI "Ask Guru" chat** — **v2 addition: must be RAG-grounded**, retrieving from the app's own vetted ritual/festival content library (the same dataset being cross-referenced against Drik Panchang/mPanchang and reviewed by paid content reviewers) rather than relying on the base LLM's open-ended knowledge. This is now a v1 architecture requirement, not a v1.1 enhancement, specifically because wrong specifics on a topic like this cost trust disproportionately.
   - *AC (new):* Given a ritual/festival question, when Ask Guru responds, then the response is grounded in retrieved content from the app's reviewed dataset, with a fallback to a clear "I don't have verified information on this" response rather than an ungrounded guess when retrieval confidence is low.
5. **Streak and daily checklist gamification** — **v2 addition: grace days.** A single missed day no longer zeroes a multi-week streak. Sub-task: design and implement a grace-day allowance (e.g., 1 grace day per 7-day period) into the existing streak persistence/reset logic.
   - *AC (new):* Given a user has a grace day available and misses a day, when the next day is opened, then the streak continues rather than resetting, and the user is shown supportive copy ("pick back up today") rather than loss-framed copy.
6. **Household/family profile** — **v2 addition: role-aware content depth.** Sub-task: extend the household data model to support a content-depth preference per member (not just per household), so a grandparent, a time-crunched parent, and a curious teenager sharing one household can each see appropriately-scoped content.
7. **NEW P0 — Personal/family date tracking (shraddha/death-anniversary reminders).** Reuses the existing tithi-calculation engine (item 1) at near-zero incremental build cost. Sub-tasks: extend the tithi engine to support user-entered recurring personal dates; build a simple entry/edit UI; wire personal-date reminders into the existing notification scheduling service (item 2).
   - *AC:* Given a user enters a personal date tied to a lunar tithi, when the corresponding Gregorian date recurs each year, then a reminder fires automatically without requiring annual manual re-entry (directly fixing the specific competitor bug that evidenced this feature's demand).
8. **iOS and Android apps live** — unchanged from v1.
9. **Privacy baseline (CCPA)** — unchanged from v1. GDPR pass for UK entry remains undated, per the founder's decision not to accelerate it.

**Onboarding flow — v2 revisions to how the above P0 items are surfaced:**
- One permission/decision per screen, not bundled.
- **Defer the notification-permission request until after the user has seen today's Panchang** — ask for value first, permission second.
- Tradition/region selection is **changeable later in settings**, not a locked one-time onboarding choice.
- The quick-vs-deep-dive content toggle (§ User Stories) is a **persistent setting**, not a one-time choice.
- Primary navigation collapses to **3–4 tab-bar items** (Home/Today, Calendar, Ask Guru, Profile), with guided rituals and the checklist surfaced from Home rather than as separate top-level tabs.
- Daily habit loop includes a **small rotating content element** (a quote or festival fact) alongside the static Panchang data, to avoid habituation boredom from an otherwise-identical daily screen.

### v1.1 Fast-Follow (moved out of v1 P0)

1. **Jain Panchang module** — full scope unchanged from v1's original P0 description (tradition selector, distinct dataset/branding, paid reviewer pass) but now sequenced as an isolated post-launch experiment rather than bundled into the v1 build. This is the single biggest scope change in v2, and it's what makes the other v1 additions (regionalization, RAG, shraddha tracking, UX fixes) fit inside a comparable timeline.
2. **Family legacy/UGC feature** — a household member records a personal explanation of a ritual for younger relatives. New idea from the review; needs UGC moderation design work before it can be scoped further. Not v1.

### Nice-to-Have (P1) — updated

1. Multi-language UI — **now explicitly tied to actual regional-tradition signup data (item 2, P0)** rather than an assumed single language.
2. Referral/"invite family" flow with a reward — unchanged, but now higher-priority given it's the cheapest available growth lever (see Timeline Considerations).
3. **New — festival greeting-card feature.** A shareable, branded card generated in-app for WhatsApp/Instagram Stories during major festivals (Diwali, Navratri), converting an existing diaspora social behavior into organic acquisition. Not in v1; targeted for the first major festival cycle post-launch.
4. **New — lifecycle email sequence.** Welcome series, day-3 nudge, festival-timed win-back for lapsed users. The v1 product is currently mobile-notification-only; this adds a minimal email capability. Targeted for the 6-month horizon, not v1 (new infrastructure).
5. Deeper AI Q&A — unchanged from v1.
6. A/B-tested notification timing — unchanged from v1.
7. GPS-based temple finder/directory — unchanged from v1.
8. **New — Family/household plan pricing tier.** A distinct paid tier for the household feature (currently free), priced above the individual subscription for better per-household economics. Targeted for the 6-month horizon alongside Jain v1.1.
9. Paid subscription tier (individual) — unchanged from v1, sequenced after retention is proven.

### Future Considerations (P2) — updated

1. Sikh sub-brand / Nanakshahi calendar — unchanged.
2. E-commerce (puja kits, prasad, **now specifically flagged as affiliate-link based, not owned inventory/logistics** — lower operational complexity than the original framing).
3. **New — pandit/temple marketplace.** Per MRD v2 §5's Blue Ocean finding: this is the highest-ceiling revenue opportunity identified across the whole review, proven at scale by Sri Mandir and VAMA in India but not yet exported to diaspora markets. Explicitly named here as a 12–24 month strategic option (MRD v2 §18), not a v1/v1.1 distraction.
4. Live-streamed puja or temple booking marketplace — unchanged (subsumed into item 3 above).
5. Astrology/Kundli matching — unchanged.
6. **Expansion to Canada** (moved up from "unscoped" to an explicit 12-month consideration, per MRD v2 §4 — narrow Hindu/Jain-only branding, community-channel-only marketing) **, New Zealand** (moved to v1, no longer P2)**, and the EU** — Netherlands and Germany remain deferred per the country analysis; Netherlands specifically requires a dedicated Surinamese-Hindustani content strategy before entry, not a copy-paste localization.
7. Broader community/social features (e.g., temple-congregation-level aggregation) — unchanged, still a real but unaddressed network-effect opportunity.
8. Employer/ERG partnership channel — new, long-term.
9. Temple SaaS (white-labeling the Panchang/notification engine for temples) and API licensing — new, lowest priority of all revenue ideas surfaced, noted for completeness rather than active pursuit.

## Success Metrics

**Leading indicators** — unchanged (onboarding completion 70%+) plus:
- **New: explicit activation event** — household setup + first Panchang view + notifications enabled, within the first session. Track % of installs reaching this milestone from day one.

**Lagging indicators** — unchanged (D7 ≥30%, D30 ≥15%, checklist completion 40%+, Ask Guru WAU 25%+, 90-day installs 12,000–19,000 across US+Australia+NZ, conversion 3–5% within 6 months, ARPU $60–90/yr, app store rating ≥4.5/50+ reviews by month 3) plus:
- **New North Star metric: Weekly Household Ritual Completions** — a composite habit-loop metric across a household, adopted as the primary metric guiding day-to-day product decisions, rather than treating D7/D30 retention (a lagging indicator) as the de facto North Star.
- **New: LTV:CAC ratio**, tracked from day one rather than added later.

## Open Questions

Carried from v1, with two resolved and one new:

- **[Resolved, v1]** Start date July 7, 2026; target public launch remains ~Aug 29, 2026 in substance (see Timeline Considerations for how the added/removed scope nets out against this date).
- **[Resolved, v1]** Panchang/Jain calendar accuracy validation approach — unchanged; Jain-specific validation now happens on the v1.1 timeline rather than the v1 timeline.
- **[Resolved, v2 — new]** UK rollout timing: reviewed and explicitly **not** accelerated — remains an undated second wave per the founder's decision, despite the UK's highest-temple-density finding (MRD v2 §4).
- **[Resolved, v2 — new]** Canada: no longer a blanket non-goal — reconsidered as a 12-month entry with narrow branding, per MRD v2 §4.
- **[Product, non-blocking, unchanged]** Which LLM vendor for Ask Guru, and per-query cost at scale — now more urgent given RAG grounding adds retrieval infrastructure cost on top of generation cost.
- **[Business, non-blocking, unchanged]** No budget figure provided — still the single largest unresolved input to this entire plan, per both the MRD's Go/No-Go conditions and the Risk Register (MRD v2 §12).

## Timeline Considerations *(rebuilt in v2 — replaces the week-by-week Gantt with a 90-day/6-month/12-month/24-month structure, per your decision)*

**Net effect of v2 scope changes on the build:** delaying the Jain module (originally a multi-week item: dataset compilation, distinct branding, paid reviewer pass) recovers roughly the time consumed by this version's additions (regionalization, RAG grounding, shraddha tracking, streak/household UX changes, onboarding revisions). This is a rebalancing, not a free lunch — **if the New Zealand-inclusive v1 build starts slipping, the response is cutting further scope, not extending the launch date**, consistent with the Risk Register's timeline risk (MRD v2 §12, item 14).

**90 days (build + launch + immediate post-launch):** Ship v1 to the revised spec above — Hindu-only, regionalized top 2–3 traditions, RAG-grounded Ask Guru, shraddha tracking, revised onboarding/navigation — across **US, Australia, and New Zealand**. Pilot temple partnerships with 1–2 temples (matched to the metro concentration data in MRD v2 §2) before wider rollout. Run the New Zealand pricing/paywall signal test (Goals, item 6) to get the first real data on the subscription-thesis risk. Target public launch remains ~August 29, 2026.

**6 months:** Jain module ships as v1.1, now as an isolated, measurable experiment rather than a bundled v1 assumption. Family-plan pricing tier launches. Festival greeting-card feature and lifecycle email sequence ship, timed to the first major festival cycle post-launch. Incorporate New Zealand test-market data into US/Australia scaling and pricing decisions.

**12 months:** Canada entry with narrow Hindu/Jain-only branding. Regional language/tradition expansion driven by actual signup data rather than assumption. First serious, data-informed evaluation of the pandit/temple marketplace opportunity (P2, item 3) — using a year of real usage data, not speculation. First employer/ERG partnership pilot.

**24 months:** Netherlands entry only if a dedicated Surinamese-Hindustani content strategy exists by then; Germany re-evaluated as that community matures. A deliberate go/no-go on the marketplace pivot-or-add question, informed by two years of data, per the MRD v2's Go/No-Go reframe (§18 there).

**Dependencies to hold firm on:** RAG-grounded Ask Guru depends on the content library being substantively complete first, not built in parallel. The marketplace opportunity (P2, item 3) should not be pursued until the core subscription thesis from the 90-day/6-month period is resolved one way or another — chasing both at once is exactly the scope dilution this v2 plan is designed to avoid.

---

## Document status

PRD v2 complete, reflecting all accepted recommendations from the 2026-07-05 investor-grade review. Companion document: `PanchangPal-MRD-v2.md`.