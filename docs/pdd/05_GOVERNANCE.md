# PanchangPal — PDD / UXS · Part 5 — Accessibility · Analytics · Edge Cases · UX Copy · Usability Review · Implementation Checklist

**Version:** 5.0 (Working Draft)
**Status:** Part 5 of 5 — for sign-off
**Depends on:** Part 1 v1.2 (registries/governance/flows) · Part 2 v2.0 (screens) · Part 3 v3.1 (components/tokens) · Part 4 v4.0 (microinteractions/notifications/AI)
**Owner:** Design + Analytics + QA (per §3.0A.5) · **Reviewers:** Product, Engineering, AI, Accessibility

---

## How Part 5 works

This part closes the spec with the cross-cutting quality systems and the hand-off:
- **§10 Accessibility** — the WCAG 2.1 AA audit methodology and per-capability requirements (ratifies the Part 3 token contrast and the per-screen checklists; `[PRD FOLLOW-UP] F-13`).
- **§11 Analytics** — the event property schemas, funnels, KPIs, North Star, retention, and feature-adoption model (expands the §3.0.1 taxonomy).
- **§12 Edge Cases** — the definitive handling for every `ERR_*` and boundary condition.
- **§13 UX Copy** — the voice-and-tone library across buttons, headings, empty states, errors, notifications, dialogs, tooltips, success, and onboarding.
- **§14 Usability Review** — friction, cognitive load, drop-off, and retention risks with recommended mitigations.
- **§15 Implementation Checklist** — role-by-role definition-of-ready/done for Designers, Frontend, Backend, QA, AI, and PM.

All references use the established registries: `EVT_*` (§3.0.1), `ERR_*` (§3.0.2), tokens (§6), `SCR_*`/`CMP_*` IDs, and the governance rules (§3.0A). This part introduces no scope/rule/functional changes; improvements are marked `UX Improvement` and logged.

---

# SECTION 10 — Accessibility

Accessibility is a **Principle (P7) and a release gate** (§3.0A.10), not a backlog item. The bar is **WCAG 2.1 AA** (targeting AAA text contrast in the core daily loop where feasible), with first-class screen-reader support across a wide age range including elderly diaspora users (MRD §9).

## 10.1 Audit methodology (the ratification gate)

1. **Automated pass** — token-contrast checks (§6.2 pairs), target-size, and label linting in CI on every screen.
2. **Manual SR pass** — VoiceOver (iOS) + TalkBack (Android) walkthrough of every flow (Part 1 §3), asserting label, role, state, order, and announcements.
3. **Dynamic Type pass** — every screen at the OS maximum text size, asserting reflow (no clipping/overlap).
4. **Reduced-Motion pass** — every Part 4 §7 animation degrades correctly.
5. **Color-independence pass** — every status/marker/selection is distinguishable without color.
6. **Sign-off** — Accessibility owner ratifies the palette (`F-13`) and per-screen checklists before Figma lock and before release. **[ASSUMPTION P5-A1]** a high-stakes verification uses a subagent/independent reviewer for the SR + contrast pass.

## 10.2 WCAG 2.1 AA — key criteria mapped

| Criterion | How PanchangPal meets it |
|---|---|
| 1.1.1 Non-text content | Every icon/illustration has a label or is marked decorative (Part 3 §6.9). |
| 1.3.1 Info & relationships | Semantic headings, lists, roles; grouped panchang detail (§CMP_PANCHANG_DETAIL_LIST). |
| 1.4.1 Use of color | Color never sole signal — markers ● ○ ◆, muhurta text labels, selection checks (§6.2). |
| 1.4.3 Contrast (min) | Text ≥ 4.5:1, large/non-text ≥ 3:1 — palette designed to pass (§6.2), ratified in 10.1. |
| 1.4.4 Resize text | Dynamic Type to OS max, reflow, no fixed-height text (§6.1). |
| 1.4.10 Reflow | Single-column, no horizontal scroll for content at max text size. |
| 1.4.11 Non-text contrast | Borders/focus/controls ≥ 3:1 (`color.border.*`, `color.border.focus`). |
| 2.1.1 Keyboard / switch | All actions operable via switch control / external keyboard (10.9). |
| 2.2.x Timing | Snackbars pause on SR/interaction focus (§7.7); no time-limited required actions. |
| 2.3.1 Three flashes | No flashing content; completion motion bounded (§7.4). |
| 2.4.3 Focus order | Focus order = visual order on every screen (per-screen checklists, Part 2). |
| 2.5.5 Target size | ≥ 44×44pt / 48×48dp with ≥ `spacing.sm` gaps (§6.11). |
| 3.3.1/3.3.3 Errors | Errors identified in text, tied to field, with correction guidance (§12, §13). |
| 4.1.2 Name/role/value | Every interactive component exposes name/role/state (Part 3 per-component a11y). |

