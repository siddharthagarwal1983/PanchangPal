# PanchangPal — Market Requirements Document (MRD)

**Status:** In progress — built section by section, each section frozen after evidence review
**Prepared:** 2026-07-05 (ongoing)
**Companion to:** PanchangPal-v1-PRD.md

---

## 1. Problem Statement — FROZEN

The Hindu diaspora in the US and Australia — the two markets covered by this product's v1 launch — comprises roughly **4.3M people** (US: 2.65M–3.6M depending on source/year, per Pew Research; Australia: 684,002, per the 2021 Census, the more reliable of the two figures). A further ~800,000 Hindus in the UK (2021 England & Wales census) represent a second-wave opportunity once GDPR compliance work is done, putting the longer-run three-market population at roughly **4.4M–5.1M**. A Jain diaspora of roughly 80,000–200,000 people, concentrated in the US, sits alongside this as a smaller, secondary segment — small enough in absolute terms that it's flagged here as a product-market-fit risk to revisit at Go/No-Go, given the build investment a dedicated Jain module requires.

This population maintains religious identity more than daily practice. National survey data (Carnegie Endowment's 2020 Indian American Attitudes Survey; Pew Research) show most diaspora Hindus consider religion personally important, but only a minority pray daily (~40%) or attend services weekly (~27%), and second-generation adults describe substituting casual or improvised practice for structured ritual. This is a documented belief-practice gap, not merely an assumption.

The apps this population currently uses don't close that gap:
- **Category-leading Panchang/calendar apps** (Drik Panchang, mPanchang) are confirmed by app store reviews to be ad-heavy (ads roughly every 2 taps), India-timezone-default with no reliable location override on iOS (defaults to New Delhi), and prone to timezone-specific crash bugs for North American users — accurate, but not localized or personalized.
- **Devotional/transactional platforms** (Sri Mandir and similar) are built around temple bookings and e-commerce, not daily guidance. Diaspora is currently a small share of their user base (~2.6% of Sri Mandir's MAU) — but it is **not a neglected segment**: it's the platform's highest-value cohort (diaspora ARPU is ~9–10x India ARPU: ~$81/year vs. $7–9/year), diaspora registered users are growing ~15% quarter-over-quarter, and Sri Mandir's parent company just closed a $20M Series C (June 2025, $53M raised to date) aimed partly at this kind of expansion. **The gap is real but closing, not wide open and static** — this reframing carries forward into the Competitive Analysis, Differentiation Strategy, and Go/No-Go sections below, where time-to-market is treated as a material risk factor rather than a footnote.

No competitor combines accurate, localized daily Panchang with AI-assisted ritual guidance and habit-formation mechanics for this audience. The cost of inaction: diaspora users continue relying on fragmented, low-trust sources (family memory, generic search) for daily practice, while a funded incumbent is actively moving to capture the same segment.

**Evidence base:**
- Pew Research, *Religious Landscape Study* (2023–24) and *Hindus* projections (2015) — US Hindu population estimates and 2050 projection
- 2021 Australian Census (ABS) — Hindu population count
- 2021 UK Census (England & Wales) — Hindu population count
- Carnegie Endowment, *2020 Indian American Attitudes Survey* — daily prayer/service attendance rates
- USA Data Hub / JAINA — US Jain population estimates
- App Store / Google Play reviews, Drik Panchang and mPanchang listings — ad density, timezone/location bugs
- TechCrunch (Jun 2025), Inc42, YourStory — Sri Mandir/AppsForBharat funding, MAU, diaspora ARPU and growth rate

---

## 2. Target Audience — FROZEN

**Primary audience:** First-generation Hindu diaspora adults, roughly 28–55, in the US and Australia — college-educated (70%+ hold bachelor's degrees or higher, vs. 39% national average), high-income (~$126,000 median household income, Pew), geographically concentrated in a small number of metro clusters, and religiously identified but practice-inconsistent (see Section 1). They are the household decision-makers most likely to set up a family profile and pay for a subscription. Purchasing power here is independently cross-validated: this income/education profile supports the PRD's $60–90/year ARPU target, which lines up closely with Sri Mandir's actual diaspora ARPU (~$81/year) — two independent sources converging on the same number.

**Secondary audience:** The Jain diaspora — demographically similar in income, education, and geography, but much smaller in absolute numbers (roughly 80,000–200,000 in the US, concentrated in the same metro clusters as the broader Indian diaspora).

**Secondary-but-significant audience:** Second-generation, US/Australia-born adult children of the primary audience — English-first, weaker in ritual knowledge, and a plausible source of both organic growth (via household invite flows) and long-term retention risk if the product assumes first-generation fluency in ritual context. Population sizing for this group is genuinely contested across sources (9%–34% depending on methodology and age cutoff, with a hard data point that 22% of Indian-Americans are already under 18 and predominantly US-born). Rather than resolve this discrepancy, this MRD treats the group as directionally large and growing — not a rounding error, but also not co-equal with the first-generation payer/decision-maker. Practical implication: onboarding and content depth (the PRD's "quick vs. deep-dive content" requirement) must accommodate this group, but GTM and monetization should still target first-generation household heads first.

**Geographic concentration is a go-to-market asset, not just a demographic fact.** In the US, Indian-Americans concentrate in ~10 metro areas (New York, Chicago, San Francisco Bay Area, Dallas, Washington DC, San Jose, Los Angeles, Houston, Atlanta, Philadelphia), with nearly 50% living in just four states (CA, TX, NJ, NY). In Australia, ~68% of Hindus live in just two cities (Sydney 39%, Melbourne 29%). This validates the PRD's temple/community-partnership acquisition strategy: a small number of city/temple partnerships can plausibly reach a large share of the addressable population without broad paid acquisition spend.

**Evidence base:**
- Pew Research, *Hindu American socioeconomic profile* — income and education statistics
- Pew Research, *Indian Americans: A Survey Data Snapshot* (Aug 2024) and *Second-Generation Americans* — generational breakdown (conflicting figures noted above)
- WorldAtlas, USINPAC, Pew Research — US metro-area concentration of Indian-Americans
- 2021 Australian Census (ABS) — city-level Hindu population distribution
- TechCrunch (Jun 2025) — Sri Mandir diaspora ARPU, cross-referenced against PRD's target ARPU

---

## 3. Market Sizing (TAM/SAM/SOM) — FROZEN

**TAM — Total Addressable Market: ~4.7M–5.3M people**
Hindu + Jain diaspora across the three markets this product has ever contemplated (US, UK, Australia; Canada excluded per the PRD's own scope, pending a separate Sikh-inclusive product decision):
- US Hindu: 2.65M–3.6M (midpoint ~3.1M)
- UK Hindu: ~800,000
- Australia Hindu: 684,002
- Jain, mostly US: 80,000–200,000 (midpoint ~140,000)
- Midpoint total: **~4.72M** — notably, this lands almost exactly on the PRD's original "4.7M" figure. That number wasn't wrong; it was mislabeled. It's a reasonable three-market TAM, not a two-market launch population, which was the actual issue flagged in Section 1.

**SAM — Serviceable Available Market: ~2.7M–2.9M reachable adults**
Applying the v1 launch geography (US + Australia only, per the PRD's own Non-Goals — UK excluded until GDPR compliance work is done) and practical reachability filters:
- Population in launch markets (US Hindu + Australia Hindu + mostly-US Jain): ~3.9M
- Adult filter (~78%, excluding the ~22% under-18 cohort noted in Section 2): ~3.06M
- Smartphone penetration (~90–95%, estimated from general US/Australia smartphone ownership of ~91%+ skewed upward by this demographic's above-average income/education — not a diaspora-specific figure, flagged as an estimate): **~2.7M–2.9M**

**SOM — Serviceable Obtainable Market:**
- **Year 1 (hard, sourced):** the PRD's own target of 12,000–19,000 installs across US + Australia within 90 days of launch ≈ **0.4%–0.7% of SAM** — an appropriately conservative capture rate for a solo-founder launch leaning on temple/community partnerships and ASO rather than paid acquisition.
- **3-year stretch scenario (speculative, labeled as such):** extrapolating from typical early-stage vertical-app growth curves and Sri Mandir's own diaspora trajectory (0 to 700,000 registered diaspora users across six countries in ~5 years, currently compounding 15% quarter-over-quarter, though backed by $53M in funding vs. this product's solo-founder budget), a plausible 3-year installed base is **60,000–100,000 users (~2%–3.5% of SAM)**. This is a reasoned estimate, not sourced data — useful for context on ceiling, not a target to hold the product to.

**Evidence base:** builds on Section 1 and 2 population sources; adds general smartphone ownership statistics (Wikipedia/TechInsights/Pew: US ownership 91% in 2024) as a proxy for diaspora smartphone penetration; Sri Mandir growth trajectory (TechCrunch, Jun 2025) as the 3-year scenario's growth-curve reference point.

---

## 4. Competitive Analysis — FROZEN

| Competitor | Model | Scale (verified) | Funding | Diaspora posture | Key confirmed weakness |
|---|---|---|---|---|---|
| **Drik Panchang** | Freemium: ad-supported, ₹19/mo or ₹199/yr to remove ads | 1M+ downloads, 4.6★ (203K reviews) — Google Play, verified directly | Appears bootstrapped; small Bengaluru-based developer (Adarsh Mobile Applications LLP), not VC-backed | None — global product, no localization for diaspora | India-timezone default, no iOS location override, ads roughly every 2 taps, timezone-specific crash bugs |
| **mPanchang** | Similar freemium/astrology model | Self-described "#1 Panchang app"; independent download/rating figures not available | Unknown | None identified | Same category weaknesses as Drik Panchang (not independently re-verified beyond earlier review evidence) |
| **Sri Mandir** | Freemium + temple booking, e-darshan, e-commerce, subscription | 40M lifetime downloads, 3.5M MAU (90K/2.6% diaspora, but 700K diaspora *registered* users, +15% QoQ) | $53M raised total; $20M Series C, June 2025 | Small current share, but fastest-growing and highest-value segment (diaspora ARPU ~$81/yr vs. ~$7–9/yr in India) — the most credible near-term competitive threat given capital and momentum | Transactional/e-commerce core, not daily-habit-oriented; diaspora still a small fraction of total base today |
| **VAMA** | Astrology consultations + puja/chadhava booking + prasad delivery + VAMA TV content | 100K+ Android downloads (2021 launch); company claims ~2M "devotees" (unverified, likely cumulative/India-wide) | ~$900K total ($150K pre-seed 2021, $750K seed 2022) | India-focused; no diaspora push identified in available sources | Astrology/transaction-led, not daily-guidance-oriented; funding is an order of magnitude below Sri Mandir |
| **DevDham** | Live-streamed puja, temple donations, digital darshan for 5,000+ temples | 730K downloads, 47 employees | $1.59M total (seed round, Jan 2024) | India-focused | Temple/live-event model, not daily habit; no diaspora localization identified |

**Synthesis:** No competitor in this set combines (a) accurate, location-personalized daily Panchang, (b) a daily habit/streak loop, and (c) AI-assisted guidance, for a diaspora audience specifically. That part of the PRD's differentiation thesis holds up under scrutiny. But the competitive set splits cleanly into two tiers that matter for timing: three India-focused, transaction-led platforms (VAMA, DevDham, and to a lesser extent Sri Mandir) with meaningful funding but no diaspora-specific product, and two accuracy-focused calendar apps (Drik Panchang, mPanchang) with real scale (1M+ downloads) but no habit mechanics, AI, or localization. Sri Mandir is the one name in this set with both capital and explicit diaspora growth momentum (carried forward from Section 1) — it is the most watchable competitor for this product's timing risk, not because it currently competes head-on, but because it is the only player positioned to pivot into this exact gap quickly if diaspora traction proves lucrative enough (which its own ARPU data suggests it might).

**Evidence base:** Google Play listing for Drik Panchang (downloads, rating, business model, developer identity — verified directly); Tracxn, Crunchbase, Inc42, CB Insights, YourStory — VAMA and DevDham funding, downloads, employee counts; TechCrunch, Inc42, YourStory (Jun 2025) — Sri Mandir funding, MAU, diaspora metrics (carried from Section 1).

---

## 5. User Personas — FROZEN

Built directly on the evidence in Sections 1–4, not invented independently of it.

**Persona 1 — "Priya," the Household Anchor (primary)**
First-generation immigrant, late 20s–50s, living in a diaspora-dense metro (Bay Area, NY, Chicago, Dallas, Sydney, Melbourne). College-educated, household income near or above the ~$126K diaspora median. Identifies strongly as Hindu but, per Carnegie/Pew survey data, is more likely to consider religion personally important than to practice daily — she wants to close that gap but has limited time and no reliable localized tool. She currently either manually adjusts an India-timezone Panchang app or relies on family members for festival timing. She is the household's decision-maker for setting up a shared profile and the one most likely to pay for a subscription — she is the primary revenue driver, consistent with the ARPU data in Section 2.

**Persona 2 — Jain diaspora user (secondary)**
Demographically similar to Priya — same income/education/geography — but a much smaller population (80K–200K in the US per Section 1) with a specific, non-negotiable requirement: Jain content must be clearly and separately branded from Hindu content, not a reskinned version of it. Trust is fragile here — this persona will disengage quickly if Paryushan/Samvatsari dates or fasting rules are wrong, which is why the PRD's plan for a paid freelance Jain-content reviewer (not just cross-referencing published sources) is a correctly-scoped mitigation, not over-engineering, given how small and tight-knit this community is.

**Persona 3 — Second-generation adult child (secondary-but-significant)**
Born or raised in the US/Australia, English-first, invited into the app via a parent's household profile rather than discovering it independently. Per Section 2, this group's size is contested (9%–34% depending on methodology) but is directionally large and growing as the under-18 cohort (22% of the population) ages up. This persona has weaker ritual fluency and is the intended audience for "Ask Guru" and the quick-vs-deep-dive content toggle — but is also the persona most likely to churn if content assumes first-generation cultural context. Retention risk, not just acquisition upside.

**What's deliberately not a persona:** a competitor-switcher (e.g., an existing Sri Mandir user). Section 4 found diaspora is currently a small share of Sri Mandir's base, so early growth is much more likely to come from non-users of any devotional app (Priya using generic search/family instead) than from converting an existing paying Sri Mandir customer. GTM messaging should target the former, not position against the latter.

**Evidence base:** synthesized from Sections 1–4 (Pew/Carnegie survey data, Section 1; income/education/geography, Section 2; competitive posture, Section 4); no new sources introduced.

---

## 6. Top Pain Points — FROZEN

Ranked by evidence strength, not by how confidently the PRD asserted them — several PRD claims turned out to have solid backing, and a couple are weaker than the PRD's confident language implied.

**Strong evidence (direct, independently verified):**
1. **India-timezone/location defaults in existing calendar apps.** Confirmed directly via app store reviews: no iOS location override on Drik Panchang (defaults to New Delhi), a reported crash bug specifically on the America/Los_Angeles timezone.
2. **Ad intrusiveness.** Confirmed directly: ads roughly every 2 taps on the category leaders, with a paid ad-removal tier already existing (₹199/yr) — proof users already pay to escape this, which is itself a useful signal for willingness to pay.
3. **The belief-practice gap.** Confirmed by independent survey data (Carnegie 2020, Pew): diaspora Hindus report religion is personally important at much higher rates than they report daily prayer or weekly service attendance.

**Medium evidence (corroborated but not directly surveyed for this product):**
4. **Fragmented, low-trust guidance sources.** The PRD asserts diaspora users fall back on "family or generic search" as fact. Direct consumer-survey evidence of this specific behavior wasn't found, but it's corroborated indirectly: the Hindu American Foundation has published its own dedicated "Puja at Home" practical guide specifically for Hindu Americans — an outside organization recognizing and trying to fill this exact gap with a static, non-personalized resource. Treat as a real but not precisely-quantified pain point.
5. **Second-generation ritual knowledge gap.** Supported by generational population data (Section 2) and qualitative literature on second-gen identity shift (more likely to identify as "South Asian American" than "Indian," adapting rather than replicating parental practice), but there's no direct survey asking this cohort to rate their own ritual fluency.

**Weaker evidence (plausible, inferred, flagged as assumptions to validate post-launch rather than settled facts):**
6. **Jain content conflation risk** (Jain users disengaging if content isn't clearly separated from Hindu content) — inferred from population size and community tightness, not from specific documented complaints.
7. **App instability/crash bugs** — only one specific review surfaced (Drik Panchang iOS detail-view crash); not confirmed as a widespread pattern across the category.

**Implication for the PRD:** items 1–3 are safe to build against with confidence. Items 4–5 justify the features they're already tied to (AI guidance, simplified onboarding) but should be validated with real user interviews or a beta cohort before assuming they're as acute as assumed. Items 6–7 are worth a lightweight validation step (e.g., a short survey to the Jain beta reviewer, and basic crash monitoring at launch) rather than being treated as proven.

**Evidence base:** App Store/Google Play reviews (Drik Panchang, mPanchang — carried from Sections 1 and 4); Carnegie 2020 Indian American Attitudes Survey and Pew Research (carried from Section 1); Hindu American Foundation, *Pūjā at Home* guide (new).

---

## 7. Existing Alternatives — FROZEN

Beyond the direct-competitor apps in Section 4, diaspora users have several lower-friction substitutes already in use. Ranked by evidence strength:

**Confirmed with a specific, named example:**
- **Temple WhatsApp/community broadcast groups.** Real and verifiable — e.g., the Hindu Temple of Greater Cincinnati runs a dedicated WhatsApp group posting reminders for ekadashis, purnimas, and amavasyas to help members "maintain a consistent sadhana routine." This is a genuine, low-friction alternative: free, socially embedded, and already doing part of what PanchangPal's notification system does. Its weakness is exactly where PanchangPal can win: it's not personalized to the individual's location or tradition, not habit-forming beyond a passive notification, and entirely dependent on being in the right group for the right temple/region.

**Confirmed to exist, with an important caveat that softens the PRD's "no one localizes" claim:**
- **Browser-based Panchang websites**, as distinct from their native apps. mypanchang.com serves location-adjustable Panchang for specific cities (confirmed showing a US city in search results), and Drik Panchang's own website has a settings page allowing location changes that its iOS app reportedly lacks. This means some localization already exists — just not in a habit-forming, notification-driven, native mobile experience. The gap isn't "no one has ever localized a Panchang," it's "no one has packaged localization into a sticky mobile habit loop." Worth being precise about this distinction rather than repeating the PRD's stronger claim unmodified.

**Plausible but not independently verified for this specific audience:**
- **Family/parental oral knowledge**, the traditional primary source, breaking down for second-generation users per Section 6's evidence on generational identity shift.
- **Generic web search and YouTube "how to" videos** for specific rituals — consistent with general consumer behavior patterns but no diaspora-specific source found confirming this as the dominant fallback.
- **Phone calls to family or a pandit in India** for guidance — commonly cited anecdotally in diaspora community writing, but no independent source quantifies this.
- **Printed Panchang calendars** distributed via temples — plausible as a legacy channel, but no evidence found of continued significance for diaspora specifically (versus India, where this remains common).

**Implication:** PanchangPal isn't entering a vacuum — it's competing with free, socially-embedded, low-friction habits (a WhatsApp group, a bookmarked website) as much as with paid apps. The differentiation isn't "the first to localize" but "the first to make localized guidance a personalized, habit-forming, native experience" — a more precise and more defensible claim than the PRD's original framing.

**Evidence base:** Hindu Temple of Greater Cincinnati WhatsApp group listing (new); mypanchang.com and drikpanchang.com website/settings pages (new); generational identity literature (carried from Section 2/6).

---

## 8. Market Gaps — FROZEN

Synthesized from Sections 4, 6, and 7 — no new research, no gap listed here without a specific section it traces back to.

1. **No mobile-native, habit-forming, localized daily Panchang for diaspora exists today** (Sections 4, 7). Localization exists in fragments — a website setting here, a WhatsApp reminder there — but nothing packages it into the sticky, personalized, notification-driven mobile habit loop the PRD is proposing.
2. **No competitor offers AI-assisted, scoped ritual/festival guidance** (Section 4). This is the cleanest, least-contested gap in the whole analysis — none of the five competitors reviewed have anything resembling "Ask Guru."
3. **No product treats the Jain diaspora as a first-class, distinctly-branded audience** (Sections 4, 5). Every competitor reviewed is Hindu- or astrology-focused; Jain users are either ignored or folded indiscriminately into Hindu content elsewhere.
4. **No product bridges the family-knowledge-to-second-generation gap directly** (Sections 5, 6) — existing alternatives (family, WhatsApp groups, generic search) assume either a knowledgeable family member is present or the user already knows what to search for. Second-generation users with lower ritual fluency are underserved by all of them.
5. **The gap has a shelf life, not an indefinite one** (carried from Sections 1, 4). Sri Mandir is capitalized and already growing fastest in exactly this segment. This isn't a market gap that will sit open indefinitely — it's a gap a funded competitor is positioned to close if diaspora ARPU data (which they already have, and PanchangPal doesn't yet) convinces them it's worth prioritizing.
6. **A real monetization gap sits alongside the product gap: the cheapest alternatives are already free.** A temple WhatsApp group costs nothing and is already trusted (Section 7). Any paid tier has to clearly justify its cost against a free, socially-embedded substitute — this is a market gap in the sense that no one has proven diaspora users will pay for *daily* guidance specifically (as opposed to festival/temple *transactions*, which Sri Mandir has proven they'll pay for). This distinction matters directly for Section 10.

**Evidence base:** none new — pure synthesis of Sections 4, 6, and 7.

---

## 9. Differentiation Strategy — FROZEN

**Four differentiation vectors, each tied directly to a Section 8 gap:**
1. **Localized-by-default, native mobile habit loop** (vs. gap #1) — location-aware Panchang plus streaks/notifications packaged as one product, not assembled from a website setting and a WhatsApp group.
2. **Scoped AI guidance** (vs. gap #2) — "Ask Guru," with explicit refusal behavior outside ritual/festival topics, is the cleanest differentiator with zero direct competitor overlap found in Section 4.
3. **Jain as a first-class, distinctly-branded module** (vs. gap #3) — a real differentiator specifically because it's small and unglamorous enough that better-funded, India-focused competitors have no commercial reason to build it well.
4. **A designed bridge for second-generation users** (vs. gap #4) — the quick/deep-dive content toggle and non-judgmental tone, aimed at a segment every existing alternative implicitly assumes already has the knowledge it's trying to provide.

**Honest defensibility assessment — this matters more than the feature list.** None of vectors 1, 2, or 4 are structurally hard to copy. Sri Mandir has the capital, the diaspora growth data, and (per Section 4) the existing diaspora user base to build a competing habit loop and an "Ask [X]" AI feature within a few quarters if their own ARPU numbers convince them to prioritize it — which Section 1's growth data suggests is plausible. Feature parity is a matter of engineering time for a $53M-funded competitor, not a moat.

What's harder to copy quickly: vector 3 (Jain trust, built through a paid community-affiliated reviewer and tight, distinct branding, per the PRD's own plan) and the household network effect the PRD's shared-profile design creates — once a family sets up a shared calendar and streak, switching cost rises for reasons that have nothing to do with feature comparison. **The real strategic recommendation this MRD adds to the PRD: treat speed-to-market and community/temple trust relationships as the actual moat-building activities, not the AI or habit features themselves.** Those features earn the first download; trust and switching cost are what keep the user past the point a funded competitor could otherwise out-build the same feature set.

**Evidence base:** none new — synthesis of Sections 4 and 8, with the defensibility judgment being this MRD's own analysis rather than a sourced claim.

---

## 10. Revenue Opportunities — FROZEN

**Subscription (the PRD's primary plan, sequenced post-retention):**
The PRD's $60–90/year ARPU target and 3–5% conversion-within-6-months are better supported than the PRD itself claims — they weren't cross-validated against anything when written. Sri Mandir's actual diaspora ARPU (~$81/year, Section 1) lands almost exactly inside this range, and the broader spiritual wellness app category independently confirms paid/subscription as the dominant model (62.9% revenue share from paid/IAP in 2024, per category market research). Two independent data points converging on the same range is a real validation, not a coincidence to ignore. Recommendation: keep $60–90/year as the target band; treat the low end ($60) as the more defensible planning assumption given PanchangPal launches with no brand trust or diaspora track record, unlike Sri Mandir.

**Ad-supported bridge revenue (new option, added per your direction):**
Every competitor reviewed in Section 4 — including the two most directly comparable, Drik Panchang and mPanchang — monetizes at least partly through ads, and Drik Panchang's own ₹199/year (~$2.40) ad-removal tier proves users will pay something to avoid ads, even a small amount. An ad-supported free tier for PanchangPal could plausibly generate low-single-digit dollars of ARPU per year from non-subscribers (typical for niche-content mobile apps; not independently sourced for this category specifically, so treat as directional, not a committed figure) — not enough to be a primary revenue strategy, but potentially enough to offset part of the "Ask Guru" LLM API cost (an open cost question the PRD itself flags) during the pre-subscription period. The tension to manage: the PRD's whole competitive pitch in Section 1 is "less ad-laden than the incumbents" — running ads risks undercutting the exact differentiation this MRD validated in Section 9. If pursued, recommend a light touch (e.g., no ads within the daily ritual flow itself) so the ad tier doesn't contradict the product's core value proposition.

**What's still open, by design:** budget/runway was not provided and remains an open input, same as the PRD itself flags — the break-even timing and how long the product can run pre-subscription-revenue can't be modeled without it. This is carried forward as an explicit open item into Section 11 rather than assumed.

**Evidence base:** Sri Mandir ARPU (carried from Section 1); Drik Panchang ad-removal pricing (carried from Section 4); Grand View Research / Towards Healthcare, spiritual wellness app category revenue mix (new, Jul 2026 search).

---

## 11. Go/No-Go Recommendation — FROZEN

**Recommendation: Conditional GO.**

**What's genuinely validated, not assumed:**
- The problem is real: an independently-sourced belief-practice gap (Section 1), confirmed app-level pain points (Sections 1, 6), and a documented outside organization (Hindu American Foundation) already trying to fill part of the gap with an inferior, static solution (Section 7).
- The market is real but modest, and sized honestly rather than optimistically: SAM ~2.7–2.9M reachable adults, with the PRD's own Year-1 target representing a conservative 0.4–0.7% capture (Section 3) — a reasonable ask for a solo-founder, partnership-led GTM.
- Pricing is cross-validated from two independent sources converging on the same range (Sri Mandir's actual diaspora ARPU and the broader spiritual-wellness category's subscription dominance, Section 10) — not just an internal PRD assumption.
- A genuine, currently-unclaimed feature gap exists (Section 8): no competitor combines localization, habit mechanics, AI guidance, and Jain-specific support.

**What the recommendation is conditional on:**
1. **Speed, not just feature completeness.** Section 9's honest defensibility assessment stands: the feature-level differentiation is copyable by Sri Mandir within a few quarters given their capital and diaspora growth data. This isn't a gap that stays open indefinitely. The 8-week build timeline is aggressive for the right reason — treat any slippage past the target launch window as a direct erosion of the competitive window, not just a schedule miss.
2. **Runway must cover the pre-revenue period.** Budget/runway remains an open, unprovided input (Section 10) — this recommendation cannot fully account for execution risk without it. Before committing to the 8-week build, confirm there's enough runway to reach and evaluate the 90-day install target and initial retention data (Section 1's D7/D30 goals) before any subscription revenue materializes, since monetization is explicitly sequenced after retention proof.
3. **Reconsider Jain module sequencing, not necessarily its existence.** The Jain population (80K–200K, Section 1) is small relative to the build effort a dedicated module requires (Section 4's PRD sub-tasks: separate dataset, distinct branding, paid reviewer). The differentiation case for it is real (Section 9 — an underserved niche competitors have no reason to build well) but so is the opportunity cost against a tight solo-founder timeline. Worth an explicit go/no-go of its own: ship as planned if it's genuinely low incremental cost as the PRD's Goal 5 hopes to validate, but don't let it silently consume time that could go toward the core Hindu-audience habit loop if it turns out not to be low-cost in practice.
4. **Resource temple/community trust-building as its own workstream**, not as a side effect of shipping features. Section 9 identified this — not the AI or habit features — as the actual moat. A feature-complete app with no temple partnerships secured by launch has weaker defensibility than this MRD's analysis assumes.

**What would change this to a No-Go:** if runway can't cover roughly 6 months to first subscription revenue (per the PRD's own conversion timeline), or if Sri Mandir or a comparable funded competitor visibly ships a diaspora-localized habit feature before PanchangPal's Aug 29 target launch — at that point the core differentiation thesis in Section 9 would need to be revisited before proceeding.

**Evidence base:** synthesis of all prior sections; the runway-dependency and Jain-sequencing conditions are this MRD's own judgment calls, flagged as such rather than presented as sourced findings.

---

## Document status

All 11 sections frozen. This MRD should be read alongside `PanchangPal-v1-PRD.md` — it validates and, in several places, corrects or sharpens the market assumptions that PRD was built on (see Sections 1, 3, 4, 8, and 9 in particular for the most consequential corrections).
