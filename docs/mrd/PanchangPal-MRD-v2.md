# PanchangPal — Market Requirements Document (v2)

> **Vision:** Make it effortless for every Hindu family living abroad to preserve and practice their traditions every day.

**Supersedes:** `PanchangPal-MRD.md` (v1, 2026-07-05). Built from the v1 MRD plus the accepted recommendations from `PanchangPal-Review-v1.md` (investor-grade review, 2026-07-05). Only accepted recommendations are reflected below — rejected items (e.g., accelerating UK GDPR compliance) are unchanged from v1.

**What changed vs. v1, at a glance:** single-persona focus (Priya only for v1); New Zealand added as a launch market; Canada reconsidered as a 12-month entry with narrow branding; expanded competitive financials and four new analysis frameworks; Market Gaps expansion; three new revenue streams plus an explicit marketplace-as-strategic-wedge reframe; new Risk Register, Assumption Register, North Star metric, and a rebuilt 90-day/6-month/12-month/24-month roadmap; new Business Model Canvas, TAM/SAM/SOM visualization, and Jobs-to-be-Done sections.

---

## 1. Problem Statement

The Hindu diaspora in the US, Australia, and New Zealand — the three markets covered by this product's v1 launch (New Zealand added in v2 as a low-cost validation market, see §4) — comprises roughly **4.5M people** (US: 2.65M–3.6M; Australia: 684,002; New Zealand: 153,534 — all per census/Pew sources). A further ~800,000 UK Hindus and ~828,195 Canadian Hindus represent later-wave opportunities (UK remains an undated second wave pending GDPR work; Canada is newly reconsidered as a 12-month entry, §4). A Jain diaspora of roughly 80,000–200,000, concentrated in the US, is a smaller, explicitly fast-follow segment (v2 change — see §2 and §6).

This population maintains religious identity more than daily practice. National survey data (Carnegie 2020; Pew) show most diaspora Hindus consider religion personally important, but only a minority pray daily (~40%) or attend services weekly (~27%), and second-generation adults describe substituting casual practice for structured ritual. This is a documented belief-practice gap.

Existing apps don't close it. Category-leading Panchang apps (Drik Panchang, mPanchang) are ad-heavy and India-timezone-default, confirmed directly via app store reviews. Devotional platforms (Sri Mandir, VAMA, DevDham) are transactional, not daily-guidance-oriented, and diaspora is a small but fast-growing, high-ARPU share of their base (Sri Mandir: ~2.6% of MAU, but ~$81/yr diaspora ARPU vs. $7–9/yr in India, +15% QoQ registered-user growth, backed by a $20M Series C).

**New in v2 — the single most important addition to this section:** the MRD v1 validated that this population *maintains identity, has real pain points, and will pay for something* — but the review process identified that **every proven revenue dollar in this exact category so far is transactional** (Sri Mandir: ~$8.7M revenue / ~$12M run rate with ~55% six-month retention; VAMA: 250,000+ transacting users, on track past $5M ARR on only ~$900K of funding), not subscription-for-daily-utility content, which is what PanchangPal is actually betting on. **This is now flagged explicitly as the top assumption to de-risk before scaling spend** (see Assumption Register, §13), and the transactional/marketplace model — proven at scale by exactly the competitors reviewed — is carried forward as a named strategic fallback and, in the Go/No-Go section (§19), as a possible long-term destination rather than a distraction from it.

**Evidence base:** unchanged from MRD v1, plus Tracxn, ZoomInfo, Storyboard18, and Benzatine (Sri Mandir/VAMA revenue and retention figures, new in v2).

---

## 2. Target Audience

**v2 change: narrowed to a single primary launch persona.** MRD v1 used a three-tier structure (primary/secondary/secondary-but-significant). The review scored all three personas against nine dimensions (market size, purchasing power, daily usage, viral potential, referral potential, subscription likelihood, CLV, ease of acquisition, retention) and found the first-generation household anchor scored decisively highest (36/45 vs. 26/45 for Jain diaspora and 24/45 for second-generation adults) — see the Persona Scorecard in §14 (Jobs-to-be-Done) for the full breakdown.

**Primary — and, for v1, only — launch persona: "Priya," the Household Anchor.** First-generation immigrant, late 20s–50s, in a diaspora-dense metro in the US, Australia, or New Zealand. College-educated, household income near or above the ~$126K diaspora median. Identifies as Hindu but practices inconsistently. Decision-maker for household setup and the subscription payer.

