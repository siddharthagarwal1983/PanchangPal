# CURRENT_MILESTONE.md

# PanchangPal — Current Milestone

Version: 3.0.0

Last Updated: 2026-07-18 (milestone opened)

Purpose:
This document defines the current milestone. Unlike SESSION.md (daily work) or TASK.md (current
task), it changes only when the project moves to a new milestone. Read it to understand the
broader implementation objective before beginning any work.

---

# Current Milestone

## Beta Readiness & Platform Hardening (TDD Part 5)

Status

🟡 In Progress

Overall Progress

0% (0 of 8 slices complete)

Previous Milestones

✅ Documentation Complete
✅ Repository & Platform Foundation
✅ Backend Foundation (SVC_* Edge Functions)
✅ Mobile MVP — Phase 1 (M1–M8, feature-complete 2026-07-18)

Next Milestone

Phased Production Release (US / AU / NZ)

---

# Milestone Objective

Take the feature-complete Mobile MVP to a shippable beta. **No new product scope.** This milestone
is environments, verification, observability, security, and release mechanics — everything in the
TDD Part 5 §10.1 pre-launch go/no-go checklist that engineering owns.

The organizing risk: **CD currently reports green while two of its jobs are placeholders.** The
Maestro E2E step is `echo "maestro test tests/flows"` and the EAS build step is a stub, while
`scripts/preflight.sh` only *warns* on unset secrets and exits 0. Staging migrations and Edge
Function deploys are genuinely real. Closing that gap between reported and actual verification is
the through-line of this milestone.

---

# Starting position (verified 2026-07-18)

| Capability | Actual state |
|---|---|
| Staging Supabase project | ✅ Real — `migrate.sh` hard-fails on an empty URL and applied migrations in 1m22s |
| Edge Functions → staging | ✅ Real — `supabase functions deploy` against `SUPABASE_STAGING_REF` |
| CI gates (§2.2) | ✅ Real — lint/typecheck, unit+a11y, secret scan, RLS suite, zod contracts, AI eval subset |
| Maestro E2E (FLOW_*) | ❌ Placeholder — `echo`, no flow specs, no `.maestro/` |
| EAS build / distribution | ❌ Placeholder — no `eas.json`, no build profiles, no signing |
| Preflight secret checks | ⚠️ Warns then `exit 0` — cannot fail a deploy on a missing secret |
| dev / prod environments | ❔ Unconfirmed — only staging is proven by a green run |
| Sentry / dashboards / alerts | ❌ Not wired |
| DR restore drill | ❌ Not performed |
| OWASP Mobile review | ❌ Not performed |

---

# Scope — the eight slices

| # | Slice | Covers | Status |
|---|---|---|---|
| B1 | Environments & secrets | dev/staging/prod projects, per-env secrets, fail-closed preflight (§1, §4) | ⏳ |
| B2 | E2E verification | real Maestro FLOW_* replacing the stub; green on staging (§2.2, §10.1) | ⏳ |
| B3 | Build & distribution | eas.json profiles, Hermes, signing, source maps, TestFlight / Play Internal (§2.3) | ⏳ |
| B4 | Observability | Sentry, telemetry, SLO dashboards + alerts (§7) | ⏳ |
| B5 | Reliability & DR | backups, restore drill, runbooks, graceful degradation (§8) | ⏳ |
| B6 | Security & privacy | OWASP Mobile review, CCPA export/delete verification, store privacy labels (§5, §6) | ⏳ |
| B7 | Release management | versioning/trains, OTA policy + channels, staged rollout, rollback verification (§3) | ⏳ |
| B8 | Go/no-go & launch | §10.1 checklist execution, internal → beta cohort, sign-off | ⏳ |

One slice per session, same cadence as M1–M8: implemented, self-verified, reviewed, then the next.

---

# Milestone Deliverables

- [ ] **B1** — dev + prod Supabase projects provisioned alongside staging; per-environment secrets
      placed per §4.1; `preflight.sh` made fail-closed so a missing secret blocks a deploy instead
      of warning; RevenueCat sandbox wired for dev/staging.
- [ ] **B2** — Maestro installed in CD; `FLOW_*` specs authored for the daily loop, ritual, Ask Guru,
      household invite, and subscription paths; the placeholder step deleted; green on staging.
- [ ] **B3** — `eas.json` with dev/staging/prod profiles; Hermes on; EAS Build + Submit wired;
      Sentry source maps uploaded per build; a real build distributed to TestFlight / Play Internal.
- [ ] **B4** — Sentry (crash-free tracking) + the §7.1 telemetry set; SLO dashboards and alerts live.
- [ ] **B5** — backup policy confirmed; a real DR restore drill executed and documented (§8.1/§8.3).
- [ ] **B6** — OWASP Mobile review completed; CCPA export/delete verified end-to-end (F-3/F-10);
      privacy policy + store privacy labels accurate.
- [ ] **B7** — version trains, OTA channels (`staging`/`prod`) with runtime-version binding and
      crash-spike auto-rollback; rollback paths verified (§3.4).
- [ ] **B8** — the §10.1 checklist walked; internal smoke on TestFlight/Play Internal; beta cohort.

---

# Out of Scope (this milestone)

- Any new product feature or screen. The MVP is feature-complete; changes here are non-functional.
- Astronomical panchang calculations — still frozen behind PanchangEngine until **ADR-033** is
  ratified. A panchang-inclusive launch is gated on it; a beta without panchang is not.
- Live Ask Guru answers — `GURU_LIVE` stays off until reviewed corpus + eval readiness (Part 3 §10B).
- Post-v1 `FF_*` flags (Jain mode, greeting card, family plan, lifecycle email) — staged post-launch.
- Business go/no-go conditions (runway, temple partnership, NZ pricing test) — owner-held, not
  engineering deliverables.

---

# Success Criteria

A clean clone builds, migrates, and runs against a live environment. Every CD job does real work —
no placeholders. `FLOW_*` E2E green on staging. Alerting proven by a deliberate trigger, not just
configured. A DR restore actually performed. No unresolved OWASP findings. A real beta build in
testers' hands.

---

# Current Risks

- **False-green CI/CD** — the top risk. Placeholder jobs report success, so a regression could ride
  through unnoticed. B1 and B2 exist to close this first.
- **Deferred vendor deps** — `react-native-purchases` and `expo-notifications` are still uninstalled;
  purchase and push flows cannot be verified end-to-end until they land on the Mac with keys. Their
  Null adapters keep the app honest but leave those paths E2E-untested.
- **ADR-033 unratified** — constrains what a beta can demonstrate (no panchang, no sunrise/tithi
  notifications).
- **Single-founder resilience (TRISK-11)** — runbooks and DR are the mitigation; B5 is not optional.
- **Store review latency** — submission is a long pole; B8 should start the compliance work early.

---

# Definition of Done

All eight slices implemented and reviewed; the §10.1 engineering, ops/security, and compliance
columns fully checked; a beta build distributed and smoke-tested; documentation synchronized.

---

# Milestone Transition

On completion:
1. Update PROJECT_STATUS.md.
2. Update PROJECT_MEMORY.md if permanent knowledge changed.
3. Replace this file with the next milestone (Phased Production Release).

---

# Milestone Summary

> **Current focus: make the feature-complete MVP genuinely shippable — real environments, real E2E,
> real builds, real observability, and a real DR drill. The first job is removing the placeholders
> that let CD report green without verifying anything.**