## 10.3 VoiceOver (iOS)

Every interactive element has a meaningful `accessibilityLabel`, correct `accessibilityRole`/`traits`, and `accessibilityValue` where stateful (streak "12 day streak"; progress ring "step 2 of 4"). Custom components (panchang card, chat bubble, calendar cell) expose composed labels in logical reading order. The rotor works for headings and links. Ritual **audio narration and VoiceOver never collide** — narration pauses when VoiceOver speaks (audio-focus management, `CMP_AUDIO_CONTROLS`).

## 10.4 TalkBack (Android)

Parity with VoiceOver: content descriptions, roles/states, logical focus traversal, and live-region announcements for streaming (Ask Guru) and snackbars. Grouping is used so a card reads as one coherent item, not scattered fragments. Gesture navigation has button equivalents (swipes never SR-only).

## 10.5 Dynamic Font Sizes

Supported to the OS maximum with reflow; no text truncation on primary content; dense data (panchang detail, calendar) scales or scrolls rather than clipping. Tested at max size on every screen (10.1 pass 3). Numerals are tabular for time/panchang data to prevent shifting.

## 10.6 Color Blindness

The palette (§6.2) is designed so no meaning depends on hue alone: auspicious/inauspicious muhurta carry text labels; calendar markers combine hue **and** shape (● festival, ○ vrat, ◆ personal); selection uses check + border; the streak heatmap has a text alternative ("18 of last 30 days"). Deuteranopia/protanopia/tritanopia simulations are part of the visual-regression suite (Part 3 test coverage).

## 10.7 Large Text / Low Vision

Beyond Dynamic Type: high-contrast-friendly palette, generous spacing (elderly-user consideration, MRD §9), no reliance on fine-grained gestures, and large primary targets. The daily loop targets **AAA** text contrast where feasible (core reading content).

## 10.8 Reduced Motion

Honored globally: every animation degrades to `motion.reduced.crossfade` (150 ms) or a named calm fallback (Part 4 §7). No parallax, no continuous background motion, no auto-playing full-screen motion; the completion moment becomes a cross-fade; typing dots become static text; skeleton shimmer becomes static blocks. Verified per animation (10.1 pass 4).

## 10.9 Keyboard / Switch Navigation

Though touch-first, all interactive elements are reachable and operable via external keyboard / switch control: logical tab order, visible focus ring (`color.border.focus`, ≥ 3:1), no keyboard traps (sheets/dialogs are focus-managed and escapable), and Enter/Space activation. This also future-proofs for larger-screen/tablet use.

## 10.10 Localization & RTL Readiness

v1 UI ships in **English** (multi-language is P1, data-gated). But localization is designed in: no concatenated strings, no text baked into images, `{placeholders}` for names/dates/counts, pluralization-ready, date/number formatting per locale, and **RTL-ready layouts** (logical start/end, mirrorable) so an Urdu/Arabic-script future doesn't require re-architecture. Regional tradition naming (Bengali/Tamil variants) is content-level, already supported (PRD P0 #2).

## 10.11 Accessibility governance recap

Per §3.0A.10, every screen ships its accessibility checklist (Part 2) and passes the 10.1 audit before release. Accessibility failures are **release-blocking**. The Part 3 per-component `Required Test Coverage` includes an accessibility axis; the QA plan (§15) enforces it.

---

# SECTION 11 — Analytics

Analytics operationalize the metrics in the PRD/MRD. This section defines **event properties, funnels, KPIs, the North Star, retention, and feature adoption**, building on the `EVT_*` taxonomy (§3.0.1) and the per-screen/per-flow analytics already specified.

## 11.0 Instrumentation principles

- **Registry-bound:** only `EVT_*` events from §3.0.1 fire; adding one updates the registry first (§3.0A.11).
- **No PII in properties** (privacy baseline, Trust §1.7); use stable pseudonymous IDs.
- **Every error is tracked** via `EVT_054` with `error_code` (§3.0.2).
- **Notifications & AI are attributed** (`notification_type`, AI branch outcomes) for funnel analysis.
- **Household-aware:** events carry `household_id` (pseudonymous) so the North Star (household-level) is computable.

## 11.1 Common event properties (envelope)

