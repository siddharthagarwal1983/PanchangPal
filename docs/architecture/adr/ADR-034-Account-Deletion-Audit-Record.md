# ADR-034 — Account-Deletion Audit Record

**Status:** Accepted
**Date:** 2026-07-28 (proposed) · **2026-08-02 (ratified: Alternative C)**
**Decision Owner:** Security / Privacy (with Legal sign-off on the retention question)

> ✅ **RATIFIED 2026-08-02 — Alternative C, a one-way digest of the subject.** Implemented in
> `20260802000130_account_deletion_audit.sql` and proven by 6 new pgTAP assertions (23 total) against
> a real Postgres 17. `executed_at` is retired, along with the `where executed_at is null` predicate
> that was unconditionally true.
>
> This ADR opened a decision the TDD owed. It settles the part
> that is decidable on engineering grounds — that a deletion *request* and a deletion *audit* are
> two records with opposite lifetimes and cannot be one table row — and frames the part that must
> be ratified with privacy and legal input: **what, if anything, identifies the subject of a
> completed erasure.** No schema change should be made before that ratification.

---

## Context

**Problem.** Two approved documents make incompatible demands of the same table.

TDD Part 5 §5.1, the STRIDE threat model, is `[MANDATORY]` and names `TBL_ACCOUNT_DELETION` as the
**deletion audit** mitigating repudiation. An audit that mitigates repudiation must outlive the
action it records; a record that disappears when the disputed event occurs is not evidence of
anything.

TDD Part 2 §3.15 declares the schema `account_deletion(user_id uuid pk references app_user(id) on
delete cascade, …)`. The row is therefore erased together with its own subject. A successful
deletion destroys the record that it happened.

The two requirements are exactly opposed, so no implementation can satisfy both. This was found on
2026-07-27 while building the erasure executor (`execute_account_deletion`,
`sweep_due_account_deletions`), which implements the schema as declared and records the gap rather
than resolving it — changing a foreign key here is a privacy decision, not an implementation detail.

**Neither document is wrong; the schema is under-specified for the role the threat model assigns
it.** `account_deletion` is a good *request* table: it holds the pending intent and the F-3 grace
window, it is owner-readable so a user can see their own pending request, and cascading away with
the user is correct behaviour for operational state about a live account. It is not, and cannot
also be, the durable record of a completed erasure. One row is being asked to have two lifetimes.

**What this costs today.** During the grace window the row does serve one direction of repudiation:
an operator can show that a request exists. After execution, nothing remains — the system cannot
demonstrate that an erasure was performed, on what date, or for whom. That is the direction that
matters to a user or a regulator asking whether a deletion right was actually honoured, and it is
precisely the claim B6.3 found the product had been making without carrying out.

**A concrete symptom.** `account_deletion.executed_at` is dead schema. Nothing writes it — nothing
can — and its only reader is `sweep_due_account_deletions`'s `where executed_at is null`, a
predicate that is unconditionally true because the column can never hold a value. The column exists
to record an event that erases the row it lives on.

**Constraint that bounds the choice.** Any surviving record is retained data about a person who
asked to be erased, so it sits directly against ADR-031's data minimization. The resolution cannot
be "keep more, to be safe": it has to name the minimum that discharges the §5.1 obligation. There is
also a legal dimension the engineering record cannot settle — retention of *records of consumer
requests* is treated differently from retention of consumer *data* under CCPA, and may be required
rather than merely permitted. **That requires legal confirmation and is why this ADR is Proposed.**
Nothing in `docs/devops/` is legally reviewed.

**Correction to prior citations.** The tracking documents, and the executor migration's own header
comment, cite this contradiction as "TDD Part 2 §5.1". The threat model is **Part 5 §5.1**
(`05_PLATFORM_DEVOPS.md`); the schema is **Part 2 §3.15** (`02_BACKEND_ARCHITECTURE.md`). The
conflict is across two Parts, which is plausibly why it survived review of either one alone.

Relevant sources: TDD Part 5 §5.1 (threat model, `[MANDATORY]`), §6.2 (CCPA & data rights, F-3/F-10);
TDD Part 2 §3.15 (schema), §6.5 (scheduled deletion job); ADR-031 (privacy & data minimization);
ADR-030 (least privilege); ADR-025 (background jobs); ADR-006 (`SVC_account`); PDD F-3.

---

## Decision

