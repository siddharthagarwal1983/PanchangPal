# ADR-XXX — <Short, Decision-Oriented Title>

**Status:** Proposed | Accepted | Superseded | Deprecated
**Date:** YYYY-MM-DD
**Decision Owner:** <Role / team, e.g. Architecture, Backend, AI, Mobile, Platform, Security>

> Delete this line and all `<…>` placeholders before committing. Optionally append a status marker in the Status line where it applies, e.g. `Accepted (\`[TECHNICAL IMPROVEMENT]\`)` or `Accepted (resolves F-NN)`, matching the existing ADRs.

---

## Context

Describe the situation that forces a decision. Cover:

- **Problem** — what needs to be decided and why it matters now.
- **Constraints** — the solo-founder/timeline, trust/accuracy, offline-first, cost, or launch-market constraints that bound the choice (cite TDD Part 1 §1 principles where relevant).
- **Background** — prior state, related decisions, and any product/UX requirements that set the stage.
- **Why a decision is required** — the risk or ambiguity that remains if this is left undocumented.

State the relevant sources on their own line, e.g. `Relevant sources: TDD Part 1 §X, §6 ADR-NNN; Decision Log DEC-NNN; PDD §X.`

---

## Decision

Document the architectural decision clearly and unambiguously, in the present tense ("Use…", "Adopt…", "Enforce…"). Do not speculate: record only what has been approved. Keep it implementation-agnostic — describe the decision, not the code. Reference the concrete identifiers it governs (`SVC_*`, `TBL_*`, `API_*`, `FF_*`, `EVT_*`, `ERR_*`) where they clarify scope.

---

## Alternatives Considered

Document each material alternative that was evaluated and rejected. Use one entry per alternative:

- **<Alternative name>.** *Advantages:* <what it offered>. *Disadvantages:* <where it fell short>. *Reason rejected:* <the deciding factor>.
- **<Alternative name>.** *Advantages:* … *Disadvantages:* … *Reason rejected:* …

Alternatives that were deferred (viable but not chosen for v1) rather than rejected outright should say so, mirroring the existing ADRs.

---

## Consequences

- **Positive.** The outcomes this decision buys.
- **Trade-offs.** What is given up, and the discipline the decision demands.
- **Operational impact.** How it changes running the system (SLOs/NFRs, dashboards, on-call, cost).
- **Technical impact.** Effects on the codebase, contracts, schema, or seams.
- **Future maintenance implications.** What must be kept in sync, cleaned up, or revisited over time.

---

## Dependencies

**Depends on** <ADR-NNN, ADR-NNN — decisions this one builds upon>.
**Related** <ADR-NNN, ADR-NNN — decisions this interacts with or is an instance of>.

Use `Depended on by` as well when this ADR is foundational to later ones. A `[[link]]`-free bare ADR number that does not yet exist is acceptable only if a follow-up ADR is genuinely planned.

---

## Affected Documents

List only the documents this decision actually touches; omit rows that do not apply:

- **MRD** — <section, if applicable>
- **PRD** — <section>
- **PDD** — <section>
- **TDD** — <part / section, e.g. Part 1 §7.14>
- **Decision Log** — <DEC-NNN, if there is a corresponding entry>
- **Architecture Summary** — <if applicable>
- **API Specification** — <API_* affected, if applicable>
- **Database Documentation** — <TBL_* / RLS affected, if applicable>

---

## Review Trigger

State the concrete condition(s) under which this ADR should be revisited. Examples:

- Technology end-of-life (EOL)
- Vendor change or vendor capability gap
- Performance limits (an NFR is missed in field data)
- Scalability limits (volume/QPS beyond the current design)
- Security changes (new threat, audit finding)
- Regulatory changes (e.g. data residency, privacy law in a launch/expansion market)

For foundational principles that should not change, write `Never` (and note that instances are reviewed on their own triggers), matching existing ADRs.

---

## Notes

Optional. Non-binding implementation guidance, sequencing hints, `[TECHNICAL IMPROVEMENT]`/`[ASSUMPTION Tn]`/`[PRD FOLLOW-UP Fn]` callouts, or pointers to where detail is specified (e.g. "index parameters tuned in TDD Part 3"). Delete this section if unused.