Every event carries: `event_id` (EVT_xxx), `ts`, `user_pseudo_id`, `household_id`, `session_id`, `app_version`, `platform` (ios/android), `os_version`, `locale`, `city`/`timezone` (coarse), `tradition`, `is_anonymous`, `network` (online/offline), `reduced_motion`, `text_scale`. Screen-scoped events add `screen_id` (`SCR_*`).

## 11.2 Key event property schemas (selected)

| Event | Key properties |
|---|---|
| EVT_004 Location Permission Result | `result` (grant/deny/manual/skip), `method` (gps/manual), `city_set` |
| EVT_010 Notification Permission Result | `result` (grant/deny/deferred), `primed` (true) |
| EVT_011 Activation Completed | `time_to_activate_ms`, `steps_completed` |
| EVT_015/017 Ritual Started/Completed | `ritual_id`, `tradition`, `depth`, `duration_ms`, `audio_used`, `offline` |
| EVT_020/021 Streak Advanced / Grace Used | `streak_len`, `grace_remaining` |
| EVT_025 Personal Date Added | `basis` (tithi/gregorian), `lead` |
| EVT_029 Question Asked | `source` (tab/contextual/suggestion), `char_len`, `seeded` |
| EVT_030 Answer Streamed | `first_token_ms`, `grounded` (true) |
| EVT_031 Sources Shown | `source_count` |
| EVT_032 Answer Rated | `rating` (up/down), `reason?` |
| EVT_033/034 Declined / Refused | `reason` (low_confidence/empty / out_of_scope), `topic` |
| EVT_040/041 Notification Received/Opened | `notification_type`, `channel`, `quiet_hours` |
| EVT_051 Purchase Result | `plan` (individual/family), `result` (success/fail/cancel), `error_code?` |
| EVT_054 Error Shown | `error_code` (ERR_*), `screen_id`, `recoverable` |

## 11.3 North Star & KPI tree

**North Star: Weekly Household Ritual Completions (WHRC)** — the composite habit-loop metric across a household (MRD §14). Computed from `EVT_017` (+ meaningful `EVT_019`) grouped by `household_id` per ISO week.

```
North Star: Weekly Household Ritual Completions
├─ Activation:  EVT_011 rate (install → activated)          target ≥55% (Annex A1)
├─ Habit depth: ritual completion rate (EVT_017/opens)      target ≥70% (Annex B1)
│               checklist completion (EVT_019, ≥1/DAU)      target ≥40% (PRD Goal 2)
├─ Retention:   D7 ≥30%, D30 ≥15% (PRD)
├─ AI value:    Ask Guru WAU (EVT_029)                      target ≥25% (PRD Goal 3)
├─ Household:   multi-member rate; invite accept (EVT_037)  target ≥40% (Annex D2)
└─ Monetization: free→paid (EVT_051)                        target 3–5%/6mo (PRD)
```

## 11.4 Core funnels

- **Activation funnel:** EVT_002 → EVT_003 → EVT_004 → EVT_005 → EVT_006 → EVT_008 → EVT_009 → EVT_010 → **EVT_011**. Drop-off attributed per step (Part 1 §3.15 friction: location & notification are the risk steps).
- **Daily habit funnel:** EVT_041(morning) or EVT_012 → EVT_015 → EVT_016 → **EVT_017** → EVT_020. Measures the loop the North Star sums.
- **AI funnel:** EVT_027 → EVT_028 → EVT_029 → EVT_030 → EVT_031 → EVT_032 (branches EVT_033/034/054). Refusal-accuracy + helpfulness computed here.
- **Household growth funnel:** EVT_036 → install/defer → EVT_037 → invitee EVT_011.
- **Win-back funnel:** EVT_042 → EVT_043 → EVT_017 (reactivated loop).
- **Monetization funnel:** EVT_049 → EVT_050 → **EVT_051** (success) → entitlement.

## 11.5 Retention & feature adoption

- **Retention:** D1/D7/D30/D90 by cohort; streak-length distribution; churn by cohort; **grace-day impact** (does grace reduce churn vs. a control? — ties to Risk §5 / MRD §13 A/B).
- **Feature adoption:** first-use and WAU for each feature — Ask Guru, personal dates (`EVT_025`), calendar (`EVT_022`), household invite, festival detail. Adoption feeds roadmap prioritization.
- **Guardrail metrics:** notification opt-out rate, win-back unsubscribe, streak-driven churn signal, AI refusal-accuracy, LLM cost/query — watched so growth tactics don't harm trust.
- **LTV:CAC** tracked from day one (MRD §14), by acquisition channel and country (NZ as the low-CAC test market).

