# PanchangPal — Privacy Policy (DRAFT)

> ## ⚠️ THIS IS AN ENGINEERING DRAFT — `[LEGAL REVIEW REQUIRED]`
>
> It is written by engineering from `DATA_INVENTORY.md`, which was derived from the code. It
> describes accurately **what the software does**. It has **not** been reviewed by a lawyer and
> makes no claim to satisfy CCPA, the Australian Privacy Principles, the New Zealand Privacy Act,
> or any store policy. Do not publish it, link it from a store listing, or present it to a user
> until a qualified reviewer has approved it.
>
> **It also describes a product that is not finished.** Deletion now works (§7.2, shipped
> 2026-07-27) but its daily schedule needs `pg_cron` enabled on the hosted project; and **data is
> still not recoverable** — there is no point-in-time backup (§9). Those are an owner action and an
> engineering/purchase gap respectively, not drafting choices. Check the appendix before
> publishing: some sentences here are true of the code and not yet true of production.

**Draft version:** 1.1.0
**Drafted:** 2026-07-27 (§7.2 rewritten — the deletion executor shipped)
**Derived from:** `DATA_INVENTORY.md` v1.1.0
**Applies to:** PanchangPal mobile app (iOS, Android) — `com.panchangpal.app`

---

## Editorial rules this draft follows

1. **Nothing is claimed that the code does not do.** Where a protection is intended but unbuilt, the
   draft says so in an `[UNBUILT]` marker rather than describing the intention in the present tense.
2. **Sections that depend on a deferred feature are marked `[NOT YET ACTIVE]`.** They are drafted
   now so that the day Ask Guru, notifications or subscriptions go live, the policy does not need to
   be rewritten under time pressure — but they must not be published as active while they are not.
3. **Every point needing a lawyer carries `[LEGAL REVIEW REQUIRED]`.**

---

## 1. Who we are

PanchangPal is a Hindu spiritual companion app. `[LEGAL REVIEW REQUIRED]` — the legal entity name,
registered address, and a contact address for privacy enquiries must be inserted here. CCPA requires
a designated method for submitting requests; a stated email address is the usual minimum.

---

## 2. The short version

- You can use PanchangPal **without giving us your name, email, or phone number.** The app signs you
  in anonymously by default.
- We collect what the app needs to work — your practice preferences, which rituals you have
  completed, and any personal dates you choose to save — and pseudonymous usage statistics.
- **We do not sell or share your personal information**, and we do not use it for advertising.
- We do not have advertising trackers or third-party analytics SDKs in the app.

---

## 3. Information we collect

### 3.1 Information you give us

| What | When | Why |
|---|---|---|
| Your practice preferences — tradition, ritual time, content depth, appearance | You set them in the app | To show you the right daily content |
| Your time zone | Automatically, from your device settings | So that "today" means your today, not a server's |
| Personal dates you save — a name and a date or tithi, and reminder preferences | Only if you choose to add one | To remind you of the anniversaries you ask to be reminded of |
| Your email address | Only if you choose to sign in with a one-time code | To let you keep your data across devices and reinstalls |

**About personal dates.** These often commemorate someone who has died. We treat this as the most
sensitive information in the app: it is stored under access rules that make it readable only by you,
and it is **never** sent to our analytics, our logs, or any AI system.

`[LEGAL REVIEW REQUIRED]` — whether a name saved as a remembrance constitutes personal information
about a *third party* (the deceased or living relative named), and what that implies in AU/NZ.

### 3.2 Information created as you use the app

| What | Detail |
|---|---|
| Ritual completions | Which ritual, on which of your local dates, and when |
| Checklist completions | Which item, on which local date |
| Streak | Your current and best streak, and remaining grace days |
| Usage statistics | Pseudonymous events — see §4 |

### 3.3 Information we do **not** collect

- **We do not collect your location.** The app requests no location permission and stores no
  coordinates. *(This changes at launch — see §10.)*
- **No contacts, photos, microphone, camera, calendar, or health data.**
- **No advertising identifier, and no advertising or attribution SDK of any kind.**
- **No device fingerprint.**

