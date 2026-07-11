# PanchangPal — Product Design Document (PDD) / UX Specification (UXS)

**Version:** 1.2 (Working Draft — governance framework added)
**Status:** Part 1 of 5 — for sign-off
**v1.1 changes:** Added cross-cutting registries (analytics taxonomy, error codes, performance budgets, design-token references), per-flow engineering annexes (success metrics, friction analysis, backend & AI dependencies, accessibility checklists), an explicit Out-of-Scope section, and the mandatory Global Screen Documentation Template for Part 2. No product scope, business rules, or functional requirements were changed. Structure, terminology, existing UX Improvements, Assumptions, and the UX Change Log are preserved.
**v1.2 changes (additive → MINOR bump):** Inserted **§3.0A — Global Engineering & Documentation Governance Framework** (source-of-truth hierarchy, traceability, naming conventions, versioning, ownership/approval, cross-document consistency rules, AI coding-agent guidelines, and design/performance/accessibility/analytics governance, plus the engineering-readiness checklist and change-management schema). No existing content was modified, renumbered, or rewritten; scope, flows, navigation, business rules, and UX decisions are unchanged.
**Owner:** Product Design
**Last updated:** 2026-07-05
**Source of truth:** `PanchangPal-PRD-v2.md`, `PanchangPal-MRD-v2.md`
**Target build:** React Native (Expo), iOS + Android, v1 launch — US + Australia + New Zealand

---

## How to read this document

This is the single source of truth for Product Design, UI, UX, the Design System, React Native development, backend contract expectations, QA, Analytics, and AI coding agents (Claude Code, Cursor, Codex). It is written to be **implementation-ready**: a frontend engineer or an AI coding agent should be able to build from it without inventing UX decisions.

**Authority & change-control rule.** The **PRD (`PanchangPal-PRD-v2.md`) is the authoritative product requirements document.** This UXS may improve **UX patterns, navigation, interaction design, onboarding, accessibility, information architecture, and microinteractions** wherever a demonstrably better user experience exists. It must **not** silently change **product scope, business rules, or functional requirements** — those remain the PRD's to own. Any change to scope/rules/functional requirements is out of bounds here and must be raised back to the PRD.

Three callout conventions are used throughout:

- **`[ASSUMPTION]`** — a decision made where the PRD/MRD is silent or ambiguous. Treat as a decision, not a suggestion. If a stakeholder disagrees, change it here first.
- **`UX Improvement`** — a deliberate enhancement to a *UX pattern* (nav, interaction, onboarding, IA, a11y, microinteraction) relative to what the PRD implies. Every one is (1) marked inline at the point of use and (2) recorded in the **UX Change Log** at the end of the Part with its original requirement, proposed change, rationale, expected user impact, implementation effort, and whether the PRD should be updated.
- Scope/business-rule/functional-requirement changes are **not** made here. Where this doc surfaces a functional gap or a rule that seems wrong, it is flagged as **`[PRD FOLLOW-UP]`** for the PRD owner to resolve — never changed unilaterally.

Every Part ends with a **UX Change Log** (the running log described above) plus an **Assumptions** table.

### The five parts

| Part | Sections | Contents |
|---|---|---|
| **Part 1 (this doc)** | 1–3 | Product Design Philosophy · Information Architecture · Complete User Flows |
| Part 2 | 4 | Screen Inventory (largest section) |
| Part 3 | 5–6 | Component Library · Design System |
| Part 4 | 7–9 | Microinteractions · Notifications · AI Experience |
| Part 5 | 10–15 | Accessibility · Analytics · Edge Cases · UX Copy · Usability Review · Implementation Checklist |

---

# SECTION 1 — Product Design Philosophy

## 1.1 Vision

> **Make it effortless for every Hindu family living abroad to preserve and practice their traditions every day.**

PanchangPal exists to close the **belief–practice gap** documented in the MRD: most diaspora Hindus consider their religion personally important, yet only a minority (~40%) pray daily. The distance between "this matters to me" and "I did it today" is not a motivation problem — it is a **friction, time-zone, and confidence problem**. First-generation professionals abroad are time-poor, cut off from the ambient cultural infrastructure (temple down the road, elders in the house, the printed panchang on the wall) that made daily practice automatic back home, and unsure of the *correct* details when they try to do it alone.

The product's job is to be the calm, trustworthy, low-effort surface that makes the right thing to do today obvious and doable in under two minutes — and to make a family feel they are keeping their tradition alive together, across time zones and generations.

## 1.2 Mission

For the v1 design target — **Priya, the first-generation household anchor** — PanchangPal:

1. Tells her **what today is** (tithi, festival, muhurta) already corrected for *her* location and time zone, with zero manual adjustment.
2. Gives her a **small, guided, completable ritual** she can actually do in the time she has.
3. Answers her **"is this right?" questions** with grounded, trustworthy guidance (RAG-scoped Ask Guru), never a confident guess.
4. Helps her **never miss the dates that matter** — festivals, vrats, and personal/family observances (shraddha).
5. Lets her **bring her household along** without lecturing anyone — content scoped to each member's role and depth preference.

The Jobs-to-be-Done (MRD §17) are the north star for every screen:

- **Functional:** "Tell me today's correct tithi/muhurta/festival without me doing time-zone math."
- **Emotional:** "Help me feel I'm keeping my family's tradition, even though I don't have time to do it the way my parents did."
- **Social:** "Help me pass this to my kids without lecturing them or making them feel guilty."

## 1.3 Design Principles

These are the seven principles every screen, component, and interaction is measured against. When two principles conflict, they are ranked in this order.

### P1 — Calm over complete
The reference apps are **Calm, Headspace, and Duolingo — not a traditional religious utility app** (PRD, General Design Principles). Every screen shows the *one* thing that matters now and defers the rest. We never win by cramming more panchang data onto a screen than a leading Panchang website does; we win by showing *less, correctly, beautifully*. Density is the competitor's weakness (MRD §7: ad-heavy, cluttered incumbents), not something to match.

### P2 — Trust is the product, not a feature
The MRD is explicit: the real, hard-to-copy moat is **trust and household relationships**, not the AI or habit features (MRD §10). A single wrong tithi, a hallucinated ritual detail, or a culturally clumsy moment costs disproportionate trust (Risk Register §1, §3, §10). Therefore: accuracy is visible, sources are cited, the AI says "I don't know" rather than guessing, and nothing about the product feels like it's selling to the user in a sacred moment.

### P3 — Effort is the enemy
The user has ~2 minutes and a belief–practice gap driven by friction. Reduce taps, defer decisions, remember preferences, pre-fill from location, and never ask twice. Every required action must earn its place. Permissions are requested *after* value is shown, one at a time (PRD onboarding revisions).

### P4 — Habit before monetization
No paywall, upsell, or subscription friction touches the core daily loop in v1. Monetization is sequenced *after* retention is proven (PRD; MRD §18). The design must make the daily loop so effortless and rewarding that the habit forms first. The North Star is **Weekly Household Ritual Completions** (MRD §14) — the design optimizes for completed rituals, not screen time.