## 11.6 Analytics governance

Per §3.0A.11: every screen declares its events/properties/funnels/KPIs and North-Star/retention/revenue contribution (done in Part 2). No silent tracking; no PII; events not in §3.0.1 may not fire. Dashboards: Activation, Daily Habit (North Star), AI Trust (helpfulness/refusal), Retention/Cohorts, Monetization, and a Notification-performance board.

---

# SECTION 12 — Edge Cases

Definitive handling for every boundary condition, each mapped to an `ERR_*` (§3.0.2), the screen(s) affected, and the user-facing behavior. Copy is in §13. Principle: **degrade gracefully, never dead-end, never fabricate, never blame the user.**

| # | Condition | Code | Handling |
|---|---|---|---|
| 1 | **Offline (no connectivity)** | ERR_OFFLINE | Core daily loop works from cache (panchang/ritual text/checklist/streak); calm offline indicator (`CMP_INFO_BANNER`); network-only features (Ask Guru, invites, auth, uncached months) show "connect to use" + retry; offline actions queue and sync (Flow E5). `EVT_053`. |
| 2 | **No internet on first launch** | ERR_OFFLINE | Onboarding tradition/household steps work offline; first-panchang reveal shows estimated panchang + "we'll refine when online," or a graceful "connect to see today's panchang"; never blocks onboarding (AC-ONB-PAN-02). |
| 3 | **Poor / flaky network** | ERR_POOR_NETWORK | Cached-first render; background retry with backoff; audio falls back to text; no blank screens; spinners bounded, then retry affordance. |
| 4 | **Expired session** | ERR_AUTH_EXPIRED | Render cached Today read-only; silent token refresh in background; gate only on account/household actions with a re-auth prompt (Flow A2/E1). |
| 5 | **Payment failure** | ERR_PAYMENT_FAILED | Clear reason + retry/alternative method; no entitlement without server-validated receipt; app remains fully functional on free tier (AC-SUB-03). |
| 6 | **Subscription invalid/unverifiable** | ERR_SUBSCRIPTION_INVALID | "We couldn't verify — we'll restore automatically" + Restore Purchases; reconcile with store as source of truth. |
| 7 | **Permission denied (notifications)** | ERR_NOTIF_DENIED | Non-blocking; app fully usable; soft in-app re-ask after 2 loops; Settings deep-link; value via in-app + later email. |
| 8 | **Location denied** | ERR_LOCATION_DENIED | Auto-open manual city picker; never a dead end; persistent "set city for accurate panchang" chip if skipped (Flow A5). |
| 9 | **GPS disabled at device level** | ERR_GPS_DISABLED | Skip straight to manual city entry with an explanation; panchang still renders. |
| 10 | **LLM timeout** | ERR_AI_TIMEOUT | "I'm having trouble right now — try again" + retry; **no fabricated/partial answer**; `EVT_054`. |
| 11 | **AI error** | ERR_AI_ERROR | Same calm retry; if repeated, suggest trying later; never expose raw model error. |
| 12 | **RAG empty / low confidence** | ERR_RAG_EMPTY / ERR_RAG_LOW_CONFIDENCE | **Honest decline** ("I don't have verified information…") + rephrase / related verified topic / ask-a-temple; `EVT_033`. Never guesses. |
| 13 | **Calendar / month data error** | ERR_CALENDAR_ERROR | Failed month shows error+retry; other months usable; cached months unaffected. |
| 14 | **Festival regional-date conflict** | ERR_FESTIVAL_CONFLICT | Show the user's tradition's date as primary; note variant dates in-app; never silently pick. |
| 15 | **Ambiguous tithi (skip/repeat year)** | ERR_TITHI_AMBIGUOUS | Surface **both** candidate dates with a gentle explanation; never silently guess (AC-PDATE-EDIT-02). |
| 16 | **Ritual audio unavailable** | ERR_AUDIO_UNAVAILABLE | Seamless fall back to full text + "audio needs internet" note; loop still completable. |
| 17 | **Panchang engine data missing** | ERR_PANCHANG_UNAVAILABLE | Card-level error + retry, isolated — the rest of Today stays usable (AC-HOME-04). |
| 18 | **Anon→auth merge conflict** | ERR_AUTH_MERGE_CONFLICT | Resolve by union / longer streak; inform the user what was kept; never silently drop data (AC-AUTH-02). |
| 19 | **Invite/referral token expired** | ERR_INVITE_EXPIRED | "This invite has expired — ask {inviter} for a new one"; graceful re-request. |
| 20 | **Offline sync conflict** | ERR_SYNC_CONFLICT | Daily completion is client-authoritative for the day; reconcile server-side; union of household/history; inform only if meaningful. |
| 21 | **Auth failed / OTP expired** | ERR_AUTH_FAILED | Inline error + rate-limited resend; alternate email / provider recovery / support path (Flow E2); never a dead end. |
| 22 | **Deletion while offline** | ERR_OFFLINE | Queue deletion request; execute on reconnect; inform the user (AC-DEL-03). |
| 23 | **Uncaught / unexpected** | ERR_UNKNOWN | Global calm error boundary with retry + "report a problem"; state preserved where possible; never a raw crash screen. |