**Decidable now, and decided here.**

1. **Separate the request from the audit.** `TBL_ACCOUNT_DELETION` remains the deletion *request*
   record: pending intent, F-3 grace window, owner-readable, cascading with its subject. It is not
   the §5.1 audit. The audit is a distinct record written at the moment of successful erasure, and
   it does not reference `app_user`, so no cascade can reach it.

2. **The audit record is service-role only.** No client role may read or write it, under ADR-030's
   least-privilege rule and the reasoning B6.2 established for `SVC_account`: `authenticated`
   includes anonymous users, and anyone can mint an anonymous JWT for free. A table listing
   completed erasures must not be reachable by any client credential.

3. **The audit records the fact, never the erased content.** It carries the event — that an erasure
   completed, when, and its outcome — and nothing recovered from the deleted rows. An audit that
   preserved profile fields, household membership or personal dates would defeat the erasure it
   claims to evidence.

4. **`executed_at` is retired from `account_deletion`.** It cannot be written under any resolution
   that keeps the request row cascading, and a column that exists to record an event which destroys
   its own row is a standing invitation to reimplement the bug. The sweep's `where executed_at is
   null` predicate goes with it.

**✅ Ratified 2026-08-02 — Alternative C. Implemented in the same change.**

**What identifies the subject of a completed erasure**, chosen from the alternatives below. This is
a privacy decision with legal weight, not an engineering preference: it determines whether the
system retains a permanent list of identifiers belonging to people who asked to be forgotten, and
whether the audit can answer "did you delete *this* user?" at all. Security/Privacy owns the choice;
Legal must confirm the retention obligation and period before the record is given a retention rule.

**Ratified: Alternative C**, exactly as recommended. The digest construction is **frozen** —
`sha256(uuid::text)`, hex, unsalted — and defined once in `account_deletion_subject_digest(uuid)`;
changing it makes every existing record unverifiable, because no row remains to recompute from.
Unsalted is deliberate: a v4 uuid carries 122 bits of entropy, so the dictionary attack a salt
defends against is infeasible, and a per-row salt adds nothing an attacker holding the table lacks.

**The original recommendation, retained for the record:** the digest form
(Alternative C). It is the only option that lets an operator *verify* a specific claim — hash the
uid in question and compare — without the table itself being a readable roster of erased users, and
it degrades to the raw-identifier option's usefulness in every scenario where the claimant supplies
the identifier, which is every scenario a repudiation dispute actually presents.

---

## Alternatives Considered

- **A — Keep one table; break the cascade so the request row survives.** *Advantages:* smallest
  schema delta; `executed_at` becomes writable as originally intended. *Disadvantages:* `user_id` is
  the primary key, so it cannot be nulled, and the surviving row is a permanent, owner-readable
  record naming an erased person; it also leaves one table holding both pending requests and closed
  audits, which every query must then disambiguate. *Reason rejected:* it makes the audit's privacy
  cost maximal and its access control weakest, and preserves the conflation that caused the defect.

- **B — Separate audit table retaining the raw `user_id`.** *Advantages:* answers both directions of
  repudiation directly; simplest to reason about; conventional. *Disadvantages:* the table becomes a
  durable list of the identifiers of people who exercised erasure — the single most sensitive
  by-product this feature can produce, and one an attacker with service-role access would find more
  useful than the deleted data itself. *Reason rejected as the default:* it retains an identifier
  where a one-way digest demonstrably suffices, which ADR-031 requires be justified rather than
  assumed. **Viable if Legal determines the raw identifier is required** for records-of-request
  obligations.

- **C — Separate audit table storing a one-way digest of the `user_id` (recommended).**
  *Advantages:* an operator can confirm or refute a specific claim by digesting the uid presented
  and comparing, which is what a repudiation dispute actually needs; the stored value is not a usable
  roster, since a uuid's space makes enumeration infeasible and there is no remaining row anywhere to
  join against. *Disadvantages:* cannot answer open questions like "list everyone erased in March"
  without the identifiers to test; requires the digest construction to be specified and never
  changed, or old records stop verifying. *Deferred rather than rejected on the second point:* an
  aggregate count answers the operational question ("are erasures completing?") without identity.

- **D — Subject-less audit: record only that an erasure completed, with a timestamp and outcome.**
  *Advantages:* maximal minimization; carries no personal identifier of any kind. *Disadvantages:*
  cannot mitigate repudiation at all in the direction that matters — it proves erasures happen, not
  that *this* user's happened — so it does not discharge §5.1. *Reason rejected:* it satisfies the
  letter of "an audit exists" while leaving the threat unmitigated, which is the failure mode this
  milestone has now catalogued four times.

- **E — Leave the contradiction unresolved and rely on the erasure being correct.** *Advantages:*
  no schema change; no retained data. *Disadvantages:* a `[MANDATORY]` threat-model mitigation
  remains unimplemented with nothing recording that fact, and the privacy documents cannot honestly
  describe the deletion capability. *Reason rejected:* this is the status quo, and it is what the
  ADR exists to end.

---

## Consequences

**Positive.** The §5.1 repudiation mitigation becomes implementable rather than structurally
impossible. A completed erasure leaves evidence, so the privacy policy and the store Data Safety
answers can describe deletion without overstating it. The request table regains a single, coherent
purpose.

**Trade-offs.** The system retains something about people it has erased, which is a real cost under
ADR-031 and is accepted only to the minimum the threat model requires. Separating the tables adds a
write to the erasure path, which must happen inside the same transaction as the erasure — an audit
written outside it can record a deletion that rolled back.

**Operational impact.** The audit table needs a retention rule, and this project has **no working
general retention mechanism**: the only scheduled job that runs is the deletion sweep, and nothing
consumes `job`. A retention period agreed here will not be enforced until that gap is closed, and
saying so now is preferable to writing a policy nothing implements — the exact failure this ADR
resolves.

**Technical impact.** `execute_account_deletion` gains the audit write; `sweep_due_account_deletions`
loses its `executed_at` predicate; `account_deletion` loses the column. `docs/database/SCHEMA.md`,
TDD Part 2 §3.15 and `docs/devops/DATA_INVENTORY.md` all change — the inventory is machine-checked
against the migrations in both directions, so a new table cannot land without a privacy
classification, which is the correct forcing function here. The pgTAP suite gains assertions that
the audit row **survives** the erasure; by the lesson the executor already paid for, those must
assert by content, since a test keyed on the identifier a deletion removes cannot detect its
absence.

**Future maintenance implications.** If the digest form is ratified, its construction is frozen —
changing it silently invalidates every prior record. The CCPA export must be checked against the
audit table deliberately: it is service-role state about the user, and whether a data-rights request
should return it is its own question, not an assumed yes or no.

---

## Dependencies

**Depends on** ADR-031 (privacy & data minimization — the constraint this decision is bounded by),
ADR-030 (least privilege — service-role-only access), ADR-006 (`SVC_account` owns export/delete).
**Related** ADR-025 (background jobs — the unbuilt worker a retention rule would need), ADR-018
(RLS ownership), ADR-013 (analytics are pseudonymous and deliberately untouched by erasure).

---

## Affected Documents

- **TDD** — Part 5 §5.1 (the threat-model row must name whatever record actually survives),
  Part 5 §6.2 (CCPA data rights), Part 2 §3.15 (schema), Part 2 §6.5 (the scheduled deletion job)
- **Database Documentation** — `docs/database/SCHEMA.md` (`TBL_ACCOUNT_DELETION`; the new audit
  table; the retired `executed_at`)
- **PDD** — F-3 (deletion ownership/grace); the in-app deletion affordance Apple 5.1.1(v) requires
  is a separate outstanding item and is not resolved here
- **Decision Log** — a `DEC-NNN` entry if the ratified answer carries product weight

---

## Review Trigger

Revisit on: a privacy-regulation change in a launch or expansion market (notably GDPR, undated per
TDD Part 5 §6.3, whose erasure and records provisions differ); legal advice that the retention
obligation or period differs from what is ratified; a security finding involving the audit table; or
a decision to make erasure records available to users, which would change the access model.

---

## Notes

**Sequencing.** The engineering work is small and entirely blocked on the ratification, so this
should not be scheduled as an implementation task until Security/Privacy and Legal have answered.
Implementing the recommended option before sign-off would be inventing the privacy decision the ADR
exists to surface.

`[PRD FOLLOW-UP]` The retention period for the audit record is unspecified and is part of what must
be ratified. `docs/devops/DATA_INVENTORY.md` v1.0 already records that **no retention period is
specified for `analytics_event` anywhere** — the same class of gap, and worth settling together.