### P5 — Family is a first-class unit
The account model is **household-based, not individual** (PRD P0 #6). Content depth is **role-aware** — a grandparent, a busy parent, and a curious teenager in one household each see appropriately-scoped content. The social job ("pass it on without lecturing") means the design never shames a low-engagement member and always frames family participation as invitation, never obligation.

### P6 — Regional truth, not a generic "Hindu" default
A generic ritual script or festival calendar alienates regionally diverse households (Risk Register §6). v1 regionalizes the **top 2–3 traditions** (e.g., Bengali Panjika, Tamil Panchangam) for calendar, festival naming, and ritual scripts. The design must surface the user's tradition as a visible, changeable choice — never a silent assumption — and gracefully fall back to a generic variant where a regional one doesn't differ.

### P7 — Accessible and emotionally warm for a wide age range
The household spans a wide age range and tech-comfort range, including elderly diaspora users (MRD §9, underserved audiences). WCAG 2.1 AA is a floor, not a goal. Large text, high contrast, VoiceOver/TalkBack, reduced motion, and generous touch targets are designed in from the start, not retrofitted.

## 1.4 Behavioral Psychology Principles

The habit-formation strategy is grounded in established behavioral models, applied ethically (the streak/guilt mechanic is explicitly flagged in the Assumption Register §13 as needing A/B validation of its *tone*).

### Fogg Behavior Model (B = MAT: Motivation, Ability, Trigger)
- **Motivation** is already high (identity is strong — MRD §1). We do **not** manufacture motivation with guilt; we remove the reasons a motivated person still doesn't act.
- **Ability** is the lever we pull hardest (Principle P3). Make the daily ritual a 30-second, one-tap-to-start action.
- **Trigger** is the daily morning notification, timed to the user's chosen ritual window and location sunrise, not a generic 9am blast.

### Hook Model (Trigger → Action → Variable Reward → Investment)
- **Trigger:** external (morning push) → becomes internal (the user opens the app as part of their morning) over ~2–3 weeks.
- **Action:** open → see today's panchang → tap "Begin" on the ritual/checklist.
- **Variable reward:** the **rotating daily content element** (a quote, festival fact, or "on this day") prevents habituation boredom from an otherwise-identical daily screen (PRD onboarding/daily-loop revision). This is the deliberate variability that keeps the loop fresh.
- **Investment:** completing a ritual advances the streak, contributes to the household's Weekly Household Ritual Completions, and (over time) personalizes content — each small investment makes the next return more valuable.

### Loss aversion — handled ethically
Streaks leverage loss aversion, which is powerful but can drive **churn instead of retention** if a single miss zeroes weeks of effort (Risk Register §5). Mitigations, built into the design:
- **Grace days** (PRD P0 #5): one grace day per rolling 7-day period; a single miss does not reset the streak.
- **Supportive, not loss-framed copy**: "Pick back up today" — never "You lost your 42-day streak." (PRD AC for grace days.)
- **`UX Improvement`:** Streak is presented as a *gentle companion metric*, never the largest element on any screen. Completion of today's ritual is always the hero; the streak is reinforcement, not the goal. Rationale: over-weighting the streak turns a spiritual practice into a scorekeeping chore, contradicting Principle P1 and the emotional JTBD.

### Fresh-start effect & implementation intentions
- Onboarding invites the user to **choose their daily ritual time** ("When would you like your daily moment?") — an implementation intention ("I will do X at time Y in place Z") that dramatically increases follow-through.
- Festival days and the start of a new month/season are surfaced as natural **fresh-start moments** to re-engage lapsed users (ties to the win-back flow, §3).

### Social proof & commitment (household)
- Seeing that a family member completed today's ritual is gentle, positive social proof — **never** a comparison leaderboard (would violate P5 and the social JTBD).
- The household invite is a **commitment device**: inviting family publicly commits the anchor to the practice.

## 1.5 Habit Formation Strategy

The **core daily loop** is the spine of the entire product. Everything else is in service of it.

```
   MORNING TRIGGER
   (personalized push, location-aware sunrise + chosen ritual window)
            │
            ▼
   OPEN → TODAY (Home)
   • Today's panchang (corrected for location) = the "why it's worth opening"
   • Rotating daily element (quote / festival fact) = variable reward
   • Today's ritual + checklist = the action
            │
            ▼
   BEGIN RITUAL (guided flow, text + audio, regionalized)
   • 30 sec – 2 min, completable
            │
            ▼
   COMPLETE → reward moment
   • Calm completion animation (P1) + haptic
   • Streak advances (with grace-day safety net)
   • Contributes to Weekly Household Ritual Completions (North Star)
            │
            ▼
   OPTIONAL DEEPENING
   • Ask Guru a question · read the festival detail · invite family
            │
            ▼
   INVESTMENT stored → tomorrow's loop is warmer
```

**Design commitments that protect the loop:**

1. **Time-to-value < 10 seconds** on open: today's corrected panchang and today's ritual are visible without scrolling, no auth wall on the daily view for a returning user.
2. **The loop is completable offline** for its core (today's panchang and ritual are cached; see Offline flow §3). Nothing about not having signal should break the habit.
3. **One clear next action** per screen state (P1). The daily screen always answers "what do I do now?" with a single primary CTA.
4. **Never punish, always invite.** Missed days are met with grace-day copy and a warm re-entry, never a guilt wall.
5. **Activation event is explicit** (MRD §14, PRD Success Metrics): household setup + first panchang view + notifications enabled, within the first session. The onboarding flow (§3) is engineered to reach this milestone with the least possible friction.

## 1.6 Emotional Design Principles

Following Norman's three levels of emotional design:

- **Visceral (first impression):** the app should feel *calm, warm, and reverent* the instant it opens — soft, natural palette (dawn/temple tones, not neon), generous whitespace, gentle motion. It should feel closer to a meditation app than a utility. (Design System details in Part 3.)
- **Behavioral (in-use):** every interaction is smooth, forgiving, and predictable. Guided rituals feel like being gently accompanied, not instructed. The AI feels like a knowledgeable, humble family friend, not a chatbot.
- **Reflective (after-use & identity):** completing a ritual should leave the user feeling *"I'm the kind of person who keeps this alive for my family."* Completion moments, the household's shared progress, and passing rituals to children all reinforce a positive self-narrative tied to the emotional and social JTBD.

**Emotional design rules:**
- **Reverence without heaviness.** Sacred, but light. We celebrate quietly (a soft glow, a gentle chime the user can mute), never with confetti-app gamification that would cheapen the moment.
- **Warmth in words.** Copy is encouraging, humble, and family-oriented (see Part 5, UX Copy). Never corporate, never preachy.
- **Grief-aware.** Shraddha/death-anniversary tracking touches loss. Those surfaces use a distinctly gentler, quieter treatment (muted palette, no streak/gamification overlay, no upbeat animation). **[ASSUMPTION]** Personal-date reminders default to a calm, respectful notification tone and never carry promotional or streak content.

## 1.7 Trust Principles

Trust is the moat (P2). Concretely, the design guarantees:

1. **Visible accuracy.** Today's panchang shows the location and time zone it was computed for ("Panchang for Sydney, AEST") so the user can confirm it's *their* sky, not India's. **`UX Improvement`:** Add a subtle "How we calculate this" affordance linking to a plain-language accuracy note — turning our accuracy investment (cross-referencing + paid reviewers, Risk §1) into visible credibility.
2. **Grounded AI, honest limits.** Ask Guru is RAG-grounded in the app's reviewed content library and **must say "I don't have verified information on this"** rather than guess when retrieval confidence is low (PRD P0 #4 AC). Sources are shown. (Full spec in Part 4 §9.)
3. **No dark patterns.** No fake urgency, no disguised ads in the sacred flow, no manipulative subscription tricks. The MRD positions us as *less* ad-laden than incumbents (MRD §7) — the design must honor that even if an ad-supported tier is later explored.
4. **Data dignity.** Clear, plain-language permission requests explaining *why* (location → correct panchang; notifications → your daily reminder). CCPA-baseline privacy (PRD P0 #9). A visible, easy path to export/delete data (Delete Account flow, §3).
5. **Cultural safety.** Regional/tradition choices are respected and visible (P6). No feature judges a user's home altar or practice (the PRD explicitly names Vision AI a non-goal for exactly this reason). Apolitical throughout (Risk §10).
6. **Human-reviewed content.** Where content has been vetted by paid pandit/Jain reviewers, that provenance can be surfaced as a trust signal.

## 1.8 Accessibility Principles

Accessibility is a **Principle (P7)**, not a compliance afterthought. Full spec in Part 5 §10; the governing commitments:

- **WCAG 2.1 AA minimum**, targeting AAA for text contrast in the core daily loop where feasible.
- **Dynamic Type / font scaling** supported up to the OS maximum without layout breakage; no fixed-height text containers.
- **Screen readers first-class:** every interactive element has a meaningful VoiceOver/TalkBack label; ritual audio and screen-reader audio never collide (audio focus management).
- **Reduced Motion** honored: all decorative/celebration animations degrade to a calm cross-fade.
- **Touch targets ≥ 44×44pt (iOS) / 48×48dp (Android)**, generously spaced — important for elderly users (MRD §9).
- **Color is never the only signal** (color-blind safe); icons + text labels always accompany color-coded states (e.g., auspicious/inauspicious muhurta).
- **Localization & RTL readiness** designed in from day one even though v1 UI ships in English (PRD P1 multi-language tied to real signup data). Layouts use start/end, not left/right.

---

# SECTION 2 — Information Architecture

## 2.1 IA principles

1. **Shallow and flat.** The daily loop must be reachable in one tap from anywhere. Primary navigation is a **3–4 item bottom tab bar** (PRD onboarding revision): guided rituals and the checklist are surfaced *from Home*, not as separate top-level tabs.
2. **Home is Today.** The default landing surface for a returning, onboarded user is **Today (Home)** — not a dashboard, not a feed. Time-to-value is measured from here.
3. **Progressive disclosure.** Depth (full panchang detail, festival explainers, deep-dive ritual content) lives one level below the calm summary. Nothing critical is more than 2 taps deep.
4. **Settings is a utility drawer, not a destination.** Configuration (tradition, ritual time, permissions, subscription, household management) is consolidated and reachable from Profile, keeping the tab bar sacred for the daily loop.

## 2.2 Primary navigation — bottom tab bar (4 tabs)

**`UX Improvement`:** The PRD's example IA lists Home, Today's Panchang, Prayer, Ask Guru, Calendar, Profile, Settings, Subscription, Household as sequential/peer nodes. That is a **feature list, not a navigation model** — surfacing all of them as top-level tabs would violate Principle P1 (Calm) and the PRD's own "3–4 tab items" instruction. We resolve this into **4 tabs**, with everything else nested:

```
┌───────────────────────────────────────────────────────────┐
│  BOTTOM TAB BAR (persistent, 4 items)                      │
├───────────────┬───────────────┬───────────────┬───────────┤
│   🏠 Today     │   📅 Calendar  │   🪔 Ask Guru  │  👤 You    │
│   (Home)      │               │   (AI)        │  (Profile) │
└───────────────┴───────────────┴───────────────┴───────────┘
```

- **Tab 1 — Today (Home):** the daily loop. Today's panchang, rotating daily element, today's ritual + checklist, festivals/vrats today, streak. Entry to the guided ritual flow.
- **Tab 2 — Calendar:** month/festival/vrat calendar (regionalized), personal/family dates (shraddha), festival detail. Add/edit personal dates.
- **Tab 3 — Ask Guru:** the RAG-grounded AI chat, suggested questions, conversation history.
- **Tab 4 — You (Profile):** household, streak history, achievements, settings entry, subscription entry, account.

**[ASSUMPTION]** Tab labels are "Today / Calendar / Ask Guru / You." Icon set uses a lit-diya motif for Ask Guru to signal warmth/guidance. Tab bar hides during the immersive guided-ritual and full-screen onboarding flows only.

## 2.3 Complete navigation hierarchy

```
PanchangPal
│
├── 0. SPLASH  (launch, ~1s, brand + warmth; silent auth/session check)
│
├── 1. ONBOARDING  (first launch only; no tab bar)
│    ├── 1.1 Welcome / Value intro (1–3 lightweight slides)
│    ├── 1.2 Location permission  → sets panchang accuracy
│    ├── 1.3 Tradition / region selection  (top 2–3 regionalized; skippable → generic)
│    ├── 1.4 Household setup  (name household; add members optional; role + depth)
│    ├── 1.5 Ritual time selection  (implementation intention)
│    ├── 1.6 First Panchang reveal  (VALUE MOMENT — shown before notif permission)
│    ├── 1.7 Notification permission  (deferred until after value; one screen)
│    └── 1.8 → Activation complete → Today (Home)
│
├── 2. AUTHENTICATION  (lightweight; can be deferred — see §2.4)
│    ├── 2.1 Continue with Apple
│    ├── 2.2 Continue with Google
│    ├── 2.3 Continue with Email (OTP / magic link)
│    ├── 2.4 Account recovery
│    └── 2.5 Sign out
│
├── TAB 1 — TODAY (HOME)
│    ├── 3.0 Today (Home) dashboard
│    │    ├── Today's Panchang summary card  → 3.1 Panchang detail
│    │    ├── Rotating daily element (quote / festival fact)
│    │    ├── Today's Ritual card  → 4.0 Guided Ritual flow
│    │    ├── Daily Checklist  → inline complete
│    │    ├── Today's Festival/Vrat (if any)  → 5.2 Festival detail
│    │    └── Streak indicator  → 6.0 Streak/achievements
│    ├── 3.1 Panchang Detail  (tithi, nakshatra, yoga, karana, sunrise/sunset, muhurta, Rahu Kaal)
│    └── 4.0 Guided Ritual Flow  (immersive; text + audio; regional variant)
│         ├── 4.1 Ritual intro / what & why
│         ├── 4.2 Step-by-step guided steps (audio narration, progress)
│         ├── 4.3 Ritual complete  → reward moment
│         └── 4.4 Deepen (optional): Ask Guru about this ritual / read more
│
├── TAB 2 — CALENDAR
│    ├── 5.0 Calendar (month view; festivals, vrats, personal dates)
│    ├── 5.1 Day detail (panchang for any selected day)
│    ├── 5.2 Festival / Vrat detail  (story, significance, how-to, regional variant)
│    ├── 5.3 Personal & Family Dates list  (shraddha / anniversaries)
│    │    ├── 5.3.1 Add personal date  (name, relation, tithi/Gregorian, reminder)
│    │    └── 5.3.2 Edit / delete personal date
│    └── 5.4 Regional tradition switcher (contextual)
│
├── TAB 3 — ASK GURU (AI)
│    ├── 7.0 Ask Guru home  (suggested questions, prompt starters, history entry)
│    ├── 7.1 Conversation  (streaming, grounded, sources, safety)
│    └── 7.2 Conversation history  (list; open past conversation)
│
├── TAB 4 — YOU (PROFILE)
│    ├── 8.0 Profile / You home  (household summary, streak, achievements)
│    ├── 8.1 Household
│    │    ├── 8.1.1 Household members (roles, depth preference)
│    │    ├── 8.1.2 Invite member  → Household Invitation flow
│    │    └── 8.1.3 Member detail / edit / remove
│    ├── 8.2 Achievements / Streak history
│    ├── 8.3 Subscription  (plan, upgrade, family plan — post-retention; v1 shows lightweight)
│    ├── 8.4 Settings
│    │    ├── 8.4.1 Account (email, sign-in methods, sign out)
│    │    ├── 8.4.2 Notifications (types, timing, quiet hours)
│    │    ├── 8.4.3 Location
│    │    ├── 8.4.4 Tradition / Region
│    │    ├── 8.4.5 Content depth (Quick ↔ Deep-dive; persistent per member)
│    │    ├── 8.4.6 Language (v1: English; scaffolded)
│    │    ├── 8.4.7 Appearance (Light / Dark / System; text size; reduced motion echoes OS)
│    │    ├── 8.4.8 Privacy & Data (export, delete account, CCPA)
│    │    ├── 8.4.9 About / Accuracy ("How we calculate this")
│    │    └── 8.4.10 Help & Support / Feedback
│    └── 8.5 Delete Account (confirmation flow)
│
└── SYSTEM / CROSS-CUTTING SURFACES
     ├── Global error / offline banner
     ├── Snackbars & toasts
     ├── Bottom sheets (permissions rationale, pickers, confirmations)
     ├── Deep-link router (notifications, referral, festival links)
     └── Paywall / upgrade sheet (contextual, post-retention; never blocks daily loop)
```

## 2.4 Navigation rules & path documentation

Every path a user can take between surfaces is enumerated here so no engineer has to infer routing.

### Entry points into the app
| Entry | Lands on | Condition |
|---|---|---|
| Cold launch, first ever | Splash → Onboarding 1.1 | No stored session/profile |
| Cold launch, returning & onboarded | Splash → Today (Home) | Valid session + completed onboarding |
| Cold launch, returning, session expired | Splash → Today (Home) in **read-only cached** state; silent re-auth in background; auth prompt only on a gated action | Expired token (see Expired Session flow §3) |
| Morning reminder push tap | Today (Home) | Deep link `panchangpal://today` |
| Festival reminder push tap | Festival detail 5.2 | Deep link `panchangpal://festival/{id}` |
| Streak reminder push tap | Today (Home), ritual focused | Deep link `panchangpal://today?focus=ritual` |
| Personal-date reminder push tap | Personal date detail 5.3 | Deep link `panchangpal://personal-date/{id}` |
| Household invite link | Invite accept 8.1.2 (or install → onboarding → auto-join) | Deep link `panchangpal://invite/{token}` |
| Referral link | Onboarding with referral context | Deep link `panchangpal://ref/{code}` |
| Ask-Guru notification / suggestion | Ask Guru 7.0 | Deep link `panchangpal://ask` |

### Auth placement decision
**`UX Improvement`: Defer authentication; do not gate onboarding behind a sign-in wall.** The PRD's example IA places Authentication immediately after Onboarding. Forcing account creation before the user has seen any value is the single biggest onboarding drop-off pattern in consumer apps and directly contradicts Principle P3 and the "value first" onboarding revision.

Recommended model:
- Onboarding runs on a **local/anonymous profile** (device-scoped) so the user reaches the **First Panchang reveal (value moment)** with zero sign-in friction.
- **Authentication is requested only when the user needs cross-device continuity or household features** — i.e., when inviting/joining a household, or from Settings. This also aligns with the household-based account model (an account meaningfully exists to *share*).
- **[ASSUMPTION]** Anonymous profiles are silently upgraded to a full account on first sign-in, preserving streak/history/preferences. Backend must support anonymous→authenticated identity merge.

### Back-navigation rules
- Tab switches do **not** stack; each tab preserves its own navigation stack (standard RN tab navigator behavior).
- Immersive flows (Onboarding, Guided Ritual, Paywall sheet) capture back; Android hardware back inside a guided ritual prompts "Leave ritual? Your progress today is saved" rather than dumping the user out silently.
- Modal bottom sheets dismiss on back/scrim tap unless they are a required decision (e.g., destructive confirmation).
- Deep links always resolve to a **valid full stack** (e.g., festival detail opened from a push has Calendar as its parent, so Back goes to Calendar, not a dead end).

### Cross-cutting navigation guarantees
- The **tab bar is always visible** except in: Splash, Onboarding, immersive Guided Ritual steps, and full-screen modals.
- **Ask Guru is reachable from context** (a "Ask about this" affordance on ritual, festival, and panchang detail deep-links into Ask Guru pre-seeded with a relevant question) — not only from its tab. This is a key trust/engagement multiplier.
- The **daily loop never dead-ends**: ritual completion routes back to Today with the reward state; there is always a clear "what's next."

---

# SECTION 3 — Complete User Flows

Each flow specifies: **Purpose · Entry Point(s) · Exit Point(s) · Decision Tree · Success Path · Failure Path**. Flows are grouped: Onboarding & Activation, Daily Loop, Discovery & Content, AI, Household & Growth, Account & System, Monetization.

> **Legend:** `◇` decision · `▸` step · `✔` success exit · `✖` failure/abort exit · `⤴` deep link entry.

---

## 3.0 Cross-cutting Registries (used by all flows and by every Part 2 screen)

These four registries are the shared vocabulary for the rest of the document. Flows and screens **reference** these IDs and tokens rather than redefining them. The Analytics taxonomy is expanded fully in Part 5 §11; the Error catalogue in Part 5 §12; the Design System (token values) in Part 3 §6. Here we fix the **names/IDs** so Parts 2–5 stay consistent.

### 3.0.1 Analytics Event Taxonomy (`EVT_xxx`)

Canonical event IDs. Each flow annex and each Part 2 screen references these IDs; property schemas are defined in Part 5 §11. Naming rule: `EVT_###` stable ID + a human name; new events are appended, never renumbered.

| ID | Event | Fires when |
|---|---|---|
| EVT_001 | App Open | App foregrounded / cold launch |
| EVT_002 | Splash Shown | Splash rendered |
| EVT_003 | Onboarding Started | First onboarding slide shown |
| EVT_004 | Location Permission Result | Location grant/deny/skip resolved |
| EVT_005 | Tradition Selected | Regional tradition chosen (or skipped) |
| EVT_006 | Household Created | Household saved |
| EVT_007 | Household Member Added | Member record created |
| EVT_008 | Ritual Time Set | Daily ritual time chosen |
| EVT_009 | First Panchang Viewed | First panchang reveal rendered |
| EVT_010 | Notification Permission Result | Notif grant/deny/deferred resolved |
| EVT_011 | Activation Completed | Household + first panchang + notif enabled in first session |
| EVT_012 | Today Viewed | Today (Home) rendered |
| EVT_013 | Panchang Detail Viewed | Panchang detail opened |
| EVT_014 | Rotating Element Viewed | Daily quote/fact shown |
| EVT_015 | Ritual Started | "Begin" on guided ritual |
| EVT_016 | Ritual Step Advanced | Each guided step completion |
| EVT_017 | Ritual Completed | Ritual reward state reached |
| EVT_018 | Ritual Abandoned | Ritual left before completion |
| EVT_019 | Checklist Item Completed | Checklist item toggled done |
| EVT_020 | Streak Advanced | Streak incremented |
| EVT_021 | Grace Day Used | Grace day consumed |
| EVT_022 | Calendar Viewed | Calendar month view opened |
| EVT_023 | Festival Detail Viewed | Festival/vrat detail opened |
| EVT_024 | Regional Variant Switched | Tradition switched from calendar |
| EVT_025 | Personal Date Added | Shraddha/personal date saved |
| EVT_026 | Personal Date Reminder Fired | Personal-date notification delivered |
| EVT_027 | Ask Guru Opened | Ask Guru surface opened |
| EVT_028 | Suggested Question Tapped | Prompt starter selected |
| EVT_029 | Question Asked | User submits a query |
| EVT_030 | Answer Streamed | First grounded token streamed |
| EVT_031 | Answer Sources Shown | Citation(s) rendered |
| EVT_032 | Answer Rated | "Was this helpful?" responded |
| EVT_033 | Guru Declined (Low Confidence) | Honest "no verified info" response |
| EVT_034 | Guru Out-of-Scope Refusal | Safety-boundary refusal shown |
| EVT_035 | Conversation History Opened | History list opened |
| EVT_036 | Household Invite Sent | Invite link shared |
| EVT_037 | Household Invite Accepted | Invitee joins household |
| EVT_038 | Referral Link Shared | Referral share sheet completed |
| EVT_039 | Referral Activated | Referred user reaches activation |
| EVT_040 | Notification Received | Push delivered to device |
| EVT_041 | Notification Opened | Push tapped → deep link resolved |
| EVT_042 | Winback Sent | Win-back push/email dispatched |
| EVT_043 | Winback Returned | Lapsed user re-opens from win-back |
| EVT_044 | Auth Started | Sign-in initiated |
| EVT_045 | Auth Completed | Authenticated + anon merge done |
| EVT_046 | Account Recovery Requested | Recovery flow started |
| EVT_047 | Signed Out | Logout completed |
| EVT_048 | Account Deletion Requested | Deletion queued |
| EVT_049 | Subscription Viewed | Upgrade sheet/screen shown |
| EVT_050 | Plan Selected | Individual/Family plan chosen |
| EVT_051 | Purchase Result | IAP success/failure/cancel |
| EVT_052 | Purchases Restored | Restore completed |
| EVT_053 | Offline State Shown | Offline indicator/state rendered |
| EVT_054 | Error Shown | Any user-visible error surfaced (carries `error_code`) |
| EVT_055 | Household Member Updated | A member's role or content-depth is edited (added in Part 2 §4.31) |

### 3.0.2 Error Code Registry (`ERR_xxx`)

Canonical, user-agnostic error codes. Every failure path and error state references one; user-facing copy lives in Part 5 §13, handling in Part 5 §12. `EVT_054` always carries the `error_code`.

| Code | Meaning | Typical surface |
|---|---|---|
| ERR_NETWORK_TIMEOUT | Request exceeded timeout | Any networked fetch |
| ERR_OFFLINE | No connectivity | Global; network-only features |
| ERR_POOR_NETWORK | Degraded/slow connection | Panchang/calendar/audio load |
| ERR_AUTH_EXPIRED | Session/token expired | Gated actions after expiry |
| ERR_AUTH_FAILED | Sign-in failed/cancelled | Auth flow |
| ERR_AUTH_MERGE_CONFLICT | Anon→auth data conflict | Auth merge |
| ERR_LOCATION_DENIED | Location permission denied | Location flow |
| ERR_GPS_DISABLED | Device GPS off | Location flow |
| ERR_NOTIF_DENIED | Notification permission denied | Notif flow |
| ERR_PANCHANG_UNAVAILABLE | Panchang engine data missing | Today / Panchang detail |
| ERR_CALENDAR_ERROR | Calendar/month data failed | Calendar |
| ERR_FESTIVAL_CONFLICT | Regional variant date conflict | Festival detail |
| ERR_TITHI_AMBIGUOUS | Tithi skip/repeat ambiguity | Personal date computation |
| ERR_AUDIO_UNAVAILABLE | Ritual audio not cached/loadable | Guided ritual |
| ERR_AI_TIMEOUT | LLM/generation timeout | Ask Guru |
| ERR_AI_ERROR | LLM/API error | Ask Guru |
| ERR_RAG_EMPTY | Retrieval returned nothing usable | Ask Guru (→ honest decline) |
| ERR_RAG_LOW_CONFIDENCE | Retrieval below confidence threshold | Ask Guru (→ honest decline) |
| ERR_INVITE_EXPIRED | Household/referral token expired | Invite/referral |
| ERR_PAYMENT_FAILED | IAP payment declined/failed | Subscription |
| ERR_SUBSCRIPTION_INVALID | Entitlement invalid/unverifiable | Subscription |
| ERR_SYNC_CONFLICT | Offline queue conflict on sync | Offline sync |
| ERR_UNKNOWN | Uncaught/unexpected | Global fallback |

### 3.0.3 Design Token references

This document **references** future design tokens by name; **values are defined in Part 3 §6 (Design System)** — not here. Where a flow, state, or microinteraction implies a color, type ramp, spacing, radius, or motion, it should be expressed as a token (e.g., `color.surface.primary`, `color.text.secondary`, `typography.heading.large`, `spacing.lg`, `radius.md`, `motion.success.small`, `motion.reduced.crossfade`). **[ASSUMPTION]** Token namespaces are `color.*`, `typography.*`, `spacing.*`, `radius.*`, `elevation.*`, `motion.*`, `duration.*`, `haptic.*`; final values are Part 3's to set. Prose in Sections 1–2 intentionally keeps descriptive language (e.g., "dawn/temple tones") for readability; the binding token names are introduced from the annexes onward and become mandatory in Part 2 screens.

### 3.0.4 Performance Budgets (global)

Measurable UX performance targets. Flow annexes reference these; per-screen budgets in Part 2 inherit them unless a screen overrides with justification.

| Surface / action | Budget | Measured as |
|---|---|---|
| Splash | < 1 s | Launch → first meaningful frame |
| Today (Home), cached | < 500 ms | Tap/open → cached content painted |
| Today (Home), network refresh | < 2 s | Background fetch → updated content |
| Panchang detail open | < 300 ms (cached) | Tap → rendered |
| Calendar month render (cached) | < 400 ms | Tap → month painted |
| Guided ritual start | < 400 ms | "Begin" → first step painted |
| Ritual audio start (cached) | < 500 ms | Play → first audio frame |
| Ask Guru first streamed token | < 2 s | Submit → first token rendered |
| Ask Guru full short answer | < 6 s | Submit → stream complete (typical) |
| Screen transition / navigation | < 300 ms | Tap → destination interactive |
| Standard animation | < 300 ms | Duration of non-celebration motion |
| Completion celebration animation | ≤ 1.2 s | Bounded; skippable; Reduced-Motion → cross-fade |
| Optimistic action feedback (tap→ack) | < 100 ms | Tap → visual acknowledgment |

**[ASSUMPTION]** Budgets are p75 targets on a mid-tier device (e.g., iPhone SE 2nd-gen / a mid-range Android from ~2 years prior) on a typical diaspora-market network. Exact device/percentile baselines are a `[PRD FOLLOW-UP]` for engineering to ratify.

### 3.0.5 Per-flow annex format

Each flow in this section is followed narratively by its Success/Failure paths (unchanged from v1.0). To keep every flow implementation-ready without disrupting the readable narrative, the **engineering metadata for all flows is consolidated in §3.15 (Per-Flow Engineering Annexes)**, one annex per flow, each in an identical standardized block: **Success Metrics** (Primary KPI, Secondary KPI, Targets, Success Criteria) · **Friction Analysis** (Cognitive Load, Estimated Duration, Likely Drop-off Step, UX Risk Level) · **Backend Dependencies** (required APIs) · **AI Dependencies** (where applicable) · **Analytics** (`EVT_xxx` refs) · **Error Codes** (`ERR_xxx` refs) · **Accessibility Checklist** · **Performance Budget**. This keeps the annex data uniform and diff-able for engineers and AI coding agents.

---

## 3.0A Global Engineering & Documentation Governance Framework

This section is the **operational foundation** for every artifact produced from here forward — the rest of this PDD/UXS (Parts 2–5), the Technical Design Document (TDD), the Design System, the API Specification, the Database Schema, the QA Test Plan, and any code written by humans or AI coding agents. Where §3.0 defined the shared *vocabulary* (event IDs, error codes, tokens, budgets), §3.0A defines the shared *rules of engagement*: what is authoritative, how everything is traced and named, who owns what, and the bar an item must clear before it is "ready." Nothing here changes product scope, flows, navigation, business rules, or UX decisions; it governs how those are documented and built.

### 3.0A.1 Source of Truth Hierarchy

Documents are authoritative in the following order. A **lower-numbered document outranks a higher-numbered one** when they conflict.

| Rank | Document | Owns (is authoritative for) |
|---|---|---|
| 1 | **Market Requirements Document (MRD)** | Market opportunity, personas, competitive framing, business/GTM strategy, Go/No-Go |
| 2 | **Product Requirements Document (PRD)** | Product scope, business rules, functional requirements, goals & success metrics, roadmap/sequencing |
| 3 | **Product Design Document / UX Specification (PDD / UXS)** *(this document)* | UX patterns, IA, navigation, flows, screens, interaction & motion design, UX copy, accessibility UX |
| 4 | **Technical Design Document (TDD)** | System architecture, service boundaries, data flow, non-functional/technical decisions |
| 5 | **Design System** | Concrete token *values*, component implementations, visual/motion specifications |
| 6 | **API Specification** | Endpoint contracts, request/response schemas, versioning, error payloads |
| 7 | **Database Schema** | Entities, relationships, constraints, migrations |
| 8 | **Sprint Backlog** | What is being built now, estimates, assignment, priority within a sprint |
| 9 | **QA Test Plan** | Test cases, coverage, pass/fail criteria, release gates |

**Conflict resolution rule.** If two documents disagree, the **lower-ranked number wins** and the higher-ranked document must be corrected to match — the disagreement is logged as a change (§3.0A.13) against the losing document. Concretely:

- **PRD vs. PDD/UXS** on *scope, a business rule, or a functional requirement* → **PRD wins**; this UXS is corrected. (This is the authority rule already stated in "How to read this document.")
- **PDD/UXS vs. TDD/Design System/API/DB** on *a UX pattern, flow, screen behavior, IA, or interaction* → **PDD/UXS wins**; the downstream artifact conforms.
- **PDD/UXS vs. Design System** on *a concrete token value or component implementation* → **Design System wins** (rank 5 owns values; this doc only *references* token names, per §3.0.3).
- **Any document vs. the MRD** on *market/persona/strategy* → **MRD wins**.
- A conflict that cannot be resolved by rank (e.g., two peers, or an ambiguity in the authoritative doc itself) is **escalated to that document's owner (§3.0A.5), not resolved unilaterally** — and, for AI agents, triggers the stop-and-ask rule (§3.0A.7).

### 3.0A.2 Traceability Framework

Every implementation item must be traceable end-to-end, from market need to test case. This makes impact analysis, QA coverage, and AI-agent grounding deterministic.

**Every screen** (documented via the §3.17 template) must carry references to: **MRD Requirement · PRD Requirement · User Story · Epic · Feature · Flow ID · Screen ID · Component IDs · API IDs · Database Entity · Analytics Event IDs · Acceptance Criteria · QA Test Cases.**

**Traceability matrix (canonical columns).** Part 2 maintains this matrix; one row per screen (extended per-component/API as needed). IDs follow §3.0A.3.

| MRD Req | PRD Req | User Story | Epic | Feature | Flow ID | Screen ID | Component IDs | API IDs | DB Entity | Analytics (EVT) | Acceptance Criteria | QA Test Cases |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MRD §7 (pain: timezone) | PRD P0 #1 | "…know today's tithi without tz math" | EPIC_PANCHANG | FEAT_DAILY_PANCHANG | FLOW_MORNING_RITUAL | SCR_HOME_001 | CMP_PANCHANG_CARD, CMP_STREAK_COUNTER | API_GET_TODAY | PANCHANG, USER | EVT_012, EVT_014 | AC-HOME-01…n | QA_HOME_001…n |
| MRD §1 (belief-practice gap) | PRD P0 #3 | "…a short ritual I can actually do" | EPIC_RITUAL | FEAT_GUIDED_RITUAL | FLOW_MORNING_RITUAL | SCR_RITUAL_001 | CMP_RITUAL_CARD, CMP_PROGRESS_RING | API_GET_RITUAL, API_POST_RITUAL_COMPLETE | RITUAL, RITUAL_COMPLETION | EVT_015, EVT_017 | AC-RIT-01…n | QA_RIT_001…n |
| MRD §5 (AI gap) | PRD P0 #4 | "…ask if I'm doing it right" | EPIC_AI | FEAT_ASK_GURU | FLOW_ASK_GURU | SCR_GURU_CHAT_001 | CMP_AI_CHAT_BUBBLE, CMP_SOURCE_CHIP | API_POST_ASK_GURU | CONTENT_CHUNK, CONVERSATION | EVT_029, EVT_030, EVT_031 | AC-GURU-01…n | QA_GURU_001…n |

*(Rows above are illustrative to fix the format; Part 2 populates the full matrix. No row may have an empty authoritative-upstream cell — see §3.0A.6.)*

### 3.0A.3 Naming Conventions

Global, case-sensitive naming. IDs are **stable** once assigned and are the reference used across all documents and code.

| Artifact | Pattern | Examples |
|---|---|---|
| **Screen** | `SCR_<AREA>_<NNN>` | `SCR_HOME_001`, `SCR_GURU_CHAT_001`, `SCR_CALENDAR_001`, `SCR_ONBOARDING_LOCATION_001` |
| **Flow** | `FLOW_<NAME>` | `FLOW_ONBOARDING`, `FLOW_MORNING_RITUAL`, `FLOW_ASK_GURU`, `FLOW_HOUSEHOLD_INVITE` |
| **Epic** | `EPIC_<NAME>` | `EPIC_PANCHANG`, `EPIC_RITUAL`, `EPIC_AI`, `EPIC_HOUSEHOLD` |
| **Feature** | `FEAT_<NAME>` | `FEAT_DAILY_PANCHANG`, `FEAT_GUIDED_RITUAL`, `FEAT_SHRADDHA_DATES` |
| **Component** | `CMP_<NAME>` | `CMP_PRIMARY_BUTTON`, `CMP_RITUAL_CARD`, `CMP_STREAK_COUNTER`, `CMP_AI_CHAT_BUBBLE` |
| **Analytics event** | `EVT_<NNN>` | `EVT_001`, `EVT_017`, `EVT_029` (canonical list §3.0.1) |
| **Error code** | `ERR_<DOMAIN>_<REASON>` | `ERR_AI_TIMEOUT`, `ERR_LOCATION_DENIED` (canonical list §3.0.2) |
| **API** | `API_<VERB>_<RESOURCE>` | `API_GET_TODAY`, `API_POST_ASK_GURU`, `API_POST_RITUAL_COMPLETE`, `API_GET_CALENDAR` |
| **Database entity** | `SCREAMING_SNAKE`, singular | `USER`, `HOUSEHOLD`, `HOUSEHOLD_MEMBER`, `RITUAL`, `RITUAL_COMPLETION`, `FESTIVAL`, `PERSONAL_DATE`, `CONVERSATION`, `SUBSCRIPTION` |
| **Feature flag** | `FF_<NAME>` | `FF_GREETING_CARD`, `FF_JAIN_MODE`, `FF_LIFECYCLE_EMAIL`, `FF_FAMILY_PLAN` |
| **Design token** | `namespace.group.variant` | `color.surface.primary`, `typography.heading.large`, `motion.success.small` (§3.0.3; values in Part 3) |
| **Acceptance criterion** | `AC-<AREA>-<NN>` | `AC-HOME-01`, `AC-GURU-03` |
| **QA test case** | `QA_<AREA>_<NNN>` | `QA_HOME_001`, `QA_RIT_014` |

**Rules:** IDs are immutable once published; depreclate (never reuse) retired IDs; `API_*` names map 1:1 to the endpoint paths proposed in the §3.15 annexes (final paths owned by the API Spec per F-8); every `EVT_*`/`ERR_*` used anywhere must already exist in the §3.0 registries (adding one means adding it there first).

### 3.0A.4 Versioning Strategy

All governed documents and the app use **Semantic Versioning `MAJOR.MINOR.PATCH`**.

| Bump | Triggered by | Examples |
|---|---|---|
| **MAJOR** | A breaking change: altered/removed flow, navigation model change, removed/renamed screen or API, incompatible data-model change, removed feature, changed business rule | Collapsing/expanding the tab bar; removing a screen; a breaking `API_*` contract change; dropping a DB entity |
| **MINOR** | Additive, backward-compatible: new screen/flow/component/feature-flagged capability, new API (non-breaking), new analytics events, new optional fields | Adding a screen; adding `EVT_055`; adding the greeting-card feature behind `FF_GREETING_CARD` |
| **PATCH** | Non-structural corrections: copy fixes, token-value tweaks, clarifications, typo/format, acceptance-criteria wording, bug fixes with no contract change | Fixing UX copy; adjusting a `color.*` value; clarifying an AC |

**This document:** `1.0` (initial), `1.1` (Principal UX Architecture Review — additive), and this governance insertion is a **MINOR** bump → **`1.2`** (additive, no existing content changed). Each Part carries its own version; the PDD/UXS as a whole carries an aggregate version. Every version bump is recorded in the change log (§3.0A.13) with owner and approval status.

### 3.0A.5 Documentation Ownership & Approval Workflow

Each document has a **single accountable owner** (approves changes) and **required reviewers** (must sign off before an approved change merges). For PanchangPal's solo-founder reality, one person may hold several roles — the *roles* still gate the workflow so responsibilities remain explicit and survive team growth.

| Document | Accountable Owner (role) | Required Reviewers |
|---|---|---|
| MRD | Product | Architecture |
| PRD | Product | Design, Engineering |
| PDD / UXS *(this doc)* | Design | Product, Engineering, Accessibility |
| TDD | Architecture | Backend, Engineering |
| Design System | Design | Engineering (frontend) |
| API Specification | Backend | Architecture, Frontend Engineering |
| Database Schema | Backend | Architecture |
| Analytics Spec (Part 5 §11) | Analytics | Product, Engineering |
| AI/Ask-Guru Spec (Part 4 §9, Annex D1) | AI | Product, Backend, Design |
| QA Test Plan | QA | Product, Engineering |

**Approval workflow:** `Draft → Review (required reviewers) → Approved (owner) → Published (versioned) → (change) → back to Draft on the affected doc`. No change is "Published" without an owner approval and reviewer sign-off recorded in §3.0A.13. Roles: **Product, Design, Engineering, Backend, QA, AI, Analytics, Architecture.**

### 3.0A.6 Cross-Document Consistency Rules

These are hard invariants. A CI/documentation lint (or an AI agent's pre-flight check) should reject anything violating them.

- **No screen may exist without:** a Flow (`FLOW_*`), Acceptance Criteria (`AC-*`), Analytics (`EVT_*`), Backend Dependencies (`API_*` or an explicit "N/A — static"), an Accessibility checklist, and a Performance Budget. *(Enforced by the §3.17 template.)*
- **No API may exist without:** a PRD Requirement it serves, at least one Screen (or flow/notification job) that consumes it, and a Database Entity it reads/writes (or an explicit external-service note).
- **No Feature may exist without:** a User Story, a Business Goal (tied to a PRD goal/North Star), and a Success Metric (KPI + target).
- **No Component may exist without:** a Design System entry (Part 3 §5) and at least one Screen that uses it (no orphan components; §3.0A.8).
- **No Analytics event may exist without:** a definition in §3.0.1 and at least one Screen/Flow that fires it.
- **Every upstream cell in the traceability matrix (§3.0A.2) must be populated** — an empty MRD/PRD/User-Story reference is a lint failure, not an allowed TODO.

### 3.0A.7 AI Coding Agent Guidelines

Future development may be performed with **Claude Code, Cursor, Codex, and GitHub Copilot**. These guidelines are binding for any AI agent acting on this codebase or documentation.

**AI agents must never invent:** Business Rules · UX · Navigation · Database Relationships · API Contracts · Analytics events/properties · Error codes · Design tokens · Success metrics · Security/permission behavior.

**Grounding rule.** An AI agent may only implement what is specified in the authoritative documents (§3.0A.1) and named in the registries (§3.0). It must use existing `SCR_*`, `FLOW_*`, `CMP_*`, `EVT_*`, `ERR_*`, `API_*`, token, and entity names — never coin new ones silently.

**Stop-and-ask rule.** If documentation is **ambiguous, missing, or internally contradictory**, the agent must **halt and request clarification** rather than assume. It surfaces the gap as an **Open Question** referencing the relevant IDs and, where appropriate, proposes options for a human to choose — but does not pick one and proceed. A conflict between documents is resolved only by the §3.0A.1 hierarchy; anything the hierarchy cannot settle is escalated, not guessed.

**Change discipline.** Any deviation an agent believes is warranted is filed as a Change (§3.0A.13) for human approval before implementation — it is never applied unilaterally. Agents must not weaken accessibility, analytics, error handling, or performance budgets to satisfy another goal.

### 3.0A.8 Design Governance

- **Every screen follows the Global Screen Template (§3.17).** No exceptions; unused fields are "N/A — {reason}."
- **Every component comes from the Design System (Part 3 §5).** Screens compose existing `CMP_*` components; they do not introduce one-off UI.
- **No duplicates:** no duplicate components, duplicate interaction patterns, duplicate animations, or redundant variants. If two needs are ~90% the same, they are one component with variants (Part 3), not two.
- **Consistency invariants:** no inconsistent spacing (only `spacing.*` tokens), no inconsistent typography (only `typography.*` ramp), no inconsistent radius/elevation/motion (only the respective token namespaces). Hard-coded pixel/hex/duration values are prohibited in screens and code.
- **New pattern gate:** a genuinely new component/interaction/animation must be added to the Design System first (with owner approval, §3.0A.5) before any screen uses it.

### 3.0A.9 Performance Governance

Every screen must explicitly specify: **Performance Budget** (from §3.0.4 or a justified override) · **Caching Strategy** (what is cached, TTL, invalidation) · **Offline Strategy** (what works offline; ties to `ERR_OFFLINE` and Flow E5) · **Skeleton State** · **Loading State** · **Retry Strategy** (backoff, max attempts, which `ERR_*` triggers it). A screen missing any of these is not implementation-ready (§3.0A.12).

### 3.0A.10 Accessibility Governance

Every screen must include an accessibility specification covering: **VoiceOver** · **TalkBack** · **Dynamic Type** · **Touch Targets (≥44×44pt / 48×48dp)** · **Reduced Motion** · **WCAG 2.1 AA** (contrast, focus order, color-independence) · **Localization readiness** · **RTL readiness** · and an explicit **Accessibility Checklist** (as used in the §3.15 annexes and the §3.17 template). Accessibility is a release gate, not a backlog item — a screen failing any item is not shippable. Full audit methodology in Part 5 §10.

### 3.0A.11 Analytics Governance

Every screen must specify: **Analytics Events** (`EVT_*` from §3.0.1) · **Event Properties** (schema per Part 5 §11) · **Funnels** the screen participates in · **KPIs** it influences · **North Star contribution** (Weekly Household Ritual Completions) · **Retention contribution** (D7/D30) · **Revenue contribution** (conversion/ARPU/LTV:CAC, where applicable). Events not in the registry may not be fired; adding one means updating §3.0.1 first. No silent/undocumented tracking, and no PII in event properties (privacy baseline, Trust §1.7).

### 3.0A.12 Engineering Readiness Checklist

A screen is **implementation-ready only when all of the following are present** (this is the merge gate for Part 2 screens and the definition-of-ready for the backlog):

☐ Purpose ☐ Business Goal ☐ User Goal ☐ Flow (`FLOW_*`) ☐ Navigation ☐ Components (`CMP_*`) ☐ States (Default/Loading/Skeleton/Empty/Offline/Error/Success) ☐ Acceptance Criteria (`AC-*`, Given/When/Then) ☐ Analytics (`EVT_*` + properties) ☐ Accessibility (checklist) ☐ Backend APIs (`API_*`) ☐ Performance Budget ☐ Error Codes (`ERR_*`) ☐ Design Tokens ☐ Open Questions (or "None") ☐ Dependencies (upstream/downstream, feature flags).

Anything unchecked keeps the screen in **Draft**; it may not enter a sprint.

### 3.0A.13 Change Management

Every change to a governed artifact after publication — including every future `UX Improvement` — is recorded as a **Change Record** with all of the following fields:

| Field | Meaning |
|---|---|
| **Change ID** | Unique, stable (`CHG_<NNNN>`) |
| **Reason** | Why the change is proposed |
| **Impact** | What it affects (screens/flows/APIs/entities by ID) |
| **Risk** | Low / Medium / High + brief note |
| **PRD Impact** | None / Clarification / Requires PRD update (→ `[PRD FOLLOW-UP]`) |
| **Engineering Impact** | Effort + affected services/contracts |
| **Backward Compatibility** | Compatible / Breaking (drives the §3.0A.4 version bump) |
| **Version** | Resulting version after the change |
| **Owner** | Accountable owner (role, §3.0A.5) |
| **Approval Status** | Draft / In Review / Approved / Published / Rejected |

**Rules:** no change is implemented before **Approved**; a **Breaking** change forces a **MAJOR** bump and explicit reviewer sign-off; changes touching scope/business rules/functional requirements are routed to the **PRD** (they are not made in this document — the authority rule, §3.0A.1). The existing **UX Change Log** and **`[PRD FOLLOW-UP]`** tables in this Part are the Part-1 instance of this process; Parts 2–5 each maintain their own, in this same schema.

---

## GROUP A — Onboarding & Activation

### Flow A1 — First Launch / Onboarding (to Activation Event)

**Purpose:** Get a brand-new user from install to the **activation event** (household setup + first panchang view + notifications enabled, within first session — MRD §14) with the least possible friction, delivering a genuine value moment *before* asking for notification permission.

**Entry point:** Cold launch with no stored profile; or install triggered by a referral/invite deep link.

**Exit points:** ✔ Today (Home) with activation complete · ✖ user abandons (state saved locally so a return resumes mid-flow).

**Decision tree:**
```
Splash
  ◇ Referral/invite deep link present?
     ├─ Yes → capture context (ref code / invite token) → continue
     └─ No  → continue
  ▸ 1.1 Welcome value intro (max 3 slides; "Skip" always available)
  ▸ 1.2 Location permission rationale (bottom sheet: "so today's panchang is for YOUR sky")
     ◇ Grant?
        ├─ Grant → detect city/timezone → continue
        ├─ Deny  → 1.2b Manual location picker (search city) → continue
        └─ "Not now" → default to device locale timezone; banner later to fix → continue
  ▸ 1.3 Tradition/region selection (top 2–3 regional variants + "General / not sure")
     ◇ Choose specific tradition?
        ├─ Yes → set regional calendar + scripts
        └─ Skip/"not sure" → generic variant; reminder that it's changeable in Settings
  ▸ 1.4 Household setup (name it, e.g., "The Sharma Family"; add members optional)
     ◇ Add members now?
        ├─ Yes → add name + role + depth (Quick/Deep) per member → optional invite
        └─ Skip → single-member household (self); can add later
  ▸ 1.5 Ritual time selection ("When's your daily moment?" default = morning post-sunrise)
  ▸ 1.6 FIRST PANCHANG REVEAL  ← value moment (animated, location-personalized)
     (activation sub-goal: first panchang view ✓)
  ▸ 1.7 Notification permission (now that value is shown)
     ◇ Grant?
        ├─ Grant → schedule morning reminder at chosen time (activation: notifications ✓)
        ├─ Deny  → continue; non-blocking; soft re-ask later via in-app prompt
        └─ "Remind me" → continue; scheduled soft re-ask
  ▸ 1.8 → Today (Home); activation event fires if all 3 sub-goals met
```

**Success path:** Location set → tradition chosen → household named → ritual time set → first panchang revealed → notifications enabled → lands on Today. **Activation event = TRUE.**

**Failure/abort paths:**
- Abandon mid-onboarding → progress persisted locally; next launch resumes at the last incomplete step (not restart). **[ASSUMPTION]**
- Location denied → manual city picker keeps panchang accurate; never a dead end.
- Notification denied → user still fully functional; scheduled in-app soft prompt after 2 completed daily loops (not immediately — avoid nagging).
- No network during onboarding → tradition/household steps work offline; first panchang reveal shows a cached/estimated panchang with a "we'll refine when you're online" note, or a graceful "connect to see today's panchang" state (see Offline flow F-sys2).

**Analytics anchors:** `onboarding_started`, `permission_location_result`, `tradition_selected`, `household_created`, `ritual_time_set`, `first_panchang_viewed`, `permission_notifications_result`, `activation_completed`. (Full props in Part 5 §11.)

---

### Flow A2 — Returning User (warm open)

**Purpose:** Deliver time-to-value in <10 seconds for an existing, onboarded user.

**Entry point:** Cold or warm launch with a valid completed profile; or a morning-reminder push tap.

**Exit points:** ✔ Today (Home) rendered with today's panchang + ritual · ✖ (rare) hard error → cached fallback.

**Decision tree:**
```
Splash (session check, silent, ≤1s)
  ◇ Onboarding complete?  → Yes (else → Flow A1)
  ◇ Cached panchang for today & location valid?
     ├─ Yes → render Today instantly from cache → refresh in background
     └─ No  → render Today skeleton → fetch → populate
  ◇ Session token valid?
     ├─ Yes → full features
     └─ Expired → render cached Today read-only; silent refresh; gate only on account actions
  ◇ New day since last open?
     ├─ Yes → today's ritual reset to incomplete; new rotating element; streak status evaluated
     └─ No  → resume today's state (ritual may already be complete)
```

**Success path:** Instant Today render from cache, background refresh, correct day state, streak/grace evaluated silently.

**Failure path:** No cache + no network → Offline Today state (F-sys2) with last-known panchang and a clear reconnect affordance; ritual audio unavailable message if not pre-cached.

---

### Flow A3 — Profile / Household Creation

**Purpose:** Establish the household unit and per-member role + content-depth, powering role-aware content (PRD P0 #6) and the North Star household metric.

**Entry point:** Onboarding step 1.4; or Profile → Household → later.

**Exit points:** ✔ Household saved with ≥1 member · ✖ cancel (no household; user is implicit solo household).

**Decision tree:**
```
▸ Name household
▸ Add member(s)
   For each member: name · role (Anchor / Parent / Elder / Youth / Other) · content depth (Quick / Deep)
   ◇ Invite this member to install?  → Yes → Household Invitation flow (D2)  |  No → local member record
◇ Save
   ├─ Success → household active; roles drive content depth
   └─ Error → retain entered data; retry; never lose input
```

**Success path:** Household with roles and depth preferences saved; content across app respects each member's depth.

**Failure path:** Save error → local draft retained, inline retry, snackbar. Duplicate member name → allow (families reuse names) but warn softly. **[ASSUMPTION]** Roles are a fixed enum: Anchor, Parent, Elder, Youth, Other. Depth is a 2-value toggle (Quick / Deep-dive), persistent per member (PRD).

---

### Flow A4 — Notification Permission

**Purpose:** Earn the notification opt-in *after* value, maximizing opt-in rate (a leading metric, MRD §14).

**Entry point:** Onboarding 1.7 (post first-panchang reveal); or soft in-app re-prompt after 2 completed loops; or Settings → Notifications.

**Exit points:** ✔ OS permission granted + reminders scheduled · ✖ denied (functional app, soft re-ask path).

**Decision tree:**
```
▸ Pre-permission priming screen (in-app): "Want a gentle reminder for your daily moment?"
   ◇ User taps "Yes, remind me"
      ├─ → OS permission dialog
      │     ◇ OS grant?
      │        ├─ Grant → schedule morning reminder at chosen ritual time → confirm toast
      │        └─ Deny  → record; show "You can enable anytime in Settings"; schedule in-app nudges only
      └─ User taps "Not now" → skip OS dialog entirely (never burn the one-shot iOS prompt) → soft re-ask later
```

**`UX Improvement`:** Always gate the native OS permission dialog behind an in-app priming screen so we never trigger the (one-time-only on iOS) system prompt against a user likely to deny. This is standard best practice and materially raises opt-in.

**Success path:** Granted → morning reminder + festival reminders scheduled per preferences.

**Failure path:** Denied at OS level → cannot re-prompt via OS; app shows a persistent-but-quiet Settings deep-link affordance and continues to function; win-back/festival value delivered via in-app surfaces and (later) lifecycle email.

---

### Flow A5 — Location Permission

**Purpose:** Get an accurate location for the panchang engine (the #1 pain point the product fixes — MRD §7).

**Entry point:** Onboarding 1.2; or Settings → Location; or a "fix your location" banner if timezone looks wrong.

**Exit points:** ✔ Location resolved (GPS or manual) · ✖ neither (fallback to device-locale timezone with visible caveat).

**Decision tree:**
```
▸ Rationale sheet ("Today's panchang is calculated for your exact location & time zone")
   ◇ Grant precise/approx location?
      ├─ Grant → reverse-geocode → city + timezone → confirm ("Panchang for {city}")
      ├─ Deny  → Manual city search picker → select → set timezone
      └─ Not now → use device timezone; show non-blocking "Set your city for accurate panchang" chip
◇ GPS enabled at device level?
   ├─ Yes → proceed
   └─ No (GPS disabled) → skip straight to manual picker; explain GPS is off (Edge case, Part 5 §12)
```

**Success path:** City + timezone confirmed and shown on Today ("Panchang for Auckland, NZDT") — visible trust signal (P2/Trust #1).

**Failure path:** All location denied + GPS off → manual picker; if skipped, device-locale timezone used with a persistent, dismissible accuracy caveat. Panchang still renders (never a blank screen).

---

## GROUP B — Daily Loop

### Flow B1 — Morning Ritual (core habit loop)

**Purpose:** The heart of the product (Principle P4). Take the user from open → completed ritual in under 2 minutes, advancing the habit and the North Star.

**Entry point:** Morning reminder push ⤴ `panchangpal://today?focus=ritual`; or organic open; or streak reminder push.

**Exit points:** ✔ Ritual complete → reward state on Today · ✖ user leaves mid-ritual (progress saved; streak unaffected until day ends).

**Decision tree:**
```
Today (Home)
  ▸ See today's panchang + rotating element (variable reward)
  ▸ Tap "Begin" on Today's Ritual card
Guided Ritual Flow (immersive)
  ▸ 4.1 Intro: what today's ritual is & why (regional variant; depth per member setting)
     ◇ Audio available & user wants it?
        ├─ Play audio narration (regionalized) + text
        └─ Text only (audio muted / unavailable offline)
  ▸ 4.2 Step through guided steps (progress ring; can pause/resume)
     ◇ Interrupted (call, background, leaves)?
        ├─ Resume later today from same step (state saved)
        └─ Abandon → today's ritual remains "in progress"; no penalty
  ▸ 4.3 Complete → reward moment (calm animation + optional chime + haptic)
     ▸ Streak advances (grace-day logic if a prior day was missed)
     ▸ Weekly Household Ritual Completions increments (North Star)
  ▸ 4.4 Optional: "Ask Guru about this" / "Read more" / "Mark for family"
  ✔ Return to Today in completed state ("Done for today 🪔 — see you tomorrow")
```

**Success path:** Begin → steps → complete → reward → streak up → back to Today completed.

**Failure paths:**
- Audio fails to load (network) → fall back to text seamlessly; toast "Audio unavailable offline."
- App killed mid-ritual → on relaunch, Today shows "Continue today's ritual" resuming at saved step.
- User completes but offline → completion recorded locally, streak advances locally, synced on reconnect (optimistic; conflict-safe). **[ASSUMPTION]** Completion is client-authoritative for the day and reconciled server-side on sync.

---

### Flow B2 — Daily Checklist (micro-actions)

**Purpose:** Offer completable micro-actions (light a diya, offer water, a short mantra) for users who want habit reinforcement beyond the single guided ritual — feeds the 40% daily-completion goal (PRD Goal 2).

**Entry point:** Today (Home) checklist section.

**Exit points:** ✔ ≥1 item checked (counts toward daily completion) · ✖ none checked (no penalty).

**Decision tree:**
```
Today → Checklist
  ▸ Tap a checklist item
     ◇ Item requires a flow (e.g., guided) ? → route to that flow  |  else → inline toggle complete
  ▸ Item checked → subtle check animation + haptic; progress reflects
  ◇ All items done? → gentle "All done for today" acknowledgment (no confetti; P1)
```

**Success path:** Items toggled inline, instant feedback, contributes to daily completion + North Star.

**Failure path:** Toggle fails to persist offline → optimistic check retained locally, synced later.

**[ASSUMPTION]** Checklist items are a small curated set (3–5) derived from the day's tradition/festival context, not user-authored in v1 (user-authored tasks deferred — avoids scope creep).

---

### Flow B3 — Panchang Detail (deepening)

**Purpose:** Give the user who wants it the full, accurate panchang (tithi, nakshatra, yoga, karana, sunrise/sunset, auspicious/inauspicious muhurta, Rahu Kaal) — depth on demand, kept off the calm summary.

**Entry point:** Today → panchang summary card; or Calendar → day detail.

**Exit points:** ✔ user reads & returns · ✖ n/a.

**Decision tree:**
```
Today → tap panchang card → Panchang Detail
  ▸ Full elements listed, grouped, with plain-language labels + info affordances
  ◇ "What is a tithi?" tapped → inline explainer / Ask-Guru deep link
  ◇ Muhurta color/state → always paired with text label (color-blind safe)
  ◇ "How we calculate this" → accuracy note (trust)
```

**Success/Failure:** Renders from cache instantly; if a data element is unavailable, show that element's empty/error micro-state without failing the whole screen (graceful degradation).

---

## GROUP C — Discovery & Content

### Flow C1 — Festival Reminder & Detail

**Purpose:** Ensure the user never misses a festival/vrat and understands its significance and how to observe it (regionalized) — a core value and a re-engagement driver.

**Entry point:** Festival reminder push ⤴ `panchangpal://festival/{id}`; or Calendar; or Today's "festival today" card.

**Exit points:** ✔ user reads / sets a reminder / begins related ritual · ✖ dismiss.

**Decision tree:**
```
⤴ Push tap OR Calendar tap → Festival Detail (5.2)
  ▸ Festival name (regional variant) · date (location-correct) · significance/story · how to observe
  ◇ Depth setting?  → Quick summary  |  Deep-dive full story
  ◇ Related guided ritual exists?  → "Observe now" CTA → Guided Ritual flow (B1)
  ◇ "Remind me / add to my dates" → schedule / confirm reminder
  ◇ "Ask Guru about {festival}" → Ask Guru pre-seeded (7.1)
  ◇ "Share greeting card" (post-v1 feature flag) → greeting-card generator
```

**Success path:** User understands the festival, optionally observes it via a ritual, optionally shares.

**Failure paths:** Festival content fails to load → cached summary if available, else error micro-state with retry; date conflict between regional variants handled by showing the user's selected tradition's date primary and noting variants (Festival Conflict edge case, Part 5 §12).

---

### Flow C2 — Personal & Family Dates (Shraddha) — Add / Reminder

**Purpose:** Let the user track personal observances (death anniversaries/shraddha) that recur by tithi, auto-updating each year — the strongly-evidenced v1 P0 feature fixing a real competitor bug (PRD P0 #7, MRD §7). Emotionally sensitive (grief-aware, Emotional Design 1.6).

**Entry point:** Calendar → Personal & Family Dates → Add; or onboarding prompt (optional); or a personal-date reminder push ⤴.

**Exit points:** ✔ Personal date saved with auto-recurring reminder · ✖ cancel.

**Decision tree:**
```
Calendar → Personal & Family Dates → "Add a date"
  ▸ Name / relation (e.g., "Dadaji")
  ▸ Date basis
     ◇ Recurs by tithi (traditional) OR fixed Gregorian?
        ├─ Tithi → pick tithi/paksha/month (or "compute from a known Gregorian date")
        └─ Gregorian → pick date
  ▸ Reminder lead time (same day / 1 day before / custom)
  ▸ Tone confirmed as calm/respectful (no streak, no promo)  [ASSUMPTION]
  ◇ Save
     ├─ Success → next occurrence computed via tithi engine; reminder scheduled; shown on Calendar
     └─ Error → retain input; retry
```

**Success path:** Date saved; the tithi engine computes the correct Gregorian recurrence each year automatically (PRD AC — no annual manual re-entry).

**Failure paths:** Tithi computation edge (rare tithi skips/repeats across years) → engine resolves per documented rule; if ambiguous, surface both candidate dates with a gentle explanation rather than silently guessing. Save error → local retention + retry.

---

### Flow C3 — Calendar Browsing & Regional Switch

**Purpose:** Let the user browse festivals/vrats/personal dates by month and switch regional tradition when needed.

**Entry point:** Calendar tab.

**Exit points:** ✔ navigates to a day/festival/personal date · ✖ n/a.

**Decision tree:**
```
Calendar (month view; markers: festival ●, vrat ○, personal ◆)
  ◇ Tap a day → Day Detail (panchang + that day's events)
  ◇ Tap a festival marker → Festival Detail (5.2)
  ◇ Tap regional switcher → change tradition (affects festival naming/dates) → confirm
  ◇ Jump to today / month nav (swipe between months — see Microinteractions, Part 4)
```

**Success/Failure:** Renders cached calendar; missing month data fetched with skeleton; regional switch re-renders with the correct variant and a brief loading state.

---

## GROUP D — AI, Household & Growth

### Flow D1 — Ask Guru (RAG-grounded AI Q&A)

**Purpose:** Answer ritual/festival questions with grounded, trustworthy guidance, honestly declining when unsure — validating the AI feature (PRD Goal 3: 25% WAU) while protecting trust (Risk §3). Full experience spec in Part 4 §9.

**Entry point:** Ask Guru tab; or contextual "Ask about this" from ritual/festival/panchang; or a suggested-question tap; or `panchangpal://ask`.

**Exit points:** ✔ user gets a grounded answer (with sources) · ✖ out-of-scope/low-confidence → honest "I don't have verified info" with a safe alternative.

**Decision tree:**
```
Ask Guru (7.0)
  ▸ Suggested questions + prompt starters (contextual to today/festival) + free-text input
  ▸ User asks a question
  ▸ Typing/thinking indicator → retrieval over reviewed content library (RAG)
     ◇ Retrieval confidence sufficient?
        ├─ Yes → stream grounded answer + show source(s) + "Was this helpful?"
        └─ No  → "I don't have verified information on this" + offer: rephrase / related verified topic / ask a temple
     ◇ Query out-of-scope (astrology/medical/political/etc.)?
        └─ Gentle refusal within scope boundaries (safety) + redirect to what Guru can help with
  ◇ Follow-up question? → continues conversation (no long-term memory across sessions in v1 — AI Non-Goal)
  ◇ Save/history → conversation stored in history (7.2)
```

**Success path:** Grounded, streamed answer with visible sources; helpful-rating captured.

**Failure paths:**
- LLM timeout / API error → "I'm having trouble right now — try again" with retry; never a blank or a fabricated answer (LLM Timeout / AI Error edge cases, Part 5 §12).
- Low retrieval confidence → honest decline (AC-mandated), with constructive alternatives (Hallucination Recovery, Part 4 §9).
- Offline → Ask Guru requires network; show a clear offline state with cached past conversations still readable.

---

### Flow D2 — Household Invitation & Family Sharing

**Purpose:** Grow the household (commitment device + growth loop) so multiple members contribute to Weekly Household Ritual Completions; cheapest growth lever (PRD P1 #2).

**Entry point:** Profile → Household → Invite; or onboarding household step; or contextual "invite family" prompts.

**Exit points:** ✔ member joins household · ✖ invite unsent/expired/declined.

**Decision tree:**
```
Household → Invite member
  ▸ Choose invite channel (share sheet: WhatsApp / Messages / copy link)
  ▸ Generate invite link  panchangpal://invite/{token}
  ── invitee side ──
  ⤴ Opens link
     ◇ App installed?
        ├─ Yes → Accept invite screen (shows household name + inviter) → join → role/depth set → Today
        └─ No  → App Store/Play → install → onboarding → invite token auto-applied → auto-join household
  ◇ Invite valid?
     ├─ Valid & unexpired → join success → both parties notified (gentle)
     └─ Expired/invalid → "This invite has expired — ask {inviter} for a new one" → offer fresh request
```

**Success path:** Invitee joins the household; content depth/role applied; inviter gets a warm confirmation.

**Failure paths:** Expired token → graceful re-request. Already a member of another household → **[ASSUMPTION]** a user belongs to one active household in v1; joining a new one prompts a clear switch confirmation (data implications explained). Deep-link install attribution handled via deferred deep linking.

---

### Flow D3 — Referral Journey

**Purpose:** Turn organic diaspora sharing into installs (PRD P1 #2; greeting-card virality P1 #3, post-v1).

**Entry point:** Profile → "Invite family & friends"; or festival greeting-card share (feature-flagged, post-v1); or a post-completion prompt.

**Exit points:** ✔ referred user installs & activates (referrer optionally rewarded) · ✖ link shared, no install.

**Decision tree:**
```
Referral entry → generate ref link/code  panchangpal://ref/{code}
  ▸ Share via native share sheet
  ── referred user ──
  ⤴ Opens link → install → onboarding with referral context → activation
     ◇ Reward configured (post-retention)?  → grant to referrer + referee on activation
◇ Referred user already had app? → no double-count; friendly "already part of the family" state
```

**Success path:** Referred user activates; attribution recorded; reward (when live) granted on the referee's *activation*, not mere install (prevents gaming).

**Failure path:** No install within attribution window → link simply expires silently; no nagging.

---

### Flow D4 — Push Notification Journey (cross-cutting)

**Purpose:** Define how every push routes and what state it produces — the primary re-engagement engine (v1 is notification-only; PRD).

**Entry point:** Any scheduled/triggered push (morning, festival, evening, streak, household, personal date, win-back).

**Exit points:** ✔ correct deep-linked destination with a valid back stack · ✖ notification ignored/dismissed.

**Decision tree:**
```
Push delivered
  ◇ Permission granted & not in quiet hours?
     ├─ Yes → deliver
     └─ No/quiet hours → suppress or reschedule to next allowed window
  ▸ User taps
     ◇ Session valid? → route to deep link | Expired → cached destination + silent refresh
     ◇ Destination content available (cache/net)? → render | else → nearest valid parent + retry affordance
  ▸ Notification-source analytics recorded (which type drove the open)
```

**Success path:** Tap → correct screen, correct back stack, attributed to the notification type.

**Failure path:** Content unavailable → land on nearest valid surface (e.g., Today) with a retry, never a crash or blank. Full per-type copy/timing in Part 4 §8.

---

### Flow D5 — Win-back Journey (lapsed user re-engagement)

**Purpose:** Recover lapsed users using fresh-start moments (festivals, new month) — addresses the "no win-back loop" gap (MRD §9). v1 via push; lifecycle email is a 6-month roadmap add (PRD P1 #4).

**Entry point:** User inactive N days (segmented); festival approaching; personal date approaching.

**Exit points:** ✔ user returns & completes a loop · ✖ remains lapsed → escalate cadence gently, then rest.

**Decision tree:**
```
Lapse detected (e.g., no open in 7 / 14 / 30 days — thresholds tunable)
  ◇ Upcoming festival or personal date within window?
     ├─ Yes → send value-led win-back ("Diwali is in 3 days — here's how to prepare") ⤴ festival
     └─ No  → send warm, low-pressure nudge ("Your daily moment is waiting" + a fresh fact) ⤴ today
  ◇ User returns?
     ├─ Yes → welcome-back state; streak grace/soft-reset framing ("start fresh today", never guilt)
     └─ No  → back off cadence (don't spam); try again at next festival/fresh-start
```

**Success path:** User re-opens on a festival/fresh-start hook, completes a loop, re-enters the habit.

**Failure path:** Continued lapse → cadence reduces automatically; win-back never becomes nagging (Trust P2). **[ASSUMPTION]** Win-back thresholds (7/14/30 days) and max frequency (≤1 win-back push/3 days) are configurable server-side.

---

## GROUP E — Account & System

### Flow E1 — Authentication (deferred sign-in)

**Purpose:** Provide cross-device continuity and household features via lightweight auth, requested only when needed (see §2.4 decision).

**Entry point:** Inviting/joining a household; Settings → Account; explicit "Sign in to save across devices" prompt.

**Exit points:** ✔ authenticated; anonymous data merged · ✖ cancel (continue anonymously).

**Decision tree:**
```
Auth entry
  ◇ Method?  Apple / Google / Email(OTP or magic link)
     ├─ Apple/Google → OAuth → success
     └─ Email → enter email → OTP/magic link → verify
  ◇ Existing account for this identity?
     ├─ Yes → sign in → merge/attach current anonymous local data (confirm if conflict)
     └─ No  → create account → migrate anonymous profile → done
  ◇ Success → return to originating context (e.g., complete household invite)
```

**Success path:** Authenticated; streak/history/preferences preserved via anonymous→authenticated merge.

**Failure paths:** OAuth cancel → return to prior screen, still anonymous. OTP/link fails/expires → resend with clear countdown; rate-limited to prevent abuse. Merge conflict (same identity, two devices with divergent local data) → **[ASSUMPTION]** server keeps the longer streak / union of household + history, and informs the user; never silently drops data.

---

### Flow E2 — Account Recovery

**Purpose:** Get a locked-out user back in with minimal friction.

**Entry point:** Auth screen → "Trouble signing in?"

**Exit points:** ✔ access restored · ✖ cannot verify → support path.

**Decision tree:**
```
"Trouble signing in?"
  ◇ Method used originally?
     ├─ Apple/Google → route to that provider's recovery (out of our control) + guidance
     └─ Email → send fresh magic link / OTP
        ◇ Received & verified? → restored | Not received → resend / check spam / try alt email → support
```

**Success path:** Fresh magic link/OTP → verified → access restored, data intact.

**Failure path:** Email inaccessible / provider issue → Help & Support contact with account-identifying details; never a hard dead end.

---

### Flow E3 — Logout

**Purpose:** Let a user sign out (e.g., shared device) safely.

**Entry point:** Settings → Account → Sign out.

**Exit points:** ✔ signed out to a safe state · ✖ cancel.

**Decision tree:**
```
Sign out tapped
  ▸ Confirm ("Sign out? Your data is saved to your account.")
  ◇ Confirm?
     ├─ Yes → clear session tokens; clear/retain local cache per privacy setting; return to a signed-out Today (anonymous) or Welcome
     └─ No  → dismiss
```

**Success path:** Session cleared; sensitive cached data cleared; app returns to a neutral state.

**Failure path:** Sign-out network error → clear locally regardless (never trap the user signed-in); reconcile on next connect.

**[ASSUMPTION]** After logout the app returns to an anonymous Today (not a login wall), preserving the "no auth wall" principle; household features show a "sign in to access" state.

---

### Flow E4 — Delete Account

**Purpose:** Honor data dignity & CCPA (Trust #4; PRD P0 #9) with a clear, reversible-until-confirmed deletion.

**Entry point:** Settings → Privacy & Data → Delete account.

**Exit points:** ✔ account + data deleted · ✖ cancel.

**Decision tree:**
```
Delete account
  ▸ Explain consequences (household impact, streak/history loss, irreversibility)
  ◇ User is household owner with other members?
     ├─ Yes → require transfer of ownership OR explicit "delete household for all" acknowledgment
     └─ No  → continue
  ▸ Re-authenticate / confirm identity
  ▸ Final confirm (typed or explicit toggle) 
  ◇ Confirm?
     ├─ Yes → queue deletion; sign out; show "Your account will be deleted" (grace window per policy)
     └─ No  → cancel
```

**Success path:** Deletion queued/executed per policy; user signed out; confirmation shown.

**Failure paths:** Owner-with-members must resolve ownership first (no orphaned households). Deletion request offline → queued, executed on reconnect; user informed. **[ASSUMPTION]** A short server-side grace window (e.g., account recoverable for X days) exists; surfaced honestly to the user.

---

### Flow E5 — Offline Experience (cross-cutting)

**Purpose:** Keep the core daily loop functional without connectivity (Principle P3/P4 — the habit must not depend on signal).

**Entry point:** Any screen when connectivity drops or is absent.

**Exit points:** ✔ user completes core loop offline; syncs later · ✖ network-only features gracefully blocked.

**Decision tree:**
```
Connectivity lost/absent
  ▸ Persistent, calm offline indicator (not an alarming full-screen error)
  ◇ Feature needs network?
     ├─ No (today's cached panchang, cached ritual text, checklist, streak) → fully usable
     ├─ Audio not pre-cached → text-only fallback + "audio needs internet" note
     └─ Yes (Ask Guru, calendar months not cached, invites, auth) → clear "connect to use" state + retry
  ▸ Actions taken offline (ritual complete, checklist, personal date add) → queued locally (optimistic)
  ◇ Reconnect → background sync → resolve conflicts (client-authoritative for daily completion) → silent success
```

**Success path:** User completes today's ritual offline; streak advances locally; everything syncs on reconnect with no data loss.

**Failure path:** A network-only action attempted offline → queued or clearly blocked with a retry, never a silent failure or crash. Sync conflict → resolved per documented rules (union/longer-streak), user informed only if meaningful.

---

## GROUP F — Monetization (post-retention; never blocks the daily loop)

### Flow F1 — Subscription / Payment

**Purpose:** Convert retained users to paid (ad-free + AI access; family plan) *after* the habit is proven — sequenced post-retention (PRD; MRD §18). Must never intrude on the sacred daily loop (Trust P2, Principle P4).

**Entry point:** Contextual upgrade sheet (e.g., after heavy Ask Guru use, or from Settings → Subscription, or a family-plan prompt from Household) — **never** an interstitial blocking the morning ritual.

**Exit points:** ✔ subscription active · ✖ cancel/failure → user remains on free tier, fully functional.

**Decision tree:**
```
Upgrade entry (contextual, dismissible)
  ▸ Plan selection (Individual / Family) + clear value + honest pricing (no dark patterns)
  ◇ Choose plan → native IAP (App Store / Play Billing)
     ◇ Payment result?
        ├─ Success → entitlement granted (ad-free / AI limits lifted / family seats) → warm confirmation
        ├─ Failure (card declined, etc.) → clear reason + retry / change method (Payment Failure edge, Part 5 §12)
        └─ Cancel → dismiss; remain free; no punishment, no repeated nagging
  ◇ Restore purchases available (reinstall/new device)
```

**Success path:** IAP success → entitlement synced across the household (for family plan) → confirmation → benefits live.

**Failure paths:** Payment failure → actionable error, retry, alternative method; entitlement never granted without confirmed purchase; store/network error → "we'll restore automatically" + Restore Purchases affordance. Subscription state must reconcile with the store as source of truth. **[ASSUMPTION]** v1 uses native IAP only (no external payment); family-plan entitlement propagates to all household members server-side.

---

## 3.15 Per-Flow Engineering Annexes

One annex per flow, in the standardized block defined in §3.0.5. All KPI targets are **[ASSUMPTION]**s proposed by design for engineering/PM ratification (see the consolidated `[PRD FOLLOW-UP] F-5`); they align with the PRD's own metric targets where those exist (activation, D7/D30, 40% daily completion, 25% Ask Guru WAU, 70% onboarding completion).

---

### Annex A1 — First Launch / Onboarding

**Success Metrics** · Primary KPI: **Onboarding Completion Rate** — Target **≥ 70%** (PRD leading indicator). Secondary KPI: **Activation Rate** (`EVT_011`) — Target **≥ 55%** of installs in first session. Success Criteria: user reaches Today with location set, household created, first panchang viewed, notifications resolved; median time-to-first-panchang **< 90 s**.
**Friction** · Cognitive Load: **Medium** (multi-step, but one decision per screen). Est. Duration: **60–120 s**. Likely Drop-off Step: **Location permission (1.2)** and **Notification permission (1.7)**. UX Risk: **Medium**.
**Backend** · `GET /config/onboarding`, `POST /household`, `GET /traditions`, `POST /profile`, `GET /panchang/today?lat&lng&tz`, `POST /notifications/schedule`, `POST /analytics/activation`.
**AI** · None.
**Analytics** · EVT_002, EVT_003, EVT_004, EVT_005, EVT_006, EVT_007, EVT_008, EVT_009, EVT_010, EVT_011.
**Errors** · ERR_LOCATION_DENIED, ERR_GPS_DISABLED, ERR_NOTIF_DENIED, ERR_OFFLINE, ERR_PANCHANG_UNAVAILABLE.
**Accessibility Checklist** · ✓ VoiceOver/TalkBack labels on every step & permission CTA · ✓ Dynamic Type to OS max, no clipped steps · ✓ ≥44×44pt / 48×48dp targets · ✓ Screen-reader focus order = visual order · ✓ Permission rationale readable by SR before OS dialog · ✓ WCAG AA contrast (`color.text.*` on `color.surface.*`).
**Performance** · Per-step transition `< 300 ms`; first panchang reveal `< 2 s` (network) / `< 500 ms` (estimated-cached).

---

### Annex A2 — Returning User (warm open)

**Success Metrics** · Primary KPI: **Time-to-Today (TTV)** — Target **< 500 ms** cached render. Secondary KPI: **D1/D7 Return Rate** — Target **D7 ≥ 30%** (PRD). Success Criteria: cached Today painted before network; correct day-state; streak/grace evaluated silently.
**Friction** · Cognitive Load: **Low**. Est. Duration: **< 5 s to value**. Likely Drop-off Step: none (goal is zero-friction); risk is a slow/blank first paint. UX Risk: **Low**.
**Backend** · `GET /session/validate`, `GET /panchang/today`, `GET /ritual/today`, `GET /streak`, `GET /content/rotating`.
**AI** · None.
**Analytics** · EVT_001, EVT_012, EVT_014, EVT_053 (if offline).
**Errors** · ERR_AUTH_EXPIRED, ERR_OFFLINE, ERR_NETWORK_TIMEOUT, ERR_PANCHANG_UNAVAILABLE.
**Accessibility Checklist** · ✓ Cached content announced on load · ✓ Reduced-Motion honored on refresh transitions · ✓ No motion-only status cues · ✓ WCAG AA.
**Performance** · Cached Today `< 500 ms`; background refresh `< 2 s`; expired-session silent refresh non-blocking.

---

### Annex A3 — Profile / Household Creation

**Success Metrics** · Primary KPI: **Household Creation Rate** (`EVT_006`) — Target **≥ 80%** of onboarders. Secondary KPI: **Multi-member Households** — Target **≥ 25%** add ≥2 members within 7 days. Success Criteria: household saved with roles + depth; no input loss on error.
**Friction** · Cognitive Load: **Medium** (roles/depth are new concepts). Est. Duration: **30–60 s**. Likely Drop-off Step: **Add-member detail** (role/depth choice). UX Risk: **Medium**.
**Backend** · `POST /household`, `POST /household/{id}/members`, `PATCH /household/member/{id}`, `GET /household/{id}`.
**AI** · None.
**Analytics** · EVT_006, EVT_007.
**Errors** · ERR_NETWORK_TIMEOUT, ERR_OFFLINE, ERR_UNKNOWN.
**Accessibility Checklist** · ✓ Role & depth pickers labeled and SR-operable · ✓ Error messaging announced, tied to field · ✓ Dynamic Type on member list · ✓ ≥44/48 targets · ✓ WCAG AA.
**Performance** · Save round-trip optimistic `< 100 ms` ack; confirmed `< 2 s`.

---

### Annex A4 — Notification Permission

**Success Metrics** · Primary KPI: **Notification Opt-in Rate** (`EVT_010` grant) — Target **≥ 60%** (post-value priming). Secondary KPI: **Morning Reminder → Open Rate** — Target **≥ 35%**. Success Criteria: OS dialog only shown after in-app "Yes"; reminders scheduled at chosen time.
**Friction** · Cognitive Load: **Low**. Est. Duration: **10–20 s**. Likely Drop-off Step: **OS system dialog**. UX Risk: **Medium** (one-shot iOS prompt).
**Backend** · `POST /notifications/schedule`, `GET /notifications/preferences`, `POST /notifications/token`.
**AI** · None.
**Analytics** · EVT_010, EVT_040, EVT_041.
**Errors** · ERR_NOTIF_DENIED.
**Accessibility Checklist** · ✓ Priming screen SR-readable before OS dialog · ✓ CTAs labeled ("Yes, remind me" / "Not now") · ✓ WCAG AA · ✓ Targets ≥44/48.
**Performance** · Priming → OS dialog `< 300 ms`.

---

### Annex A5 — Location Permission

**Success Metrics** · Primary KPI: **Location Resolved Rate** (GPS or manual) — Target **≥ 90%**. Secondary KPI: **Manual-picker Fallback Success** — Target **≥ 95%** of deniers set a city. Success Criteria: Today shows "Panchang for {city, tz}".
**Friction** · Cognitive Load: **Low**. Est. Duration: **10–25 s**. Likely Drop-off Step: **OS location dialog** (deny → manual). UX Risk: **Low–Medium**.
**Backend** · `GET /geo/reverse?lat&lng`, `GET /geo/city-search?q`, `GET /panchang/today`.
**AI** · None.
**Analytics** · EVT_004.
**Errors** · ERR_LOCATION_DENIED, ERR_GPS_DISABLED, ERR_OFFLINE.
**Accessibility Checklist** · ✓ City search field labeled & SR-operable · ✓ Rationale readable pre-dialog · ✓ Results list navigable · ✓ WCAG AA.
**Performance** · Reverse-geocode `< 1.5 s`; city search results `< 1 s`.

---

### Annex B1 — Morning Ritual (core loop)

**Success Metrics** · Primary KPI: **Morning Ritual Completion Rate** (`EVT_017`/opens) — Target **≥ 70%** of daily openers; contributes to **North Star: Weekly Household Ritual Completions**. Secondary KPI: **Avg. Ritual Completion Time** — Target **< 90 s**. Success Criteria: Begin→steps→complete→reward→streak advance; resumable if interrupted; works offline for cached content.
**Friction** · Cognitive Load: **Low**. Est. Duration: **30–120 s**. Likely Drop-off Step: **Intro (4.1) → first step** (audio load or perceived length). UX Risk: **Low**.
**Backend** · `GET /ritual/today?tradition&depth`, `GET /ritual/{id}/audio` (or CDN URL), `POST /ritual/complete`, `POST /streak/advance`, `GET /streak`.
**AI** · Optional only via 4.4 "Ask Guru about this" → see Annex D1 (not required for the core loop).
**Analytics** · EVT_015, EVT_016, EVT_017, EVT_018, EVT_020, EVT_021.
**Errors** · ERR_AUDIO_UNAVAILABLE, ERR_OFFLINE, ERR_SYNC_CONFLICT, ERR_NETWORK_TIMEOUT.
**Accessibility Checklist** · ✓ Audio narration + full text parity (deaf/HoH) · ✓ SR does not collide with ritual audio (audio-focus mgmt) · ✓ Progress ring has text/`accessibilityValue` equivalent · ✓ Reduced-Motion → cross-fade for completion (`motion.reduced.crossfade`) · ✓ Pause/resume SR-operable · ✓ Targets ≥44/48 · ✓ WCAG AA.
**Performance** · "Begin" → first step `< 400 ms`; audio start (cached) `< 500 ms`; completion animation `≤ 1.2 s`; completion ack `< 100 ms`.

---

### Annex B2 — Daily Checklist

**Success Metrics** · Primary KPI: **Daily Checklist Completion** (≥1 item) — Target **≥ 40% of DAU** (PRD Goal 2). Secondary KPI: **Items-per-active-user/day** — Target **≥ 1.5**. Success Criteria: inline toggle with instant feedback; offline-safe.
**Friction** · Cognitive Load: **Low**. Est. Duration: **5–20 s**. Likely Drop-off Step: none material; risk is unclear item purpose. UX Risk: **Low**.
**Backend** · `GET /checklist/today`, `POST /checklist/{item}/complete`.
**AI** · None.
**Analytics** · EVT_019.
**Errors** · ERR_OFFLINE, ERR_SYNC_CONFLICT.
**Accessibility Checklist** · ✓ Checkboxes labeled with state (`accessibilityState.checked`) · ✓ Toggle change announced · ✓ Not color-only (check icon + label) · ✓ WCAG AA.
**Performance** · Toggle ack `< 100 ms` (optimistic).

---

### Annex B3 — Panchang Detail

**Success Metrics** · Primary KPI: **Panchang Detail View Rate** (`EVT_013`) — Target **≥ 25% of WAU** (depth engagement). Secondary KPI: **"How we calculate this" tap rate** — Target **≥ 5%** (trust curiosity). Success Criteria: full elements render from cache; per-element graceful degradation.
**Friction** · Cognitive Load: **Medium** (dense data). Est. Duration: **15–45 s**. Likely Drop-off Step: overwhelm on first view. UX Risk: **Low–Medium**.
**Backend** · `GET /panchang/today` (full), `GET /panchang/detail/{date}`, `GET /content/glossary/{term}`.
**AI** · Optional "What is a tithi?" may deep-link to Ask Guru (Annex D1).
**Analytics** · EVT_013.
**Errors** · ERR_PANCHANG_UNAVAILABLE, ERR_OFFLINE.
**Accessibility Checklist** · ✓ Muhurta states carry text label (not color-only, `color`-independent) · ✓ Grouped elements have SR headings · ✓ Glossary affordances labeled · ✓ Dynamic Type on dense tables · ✓ WCAG AA.
**Performance** · Cached render `< 300 ms`.

---

### Annex C1 — Festival Reminder & Detail

**Success Metrics** · Primary KPI: **Festival Detail View Rate** (from reminder, `EVT_023`) — Target **≥ 45% of festival-reminder opens**. Secondary KPI: **Festival → related-ritual start** — Target **≥ 20%**. Success Criteria: regional name/date correct; deep-link resolves with Calendar back-stack.
**Friction** · Cognitive Load: **Low–Medium**. Est. Duration: **20–60 s**. Likely Drop-off Step: content load / long deep-dive. UX Risk: **Low**.
**Backend** · `GET /festival/{id}?tradition&depth`, `GET /ritual/by-festival/{id}`, `POST /reminders` (add to my dates).
**AI** · "Ask Guru about {festival}" → Annex D1 (pre-seeded).
**Analytics** · EVT_023, EVT_040, EVT_041.
**Errors** · ERR_FESTIVAL_CONFLICT, ERR_CALENDAR_ERROR, ERR_OFFLINE, ERR_NETWORK_TIMEOUT.
**Accessibility Checklist** · ✓ Story/how-to readable at max Dynamic Type · ✓ Quick/Deep toggle SR-operable · ✓ "Observe now" CTA labeled · ✓ WCAG AA.
**Performance** · Detail render `< 2 s` (network) / `< 400 ms` (cached).

---

### Annex C2 — Personal & Family Dates (Shraddha)

**Success Metrics** · Primary KPI: **Personal Date Added Rate** (`EVT_025`) — Target **≥ 20% of MAU** add ≥1 within 30 days. Secondary KPI: **Auto-recurrence Accuracy** — Target **100%** correct next-occurrence, **0** annual re-entries. Success Criteria: tithi engine computes recurrence; grief-aware tone (no streak/promo).
**Friction** · Cognitive Load: **Medium** (tithi vs. Gregorian choice). Est. Duration: **30–60 s**. Likely Drop-off Step: **Date-basis choice (tithi vs. Gregorian)**. UX Risk: **Medium** (emotional + computational).
**Backend** · `POST /personal-dates`, `PATCH /personal-dates/{id}`, `DELETE /personal-dates/{id}`, `GET /tithi/next-occurrence?basis`, `POST /notifications/schedule`.
**AI** · None.
**Analytics** · EVT_025, EVT_026.
**Errors** · ERR_TITHI_AMBIGUOUS, ERR_OFFLINE, ERR_NETWORK_TIMEOUT.
**Accessibility Checklist** · ✓ Calm/quiet visual treatment retains WCAG AA contrast · ✓ Tithi picker fully SR-operable · ✓ Sensitive copy screen-reader-appropriate (no jarring terms) · ✓ Targets ≥44/48 · ✓ No motion-only cues.
**Performance** · Next-occurrence compute `< 1 s`; save ack `< 100 ms`.

---

### Annex C3 — Calendar Browsing & Regional Switch

**Success Metrics** · Primary KPI: **Calendar Engagement** (`EVT_022`) — Target **≥ 30% of WAU**. Secondary KPI: **Regional Switch Success** — Target **≥ 98%** re-render without error. Success Criteria: month markers correct per tradition; smooth month nav.
**Friction** · Cognitive Load: **Low–Medium**. Est. Duration: **15–45 s**. Likely Drop-off Step: month with no cached data (load). UX Risk: **Low**.
**Backend** · `GET /calendar/{yyyy-mm}?tradition`, `GET /personal-dates`, `POST /profile/tradition`.
**AI** · None.
**Analytics** · EVT_022, EVT_023, EVT_024.
**Errors** · ERR_CALENDAR_ERROR, ERR_OFFLINE, ERR_NETWORK_TIMEOUT.
**Accessibility Checklist** · ✓ Marker types distinguished by icon+label, not color-only · ✓ Day cells SR-labeled with events · ✓ Month swipe has button equivalents · ✓ WCAG AA.
**Performance** · Cached month `< 400 ms`; fetched month `< 2 s`.

---

### Annex D1 — Ask Guru (RAG-grounded AI)

**Success Metrics** · Primary KPI: **Ask Guru WAU Engagement** (`EVT_029`) — Target **≥ 25% of WAU** (PRD Goal 3). Secondary KPI: **Answer Helpfulness** (`EVT_032` positive) — Target **≥ 75%**; **Refusal Accuracy** — Target **≥ 95%** (correct honest declines vs. false refusals). Success Criteria: grounded answer with visible source, or honest decline when confidence low; no fabricated specifics.
**Friction** · Cognitive Load: **Low–Medium**. Est. Duration: **20–90 s/query**. Likely Drop-off Step: **wait for first token** / an unhelpful decline. UX Risk: **Medium–High** (trust-critical).
**Backend** · `POST /ask` (query→retrieval→generation orchestration), `GET /ask/history`, `GET /ask/conversation/{id}`, `POST /ask/feedback`, `GET /ask/suggestions?context`.
**AI Dependencies** · **Required LLM:** yes (vendor TBD — open PRD question). **Vector Search:** yes, over reviewed content library. **Embeddings:** yes (content + query). **Prompt Builder:** yes (system + retrieved-context assembly, scope guardrails). **RAG:** **required** (PRD P0 #4). **Streaming:** yes (first token `< 2 s`). **Conversation History:** yes (in-session + stored list); **no cross-session long-term memory** (AI Non-Goal). **Fallback Behaviour:** on low retrieval confidence → honest "I don't have verified information" + rephrase/related-topic/ask-a-temple options; on timeout/error → retry, never fabricate. **Safety Filter:** yes (out-of-scope: astrology/medical/political/etc. → gentle refusal). **Source Citation:** yes (show retrieved source). **Confidence Threshold:** yes (below → decline; value tunable server-side, `[PRD FOLLOW-UP] F-6`).
**Analytics** · EVT_027, EVT_028, EVT_029, EVT_030, EVT_031, EVT_032, EVT_033, EVT_034, EVT_035.
**Errors** · ERR_AI_TIMEOUT, ERR_AI_ERROR, ERR_RAG_EMPTY, ERR_RAG_LOW_CONFIDENCE, ERR_OFFLINE.
**Accessibility Checklist** · ✓ Streaming text announced politely (SR live region, not spammy) · ✓ Typing indicator has SR-text equivalent · ✓ Source links labeled · ✓ Suggested-question chips SR-operable · ✓ Reduced-Motion → no bouncing dots · ✓ WCAG AA.
**Performance** · First streamed token `< 2 s`; typical short answer complete `< 6 s`; suggestions render `< 500 ms`.

---

### Annex D2 — Household Invitation & Family Sharing

**Success Metrics** · Primary KPI: **Invite Accept Rate** (`EVT_037`/`EVT_036`) — Target **≥ 40%**. Secondary KPI: **Invited-member 7-day retention** — Target **≥ D7 30%**. Success Criteria: deferred-deep-link install auto-joins; expired token → graceful re-request.
**Friction** · Cognitive Load: **Low**. Est. Duration: inviter **15–30 s**; invitee **1–3 min** (incl. install). Likely Drop-off Step: **invitee install** (store bounce). UX Risk: **Medium**.
**Backend** · `POST /household/{id}/invite`, `GET /invite/{token}`, `POST /invite/{token}/accept`, `GET /household/{id}`.
**AI** · None.
**Analytics** · EVT_036, EVT_037.
**Errors** · ERR_INVITE_EXPIRED, ERR_OFFLINE, ERR_NETWORK_TIMEOUT, ERR_AUTH_FAILED.
**Accessibility Checklist** · ✓ Share sheet reachable via SR · ✓ Accept screen states household + inviter clearly · ✓ CTAs labeled · ✓ WCAG AA.
**Performance** · Invite generation `< 1 s`; accept round-trip `< 2 s`.

---

### Annex D3 — Referral Journey

**Success Metrics** · Primary KPI: **Referral Activation Rate** (`EVT_039`/`EVT_038`) — Target **≥ 15%**. Secondary KPI: **Viral Coefficient (K)** — Target **≥ 0.3** (once greeting-card ships, post-v1). Success Criteria: reward (when live) granted on referee **activation**, not install; no double-count.
**Friction** · Cognitive Load: **Low**. Est. Duration: **10–20 s** to share. Likely Drop-off Step: **referred-user install**. UX Risk: **Low**.
**Backend** · `POST /referral/link`, `GET /referral/{code}`, `POST /referral/{code}/attribute`, `POST /referral/reward`.
**AI** · None.
**Analytics** · EVT_038, EVT_039.
**Errors** · ERR_INVITE_EXPIRED, ERR_OFFLINE.
**Accessibility Checklist** · ✓ Share entry labeled · ✓ Reward state announced · ✓ WCAG AA.
**Performance** · Link generation `< 1 s`.

---

### Annex D4 — Push Notification Journey (cross-cutting)

**Success Metrics** · Primary KPI: **Push Open Rate** (`EVT_041`/`EVT_040`) — Target **≥ 30%** (morning ≥35%, festival ≥40%). Secondary KPI: **Notification-driven DAU share** — Target **≥ 40%**. Success Criteria: correct deep-link + valid back-stack; quiet-hours respected; type attributed.
**Friction** · Cognitive Load: **Low**. Est. Duration: **< 5 s** (tap→screen). Likely Drop-off Step: content unavailable → fallback surface. UX Risk: **Low–Medium**.
**Backend** · `POST /notifications/token`, `GET /notifications/preferences`, `POST /notifications/schedule`, `GET /deeplink/resolve/{payload}`.
**AI** · None (personalization rules in Part 4 §8; not LLM-based in v1).
**Analytics** · EVT_040, EVT_041 (with `notification_type`).
**Errors** · ERR_NOTIF_DENIED, ERR_OFFLINE, ERR_NETWORK_TIMEOUT, ERR_AUTH_EXPIRED.
**Accessibility Checklist** · ✓ Notification copy meaningful out of context · ✓ Landing screen focus set for SR · ✓ WCAG AA on destination.
**Performance** · Tap → destination interactive `< 2 s` (cold) / `< 500 ms` (warm).

---

### Annex D5 — Win-back Journey

**Success Metrics** · Primary KPI: **Win-back Return Rate** (`EVT_043`/`EVT_042`) — Target **≥ 12%** per campaign. Secondary KPI: **Reactivated D7 retention** — Target **≥ 25%**. Success Criteria: value-led (festival/personal-date) hooks; cadence backs off; ≤1 win-back/3 days.
**Friction** · Cognitive Load: **Low**. Est. Duration: **< 5 s**. Likely Drop-off Step: ignore (no open). UX Risk: **Low** (over-messaging risk mitigated by cap).
**Backend** · `GET /segments/lapsed`, `POST /winback/dispatch`, `GET /festival/upcoming`, `GET /personal-dates/upcoming`.
**AI** · None in v1 (content templated; optional LLM personalization is a future consideration, not scoped).
**Analytics** · EVT_042, EVT_043.
**Errors** · ERR_NOTIF_DENIED, ERR_OFFLINE.
**Accessibility Checklist** · ✓ Warm, non-guilt copy SR-appropriate · ✓ Landing = welcome-back state, focus set · ✓ WCAG AA.
**Performance** · Landing render per Annex A2 budgets.

---

### Annex E1 — Authentication (deferred sign-in)

**Success Metrics** · Primary KPI: **Auth Completion Rate** (`EVT_045`/`EVT_044`) — Target **≥ 85%** of those who start. Secondary KPI: **Anon→Auth Merge Success** — Target **≥ 99%** with zero data loss. Success Criteria: originating context resumed post-auth; conflicts resolved by union/longer-streak with user informed.
**Friction** · Cognitive Load: **Low**. Est. Duration: **15–40 s**. Likely Drop-off Step: **email OTP/link verification**. UX Risk: **Medium**.
**Backend** · `POST /auth/apple`, `POST /auth/google`, `POST /auth/email/start`, `POST /auth/email/verify`, `POST /auth/merge`, `GET /session/validate`.
**AI** · None.
**Analytics** · EVT_044, EVT_045.
**Errors** · ERR_AUTH_FAILED, ERR_AUTH_MERGE_CONFLICT, ERR_NETWORK_TIMEOUT, ERR_OFFLINE.
**Accessibility Checklist** · ✓ OAuth buttons labeled with provider · ✓ OTP field SR-operable, resend countdown announced · ✓ Errors tied to fields · ✓ WCAG AA.
**Performance** · OAuth round-trip `< 2 s`; OTP verify `< 1.5 s`.

---

### Annex E2 — Account Recovery

**Success Metrics** · Primary KPI: **Recovery Success Rate** (`EVT_046`→auth) — Target **≥ 90%**. Secondary KPI: **Time-to-recover** — Target **< 2 min** median. Success Criteria: fresh link/OTP restores access, data intact; never a dead end.
**Friction** · Cognitive Load: **Low–Medium**. Est. Duration: **30 s–2 min**. Likely Drop-off Step: **email not received** (spam/wrong address). UX Risk: **Medium**.
**Backend** · `POST /auth/email/start` (resend), `POST /auth/email/verify`, `POST /support/ticket`.
**AI** · None.
**Analytics** · EVT_046, EVT_045.
**Errors** · ERR_AUTH_FAILED, ERR_NETWORK_TIMEOUT, ERR_OFFLINE.
**Accessibility Checklist** · ✓ Resend / alternate-email actions labeled · ✓ Countdown announced · ✓ Support path SR-reachable · ✓ WCAG AA.
**Performance** · Resend dispatch `< 1 s`.

---

### Annex E3 — Logout

**Success Metrics** · Primary KPI: **Logout Success (no data loss)** — Target **100%**. Secondary KPI: **Post-logout crash/dead-end rate** — Target **0%**. Success Criteria: session cleared; returns to anonymous Today; sensitive cache cleared.
**Friction** · Cognitive Load: **Low**. Est. Duration: **5–10 s**. Likely Drop-off Step: none. UX Risk: **Low**.
**Backend** · `POST /auth/logout`, `POST /notifications/token` (deregister).
**AI** · None.
**Analytics** · EVT_047.
**Errors** · ERR_NETWORK_TIMEOUT (clear locally regardless), ERR_OFFLINE.
**Accessibility Checklist** · ✓ Confirm dialog SR-operable · ✓ Post-logout focus set to a meaningful element · ✓ WCAG AA.
**Performance** · Local clear `< 200 ms`.

---

### Annex E4 — Delete Account

**Success Metrics** · Primary KPI: **Deletion Completion Rate** (of those confirming) — Target **100%** honored. Secondary KPI: **Accidental-deletion reversal within grace** — tracked, no target. Success Criteria: household ownership resolved first; re-auth required; honest grace-window messaging.
**Friction** · Cognitive Load: **Medium** (intentional friction for safety). Est. Duration: **30–60 s**. Likely Drop-off Step: **re-auth / ownership transfer** (by design). UX Risk: **Low** (deliberate friction).
**Backend** · `POST /account/delete/request`, `POST /household/{id}/transfer-owner`, `POST /auth/reauthenticate`, `GET /account/delete/status`.
**AI** · None.
**Analytics** · EVT_048.
**Errors** · ERR_AUTH_EXPIRED, ERR_NETWORK_TIMEOUT, ERR_OFFLINE, ERR_UNKNOWN.
**Accessibility Checklist** · ✓ Consequences copy readable at max Dynamic Type · ✓ Destructive confirm clearly labeled & SR-distinct · ✓ Ownership-transfer picker SR-operable · ✓ WCAG AA.
**Performance** · Request queue ack `< 2 s`.

---

### Annex E5 — Offline Experience (cross-cutting)

**Success Metrics** · Primary KPI: **Offline Core-loop Completion** — Target **≥ 95%** of core-loop attempts succeed offline. Secondary KPI: **Sync Success (no data loss)** — Target **≥ 99.5%**. Success Criteria: cached panchang/ritual/checklist usable; offline actions queue and reconcile; no crashes.
**Friction** · Cognitive Load: **Low**. Est. Duration: n/a (ambient). Likely Drop-off Step: attempting a network-only feature. UX Risk: **Medium**.
**Backend** · Local cache + queue; `POST /sync` (batch reconcile), `GET /sync/state`.
**AI** · Ask Guru unavailable offline (cached history readable).
**Analytics** · EVT_053, EVT_054 (with `error_code`).
**Errors** · ERR_OFFLINE, ERR_POOR_NETWORK, ERR_SYNC_CONFLICT, ERR_AUDIO_UNAVAILABLE.
**Accessibility Checklist** · ✓ Offline indicator has SR-text, not color/icon-only · ✓ "Connect to use" states clearly announced · ✓ Reduced-Motion on retry spinners · ✓ WCAG AA.
**Performance** · Offline UI feedback `< 100 ms`; reconnect sync non-blocking/background.

---

### Annex F1 — Subscription / Payment

**Success Metrics** · Primary KPI: **Free→Paid Conversion** (`EVT_051` success) — Target **3–5% within 6 months** (PRD). Secondary KPI: **Paywall Dismiss-without-churn** — Target: dismissers retain **≥ D7 30%** (proves non-intrusiveness). Success Criteria: never blocks the daily loop; entitlement synced (family plan → all members); store is source of truth.
**Friction** · Cognitive Load: **Medium**. Est. Duration: **30–90 s**. Likely Drop-off Step: **plan selection → native IAP sheet**. UX Risk: **Medium** (trust-sensitive; no dark patterns).
**Backend** · `GET /subscription/plans`, `POST /subscription/purchase/validate` (server receipt validation), `GET /subscription/entitlement`, `POST /subscription/restore`, `POST /household/{id}/entitlement`.
**AI** · None.
**Analytics** · EVT_049, EVT_050, EVT_051, EVT_052.
**Errors** · ERR_PAYMENT_FAILED, ERR_SUBSCRIPTION_INVALID, ERR_NETWORK_TIMEOUT, ERR_OFFLINE.
**Accessibility Checklist** · ✓ Plan cards SR-labeled with price/terms · ✓ Native IAP sheet inherits OS accessibility · ✓ Restore Purchases labeled · ✓ No color-only "best value" cue · ✓ WCAG AA.
**Performance** · Plans render `< 1 s`; receipt validation `< 2 s`.

---

## 3.x Flow coverage matrix (traceability)

Every flow named in the PRD prompt, mapped to this document:

| PRD-named flow | This doc |
|---|---|
| First Launch | A1 |
| Returning User | A2 |
| Morning Ritual | B1 |
| Festival Reminder | C1 |
| Ask Guru | D1 |
| Subscription | F1 |
| Household Invitation | D2 |
| Profile Creation | A3 |
| Notification Permission | A4 |
| Location Permission | A5 |
| Offline Experience | E5 |
| Account Recovery | E2 |
| Delete Account | E4 |
| Logout | E3 |
| Payment | F1 |
| Family Sharing | D2 / F1 (family plan) |
| Deep Linking | D4 + §2.4 entry table |
| Push Notification Journey | D4 |
| Referral Journey | D3 |
| Win-back Journey | D5 |
| *(added)* Personal/Family Dates (Shraddha) | C2 |
| *(added)* Daily Checklist | B2 |
| *(added)* Panchang Detail | B3 |
| *(added)* Calendar Browsing / Regional Switch | C3 |
| *(added)* Authentication (deferred) | E1 |

---

## 3.16 Out of Scope for MVP (v1)

These features are **intentionally excluded from v1** to protect the calm daily loop, the solo-founder timeline, and trust. This section **does not change scope** — it restates and consolidates exclusions already established in the PRD (Non-Goals) and MRD, so no engineer or AI coding agent infers them as gaps to fill. Items marked *(PRD Non-Goal)* are named exclusions in `PanchangPal-PRD-v2.md`; items marked *(sequenced)* exist on a later roadmap horizon.

| Excluded from v1 | Basis |
|---|---|
| Astrology / Kundli / horoscope / birth-chart matching | *(PRD Non-Goal)* — never in scope |
| Vision AI (photograph-your-altar, image analysis) | *(PRD Non-Goal)* — cultural-sensitivity risk, unvalidated demand |
| Voice AI / voice assistant | *(PRD Non-Goal → P2)* — real accessibility value, deferred |
| AI conversation long-term memory (cross-session) | *(PRD Non-Goal)* — privacy/retention complexity, no proven benefit |
| Agentic / autonomous AI workflows | *(PRD Non-Goal)* — inappropriate risk pre-PMF |
| Full content recommendation engine / knowledge graph | *(PRD Non-Goal)* — premature at v1 library size |
| Community feed / social network / congregation-level social | *(sequenced)* — network-effect opportunity, not v1 |
| Live temple streaming / e-darshan / live puja | *(PRD Non-Goal)* — transactional, not daily-guidance |
| Temple booking / pandit marketplace | *(sequenced, 12–24 mo)* — highest-ceiling option, not v1 (MRD §18) |
| Video calls | Not in scope at any named horizon |
| User-generated content (family legacy recordings, UGC) | *(sequenced, v1.1+)* — needs moderation design first |
| E-commerce / owned inventory (puja kits, prasad) | *(sequenced)* — affiliate-only if ever, not v1 |
| Jain Panchang module | *(sequenced, v1.1)* — deliberate fast-follow, not v1 |
| Multi-language UI | *(P1, data-gated)* — tied to real signup data, not assumed |
| Festival greeting-card sharing | *(P1, post-launch)* — first festival cycle |
| Lifecycle email | *(P1, 6-mo)* — v1 is notification-only |
| Ad-supported free tier | *(under exploration)* — not a v1 commitment |
| UK / Canada / Netherlands / Germany markets | *(sequenced)* — v1 is US + Australia + New Zealand |

**Design implication:** no v1 screen, empty state, or navigation affordance should hint at, tease, or leave a placeholder for these. Where a natural adjacency exists (e.g., a future marketplace), the v1 design simply omits it cleanly rather than showing "coming soon."

---

## 3.17 Global Screen Documentation Template (MANDATORY for Part 2)

Every screen in **Part 2 — Screen Inventory** must be documented with the exact template below, in this field order. Fields reference the registries in §3.0 (analytics `EVT_xxx`, errors `ERR_xxx`, tokens, performance budgets). If a field does not apply to a screen, it is written as **"N/A — {reason}"**, never omitted. This guarantees uniformity for Figma designers and AI coding agents.

```
### [Screen ID] — [Screen Name]

Screen Name:        Human-readable name
Screen ID:          Stable ID (e.g., SCR_TODAY_HOME) — referenced by flows & analytics
Purpose:            One-sentence reason this screen exists
Business Goal:      What the business gets (tie to a PRD goal / North Star)
User Goal:          What the user accomplishes (tie to a JTBD)

Entry Points:       Every route in (flows, deep links panchangpal://…, tabs)
Exit Points:        Every route out (✔ success / ✖ abort destinations)

Components:         Ordered list of components used (each referencing Part 3 §5 IDs)
Primary CTA:        The single primary action (label + destination/effect)
Secondary CTA(s):   Lower-emphasis actions
Navigation:         Tab context, back behavior, and stack parent

Inputs:             User inputs / fields (with types)
Outputs:            Data rendered / produced
Validation:         Rules + which ERR_xxx each violation maps to

States:
  • Default:        Populated resting state
  • Loading:        In-flight (spinner/progress) — perf budget ref
  • Skeleton:       Structural placeholder before data
  • Empty:          No data yet (copy + primary action; Part 5 §13)
  • Offline:        ERR_OFFLINE treatment (what still works)
  • Error:          Which ERR_xxx can appear + recovery
  • Success:        Post-action confirmation state

Accessibility:      Per-screen checklist (VoiceOver/TalkBack labels, Dynamic Type,
                    focus order, touch targets ≥44/48, contrast/WCAG AA,
                    reduced-motion, color-independence)
Analytics Events:   EVT_xxx fired on this screen + key properties
Performance Budget: Target(s) from §3.0.4 (or a justified override)
Backend Dependencies: Required APIs consumed by this screen
Design Tokens:      Key token references (color.*, typography.*, spacing.*, radius.*, motion.*)
Acceptance Criteria: Given/When/Then, testable, QA-ready
Open Questions:     Unresolved items / [PRD FOLLOW-UP] refs (or "None")
```

**Template rules:** (1) `Screen ID` is stable and used everywhere the screen is referenced. (2) All eight states are addressed explicitly (an "N/A — {reason}" is a valid answer, silence is not). (3) Analytics and errors cite §3.0 IDs — no new ad-hoc names in Part 2 without adding them to the registries here. (4) Acceptance Criteria are written as testable Given/When/Then statements.

---

# Part 1 — UX Change Log

Every `UX Improvement` in Part 1, with original requirement, proposed change, rationale, expected user impact, implementation effort, and whether the PRD should be updated. **None of these change product scope, business rules, or functional requirements** — they are UX/IA/interaction improvements only. Items that *would* touch scope/rules are listed separately as `[PRD FOLLOW-UP]` below.

| # | PRD original requirement | Proposed UX change | Rationale | Expected user impact | Impl. effort | Update PRD? |
|---|---|---|---|---|---|---|
| UX-1 | IA example lists Home, Today's Panchang, Prayer, Ask Guru, Calendar, Profile, Settings, Subscription, Household as peer nodes; separately mandates "3–4 tab items" | **4-tab bottom nav** (Today / Calendar / Ask Guru / You); Prayer, Panchang detail, Checklist, Streak, Settings, Subscription, Household nested below | The example was a feature list, not a nav model; PRD's own "3–4 tab" rule governs. Protects Principle P1 (Calm). | Faster orientation, less cognitive load, sacred daily loop stays 1 tap away | Low | Yes — replace IA example with this hierarchy |
| UX-2 | IA example places Authentication immediately after Onboarding (implies sign-in wall before value) | **Defer auth**: onboarding runs on an anonymous local profile to the value moment; sign-in requested only for household/cross-device; anonymous→auth merge | Pre-value sign-in walls are the top onboarding drop-off; aligns with PRD's "value first" onboarding revision and household-based accounts | Higher onboarding completion & activation rate | Med (needs anon→auth identity merge on backend) | Yes — clarify auth is deferred, not a gate. *Note: backend merge is a functional need → see PRD FOLLOW-UP F-1* |
| UX-3 | Streak & daily checklist gamification (P0 #5) | **Streak presented as a gentle companion metric**, never the largest element on any screen; completion is always the hero | Over-weighting scorekeeping contradicts the emotional JTBD and risks streak-driven churn (Risk §5) | Lower anxiety, healthier long-term retention | Low | Optional — clarify intent, not scope |
| UX-4 | "Defer the notification-permission request until after the user has seen today's Panchang" | Add an **in-app priming screen before the OS dialog**; "Not now" never triggers the one-shot OS prompt | Preserves the single iOS system-prompt opportunity; standard best practice; materially raises opt-in | Higher notification opt-in (a leading metric) | Low | Optional — implementation detail |
| UX-5 | Panchang accuracy is an internal quality investment (Risk §1) | **Surface accuracy visibly**: "Panchang for {city, tz}" header + "How we calculate this" note | Turns an invisible investment into visible trust — the actual moat (MRD §10) | Increased trust & perceived accuracy | Low | Optional |
| UX-6 | Ask Guru reachable as a feature/tab | **Contextual "Ask about this"** entry points deep-linking into Ask Guru pre-seeded from ritual/festival/panchang | Multiplies AI engagement (Goal 3: 25% WAU) and situates trust where questions arise | More AI adoption, more relevant questions | Low–Med | Optional |
| UX-7 | Shraddha/personal-date tracking (P0 #7); streak gamification (P0 #5) | **Grief-aware treatment** for personal dates — no streak overlay, no promo, muted palette, calm tone | The feature touches loss; applying gamification would be culturally and emotionally wrong | Emotional safety, trust, cultural credibility | Low | Yes — note personal-date surfaces are exempt from gamification |

### `[PRD FOLLOW-UP]` — items that touch scope / business rules / functional requirements (not changed here)
| # | Observation | Why it's the PRD's call |
|---|---|---|
| F-1 | Anonymous→authenticated **identity merge** and conflict resolution (union / longer-streak) is a functional/data-model requirement implied by deferred auth (UX-2) | Data model & merge rules are functional requirements, not UX patterns |
| F-2 | **One active household per user** in v1 (switch-with-confirmation) — assumed here (A6) but is a business rule | Membership cardinality is a business rule |
| F-3 | **Account-deletion grace/recovery window** length (A11) and household-ownership-transfer requirement | Data retention & ownership are policy/business rules |
| F-4 | **Family-plan entitlement propagation** to all household members (A12) | Billing/entitlement logic is a functional requirement |
| F-5 | **Ratify KPI target values** proposed across the §3.15 annexes (onboarding %, opt-in %, completion %, conversion %, etc.) — design-proposed, aligned to PRD metrics where they exist | Success targets are a PM/business decision |
| F-6 | **Ask Guru RAG confidence-threshold value** (below which Guru declines) — referenced in Annex D1; server-tunable | AI quality/safety threshold is a functional/business decision (AI eng + PM) |
| F-7 | **Performance-budget baseline** (device class + percentile; proposed p75 on a mid-tier device, §3.0.4) | Engineering must ratify the measurement baseline |
| F-8 | **Backend API contracts** — endpoint paths/shapes in the annexes are *proposed* to make flows testable; final contract naming/versioning is backend-owned | API design is an engineering functional requirement |

### Assumptions (decisions where PRD is silent)
| # | Item |
|---|---|
| A1 | Tab labels & Ask-Guru diya icon; tab bar hidden only in Splash/Onboarding/immersive ritual/full-screen modals. |
| A2 | Onboarding progress persists locally; abandonment resumes mid-flow, not restart. |
| A3 | Household roles = {Anchor, Parent, Elder, Youth, Other}; depth = {Quick, Deep-dive}, persistent per member. |
| A4 | Daily completion is client-authoritative for the day, reconciled server-side on sync. |
| A5 | Checklist = 3–5 curated items from the day's context; not user-authored in v1. |
| A6 | One active household per user in v1; switching prompts an explicit confirmation. |
| A7 | Anonymous→authenticated identity merge preserves data; conflicts resolved by union / longer streak, user informed. |
| A8 | Personal-date reminders default to a calm, respectful tone; never carry streak/promo content. |
| A9 | Win-back thresholds (7/14/30d) and frequency cap (≤1/3 days) are server-configurable. |
| A10 | After logout, app returns to anonymous Today (not a login wall); household features show "sign in to access." |
| A11 | Account deletion has a short server-side grace/recovery window, surfaced honestly. |
| A12 | v1 monetization uses native IAP only; family-plan entitlement propagates server-side to all members. |
| A13 | *(v1.1)* Analytics event IDs `EVT_001`–`EVT_054` are the canonical taxonomy; new events are appended, never renumbered (§3.0.1). |
| A14 | *(v1.1)* Error codes `ERR_*` (§3.0.2) are canonical; every failure path/error state maps to exactly one; `EVT_054` carries the `error_code`. |
| A15 | *(v1.1)* Design-token namespaces are `color.*`, `typography.*`, `spacing.*`, `radius.*`, `elevation.*`, `motion.*`, `duration.*`, `haptic.*`; values are defined in Part 3 §6, not here. |
| A16 | *(v1.1)* Performance budgets (§3.0.4) are p75 targets on a mid-tier device / typical market network (pending F-7 ratification). |
| A17 | *(v1.1)* All §3.15 annex KPI targets are design-proposed pending ratification (F-5); they align with PRD targets where those exist. |
| A18 | *(v1.1)* Backend endpoint paths in the annexes are proposed contracts to make flows testable; final shapes are backend-owned (F-8). |
| A19 | *(v1.1)* Part 2 screens receive stable `SCR_*` IDs per the §3.17 template; those IDs become the reference used by flows and analytics. |

---

# Part 1 v1.1 — Principal UX Architecture Review: Summary

### 1. Summary of enhancements made
1. **Cross-cutting registries (new §3.0):** a canonical **Analytics Event Taxonomy** (`EVT_001`–`EVT_054`), an **Error Code Registry** (`ERR_*`), **Design-Token reference** conventions (values deferred to Part 3), and **global Performance Budgets**. These become the shared vocabulary for Parts 2–5.
2. **Per-flow engineering annexes (new §3.15):** every one of the 22 flows (A1–F1) now has a standardized annex with **Success Metrics** (Primary/Secondary KPI + Targets + Success Criteria), **UX Friction Analysis** (Cognitive Load, Duration, Likely Drop-off Step, UX Risk), **Backend Dependencies** (only genuinely-required APIs), **AI Dependencies** (full checklist for Ask Guru in Annex D1; "None"/"Optional" elsewhere), **Analytics** (`EVT_xxx`), **Error Codes** (`ERR_xxx`), an **Accessibility Checklist**, and a **Performance Budget**.
3. **Out of Scope for MVP (new §3.16):** consolidates the PRD/MRD exclusions (astrology, Vision AI, community feed, live streaming, marketplace, UGC, video calls, etc.) so no gap is inferred — restating scope, not changing it.
4. **Global Screen Documentation Template (new §3.17):** the mandatory, field-by-field template every Part 2 screen must follow, wired to the §3.0 registries.
5. **Structure preserved:** no existing section was rewritten; the philosophy/IA/flow narrative, all seven original `UX Improvement` callouts, all twelve original Assumptions, and the UX Change Log are intact. Additions are placed at §3.0, §3.15, §3.16, §3.17, and appended log rows.

### 2. New assumptions introduced
Seven, all tagged *(v1.1)* in the Assumptions table: **A13** (event-ID taxonomy), **A14** (error-code canon), **A15** (token namespaces), **A16** (perf-budget baseline), **A17** (annex KPI targets are proposals), **A18** (proposed API contracts), **A19** (`SCR_*` screen IDs in Part 2).

### 3. New UX Improvements added
**None.** This review adds engineering metadata and documentation rigor around already-approved decisions; it introduces **no new UX-pattern deviations** from the PRD. The seven original `UX Improvement` items (UX-1…UX-7) are unchanged. (The KPI/metric additions are measurement, not UX-pattern changes, so they are logged as Assumptions + PRD follow-ups, not UX Improvements.)

### 4. New PRD Follow-up items
Four, appended to the `[PRD FOLLOW-UP]` table: **F-5** (ratify annex KPI targets), **F-6** (set Ask Guru RAG confidence threshold), **F-7** (ratify performance-budget device/percentile baseline), **F-8** (own final backend API contracts). These are flagged for the PRD/engineering owners and are **not** changed here, consistent with the authority rule.

### 5. Compatibility with Parts 2–5 — confirmed
- **Part 2 (Screens):** will use the §3.17 template verbatim; each screen references `EVT_*`, `ERR_*`, tokens, perf budgets, and the backend deps already enumerated per flow. `SCR_*` IDs (A19) slot in cleanly.
- **Part 3 (Components + Design System):** will define the concrete values for the token namespaces (A15) referenced here; no naming conflict.
- **Part 4 (Microinteractions + Notifications + AI):** motion tokens (`motion.*`, `duration.*`, `haptic.*`), notification analytics (`EVT_040`–`EVT_043`), and the Ask Guru AI-dependency contract (Annex D1) are pre-wired.
- **Part 5 (A11y + Analytics + Edge Cases + Copy + Checklist):** the Analytics taxonomy (§3.0.1) and Error Registry (§3.0.2) are the exact scaffolds §11 and §12 will expand; per-flow accessibility checklists ladder up into the §10 audit.

No renumbering of existing content occurred; new material is additive. **Part 1 v1.1 remains fully compatible with Parts 2–5.**

---

*End of Part 1 (v1.1). Awaiting sign-off before proceeding to **Part 2 — Screen Inventory**.*