**Cross-cutting rules:** every error → `EVT_054` (with code); every error surface is calm, actionable, and color-independent (§7.8, §10.6); no error exposes internal paths/model details; blocking errors move focus to the message and offer the next step.

---

# SECTION 13 — UX Copy

## 13.0 Voice & tone

PanchangPal's voice is **warm, calm, humble, and family-oriented** — a knowledgeable friend, never corporate, preachy, or salesy (Emotional Design 1.6; Trust P2). Principles: short and clear; encouraging never guilt-inducing; specific over generic; respectful of tradition without assuming expertise; grief-aware where relevant; regional/first-name personalization via `{placeholders}`; child-appropriate (households include youth). **Banned:** loss-framed streak copy, fake urgency, shaming, jargon without explanation, and anything that judges a user's level of practice.

**[ASSUMPTION P5-A2]** English (US) is the v1 copy locale; all strings are externalized keys (10.10) ready for translation. If a `my-writing-style` profile is provided, drafts can be tuned to it.

## 13.1 Buttons (labels)
Action-first, concise: "Get started", "Continue", "Use my location", "Enter city manually", "Not now", "Yes, remind me", "Begin", "Continue today's ritual", "Done for today", "See full panchang", "Add a date", "Save", "Invite family", "Share invite", "Ask Guru", "Subscribe", "Restore purchases", "Sign in to save", "Sign out", "Delete account", "Cancel". Destructive verbs are explicit ("Delete account", not "Confirm").

## 13.2 Headings & subheadings
Calm and human. Examples: "Good morning, {name}" · "Today's panchang" · "Your daily moment" · "When's your daily moment?" · "Set up your household" · "Ask Guru anything about rituals & festivals" · "Your family dates" · "A calm space for your practice". Subheads add gentle context: "Calculated for {city}, {timezone}" · "You can change this anytime in Settings."

## 13.3 Placeholders (inputs)
Never the only label (a real label always accompanies). Examples: "Search for your city" · "Household name (e.g., The Sharma Family)" · "Name or relation (e.g., Dadaji)" · "you@email.com" · "Ask about a ritual or festival…".

## 13.4 Empty states
Guiding, single-action, calm:
- Personal dates (grief-aware): "Add the dates you want to remember — birthdays, anniversaries, shraddha. We'll track the tithi for you." + "Add a date".
- Ask Guru history: "Your questions to Guru will appear here."
- Calendar month: "No festivals or vrats this month."
- Achievements (new): "Your journey starts today — complete today's ritual to begin."

## 13.5 Errors (user-facing, mapped to §12 codes)
Calm, specific, actionable — never technical:
- ERR_OFFLINE: "You're offline. Today's panchang and ritual still work — we'll sync when you're back."
- ERR_LOCATION_DENIED: "No problem — search for your city so your panchang is accurate."
- ERR_GPS_DISABLED: "Location's off on your device. Enter your city instead."
- ERR_AI_TIMEOUT/ERR_AI_ERROR: "I'm having trouble right now — please try again."
- ERR_RAG_LOW_CONFIDENCE: "I don't have verified information on this one. I'd rather not guess on something this important."
- ERR_PAYMENT_FAILED: "That payment didn't go through. Try again or use another method."
- ERR_INVITE_EXPIRED: "This invite has expired — ask {inviter} for a new one."
- ERR_TITHI_AMBIGUOUS: "This tithi falls on two possible dates next year. Which would you like to observe?"
- ERR_UNKNOWN: "Something went wrong on our end. Please try again."

## 13.6 Notifications (see Part 4 §8 for full set)
Warm, value-led, guilt-free. Morning: "Good morning, {name} 🪔 — today is {tithi}. Your 2-minute moment is ready." Streak (allowed): "Still time today — a 2-minute moment keeps your rhythm going." Personal date (grief-aware): "Dadaji's shraddha is tomorrow." **Banned:** "You'll lose your {n}-day streak!"

