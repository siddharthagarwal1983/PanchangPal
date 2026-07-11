# PanchangPal — PDD / UXS · Part 2 — Screen Inventory

**Version:** 2.0 (Working Draft)
**Status:** Part 2 of 5 — for sign-off
**Depends on:** Part 1 v1.2 (Philosophy · IA · Flows · §3.0 Registries · §3.0A Governance · §3.17 Screen Template)
**Owner:** Design (per §3.0A.5) · **Reviewers:** Product, Engineering, Accessibility

---

## How Part 2 works

Every screen below is documented with the **mandatory Global Screen Documentation Template (§3.17)** and is wired to the Part 1 registries and governance:

- **Screen IDs** follow §3.0A.3 (`SCR_<AREA>_<NNN>`) and are stable references used by flows, analytics, and code.
- **Analytics** cite `EVT_*` (§3.0.1); **Errors** cite `ERR_*` (§3.0.2); **Performance** cites §3.0.4 budgets; **Tokens** cite the §3.0.3 namespaces (values in Part 3).
- **Components** cite `CMP_*` IDs; these are *forward references* — the Component Library that defines them is **Part 3 §5**. Where a `CMP_*` is named here, Part 3 is its source of truth.
- **APIs** cite `API_*` names (§3.0A.3); endpoint shapes are proposed to make screens testable — final contracts are backend-owned (`[PRD FOLLOW-UP] F-8`).
- Each screen carries a **Traceability** line (§3.0A.2): MRD · PRD · User Story · Epic · Feature · Flow · APIs · DB · QA.
- Per §3.0A.6/§3.0A.12, no screen is complete without all template fields; unused fields read **"N/A — {reason}."**
- KPI targets referenced here inherit the §3.15 annex targets (design-proposed, pending `[PRD FOLLOW-UP] F-5`).

**Reading note:** to keep the largest section navigable, each screen uses a consistent condensed layout of the §3.17 fields (same field order, same completeness). Given/When/Then acceptance criteria are numbered `AC-<AREA>-NN` and map 1:1 to QA cases `QA_<AREA>_NNN`.

---

## 4.0 Screen Index

29 screens across 6 areas. `FLOW_*` and `Annex` columns point back to Part 1 §3 for full flow logic.

| # | Screen ID | Name | Area / Tab | Primary Flow | Key APIs |
|---|---|---|---|---|---|
| 1 | SCR_SPLASH_001 | Splash | System | FLOW_ONBOARDING / FLOW_RETURNING | API_GET_SESSION_VALIDATE |
| 2 | SCR_ONBOARDING_WELCOME_001 | Welcome / Value Intro | Onboarding | FLOW_ONBOARDING (A1) | API_GET_ONBOARDING_CONFIG |
| 3 | SCR_ONBOARDING_LOCATION_001 | Location Permission | Onboarding | A5 | API_GET_GEO_REVERSE, API_GET_CITY_SEARCH |
| 4 | SCR_ONBOARDING_TRADITION_001 | Tradition / Region Select | Onboarding | A1 | API_GET_TRADITIONS |
| 5 | SCR_ONBOARDING_HOUSEHOLD_001 | Household Setup | Onboarding | A3 | API_POST_HOUSEHOLD |
| 6 | SCR_ONBOARDING_RITUALTIME_001 | Ritual Time Select | Onboarding | A1 | API_POST_PROFILE |
| 7 | SCR_ONBOARDING_PANCHANG_001 | First Panchang Reveal | Onboarding | A1 | API_GET_TODAY |
| 8 | SCR_ONBOARDING_NOTIF_001 | Notification Permission | Onboarding | A4 | API_POST_NOTIF_SCHEDULE |
| 9 | SCR_AUTH_001 | Sign-in Options | Auth | E1 | API_POST_AUTH_APPLE/GOOGLE |
| 10 | SCR_AUTH_EMAIL_001 | Email OTP / Magic Link | Auth | E1 | API_POST_AUTH_EMAIL_START/VERIFY |
| 11 | SCR_AUTH_RECOVERY_001 | Account Recovery | Auth | E2 | API_POST_AUTH_EMAIL_START |
| 12 | SCR_HOME_001 | Today (Home) | Tab 1 · Today | B1 | API_GET_TODAY, API_GET_RITUAL, API_GET_STREAK |
| 13 | SCR_PANCHANG_DETAIL_001 | Panchang Detail | Tab 1 · Today | B3 | API_GET_PANCHANG_DETAIL |
| 14 | SCR_RITUAL_001 | Guided Ritual Player | Tab 1 · Today | B1 | API_GET_RITUAL, API_POST_RITUAL_COMPLETE |
| 15 | SCR_CALENDAR_001 | Calendar (Month) | Tab 2 · Calendar | C3 | API_GET_CALENDAR |
| 16 | SCR_CALENDAR_DAY_001 | Day Detail | Tab 2 · Calendar | C3 | API_GET_PANCHANG_DETAIL |
| 17 | SCR_FESTIVAL_DETAIL_001 | Festival / Vrat Detail | Tab 2 · Calendar | C1 | API_GET_FESTIVAL |
| 18 | SCR_PERSONAL_DATES_001 | Personal & Family Dates | Tab 2 · Calendar | C2 | API_GET_PERSONAL_DATES |
| 19 | SCR_PERSONAL_DATE_EDIT_001 | Add / Edit Personal Date | Tab 2 · Calendar | C2 | API_POST_PERSONAL_DATE, API_GET_TITHI_NEXT |
| 20 | SCR_GURU_HOME_001 | Ask Guru Home | Tab 3 · Ask Guru | D1 | API_GET_GURU_SUGGESTIONS |
| 21 | SCR_GURU_CHAT_001 | Ask Guru Conversation | Tab 3 · Ask Guru | D1 | API_POST_ASK_GURU |
| 22 | SCR_GURU_HISTORY_001 | Conversation History | Tab 3 · Ask Guru | D1 | API_GET_GURU_HISTORY |
| 23 | SCR_PROFILE_001 | You (Profile) Home | Tab 4 · You | — | API_GET_PROFILE, API_GET_STREAK |
| 24 | SCR_HOUSEHOLD_001 | Household Members | Tab 4 · You | A3 | API_GET_HOUSEHOLD |
| 25 | SCR_HOUSEHOLD_INVITE_001 | Invite / Accept Member | Tab 4 · You | D2 | API_POST_HOUSEHOLD_INVITE, API_POST_INVITE_ACCEPT |
| 26 | SCR_ACHIEVEMENTS_001 | Achievements / Streak History | Tab 4 · You | — | API_GET_STREAK_HISTORY |
| 27 | SCR_SUBSCRIPTION_001 | Subscription / Upgrade | Tab 4 · You | F1 | API_GET_SUB_PLANS, API_POST_SUB_VALIDATE |
| 28 | SCR_SETTINGS_001 | Settings (hub + subpages) | Tab 4 · You | A4/A5/E3 | API_GET/PATCH_PREFERENCES |
| 29 | SCR_DELETE_ACCOUNT_001 | Delete Account | Tab 4 · You | E4 | API_POST_ACCOUNT_DELETE |

**Cross-cutting surfaces** (offline banner, snackbars/toasts, bottom sheets, permission-rationale sheets, global error state, paywall sheet) are **components**, specified in Part 3 §5, and are referenced by the screens that host them rather than documented as standalone screens.

---

# SECTION 4 — Screen Inventory

## Area A — System & Onboarding

---

### SCR_SPLASH_001 — Splash

**Purpose:** Brand-warm launch surface that silently resolves session + onboarding state and routes the user, with no perceptible wait.
**Business Goal:** Fast, trustworthy first frame; correct routing supports activation and D1 return (PRD leading/lagging metrics). **User Goal:** "Open the app and get where I belong instantly."
**Traceability:** MRD §1 · PRD (Requirements/Platform) · Story: returning/first-launch · EPIC_CORE · FEAT_APP_SHELL · FLOW_ONBOARDING / FLOW_RETURNING · APIs: API_GET_SESSION_VALIDATE · DB: USER, SESSION · QA_SPLASH_001…

**Entry Points:** Cold launch (first ever / returning); relaunch after kill. **Exit Points:** ✔ → SCR_ONBOARDING_WELCOME_001 (no profile) · ✔ → SCR_HOME_001 (onboarded) · ✔ → deep-link target (with valid back-stack) · ✖ → SCR_HOME_001 cached read-only (expired session).

**Components:** CMP_BRAND_LOGO, CMP_SPLASH_BACKDROP. **Primary CTA:** N/A — auto-advances. **Secondary CTA:** N/A. **Navigation:** Root; no tab bar; replaces itself on route (no back to splash).

**Inputs:** N/A — no user input. **Outputs:** Routing decision. **Validation:** Session token validity → `ERR_AUTH_EXPIRED` handled by cached-route fallback.

**States:** • **Default:** brand mark on `color.surface.brand`, subtle diya glow (`motion.brand.pulse`). • **Loading:** the splash *is* the load state (session/onboarding check). • **Skeleton:** N/A — no content. • **Empty:** N/A. • **Offline:** proceed on cached session/onboarding flags; no blocking. • **Error:** session check fails → route to cached Today or Welcome; never trap on splash (`ERR_UNKNOWN` → safe route). • **Success:** route resolved < budget.

**Accessibility:** ✓ `accessibilityLabel` "PanchangPal, loading" announced once · ✓ Reduced-Motion → static logo (no pulse) · ✓ Respects Dynamic Type for any tagline · ✓ WCAG AA contrast on logo/backdrop · ✓ no timed content requiring interaction.
**Analytics Events:** EVT_001 (App Open), EVT_002 (Splash Shown). **Performance Budget:** < 1 s launch→first meaningful frame; route decision < 500 ms (§3.0.4). **Backend Dependencies:** API_GET_SESSION_VALIDATE (non-blocking; cached flags allow offline route). **Design Tokens:** color.surface.brand, color.brand.primary, motion.brand.pulse, duration.splash.
**Acceptance Criteria:**
- AC-SPLASH-01 — Given a first-ever launch, when splash resolves, then the app routes to SCR_ONBOARDING_WELCOME_001 within the splash budget.
- AC-SPLASH-02 — Given an onboarded user with a valid session, when splash resolves, then the app routes to SCR_HOME_001 (or the deep-link target) without a visible spinner.
- AC-SPLASH-03 — Given no connectivity, when splash resolves, then routing uses cached onboarding/session flags and never blocks on the network.
- AC-SPLASH-04 — Given Reduced Motion is on, when splash shows, then no pulse/animation plays.
**Open Questions:** None.

---

### SCR_ONBOARDING_WELCOME_001 — Welcome / Value Intro

**Purpose:** Communicate the core promise (localized daily panchang + guided ritual + trustworthy guidance) in ≤3 calm slides and start onboarding without a sign-in wall.
**Business Goal:** Maximize onboarding completion (≥70%, PRD). **User Goal:** "Understand what this gives me and start."
**Traceability:** MRD §1 · PRD (Onboarding revisions) · Story: first-gen anchor · EPIC_ONBOARDING · FEAT_ONBOARDING · FLOW_ONBOARDING (A1) · APIs: API_GET_ONBOARDING_CONFIG · DB: none (local) · QA_ONB_WEL_001…

**Entry Points:** From SCR_SPLASH_001 (no profile); referral/invite deep link (captures context first). **Exit Points:** ✔ → SCR_ONBOARDING_LOCATION_001 · ✖ "Skip" → jumps to first-value path (still routes through location, as accuracy requires it).

**Components:** CMP_ONBOARDING_SLIDE, CMP_PAGE_DOTS, CMP_PRIMARY_BUTTON, CMP_TEXT_BUTTON (Skip). **Primary CTA:** "Get started" → next. **Secondary CTA:** "Skip" (advances to location). **Navigation:** Onboarding stack; no tab bar; Back moves between slides; hardware back on slide 1 = exit app (Android).

**Inputs:** Swipe/next (slide index). **Outputs:** Onboarding started; referral context stored if present. **Validation:** N/A — no fields.

**States:** • **Default:** slide 1 with illustration + headline + subcopy. • **Loading:** if remote onboarding config used, brief skeleton on illustration area. • **Skeleton:** CMP_SKELETON on illustration/text while config loads. • **Empty:** N/A — content is bundled fallback if config unavailable. • **Offline:** show bundled default slides; proceed. • **Error:** config fetch fails → bundled slides (`ERR_NETWORK_TIMEOUT` silent). • **Success:** advances to location.

**Accessibility:** ✓ Each slide a labeled region; SR reads headline→subcopy in order · ✓ Page dots expose position ("2 of 3") · ✓ Dynamic Type to max, illustrations don't crowd text · ✓ Reduced-Motion → cross-fade slides (`motion.reduced.crossfade`) · ✓ CTAs ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_003 (Onboarding Started, on slide 1). **Performance Budget:** slide transition < 300 ms; config (if any) < 1 s else bundled. **Backend Dependencies:** API_GET_ONBOARDING_CONFIG (optional; bundled fallback). **Design Tokens:** color.surface.primary, typography.heading.large, typography.body.medium, spacing.lg, motion.reduced.crossfade.
**Acceptance Criteria:**
- AC-ONB-WEL-01 — Given a new user, when Welcome appears, then EVT_003 fires exactly once.
- AC-ONB-WEL-02 — Given the user taps "Get started" or "Skip", when advancing, then the next surface is location (accuracy is prerequisite) — no sign-in is requested here.
- AC-ONB-WEL-03 — Given no connectivity, when Welcome loads, then bundled slides render and onboarding proceeds.
**Open Questions:** None.

---

### SCR_ONBOARDING_LOCATION_001 — Location Permission

**Purpose:** Obtain an accurate location (GPS or manual city) so the panchang is computed for the user's sky — the product's #1 differentiator.
**Business Goal:** Location-resolved ≥90% (Annex A5); underpins panchang trust (the moat). **User Goal:** "Make today's panchang correct for where I am."
**Traceability:** MRD §7 (timezone pain) · PRD P0 #1 · Story: functional JTBD · EPIC_ONBOARDING · FEAT_LOCATION · FLOW A5 · APIs: API_GET_GEO_REVERSE, API_GET_CITY_SEARCH · DB: USER(location, tz) · QA_ONB_LOC_001…

**Entry Points:** From SCR_ONBOARDING_WELCOME_001; re-entered from SCR_SETTINGS_001 (location). **Exit Points:** ✔ location set → SCR_ONBOARDING_TRADITION_001 · ✖ skipped → device-locale tz + persistent "set city" chip → continue.

**Components:** CMP_PERMISSION_RATIONALE_SHEET, CMP_PRIMARY_BUTTON, CMP_CITY_SEARCH (CMP_SEARCH_FIELD + CMP_LIST), CMP_TEXT_BUTTON (Not now). **Primary CTA:** "Use my location" → OS dialog. **Secondary CTA:** "Enter city manually"; "Not now". **Navigation:** Onboarding stack; Back → Welcome.

**Inputs:** OS permission result; manual city query (string) → selected city (id). **Outputs:** `{city, lat, lng, timezone}` on profile. **Validation:** city query ≥2 chars; a city must be selected from results (no free-text tz) → else `ERR_LOCATION_DENIED` fallback path.

**States:** • **Default:** rationale ("Today's panchang is calculated for your exact location & time zone") + primary/secondary CTAs. • **Loading:** reverse-geocode/city-search spinner in field. • **Skeleton:** results list skeleton while searching. • **Empty:** no city matches → "No matches — try a nearby larger city." • **Offline:** GPS may still resolve coarse tz; city-search requires network → show `ERR_OFFLINE` inline with "You can set this later." • **Error:** `ERR_LOCATION_DENIED` → auto-open manual picker; `ERR_GPS_DISABLED` → skip to manual + explain GPS off. • **Success:** "Panchang for {city}, {tz}" confirmation chip.