---

## 4. Usage statistics, and why they are not linked to you

We record a small set of events — a day viewed, a ritual started, advanced, completed or abandoned,
a checklist item ticked, a streak advancing, and app errors — to understand whether the product
helps people keep a practice.

These are attached to a **randomly generated identifier created on your device**. It is not derived
from your account, your email, or anything about your device. If you reinstall the app, a new one is
generated and the old activity cannot be connected to you.

Three limits are built into the software rather than promised by policy:

- Event data can only contain simple values (text, numbers, true/false). Structured objects are
  discarded at the boundary, because that is the route by which an error or a server response could
  otherwise carry your content into our statistics.
- Only events from a fixed, pre-defined list are accepted; anything else is rejected.
- When the app reports an error, it sends an **error code**, never the error's message or your
  content.

Your device can write these statistics but **cannot read any back** — not yours, and not anyone
else's.

---

## 5. Who else receives your information

| Who | What they receive | Why |
|---|---|---|
| **Supabase** | All of the data described in §3 — they host our database, accounts and servers | Hosting |
| **Expo** | When your app checks for an update: an installation identifier, app version and platform | Delivering app updates |

`[NOT YET ACTIVE]` — these will apply once the corresponding features ship:

| Who | What they will receive | When |
|---|---|---|
| **OpenAI** | The text of a question you ask the AI feature, plus reference material from our own library | When Ask Guru is enabled |
| **RevenueCat** | Purchase receipts and store transaction identifiers | When subscriptions are enabled |
| **Expo push service** | A notification token for your device and the content of notifications | When reminders are enabled |
| **Sentry** | Crash diagnostics, containing no personal information by design | When crash reporting is enabled |

**We do not sell your personal information, and we do not share it for cross-context behavioural
advertising** (CCPA §1798.120). We have no advertising relationships.

---

## 6. Where your data is stored

Your data is stored in the **United States**.

PanchangPal is offered in the United States, Australia and New Zealand. **If you are in Australia or
New Zealand, your personal information is stored and processed outside your country.**

`[LEGAL REVIEW REQUIRED]` — Australian Privacy Principle 8 and New Zealand IPP 12 both govern
disclosure of personal information overseas and may require specific wording, and possibly consent,
beyond this notice.

---

## 7. Your rights

### 7.1 Access and export

You can request a copy of your data. It is returned as a JSON file containing your profile, personal
dates, conversations, streak, ritual completions and checklist completions.

**`[UNBUILT]` — there is currently no button in the app that does this.** The capability exists on
our servers, but no screen calls it, so today the request can only be made by contacting us.
`[LEGAL REVIEW REQUIRED]` — whether a contact-only route satisfies CCPA's requirement for a
designated request method.

### 7.2 Deletion

> **Status: the executor shipped 2026-07-27.** This section previously carried a
> DO-NOT-PUBLISH banner because the app recorded deletion requests and never carried them out.
> The erasure now exists, is atomic, and is proven by 17 pgTAP assertions that check the rows are
> **gone** table by table.
>
> ⚠️ **One dependency remains before this is true in production:** the daily sweep runs on
> `pg_cron`, which must be enabled on the hosted Supabase project (a dashboard action). Until it
> is, deletions execute only when an operator triggers the sweep by hand. Do not publish this
> section against an environment where `account_deletion_sweep_is_scheduled()` returns false.

You may ask us to delete your account and everything in it. We keep your data for 30 days so that
you can change your mind, and then permanently erase it — your profile, your ritual and checklist
history, your streak, your saved personal dates, and your conversations.

If you own a household with other members, we will ask you to transfer ownership first, so that the
household is not deleted out from under the people in it.

Two things we will state precisely, because they are easy to imply loosely:

- **What survives.** Usage statistics are not deleted, because they were never connected to you:
  they carry a random identifier generated on your device and no way to trace back to your account
  (§4). Nothing in them identifies you before or after deletion.
- **Someone else's records.** If another user referred you, their referral record is kept — it is
  theirs, not yours — but the link naming you is removed.