## 13.7 Confirmation dialogs
State consequences plainly; label the safe and destructive actions clearly:
- Leave ritual: "Leave ritual? Your progress today is saved." [Leave] [Keep going]
- Delete account: "Delete your account? This removes your data and can't be undone." [Delete account] [Cancel]
- Switch household: "Join {household}? You'll leave your current household." [Join] [Cancel]

## 13.8 Tooltips & inline help
Brief, plain-language: "Tithi — the lunar day in the Hindu calendar." · "Rahu Kaal — a period traditionally avoided for new beginnings." · "How we calculate this" → opens the accuracy note. Guru trust line: "Guru answers from verified sources — and says so when it's not sure."

## 13.9 Success messages
Gentle, affirming (never over-celebratory): "Done for today 🪔" · "You're all set." · "Saved — we'll remind you every year." · "Welcome to the family 🪔." · "Your household is ready."

## 13.10 Onboarding copy
Value-led, reassuring: 
- Welcome slides: "Your traditions, every day — made simple." / "Today's panchang, for your city and time zone." / "A calm 2-minute moment, guided." 
- Location: "Today's panchang is calculated for your exact location and time zone." 
- Notification priming: "Want a gentle reminder for your daily moment?" 
- First panchang: "Here's today — calculated for {city}." 
- Reassurance throughout: "You can change any of this later in Settings."

## 13.11 Copy governance
All copy lives as externalized keys (locale-ready, 10.10); tone reviewed against 13.0; culturally/grief-sensitive strings (shraddha, festivals) reviewed by the content reviewers (Risk §10). No copy asserts individualized religious authority. Emoji use is sparing and warm (🪔), never decorative clutter.

---

# SECTION 14 — Usability Review

A pre-engineering heuristic review of the whole experience, flagging risks and recommended mitigations. Most mitigations are already designed in (referenced); remaining watch-items are called out.

## 14.1 Friction points
- **Permissions (location, notifications)** are the highest-friction onboarding steps (Annex A1). *Mitigated:* value-first sequencing, in-app priming before OS dialogs (UX-4), graceful denial paths. *Watch:* monitor the activation funnel (§11.4) for step drop-off.
- **Tithi vs. Gregorian choice** in personal dates adds cognitive load (Annex C2). *Mitigated:* sensible default + "compute from a known date" helper. *Watch:* completion rate of `SCR_PERSONAL_DATE_EDIT_001`.
- **First Ask Guru question** — blank-input hesitation. *Mitigated:* contextual suggestions + starters (§9.2).

## 14.2 Cognitive load
- **Panchang density** can overwhelm (Annex B3). *Mitigated:* calm summary on Home, full detail one level down (Principle P1, progressive disclosure).
- **Household roles + depth** are new concepts. *Mitigated:* sensible defaults (self = Anchor), changeable later; skippable. *Watch:* multi-member setup rate.

## 14.3 Drop-off points
- **Onboarding location/notification steps** and **household invitee install** (deferred deep link) are the predicted drop-offs (Annexes A1, D2). *Mitigated:* one-decision-per-screen, deferred auth, deferred deep-link auto-join. *Watch:* funnels §11.4.
- **AI wait for first token.** *Mitigated:* < 2 s budget + thinking indicator; honest decline beats a slow bad answer.

## 14.4 Confusing areas (resolved)
- **Auth timing** — resolved by deferring sign-in (UX-2) so users aren't walled before value.
- **Nav overload** — resolved by the 4-tab model (UX-1); Settings/Subscription nested (UX-8).
- **Streak anxiety** — resolved by grace days + gentle framing (UX-3); loss copy banned.

## 14.5 Accessibility risks
- **Ritual audio vs. screen reader** collision. *Mitigated:* audio-focus management (§10.3).
- **Dense panchang/calendar at max text size.** *Mitigated:* reflow/scroll, tabular numerals; verified in 10.1 pass 3. *Watch:* the max-Dynamic-Type QA pass.
- **Color-coded muhurta/markers.** *Mitigated:* text labels + shapes (§10.6).

## 14.6 Navigation problems (resolved)
Deep links always resolve to a valid back-stack (Flow D4); tab re-tap pops to root; immersive flows confirm before exit; no dead ends from any error (§12).

## 14.7 Retention problems
- **Habituation boredom** of an identical daily screen. *Mitigated:* rotating daily element (variable reward, Hook model).
- **No win-back loop** (a v1-era gap). *Mitigated:* festival/personal-date win-back (§8.9), fresh-start framing.
- **Streak-driven churn** (the ethical risk). *Mitigated:* grace days + tone; *Watch:* the A/B streak-tone test and grace-day churn impact (§11.5, MRD §13).