**Accessibility:** ✓ Rationale readable by SR *before* OS dialog · ✓ Search field labeled; results as a SR list with city+region · ✓ Selected-state announced · ✓ ≥44/48 targets · ✓ Dynamic Type · ✓ WCAG AA · ✓ error text tied to field (`accessibilityLiveRegion`).
**Analytics Events:** EVT_004 (Location Permission Result: grant/deny/manual/skip). **Performance Budget:** reverse-geocode < 1.5 s; search results < 1 s. **Backend Dependencies:** API_GET_GEO_REVERSE, API_GET_CITY_SEARCH. **Design Tokens:** color.surface.primary, color.text.secondary, radius.md, spacing.md, typography.body.large.
**Acceptance Criteria:**
- AC-ONB-LOC-01 — Given the rationale sheet, when it appears, then the OS permission dialog is only presented after the user taps "Use my location."
- AC-ONB-LOC-02 — Given permission is denied (`ERR_LOCATION_DENIED`), when resolved, then the manual city picker opens automatically and the flow never dead-ends.
- AC-ONB-LOC-03 — Given GPS is disabled at device level (`ERR_GPS_DISABLED`), when the screen loads, then it routes straight to manual entry with an explanation.
- AC-ONB-LOC-04 — Given a city is set, when the screen exits, then `{city, lat, lng, timezone}` is persisted and confirmed as "Panchang for {city}, {tz}."
**Open Questions:** None.

---

### SCR_ONBOARDING_TRADITION_001 — Tradition / Region Select

**Purpose:** Let the user pick their regional tradition (top 2–3 variants) so calendar naming, festival dates, and ritual scripts match — or choose "General/Not sure" for the generic variant.
**Business Goal:** Reduce "generic alienation" churn (Risk §6); personalize content depth. **User Goal:** "See my tradition's festivals and rituals, not a generic default."
**Traceability:** MRD §9 · PRD P0 #2/#3 (regionalization) · Story: regionally-diverse household · EPIC_CONTENT · FEAT_REGIONALIZATION · FLOW A1 · APIs: API_GET_TRADITIONS · DB: USER(tradition), HOUSEHOLD(tradition) · QA_ONB_TRAD_001…

**Entry Points:** From SCR_ONBOARDING_LOCATION_001; re-entered from SCR_SETTINGS_001 (changeable later — PRD). **Exit Points:** ✔ tradition chosen (or skipped→generic) → SCR_ONBOARDING_HOUSEHOLD_001.

**Components:** CMP_SELECTABLE_CARD (one per tradition), CMP_PRIMARY_BUTTON, CMP_TEXT_BUTTON (Not sure / Skip). **Primary CTA:** "Continue". **Secondary CTA:** "I'm not sure" → generic. **Navigation:** Onboarding stack; Back → Location.

**Inputs:** tradition selection (enum id, single-select). **Outputs:** `tradition` on profile + household default. **Validation:** selection optional (skippable → `GENERIC`); one active selection.

**States:** • **Default:** list of tradition cards + "Not sure." • **Loading:** cards skeleton while API_GET_TRADITIONS loads. • **Skeleton:** CMP_SKELETON rows. • **Empty:** if list empty (config issue) → default to `GENERIC` and proceed silently. • **Offline:** show bundled top traditions; proceed. • **Error:** fetch fail → bundled list (`ERR_NETWORK_TIMEOUT` silent). • **Success:** selection persisted; "You can change this anytime in Settings" note.

