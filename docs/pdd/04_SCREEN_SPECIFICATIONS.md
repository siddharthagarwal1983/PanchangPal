# PanchangPal — PDD / UXS · Part 4 — Microinteractions + Notifications + AI Experience

**Version:** 4.0 (Working Draft)
**Status:** Part 4 of 5 — for sign-off
**Depends on:** Part 1 v1.2 (registries, governance, flows) · Part 2 v2.0 (screens) · Part 3 v3.1 (components, tokens, state machines)
**Owner:** Design (per §3.0A.5) · **Reviewers:** Engineering, AI, Product, Accessibility

---

## How Part 4 works

Three sections:
- **Section 7 — Microinteractions:** frame-level choreography for every animation, expressed with the **motion/duration tokens from Part 3 §6.6** and tied to the **component state machines from Part 3 §5**. Every entry specifies the trigger, the motion (property · from→to · duration token · easing token), haptic, sound, **Reduced-Motion fallback**, accessibility, and analytics.
- **Section 8 — Notifications:** every notification type with purpose, trigger, timing, personalization rules, copy, deep link, channel/priority, and analytics — the v1 re-engagement engine (notification-only per PRD).
- **Section 9 — AI Experience (Ask Guru):** the full RAG-grounded conversation experience, realizing the Annex D1 AI-dependency contract and the `CMP_AI_*` components.

**Governance ties.** Motion values come only from tokens (§3.0A.8, no hard-coded durations). Every animation degrades under **Reduced Motion** to `motion.reduced.crossfade` (150 ms opacity) unless a gentler specific fallback is named. Haptics use the `haptic.*` tokens and always respect system settings. Analytics cite `EVT_*` (§3.0.1); errors cite `ERR_*` (§3.0.2). Nothing here changes product scope, business rules, or functional requirements; UX-pattern improvements are marked `UX Improvement` and logged.

**Motion principle (from Part 1 §1.6, P1):** motion is gentle, purposeful, and brief — it guides attention and confirms sacred actions; it never entertains or celebrates loudly. When in doubt, do less.

---

# SECTION 7 — Microinteractions

**Entry format:** Trigger · Choreography (property · from→to · `duration.*` · `motion.easing.*`) · Haptic · Sound · Reduced-Motion · Accessibility · Analytics · Component/State-Machine ref.

**Global timing budget (from §3.0.4):** press/toggle feedback ≤ `duration.fast` (120 ms); standard transitions `duration.base` (200 ms); sheets/pages `duration.slow` (320 ms); completion ≤ `duration.completion` (1200 ms). Optimistic tap acknowledgment < 100 ms.

---

## 7.1 Button Press

**Trigger:** finger-down / finger-up on any `CMP_PRIMARY_BUTTON`, `CMP_SECONDARY_BUTTON`, `CMP_ICON_BUTTON`, chip.
**Choreography:** `transform.scale` 1.0 → 0.98 on press-in over `duration.fast` with `motion.easing.standard`; color `color.brand.primary` → `color.brand.primaryPressed`; release reverses over `duration.fast`. Token: `motion.press`.
**Haptic:** `haptic.selection` on commit (press-up that fires the action), not on press-in.
**Sound:** none.
**Reduced-Motion:** no scale; keep the color state change only (still communicates press).
**Accessibility:** press state is not the only affordance (label + role remain); loading transitions announce "…in progress" (see 7.11).
**Analytics:** the button's action event (varies); the press itself is not tracked.
**Ref:** `CMP_PRIMARY_BUTTON` state machine (Default→Pressed).

## 7.2 Swipe