**Explicitly fast-follow, not v1-concurrent:**
- **Jain diaspora users** — the module is delayed to v1.1 (PRD v2, §6). This isn't a demotion of the segment's importance (the differentiation case for Jain-specific branding remains real, MRD v1 §9) — it's a sequencing decision to protect a tight solo-founder timeline, made explicit and deliberate rather than left as an implicit scope risk.
- **Second-generation adult children** — remains a real, growing segment (contested at 9%–34% of the population, genuinely unresolved data) but is not a v1 design target. The "quick vs. deep-dive" content toggle and simplified onboarding remain in v1 scope as broadly useful UX, not persona-specific gating.

**Geographic concentration** (unchanged core finding from v1, extended to New Zealand): ~10 US metro areas, ~68% of Australian Hindus in Sydney+Melbourne, and **64.7% of New Zealand's Indian population in Auckland alone** — the tightest concentration of any market analyzed, and the basis for New Zealand's role in §4 below.

**Evidence base:** unchanged from MRD v1, plus the persona-scoring methodology introduced in the review.

---

## 3. Market Sizing (TAM/SAM/SOM)

Unchanged from MRD v1's core figures, with New Zealand folded into the launch-geography SAM calculation (v2 change).

- **TAM (three original markets + Jain): ~4.7M–5.3M** — unchanged from v1.
- **SAM (v1 launch geography):** previously US + Australia only (~2.7M–2.9M reachable adults). **v2 adds New Zealand** — population 153,534 Hindus, ~78% adult, ~90%+ smartphone penetration, adding roughly ~108,000 reachable adults. **Revised SAM: ~2.8M–3.0M reachable adults.**
- **SOM:** the PRD's Year-1 target (12,000–19,000 installs across US + Australia in 90 days) is unchanged in absolute terms, but New Zealand's addition is expected to *improve capital efficiency* rather than raw volume — see the Country Opportunity Analysis (§4) for why New Zealand is being added as a low-CAC validation market, not a volume driver.

### TAM/SAM/SOM Visualization

```
TAM  ████████████████████████████████████████████████  ~4.7M–5.3M  (US+UK+Australia+Canada Hindu/Jain diaspora)
SAM  █████████████████████████████                     ~2.8M–3.0M  (v1 launch: US+Australia+NZ, adult, smartphone-owning)
SOM  ██                                                 12K–19K     (Year-1 installs, ~0.4–0.7% of SAM)
```

*(Funnel is illustrative, not to precise linear scale — proportions are directionally accurate: SAM is roughly 55–65% of TAM once UK/Canada/most Jain population are excluded from v1 geography; Year-1 SOM is a deliberately conservative low-single-digit-percent capture of SAM.)*

---

## 4. Country Opportunity Analysis *(new section in v2)*

Full seven-country scorecard (USA, UK, Australia, Canada, New Zealand, Germany, Netherlands) from the review, carried into the MRD:

| Metric | USA | UK | Australia | Canada | New Zealand | Netherlands | Germany |
|---|---|---|---|---|---|---|---|
| Hindu population | 2.65M–3.6M | ~800K | 684,002 | 828,195 | 153,534 | 200K–240K | ~100K–150K (est.) |
| Temple density | 1,000+ | 303 (highest) | 134 | 252 | Handful | Est., not sourced | Sparse |
| Direct competition | Highest | High | High | Moderate | Low | Low | Low |
| Est. CAC (this category) | $8–15 | $8–15 | $7–13 | $8–14 | **$4–8 (lowest)** | $6–12 | $6–12 |
| Population growth rate | Steady | Steady | +148%/decade | Steady | **+88% since 2013 (highest)** | Stable | Fast (recent migration wave) |
| Overall opportunity score (0–100) | 82 | 80 | 79 | 78 | 74 | 60 | 55 |

**v2 launch geography decision: US + Australia + New Zealand.** New Zealand is added specifically because it is the cheapest, least-competitive, most concentrated market in the set — ideal for validating the habit-loop-and-monetization thesis (the top assumption flagged in §1) before committing real acquisition spend in the more expensive US/UK/Australia markets.

**Canada — reconsidered as a 12-month entry, not permanently excluded.** Canada's Hindu population (828,195) is larger than Australia's, and was excluded in v1 purely on a product-positioning concern (marketing a Hindu-branded product into a market with a large, politically salient Sikh population, including real Hindu–Sikh tension tied to Khalistan-movement politics specifically in Canada). This is a legitimate, Canada-specific risk, not a market-size problem — **the mitigation is narrow "Hindu & Jain Panchang" branding, marketed exclusively through Hindu/Jain temple and community channels**, never generic "South Asian" or "Indian" framing. Added to the 12-month roadmap (§15) on this basis.