**Accessibility:** ✓ Cards as single-select radio group (SR announces "selected") · ✓ Labels include tradition + short descriptor · ✓ Dynamic Type · ✓ ≥44/48 · ✓ WCAG AA · ✓ not color-only selection (checkmark + border).
**Analytics Events:** EVT_005 (Tradition Selected — value or `skipped`). **Performance Budget:** list render < 1 s (network) / < 300 ms (bundled). **Backend Dependencies:** API_GET_TRADITIONS. **Design Tokens:** color.surface.raised, color.border.selected, radius.lg, spacing.md, typography.title.medium.
**Acceptance Criteria:**
- AC-ONB-TRAD-01 — Given the tradition list, when the user selects one and continues, then `tradition` is persisted to profile and household default and EVT_005 fires with the value.
- AC-ONB-TRAD-02 — Given the user taps "I'm not sure", when continuing, then `tradition = GENERIC` and EVT_005 fires with `skipped`.
- AC-ONB-TRAD-03 — Given tradition is set, when the user later opens Settings, then it is editable (not locked).
**Open Questions:** OQ — final enumerated tradition set for v1 depends on the "top 2–3 by onboarding data" decision (PRD P0 #2); until data exists, bundled set is `{GENERIC, NORTH_INDIAN, SOUTH_INDIAN/TAMIL, BENGALI}` **[ASSUMPTION P2-A1]**, ratify via `[PRD FOLLOW-UP]`.

---

### SCR_ONBOARDING_HOUSEHOLD_001 — Household Setup

**Purpose:** Create the household unit (name + optional members with role & content-depth), enabling role-aware content and the North Star (Weekly Household Ritual Completions).
**Business Goal:** Household creation ≥80% (Annex A3); household is the retention & growth unit. **User Goal:** "Set up my family so this works for all of us."
**Traceability:** MRD §14 (North Star) · PRD P0 #6 · Story: household anchor · EPIC_HOUSEHOLD · FEAT_HOUSEHOLD · FLOW A3 · APIs: API_POST_HOUSEHOLD, API_POST_HOUSEHOLD_MEMBER · DB: HOUSEHOLD, HOUSEHOLD_MEMBER · QA_ONB_HH_001…

**Entry Points:** From SCR_ONBOARDING_TRADITION_001; also reachable from SCR_HOUSEHOLD_001 later. **Exit Points:** ✔ household saved (≥self) → SCR_ONBOARDING_RITUALTIME_001 · ✖ skip members → single-member household.

**Components:** CMP_TEXT_INPUT (household name), CMP_MEMBER_ROW (add), CMP_ROLE_PICKER, CMP_DEPTH_TOGGLE (Quick/Deep), CMP_PRIMARY_BUTTON, CMP_TEXT_BUTTON (Skip for now). **Primary CTA:** "Continue". **Secondary CTA:** "Add a family member"; "Skip for now". **Navigation:** Onboarding stack; Back → Tradition.

**Inputs:** household name (string, 1–40 chars); per member: name (string), role (enum {Anchor,Parent,Elder,Youth,Other}), depth (enum {Quick,Deep}). **Outputs:** HOUSEHOLD + HOUSEHOLD_MEMBER records; current user set as Anchor/owner. **Validation:** household name required (default "My Household" if blank); member name required if a member row is added → inline error → `ERR_UNKNOWN` only on save failure; no numeric-only names warned softly (A3).

**States:** • **Default:** household name field pre-filled editable; "Add member" affordance. • **Loading:** save spinner on Continue. • **Skeleton:** N/A — local form. • **Empty:** zero added members is valid (solo household). • **Offline:** form works; save queued (optimistic) and synced later. • **Error:** save fails → retain all input, inline retry (`ERR_NETWORK_TIMEOUT`/`ERR_OFFLINE`). • **Success:** household created (EVT_006), members added (EVT_007 each).

**Accessibility:** ✓ Each field labeled; role/depth pickers SR-operable with current value announced · ✓ Add/remove member buttons labeled with member context · ✓ Errors tied to fields, announced · ✓ Dynamic Type on member list · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_006 (Household Created), EVT_007 (Member Added). **Performance Budget:** optimistic save ack < 100 ms; confirmed < 2 s. **Backend Dependencies:** API_POST_HOUSEHOLD, API_POST_HOUSEHOLD_MEMBER. **Design Tokens:** color.surface.primary, typography.label.medium, spacing.md, radius.md.
**Acceptance Criteria:**
- AC-ONB-HH-01 — Given a household name (or the default), when the user continues, then a HOUSEHOLD is created with the current user as Anchor/owner and EVT_006 fires.
- AC-ONB-HH-02 — Given a member is added with name+role+depth, when saved, then a HOUSEHOLD_MEMBER is created with those values and EVT_007 fires.
- AC-ONB-HH-03 — Given a save error, when it occurs, then all entered input is preserved and a retry is offered (no data loss).
- AC-ONB-HH-04 — Given the user skips members, when continuing, then a valid single-member household exists.
**Open Questions:** None (roles/depth enums fixed by A3; one-household-per-user is `[PRD FOLLOW-UP] F-2`).

---

### SCR_ONBOARDING_RITUALTIME_001 — Ritual Time Select

**Purpose:** Capture the user's preferred daily ritual time (implementation intention) to schedule the personalized morning reminder.
**Business Goal:** Stronger habit formation & notification relevance (opt-in ≥60%, morning open ≥35%). **User Goal:** "Pick when my daily moment happens."
**Traceability:** MRD §1 (habit) · PRD (onboarding; daily loop) · Story: emotional JTBD · EPIC_HABIT · FEAT_REMINDERS · FLOW A1 · APIs: API_POST_PROFILE · DB: USER(ritual_time) · QA_ONB_TIME_001…

**Entry Points:** From SCR_ONBOARDING_HOUSEHOLD_001; editable later in SCR_SETTINGS_001 (notifications). **Exit Points:** ✔ time set → SCR_ONBOARDING_PANCHANG_001.

**Components:** CMP_TIME_PICKER, CMP_PRESET_CHIP (Sunrise/Morning/Evening presets), CMP_PRIMARY_BUTTON. **Primary CTA:** "Continue". **Secondary CTA:** preset chips. **Navigation:** Onboarding stack; Back → Household.

**Inputs:** ritual time (local time) or preset. **Outputs:** `ritual_time` on profile (used by notification scheduler). **Validation:** valid time; default = location sunrise + offset if untouched **[ASSUMPTION P2-A2]**.

**States:** • **Default:** picker defaulted to a sensible morning time; presets above. • **Loading:** N/A. • **Skeleton:** N/A. • **Empty:** N/A (always a default). • **Offline:** works locally; scheduling applied when notif permission granted/online. • **Error:** save fail → retry (`ERR_OFFLINE`). • **Success:** time saved (EVT_008).

**Accessibility:** ✓ Time picker SR-operable (native), value announced · ✓ Preset chips labeled with resulting time · ✓ Dynamic Type · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_008 (Ritual Time Set). **Performance Budget:** interaction < 100 ms. **Backend Dependencies:** API_POST_PROFILE. **Design Tokens:** color.surface.primary, radius.pill, spacing.md, typography.body.large.
**Acceptance Criteria:**
- AC-ONB-TIME-01 — Given the picker, when the user sets a time or picks a preset and continues, then `ritual_time` persists and EVT_008 fires.
- AC-ONB-TIME-02 — Given the user leaves the default untouched, when continuing, then a sensible location-sunrise-based default is stored.
**Open Questions:** None.

---

### SCR_ONBOARDING_PANCHANG_001 — First Panchang Reveal (Value Moment)

**Purpose:** Deliver the first genuine payoff — the user's own location-correct panchang — *before* asking for notification permission. This is the activation value moment.
**Business Goal:** Drive activation (household + first panchang + notif; ≥55%, Annex A1) and D1 return. **User Goal:** "See that this actually knows today for me."
**Traceability:** MRD §7 · PRD P0 #1 (+ onboarding "value first") · Story: functional JTBD · EPIC_PANCHANG · FEAT_DAILY_PANCHANG · FLOW A1 · APIs: API_GET_TODAY · DB: PANCHANG, USER · QA_ONB_PAN_001…

**Entry Points:** From SCR_ONBOARDING_RITUALTIME_001. **Exit Points:** ✔ "Continue" → SCR_ONBOARDING_NOTIF_001.

**Components:** CMP_PANCHANG_CARD (reveal variant), CMP_LOCATION_CHIP ("Panchang for {city, tz}"), CMP_PRIMARY_BUTTON. **Primary CTA:** "Continue". **Secondary CTA:** "How we calculate this" → CMP_INFO_SHEET (trust). **Navigation:** Onboarding stack; Back → Ritual time.

**Inputs:** N/A — display. **Outputs:** first-panchang-viewed activation signal (EVT_009). **Validation:** N/A.

**States:** • **Default:** animated reveal of today's tithi/nakshatra/festival + location chip. • **Loading:** brief panchang skeleton while API_GET_TODAY resolves. • **Skeleton:** CMP_SKELETON panchang card. • **Empty:** N/A — always a computed panchang (engine can compute offline-estimated if needed). • **Offline:** show best-effort/estimated panchang with "we'll refine when online" note (`ERR_OFFLINE`); still reveal value. • **Error:** `ERR_PANCHANG_UNAVAILABLE` → graceful "we couldn't load today's panchang — retry" without breaking onboarding; allow continue. • **Success:** reveal completes; EVT_009 fires.

**Accessibility:** ✓ Reveal animation decorative; SR reads the panchang values in logical order regardless of animation · ✓ Reduced-Motion → static reveal · ✓ Location chip labeled · ✓ Dynamic Type on data · ✓ WCAG AA (muhurta states not color-only) · ✓ "How we calculate this" reachable by SR.
**Analytics Events:** EVT_009 (First Panchang Viewed). **Performance Budget:** reveal < 2 s (network) / < 500 ms (estimated-cached). **Backend Dependencies:** API_GET_TODAY. **Design Tokens:** color.surface.raised, color.accent.auspicious, color.accent.caution, typography.display.small, motion.reveal.panchang, motion.reduced.crossfade.
**Acceptance Criteria:**
- AC-ONB-PAN-01 — Given ritual time is set, when this screen loads, then today's panchang for the user's location renders and EVT_009 fires.
- AC-ONB-PAN-02 — Given no connectivity, when the screen loads, then an estimated panchang reveals with a refine-later note; onboarding is not blocked.
- AC-ONB-PAN-03 — Given Reduced Motion, when the screen loads, then the panchang appears without animation and is fully readable by a screen reader.
**Open Questions:** OQ — availability of offline-estimated panchang depends on the engine's on-device capability (engineering/TDD); if unavailable, fallback copy per Edge Cases (Part 5 §12).

---

### SCR_ONBOARDING_NOTIF_001 — Notification Permission

**Purpose:** Earn the notification opt-in *after* the value moment, via an in-app priming screen that gates the one-shot OS dialog.
**Business Goal:** Opt-in ≥60% (Annex A4); notifications are the v1 re-engagement engine. **User Goal:** "Get a gentle daily reminder if I want one."
**Traceability:** MRD §14 · PRD (defer notif until after panchang) · Story: habit · EPIC_HABIT · FEAT_NOTIFICATIONS · FLOW A4 · APIs: API_POST_NOTIF_SCHEDULE, API_POST_NOTIF_TOKEN · DB: USER(notif_prefs) · QA_ONB_NOTIF_001…

**Entry Points:** From SCR_ONBOARDING_PANCHANG_001; soft re-prompt after 2 completed loops; SCR_SETTINGS_001. **Exit Points:** ✔ granted → schedule → SCR_HOME_001 (activation may fire) · ✖ "Not now" → SCR_HOME_001 (no OS prompt burned).

**Components:** CMP_PERMISSION_PRIMING (illustration + benefit copy), CMP_PRIMARY_BUTTON, CMP_TEXT_BUTTON (Not now). **Primary CTA:** "Yes, remind me" → OS dialog. **Secondary CTA:** "Not now". **Navigation:** Onboarding stack (last step); Back disabled to avoid loop; completing routes to Today.

**Inputs:** OS permission result. **Outputs:** notif permission state; scheduled morning reminder at `ritual_time`; push token registered. **Validation:** only call OS dialog after in-app "Yes" (UX-4) → deny maps to `ERR_NOTIF_DENIED` (non-blocking).

**States:** • **Default:** priming with benefit ("a gentle nudge for your daily moment"). • **Loading:** brief spinner while scheduling. • **Skeleton:** N/A. • **Empty:** N/A. • **Offline:** record intent; schedule locally; sync token when online. • **Error:** `ERR_NOTIF_DENIED` → "You can enable anytime in Settings" + continue; scheduling error → retry silently later. • **Success:** reminder scheduled; toast "You're all set 🪔"; activation event (EVT_011) evaluated.

**Accessibility:** ✓ Priming content SR-readable before OS dialog · ✓ CTAs clearly labeled · ✓ Dynamic Type · ✓ ≥44/48 · ✓ WCAG AA · ✓ toast has SR announcement.
**Analytics Events:** EVT_010 (Notification Permission Result), EVT_011 (Activation Completed — if all three sub-goals met). **Performance Budget:** priming→OS dialog < 300 ms. **Backend Dependencies:** API_POST_NOTIF_SCHEDULE, API_POST_NOTIF_TOKEN. **Design Tokens:** color.surface.primary, typography.title.large, spacing.lg, radius.md, motion.success.small.
**Acceptance Criteria:**
- AC-ONB-NOTIF-01 — Given the priming screen, when the user taps "Yes, remind me", then (and only then) the OS permission dialog is shown.
- AC-ONB-NOTIF-02 — Given the user taps "Not now", when advancing, then the OS dialog is NOT triggered and the app proceeds to Today.
- AC-ONB-NOTIF-03 — Given permission is granted, when scheduling completes, then a morning reminder is set at `ritual_time` and EVT_010(grant) fires.
- AC-ONB-NOTIF-04 — Given household + first panchang + notifications enabled in this session, when this screen completes, then EVT_011 (Activation Completed) fires exactly once.
**Open Questions:** None.

---

## Area B — Authentication (deferred; §2.4)

> Auth is requested only for cross-device continuity or household features (UX-2). These screens are reached from a household/cross-device action or from Settings — never as a wall before value.

---

### SCR_AUTH_001 — Sign-in Options

**Purpose:** Offer lightweight sign-in (Apple/Google/Email) and, on success, merge the anonymous local profile into a full account.
**Business Goal:** Cross-device retention; household enablement; auth completion ≥85% (Annex E1). **User Goal:** "Save my progress / join my family across devices."
**Traceability:** MRD §10 (household moat) · PRD (household-based accounts) · Story: anchor · EPIC_ACCOUNT · FEAT_AUTH · FLOW E1 · APIs: API_POST_AUTH_APPLE, API_POST_AUTH_GOOGLE, API_POST_AUTH_MERGE · DB: USER, SESSION · QA_AUTH_001…

**Entry Points:** From SCR_HOUSEHOLD_INVITE_001 (join/invite); "Sign in to save" affordances; SCR_SETTINGS_001 → Account. **Exit Points:** ✔ authenticated + merged → returns to originating context · ✖ cancel → prior screen (still anonymous) · → SCR_AUTH_EMAIL_001 (email path) · → SCR_AUTH_RECOVERY_001.

**Components:** CMP_AUTH_BUTTON (Apple), CMP_AUTH_BUTTON (Google), CMP_SECONDARY_BUTTON (Email), CMP_TEXT_BUTTON (Trouble signing in?), CMP_LEGAL_FOOTNOTE. **Primary CTA:** provider buttons. **Secondary CTA:** "Continue with email"; "Trouble signing in?". **Navigation:** Modal/stack from originating context; Back → cancel (remain anonymous).

**Inputs:** provider selection; OAuth result. **Outputs:** authenticated session; anon→auth merge (A7). **Validation:** provider token validity → `ERR_AUTH_FAILED`; merge conflict → `ERR_AUTH_MERGE_CONFLICT` (resolve by union/longer-streak, inform user).

**States:** • **Default:** provider buttons + email + legal footnote. • **Loading:** provider round-trip spinner on tapped button. • **Skeleton:** N/A. • **Empty:** N/A. • **Offline:** auth requires network → disabled buttons + `ERR_OFFLINE` note "Connect to sign in." • **Error:** `ERR_AUTH_FAILED` inline; `ERR_AUTH_MERGE_CONFLICT` → brief explainer of what was kept. • **Success:** returns to originating context; toast "Signed in."

**Accessibility:** ✓ Provider buttons labeled with provider name + "sign in" · ✓ Legal links reachable/labeled · ✓ Loading state announced · ✓ ≥44/48 · ✓ Dynamic Type · ✓ WCAG AA (Apple/Google button contrast per brand + AA).
**Analytics Events:** EVT_044 (Auth Started), EVT_045 (Auth Completed). **Performance Budget:** OAuth round-trip < 2 s. **Backend Dependencies:** API_POST_AUTH_APPLE, API_POST_AUTH_GOOGLE, API_POST_AUTH_MERGE. **Design Tokens:** color.surface.primary, color.text.secondary, radius.md, spacing.md, typography.body.large.
**Acceptance Criteria:**
- AC-AUTH-01 — Given a provider sign-in succeeds, when the session is established, then the anonymous local profile (streak/history/preferences) is merged with zero data loss and EVT_045 fires.
- AC-AUTH-02 — Given a merge conflict (`ERR_AUTH_MERGE_CONFLICT`), when resolving, then the union / longer-streak is kept and the user is informed of what was preserved.
- AC-AUTH-03 — Given no connectivity, when the screen loads, then sign-in is disabled with a clear "connect to sign in" message.
- AC-AUTH-04 — Given the user cancels, when leaving, then they return to the originating screen still anonymous and fully functional.
**Open Questions:** None (merge logic is `[PRD FOLLOW-UP] F-1`).

---

### SCR_AUTH_EMAIL_001 — Email OTP / Magic Link

**Purpose:** Passwordless email sign-in via OTP or magic link.
**Business Goal:** Inclusive auth for non-Apple/Google users; completion ≥85%. **User Goal:** "Sign in with my email, no password."
**Traceability:** PRD (auth) · EPIC_ACCOUNT · FEAT_AUTH · FLOW E1 · APIs: API_POST_AUTH_EMAIL_START, API_POST_AUTH_EMAIL_VERIFY, API_POST_AUTH_MERGE · DB: USER, SESSION · QA_AUTH_EMAIL_001…

**Entry Points:** From SCR_AUTH_001 (email). **Exit Points:** ✔ verified + merged → originating context · ✖ cancel → SCR_AUTH_001.

**Components:** CMP_TEXT_INPUT (email), CMP_OTP_INPUT, CMP_PRIMARY_BUTTON, CMP_TEXT_BUTTON (Resend w/ countdown). **Primary CTA:** "Send code" → then "Verify". **Secondary CTA:** "Resend" (rate-limited); "Use a different email". **Navigation:** Auth stack; Back → SCR_AUTH_001.

**Inputs:** email (validated format); OTP (6-digit) or magic-link tap. **Outputs:** verified session; merge. **Validation:** email regex → inline error; OTP length/expiry → `ERR_AUTH_FAILED`; resend rate-limited.

**States:** • **Default:** email entry. • **Loading:** send/verify spinner. • **Skeleton:** N/A. • **Empty:** N/A. • **Offline:** `ERR_OFFLINE` — "Connect to receive your code." • **Error:** invalid/expired OTP → inline; too many attempts → cool-down message. • **Success:** verified → merge → return.

**Accessibility:** ✓ Email field labeled, keyboard=email · ✓ OTP field announces per-digit and completion · ✓ Resend countdown announced (`accessibilityLiveRegion`) · ✓ errors tied to fields · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_044, EVT_045. **Performance Budget:** OTP verify < 1.5 s; send dispatch < 1 s. **Backend Dependencies:** API_POST_AUTH_EMAIL_START, API_POST_AUTH_EMAIL_VERIFY, API_POST_AUTH_MERGE. **Design Tokens:** color.surface.primary, color.border.focus, radius.md, spacing.md, typography.body.large.
**Acceptance Criteria:**
- AC-AUTH-EMAIL-01 — Given a valid email, when "Send code" is tapped, then an OTP/magic link is dispatched and the verify state appears.
- AC-AUTH-EMAIL-02 — Given a correct OTP within expiry, when verified, then the session is established, merged, and the user returns to the originating context.
- AC-AUTH-EMAIL-03 — Given an expired/invalid OTP (`ERR_AUTH_FAILED`), when submitted, then an inline error shows and a rate-limited resend is offered.
**Open Questions:** OQ — OTP vs. magic-link default per platform; both supported, default choice is engineering/TDD.

---

### SCR_AUTH_RECOVERY_001 — Account Recovery

**Purpose:** Recover access for a locked-out user with minimal friction; route provider users to the right recovery.
**Business Goal:** Recovery success ≥90% (Annex E2); prevent permanent lockout churn. **User Goal:** "Get back into my account."
**Traceability:** PRD (auth) · EPIC_ACCOUNT · FEAT_AUTH · FLOW E2 · APIs: API_POST_AUTH_EMAIL_START, API_POST_SUPPORT_TICKET · DB: USER · QA_AUTH_REC_001…

**Entry Points:** From SCR_AUTH_001 ("Trouble signing in?"). **Exit Points:** ✔ access restored → originating context · ✖ cannot verify → support path (API_POST_SUPPORT_TICKET).

**Components:** CMP_TEXT_INPUT (email), CMP_PRIMARY_BUTTON, CMP_INFO_BANNER (provider guidance), CMP_TEXT_BUTTON (Contact support). **Primary CTA:** "Send recovery link". **Secondary CTA:** "Try a different email"; "Contact support". **Navigation:** Auth stack; Back → SCR_AUTH_001.

**Inputs:** email; (for Apple/Google) redirect to provider recovery. **Outputs:** fresh magic link/OTP; or support ticket. **Validation:** email format; provider path shows external-recovery guidance.

**States:** • **Default:** email entry + provider guidance. • **Loading:** send spinner. • **Skeleton:** N/A. • **Empty:** N/A. • **Offline:** `ERR_OFFLINE`. • **Error:** not received → resend / spam guidance / support. • **Success:** "Check your email" confirmation.

**Accessibility:** ✓ Labeled field + guidance region · ✓ Support action reachable · ✓ WCAG AA · ✓ ≥44/48 · ✓ Dynamic Type.
**Analytics Events:** EVT_046 (Account Recovery Requested), EVT_045 (on success). **Performance Budget:** resend dispatch < 1 s. **Backend Dependencies:** API_POST_AUTH_EMAIL_START, API_POST_SUPPORT_TICKET. **Design Tokens:** color.surface.primary, color.text.secondary, spacing.md, radius.md.
**Acceptance Criteria:**
- AC-AUTH-REC-01 — Given an email account, when "Send recovery link" is tapped, then a fresh link/OTP is sent and a confirmation is shown.
- AC-AUTH-REC-02 — Given a provider (Apple/Google) account, when recovery is requested, then the user is guided to the provider's recovery with clear instructions.
- AC-AUTH-REC-03 — Given the user cannot verify, when all options are exhausted, then a support path is offered (never a dead end).
**Open Questions:** None.

---

## Area C — Today (Tab 1)

---

### SCR_HOME_001 — Today (Home)

**Purpose:** The daily loop's home surface — today's location-correct panchang, a variable-reward rotating element, today's ritual + checklist, any festival, and the (gentle) streak. Time-to-value < 10 s.
**Business Goal:** Drives the North Star (Weekly Household Ritual Completions), D7/D30 retention, and ritual completion ≥70% (Annexes A2/B1). **User Goal:** "See what today is and do my daily moment."
**Traceability:** MRD §7, §14 · PRD P0 #1/#3/#5 · Story: functional+emotional JTBD · EPIC_PANCHANG/EPIC_RITUAL · FEAT_DAILY_PANCHANG, FEAT_GUIDED_RITUAL, FEAT_STREAK · FLOW B1/A2 · APIs: API_GET_TODAY, API_GET_RITUAL, API_GET_STREAK, API_GET_CONTENT_ROTATING, API_GET_CHECKLIST · DB: PANCHANG, RITUAL, RITUAL_COMPLETION, STREAK, FESTIVAL · QA_HOME_001…

**Entry Points:** Default landing (returning user, A2); morning/streak push `panchangpal://today`; tab tap; ritual completion return. **Exit Points:** → SCR_PANCHANG_DETAIL_001; → SCR_RITUAL_001 ("Begin"); → SCR_FESTIVAL_DETAIL_001; → SCR_ACHIEVEMENTS_001 (streak); tab switches.

**Components:** CMP_APP_HEADER (+ CMP_LOCATION_CHIP), CMP_PANCHANG_CARD (summary), CMP_ROTATING_ELEMENT (quote/fact), CMP_RITUAL_CARD (today), CMP_CHECKLIST, CMP_FESTIVAL_CARD (conditional), CMP_STREAK_COUNTER (gentle), CMP_BOTTOM_TAB_BAR. **Primary CTA:** "Begin" on CMP_RITUAL_CARD → SCR_RITUAL_001. **Secondary CTA:** panchang card tap; checklist toggles; festival card; "Ask about today" (contextual → SCR_GURU_CHAT_001, UX-6). **Navigation:** Tab 1 root; own stack; Back within stack returns here.

**Inputs:** checklist toggles; pull-to-refresh. **Outputs:** rendered daily state; completion/checklist writes; streak state. **Validation:** day-boundary check resets today's ritual/checklist; completion optimistic-then-synced (A4) → `ERR_SYNC_CONFLICT` resolved silently.

**States:** • **Default (returning):** cached panchang + ritual + rotating element painted instantly; background refresh. • **Loading:** subtle top refresh indicator on pull-to-refresh. • **Skeleton:** first-ever/no-cache → CMP_SKELETON for panchang/ritual cards. • **Empty:** no ritual configured for the day (rare) → "No guided ritual today — here's today's reflection" fallback with rotating element + checklist. • **Offline:** cached panchang/ritual/checklist fully usable; `ERR_OFFLINE` chip; audio-if-not-cached shows text-only note. • **Error:** `ERR_PANCHANG_UNAVAILABLE` → panchang card error micro-state with retry, rest of screen still usable; `ERR_NETWORK_TIMEOUT` on refresh → keep cache, quiet retry. • **Success (completed):** ritual card → "Done for today 🪔" state; streak reflects; calm, no confetti.

**Accessibility:** ✓ Logical SR order: header→location→panchang→rotating→ritual→checklist→festival→streak · ✓ CMP_STREAK_COUNTER exposes `accessibilityValue` (e.g., "12 day streak") and is not the first/dominant element · ✓ Muhurta/auspicious cues carry text, not color-only · ✓ Pull-to-refresh has an accessible alternative (refresh via header action) · ✓ Reduced-Motion honored on refresh/rotating transitions · ✓ Dynamic Type reflows cards, no clipping · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_012 (Today Viewed), EVT_014 (Rotating Element Viewed), EVT_019 (Checklist Item Completed), EVT_053 (Offline State Shown, if offline), EVT_054 (Error Shown w/ code). **Performance Budget:** cached render < 500 ms; network refresh < 2 s; checklist toggle ack < 100 ms. **Backend Dependencies:** API_GET_TODAY, API_GET_RITUAL, API_GET_STREAK, API_GET_CONTENT_ROTATING, API_GET_CHECKLIST, API_POST_CHECKLIST_COMPLETE. **Design Tokens:** color.surface.primary, color.surface.raised, color.accent.auspicious, color.accent.caution, typography.display.small, typography.title.medium, spacing.lg, radius.lg, elevation.card, motion.reduced.crossfade.
**Acceptance Criteria:**
- AC-HOME-01 — Given a returning onboarded user with cache, when Today opens, then cached panchang + ritual render < 500 ms before any network refresh, and EVT_012 fires.
- AC-HOME-02 — Given a new day since last open, when Today loads, then today's ritual/checklist reset to incomplete and a new rotating element shows.
- AC-HOME-03 — Given offline, when Today opens, then cached panchang/ritual/checklist are usable and an offline indicator appears (EVT_053); no crash or blank.
- AC-HOME-04 — Given the panchang service fails (`ERR_PANCHANG_UNAVAILABLE`), when Today loads, then only the panchang card shows an error+retry while ritual/checklist remain usable.
- AC-HOME-05 — Given today's ritual is completed, when returning to Today, then the ritual card shows the calm completed state and the streak reflects the advance (with grace-day logic).
- AC-HOME-06 — Given a screen reader, when Today is read, then order is header→location→panchang→rotating→ritual→checklist→festival→streak and the streak is not the dominant first element.
**Open Questions:** None.

---

### SCR_PANCHANG_DETAIL_001 — Panchang Detail

**Purpose:** Full, accurate panchang (tithi, nakshatra, yoga, karana, sunrise/sunset, muhurta, Rahu Kaal) with plain-language explainers and a visible accuracy note.
**Business Goal:** Depth engagement (view rate ≥25% WAU, Annex B3); visible accuracy → trust (moat). **User Goal:** "See the full, correct details for today (or a chosen day)."
**Traceability:** MRD §7 · PRD P0 #1 · EPIC_PANCHANG · FEAT_DAILY_PANCHANG · FLOW B3 · APIs: API_GET_PANCHANG_DETAIL, API_GET_GLOSSARY · DB: PANCHANG · QA_PAN_001…

**Entry Points:** SCR_HOME_001 (panchang card); SCR_CALENDAR_DAY_001. **Exit Points:** Back → origin; "What is X?" → CMP_INFO_SHEET or SCR_GURU_CHAT_001 (seeded); "How we calculate this" → CMP_INFO_SHEET.

**Components:** CMP_PANCHANG_DETAIL_LIST (grouped rows), CMP_INFO_AFFORDANCE, CMP_LOCATION_CHIP, CMP_INFO_SHEET. **Primary CTA:** N/A — reading surface. **Secondary CTA:** glossary affordances; "Ask Guru about this"; "How we calculate this". **Navigation:** Tab 1 stack (or Tab 2 if opened from Calendar); Back to parent.

**Inputs:** optional date (from Calendar). **Outputs:** full panchang for the day. **Validation:** date within supported range → else `ERR_CALENDAR_ERROR`.

**States:** • **Default:** grouped elements with labels + info affordances. • **Loading:** row skeletons. • **Skeleton:** CMP_SKELETON rows. • **Empty:** a specific element unavailable → that row shows "—" micro-empty, screen still renders. • **Offline:** cached day renders; uncached day → `ERR_OFFLINE` with retry. • **Error:** `ERR_PANCHANG_UNAVAILABLE`/`ERR_CALENDAR_ERROR` → full-screen error+retry only if nothing cached. • **Success:** full render.

**Accessibility:** ✓ Grouped SR headings (Tithi, Nakshatra, Muhurta…) · ✓ Muhurta auspicious/inauspicious carry text label + icon (color-independent) · ✓ Info affordances labeled and operable · ✓ Dynamic Type on dense rows (no truncation) · ✓ WCAG AA · ✓ ≥44/48.
**Analytics Events:** EVT_013 (Panchang Detail Viewed). **Performance Budget:** cached render < 300 ms. **Backend Dependencies:** API_GET_PANCHANG_DETAIL, API_GET_GLOSSARY. **Design Tokens:** color.surface.primary, color.accent.auspicious, color.accent.caution, typography.title.small, typography.body.medium, spacing.md, radius.md.
**Acceptance Criteria:**
- AC-PAN-01 — Given Today's panchang card is tapped, when detail opens, then all supported elements render grouped with labels and EVT_013 fires.
- AC-PAN-02 — Given a single element is unavailable, when detail renders, then that element degrades to "—" without failing the screen.
- AC-PAN-03 — Given a color-blind user, when muhurta states render, then each state is distinguishable by text/icon, not color alone.
**Open Questions:** None.

---

### SCR_RITUAL_001 — Guided Ritual Player

**Purpose:** Immersive, completable guided ritual (regionalized text + audio) with intro, stepped guidance, and a calm completion reward that advances the streak and North Star.
**Business Goal:** Ritual completion ≥70%, avg time < 90 s (Annex B1); the core habit action. **User Goal:** "Do today's ritual, guided, in the time I have."
**Traceability:** MRD §1 · PRD P0 #3/#5 · Story: emotional JTBD · EPIC_RITUAL · FEAT_GUIDED_RITUAL · FLOW B1 · APIs: API_GET_RITUAL, API_GET_RITUAL_AUDIO, API_POST_RITUAL_COMPLETE, API_POST_STREAK_ADVANCE · DB: RITUAL, RITUAL_COMPLETION, STREAK · QA_RIT_001…

**Entry Points:** SCR_HOME_001 "Begin"; SCR_FESTIVAL_DETAIL_001 "Observe now"; resume from Home ("Continue today's ritual"). **Exit Points:** ✔ complete → reward → back to SCR_HOME_001 (completed); ✖ leave mid-ritual → progress saved, no penalty; "Ask Guru about this" → SCR_GURU_CHAT_001.

**Components:** CMP_RITUAL_INTRO, CMP_RITUAL_STEP, CMP_PROGRESS_RING, CMP_AUDIO_CONTROLS, CMP_PRIMARY_BUTTON (Next/Complete), CMP_COMPLETION_MOMENT, CMP_ICON_BUTTON (pause/close). **Primary CTA:** "Begin" → "Next" ×N → "Complete". **Secondary CTA:** audio play/pause; "Read more"; "Ask Guru about this"; close. **Navigation:** Immersive (tab bar hidden); Android back / close → "Leave ritual? Progress saved" confirm.

**Inputs:** step advance; audio toggle; pause/resume. **Outputs:** RITUAL_COMPLETION (client-authoritative for the day, A4); streak advance; North Star increment. **Validation:** completion recorded once/day; offline completion queued → `ERR_SYNC_CONFLICT` resolved by client-authoritative rule.

**States:** • **Default (intro):** what/why + "Begin". • **Loading:** audio buffering indicator (text continues). • **Skeleton:** step content skeleton if fetched. • **Empty:** N/A — ritual always has ≥1 step (else Home empty-state fallback). • **Offline:** cached text steps fully usable; audio not cached → `ERR_AUDIO_UNAVAILABLE` → text-only + toast. • **Error:** step fetch fail → retry; completion write fail offline → queue + optimistic advance. • **Success (complete):** CMP_COMPLETION_MOMENT (soft glow + optional mutable chime + haptic `haptic.success`), streak advance, "Done for today."

**Accessibility:** ✓ Full text parity with audio (deaf/HoH) · ✓ Audio-focus management so SR and narration don't collide (pause narration when SR speaks) · ✓ CMP_PROGRESS_RING exposes `accessibilityValue` ("step 2 of 4") · ✓ Pause/resume/close SR-operable and labeled · ✓ Reduced-Motion → completion cross-fade, no burst (`motion.reduced.crossfade`) · ✓ chime is off by default or user-mutable · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_015 (Ritual Started), EVT_016 (Ritual Step Advanced), EVT_017 (Ritual Completed), EVT_018 (Ritual Abandoned), EVT_020 (Streak Advanced), EVT_021 (Grace Day Used, if applicable). **Performance Budget:** "Begin"→first step < 400 ms; audio start (cached) < 500 ms; completion animation ≤ 1.2 s; completion ack < 100 ms. **Backend Dependencies:** API_GET_RITUAL, API_GET_RITUAL_AUDIO, API_POST_RITUAL_COMPLETE, API_POST_STREAK_ADVANCE. **Design Tokens:** color.surface.immersive, color.brand.primary, typography.title.large, typography.body.large, motion.success.small, motion.ritual.step, motion.reduced.crossfade, haptic.success, duration.completion.
**Acceptance Criteria:**
- AC-RIT-01 — Given "Begin", when the ritual starts, then the first step renders < 400 ms and EVT_015 fires.
- AC-RIT-02 — Given the user completes all steps, when the completion moment plays, then RITUAL_COMPLETION is recorded, the streak advances (grace-day aware), EVT_017 + EVT_020 fire, and the user returns to Today in the completed state.
- AC-RIT-03 — Given the user leaves mid-ritual, when they return to Today, then a "Continue today's ritual" affordance resumes at the saved step and no penalty is applied.
- AC-RIT-04 — Given audio is unavailable offline (`ERR_AUDIO_UNAVAILABLE`), when a step loads, then full text is shown and a non-blocking "audio needs internet" note appears.
- AC-RIT-05 — Given Reduced Motion, when the ritual completes, then a calm cross-fade replaces any celebratory burst.
- AC-RIT-06 — Given a screen reader user, when narration and SR would overlap, then narration pauses so the SR is intelligible.
**Open Questions:** None.

---

## Area D — Calendar (Tab 2)

---

### SCR_CALENDAR_001 — Calendar (Month)

**Purpose:** Browse festivals, vrats, and personal dates by month in the user's regional variant, with a tradition switcher and quick jump-to-today.
**Business Goal:** Calendar engagement ≥30% WAU (Annex C3); festival awareness drives re-engagement. **User Goal:** "See what's coming this month for my tradition and my family."
**Traceability:** MRD §7/§9 · PRD P0 #2, #7 · EPIC_CALENDAR · FEAT_CALENDAR, FEAT_SHRADDHA_DATES · FLOW C3 · APIs: API_GET_CALENDAR, API_GET_PERSONAL_DATES, API_POST_PROFILE_TRADITION · DB: FESTIVAL, PERSONAL_DATE, USER · QA_CAL_001…

**Entry Points:** Tab 2 tap; deep links to a month; from Festival detail back. **Exit Points:** → SCR_CALENDAR_DAY_001; → SCR_FESTIVAL_DETAIL_001; → SCR_PERSONAL_DATES_001; tradition switch (in place).

**Components:** CMP_MONTH_GRID, CMP_DAY_CELL (markers: festival ●, vrat ○, personal ◆), CMP_MONTH_NAV, CMP_TRADITION_SWITCHER, CMP_TEXT_BUTTON (Today), CMP_SEGMENTED (optional list/grid). **Primary CTA:** select a day. **Secondary CTA:** month nav; tradition switch; "Personal & family dates". **Navigation:** Tab 2 root; own stack.

**Inputs:** month navigation (swipe/arrows); day selection; tradition change. **Outputs:** month of events; selected-day route. **Validation:** month within supported range → `ERR_CALENDAR_ERROR`; tradition change re-renders.

**States:** • **Default:** current month with markers + today highlighted. • **Loading:** month content shimmer while fetching. • **Skeleton:** CMP_SKELETON grid. • **Empty:** a month with no events → calm "No festivals or vrats this month" (personal dates still shown). • **Offline:** cached months usable; uncached month → `ERR_OFFLINE` with retry on that month. • **Error:** `ERR_CALENDAR_ERROR` → month error+retry, other months usable. • **Success:** rendered month; switch confirmation on tradition change.

**Accessibility:** ✓ Day cells labeled with date + event types by text (not marker-color only) · ✓ Month swipe has button equivalents (CMP_MONTH_NAV) · ✓ "Today" jump labeled · ✓ Tradition switcher announces new selection · ✓ Dynamic Type (cells scale/scroll) · ✓ ≥44/48 cells · ✓ WCAG AA.
**Analytics Events:** EVT_022 (Calendar Viewed), EVT_024 (Regional Variant Switched). **Performance Budget:** cached month < 400 ms; fetched month < 2 s. **Backend Dependencies:** API_GET_CALENDAR, API_GET_PERSONAL_DATES, API_POST_PROFILE_TRADITION. **Design Tokens:** color.surface.primary, color.marker.festival, color.marker.vrat, color.marker.personal, typography.body.small, spacing.sm, radius.sm.
**Acceptance Criteria:**
- AC-CAL-01 — Given the current month, when the calendar opens, then festivals/vrats/personal dates render with today highlighted and EVT_022 fires.
- AC-CAL-02 — Given the user switches tradition, when the month re-renders, then festival naming/dates reflect the new variant and EVT_024 fires.
- AC-CAL-03 — Given an uncached month offline, when navigated to, then an offline+retry state shows for that month without breaking others.
- AC-CAL-04 — Given a color-blind user, when markers render, then event type is conveyed by text/shape, not color alone.
**Open Questions:** None.

---

### SCR_CALENDAR_DAY_001 — Day Detail

**Purpose:** Show a selected day's panchang summary plus that day's festivals/vrats/personal dates, with a route into full panchang detail.
**Business Goal:** Planning value; deepens calendar engagement. **User Goal:** "See everything about a specific day."
**Traceability:** MRD §7 · PRD P0 #1/#2/#7 · EPIC_CALENDAR · FEAT_CALENDAR · FLOW C3 · APIs: API_GET_PANCHANG_DETAIL, API_GET_CALENDAR_DAY · DB: PANCHANG, FESTIVAL, PERSONAL_DATE · QA_CALDAY_001…

**Entry Points:** SCR_CALENDAR_001 day tap. **Exit Points:** → SCR_PANCHANG_DETAIL_001; → SCR_FESTIVAL_DETAIL_001; → SCR_PERSONAL_DATE_EDIT_001 (a personal date); Back → Calendar.

**Components:** CMP_PANCHANG_CARD (summary), CMP_EVENT_LIST (festivals/vrats/personal), CMP_PRIMARY_BUTTON (Full panchang). **Primary CTA:** "See full panchang" → SCR_PANCHANG_DETAIL_001. **Secondary CTA:** event taps. **Navigation:** Tab 2 stack; Back → Calendar.

**Inputs:** selected date (from Calendar). **Outputs:** day summary + events. **Validation:** date range → `ERR_CALENDAR_ERROR`.

**States:** • **Default:** panchang summary + event list. • **Loading:** skeletons. • **Skeleton:** CMP_SKELETON. • **Empty:** no events → "No festivals or observances on this day." • **Offline:** cached day usable; else `ERR_OFFLINE`. • **Error:** `ERR_PANCHANG_UNAVAILABLE`/`ERR_CALENDAR_ERROR` → retry. • **Success:** rendered.

**Accessibility:** ✓ Summary + events in logical SR order · ✓ Events labeled with type · ✓ Dynamic Type · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_013 (if full panchang opened), EVT_023 (if festival opened). **Performance Budget:** cached render < 400 ms. **Backend Dependencies:** API_GET_PANCHANG_DETAIL, API_GET_CALENDAR_DAY. **Design Tokens:** color.surface.primary, typography.title.small, spacing.md, radius.md.
**Acceptance Criteria:**
- AC-CALDAY-01 — Given a day is selected, when Day Detail opens, then its panchang summary and events render.
- AC-CALDAY-02 — Given "See full panchang", when tapped, then SCR_PANCHANG_DETAIL_001 opens for that date.
**Open Questions:** None.

---

### SCR_FESTIVAL_DETAIL_001 — Festival / Vrat Detail

**Purpose:** Explain a festival/vrat — regional name, correct date, significance/story, how to observe — at Quick or Deep depth, with routes to observe (ritual), ask Guru, or (post-v1) share a greeting card.
**Business Goal:** Festival view rate ≥45% from reminders; festival→ritual ≥20% (Annex C1). **User Goal:** "Understand this festival and how to observe it."
**Traceability:** MRD §7 · PRD P0 #2/#3 · Story: social JTBD · EPIC_CONTENT · FEAT_FESTIVALS · FLOW C1 · APIs: API_GET_FESTIVAL, API_GET_RITUAL_BY_FESTIVAL, API_POST_REMINDER · DB: FESTIVAL, RITUAL · QA_FEST_001…

**Entry Points:** Festival push `panchangpal://festival/{id}`; SCR_HOME_001 festival card; SCR_CALENDAR_001/DAY. **Exit Points:** ✔ "Observe now" → SCR_RITUAL_001; "Ask Guru about {festival}" → SCR_GURU_CHAT_001 (seeded); "Remind me" → schedule; "Share greeting card" (FF_GREETING_CARD, post-v1); Back → parent.

**Components:** CMP_FESTIVAL_HEADER, CMP_DEPTH_TOGGLE (Quick/Deep), CMP_CONTENT_BODY, CMP_PRIMARY_BUTTON (Observe now), CMP_SECONDARY_BUTTON (Ask Guru), CMP_TEXT_BUTTON (Remind me), CMP_SHARE_BUTTON (flagged). **Primary CTA:** "Observe now". **Secondary CTA:** Ask Guru; Remind me; Share (flagged). **Navigation:** stack (parent = Calendar or Home per entry); deep-link back-stack = Calendar.

**Inputs:** depth toggle. **Outputs:** festival content; optional reminder; ritual route. **Validation:** festival id valid; regional variant date resolution → `ERR_FESTIVAL_CONFLICT` handled by showing user's tradition's date primary + noting variants.

**States:** • **Default:** header + Quick summary (depth per member setting). • **Loading:** content skeleton. • **Skeleton:** CMP_SKELETON. • **Empty:** no related ritual → hide "Observe now", keep story. • **Offline:** cached festival readable; uncached → `ERR_OFFLINE` + retry. • **Error:** `ERR_FESTIVAL_CONFLICT` → variant note; fetch fail → retry. • **Success:** rendered; reminder confirmation toast if set.

**Accessibility:** ✓ Story/how-to readable at max Dynamic Type · ✓ Quick/Deep toggle SR-operable with state · ✓ CTAs labeled · ✓ variant/date notes announced · ✓ WCAG AA · ✓ ≥44/48.
**Analytics Events:** EVT_023 (Festival Detail Viewed), EVT_041 (if from push). **Performance Budget:** detail < 2 s (network) / < 400 ms (cached). **Backend Dependencies:** API_GET_FESTIVAL, API_GET_RITUAL_BY_FESTIVAL, API_POST_REMINDER. **Design Tokens:** color.surface.primary, typography.display.small, typography.body.medium, spacing.lg, radius.lg.
**Acceptance Criteria:**
- AC-FEST-01 — Given a festival push is tapped, when detail opens, then the regional name + location-correct date render, EVT_023 fires, and Back leads to Calendar.
- AC-FEST-02 — Given a related ritual exists, when "Observe now" is tapped, then SCR_RITUAL_001 opens for that ritual.
- AC-FEST-03 — Given regional variants disagree on the date (`ERR_FESTIVAL_CONFLICT`), when detail renders, then the user's tradition's date is primary and variants are noted, not silently dropped.
- AC-FEST-04 — Given depth = Quick, when detail opens, then the concise summary shows with an option to expand to Deep.
**Open Questions:** OQ — greeting-card sharing is behind FF_GREETING_CARD (post-v1); the button is absent (not "coming soon") when the flag is off (§3.16 design implication).

---

### SCR_PERSONAL_DATES_001 — Personal & Family Dates

**Purpose:** List the user's personal/family observances (shraddha/anniversaries) with next-occurrence dates; entry point to add/edit. Grief-aware treatment (UX-7).
**Business Goal:** Personal-date adoption ≥20% MAU (Annex C2); an unaddressed-competitor differentiator. **User Goal:** "Keep track of the family dates that matter and never miss them."
**Traceability:** MRD §7 (new pain) · PRD P0 #7 · EPIC_CALENDAR · FEAT_SHRADDHA_DATES · FLOW C2 · APIs: API_GET_PERSONAL_DATES · DB: PERSONAL_DATE · QA_PDATES_001…

**Entry Points:** SCR_CALENDAR_001; SCR_PROFILE_001 (optional); personal-date push `panchangpal://personal-date/{id}` → detail/edit. **Exit Points:** → SCR_PERSONAL_DATE_EDIT_001 (add/edit); Back → Calendar.

**Components:** CMP_LIST, CMP_PERSONAL_DATE_ROW (name, relation, next date), CMP_FAB or CMP_PRIMARY_BUTTON (Add a date), CMP_EMPTY_STATE. **Primary CTA:** "Add a date". **Secondary CTA:** row tap → edit. **Navigation:** Tab 2 stack; Back → Calendar.

**Inputs:** N/A (list). **Outputs:** personal dates with computed next occurrence. **Validation:** N/A here (validation in edit screen).

**States:** • **Default:** list sorted by next occurrence. • **Loading:** row skeletons. • **Skeleton:** CMP_SKELETON. • **Empty:** gentle CMP_EMPTY_STATE — "Add the dates you want to remember — birthdays, anniversaries, shraddha. We'll track the tithi for you." + Add CTA (no gamification). • **Offline:** cached list usable; add queued. • **Error:** `ERR_NETWORK_TIMEOUT` → retry; list retains cache. • **Success:** rendered.

**Accessibility:** ✓ Calm/quiet visuals retain WCAG AA contrast · ✓ Rows labeled with name+relation+next date · ✓ Sensitive copy screen-reader-appropriate (no jarring terms) · ✓ Add CTA labeled · ✓ ≥44/48 · ✓ Dynamic Type · ✓ no motion-only cues.
**Analytics Events:** EVT_025 (on add, fired from edit), list view (reuse EVT_022 context or dedicated — **[ASSUMPTION P2-A3]** list view reuses screen-view logging; no gamified events here). **Performance Budget:** cached render < 400 ms. **Backend Dependencies:** API_GET_PERSONAL_DATES. **Design Tokens:** color.surface.muted, color.text.secondary, typography.body.medium, spacing.md, radius.md (no streak/accent-celebration tokens on this surface).
**Acceptance Criteria:**
- AC-PDATES-01 — Given saved personal dates, when the list opens, then each shows its computed next occurrence, sorted soonest-first.
- AC-PDATES-02 — Given no personal dates, when the list opens, then a calm, non-gamified empty state with an Add CTA shows.
- AC-PDATES-03 — Given this surface, when it renders, then no streak, promo, or celebratory element appears (grief-aware, UX-7).
**Open Questions:** None.

---

### SCR_PERSONAL_DATE_EDIT_001 — Add / Edit Personal Date

**Purpose:** Create or edit a personal date that recurs by tithi (auto-updating yearly) or fixed Gregorian, with a calm reminder — fixing the specific competitor bug (broken shraddha auto-update).
**Business Goal:** 100% auto-recurrence accuracy, 0 annual re-entries (Annex C2). **User Goal:** "Add a family date once and trust it recurs correctly every year."
**Traceability:** MRD §7 · PRD P0 #7 (AC: auto-recur without manual re-entry) · EPIC_CALENDAR · FEAT_SHRADDHA_DATES · FLOW C2 · APIs: API_POST_PERSONAL_DATE, API_PATCH_PERSONAL_DATE, API_DELETE_PERSONAL_DATE, API_GET_TITHI_NEXT, API_POST_NOTIF_SCHEDULE · DB: PERSONAL_DATE · QA_PDATE_EDIT_001…

**Entry Points:** SCR_PERSONAL_DATES_001 (Add / row edit). **Exit Points:** ✔ saved → back to list (with next occurrence) · ✖ cancel → list · delete → confirm → list.

**Components:** CMP_TEXT_INPUT (name/relation), CMP_SEGMENTED (Tithi / Gregorian), CMP_TITHI_PICKER, CMP_DATE_PICKER, CMP_REMINDER_LEAD_PICKER, CMP_PRIMARY_BUTTON (Save), CMP_DESTRUCTIVE_BUTTON (Delete, edit mode). **Primary CTA:** "Save". **Secondary CTA:** "Delete" (edit); "Compute from a known Gregorian date" helper. **Navigation:** Tab 2 stack; Back → list (confirm if unsaved changes).

**Inputs:** name/relation (string, required); basis (enum {TITHI, GREGORIAN}); tithi fields (paksha/month/tithi) OR Gregorian date; reminder lead (enum {same-day, 1-day, custom}). **Outputs:** PERSONAL_DATE record + computed next occurrence + scheduled reminder. **Validation:** name required (inline); basis-specific required fields; tithi ambiguity (skip/repeat years) → `ERR_TITHI_AMBIGUOUS` → surface both candidate dates with a gentle explanation (never silent guess).

**States:** • **Default:** empty form (add) or pre-filled (edit). • **Loading:** save/compute spinner. • **Skeleton:** N/A. • **Empty:** N/A. • **Offline:** form works; next-occurrence computed on-device if possible else deferred; save queued (`ERR_OFFLINE`). • **Error:** `ERR_TITHI_AMBIGUOUS` → dual-candidate explainer; save fail → retain input + retry. • **Success:** saved; "We'll remind you every year" confirmation; reminder scheduled.

**Accessibility:** ✓ Tithi/Gregorian segmented control SR-operable with state · ✓ Tithi picker fully SR-operable (paksha/month/tithi announced) · ✓ Sensitive copy respectful for SR · ✓ Destructive delete clearly labeled & confirmed · ✓ errors tied to fields · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_025 (Personal Date Added), EVT_026 (Reminder Fired — later, from scheduler). **Performance Budget:** next-occurrence compute < 1 s; save ack < 100 ms. **Backend Dependencies:** API_POST_PERSONAL_DATE, API_PATCH_PERSONAL_DATE, API_DELETE_PERSONAL_DATE, API_GET_TITHI_NEXT, API_POST_NOTIF_SCHEDULE. **Design Tokens:** color.surface.muted, color.border.focus, typography.label.medium, spacing.md, radius.md.
**Acceptance Criteria:**
- AC-PDATE-EDIT-01 — Given a tithi-based personal date is saved, when a year passes, then the corresponding Gregorian date is recomputed automatically and a reminder fires without manual re-entry (PRD AC).
- AC-PDATE-EDIT-02 — Given a tithi that skips/repeats in a given year (`ERR_TITHI_AMBIGUOUS`), when saving/computing, then both candidate dates are shown with a gentle explanation rather than a silent guess.
- AC-PDATE-EDIT-03 — Given a save error, when it occurs, then all input is preserved and a retry is offered.
- AC-PDATE-EDIT-04 — Given this surface, when it renders, then tone/visuals stay calm and respectful with no gamification (UX-7).
**Open Questions:** OQ — exact tithi skip/repeat resolution rule is an engine/TDD spec (referenced, not defined here).

---

## Area E — Ask Guru (Tab 3)

> AI-specific behavior (RAG, streaming, safety, hallucination recovery, trust messaging) is fully specified in **Part 4 §9**; these screens reference that spec and the Annex D1 AI-dependency contract.

---

### SCR_GURU_HOME_001 — Ask Guru Home

**Purpose:** Invite the user into grounded Q&A with contextual suggested questions and prompt starters, plus access to past conversations — lowering the cost of the first question.
**Business Goal:** Ask Guru WAU ≥25% (PRD Goal 3); AI validation. **User Goal:** "Ask my ritual/festival question and trust the answer."
**Traceability:** MRD §5 (AI gap) · PRD P0 #4 (RAG) · Story: "am I doing this right?" · EPIC_AI · FEAT_ASK_GURU · FLOW D1 · APIs: API_GET_GURU_SUGGESTIONS, API_GET_GURU_HISTORY · DB: CONVERSATION, CONTENT_CHUNK · QA_GURU_HOME_001…

**Entry Points:** Tab 3 tap; `panchangpal://ask`; contextual "Ask about this" from ritual/festival/panchang (seeds a question → routes to SCR_GURU_CHAT_001). **Exit Points:** → SCR_GURU_CHAT_001 (ask or suggestion); → SCR_GURU_HISTORY_001.

**Components:** CMP_GURU_HEADER (trust line "Guru answers from verified sources"), CMP_SUGGESTED_QUESTION_CHIP (contextual), CMP_PROMPT_STARTER_LIST, CMP_CHAT_INPUT, CMP_TEXT_BUTTON (History). **Primary CTA:** send a question (CMP_CHAT_INPUT) → SCR_GURU_CHAT_001. **Secondary CTA:** suggested-question chips; "View history". **Navigation:** Tab 3 root; own stack.

**Inputs:** free-text question; suggested-question selection. **Outputs:** routes to a conversation seeded with the question. **Validation:** non-empty trimmed query; length cap (**[ASSUMPTION P2-A4]** ≤500 chars) → inline hint.

**States:** • **Default:** trust header + contextual suggestions + starters + input. • **Loading:** suggestions skeleton while API_GET_GURU_SUGGESTIONS resolves. • **Skeleton:** CMP_SKELETON chips. • **Empty:** no contextual suggestions → show evergreen starters (never a blank). • **Offline:** input disabled with `ERR_OFFLINE` note "Ask Guru needs a connection"; history still openable (cached). • **Error:** suggestions fetch fail → evergreen starters silently. • **Success:** question routed to chat.

**Accessibility:** ✓ Trust header read first by SR · ✓ Suggestion chips SR-operable, labeled as buttons · ✓ Input labeled; submit reachable · ✓ Offline state announced · ✓ Reduced-Motion (no chip shimmer) · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_027 (Ask Guru Opened), EVT_028 (Suggested Question Tapped), EVT_035 (History Opened, if tapped). **Performance Budget:** suggestions render < 500 ms; input responsive < 100 ms. **Backend Dependencies:** API_GET_GURU_SUGGESTIONS, API_GET_GURU_HISTORY. **Design Tokens:** color.surface.primary, color.brand.primary, typography.title.medium, radius.pill, spacing.md.
**Acceptance Criteria:**
- AC-GURU-HOME-01 — Given Ask Guru opens, when it renders, then a trust line and at least one prompt starter are present and EVT_027 fires.
- AC-GURU-HOME-02 — Given a contextual entry ("Ask about this"), when Ask Guru opens, then the relevant question is pre-seeded and sending it routes to SCR_GURU_CHAT_001.
- AC-GURU-HOME-03 — Given offline, when the screen loads, then the input is disabled with a clear message and cached history remains openable.
**Open Questions:** None.

---

### SCR_GURU_CHAT_001 — Ask Guru Conversation

**Purpose:** Conduct grounded, streamed Q&A with visible sources, honest low-confidence declines, safety-scoped refusals, and helpful-rating capture. The trust-critical AI surface.
**Business Goal:** Answer helpfulness ≥75%, refusal accuracy ≥95% (Annex D1); protect the trust moat. **User Goal:** "Get a trustworthy answer, and know when it's not sure."
**Traceability:** MRD §5, §10 · PRD P0 #4 (RAG AC) · Story: trust JTBD · EPIC_AI · FEAT_ASK_GURU · FLOW D1 · APIs: API_POST_ASK_GURU (orchestrates retrieval+generation), API_POST_GURU_FEEDBACK · DB: CONVERSATION, MESSAGE, CONTENT_CHUNK · QA_GURU_CHAT_001…

**Entry Points:** From SCR_GURU_HOME_001 (ask/suggestion); contextual seed from ritual/festival/panchang; open from SCR_GURU_HISTORY_001. **Exit Points:** ✔ grounded answer (+sources +rating); ✖ honest decline (low confidence) / safety refusal (out-of-scope); Back → Guru home/history.

**Components:** CMP_AI_CHAT_BUBBLE (user/assistant), CMP_TYPING_INDICATOR, CMP_SOURCE_CHIP (citations), CMP_HELPFUL_RATING, CMP_CHAT_INPUT, CMP_INLINE_NOTICE (decline/refusal/error), CMP_SUGGESTED_FOLLOWUP. **Primary CTA:** send/follow-up. **Secondary CTA:** tap a source; rate helpful; "Ask a temple"/"Rephrase" (in decline notice). **Navigation:** Tab 3 stack; Back preserves the conversation in history.

**Inputs:** question text; follow-ups; rating. **Outputs:** streamed grounded answer + sources; stored conversation/messages; feedback. **Validation:** non-empty query; retrieval confidence threshold (F-6) gates grounded-answer vs. decline; out-of-scope classifier → safety refusal.

**States:** • **Default:** conversation thread; input ready. • **Loading (thinking):** CMP_TYPING_INDICATOR after send, before first token. • **Streaming:** tokens append to assistant bubble; sources attach on completion. • **Skeleton:** N/A (typing indicator serves this role). • **Empty:** brand-new conversation → seeded question or a gentle "Ask me about a ritual or festival." • **Offline:** send disabled (`ERR_OFFLINE`); existing thread readable. • **Error:** `ERR_AI_TIMEOUT`/`ERR_AI_ERROR` → "I'm having trouble right now — try again" + retry (never fabricate); `ERR_RAG_EMPTY`/`ERR_RAG_LOW_CONFIDENCE` → honest "I don't have verified information on this" + rephrase/related-topic/ask-a-temple options; out-of-scope → gentle scoped refusal. • **Success:** grounded answer + ≥1 source + helpful rating.

**Accessibility:** ✓ Streaming announced via a polite SR live region (batched, not per-token spam) · ✓ CMP_TYPING_INDICATOR has SR-text ("Guru is thinking") · ✓ Source chips labeled and operable · ✓ Decline/refusal notices announced clearly · ✓ Reduced-Motion → no bouncing dots (static "thinking") · ✓ input labeled; ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_029 (Question Asked), EVT_030 (Answer Streamed — first token), EVT_031 (Sources Shown), EVT_032 (Answer Rated), EVT_033 (Guru Declined – Low Confidence), EVT_034 (Out-of-Scope Refusal), EVT_054 (Error Shown w/ code). **Performance Budget:** first streamed token < 2 s; typical short answer complete < 6 s. **Backend Dependencies:** API_POST_ASK_GURU, API_POST_GURU_FEEDBACK. **AI Dependencies (Annex D1):** LLM (vendor TBD), vector search + embeddings over reviewed CONTENT_CHUNK, prompt builder w/ scope guardrails, RAG required, streaming, in-session history (no cross-session memory), confidence threshold (F-6), safety filter, source citation, fallback = honest decline / retry (never fabricate). **Design Tokens:** color.surface.primary, color.bubble.user, color.bubble.assistant, color.notice.info, typography.body.large, radius.lg, spacing.md, motion.typing.dots, motion.reduced.crossfade.
**Acceptance Criteria:**
- AC-GURU-CHAT-01 — Given a ritual/festival question with sufficient retrieval confidence, when Guru answers, then the response is grounded in retrieved CONTENT_CHUNK, streams a first token < 2 s, shows ≥1 source, and offers a helpful rating (EVT_029/030/031).
- AC-GURU-CHAT-02 — Given low retrieval confidence (`ERR_RAG_LOW_CONFIDENCE`/`ERR_RAG_EMPTY`), when Guru responds, then it returns "I don't have verified information on this" with rephrase/related-topic/ask-a-temple options and EVT_033 fires — never an ungrounded guess (PRD AC).
- AC-GURU-CHAT-03 — Given an out-of-scope query (astrology/medical/political/etc.), when submitted, then Guru gently refuses within scope and EVT_034 fires.
- AC-GURU-CHAT-04 — Given an LLM timeout/error (`ERR_AI_TIMEOUT`/`ERR_AI_ERROR`), when it occurs, then a retryable error shows and no fabricated content is displayed.
- AC-GURU-CHAT-05 — Given a screen reader, when an answer streams, then it is announced politely without per-token spam and sources are reachable.
**Open Questions:** OQ — LLM vendor and per-query cost (PRD open question); confidence-threshold value (`[PRD FOLLOW-UP] F-6`).

---

### SCR_GURU_HISTORY_001 — Conversation History

**Purpose:** List past conversations for re-reading and continuation (in-session/stored list; no cross-session AI memory — AI Non-Goal).
**Business Goal:** Repeat AI engagement; retrieval of prior trusted answers. **User Goal:** "Find that answer Guru gave me before."
**Traceability:** PRD P0 #4 (+ AI Non-Goal: no long-term memory) · EPIC_AI · FEAT_ASK_GURU · FLOW D1 · APIs: API_GET_GURU_HISTORY, API_GET_GURU_CONVERSATION · DB: CONVERSATION, MESSAGE · QA_GURU_HIST_001…

**Entry Points:** SCR_GURU_HOME_001 ("View history"). **Exit Points:** → SCR_GURU_CHAT_001 (open a conversation); Back → Guru home.

**Components:** CMP_LIST, CMP_CONVERSATION_ROW (title/snippet/date), CMP_EMPTY_STATE, CMP_SEARCH_FIELD (optional). **Primary CTA:** open a conversation. **Secondary CTA:** delete a conversation (swipe). **Navigation:** Tab 3 stack; Back → home.

**Inputs:** optional search; row/delete. **Outputs:** conversation list; open route. **Validation:** N/A.

**States:** • **Default:** reverse-chronological list. • **Loading:** row skeletons. • **Skeleton:** CMP_SKELETON. • **Empty:** CMP_EMPTY_STATE — "Your questions to Guru will appear here." • **Offline:** cached history readable; new fetch → `ERR_OFFLINE` note. • **Error:** `ERR_NETWORK_TIMEOUT` → retry; cache retained. • **Success:** rendered.

**Accessibility:** ✓ Rows labeled (title + date) · ✓ Delete action labeled/confirmed · ✓ Search labeled · ✓ ≥44/48 · ✓ Dynamic Type · ✓ WCAG AA.
**Analytics Events:** EVT_035 (Conversation History Opened). **Performance Budget:** cached render < 400 ms. **Backend Dependencies:** API_GET_GURU_HISTORY, API_GET_GURU_CONVERSATION. **Design Tokens:** color.surface.primary, typography.body.medium, spacing.md, radius.md.
**Acceptance Criteria:**
- AC-GURU-HIST-01 — Given past conversations, when history opens, then they list reverse-chronologically and EVT_035 fires.
- AC-GURU-HIST-02 — Given a conversation is opened, when tapped, then SCR_GURU_CHAT_001 shows that thread (read + continue in-session).
- AC-GURU-HIST-03 — Given no history, when the screen opens, then a calm empty state shows.
**Open Questions:** None.

---

## Area F — You / Profile (Tab 4)

---

### SCR_PROFILE_001 — You (Profile) Home

**Purpose:** Personal hub — household summary, gentle streak/achievements, and entry points to Household, Settings, Subscription, and account actions.
**Business Goal:** Household & retention surfaces; subscription discovery (non-intrusive). **User Goal:** "Manage my family, my progress, and my settings."
**Traceability:** MRD §14 · PRD P0 #5/#6 · EPIC_ACCOUNT/EPIC_HOUSEHOLD · FEAT_PROFILE · FLOW — (hub) · APIs: API_GET_PROFILE, API_GET_STREAK, API_GET_HOUSEHOLD · DB: USER, HOUSEHOLD, STREAK · QA_PROFILE_001…

**Entry Points:** Tab 4 tap. **Exit Points:** → SCR_HOUSEHOLD_001; → SCR_ACHIEVEMENTS_001; → SCR_SUBSCRIPTION_001; → SCR_SETTINGS_001.

**Components:** CMP_PROFILE_HEADER, CMP_HOUSEHOLD_SUMMARY, CMP_STREAK_COUNTER (gentle), CMP_LIST_ROW (Household, Achievements, Subscription, Settings), CMP_SIGN_IN_PROMPT (if anonymous). **Primary CTA:** N/A — hub of routes. **Secondary CTA:** row taps; "Sign in to save across devices" (if anonymous, UX-2). **Navigation:** Tab 4 root; own stack.

**Inputs:** N/A. **Outputs:** summaries + routes. **Validation:** N/A.

**States:** • **Default:** header + household summary + streak + rows. • **Loading:** summary skeletons. • **Skeleton:** CMP_SKELETON. • **Empty:** solo household → "Add your family" prompt in summary. • **Offline:** cached summaries; actions requiring network noted. • **Error:** `ERR_NETWORK_TIMEOUT` → cached + quiet retry. • **Success:** rendered.

**Accessibility:** ✓ Rows labeled with destination · ✓ Streak exposes value, not dominant · ✓ Sign-in prompt labeled (if shown) · ✓ ≥44/48 · ✓ Dynamic Type · ✓ WCAG AA.
**Analytics Events:** EVT_012-family screen-view (**[ASSUMPTION P2-A5]** profile view reuses standard screen-view logging), EVT_049 (if Subscription row → viewed on that screen). **Performance Budget:** cached render < 500 ms. **Backend Dependencies:** API_GET_PROFILE, API_GET_STREAK, API_GET_HOUSEHOLD. **Design Tokens:** color.surface.primary, typography.title.medium, spacing.md, radius.md, elevation.card.
**Acceptance Criteria:**
- AC-PROFILE-01 — Given Tab 4 opens, when Profile renders, then household summary, streak, and navigation rows are present.
- AC-PROFILE-02 — Given an anonymous user, when Profile renders, then a non-blocking "sign in to save across devices" prompt appears (UX-2), and the app remains fully usable without it.
**Open Questions:** None.

---

### SCR_HOUSEHOLD_001 — Household Members

**Purpose:** View/manage household members, their roles and content-depth; entry to invite.
**Business Goal:** Multi-member households (North Star driver); role-aware content. **User Goal:** "Manage who's in my family and how each sees content."
**Traceability:** PRD P0 #6 · MRD §14 · EPIC_HOUSEHOLD · FEAT_HOUSEHOLD · FLOW A3/D2 · APIs: API_GET_HOUSEHOLD, API_PATCH_HOUSEHOLD_MEMBER, API_DELETE_HOUSEHOLD_MEMBER · DB: HOUSEHOLD, HOUSEHOLD_MEMBER · QA_HH_001…

**Entry Points:** SCR_PROFILE_001. **Exit Points:** → SCR_HOUSEHOLD_INVITE_001; member edit (inline/sheet); Back → Profile.

**Components:** CMP_LIST, CMP_MEMBER_ROW (name/role/depth), CMP_ROLE_PICKER, CMP_DEPTH_TOGGLE, CMP_PRIMARY_BUTTON (Invite member), CMP_DESTRUCTIVE_ACTION (remove). **Primary CTA:** "Invite member". **Secondary CTA:** edit role/depth; remove member. **Navigation:** Tab 4 stack; Back → Profile.

**Inputs:** role/depth edits; remove. **Outputs:** updated members. **Validation:** cannot remove the sole owner without transfer (ties to Delete/ownership rules, F-3); confirm destructive removal.

**States:** • **Default:** member list + Invite CTA. • **Loading:** skeletons. • **Skeleton:** CMP_SKELETON. • **Empty:** solo → "It's just you right now — invite your family." • **Offline:** cached list; edits queued. • **Error:** `ERR_NETWORK_TIMEOUT` → retry; `ERR_UNKNOWN` on remove → retain state. • **Success:** edits reflected; toast.

**Accessibility:** ✓ Member rows labeled with name/role/depth · ✓ Pickers SR-operable, value announced · ✓ Remove labeled + confirmed · ✓ ≥44/48 · ✓ Dynamic Type · ✓ WCAG AA.
**Analytics Events:** EVT_007 (Member Added — via invite acceptance elsewhere), member-edit (**[ASSUMPTION P2-A6]** logged as a generic settings-change event; add `EVT_055 Household Member Updated` to §3.0.1 registry — see Part 2 change log). **Performance Budget:** cached render < 400 ms; edit ack < 100 ms. **Backend Dependencies:** API_GET_HOUSEHOLD, API_PATCH_HOUSEHOLD_MEMBER, API_DELETE_HOUSEHOLD_MEMBER. **Design Tokens:** color.surface.primary, typography.body.medium, spacing.md, radius.md.
**Acceptance Criteria:**
- AC-HH-01 — Given a household, when the screen opens, then members render with role and depth, and an Invite CTA is present.
- AC-HH-02 — Given a member's depth is changed, when saved, then content depth for that member updates app-wide.
- AC-HH-03 — Given the sole owner, when removal is attempted, then ownership transfer is required first (no orphaned household).
**Open Questions:** OQ — one-household-per-user rule and ownership transfer are `[PRD FOLLOW-UP] F-2/F-3`.

---

### SCR_HOUSEHOLD_INVITE_001 — Invite / Accept Member

**Purpose:** Generate/share a household invite and, on the invitee side, accept and join (with deferred-deep-link install auto-join).
**Business Goal:** Invite accept ≥40% (Annex D2); cheapest growth lever. **User Goal:** "Bring my family in easily."
**Traceability:** PRD P0 #6, P1 #2 · MRD §14 · EPIC_HOUSEHOLD/EPIC_GROWTH · FEAT_HOUSEHOLD_INVITE · FLOW D2 · APIs: API_POST_HOUSEHOLD_INVITE, API_GET_INVITE, API_POST_INVITE_ACCEPT · DB: HOUSEHOLD, HOUSEHOLD_MEMBER, INVITE · QA_HHINV_001…

**Entry Points:** SCR_HOUSEHOLD_001 (Invite); invite deep link `panchangpal://invite/{token}` (invitee); post-install deferred deep link. **Exit Points:** ✔ invitee joins → SCR_HOME_001; ✖ expired token → re-request; Back → Household.

**Components:** CMP_SHARE_BUTTON (native share sheet), CMP_INVITE_LINK_CARD, CMP_INVITE_ACCEPT_CARD (household + inviter), CMP_ROLE_PICKER + CMP_DEPTH_TOGGLE (invitee setup), CMP_PRIMARY_BUTTON. **Primary CTA:** inviter "Share invite"; invitee "Join {household}". **Secondary CTA:** copy link; decline. **Navigation:** stack; deep-link entry resolves to accept card with valid back-stack.

**Inputs:** share channel; (invitee) role/depth. **Outputs:** invite token; membership on accept. **Validation:** token validity/expiry → `ERR_INVITE_EXPIRED`; already-in-a-household → explicit switch confirmation (A6/F-2).

**States:** • **Default (inviter):** link + share. • **Default (invitee):** accept card w/ household+inviter. • **Loading:** generate/accept spinner. • **Skeleton:** N/A. • **Empty:** N/A. • **Offline:** generate/accept need network → `ERR_OFFLINE` + retry. • **Error:** `ERR_INVITE_EXPIRED` → "This invite has expired — ask {inviter} for a new one"; `ERR_AUTH_FAILED` → sign-in prompt (join requires account). • **Success:** join confirmed; both parties gently notified.

**Accessibility:** ✓ Share entry SR-reachable · ✓ Accept card states household + inviter clearly · ✓ Role/depth pickers SR-operable · ✓ CTAs labeled · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_036 (Invite Sent), EVT_037 (Invite Accepted), EVT_044/EVT_045 (if auth required to join). **Performance Budget:** invite generation < 1 s; accept round-trip < 2 s. **Backend Dependencies:** API_POST_HOUSEHOLD_INVITE, API_GET_INVITE, API_POST_INVITE_ACCEPT. **Design Tokens:** color.surface.primary, color.brand.primary, typography.title.medium, spacing.md, radius.lg.
**Acceptance Criteria:**
- AC-HHINV-01 — Given the inviter shares a link, when generated, then a valid tokenized invite is produced and EVT_036 fires.
- AC-HHINV-02 — Given an invitee without the app taps the link, when they install and onboard, then the invite token auto-applies and they join the household (deferred deep link).
- AC-HHINV-03 — Given an expired token (`ERR_INVITE_EXPIRED`), when opened, then a graceful re-request message shows (no dead end).
- AC-HHINV-04 — Given an invitee already in another household, when accepting, then an explicit switch confirmation explains the implications (A6).
**Open Questions:** OQ — `[PRD FOLLOW-UP] F-2` household cardinality.

---

### SCR_ACHIEVEMENTS_001 — Achievements / Streak History

**Purpose:** Show streak history and gentle milestones — reinforcement, never scorekeeping pressure (UX-3).
**Business Goal:** Healthy retention reinforcement; supports habit without churn (Risk §5). **User Goal:** "See my progress, feel encouraged."
**Traceability:** PRD P0 #5 · MRD §14 · EPIC_HABIT · FEAT_STREAK · FLOW — · APIs: API_GET_STREAK_HISTORY · DB: STREAK, RITUAL_COMPLETION · QA_ACH_001…

**Entry Points:** SCR_PROFILE_001; SCR_HOME_001 streak tap. **Exit Points:** Back → origin.

**Components:** CMP_STREAK_SUMMARY, CMP_STREAK_CALENDAR (completion heatmap), CMP_MILESTONE_BADGE (gentle), CMP_EMPTY_STATE. **Primary CTA:** N/A — reflection surface. **Secondary CTA:** N/A. **Navigation:** Tab 4/Tab 1 stack; Back to origin.

**Inputs:** N/A. **Outputs:** streak history + milestones. **Validation:** grace-day usage reflected honestly (no false "perfect" claims).

**States:** • **Default:** current streak + history heatmap + earned milestones. • **Loading:** skeleton. • **Skeleton:** CMP_SKELETON. • **Empty:** new user → "Your journey starts today — complete today's ritual to begin." (no pressure). • **Offline:** cached history. • **Error:** `ERR_NETWORK_TIMEOUT` → retry. • **Success:** rendered.

**Accessibility:** ✓ Heatmap has text alternative (e.g., "18 of last 30 days completed") · ✓ Milestones labeled · ✓ not color-only (labels + icons) · ✓ Reduced-Motion on any badge reveal · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_020 (Streak Advanced — from ritual), screen-view logging. **Performance Budget:** cached render < 400 ms. **Backend Dependencies:** API_GET_STREAK_HISTORY. **Design Tokens:** color.surface.primary, color.accent.warm, typography.title.medium, spacing.md, radius.md, motion.reduced.crossfade.
**Acceptance Criteria:**
- AC-ACH-01 — Given completion history, when the screen opens, then a streak summary + history render with a text-equivalent for the heatmap.
- AC-ACH-02 — Given grace days were used, when history renders, then it reflects them honestly without loss-framed or shaming copy (UX-3).
**Open Questions:** None.

---

### SCR_SUBSCRIPTION_001 — Subscription / Upgrade

**Purpose:** Present Individual/Family plans with honest value and pricing, via native IAP — contextual and dismissible, never blocking the daily loop (Principle P4, Trust P2).
**Business Goal:** Free→Paid 3–5% within 6 months (PRD); family-plan economics. **User Goal:** "Go ad-free / unlock more, if I want — for me or my family."
**Traceability:** MRD §11, §18 · PRD P1 #8/#9 (post-retention) · EPIC_MONETIZATION · FEAT_SUBSCRIPTION, FEAT_FAMILY_PLAN (FF_FAMILY_PLAN) · FLOW F1 · APIs: API_GET_SUB_PLANS, API_POST_SUB_VALIDATE, API_GET_SUB_ENTITLEMENT, API_POST_SUB_RESTORE · DB: SUBSCRIPTION, ENTITLEMENT · QA_SUB_001…

**Entry Points:** SCR_PROFILE_001; contextual upgrade sheet (e.g., heavy Ask Guru use); family-plan prompt from Household — **never** an interstitial over the morning ritual. **Exit Points:** ✔ purchase success → entitlement → confirmation → Back; ✖ cancel/failure → free tier, fully functional.

**Components:** CMP_PLAN_CARD (Individual/Family), CMP_VALUE_LIST, CMP_PRIMARY_BUTTON (Subscribe), CMP_TEXT_BUTTON (Restore purchases), CMP_LEGAL_FOOTNOTE (terms/renewal). **Primary CTA:** "Subscribe" → native IAP. **Secondary CTA:** plan toggle; "Restore purchases"; dismiss. **Navigation:** modal sheet or Tab 4 stack; dismiss returns to origin (no punishment).

**Inputs:** plan selection; native IAP result. **Outputs:** validated entitlement (family → propagates to members, F-4). **Validation:** store receipt server-validated → `ERR_SUBSCRIPTION_INVALID`; payment result → `ERR_PAYMENT_FAILED`.

**States:** • **Default:** plans + honest value + legal footnote. • **Loading:** plans fetch / purchase-in-progress spinner. • **Skeleton:** CMP_SKELETON plan cards. • **Empty:** plans unavailable → "Subscriptions are briefly unavailable — try again" (never blocks app). • **Offline:** `ERR_OFFLINE` — "Connect to manage your subscription"; Restore still attemptable when back online. • **Error:** `ERR_PAYMENT_FAILED` → clear reason + retry/change method; `ERR_SUBSCRIPTION_INVALID` → "We couldn't verify — we'll restore automatically" + Restore. • **Success:** entitlement granted; warm confirmation; benefits live.

**Accessibility:** ✓ Plan cards SR-labeled with price + billing terms + what's included · ✓ "best value" conveyed by text, not color-only · ✓ native IAP inherits OS accessibility · ✓ Restore labeled · ✓ legal reachable · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_049 (Subscription Viewed), EVT_050 (Plan Selected), EVT_051 (Purchase Result), EVT_052 (Purchases Restored). **Performance Budget:** plans render < 1 s; receipt validation < 2 s. **Backend Dependencies:** API_GET_SUB_PLANS, API_POST_SUB_VALIDATE, API_GET_SUB_ENTITLEMENT, API_POST_SUB_RESTORE. **Design Tokens:** color.surface.raised, color.brand.primary, typography.title.large, typography.body.medium, spacing.lg, radius.lg, elevation.card.
**Acceptance Criteria:**
- AC-SUB-01 — Given the upgrade surface, when it appears, then it is dismissible and never blocks the daily ritual loop, and EVT_049 fires.
- AC-SUB-02 — Given a successful purchase, when validated server-side, then entitlement is granted (family → all members, F-4) and a warm confirmation shows (EVT_051 success).
- AC-SUB-03 — Given a payment failure (`ERR_PAYMENT_FAILED`), when it occurs, then a clear reason + retry/alternative is shown and no entitlement is granted.
- AC-SUB-04 — Given a reinstall/new device, when "Restore purchases" is used, then valid entitlements are restored (EVT_052).
**Open Questions:** OQ — final pricing and whether an ad-supported free tier ships (PRD open business decision); Family plan gated by FF_FAMILY_PLAN (post-v1).

---

### SCR_SETTINGS_001 — Settings (Hub + Subpages)

**Purpose:** Consolidated configuration hub and its subpages (Account, Notifications, Location, Tradition/Region, Content Depth, Language, Appearance, Privacy & Data, About/Accuracy, Help & Support).
**Business Goal:** User control & trust (data dignity); keeps the tab bar sacred for the daily loop. **User Goal:** "Adjust how the app works for me."
**Traceability:** PRD P0 #9 (privacy), onboarding-revision settings · EPIC_ACCOUNT · FEAT_SETTINGS · FLOW A4/A5/E3 · APIs: API_GET_PREFERENCES, API_PATCH_PREFERENCES, API_POST_NOTIF_SCHEDULE, API_POST_AUTH_LOGOUT · DB: USER, HOUSEHOLD, SUBSCRIPTION · QA_SET_001…

**Entry Points:** SCR_PROFILE_001. **Exit Points:** subpage routes; → SCR_DELETE_ACCOUNT_001 (Privacy & Data); sign out → anonymous SCR_HOME_001 (E3); Back → Profile.

**Components:** CMP_SETTINGS_LIST, CMP_SETTINGS_ROW (nav/value), CMP_TOGGLE, CMP_SEGMENTED (Appearance/Depth/Language), CMP_TIME_PICKER (notif), CMP_DESTRUCTIVE_ROW (Delete account), CMP_TEXT_BUTTON (Sign out). **Primary CTA:** N/A — hub. **Secondary CTA:** per-subpage controls. **Navigation:** Tab 4 stack; each subpage a pushed screen; Back to hub.

**Subpage inventory (each a pushed view sharing this spec's states/a11y/analytics conventions):**
- **Account** (email, sign-in methods, Sign out E3) → `EVT_047` on sign out.
- **Notifications** (types, timing/quiet hours, per-type toggles) → `EVT_010` re-prompt; API_POST_NOTIF_SCHEDULE.
- **Location** (change city/tz) → Flow A5; `EVT_004`.
- **Tradition / Region** (change variant) → `EVT_024`; API_PATCH_PREFERENCES.
- **Content Depth** (Quick/Deep, persistent per member) → API_PATCH_PREFERENCES.
- **Language** (v1: English; scaffolded, RTL-ready) → N/A backend v1.
- **Appearance** (Light/Dark/System; text size echoes OS; reduced motion echoes OS).
- **Privacy & Data** (export data, delete account → SCR_DELETE_ACCOUNT_001, CCPA).
- **About / Accuracy** ("How we calculate this" trust note).
- **Help & Support / Feedback** (contact, FAQ, thumbs feedback).

**Inputs:** toggles/pickers per subpage. **Outputs:** persisted preferences. **Validation:** valid values; changes optimistic then synced → `ERR_NETWORK_TIMEOUT` retry.

**States:** • **Default:** grouped settings list. • **Loading:** value rows skeleton where remote. • **Skeleton:** CMP_SKELETON. • **Empty:** N/A. • **Offline:** local prefs editable; server-sync deferred; `ERR_OFFLINE` chip on server-only items. • **Error:** save fail → revert + retry. • **Success:** value updated (subtle confirmation).

**Accessibility:** ✓ Every row labeled with current value · ✓ Toggles announce on/off · ✓ Segmented controls SR-operable · ✓ Appearance/reduced-motion mirror OS (respect system) · ✓ destructive rows distinct + confirmed · ✓ ≥44/48 · ✓ Dynamic Type · ✓ WCAG AA · ✓ Language subpage RTL-ready scaffolding.
**Analytics Events:** EVT_004, EVT_010, EVT_024, EVT_047 (per subpage as above); generic settings-change logging. **Performance Budget:** hub render < 300 ms (mostly local); subpage save ack < 100 ms. **Backend Dependencies:** API_GET_PREFERENCES, API_PATCH_PREFERENCES, API_POST_NOTIF_SCHEDULE, API_POST_AUTH_LOGOUT. **Design Tokens:** color.surface.primary, color.text.secondary, typography.body.large, spacing.md, radius.md.
**Acceptance Criteria:**
- AC-SET-01 — Given a preference is changed, when saved, then it persists and is reflected app-wide (e.g., tradition, depth, appearance).
- AC-SET-02 — Given "Sign out" (E3), when confirmed, then the session clears and the app returns to an anonymous Today (not a login wall, A10), EVT_047 fires.
- AC-SET-03 — Given Appearance = System, when the OS theme or reduced-motion setting changes, then the app mirrors it.
- AC-SET-04 — Given Tradition/Region is changed here, when saved, then calendar/festival/ritual variants update accordingly (EVT_024).
**Open Questions:** OQ — data-export format/scope (privacy) is a `[PRD FOLLOW-UP]` (policy).

---

### SCR_DELETE_ACCOUNT_001 — Delete Account

**Purpose:** Provide a clear, safety-gated account deletion honoring data dignity and CCPA, with household-ownership handling and honest grace-window messaging.
**Business Goal:** Trust & compliance (Trust #4; PRD P0 #9). **User Goal:** "Delete my account and data, understanding what happens."
**Traceability:** PRD P0 #9 · MRD §12 (legal) · EPIC_ACCOUNT · FEAT_ACCOUNT_DELETION · FLOW E4 · APIs: API_POST_ACCOUNT_DELETE, API_POST_HOUSEHOLD_TRANSFER, API_POST_REAUTH · DB: USER, HOUSEHOLD, HOUSEHOLD_MEMBER · QA_DEL_001…

**Entry Points:** SCR_SETTINGS_001 → Privacy & Data. **Exit Points:** ✔ deletion queued → signed out → confirmation; ✖ cancel → Settings.

**Components:** CMP_CONSEQUENCES_PANEL, CMP_OWNERSHIP_TRANSFER (if owner w/ members), CMP_REAUTH_PROMPT, CMP_DESTRUCTIVE_BUTTON (Delete), CMP_TEXT_BUTTON (Cancel). **Primary CTA:** "Delete my account" (final, after gates). **Secondary CTA:** "Cancel"; "Transfer ownership". **Navigation:** Tab 4 stack; deliberate multi-gate; Back → Settings.

**Inputs:** ownership transfer (if applicable); re-auth; explicit final confirm. **Outputs:** queued deletion; sign-out. **Validation:** owner-with-members must transfer or explicitly accept "delete household for all" (no orphans); re-auth required → `ERR_AUTH_EXPIRED`; final explicit confirm required.

**States:** • **Default:** consequences explained. • **Loading:** delete-request spinner. • **Skeleton:** N/A. • **Empty:** N/A. • **Offline:** request queued, executed on reconnect; user informed (`ERR_OFFLINE`). • **Error:** `ERR_AUTH_EXPIRED` → re-auth; `ERR_UNKNOWN` → retain, retry. • **Success:** "Your account will be deleted" + grace-window note; signed out.

**Accessibility:** ✓ Consequences readable at max Dynamic Type · ✓ Destructive action clearly labeled and SR-distinct · ✓ Ownership-transfer picker SR-operable · ✓ Re-auth accessible · ✓ ≥44/48 · ✓ WCAG AA.
**Analytics Events:** EVT_048 (Account Deletion Requested). **Performance Budget:** request queue ack < 2 s. **Backend Dependencies:** API_POST_ACCOUNT_DELETE, API_POST_HOUSEHOLD_TRANSFER, API_POST_REAUTH. **Design Tokens:** color.surface.primary, color.text.danger, color.border.danger, typography.title.medium, spacing.lg, radius.md.
**Acceptance Criteria:**
- AC-DEL-01 — Given an owner with other members, when deletion is attempted, then ownership transfer or an explicit "delete for all" acknowledgment is required first (no orphaned household).
- AC-DEL-02 — Given the gates are passed and re-auth confirmed, when the user confirms, then deletion is queued, the user is signed out, EVT_048 fires, and the grace window is disclosed honestly.
- AC-DEL-03 — Given the request is made offline, when connectivity returns, then the deletion executes and the user is informed.
**Open Questions:** OQ — grace-window length and export coupling are `[PRD FOLLOW-UP] F-3` (policy).

---

## 4.30 Screen → Everything Traceability Matrix (§3.0A.2)

One row per screen. `Epic/Feature` abbreviated; APIs list primary dependencies (full list per screen above). This is the Part 2 instance of the §3.0A.2 canonical matrix.

| Screen ID | PRD Req | Epic | Feature | Flow | Key Components | Key APIs | DB Entities | Analytics | AC / QA |
|---|---|---|---|---|---|---|---|---|---|
| SCR_SPLASH_001 | Platform | CORE | APP_SHELL | ONBOARDING/RETURNING | BRAND_LOGO | AUTH_SESSION_VALIDATE | USER, SESSION | EVT_001,002 | AC-SPLASH / QA_SPLASH |
| SCR_ONBOARDING_WELCOME_001 | Onboarding | ONBOARDING | ONBOARDING | A1 | ONBOARDING_SLIDE | ONBOARDING_CONFIG | — | EVT_003 | AC-ONB-WEL / QA_ONB_WEL |
| SCR_ONBOARDING_LOCATION_001 | P0#1 | ONBOARDING | LOCATION | A5 | PERMISSION_RATIONALE, CITY_SEARCH | GEO_REVERSE, CITY_SEARCH | USER | EVT_004 | AC-ONB-LOC / QA_ONB_LOC |
| SCR_ONBOARDING_TRADITION_001 | P0#2/#3 | CONTENT | REGIONALIZATION | A1 | SELECTABLE_CARD | TRADITIONS | USER, HOUSEHOLD | EVT_005 | AC-ONB-TRAD / QA_ONB_TRAD |
| SCR_ONBOARDING_HOUSEHOLD_001 | P0#6 | HOUSEHOLD | HOUSEHOLD | A3 | MEMBER_ROW, ROLE_PICKER, DEPTH_TOGGLE | HOUSEHOLD, HOUSEHOLD_MEMBER | HOUSEHOLD, HOUSEHOLD_MEMBER | EVT_006,007 | AC-ONB-HH / QA_ONB_HH |
| SCR_ONBOARDING_RITUALTIME_001 | Onboarding | HABIT | REMINDERS | A1 | TIME_PICKER, PRESET_CHIP | PROFILE | USER | EVT_008 | AC-ONB-TIME / QA_ONB_TIME |
| SCR_ONBOARDING_PANCHANG_001 | P0#1 | PANCHANG | DAILY_PANCHANG | A1 | PANCHANG_CARD, LOCATION_CHIP | GET_TODAY | PANCHANG, USER | EVT_009 | AC-ONB-PAN / QA_ONB_PAN |
| SCR_ONBOARDING_NOTIF_001 | Onboarding | HABIT | NOTIFICATIONS | A4 | PERMISSION_PRIMING | NOTIF_SCHEDULE, NOTIF_TOKEN | USER | EVT_010,011 | AC-ONB-NOTIF / QA_ONB_NOTIF |
| SCR_AUTH_001 | Accounts | ACCOUNT | AUTH | E1 | AUTH_BUTTON | AUTH_APPLE/GOOGLE, AUTH_MERGE | USER, SESSION | EVT_044,045 | AC-AUTH / QA_AUTH |
| SCR_AUTH_EMAIL_001 | Accounts | ACCOUNT | AUTH | E1 | OTP_INPUT | AUTH_EMAIL_START/VERIFY | USER, SESSION | EVT_044,045 | AC-AUTH-EMAIL / QA_AUTH_EMAIL |
| SCR_AUTH_RECOVERY_001 | Accounts | ACCOUNT | AUTH | E2 | INFO_BANNER | AUTH_EMAIL_START, SUPPORT_TICKET | USER | EVT_046,045 | AC-AUTH-REC / QA_AUTH_REC |
| SCR_HOME_001 | P0#1/#3/#5 | PANCHANG/RITUAL | DAILY_PANCHANG, GUIDED_RITUAL, STREAK | B1/A2 | PANCHANG_CARD, RITUAL_CARD, CHECKLIST, STREAK_COUNTER, ROTATING_ELEMENT | GET_TODAY, GET_RITUAL, GET_STREAK, GET_CHECKLIST | PANCHANG, RITUAL, RITUAL_COMPLETION, STREAK, FESTIVAL | EVT_012,014,019,053,054 | AC-HOME / QA_HOME |
| SCR_PANCHANG_DETAIL_001 | P0#1 | PANCHANG | DAILY_PANCHANG | B3 | PANCHANG_DETAIL_LIST, INFO_SHEET | PANCHANG_DETAIL, GLOSSARY | PANCHANG | EVT_013 | AC-PAN / QA_PAN |
| SCR_RITUAL_001 | P0#3/#5 | RITUAL | GUIDED_RITUAL | B1 | RITUAL_STEP, PROGRESS_RING, AUDIO_CONTROLS, COMPLETION_MOMENT | GET_RITUAL, RITUAL_AUDIO, RITUAL_COMPLETE, STREAK_ADVANCE | RITUAL, RITUAL_COMPLETION, STREAK | EVT_015,016,017,018,020,021 | AC-RIT / QA_RIT |
| SCR_CALENDAR_001 | P0#2/#7 | CALENDAR | CALENDAR, SHRADDHA_DATES | C3 | MONTH_GRID, DAY_CELL, TRADITION_SWITCHER | GET_CALENDAR, GET_PERSONAL_DATES | FESTIVAL, PERSONAL_DATE | EVT_022,024 | AC-CAL / QA_CAL |
| SCR_CALENDAR_DAY_001 | P0#1/#2/#7 | CALENDAR | CALENDAR | C3 | PANCHANG_CARD, EVENT_LIST | PANCHANG_DETAIL, CALENDAR_DAY | PANCHANG, FESTIVAL, PERSONAL_DATE | EVT_013,023 | AC-CALDAY / QA_CALDAY |
| SCR_FESTIVAL_DETAIL_001 | P0#2/#3 | CONTENT | FESTIVALS | C1 | FESTIVAL_HEADER, DEPTH_TOGGLE, CONTENT_BODY | GET_FESTIVAL, RITUAL_BY_FESTIVAL, REMINDER | FESTIVAL, RITUAL | EVT_023,041 | AC-FEST / QA_FEST |
| SCR_PERSONAL_DATES_001 | P0#7 | CALENDAR | SHRADDHA_DATES | C2 | PERSONAL_DATE_ROW, EMPTY_STATE | GET_PERSONAL_DATES | PERSONAL_DATE | EVT_025 | AC-PDATES / QA_PDATES |
| SCR_PERSONAL_DATE_EDIT_001 | P0#7 | CALENDAR | SHRADDHA_DATES | C2 | TITHI_PICKER, DATE_PICKER, REMINDER_LEAD_PICKER | POST/PATCH/DELETE_PERSONAL_DATE, TITHI_NEXT, NOTIF_SCHEDULE | PERSONAL_DATE | EVT_025,026 | AC-PDATE-EDIT / QA_PDATE_EDIT |
| SCR_GURU_HOME_001 | P0#4 | AI | ASK_GURU | D1 | SUGGESTED_QUESTION_CHIP, CHAT_INPUT | GURU_SUGGESTIONS, GURU_HISTORY | CONVERSATION, CONTENT_CHUNK | EVT_027,028,035 | AC-GURU-HOME / QA_GURU_HOME |
| SCR_GURU_CHAT_001 | P0#4 | AI | ASK_GURU | D1 | AI_CHAT_BUBBLE, TYPING_INDICATOR, SOURCE_CHIP, HELPFUL_RATING | POST_ASK_GURU, GURU_FEEDBACK | CONVERSATION, MESSAGE, CONTENT_CHUNK | EVT_029,030,031,032,033,034,054 | AC-GURU-CHAT / QA_GURU_CHAT |
| SCR_GURU_HISTORY_001 | P0#4 | AI | ASK_GURU | D1 | CONVERSATION_ROW | GURU_HISTORY, GURU_CONVERSATION | CONVERSATION, MESSAGE | EVT_035 | AC-GURU-HIST / QA_GURU_HIST |
| SCR_PROFILE_001 | P0#5/#6 | ACCOUNT/HOUSEHOLD | PROFILE | — | PROFILE_HEADER, HOUSEHOLD_SUMMARY, STREAK_COUNTER | GET_PROFILE, GET_STREAK, GET_HOUSEHOLD | USER, HOUSEHOLD, STREAK | EVT_049(route) | AC-PROFILE / QA_PROFILE |
| SCR_HOUSEHOLD_001 | P0#6 | HOUSEHOLD | HOUSEHOLD | A3/D2 | MEMBER_ROW, ROLE_PICKER, DEPTH_TOGGLE | GET_HOUSEHOLD, PATCH/DELETE_HOUSEHOLD_MEMBER | HOUSEHOLD, HOUSEHOLD_MEMBER | EVT_007,055 | AC-HH / QA_HH |
| SCR_HOUSEHOLD_INVITE_001 | P0#6, P1#2 | HOUSEHOLD/GROWTH | HOUSEHOLD_INVITE | D2 | SHARE_BUTTON, INVITE_ACCEPT_CARD | HOUSEHOLD_INVITE, INVITE, INVITE_ACCEPT | HOUSEHOLD, HOUSEHOLD_MEMBER, INVITE | EVT_036,037,044,045 | AC-HHINV / QA_HHINV |
| SCR_ACHIEVEMENTS_001 | P0#5 | HABIT | STREAK | — | STREAK_SUMMARY, STREAK_CALENDAR, MILESTONE_BADGE | GET_STREAK_HISTORY | STREAK, RITUAL_COMPLETION | EVT_020 | AC-ACH / QA_ACH |
| SCR_SUBSCRIPTION_001 | P1#8/#9 | MONETIZATION | SUBSCRIPTION, FAMILY_PLAN | F1 | PLAN_CARD, VALUE_LIST | GET_SUB_PLANS, SUB_VALIDATE, SUB_ENTITLEMENT, SUB_RESTORE | SUBSCRIPTION, ENTITLEMENT | EVT_049,050,051,052 | AC-SUB / QA_SUB |
| SCR_SETTINGS_001 | P0#9 | ACCOUNT | SETTINGS | A4/A5/E3 | SETTINGS_ROW, TOGGLE, SEGMENTED | GET/PATCH_PREFERENCES, NOTIF_SCHEDULE, AUTH_LOGOUT | USER, HOUSEHOLD, SUBSCRIPTION | EVT_004,010,024,047 | AC-SET / QA_SET |
| SCR_DELETE_ACCOUNT_001 | P0#9 | ACCOUNT | ACCOUNT_DELETION | E4 | CONSEQUENCES_PANEL, REAUTH_PROMPT | ACCOUNT_DELETE, HOUSEHOLD_TRANSFER, REAUTH | USER, HOUSEHOLD, HOUSEHOLD_MEMBER | EVT_048 | AC-DEL / QA_DEL |

*Every upstream cell is populated (no empty MRD/PRD/Story references), per §3.0A.6. MRD linkage per screen is in each screen's Traceability line above.*

---

## 4.31 Registry additions from Part 2

Per §3.0A.3/§3.0A.11, any new event must be added to the §3.0.1 registry. Part 2 surfaced **one** new event:

| ID | Event | Fires when | Reason introduced |
|---|---|---|---|
| EVT_055 | Household Member Updated | A member's role or content-depth is edited | Needed for SCR_HOUSEHOLD_001 edits (was implicit) |

No new error codes or token namespaces were required — all screens map to existing `ERR_*` (§3.0.2) and token namespaces (§3.0.3). **Action:** append `EVT_055` to §3.0.1 in the next Part 1 patch (PATCH bump; additive).

---

# Part 2 — UX Change Log

No new UX-pattern deviations were introduced in Part 2 beyond those already logged in Part 1 (UX-1…UX-7); Part 2 applies them (e.g., 4-tab nav, deferred auth, gentle streak, in-app notif priming, visible accuracy, contextual Ask-Guru, grief-aware personal dates). Screen-level design choices follow the PRD and Part 1 governance. This log records only Part-2-originated items.

| # | PRD original requirement | Proposed UX change | Rationale | Expected user impact | Impl. effort | Update PRD? |
|---|---|---|---|---|---|---|
| UX-8 | PRD lists "Settings" and "Subscription" among navigation nodes | **Settings & Subscription are nested under the You tab** (not top-level), Settings using a hub+subpages pattern | Keeps the 4-tab daily-loop nav (UX-1); standard mobile pattern; reduces tab clutter | Cleaner nav, daily loop stays primary | Low | Optional — consistent with UX-1 |
| UX-9 | Subscription is a product surface | **Subscription is always contextual & dismissible; never an interstitial over the daily ritual** | Protects the sacred loop & trust (Principle P4, Trust P2); PRD sequences monetization post-retention | Higher trust; dismissers still retain | Low | Optional — reinforces PRD intent |

### `[PRD FOLLOW-UP]` — new items surfaced in Part 2
| # | Observation | Why it's the PRD's call |
|---|---|---|
| F-9 | **Final enumerated tradition set for v1** (P2-A1 bundled `{GENERIC, NORTH_INDIAN, SOUTH_INDIAN/TAMIL, BENGALI}`) depends on "top 2–3 by onboarding data" (PRD P0 #2) | Content scope decision |
| F-10 | **Data-export format/scope** for Privacy & Data (CCPA) | Policy/compliance decision |
| F-11 | **Final pricing** and whether an **ad-supported free tier** ships (affects SCR_SUBSCRIPTION_001) | Open PRD business decision |

### Assumptions introduced in Part 2 (decisions where PRD/Part 1 is silent)
| # | Item |
|---|---|
| P2-A1 | Bundled v1 tradition set = `{GENERIC, NORTH_INDIAN, SOUTH_INDIAN/TAMIL, BENGALI}` pending F-9. |
| P2-A2 | Default ritual time = location sunrise + a small offset if the user leaves the picker untouched. |
| P2-A3 | Personal-dates list view reuses standard screen-view logging; no gamified events on that surface (UX-7). |
| P2-A4 | Ask Guru free-text query cap ≈500 chars (soft-hinted), tunable. |
| P2-A5 | Profile/hub screen views reuse standard screen-view logging rather than bespoke events. |
| P2-A6 | Household member edits emit the new `EVT_055` (added to §3.0.1 via §4.31). |

---

# Part 2 — Readiness Summary

- **Coverage:** 29 screens across 6 areas, each documented with the full §3.17 template and §3.0A traceability; cross-cutting surfaces (offline banner, snackbars, sheets, paywall sheet) deferred to Part 3 components as intended.
- **Governance compliance (§3.0A.12):** every screen specifies Purpose, Business/User Goal, Flow, Navigation, Components, all 7 states, Acceptance Criteria (Given/When/Then), Analytics (`EVT_*`), Accessibility, Backend APIs (`API_*`), Performance Budget, Error Codes (`ERR_*`), Design Tokens, and Open Questions — the engineering-readiness checklist.
- **Registry integrity:** all analytics map to §3.0.1 (plus one additive `EVT_055`); all errors to §3.0.2; all tokens to §3.0.3 namespaces (values in Part 3); all budgets to §3.0.4.
- **Forward dependencies for Part 3:** every `CMP_*` named here (≈60 components) is a forward reference the Component Library must define — this list is the de-facto backlog for Part 3 §5.
- **New PRD follow-ups:** F-9 (tradition set), F-10 (data export), F-11 (pricing/free tier). **New assumptions:** P2-A1…P2-A6. **New UX log items:** UX-8, UX-9 (both consistent with Part 1 UX-1).
- **Compatibility:** Part 2 is fully compatible with Part 1 v1.2 and forward-compatible with Parts 3–5 (components → Part 3; microinteractions/notifications/AI detail → Part 4; a11y/analytics/edge/copy/checklist → Part 5). No existing content was modified.

---

*End of Part 2. Awaiting sign-off before proceeding to **Part 3 — Component Library + Design System**.*