### 7.3 Correction

You can change your preferences at any time in the app. `[LEGAL REVIEW REQUIRED]` — there is no
mechanism to correct a recorded ritual completion or a streak; whether that is acceptable under
CCPA's right to correct needs review.

### 7.4 Non-discrimination

We will not treat you differently for exercising any of these rights. The daily practice features of
PanchangPal are never withheld for that or any other reason.

### 7.5 A note on deleting a personal date

When you delete a personal date in the app, it stops appearing and stops generating reminders, but
**a record of it is retained internally** so the deletion can be synchronised correctly to your other
devices. It is erased when your account is deleted. We are stating this because "delete" reasonably
implies erasure, and here it does not yet mean that.

---

## 8. How long we keep your information

We keep your data for as long as your account exists.

`[UNBUILT]` — **we do not currently have any automated deletion or expiry running.** Usage statistics
accumulate without a pruning schedule, and, as described in §7.2, deletion requests are not yet
executed. `[LEGAL REVIEW REQUIRED]` — a retention schedule needs to be defined and implemented before
this section can say anything definite.

---

## 9. How we protect your information

- Your sign-in credentials are stored in your device's **secure hardware-backed keystore** (iOS
  Keychain / Android Keystore), not in ordinary app storage.
- All communication with our servers uses encrypted connections.
- Every table enforces database-level access rules so one user's data cannot be read by another,
  and those rules are tested automatically before any release.
- The app contains no secret keys that would grant access to anything.

**What we will not claim:** `[UNBUILT]` we do not currently have point-in-time backups. If our
database suffered a serious failure, data you have created could be lost permanently. This is
recorded as a launch blocker (`DR_RUNBOOKS.md`, NFR-15) and must be resolved before the app is
offered to the public — but no statement about safeguards should be published that this document
cannot support.

---

## 10. Things that will change before or at launch

Stated plainly, because the app is in development and the policy will need to be updated:

1. **Location.** When daily panchang timings ship, the app will ask for approximate location to
   calculate sunrise and tithi accurately. It will be optional, requested with an explanation first,
   and never required for the daily practice.
2. **Notifications.** Reminders will require notification permission and a device token.
3. **Ask Guru.** Questions you type will be sent to OpenAI along with reference material from our
   reviewed library, and the question and answer will be stored so you can revisit the thread. The
   AI keeps no memory between conversations.
4. **Subscriptions.** Purchases will be handled by RevenueCat and the app stores; we never see your
   payment card.

Each of these must be reflected here **and** in the store privacy labels *before* the feature is
enabled for users, not after.

---

## 11. Children

`[LEGAL REVIEW REQUIRED]` — PanchangPal is not directed at children, and no minimum age is currently
enforced anywhere in the product. A minimum age and its treatment (including COPPA applicability, and
the store age rating) need a decision before submission.

---

## 12. Changes to this policy

`[LEGAL REVIEW REQUIRED]` — notification mechanism and effective-date handling.

---

## 13. Contact

`[LEGAL REVIEW REQUIRED]` — a privacy contact address is mandatory and none exists yet.

---

## Appendix — Open items blocking publication

| # | Item | Type |
|---|---|---|
| 1 | ~~Account deletion is not executed~~ — **CLOSED 2026-07-27**; residual: enable pg_cron on the hosted project | 🟡 Owner action |
| 2 | No retention or pruning for analytics (§8) | ⛔ Engineering |
| 2b | A completed deletion leaves no audit record (`executed_at` cascades away with its subject) | 🟡 TDD owes a resolution |
| 3 | No in-app export or deletion affordance (§7.1) | 🟡 Product — PDD owes the screen |
| 4 | No point-in-time backup (§9) | ⛔ Owner purchase |
| 5 | Legal entity, address, privacy contact (§1, §13) | Owner |
| 6 | AU/NZ overseas-disclosure wording (§6) | Legal |
| 7 | Children / minimum age (§11) | Legal + product |
| 8 | Third-party name for a personal date (§3.1) | Legal |