---

# Guidelines for Authoring ADRs

These conventions keep the ADR set consistent with the records already in this directory.

## When to create an ADR

Create an ADR for a **material architectural decision** — one that is expensive to reverse, shapes multiple parts of the system, or must be understood by a future engineer or AI coding agent to work safely. Typical triggers: choosing or replacing a technology/vendor; introducing an architectural pattern or seam; changing an authorization, privacy, or compatibility boundary; resolving a `[PRD FOLLOW-UP Fn]` with architectural weight. If a strategic decision is recorded in the Decision Log (`DEC-NNN`) and has technical architecture implications, it should have a governing ADR.

## When NOT to create an ADR

Do not create an ADR for: routine implementation details, local refactors, naming of a single component, library-minor upgrades, or purely product/UX choices with no architectural consequence (those belong in the Decision Log or the PDD). Do not create an ADR to "invent" architecture — ADRs record decisions that already exist in the source-of-truth documents (see ADR-027, Documentation-First). If information is missing, stop and request clarification rather than deciding unilaterally in an ADR.

## ADR vs. implementation documentation

An ADR captures **why** a decision was made — the context, the alternatives, and the consequences — and is a permanent, append-only record. Implementation documentation (TDD parts, API specs, database docs, code comments, runbooks) captures **how** the system is built and changes as the code changes. When the *how* changes but the decision holds, update the implementation docs, not the ADR. When the *decision itself* changes, write a new ADR that supersedes the old one.

## Naming conventions

Filename: `ADR-NNN-Short-Kebab-Or-Title-Case-Slug.md` (zero-padded three-digit number, hyphen-separated words, e.g. `ADR-018-Row-Level-Security.md`). The H1 title inside the file is `# ADR-NNN — <Title>` using an em dash (—). Titles are decision-oriented noun phrases, not sentences.

## Numbering conventions

Numbers are sequential, zero-padded to three digits, permanent, and **never reused**. Take the next free number; never renumber or reuse a retired one. A superseded ADR keeps its number and is marked `Superseded` with a pointer to its replacement. ADR-001…013 intentionally preserve the numbering established in TDD Part 1 §6 — do not disturb it.

## Markdown formatting rules

Follow the existing files exactly: H1 `# ADR-NNN — Title`; a bold metadata block (`**Status:**`, `**Date:**`, `**Decision Owner:**`); `---` horizontal rules between the header and each major section; `##` section headings in the fixed order Context → Decision → Alternatives Considered → Consequences → Dependencies → Affected Documents → Review Trigger → (optional) Notes. Use `**Positive.**`/`**Trade-offs.**`-style bold lead-ins within Consequences. Keep a blank line before every list. Prefer prose; use bullets only where the existing ADRs do.

## Cross-reference conventions

Reference other ADRs by number in the running text (e.g. "(ADR-006)") and formalize them under **Dependencies** as `Depends on` / `Related` / `Depended on by`. Reference document sections with the project's identifier scheme (`TDD Part 1 §7.14`, `PDD §11.1`, `DEC-017`, `F-18`, `SVC_*`, `TBL_*`, `API_*`, `ERR_*`, `EVT_*`, `FF_*`). Keep the `README.md` index and, where a `DEC-NNN` exists, the Decision Log cross-reference map in sync when adding an ADR.

## Writing style

Write as a permanent engineering record: calm, precise, present-tense, and self-contained — each ADR must be understandable without reading its source document. Explain the *why*, avoid implementation minutiae, and never fabricate rationale. Match the measured tone of the existing set. Mark improvements over an implied approach as `[TECHNICAL IMPROVEMENT]` and assumptions as `[ASSUMPTION Tn]`, consistent with the TDD.

## Approval expectations

New ADRs start as `Proposed` and become `Accepted` on sign-off by the relevant owner(s) and the Architecture Review Board (per PDD §3.0A.5 ownership). An `Accepted` ADR is not edited to reverse its decision; instead a new ADR supersedes it, and the old one is marked `Superseded`. Corrections that preserve the decision (typos, clarified cross-references, updated affected-document pointers) may be made in place.