**Trigger:** horizontal swipe on `CMP_MONTH_GRID` (month change), `CMP_ONBOARDING_SLIDE` (paging), `CMP_CONVERSATION_ROW`/`CMP_PERSONAL_DATE_ROW` (reveal delete).
**Choreography:**
- *Month/slide paging:* content translates with the finger (1:1), settles to the next page over `duration.base` with `motion.easing.decelerate`; rubber-band at range bounds.
- *Row swipe-to-reveal:* row translates to expose a destructive action; threshold triggers `CMP_DIALOG` confirm (never deletes on swipe alone).
**Haptic:** `haptic.selection` at page-commit and at swipe-action threshold.
**Sound:** none.
**Reduced-Motion:** paging → `motion.reduced.crossfade` between pages (no translate); row swipe still available (it's a functional gesture) but without elastic overshoot.
**Accessibility:** every swipe has a **button equivalent** — month has `CMP_MONTH_NAV`; slides have `CMP_PAGE_DOTS`/Next; row delete is also reachable via row-open → destructive action. Swipe is never the only path.
**Analytics:** `EVT_022` (month viewed on change); `EVT_024` if tradition-scoped.
**Ref:** `CMP_MONTH_GRID`, `CMP_ONBOARDING_SLIDE`.

## 7.3 Pull to Refresh

**Trigger:** overscroll-down at the top of `SCR_HOME_001` (and other refreshable lists).
**Choreography:** a calm custom indicator (a small diya/lotus that "fills") tracks pull distance; at threshold it commits and spins gently while refreshing; content fades in on completion over `duration.base`.
**Haptic:** `haptic.selection` at the commit threshold.
**Sound:** none.
**Reduced-Motion:** replace the spinner with a static "Refreshing…" label + a determinate-free but non-spinning indicator; content cross-fades in.
**Accessibility:** pull-to-refresh has an **accessible alternative** — a refresh action in `CMP_APP_HEADER`; state announced ("Refreshing", "Updated").
**Performance:** cached content already visible; refresh must not blank the screen (background refresh, §3.0.4).
**Analytics:** `EVT_012` re-fires on manual refresh only if data changes (avoid double-count) — **[ASSUMPTION P4-A1]** refresh emits a `refresh_source` property rather than a new event.
**Ref:** `CMP_LIST` / `SCR_HOME_001` (AC-HOME-01).

## 7.4 Prayer / Ritual Completed

**Trigger:** completing the final step in `CMP_RITUAL_STEP` → `CMP_COMPLETION_MOMENT`.
**Choreography:** a **calm** sequence, ≤ `duration.completion` (1200 ms), token `motion.success.small`:
1. The final step content gently fades/scales up (`color.brand.primary` glow blooms outward, low opacity).
2. A soft "settle" — the glow contracts to a warm point; optional lotus/diya mark draws in.
3. "Done for today 🪔" label fades in; streak reflects (subtle, secondary).
No confetti, no burst, no loud color (Principle P1; Emotional Design 1.6).
**Haptic:** a single `haptic.success` at the settle — never repeated.
**Sound:** an optional, **muted-by-default**, gentle chime (a single soft bell); user-controllable in Settings → Appearance/Sound.
**Reduced-Motion:** `motion.reduced.crossfade` — the completed state simply cross-fades in; no bloom; haptic still fires once; chime respects its own setting.
**Accessibility:** the outcome ("Done for today") is announced by the screen reader **regardless of animation state**; the celebration is decorative and skippable (tap to dismiss); never traps focus.
**Analytics:** `EVT_017` (Ritual Completed), `EVT_020` (Streak Advanced), `EVT_021` (Grace Day Used, if applicable).
**Ref:** `CMP_COMPLETION_MOMENT`; `CMP_RITUAL_STEP` state machine (Completing→done); North Star contribution (Weekly Household Ritual Completions).

## 7.5 AI Thinking

**Trigger:** user submits a question in `CMP_CHAT_INPUT`; awaiting first token.
**Choreography:** `CMP_TYPING_INDICATOR` — three dots with a gentle sequential opacity/scale loop (`motion.typing.dots`), warm muted color `color.icon.muted`. Persists until first streamed token (< 2 s budget) then is replaced by the streaming bubble.
**Haptic:** none.
**Sound:** none.
**Reduced-Motion:** dots become a **static** "Guru is thinking…" text (no looping motion).
**Accessibility:** the indicator exposes SR text "Guru is thinking"; announced once (polite), not looped to the screen reader.
**Analytics:** implicit between `EVT_029` (Question Asked) and `EVT_030` (Answer Streamed).
**Ref:** `CMP_TYPING_INDICATOR`; `CMP_AI_CHAT_BUBBLE` state machine (Thinking).

## 7.6 Calendar Transition

**Trigger:** month change (swipe or `CMP_MONTH_NAV`), tradition switch re-render.
**Choreography:** month grid slides in the swipe direction and settles over `duration.base` with `motion.easing.decelerate`; markers fade in `duration.fast` after the grid settles (staggered ≤ 60 ms). Tradition switch: quick cross-fade of marker/label layer only (grid structure stays), `duration.base`.
**Haptic:** `haptic.selection` on month commit.
**Sound:** none.
**Reduced-Motion:** month change → `motion.reduced.crossfade`; no slide, no marker stagger.
**Accessibility:** new month/tradition announced ("July 2026" / "Tamil calendar"); focus stays on the calendar, not lost mid-transition.
**Analytics:** `EVT_022`, `EVT_024`.
**Ref:** `CMP_MONTH_GRID`, `CMP_TRADITION_SWITCHER`.

## 7.7 Success (generic)

**Trigger:** a non-ritual action succeeds (save personal date, household created, reminder set, subscription active).
**Choreography:** `CMP_SNACKBAR` (success tone) slides up + fades over `duration.base` (`motion.snackbar`); optional inline checkmark draw (`motion.check`, `duration.fast`) on the committing control.
**Haptic:** `haptic.success` for meaningful commits (save/subscribe); `haptic.selection` for lightweight toggles.
**Sound:** none.
**Reduced-Motion:** snackbar fades in place (no slide); checkmark appears without draw animation.
**Accessibility:** snackbar announced via polite live region; success conveyed by icon + text (not color-only).
**Analytics:** the action's own success event (e.g., `EVT_025`, `EVT_006`, `EVT_051`).
**Ref:** `CMP_SNACKBAR` state machine; `motion.check`.

## 7.8 Error

**Trigger:** any user-visible failure (`ERR_*`).
**Choreography:** the error surface (inline field, `CMP_INLINE_NOTICE`, or `CMP_SNACKBAR` error tone) appears with a **gentle** fade/settle over `duration.base` — **no aggressive shake** (a subtle 2–3px horizontal nudge is permitted only for field-level validation, once, ≤ `duration.fast`). Errors are calm, never alarming (Trust P2).
**Haptic:** `haptic.error` — used **sparingly**, only for a blocking failure (payment failed, auth failed), not for routine validation.
**Sound:** none.
**Reduced-Motion:** no nudge; fade only.
**Accessibility:** error announced with cause + recovery; tied to the field where applicable; error conveyed by icon + text (not color-only); focus moves to the error where it blocks progress.
**Analytics:** `EVT_054` (Error Shown) carrying the `error_code`.
**Ref:** `CMP_INLINE_NOTICE`, `CMP_SNACKBAR`, `CMP_TEXT_INPUT` (error state).

## 7.9 Notification (in-app arrival & tap)

**Trigger:** a push arrives while the app is foregrounded, or the user taps a push.
**Choreography:** foreground arrival → a slim in-app banner (`CMP_INFO_BANNER`/heads-up style) slides down, auto-dismisses after ~4 s or on tap; tapping routes via the deep-link with a `duration.base` cross-fade into the destination.
**Haptic:** `haptic.selection` on tap-through (system handles the actual delivery haptic).
**Sound:** system notification sound respected; in-app arrival is silent.
**Reduced-Motion:** banner fades in/out (no slide).
**Accessibility:** banner announced politely; actionable and dismissible via SR; landing screen sets focus (see §8 deep-link rules).
**Analytics:** `EVT_040` (Received), `EVT_041` (Opened, with `notification_type`).
**Ref:** Section 8; Flow D4.

## 7.10 Haptic Feedback (catalog)

Central reference for `haptic.*` usage (values in §6.7). Haptics respect system settings and are never used for passive/scroll events.

| Token | Fires on | Notes |
|---|---|---|
| `haptic.selection` | commit taps, toggles, chip select, checklist item, page/month commit | the workhorse; subtle |
| `haptic.success` | ritual completion, meaningful save/subscribe | single, gentle; never repeated |
| `haptic.warning` | attention-needed validation (e.g., ambiguous tithi) | sparing |
| `haptic.error` | blocking failure (payment/auth) | sparing; not for routine validation |

**Reduced-Motion note:** haptics are independent of Reduced Motion (they aid, not distract) but obey the OS haptic/vibration setting.

## 7.11 Loading

**Trigger:** any async fetch or in-flight action.
**Choreography:**
- *Structural loads:* `CMP_SKELETON` shimmer (`motion.skeleton`) matching final layout — preferred over spinners for screen/content loads.
- *Action loads:* inline spinner inside the button (`CMP_PRIMARY_BUTTON` loading state), width preserved (no layout shift).
- *Streaming:* AI uses the thinking indicator (7.5), not a skeleton.
**Haptic:** none.
**Sound:** none.
**Reduced-Motion:** skeleton shimmer → static muted blocks; spinner → static "…" or a non-spinning progress affordance.
**Accessibility:** loading announces "loading" (polite); `aria-busy` on the region; button loading announces "…in progress"; never a focus trap.
**Performance:** cached-first render means loading states are the exception on returning-user surfaces (§3.0.4).
**Analytics:** none (loading is not an event); the resulting success/error is tracked.
**Ref:** `CMP_SKELETON`; `CMP_PRIMARY_BUTTON` (Loading).

## 7.12 Empty State

**Trigger:** a surface has no data yet (`CMP_EMPTY_STATE`).
**Choreography:** gentle fade-in of illustration + headline + subcopy + single CTA over `duration.base`; no looping animation. Grief-aware variant (personal dates) uses the quietest treatment — minimal or no illustration, no upbeat motion.
**Haptic:** none.
**Sound:** none.
**Reduced-Motion:** fade only (already gentle); no motion on the illustration.
**Accessibility:** heading→body→CTA SR order; illustration decorative; grief-aware variant avoids upbeat tone.
**Analytics:** none for the empty state itself; the CTA's action is tracked (e.g., `EVT_025`).
**Ref:** `CMP_EMPTY_STATE`.

## 7.13 Micro-catalog: additional interactions

| Interaction | Choreography (token) | Haptic | Reduced-Motion | Ref |
|---|---|---|---|---|
| Toggle switch | thumb slides on/off `motion.toggle` (`duration.fast`) | `haptic.selection` | thumb jumps (no slide) | `CMP_TOGGLE` SM |
| Checklist tick | checkmark draw `motion.check` + optional strikethrough | `haptic.selection` | check appears instantly | `CMP_CHECKLIST` |
| Bottom sheet | slide-up + scrim fade `motion.sheet` (`duration.slow`) | none | fade in place | `CMP_BOTTOM_SHEET` SM |
| Dialog | fade + scale 0.96→1 `motion.dialog` (`duration.base`) | none | fade only | `CMP_DIALOG` SM |
| Panchang reveal (onboarding) | staggered fade-in `motion.reveal.panchang` (emphasized) | none | static reveal | `CMP_PANCHANG_CARD` (reveal) |
| Progress ring | animate to fraction `motion.progress` (`duration.progress`) | none | jump to value | `CMP_PROGRESS_RING` SM |
| FAB show/hide | translate on scroll `motion.fab` | none | no hide (always visible) | `CMP_FAB` |
| Streak advance | subtle count-up + warm glow (secondary) | `haptic.selection` | number updates, no glow | `CMP_STREAK_COUNTER` |
| Splash | brand glow `motion.brand.pulse` (≤ `duration.splash`) | none | static logo | `CMP_BRAND_LOGO` |
| Tab switch | cross-fade destination `duration.base` | `haptic.selection` | cross-fade (already) | `CMP_BOTTOM_TAB_BAR` |

## 7.14 Microinteraction governance

- **Reduced Motion is a release gate** (Part 5 §10): every animation here has a fallback; QA asserts each degrades correctly (`Required Test Coverage` interaction/a11y flags, Part 3).
- **No motion conveys required information alone** — status/selection/errors always carry text/icon.
- **Vestibular safety:** no large parallax, no continuous background motion, no auto-playing full-screen motion; the largest motion (completion) is bounded and skippable.
- **Performance:** animations run on the native driver (transform/opacity), target 60fps; heavy layout animations are avoided (§3.0.4 budgets).

---

# SECTION 8 — Notifications

Notifications are v1's **only re-engagement channel** (lifecycle email is a 6-month roadmap item, PRD P1 #4). They are the external trigger that becomes an internal habit (Part 1 §1.4, Hook model). The governing tone is **warm, gentle, and never guilt-inducing** (Trust P2; the streak/guilt mechanic is ethically flagged, MRD §13).

## 8.0 Notification framework

**Permission dependency:** all notifications require the opt-in earned in `SCR_ONBOARDING_NOTIF_001` (Flow A4, primed before the OS dialog — UX-4). Denied users receive **no** push; value is delivered via in-app surfaces and (later) email. Re-ask is a soft in-app prompt after 2 completed loops.

**Channels / categories** (Android channels; iOS categories) — **[ASSUMPTION P4-A2]**, per-category toggles in Settings → Notifications:
| Channel | Contains | Default | User-controllable |
|---|---|---|---|
| `daily` | Morning reminder, evening prayer | On | Yes (per type + time) |
| `festival` | Festival & vrat reminders | On | Yes |
| `personal` | Shraddha/personal-date reminders | On | Yes (calm; never streak/promo) |
| `household` | Household reminders, invitations | On | Yes |
| `growth` | Referral nudges | Off by default | Yes |
| `lifecycle` | Streak nudges, win-back, subscription | On (streak/win-back), Off (promo) | Yes |

**Quiet hours:** a user-set quiet window (default 21:00–07:00 local) suppresses or defers all non-critical pushes to the next allowed slot (Flow D4). Personal-date and festival reminders scheduled for a specific time honor quiet hours by shifting to the nearest allowed time, not dropping.

**Frequency caps (global, server-configurable — A9):** ≤ 2 push/day typical; ≤ 1 win-back / 3 days; growth ≤ 1 / week; never stack multiple pushes in one window. A completed daily loop suppresses that day's later streak nudge.

**Personalization inputs:** location (correct local time + sunrise), chosen `ritual_time`, tradition/region (festival naming/dates), household role, streak/grace state, lapse segment, upcoming personal dates. **No PII in payloads** (privacy baseline); deep-link IDs only.

**Deep-link & analytics (every notification):** delivery → `EVT_040` (with `notification_type`, `channel`); tap → `EVT_041` → routes via `panchangpal://…` to a valid back-stack (Flow D4). Content-unavailable at tap → nearest valid surface + retry, never a crash (`ERR_OFFLINE`/`ERR_NETWORK_TIMEOUT`).

**Copy rules (see Part 5 §13 for the full library):** ≤ ~140 chars body; title ≤ ~40; warm, specific, and value-led; no guilt ("You lost your streak" is banned); regional/first-name personalization where available; one clear reason to open.

---

## 8.1 Morning Reminder `daily`

**Purpose:** Fire the core daily habit loop — the single most important notification.
**Trigger/Timing:** at the user's chosen `ritual_time` (default = local sunrise + offset), local to their city; skipped if today's ritual already completed.
**Personalization:** first name; today's tithi/festival if notable; rotating phrasing to avoid habituation.
**Deep link:** `panchangpal://today?focus=ritual` → `SCR_HOME_001` (ritual focused).
**Copy examples:**
- Title: "Good morning, Priya 🪔" · Body: "Today is Ekadashi. Your 2-minute moment is ready."
- Title: "A calm start" · Body: "Sunrise in Sydney was 6:41. Here's today's panchang."
**Suppression:** completed-today; quiet hours; cap.
**Analytics:** `EVT_040`/`EVT_041` (`notification_type=morning`). Target: open rate ≥ 35% (Annex A4).

## 8.2 Festival Reminder `festival`

**Purpose:** Ensure no festival/vrat is missed; drive understanding + observance (re-engagement).
**Trigger/Timing:** lead-time before the festival (default: 1 day before + morning-of), location-correct date, regional variant naming.
**Personalization:** regional festival name; household tradition; "how to prepare" hook.
**Deep link:** `panchangpal://festival/{id}` → `SCR_FESTIVAL_DETAIL_001` (back-stack = Calendar).
**Copy examples:**
- Title: "Diwali is in 3 days" · Body: "Here's how to prepare — and what each day means."
- Title: "Navratri begins tomorrow" · Body: "See tonight's rituals for your tradition."
**Edge:** regional date conflict → use the user's tradition's date; note variants in-app (`ERR_FESTIVAL_CONFLICT`, Part 5 §12).
**Analytics:** `notification_type=festival`. Target open ≥ 40% (Annex C1/D4).

## 8.3 Evening Prayer `daily`

**Purpose:** Optional second gentle touchpoint for users who observe an evening practice.
**Trigger/Timing:** user-enabled only (off by default to avoid over-notifying); at a chosen evening time or local sunset.
**Personalization:** evening-appropriate phrasing; today's remaining checklist items (if any).
**Deep link:** `panchangpal://today`.
**Copy example:** Title: "Evening calm" · Body: "A moment of gratitude before the day closes."
**Suppression:** honors quiet hours + daily cap; never fires if morning loop just completed within a short window.
**Analytics:** `notification_type=evening`.

## 8.4 Streak Reminder `lifecycle`

**Purpose:** Gentle nudge to protect a forming habit — **never** guilt-based (UX-3, Risk §5).
**Trigger/Timing:** later in the day only if today's loop is incomplete **and** a streak is active; respects grace-day logic (frames grace positively).
**Personalization:** grace-aware framing.
**Deep link:** `panchangpal://today?focus=ritual`.
**Copy examples (allowed):**
- Title: "Still time today" · Body: "A 2-minute moment keeps your rhythm going."
- Title: "Your grace day's got you" · Body: "Missed yesterday? Pick back up today — no streak lost."
**Banned copy:** "You'll lose your 42-day streak!", countdowns, loss-framed urgency.
**Suppression:** suppressed once the loop completes; ≤ 1/day; quiet hours.
**Analytics:** `notification_type=streak`; monitored for churn signal (A/B streak-tone test, MRD §13).

## 8.5 Household Reminder `household`

**Purpose:** Encourage shared household practice (North Star: Weekly Household Ritual Completions).
**Trigger/Timing:** gentle, low-frequency; e.g., "your family completed today's moment" positive social proof, or an upcoming shared festival.
**Personalization:** household name; who participated (positive framing only — never "X didn't do it").
**Deep link:** `panchangpal://today` or `panchangpal://household`.
**Copy example:** Title: "The Sharma family 🪔" · Body: "2 of you observed today — a lovely shared rhythm."
**Rule:** never shames a low-engagement member (Principle P5, social JTBD); opt-out easy.
**Analytics:** `notification_type=household`.

## 8.6 Personal-Date (Shraddha) Reminder `personal`

**Purpose:** Never miss a family observance (shraddha/anniversary) — the differentiator (PRD P0 #7). **Grief-aware** (UX-7).
**Trigger/Timing:** user-set lead time (same-day / 1-day / custom); computed via the tithi engine (auto-recurs yearly, no re-entry).
**Personalization:** name/relation the user entered ("Dadaji"); calm, respectful tone.
**Deep link:** `panchangpal://personal-date/{id}` → `SCR_PERSONAL_DATES_001`/detail.
**Copy examples (calm, no streak/promo):**
- Title: "A day to remember" · Body: "Dadaji's shraddha is tomorrow."
- Title: "Tomorrow" · Body: "Your family observance for Aai falls tomorrow."
**Rules:** **never** carries streak, gamification, or promotional content; respects quiet hours by shifting, not dropping; tone reviewed for sensitivity.
**Analytics:** `EVT_026` (Reminder Fired); `notification_type=personal`.

## 8.7 Family Invitation `household`

**Purpose:** Notify an inviter when a member joins; notify an invitee's acceptance path.
**Trigger:** invite accepted (`EVT_037`) → warm confirmation to inviter; expired invite → no push (handled in-app).
**Deep link:** `panchangpal://household`.
**Copy example:** Title: "Welcome to the family 🪔" · Body: "Aarti joined your household."
**Analytics:** `notification_type=household_invite`.

## 8.8 Subscription `lifecycle`

**Purpose:** Post-retention, non-intrusive billing/entitlement communications — **never** sales-pressure into the sacred loop (Principle P4).
**Trigger/Timing:** transactional only in v1 — purchase confirmation, renewal notice, payment issue, restore success. Promotional upgrade pushes are **off by default** (`growth`/`lifecycle` promo opt-in).
**Personalization:** plan; family vs. individual.
**Deep link:** `panchangpal://subscription`.
**Copy examples:**
- Title: "You're all set" · Body: "PanchangPal is ad-free for your household. Thank you 🪔."
- Title: "Payment needs attention" · Body: "Update your payment to keep your plan active." (`ERR_PAYMENT_FAILED`)
**Rule:** transactional > promotional; no dark-pattern urgency.
**Analytics:** `notification_type=subscription`.

## 8.9 Win-back `lifecycle`

**Purpose:** Recover lapsed users via fresh-start hooks (Flow D5); addresses the no-win-back-loop gap (MRD §9).
**Trigger/Timing:** lapse at 7 / 14 / 30 days (server-tunable, A9); prefer a value-led hook (upcoming festival or personal date) over a generic nudge; cadence backs off automatically; ≤ 1 / 3 days.
**Personalization:** lapse segment; nearest festival/personal date; warm welcome-back framing (no guilt).
**Deep link:** festival/personal → their detail; else `panchangpal://today`.
**Copy examples:**
- Title: "Diwali is near" · Body: "Come prepare with us — here's where to start."
- Title: "Your moment's still here" · Body: "A calm 2 minutes whenever you're ready."
**Return handling:** landing = welcome-back state; streak framed as "start fresh," never loss.
**Analytics:** `EVT_042` (Sent), `EVT_043` (Returned); `notification_type=winback`. Target return ≥ 12% (Annex D5).

## 8.10 Notification Timing & Personalization — summary rules

1. **Local, not India-default** — every time-based push uses the user's city/timezone (the core differentiator; MRD §7).
2. **Value first** — every push gives a concrete reason to open (today's tithi, a festival, a specific date), never a bare "come back."
3. **Suppress on completion** — a completed loop cancels that day's later daily/streak nudges.
4. **Quiet hours shift, don't drop** — time-critical (festival/personal) reminders move to the nearest allowed time.
5. **Caps + backoff** — global caps (8.0); win-back and growth back off automatically.
6. **Positive framing only** — no guilt, no loss countdowns, no shaming a household member.
7. **Personal dates are sacred** — calm, respectful, never gamified or promotional.
8. **Every push is deep-linked + attributed** — `EVT_040/041` with `notification_type` for funnel analysis (Part 5 §11).

---

# SECTION 9 — AI Experience (Ask Guru)

Ask Guru is the RAG-grounded assistant that answers ritual/festival questions with **grounded, trustworthy guidance, and honest limits**. It is the highest-leverage *and* highest-risk feature: it can validate the AI thesis (PRD Goal 3: 25% WAU) but a single confident-wrong answer costs disproportionate trust (Risk §3, §10; Trust P2). This section realizes the **Annex D1 AI-dependency contract** and the `CMP_AI_*` components/state machine (Part 3 §5.10).

## 9.0 Design tenets (non-negotiable)

1. **Grounded or silent.** Every substantive answer is grounded in the app's **reviewed content library** (RAG). Below the confidence threshold, Guru **declines honestly** — it never guesses (PRD P0 #4 AC).
2. **Show your sources.** Grounded answers display the retrieved source(s) (`CMP_SOURCE_CHIP`) — visible trust.
3. **Humble, warm, in-scope.** Guru is a knowledgeable, humble family friend, not an oracle. It stays within ritual/festival/panchang scope and refuses gently outside it (no astrology/medical/legal/political).
4. **No fabrication on failure.** Timeouts/errors show a retry, never invented content.
5. **No memory in v1.** In-session context only; **no cross-session long-term memory** (AI Non-Goal) — a privacy and trust choice.
6. **Accessible & calm.** Streaming is announced politely; the thinking indicator degrades under Reduced Motion; nothing about the AI feels frantic.

## 9.1 Architecture (Annex D1 contract, UX-facing)

```
User question (CMP_CHAT_INPUT)
        │  EVT_029
        ▼
[Safety/scope classifier] ──out-of-scope──► Gentle refusal (EVT_034)
        │ in-scope
        ▼
[Embed query] → [Vector search over reviewed CONTENT_CHUNK] → retrieval score
        │
        ├─ score ≥ threshold ──► [Prompt builder: system + retrieved context + guardrails]
        │                              │
        │                              ▼
        │                        [LLM generate → STREAM]  EVT_030 (first token)
        │                              │
        │                              ▼
        │                        Grounded answer + Source chips (EVT_031) + Helpful rating
        │
        └─ score < threshold (ERR_RAG_LOW_CONFIDENCE / ERR_RAG_EMPTY)
                                       ▼
                        Honest decline + safe alternatives (EVT_033)
```
**AI dependencies (Annex D1):** LLM (vendor TBD — open PRD question), embeddings (query + content), vector search over the reviewed library, prompt builder with scope guardrails, RAG (**required**), streaming, in-session history (no long-term memory), **confidence threshold** (server-tunable, `[PRD FOLLOW-UP] F-6`), safety filter, source citation, fallback = honest decline / retry. Backend: `API_POST_ASK_GURU` orchestrates classify→retrieve→generate.

## 9.2 Ask Guru Home (`SCR_GURU_HOME_001`)

**Trust-first entry.** `CMP_GURU_HEADER` leads with a trust line: *"Guru answers from verified sources — and says so when it's not sure."* Below: **contextual suggested questions** (from today's panchang/festival/ritual) + **evergreen prompt starters**, then `CMP_CHAT_INPUT`.

**Suggested questions / prompt suggestions (UX Improvement UX-6 realized):**
- *Contextual* (from `API_GET_GURU_SUGGESTIONS`, seeded by today's context): "What is Ekadashi and how is it observed?", "Why do we light a diya at dusk?", "How is Navratri celebrated in Tamil tradition?"
- *Evergreen fallback* (offline/no context): "How do I start a simple daily practice?", "What does today's tithi mean?", "Explain a festival to my kids."
- Contextual entry from other screens ("Ask about this" on ritual/festival/panchang) pre-seeds the relevant question and routes to `SCR_GURU_CHAT_001`.

**States:** suggestions skeleton → chips; offline → input disabled with `ERR_OFFLINE` note, cached history still openable. **Analytics:** `EVT_027` (opened), `EVT_028` (suggestion tapped).

## 9.3 Conversation (`SCR_GURU_CHAT_001`)

**Message model:** user bubbles right (`color.bubble.user`), assistant left (`color.bubble.assistant`); `CMP_AI_CHAT_BUBBLE` with sub-states {streaming, complete, declined, refused, error} (Part 3 state machine).

### 9.3.1 Typing / thinking animation
After send: `CMP_TYPING_INDICATOR` (7.5) until first token (< 2 s budget). SR: "Guru is thinking." Reduced-Motion: static text.

### 9.3.2 Streaming responses
Tokens append to the assistant bubble as they arrive (`EVT_030` on first token). Streaming is **smooth, not jumpy** (batch tokens into ~animation-frame updates). On completion: source chips (`CMP_SOURCE_CHIP`, `EVT_031`) and `CMP_HELPFUL_RATING` attach. **Accessibility:** streamed text announced via a **polite** live region, **batched** (e.g., on sentence boundaries or ~1 s cadence) to avoid per-token SR spam; a "stop" affordance lets the user halt generation. **Performance:** first token < 2 s; typical short answer complete < 6 s (§3.0.4).

### 9.3.3 Source citation experience (RAG trust)
Grounded answers show 1–3 `CMP_SOURCE_CHIP`s ("Source: {title}"). Tapping opens the source content (`CMP_INFO_SHEET`) so the user can verify. When content is human-reviewed (paid pandit/Jain reviewers), that provenance may be surfaced ("Reviewed content") as an extra trust signal. Sources are a **first-class** part of the answer, not a footnote.

### 9.3.4 Conversation history (`SCR_GURU_HISTORY_001`)
Past conversations are listed reverse-chronologically and re-openable/continuable **within a session's context** — but Guru holds **no long-term memory across sessions** (AI Non-Goal): re-opening shows the stored transcript; new questions don't silently draw on old ones unless in the same active thread. This is stated plainly to set expectations (trust > faux-omniscience).

## 9.4 Error recovery

| Case | Code | Experience | Analytics |
|---|---|---|---|
| LLM timeout | `ERR_AI_TIMEOUT` | Calm `CMP_INLINE_NOTICE`: "I'm having trouble right now — try again." + Retry. **No partial/fabricated answer shown.** | `EVT_054` |
| LLM/API error | `ERR_AI_ERROR` | Same as above; retry; if repeated, suggest trying later. | `EVT_054` |
| Offline | `ERR_OFFLINE` | Input disabled with "Ask Guru needs a connection"; cached history readable. | `EVT_053` |
| Stream interrupted | `ERR_AI_ERROR` | Keep what streamed if coherent + a "regenerate" option, or discard + retry (never leave a half-sentence presented as complete). | `EVT_054` |

**Rule:** errors are calm (not red-alarm), actionable, and never expose raw stack/model errors.

## 9.5 Hallucination recovery (the honest decline)

The core trust mechanic. When retrieval confidence is below threshold (`ERR_RAG_LOW_CONFIDENCE`) or empty (`ERR_RAG_EMPTY`), Guru **does not answer from the base model**. Instead (`EVT_033`):

> "I don't have verified information on this one. I'd rather not guess on something this important."

…followed by **safe alternatives** (`CMP_INLINE_NOTICE` actions):
- **Rephrase** the question,
- Explore a **related verified topic** (a suggestion Guru *can* ground),
- **Ask a temple / knowledgeable elder** (a graceful human hand-off).

**Post-hoc safety net:** even above threshold, generation is constrained to retrieved context; a lightweight **groundedness check** (**[ASSUMPTION P4-A3]**, server-side) can downgrade a weakly-supported answer to a decline. **Never** does Guru present an ungrounded specific (a date, a mantra, a procedure) as fact. Periodic **hallucination audits** (MRD §14 AI metrics) track refusal accuracy (target ≥ 95%, Annex D1).

## 9.6 Safety & scope

**In scope:** rituals, festivals, vrats, panchang concepts, general "how/why we observe" questions, kid-friendly explanations.
**Out of scope → gentle refusal (`EVT_034`):** astrology/kundli/horoscope predictions, medical/health, legal, financial, political/communal topics, personal predictions, anything requiring individualized religious authority. Example:

> "That's outside what I can help with. I can explain rituals, festivals, and today's panchang — want me to help with one of those?"

**Guardrails (prompt-builder level):** system prompt scopes Guru to retrieved content + allowed topics; **jailbreak resistance** — a QA **refusal test set** (Risk §4) asserts out-of-scope and adversarial prompts are refused; no impersonation of a specific named religious authority; apolitical, non-sectarian, culturally respectful; child-safe tone (households include youth). **No PII retention** in prompts/logs beyond session need (privacy baseline).

## 9.7 Trust messaging (surfaced, not buried)

- **Header line** (every session): "Guru answers from verified sources — and says so when it's not sure."
- **On decline:** the honest-limits copy (9.5) — a *feature*, not an apology.
- **Sources shown** on every grounded answer.
- **One-time intro** (first Ask Guru open): a brief, dismissible note on what Guru can/can't do and that it may be wrong — set expectations early.
- **Feedback loop:** `CMP_HELPFUL_RATING` (`EVT_032`) + optional reason on thumbs-down feeds the content/RAG improvement backlog.

## 9.8 RAG content & experience dependencies

- **Content library first:** RAG depends on the reviewed content library being substantively complete **before** launch (PRD dependency — not built in parallel). The same dataset is cross-referenced against Drik Panchang/mPanchang and passed through paid reviewers.
- **Retrieval UX:** retrieval latency is hidden inside the thinking indicator; first token < 2 s. If retrieval is slow but will succeed, keep the thinking state (don't prematurely error).
- **Confidence threshold** is server-tunable (F-6) so the decline/answer balance can be calibrated against real refusal-accuracy and helpfulness data post-launch.
- **Cost control:** per-query cost is an open PRD question; rate-limiting/cost caps (Risk §2) apply server-side; the free-tier AI limits (if any) are a monetization decision (Part 2 SCR_SUBSCRIPTION_001), never degrading the honest-decline behavior.

## 9.9 AI analytics (funnel)

`EVT_027` open → `EVT_028` suggestion tap → `EVT_029` question asked → `EVT_030` answer streamed → `EVT_031` sources shown → `EVT_032` rated · with `EVT_033` (declined) / `EVT_034` (refused) / `EVT_054` (error) as branch outcomes. KPIs (Annex D1): WAU engagement ≥ 25%, helpfulness ≥ 75%, refusal accuracy ≥ 95%. Full property schemas in Part 5 §11.

---

# Part 4 — UX Change Log

Part 4 realizes Part 1–3 decisions; it introduces **no new UX-pattern deviations** beyond those already logged (it *applies* UX-3 gentle streak, UX-4 notif priming, UX-6 contextual Ask Guru, UX-7 grief-aware personal dates). Items below are additive design specifications (assumptions), not scope/rule changes.

### `[PRD FOLLOW-UP]` — new items surfaced in Part 4
| # | Observation | Why it's the PRD's / owner's call |
|---|---|---|
| F-15 | **Notification channel taxonomy & defaults** (P4-A2) and quiet-hours default window need product ratification | Notification policy decision |
| F-16 | **Groundedness post-check** (P4-A3) beyond the retrieval threshold — whether to add a secondary check, and its cost | AI architecture/cost decision (extends F-6) |
| F-17 | **Evening-prayer + promotional-push defaults** (opt-in vs. opt-out) | Notification/monetization policy |

### Assumptions introduced in Part 4
| # | Item |
|---|---|
| P4-A1 | Pull-to-refresh emits a `refresh_source` property rather than a new analytics event. |
| P4-A2 | Notification channels = {daily, festival, personal, household, growth, lifecycle} with the defaults in §8.0; quiet hours default 21:00–07:00 local. |
| P4-A3 | A lightweight server-side groundedness post-check may downgrade weakly-supported answers to an honest decline (extends the confidence threshold, F-6/F-16). |

---

# Part 4 — Readiness Summary

- **Microinteractions (§7):** all 12 prompt-listed animations plus a micro-catalog, each with token-based choreography, haptics, sound, **Reduced-Motion fallback**, accessibility, and analytics — bound to Part 3 tokens (§6.6) and component state machines. No hard-coded motion values (§3.0A.8).
- **Notifications (§8):** a full framework (channels, quiet hours, caps, personalization, deep-link + `EVT_040/041`) and every notification type (morning, festival, evening, streak, household, personal-date, invitation, subscription, win-back) with warm, guilt-free copy and grief-aware personal dates.
- **AI Experience (§9):** the complete Ask Guru spec — grounded-or-silent RAG, sources, streaming, honest decline/hallucination recovery, safety/scope refusals, trust messaging, history-without-long-term-memory, error recovery, and the AI analytics funnel — realizing the Annex D1 contract.
- **New PRD follow-ups:** F-15 (notification taxonomy/defaults), F-16 (groundedness post-check), F-17 (evening/promo push defaults). **New assumptions:** P4-A1…A3. **No new UX-pattern deviations.**
- **Compatibility:** fully consistent with Parts 1–3; forward-compatible with Part 5 (a11y ratifies Reduced-Motion/announcements; analytics §11 expands the AI + notification funnels; edge cases §12 detail the `ERR_*` handling referenced here; UX copy §13 expands the notification/AI copy library).

---

*End of Part 4. Awaiting sign-off before proceeding to **Part 5 — Accessibility + Analytics + Edge Cases + UX Copy + Usability Review + Implementation Checklist**.*

