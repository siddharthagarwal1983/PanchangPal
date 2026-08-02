# ADR-035 — Preferences Sync Conflict Rule (TDD Part 2 §6.6)

**Status:** Accepted
**Date:** 2026-08-02 (proposed and ratified same day)
**Decision Owner:** Product (the user-visible behaviour) with Engineering (the mechanism)

> This ADR closes a gap the TDD owes: **§6.6 defines conflict rules for three syncable kinds and
> says nothing about `preferences`, which became a fourth kind in PR #86.** It settles what is
> decidable on engineering grounds and puts one genuinely product-owned question — *whose edit wins
> when two devices disagree* — where it belongs.
>
> ⚠️ **It also recorded that the rule the code documented was not the rule the code implemented.**
> **Both are now closed:** Product ratified **Option A — last-writer-wins on `local_ts`**, and the
> implementation was corrected in the same change rather than after it.

---

## Context

**TDD Part 2 §6.6** enumerates per-kind conflict rules:

| Kind | Rule |
|---|---|
| daily completion | client-authoritative for its `local_date` (upsert-do-nothing) |
| checklist | union |
| `personal_date` | last-writer-wins on `updated_at`, with tombstones |
| streak | derived server-side, never client-set |

**`preferences` is not in that list.** It became syncable in **PR #86**, which fixed a real defect:
`useUpdatePreferences` wrote straight to the server with no durable path, so an app kill inside the
request window silently reverted the setting — and because `FLOW_AUTH_SESSION_PERSISTENCE` reads the
tradition back as its proof of identity, that loss presented as **identity loss** and was
misattributed four times.

Making it syncable required a conflict rule. #86 adopted `personal_date`'s last-writer-wins as **the
nearest ratified precedent**, documented the choice as unratified, and confined it to one function
so a different ruling would have one place to land.

---

## ⛔ Finding: the documented rule is not implemented

Established 2026-08-02, while preparing this ADR.

| | |
|---|---|
| **Documented** (`functions/sync/logic.ts`) | last-writer-wins on `local_ts` |
| **`resolvePreferences(incoming, existingUpdatedAt)`** | correct, unit-tested, and called from exactly one non-test site as `resolvePreferences(m, null)` — with `null`, the comparison cannot fire and it returns `applied` unconditionally |
| **`SyncRepo.updatePreferences`** | unconditional `upsert`; no `where updated_at < local_ts` guard, and it sets `row.updated_at = localTs` regardless |
| **Actual behaviour** | **last-drain-wins**, and `updated_at` can move **backwards** |

**Why it looks correct in normal use.** A single device queues FIFO and drains in order, so drain
order matches `local_ts` order and the outcome is identical to LWW. It diverges exactly where a
conflict rule earns its keep: a mutation retried after a failure, or a second device — an **older**
edit arriving later wins, and stamps the row with its older timestamp.

**This is the milestone's signature defect** — a documented control that nothing implements, with
nothing asserting it — inside the very rule this ADR exists to ratify. The unit tests pass because
they call `resolvePreferences` directly; nothing tests the handler's use of it.

**One thing the code does better than documented, and worth preserving explicitly.**
`updatePreferences` writes only the columns present in the payload (allowlist: `tradition_code`,
`content_depth`, `appearance`, `ritual_time`, `timezone`, `city`). That makes it already a
**per-column merge**: a device sending `tradition_code` cannot clobber another device's
`ritual_time`. Whole-record LWW would be a *regression* against current behaviour.

---

## Decision — settled on engineering grounds

1. **`preferences` is a per-column merge, not a whole-record replace.** Only fields present in a
   mutation's payload are written. This is what the code already does, it is strictly better than
   whole-record LWW for a multi-field settings object, and it should be stated in §6.6 rather than
   left as an implementation accident.
2. **The column allowlist stays.** A client-supplied payload applied with the service role is the
   `SVC_account` defect in a new place (ADR-030, B6.2); the allowlist is the boundary.