## 14.8 Recommended improvements (net-new watch-items → follow-ups)
- **`UX Improvement` UX-10:** add a lightweight "first Ask Guru intro" card (already specified in §9.7) — confirmed as a shipped element, not just a nicety, because it sets the honest-limits expectation that protects trust. *Impact:* fewer mis-set expectations; *effort:* low.
- **`UX Improvement` UX-11:** on the daily screen, keep the streak visually secondary to completion at all text sizes (not just default) — add to the Dynamic-Type QA checklist. *Impact:* preserves the anti-anxiety intent (UX-3) under large text; *effort:* low.
- Watch-items (not changes) routed to analytics dashboards: activation step drop-off, personal-date completion, multi-member setup, AI refusal accuracy, grace-day churn impact.

---

# SECTION 15 — Implementation Checklist

Role-by-role definition-of-ready/done, consolidating the governance gates (§3.0A.12, §5.13A.10) into an actionable hand-off. A screen/feature is shippable only when all applicable roles' items are checked.

## 15.1 Designers
☐ Every screen uses the §3.17 template; all 7 states designed (incl. empty/offline/error). ☐ Only Design-System components (`CMP_*`, Part 3) — no one-off UI. ☐ Only tokens (color/type/space/radius/motion) — no hard-coded values. ☐ Figma components linked (Design Source status → Linked) and variant sets match Part 3. ☐ Dynamic Type (max) and dark mode designed. ☐ Reduced-Motion variants specified (Part 4 §7). ☐ Copy from §13 (tone-reviewed; grief/cultural strings reviewed). ☐ Accessibility annotations (labels, order, targets) on redlines.

## 15.2 Frontend Developers (React Native / Expo)
☐ Build from components (Part 3); reuse/extend, never duplicate (§5.13A.9). ☐ Tokens via generated `tokens.ts`; no literals. ☐ Implement all component states + state machines (Part 3). ☐ Wire deep links (`panchangpal://…`) to valid back-stacks (Flow D4). ☐ Cached-first rendering + performance budgets (§3.0.4). ☐ Offline queue + optimistic actions + sync (Flow E5). ☐ Accessibility: labels/roles/values, focus order, ≥44/48 targets, Reduced-Motion, audio-focus mgmt. ☐ Fire only registry `EVT_*` with the §11 property envelope. ☐ Handle every `ERR_*` per §12; error boundary for `ERR_UNKNOWN`. ☐ Feature flags (`FF_*`) for post-v1 items (greeting card, family plan, Jain).

## 15.3 Backend Developers
☐ Implement the `API_*` contracts consumed per screen (Part 2 annexes) — ratify final shapes (`F-8`). ☐ Anonymous→authenticated identity merge (union/longer-streak) (`F-1`). ☐ Tithi engine: personal-date auto-recurrence + ambiguity rule (`ERR_TITHI_AMBIGUOUS`). ☐ Notification scheduling: local-time/sunrise, quiet hours, caps, channels (`F-15`). ☐ Server-side receipt validation + family entitlement propagation (`F-4`). ☐ Household cardinality + ownership transfer rules (`F-2/F-3`). ☐ CCPA data export/delete + grace window (`F-3/F-10`). ☐ Sync/conflict resolution (`ERR_SYNC_CONFLICT`). ☐ No PII in analytics/logs.

## 15.4 QA Engineers
☐ Test cases (`QA_*`) trace to acceptance criteria (`AC-*`) per screen (§3.0A.2). ☐ All 7 states per screen, incl. every `ERR_*` path (§12). ☐ Accessibility gate: VoiceOver + TalkBack flows, Dynamic Type (max), Reduced-Motion, contrast, color-independence, ≥44/48 (§10.1) — **release-blocking**. ☐ Performance budgets asserted (§3.0.4). ☐ Analytics: events fire with correct properties; funnels validate (§11). ☐ AI: refusal test set (out-of-scope + adversarial), honest-decline on low confidence, no fabrication on error (§9.5–9.6). ☐ Offline/sync + notification deep-link + payment failure paths. ☐ Visual regression incl. color-blindness simulations (Part 3).

