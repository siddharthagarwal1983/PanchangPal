# PanchangPal — Store Privacy Labels

**Version:** 1.0.0
**Last Updated:** 2026-07-27
**Derived from:** `DATA_INVENTORY.md` v1.0.0
**Covers:** Google Play Data Safety · Apple App Privacy (App Store Connect)
**Slice:** B6.3 · TDD Part 5 §6.2 ("store privacy labels/Data Safety accurate to actual collection")

---

## 0. How to use this document

These are the answers to give at submission, derived from what the code actually does.

**Two rules govern them, and they pull in opposite directions:**

1. **Labels must describe collection as it is at submission**, not as the schema anticipates.
   Declaring collection that does not happen is inaccurate, invites reviewer questions the app
   cannot answer, and — for Apple — commits the app to a disclosure it will be measured against.
2. **A label that becomes wrong when a feature flag flips is a violation the moment it flips.**
   Several answers below change the day `expo-notifications`, `react-native-purchases` or
   `GURU_LIVE` land. Those are marked ⚠️.

Both stores require the label to be updated **before** the change reaches users, and Google Play
treats an inaccurate Data Safety form as a policy violation independent of the app's behaviour.

⛔ **Blocking dependency.** Both stores ask whether users can request deletion of their data. Today
the honest answer is *no* — the request is recorded and never carried out (`DATA_INVENTORY.md` §8.2).
The app must not be submitted until that is fixed, because the alternative is answering "yes" to a
capability that does not exist.

---

## 1. Google Play — Data Safety

### 1.1 Overview answers

| Question | Answer today | Notes |
|---|---|---|
| Does your app collect or share any of the required user data types? | **Yes** | App activity + app info/performance |
| Is all of the user data collected by your app encrypted in transit? | **Yes** | HTTPS to Supabase and Expo only |
| Do you provide a way for users to request that their data be deleted? | ⛔ **Cannot answer "Yes" yet** | See §0. Answer becomes **Yes** once the deletion executor ships. |
| Do you have an account deletion mechanism (URL required)? | ⛔ Blocked | Play requires a **web URL** for account deletion requests; none exists. Owner + engineering. |
| Have you committed to follow the Play Families policy? | N/A | Not a Families app — pending the §11 age decision in `PRIVACY_POLICY_DRAFT.md` |

### 1.2 Data types — declare

| Play data type | Collected | Shared | Purpose | Optional? | Basis |
|---|---|---|---|---|---|
| **App activity → App interactions** | Yes | No | Analytics, App functionality | Required | `EVT_012/015–021` |
| **App info and performance → Crash logs** | Yes | No | Analytics | Required | `EVT_054` error events land in `analytics_event` |
| **App info and performance → Diagnostics** | Yes | No | Analytics | Required | `app_version`, `platform` on every event |
| **Personal info → Other** — spiritual practice preferences, saved remembrance dates | Yes | No | App functionality | Required | `user_profile`, `personal_date` |

> **`personal_date` and the Play taxonomy.** Play has no category for "a name and date the user saves
> to be reminded of." It is personal information about an identified individual, so it is declared
> under *Personal info → Other* with a plain-language description rather than squeezed into a poorer
> fit. `[LEGAL REVIEW REQUIRED]` — confirm this is the right bucket; the alternative reading is that
> the app should not have to declare it at all because it never leaves the user's own account, and
> that reading is wrong (collection is collection, regardless of who can read it).

### 1.3 Data types — do **not** declare (and why)

| Play data type | Why not |
|---|---|
| **Location** (approximate or precise) | ⚠️ No location permission is declared and no coordinates are stored. `expo-location` is not a dependency. **Becomes declarable when panchang ships (ADR-033).** |
| **Personal info → Email address** | The app never stores an email in its own tables. Supabase Auth holds one only if the user opts into email sign-in. `[LEGAL REVIEW REQUIRED]` — arguably declarable as *Personal info → Email address, collected, required for account creation*, since Play's question is about collection rather than about which database it lands in. **Recommendation: declare it** — the conservative answer costs nothing and the aggressive one is a violation if wrong. |
| **Financial info** | ⚠️ No purchase flow is built (`react-native-purchases` not installed). **Becomes declarable with subscriptions.** |
| **Messages** | ⚠️ Ask Guru is gated off; no message is stored. **Becomes declarable when `GURU_LIVE` is enabled** — questions the user types are stored and sent to OpenAI, which is also *sharing* with a third party. |
| **Device or other IDs** | The analytics identifier is randomly generated on device, is not an advertising ID or device ID, and is not linked to identity. `[LEGAL REVIEW REQUIRED]` — Play's definition is broad; a pseudonymous app-scoped ID is generally out of scope, but confirm. |
| **Contacts, Photos, Audio, Calendar, Health, Files** | No permission, no API use, no storage. |

### 1.4 What changes, and when

| Trigger | Label change required |
|---|---|
| `expo-location` + ADR-033 ratified | Add **Location — approximate**, optional, App functionality |
| `expo-notifications` installed | Push token — generally not a declarable type on Play, but review; add notification-related purposes |
| `react-native-purchases` installed | Add **Financial info → Purchase history**; declare RevenueCat as a processor |
| `GURU_LIVE = true` | Add **Messages**, and mark it **shared** with OpenAI |
| Sentry DSN provisioned | Crash logs move from "collected by us" to also **shared** with Sentry |