3. **`resolvePreferences` remains the single point of decision.** Whatever is ratified, it changes
   there and at its call site — not in the repository layer and not per screen.
4. **The implementation must be brought in line with whatever is ratified.** Specifically: the
   handler must read the existing `updated_at` and pass it, and `updatePreferences` must not move
   `updated_at` backwards.

---

## Referred — the product question

**When two devices edit the same preference field, whose edit wins?**

| Option | Behaviour | Cost |
|---|---|---|
| **A. LWW on `local_ts`** *(what #86 documented)* | The user's own clock orders their edits | A device with a skewed clock always wins; a phone hours ahead can make an old edit permanent |
| **B. LWW on server-received time** | Immune to clock skew | Reorders the user's **own** offline edits by drain order rather than intent — the case §6.6 exists for |
| **C. Per-field LWW on `local_ts`** | Combines the per-column merge with per-field timestamps | Needs per-field timestamps the schema does not have; the largest change |

### ✅ RATIFIED 2026-08-02 — Option A, last-writer-wins on `local_ts`

Product ruled for **A**, with the per-column merge stated in §6.6. TDD Part 2 §6.6 now carries the
fourth rule, and the implementation was corrected in the same change:

- `applyPreferences` reads the stored `updated_at`, decides via `resolvePreferences`, and **writes
  only if the mutation wins** — so a stale edit is reported `superseded` and never reaches the
  database, and `updated_at` cannot move backwards.
- The sequencing is pinned by tests that fail against the original defect while the pre-existing
  `resolvePreferences` tests still pass — which is exactly why it survived unnoticed.
- **Accepted limitation:** read-then-write is not atomic, so two devices syncing in the same instant
  can both observe the older timestamp. Within a batch the loop is sequential, so the window is
  cross-request only, and the outcome is still one of the user's own edits. Narrowing it further
  needs a conditional write, which would move the decision out of `resolvePreferences`.

**Original recommendation, retained for the record: A, with the per-column merge in §6.6's wording.** It matches the ratified
`personal_date` precedent, keeps the mechanism identical across kinds, and its weakness — clock
skew — is bounded in practice because per-column merging means a skewed device only wins the fields
it actually touched. **This is a recommendation, not a decision.**

**Why it is product's call and not engineering's:** the question is whose intent should prevail when
a user contradicts themselves across devices. That is a statement about the product's relationship
with its user, not a technical constraint — and this app's stated principle is calm trustworthiness,
which argues for "your most recent choice wins" over "whichever device synced last".

---

## Consequences

- ✅ **§6.6 carries a fourth row**, and the per-column merge is stated behaviour rather than an
  accident of the allowlist.
- ✅ **The implementation gap is closed in the same change.** `applyPreferences` reads the stored
  `updated_at`, decides via `resolvePreferences`, and writes only on `applied`.
- ✅ **The handler-layer regression test exists.** `applyPreferences` was extracted specifically so
  a fake store can assert the ORDERING — that a losing mutation never reaches the write. Perturbing
  it back to `resolvePreferences(m, null)` plus an unconditional write fails exactly the three
  sequencing tests while all pre-existing `resolvePreferences` tests still pass, which is the
  clearest possible demonstration of why the defect survived.
- **Behaviour changed only after ratification.** The pre-ratification state was wrong but not
  harmful in single-device use, and changing it under a guess would have replaced an unratified rule
  with a different unratified rule.

---

## Alternatives considered

**Revert `preferences` to non-syncable.** Rejected: it reintroduces the defect #86 fixed — a
preference lost on app kill, presenting as identity loss.

**Whole-record last-writer-wins.** Rejected: a regression against the per-column merge the code
already performs, and it would let a device that touched one field silently revert every other.

**Leave it unratified.** Rejected: it is already shipped in merged code. An unratified rule in
production is a decision made by default, and the cost of settling it grows with every device that
syncs.
