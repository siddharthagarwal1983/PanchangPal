# PanchangPal — DevOps Audit & Hardening Report

Version: 1.0.0
Date: 2026-07-12
Author: Principal DevOps / Platform / Release audit
Scope: developer experience, deployment reliability, environment management, documentation.
**Non-goals (honored):** no product features, no application-architecture changes, no deployment
behavior changes. Real secrets never touched or invented.

---

## Executive summary

PanchangPal's platform was **well-structured but under-documented and not yet reproducible for a
new engineer or a cold CI/CD system**. The three workflows (CI/CD/OTA) existed with a sound shape,
but several deploy steps are intentional scaffolds, CI had fragile spots (missing DB tooling, an
unset toolchain in one job, duplicated version pins), there were **no environment templates, no
canonical env inventory, no secrets classification, no setup guide, and no preflight/bootstrap
tooling**. A subtle but important issue: `.gitignore` would have **ignored any `.env.example`
template**, so even good templates couldn't be committed.

This pass delivered a complete DevOps documentation set, six environment templates, a fail-fast
preflight validator, a developer bootstrap checker, and behavior-preserving workflow hardening —
making the repo **self-documenting and reproducible**. Actual production *deployment* remains gated
on provisioning work (live Supabase projects, EAS config, store credentials) that is outside a
code-only pass; every such gap is now explicitly documented with an owner.

**Nothing about what the pipeline deploys was changed.** Improvements are diagnostics, validation,
caching, and documentation.

---

## Workflow health

| Workflow | Before | After |
|---|---|---|
| `ci.yml` | Real test gates; `db-tests` missing `psql`/`pg_prove`; `security-scan` had no Node/pnpm setup; version pins hardcoded in 8+ places; no least-privilege; no retries/summaries | Toolchain installed for `db-tests`; Node/pnpm+cache added to `security-scan`; pins sourced from `env`; `permissions: contents: read`; install retries; step summaries. **YAML validated.** |
| `cd.yml` | Migrations real; functions/E2E/EAS/prod are `echo` scaffolds; no preflight; no CLI setup | Added `scripts/preflight.sh` fail-fast to every deploy job; `supabase/setup-cli`; Postgres client install; least-privilege; summaries. Scaffolds preserved. |
| `ota.yml` | Scaffold; Environment named `prod` (mismatched CD's `production`); update message from empty `head_commit` | Env aligned to `staging`/`production`; preflight; message uses `github.sha`; least-privilege. |

No workflow was obsolete or duplicated; none removed. `scripts/migrate.sh` is correctly shared by CI
and CD. Full detail: `docs/devops/GITHUB_ACTIONS_AUDIT.md` (findings CI-1..6, CD-1..5, OTA-1..3, GA-1..9).

## Environment health

- **14 real variables** inventoried across client/server/CI, plus operational vars — each with a
  cited usage site. See `docs/devops/ENVIRONMENT_VARIABLES.md`.
- **Six templates** created (`.env.example` + local/development/staging/production/ci) with
  placeholders only.
- `.gitignore` fixed so `*.example` templates are committable (they were being ignored by `.env.*`).
- Confirmed **absent** (not invented): Apple/Google/Stripe/EAS-beyond-token vars; store creds are
  EAS-managed.

## Secret inventory

18 variables/secrets classified by storage location and sensitivity in `docs/devops/SECRETS_MATRIX.md`.
Criticals: `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `SUPABASE_PROD_DB_URL`,
`SUPABASE_STAGING_DB_URL`, `SUPABASE_ACCESS_TOKEN`. All are Never-Committed; gitleaks enforces this in CI.

## Deployment risks

| ID | Risk | Severity | Status |
|---|---|---|---|
| R-1 | Deploy steps are scaffolds (echo) | Medium | Documented; make real in Beta Readiness |
| R-2 | `production` approval gate may be unconfigured | High | Action item — configure required reviewers |
| R-3 | Secret sprawl (GitHub/Supabase/EAS) | Medium | Mitigated by matrix + preflight |
| R-4 | `db-tests` lacked client tooling | Low | **Fixed** |
| R-5 | Env name drift `prod`/`production` | Low | **Fixed** |
| R-6 | No live Supabase/EAS projects | High | Provisioning task (owner: Platform) |

## Documentation coverage

| Area | Before | After |
|---|---|---|
| Setup guide | none | `docs/SETUP.md` (end-to-end) |
| Env inventory | none | `docs/devops/ENVIRONMENT_VARIABLES.md` |
| Secrets | none | `docs/devops/SECRETS_MATRIX.md` |
| CI/CD audit | none | `docs/devops/GITHUB_ACTIONS_AUDIT.md` |
| Readiness / go-no-go | none | `docs/devops/DEPLOYMENT_READINESS.md` |
| Templates | none | 6× `.env.*.example` |
| Tooling | migrate/codegen only | + `bootstrap.sh`, `preflight.sh` |

## Recommended improvements

**Immediate (this hardening enables):**
1. Configure GitHub secrets + `staging`/`production` Environments (with prod reviewers) per the readiness checklist.
2. Provision Supabase dev/staging/prod projects; set Edge secrets via `supabase secrets set`.
3. Run `scripts/preflight.sh staging` to confirm the secret set before the first real deploy.

**Near-term:**
4. Add `eas.json` (build profiles) + EAS credentials; make `deploy-functions`/`eas-build`/OTA real.
5. Land the AI eval harness so `ai-eval-subset` actually gates.
6. Add Maestro E2E flows; wire `e2e-staging`.

**Long-term:**
7. Cache the pnpm store across jobs via a shared setup composite action.
8. Add Sentry release + sourcemap upload to CD; wire OTA crash-free auto-rollback.
9. DR restore drill + runbooks (TDD Part 5).

## Production readiness score

Two honest, separate scores:

- **Developer-experience & platform-documentation readiness: ~92%.** Reproducible from a clean clone;
  self-documenting; preflight + bootstrap in place. Remaining 8% is the AI eval harness + a shared CI
  cache.
- **Actual production-deploy readiness: ~45% (gated).** Blocked on provisioning outside a code-only
  pass: live Supabase projects, `eas.json` + EAS/store credentials, and the `production` approval gate.
  The *pipeline and validation* are ready; the *infrastructure and credentials* are not yet configured.

## Immediate actions (owners)

1. **Platform:** provision Supabase projects + set Edge secrets; add GitHub secrets/Environments; confirm prod reviewers.
2. **Platform:** create `eas.json` + EAS credentials; flip deploy scaffolds to real.
3. **AI:** land the eval harness for the CI gate.
4. **All engineers:** run `bash scripts/bootstrap.sh`; use `docs/SETUP.md`.

## Long-term recommendations

Shared CI setup composite (cache reuse); Sentry release automation + OTA auto-rollback; DR restore
drill; periodic secret rotation (matrix §rotation); OWASP Mobile review before store launch (TDD Part 5).

---

*Deliverables: `docs/SETUP.md`; `docs/devops/{GITHUB_ACTIONS_AUDIT,ENVIRONMENT_VARIABLES,SECRETS_MATRIX,DEPLOYMENT_READINESS}.md`;
`.env.example` + 5 env templates; `scripts/{preflight,bootstrap}.sh`; hardened `.github/workflows/{ci,cd,ota}.yml` + README; `.gitignore` template negations. No product or architecture changes.*
