# IMPLEMENTATION_ROADMAP.md

# PanchangPal — Implementation Roadmap

Version: 1.1.0
Last Updated: 2026-07-12 (DevOps platform audit + hardening)

Purpose: the forward plan from the current state. Complements PROJECT_STATUS.md (snapshot) and
CURRENT_MILESTONE.md (active milestone). Updated when scope or sequencing changes.

---

## Where we are (2026-07-12)

Documentation, ADRs (33), OpenAPI, DB schema + migrations, monorepo scaffold, Expo app shell,
CI/CD, and Backend Foundation independent work are complete. Overall ~76%.

One blocker: the Canonical Panchang Engine (ADR-033, Proposed) — astronomical algorithm
undocumented; the whole backend depends only on the abstract PanchangEngine interface, so this
blocks ONLY panchang compute + sunrise/tithi notifications, with zero rework when it lands.

---

## Track A — Product build (unblocked, proceed now)

1. Design System & Component Library — tokens (PDD Part 3 §6) + CMP_* (a11y-first). <- next
2. Mobile feature slices (MOD_*) — today, calendar, ask-guru, you, onboarding/auth; offline
   queue + sync client; AI streaming client; notifications + IAP clients (TDD Part 4).
   - Note: the Today panchang view renders "temporarily unavailable" until the engine lands;
     ritual completion / streak / checklist / Ask Guru / household all work now.
3. AI corpus ingestion + eval harness — run SVC_content_ingest on the reviewed corpus; calibrate
   F-6/F-16 on the eval sets; refusal test set in CI (needs the corpus, PDD §9.8).
4. Backend DB wiring hardening — flesh repository upserts vs a live Supabase test project; green
   the pgTAP integration suite; add per-endpoint contract tests.

## Track B — Canonical Panchang Engine (owner-driven, unblocks the rest)

1. Ratify ADR-033 Part B (Architecture + Product + pandit reviewer): ephemeris, ayanamsa,
   per-tradition profiles, methodology, validation dataset, acceptance tolerances.
2. Implement the concrete engine behind PanchangEngine (e.g. Swiss Ephemeris-grade) — only after
   ratification. Legal review of the ephemeris license.
3. Golden-dataset validation gate (vs Drik/mPanchang, per tradition) in CI; reviewer sign-off.
4. Register the engine + set engine_version; un-skip the engine tests; enable SVC_panchang compute
   + sunrise/tithi notifications. No caller changes (interface unchanged).

## Track C — Platform hardening (parallel, TDD Part 5)

- ✅ DevOps platform audit + hardening (2026-07-12): canonical env inventory, secrets matrix,
  6 `.env.*.example` templates, `scripts/preflight.sh` (fail-fast) + `scripts/bootstrap.sh`,
  workflow hardening (least-privilege, retries, `db-tests`/`security-scan` toolchain, preflight
  gates, summaries), `docs/SETUP.md`, `docs/devops/*`, `DEVOPS_AUDIT_REPORT.md`, and the canonical `docs/devops/CONFIGURATION_REGISTRY.md`. No deploy
  behavior changed. See DEVOPS_AUDIT_REPORT.md.
- ⏳ Provision dev/staging/prod Supabase projects + secrets; apply migrations via CD. (Pipeline +
  preflight ready; infra/credentials not yet configured — see DEPLOYMENT_READINESS.md.)
- ⏳ Add `eas.json` + EAS credentials; flip CD deploy scaffolds to real.
- ⏳ Stand up Sentry + AI/analytics dashboards + alerts; DR restore drill.
- ⏳ Rate-limit/cost-ceiling values tuned from real usage; OWASP Mobile review + pen test pre-launch.

---

## Milestone sequence

Repository & Platform Foundation (~done) -> Backend Foundation (independent done; engine blocked)
-> Design System -> Mobile Features -> AI corpus + eval -> Beta (§10.1 go/no-go) -> Launch
(US/AU/NZ phased). Track B runs alongside and must complete before a launch that includes panchang.

## Remaining blockers (single source: PROJECT_STATUS.md "Known Blockers")

Canonical Panchang Engine (ADR-033). Nothing else is blocking; all other tracks proceed.