**UK — remains an undated second wave** (recommendation to accelerate GDPR compliance work was reviewed and explicitly not accepted; the founder's call is to keep this as originally planned in the PRD).

**Netherlands and Germany remain out of scope**, per the review's findings: the Netherlands' Hindu population is overwhelmingly Surinamese-Hindustani (a culturally and linguistically distinct diaspora requiring dedicated content, not a copy-paste extension), and Germany's Indian population is a recent, professional/student migration wave with unknown religious composition and weak temple infrastructure.

---

## 5. Competitive Analysis *(expanded in v2)*

Core v1 findings unchanged (no competitor combines localized Panchang + habit loop + AI + Jain-specific branding). **New financial data:** Sri Mandir generated ~₹72.6Cr (~$8.7M) revenue for FY ending March 2025, an early-2025 run rate around $12M, and a ~55% six-month retention rate (likely a payer/subscriber metric, not raw install retention). VAMA has 250,000+ transacting users and is on track past $5M ARR on only ~$900K total funding — a notably capital-efficient competitor.

### Feature Matrix

| Feature | Drik Panchang/mPanchang | Sri Mandir | VAMA | DevDham | **PanchangPal** |
|---|---|---|---|---|---|
| Location-aware Panchang | Partial (web only) | No | No | No | **Yes** |
| AI ritual/festival Q&A | No | No | No | No | **Yes** |
| Streak/habit gamification | No | No | No | No | **Yes** |
| Household/family profile | No | No | No | No | **Yes** |
| Jain-specific branded content | No | No | No | No | **Yes (v1.1)** |
| Temple booking/e-darshan | No | Yes (core) | Yes (core) | Yes (core) | No |
| Astrology/Kundli | Yes (core) | Some | Yes (core) | No | No |

### Competitive Positioning

```mermaid
quadrantChart
    title Competitive Positioning
    x-axis Utility/Accuracy --> Devotional/Transactional
    y-axis India-centric --> Diaspora-localized
    quadrant-1 Diaspora + Transactional (open)
    quadrant-2 Diaspora + Utility (PanchangPal's target)
    quadrant-3 India + Utility
    quadrant-4 India + Transactional
    Drik Panchang: [0.2, 0.25]
    mPanchang: [0.2, 0.2]
    Sri Mandir: [0.75, 0.35]
    VAMA: [0.8, 0.15]
    DevDham: [0.75, 0.1]
    PanchangPal: [0.35, 0.85]
```

### SWOT

- **Strengths:** verified feature gap; founder focus; low build cost vs. funded competitors.
- **Weaknesses:** unproven subscription-for-utility model (§1); no capital to match Sri Mandir's spend; solo-founder execution risk.
- **Opportunities:** NZ's low-CAC profile, Canada's underestimated population, the marketplace fallback (below).
- **Threats:** Sri Mandir's proven 55% six-month retention plus $12M run rate gives it both motive and means to build a competing habit feature.

### Blue Ocean

The clean blue ocean is diaspora-localized daily utility (PanchangPal's current target). **The bluer ocean — a diaspora-specific temple/pandit/life-event marketplace — is uncontested and already commercially proven in India** by VAMA and DevDham, just not exported to diaspora markets. Carried into the Go/No-Go reframe, §19.

**Evidence base:** Tracxn, ZoomInfo, Storyboard18, Benzatine (new); Google Play, Tracxn, Crunchbase, Inc42 (carried from v1).

---

## 6. User Personas

**v1 launch persona: Priya only** (see §2 for the scoring rationale). Full persona detail carried unchanged from MRD v1 — first-generation household anchor, decision-maker and payer, time-constrained, identity-strong/practice-inconsistent.

**v1.1 fast-follow personas** (Jain diaspora user, second-generation adult child) retain their full MRD v1 persona definitions unchanged — they are deferred in sequencing, not redefined.

---

## 7. Top Pain Points

Unchanged from MRD v1. Ranked by evidence strength: (1) India-timezone/location defaults — strong evidence; (2) ad intrusiveness — strong evidence; (3) belief-practice gap — strong evidence; (4) fragmented/low-trust guidance sources — medium evidence; (5) second-gen ritual knowledge gap — medium evidence; (6) Jain content conflation risk — weaker/inferred; (7) app instability — weaker/inferred.

**v2 addition:** a new, strongly-evidenced pain point identified in the review — **personal/family date tracking (shraddha/death-anniversary reminders)** is unaddressed by every competitor and directly evidenced by a specific Drik Panchang user complaint about broken auto-updating shraddha tithi dates. Elevated to a v1 P0 feature in PRD v2 (§6 there) given it reuses the existing tithi-calculation engine at near-zero incremental cost.

---

## 8. Existing Alternatives

Unchanged from MRD v1: temple WhatsApp groups (confirmed via the Hindu Temple of Greater Cincinnati example), browser-based Panchang websites with partial localization (mypanchang.com, drikpanchang.com settings), family oral knowledge, generic search/YouTube, phone calls to family/pandits in India, printed calendars (declining, weak evidence).

---

## 9. Market Gaps *(expanded in v2)*

MRD v1's six gaps unchanged. **New gaps identified in the review:**
- **Underserved audiences:** interfaith/mixed households, elderly diaspora (different tech comfort/accessibility needs), non-Indian-origin Hindu converts.
- **Ignored languages:** the PRD's P1 plan picks a single regional language (Gujarati) by assumption rather than by actual diaspora composition data. **v2 recommendation, applied in PRD v2 (§6):** validate regional language/tradition choice against real household onboarding data (region selected at signup), not decided in advance — the same principle now applied to the regionalized ritual scripts and festival calendar (PRD v2).
- **Ignored family use cases:** household sharing doesn't yet differentiate content depth by family member role — addressed in PRD v2 as role-aware household content depth.
- **Ignored network effects:** the household invite loop is family-level only; a community/temple-congregation-level network effect remains a real, unaddressed opportunity (not v1 scope).
- **Ignored retention loops:** no seasonal re-engagement or lapsed-user win-back strategy existed in v1 — addressed via the new lifecycle email sequence and festival greeting-card feature (PRD v2, §9 there).

---

## 10. Differentiation Strategy

Unchanged from MRD v1: the real, hard-to-copy moat is Jain-specific trust and household network effects — not the AI or habit-loop features themselves, which a funded competitor (Sri Mandir) could replicate within a few quarters. **v2 addition:** the marketplace Blue Ocean finding (§5) is now named as a second, larger differentiation frontier that PanchangPal is not pursuing in v1 but is positioned to reach later, precisely because the trust and household relationships built in v1 are transferable to that bigger opportunity (see Go/No-Go, §19).

---

## 11. Revenue Opportunities *(expanded in v2)*

MRD v1's subscription analysis (cross-validated $60–90/yr ARPU against Sri Mandir's actual ~$81/yr diaspora ARPU) and ad-supported bridge-revenue discussion are unchanged. **New revenue streams added in v2, ranked:**

| Rank | Stream | Status |
|---|---|---|
| 1 | Subscription (ad-free + AI access) | Unchanged from v1 — primary |
| 2 | **Family/household plan pricing** | **New in v2** — a distinct paid tier for the household feature, currently free in v1 |
| 3 | Ad-supported free tier | Unchanged from v1 — under exploration |
| 4 | **Affiliate revenue** (puja items/books, no owned inventory) | **New in v2** |
| 5 | **Digital one-time-purchase content packs** | **New in v2** |
| 6 | Employer/ERG partnerships | New in v2, long-term |
| 7 | **Marketplace (pandit/temple booking)** | New in v2 — highest ceiling of any stream identified; explicit 12–24 month strategic option (§19), not v1 |
| 8 | Temple SaaS | New in v2, low priority |
| 9 | API licensing | New in v2, lowest priority |

**Budget/runway remains an open, unprovided input**, unchanged from v1.

---

## 12. Risk Register *(new section in v2)*

| # | Category | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|---|
| 1 | Technical | Panchang calculation errors damage trust | Medium | High | Cross-reference + paid reviewers (planned) |
| 2 | Technical | LLM API cost scales unpredictably | Medium | Medium | Rate-limiting/cost caps; model cost early |
| 3 | AI | Ask Guru hallucinates ritual specifics | Medium–High without RAG | High | RAG grounding (now in PRD v2 scope) |
| 4 | AI | Guardrail jailbreak elicits out-of-scope advice | Medium | Medium–High | RAG scoping + planned QA refusal test set |
| 5 | Product | Streak mechanic drives churn instead of retention | Medium | Medium | Grace days (now in PRD v2 scope) |
| 6 | Product | Generic ritual script alienates regionally diverse households | Medium | Medium | Regionalize top 2–3 traditions (now in PRD v2 scope) |
| 7 | Competition | Sri Mandir ships a competing habit/AI feature first | Medium | High | Speed to market; temple trust as the real moat |
| 8 | Market | **Subscription-for-daily-utility thesis is unproven** | Unknown — the core bet | High | New Zealand test-market launch (§4) before big spend |
| 9 | Legal | CCPA/GDPR gaps delay UK entry or create liability | Medium | Medium–High | CCPA checklist (planned); UK GDPR pass remains undated (founder's call) |
| 10 | Religious | Doctrinal error or perceived political framing triggers backlash | Low–Medium | High | Paid reviewers; apolitical marketing |
| 11 | Financial | Runway insufficient to reach retention-proof milestone | Unknown — unresolved | Critical | Confirm runway before committing to build |
| 12 | Execution | Solo founder is a single point of failure across an expanded v1 scope | Medium–High | Critical | Jain delay to v1.1 recovers build time; consider contracting the highest-specialized pieces |
| 13 | Execution | No redundancy — every mitigation above has the same owner | High (structural) | Medium | Not fixable pre-launch; inform how aggressively new scope gets added mid-build |
| 14 | Timeline | Zero prep buffer between PRD finalization and Week 1 start | High (already baked in) | Medium | Treat any Week 1 slip as the most likely first domino |

---

## 13. Assumption Register *(new section in v2)*

| Assumption | Classification | Experiment |
|---|---|---|
| Diaspora will pay a subscription for daily utility content | **High risk — the most important open question in the plan** | NZ paywall test before wider spend |
| $60–90/yr ARPU achievable for PanchangPal specifically | Needs validation | Soft-launch pricing test |
| Temple partnerships convert into installs | Needs validation | Pilot 1–2 temples before full GTM rollout |
| Jain module buildable at low incremental cost | Needs validation | Now isolated as a v1.1 experiment, not bundled into v1 |
| Second-gen population size/engagement | **Unknown** — genuinely contested data | Instrument cohort signals post-launch |
| AI cost per query stays within budget at scale | **High risk** — open PRD question, unresolved | Model cost against realistic WAU before unlimited free-tier AI |
| Solo founder can execute full v1 scope in 8 weeks | High risk, compounded by new v2 additions | Offset by Jain delay and other scope discipline (PRD v2) |
| Hindu/Jain population figures | **Validated** | Independently cross-sourced |
| The specific feature-combination gap is real | **Validated** | Independently verified via direct competitor research |
| Guilt/streak mechanics drive retention, not churn | Needs validation, ethically flagged | A/B test streak-loss messaging tone once live |

---

## 14. Metrics *(expanded in v2)*

**New North Star metric: Weekly Household Ritual Completions** — a composite habit-loop metric across a household, replacing reliance on D7/D30 retention alone as the primary signal.

| Category | Metrics |
|---|---|
| Leading | Onboarding completion (70%+); **new: explicit activation event** (household setup + first Panchang view + notifications enabled, within first session); notification opt-in rate; Ask Guru first-use rate |
| Lagging | D7 (30%+), D30 (15%+) retention; 90-day installs; conversion rate; ARPU |
| Growth | Installs by channel (temple/ASO/referral); CAC by country; viral coefficient (once the greeting-card feature ships) |
| Retention | D7/D30/D90; streak-length distribution; churn by cohort |
| Monetization | Conversion rate; ARPU; **new: LTV:CAC ratio, tracked from day one** |
| AI | Ask Guru WAU (25%+); query cost per user; refusal-accuracy rate; periodic hallucination audit |
| Referral | Household invite send/accept rate; **new: greeting-card generation/share rate** |

---

## 15. Roadmap *(rebuilt in v2)*

**90 days:** Ship v1 — Hindu-only (Jain delayed to v1.1), US + Australia + **New Zealand** (v2 addition). Regionalized ritual scripts/calendar for top 2–3 traditions. RAG-grounded Ask Guru. Shraddha/personal date tracking. Streak grace days, role-aware household content, revised onboarding flow. Pilot temple partnerships with 1–2 temples before wider rollout. Validate the activation event and early conversion signal — first real data on the top assumption (§13).

**6 months:** Jain module v1.1 ships (if the low-incremental-cost assumption holds once isolated). Family-plan pricing tier live. First seasonal re-engagement campaign (festival greeting-card feature + lifecycle email sequence) around the next major festival. Incorporate New Zealand test-market learnings into US/Australia scaling decisions. UK GDPR work remains undated per the founder's call.

**12 months:** **Canada entry** with narrow Hindu/Jain-only branding (§4). Regional language expansion driven by actual signup data. First serious evaluation of the marketplace/transactional opportunity using real usage data. First employer/ERG partnership pilot.

**24 months:** Netherlands entry only with a dedicated Surinamese-Hindustani content strategy, if pursued. Germany re-evaluation as that community matures. A deliberate go/no-go on the marketplace pivot-or-add question (§19), informed by two years of real data.

---

## 16. Business Model Canvas *(new section in v2)*

| Block | Content |
|---|---|
| **Customer segments** | v1: first-gen diaspora household anchors (US/Australia/NZ). Fast-follow: Jain diaspora, second-gen adults. |
| **Value proposition** | Localized daily Panchang + AI-scoped ritual guidance + habit-formation, in one native mobile experience — a gap no competitor fills (§5). |
| **Channels** | Temple/community partnerships (primary); ASO on long-tail city+Panchang keywords; household referral; festival greeting-card virality (new). |
| **Customer relationships** | Household-based shared accounts; lifecycle email + push notification touchpoints (new). |
| **Revenue streams** | See §11 ranked list — subscription and family-plan pricing primary; ads, affiliate, digital packs secondary; marketplace as long-term option. |
| **Key resources** | Founder's engineering + content-sourcing time; paid pandit/Jain reviewers; the tithi-calculation engine (also powers the new shraddha-tracking feature). |
| **Key activities** | Panchang engine accuracy; content regionalization; AI guardrail/RAG maintenance; temple relationship-building (the actual moat, per §10). |
| **Key partnerships** | Temples/community orgs (GTM); LLM API vendor; paid content reviewers. |
| **Cost structure** | Solo-founder time (largest implicit cost); LLM API costs (unresolved open question, §12); app store fees; paid reviewers; eventual paid acquisition in Tier 1 markets. |

---

## 17. Jobs-to-be-Done *(new section in v2)*

Framed around Priya, the sole v1 persona:

- **Functional job:** "Help me know today's correct tithi/muhurta/festival dates without manually adjusting for my time zone."
- **Emotional job:** "Help me feel like I'm maintaining my family's tradition, even though I don't have time to do it the way my parents did."
- **Social job:** "Help me pass this on to my kids without lecturing them or making them feel guilty."

### Persona Scorecard (from the review, formalized here)

| Dimension | Priya | Jain user | Second-gen |
|---|---|---|---|
| Market size | 4 | 1 | 3 |
| Purchasing power | 5 | 4 | 2 |
| Daily usage potential | 4 | 4 | 2 |
| Viral potential | 2 | 1 | 4 |
| Referral potential | 3 | 2 | 4 |
| Subscription likelihood | 5 | 4 | 2 |
| CLV | 5 | 3 | 2 |
| Ease of acquisition | 4 | 3 | 3 |
| Long-term retention | 4 | 4 | 2 |
| **Composite (/45)** | **36** | **26** | **24** |

---

## 18. Go/No-Go Recommendation *(updated in v2)*

**Recommendation: Conditional GO — unchanged from v1, with the conditions sharpened and one major strategic reframe added.**

The v1 conditions stand: speed matters given Sri Mandir's proven retention and capital; runway must cover the pre-revenue period (still unresolved); temple/community trust-building is the real moat, not the AI/habit features.

**New in v2 — the marketplace reframe, accepted as an explicit long-term strategic option:** the review found that the only revenue model proven to reach meaningful scale in this exact category (Sri Mandir's ~$12M run rate, VAMA's $5M+ ARR on $900K of funding) is transactional/marketplace, not subscription-for-daily-utility — which is what v1 is actually testing. **This MRD now explicitly frames the v1 daily-habit product as a trust-building wedge that could lead into a larger pandit/temple marketplace business, rather than treating the subscription habit app as necessarily the end-state business.** This is not a pivot decision — v1 proceeds as scoped — but it reframes what "success" at the 12–24 month mark should be evaluated against: not just whether the subscription thesis works, but whether the household trust and relationships built in v1 are transferable to the larger opportunity if the subscription thesis underperforms.

**What would change this to a No-Go:** unchanged from v1 — insufficient runway to reach ~6 months to first subscription revenue, or a funded competitor visibly shipping a comparable diaspora habit feature before launch.

---

## Document status

MRD v2 complete, reflecting all accepted recommendations from the 2026-07-05 investor-grade review. Companion document: `PanchangPal-PRD-v2.md`.