## 15.5 AI Engineers
☐ RAG over the reviewed content library (grounded-or-silent) (§9.1). ☐ Confidence threshold (server-tunable, `F-6`) + optional groundedness post-check (`F-16`). ☐ Streaming (first token < 2 s) with polite batched SR announcements (§9.3.2/§10.4). ☐ Safety/scope classifier + guardrails; pass the QA refusal test set (Risk §4). ☐ Source citation surfaced (`EVT_031`). ☐ In-session history only; **no cross-session memory** (AI Non-Goal). ☐ Cost controls/rate-limits (Risk §2); AI analytics (§9.9). ☐ Periodic hallucination audit (refusal accuracy ≥ 95%).

## 15.6 Product Managers
☐ Every feature traces MRD→PRD→Story→metric (§3.0A.2); no orphan features. ☐ Resolve open `[PRD FOLLOW-UP]` items (F-1…F-17) before the dependent build. ☐ Confirm runway/budget (MRD Go/No-Go condition — still open). ☐ Ratify KPI targets (`F-5`) and North Star dashboards (§11.3). ☐ Sequence per roadmap (Jain v1.1, greeting card/family plan/email 6-mo) behind flags. ☐ NZ paywall/pricing signal test instrumented (MRD §13). ☐ Temple-partnership pilot + activation/retention gates before scaling spend. ☐ Sign-off workflow per §3.0A.5.

## 15.7 Consolidated open follow-ups (owner action before/with build)
F-1 anon→auth merge · F-2 household cardinality · F-3 deletion grace/ownership · F-4 family entitlement · F-5 KPI targets · F-6 AI confidence threshold · F-7 perf baseline · F-8 API contracts · F-9 tradition set · F-10 data export · F-11 pricing/free tier · F-12 type families/brand hex + licensing · F-13 WCAG palette ratification · F-14 shared-service naming · F-15 notification taxonomy/defaults · F-16 groundedness post-check · F-17 evening/promo push defaults.

---

# Part 5 — UX Change Log

Part 5 applies prior decisions and adds two low-effort UX improvements surfaced by the usability review; no scope/rule/functional changes.

| # | Original | Proposed UX change | Rationale | Impact | Effort | Update PRD? |
|---|---|---|---|---|---|---|
| UX-10 | Ask Guru trust messaging (§9.7) | Ship a one-time, dismissible **"what Guru can/can't do"** intro on first open | Sets honest-limits expectations up front → protects trust (the moat) | Fewer mis-set expectations; better first-AI experience | Low | Optional |
| UX-11 | Streak is visually secondary (UX-3) | Assert streak stays secondary to completion **at all text sizes** (add to Dynamic-Type QA) | Preserves anti-anxiety intent under large text/low vision | Healthier retention for low-vision users | Low | No |

### Assumptions introduced in Part 5
| # | Item |
|---|---|
| P5-A1 | High-stakes accessibility verification uses an independent reviewer/subagent for the SR + contrast pass. |
| P5-A2 | v1 copy locale = English (US); all strings externalized as locale-ready keys. |

*(No new `[PRD FOLLOW-UP]` items; §15.7 consolidates all F-1…F-17 for owner action.)*

---

# Part 5 — Readiness Summary

- **Accessibility (§10):** WCAG 2.1 AA audit methodology + criteria mapping, VoiceOver/TalkBack, Dynamic Type, color-blindness, Reduced Motion, keyboard/switch, and localization/RTL readiness — accessibility is a **release-blocking gate**; ratifies `F-13`.
- **Analytics (§11):** event envelope + key property schemas, the WHRC North Star & KPI tree, six core funnels, retention/feature-adoption/guardrail model, and governance — operationalizing the PRD/MRD metrics on the §3.0.1 taxonomy.
- **Edge Cases (§12):** definitive handling for all 23 boundary conditions, each mapped to an `ERR_*` and screen, with calm/graceful/no-dead-end/no-fabrication rules.
- **UX Copy (§13):** voice-and-tone + a library across buttons, headings, placeholders, empty states, errors, notifications, dialogs, tooltips, success, and onboarding — grief-aware and guilt-free, locale-ready.
- **Usability Review (§14):** friction, cognitive load, drop-off, confusing areas, accessibility/navigation/retention risks — mostly mitigated by design, with watch-items routed to dashboards and two new low-effort improvements (UX-10, UX-11).
- **Implementation Checklist (§15):** role-by-role definition-of-done for Designers, Frontend, Backend, QA, AI, PM, plus the consolidated F-1…F-17 follow-ups.
- **Compatibility:** fully consistent with Parts 1–4. This completes the PDD/UXS — the five parts together are implementation-ready for Figma, React Native, and AI coding agents.

---

*End of Part 5 — and of the PanchangPal PDD / UXS. All five parts are complete and awaiting final sign-off.*