---

## 2. Apple — App Privacy (App Store Connect)

Apple's model is three-way: *Data Used to Track You* · *Data Linked to You* · *Data Not Linked to
You*.

### 2.1 Data Used to Track You

**None.** The app contains no advertising SDK, no attribution SDK, and no identifier shared with any
data broker or third party for advertising. `NSUserTrackingUsageDescription` is not needed and the
ATT prompt is not shown.

### 2.2 Data Linked to You

Declared where the data sits in an account the user can be identified through — which, for an
authenticated (email-OTP) user, includes the practice data.

| Apple category | Data | Purpose |
|---|---|---|
| **Contact Info → Email Address** | Only when the user upgrades to email sign-in | App Functionality |
| **User Content → Other User Content** | Saved personal dates (a name + a date) | App Functionality |
| **Other Data** | Practice preferences: tradition, ritual time, content depth, timezone | App Functionality |
| **Usage Data → Product Interaction** | Ritual and checklist activity, streaks | App Functionality, Analytics |

> **Anonymous users complicate this.** Most users are anonymous (ADR-009) and never provide an
> identifier, so for them this data is arguably *not linked*. Apple does not offer a "linked only for
> some users" answer, so the **stricter** classification is used: if the data *can* become linked —
> and it does, the moment a user signs in and their anonymous data is merged — it is declared as
> linked. `[LEGAL REVIEW REQUIRED]` — confirm.

### 2.3 Data Not Linked to You

| Apple category | Data | Purpose |
|---|---|---|
| **Diagnostics → Crash Data** | `EVT_054` error events — error code, screen, recoverable flag | Analytics |
| **Diagnostics → Performance Data** | App version, platform | Analytics |
| **Usage Data → Product Interaction** | Events carrying only the device-minted random id | Analytics |

The identifier is a random UUID minted on the device, never derived from the account, and reset by a
reinstall.

### 2.4 Not declared

**Location · Financial Info · Health & Fitness · Contacts · Photos · Search History · Browsing
History · Identifiers (advertising/device) · Sensitive Info.**

⚠️ **Location, Financial Info and User Content → Customer Support / Other move into scope** with the
same triggers listed in §1.4. Apple treats an app that collects data it did not declare as a review
rejection and, post-release, a compliance problem.

### 2.5 Required App Store Connect fields

| Field | Status |
|---|---|
| Privacy Policy URL | ⛔ **Missing** — the policy is an unreviewed draft with no hosting (`PRIVACY_POLICY_DRAFT.md`) |
| Account deletion within the app | ⛔ **Missing** — Apple requires apps that support account creation to offer in-app account deletion. Both the deletion executor *and* the UI affordance are unbuilt. |

> **This is the sharpest of the two stores' requirements.** Apple's guideline 5.1.1(v) requires an
> app offering account creation to offer **in-app account deletion** — not an email address, not a
> web form. PanchangPal creates accounts (anonymous and email). It therefore needs: the deletion
> executor (engineering), a deletion screen (PDD owes it — none is specified), and the ownership-
> transfer path it depends on (SVC_household, unimplemented). **This is a three-part dependency and
> the longest pole in submission readiness that is not an owner purchase.**

---

## 3. Sensitive-content considerations

Neither store's privacy form asks about religion, but both have content and age-rating questions
where it is relevant, and it bears on the labels above:

- The app is a **Hindu spiritual companion**. A user's saved tradition (`tradition_code`) is,
  arguably, information about religious belief — a special category under several regimes even
  though CCPA and the store forms treat it more loosely. It is stored, it is user-set, and it never
  leaves the user's own account. `[LEGAL REVIEW REQUIRED]` — whether this needs explicit treatment
  in the labels, the policy, or both.
- Personal dates frequently commemorate the deceased (UX-7). Handled as sensitive throughout; never
  sent to analytics, logs or AI prompts (ADR-031).

---

## 4. Submission readiness

| # | Blocker | Owner | Blocks |
|---|---|---|---|
| 1 | Deletion is never executed | Engineering | Both stores' deletion answers |
| 2 | No in-app account-deletion UI | PDD (screen) + Engineering | **Apple 5.1.1(v)** |
| 3 | No account-deletion URL | Owner (hosting) | **Play** |
| 4 | Privacy policy unreviewed and unhosted | Legal + Owner | Both stores |
| 5 | Ownership transfer needs SVC_household | Engineering | Deletion for household owners |
| 6 | Apple Developer membership ($99) · Google Play ($25) | Owner | Submission itself |

**Nothing in this document can be filed until 1–4 are closed.** They are recorded here rather than
in a checklist elsewhere because the labels are where their absence becomes a false statement rather
than a missing feature.

---

## 5. Maintenance

Re-derive from `DATA_INVENTORY.md` whenever it changes, and re-check **at every submission** — the
answers are a snapshot of actual collection, and this project has three deferred dependencies
(`expo-notifications`, `react-native-purchases`, `GURU_LIVE`) whose arrival each changes them.

`DATA_INVENTORY.md` §2 and §4 are pinned to the schema and the emitted events by
`apps/backend/tests/privacy/data-inventory.test.ts`, so a new table or event will fail CI until it is
classified. **That test does not reach this file** — a newly classified table still needs a human to
decide what it means for a store label.
