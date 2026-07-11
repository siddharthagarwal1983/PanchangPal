# PLAYBOOK.md

# PanchangPal Engineering Playbook

Version: 1.0.0

Purpose:
This playbook defines the standard operating procedures for working on the PanchangPal project.

It contains reusable workflows—not project documentation.

Before executing any workflow, always read:

1. DASHBOARD.md
2. PROJECT_MEMORY.md
3. CURRENT_MILESTONE.md
4. SESSION.md
5. TASK.md
6. ARCHITECTURE_SUMMARY.md

Only retrieve additional documentation when required.

---

# General Rules

Every workflow follows the same principles.

Always:

- Preserve architecture
- Preserve accessibility
- Preserve security
- Preserve documentation consistency
- Reuse before creating
- Search before implementing

Never:

- Invent requirements
- Invent APIs
- Invent database schema
- Invent UX
- Invent navigation
- Rewrite unrelated code
- Perform repository-wide refactoring without approval

---

# Workflow 1 — Start Session

Objective

Resume work efficiently.

Procedure

1. Read DASHBOARD.md.
2. Read PROJECT_MEMORY.md.
3. Read CURRENT_MILESTONE.md.
4. Read SESSION.md.
5. Read TASK.md.
6. Read ARCHITECTURE_SUMMARY.md.
7. Summarize:
   - Current phase
   - Current milestone
   - Current task
   - Blockers
   - Recommended first action

Do not scan the repository.

---

# Workflow 2 — End Session

Objective

Prepare the project for the next working session.

Procedure

Update:

- SESSION.md
- PROJECT_STATUS.md

Update only if permanent information changed:

- PROJECT_MEMORY.md
- DECISIONS.md

Then:

- Recommend the next task.
- Record blockers.
- Record modified files.

Keep SESSION.md concise.

---

# Workflow 3 — Repository Review

Review:

- Folder structure
- Module boundaries
- Naming conventions
- Package organization
- Documentation organization

Do not modify anything.

Produce:

- Findings
- Risks
- Recommendations

---

# Workflow 4 — Architecture Review

Review the implementation against:

- ADRs
- TDD
- Architecture Summary

Identify:

- Layer violations
- Tight coupling
- Missing abstractions
- Dependency issues
- Duplicate services

Do not implement changes.

---

# Workflow 5 — Generate ADR

Read:

- Decision Log
- TDD
- PDD

Generate ADRs only for approved decisions.

Save to:

docs/architecture/adr/

Never invent architecture.

---

# Workflow 6 — Generate OpenAPI Specification

Generate:

- OpenAPI 3.1
- DTOs
- Authentication
- Validation
- Error responses
- Examples

Save to:

docs/api/

Only use approved APIs.

---

# Workflow 7 — Generate Database

Generate:

- Schema
- Constraints
- Indexes
- RLS
- Triggers
- Views

Save documentation to:

docs/database/

Save migrations to:

supabase/migrations/

---

# Workflow 8 — Build Backend Feature

Before implementation:

- Read Backend TDD.
- Search existing services.
- Search existing APIs.
- Search repositories.

Implement:

- Edge Function
- DTO
- Validation
- Tests

Never invent endpoints.

---

# Workflow 9 — Build Mobile Feature

Before implementation:

- Read relevant PDD.
- Read Mobile TDD.

Search:

- Existing screens
- Existing components
- Existing hooks

Implement only the requested feature.

Preserve:

- Accessibility
- Offline support
- Loading states
- Empty states
- Error states

---

# Workflow 10 — Build AI Feature

Read:

AI Architecture.

Always preserve:

- RAG
- Groundedness
- Streaming
- Source attribution

Never expose:

- Prompts
- Embeddings
- Internal reasoning

Never bypass retrieval.

---

# Workflow 11 — Build Component

Search existing Component Library.

If an existing component satisfies most of the requirement:

Extend it.

Otherwise:

Create a reusable component.

Include:

- Accessibility
- Loading
- Disabled
- Error
- Tests

---

# Workflow 12 — Build Screen

Read:

PDD

Implement:

- Screen
- States
- Accessibility
- Analytics
- Offline support

Reuse existing components.

Never invent navigation.

---

# Workflow 13 — Bug Investigation

Do not fix immediately.

First produce:

- Root cause
- Scope
- Risk
- Impact
- Recommended fix

Wait for approval before major changes.

---

# Workflow 14 — Refactoring

Refactor only the requested scope.

Preserve:

- Public API
- Behaviour
- Architecture

Never perform unrelated cleanup.

---

# Workflow 15 — Code Review

Review:

- Architecture
- Security
- Accessibility
- Performance
- Testing
- Maintainability

Categorize findings:

- Critical
- High
- Medium
- Low

Provide actionable recommendations.

---

# Workflow 16 — Security Review

Review:

- Authentication
- Authorization
- Secrets
- RLS
- Input validation
- OWASP Mobile

Do not implement changes automatically.

---

# Workflow 17 — Accessibility Review

Verify:

- VoiceOver
- TalkBack
- Dynamic Type
- Reduced Motion
- WCAG AA
- Touch targets
- Keyboard navigation

Accessibility regressions block completion.

---

# Workflow 18 — Performance Review

Review:

- Rendering
- Memory
- Bundle size
- API usage
- Re-renders
- Startup
- Caching

Recommend optimizations.

---

# Workflow 19 — Documentation Review

Review:

- MRD
- PRD
- PDD
- TDD
- ADRs

Identify:

- Missing references
- Inconsistencies
- Duplication
- Ambiguity

---

# Workflow 20 — Release Readiness

Verify:

✓ Tests passing

✓ Security reviewed

✓ Accessibility verified

✓ Performance acceptable

✓ Documentation updated

✓ No blockers

✓ CI passing

✓ Release notes prepared

---

# Workflow 21 — Definition of Done

Before marking work complete:

✓ Requirements satisfied

✓ Existing implementation reused

✓ Architecture preserved

✓ Accessibility maintained

✓ Security maintained

✓ Tests added

✓ Documentation updated

✓ No unnecessary complexity introduced

Only then consider the task complete.

---

# Workflow 22 — Handling Ambiguity

If documentation is:

- Missing
- Ambiguous
- Conflicting
- Incomplete

Stop.

Explain the issue.

Identify which documents conflict.

Request clarification.

Never invent requirements.

---

# Workflow 23 — Context Management

Minimize token usage.

Do not scan the repository.

Retrieve only:

- The documentation required.
- The code required.
- The dependencies required.

Avoid rereading documents already summarized in:

- PROJECT_MEMORY.md
- ARCHITECTURE_SUMMARY.md
- DECISIONS.md

---

# Workflow 24 — Repository Hygiene

Keep the repository organized.

Never:

- Create duplicate files
- Leave unused code
- Introduce dead dependencies
- Create unnecessary folders

Keep modules cohesive.

---

# Workflow 25 — Guiding Principle

Every action should make PanchangPal:

- More trustworthy
- More maintainable
- More accessible
- More secure
- More performant
- Easier for future engineers and AI agents to understand

If a proposed change does not improve one of these qualities, reconsider whether it should be made.