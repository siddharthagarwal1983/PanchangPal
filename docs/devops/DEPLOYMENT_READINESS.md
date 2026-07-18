# Deployment Readiness — PanchangPal

Version: 1.0.0
Last Updated: 2026-07-12

A CI/CD health dashboard: what's required to deploy, what's configured, what's missing, and the
go/no-go. Grounded in the repo scan — see `ENVIRONMENT_VARIABLES.md`, `SECRETS_MATRIX.md`,
`GITHUB_ACTIONS_AUDIT.md`.

> **Configured?** cannot be read from inside the repo (secrets live in GitHub/Supabase/EAS). The
> "Configured" column is a **checklist to verify in those consoles**, not an assertion. Use
> `scripts/preflight.sh <target>` in CI/locally to get a live pass/fail.

---

## Required secrets

| Secret | Needed for | Store (see matrix) | Configured? (verify) |
|---|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | CD deploy-functions, prod promote | GitHub Repository Secret | ☐ |
| `EXPO_ACCESS_TOKEN` | CD eas-build, prod promote, OTA | GitHub Repository Secret | ☐ |
| `SUPABASE_STAGING_DB_URL` | CD migrate-staging | GitHub Env Secret (`staging`) | ☐ |
| `SUPABASE_STAGING_REF` | CD deploy-functions | GitHub Env Secret (`staging`) | ☐ |
| `SUPABASE_PROD_DB_URL` | CD promote-production | GitHub Env Secret (`production`) | ☐ |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions runtime | Supabase Edge Secret (per project) | ☐ |
| `SUPABASE_ANON_KEY` | Edge Functions runtime | Supabase Edge Secret / platform | ☐ |
| `SUPABASE_URL` | Edge Functions runtime | Supabase Edge Secret / platform | ☐ |
| `OPENAI_API_KEY` | ask-guru, content-ingest | Supabase Edge Secret | ☐ |
| `REVENUECAT_WEBHOOK_SECRET` | revenuecat-webhook | Supabase Edge Secret | ☐ |
| `EXPO_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | app build | EAS build env / `apps/mobile/.env` | ☐ |
| `EXPO_PUBLIC_REVENUECAT_KEY` / `_SENTRY_DSN` | app build (optional) | EAS build env | ☐ |

## Missing configuration (known gaps today)

| Gap | Impact | Owner |
|---|---|---|
| No live Supabase projects (dev/staging/prod) provisioned | migrations/functions can't actually deploy | Platform |
| No `eas.json` / EAS build profiles | `eas build/submit/update` are scaffolds | Platform |
| Store credentials (Apple ASC key, Play service account) not in EAS | no store submission | Platform |
| `production` Environment reviewers not confirmed | prod promotion lacks an approval gate | Platform |
| AI eval harness (TDD Part 3) absent | `ai-eval-subset` gate is a no-op | AI |

---

## Workflow status

| Workflow | Authored | Hardened | Real deploy | Blocking gaps |
|---|---|---|---|---|
| `ci.yml` | ✅ | ✅ | ✅ (tests) | AI eval subset is a scaffold |
| `cd.yml` | ✅ | ✅ (preflight, CLI setup, summaries) | ⚠️ migrations real; functions/E2E/EAS/prod are scaffolds | needs live projects + EAS |
| `ota.yml` | ✅ | ✅ (env aligned, preflight) | ⚠️ scaffold | needs EAS + runtime versions |

## Deployment dependencies (order)

```
preflight (fail fast)
  → migrate-staging (real)
    → deploy-functions (scaffold → needs Supabase CLI + access token + ref)
      → e2e-staging (scaffold → needs Maestro + built app)
        → eas-build (scaffold → needs eas.json + EAS creds)
          → promote-production (manual, scaffold → needs prod project + approval)
OTA is independent + manual.
```

## Environment matrix

| Env | GitHub Environment | DB URL secret | Supabase project | Store track | Approval |
|---|---|---|---|---|---|
| Development | — | local / dev | local or hosted dev | — | — |
| Staging | `staging` | `SUPABASE_STAGING_DB_URL` | staging project | TestFlight / Play Internal | none |
| Production | `production` | `SUPABASE_PROD_DB_URL` | prod project | App Store / Play | **required reviewers** |

## Known risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R-1 | Deploy steps are scaffolds; a reader may assume they deploy | Medium | Clearly flagged here + in audit; make real in Beta Readiness |
| R-2 | `production` approval gate may be unconfigured | High | Configure required reviewers on the `production` Environment before first prod run |
| R-3 | Secret sprawl across GitHub/Supabase/EAS | Medium | `SECRETS_MATRIX.md` is the single source; preflight validates presence |
| R-4 | `db-tests` needed client tooling (fixed) | Low | psql + pg_prove now installed in CI |
| R-5 | Env name drift (`prod` vs `production`) (fixed) | Low | OTA aligned to `staging`/`production` |

---

## Deployment checklist (per release)

- [ ] `scripts/preflight.sh staging` passes (and `production` for a prod run).
- [ ] All required secrets present (table above).
- [ ] Migrations reviewed (forward-only, expand-then-contract).
- [ ] CI green on the merge commit (all gates).
- [ ] `production` Environment has required reviewers.
- [ ] Rollback plan known (OTA revert / previous EAS build / DB contract step).

## Go / No-Go

| Question | Go if… |
|---|---|
| Are all required secrets configured for the target? | Yes (preflight passes) |
| Is CI green on the release commit? | Yes |
| Are migrations forward-only and reviewed? | Yes |
| For prod: is the approval gate configured and approver available? | Yes |
| Is Sentry (crash reporting) receiving events? | Yes for prod |
| Is a rollback path defined? | Yes |

**No-Go** if any answer is No. Preflight enforces the secret subset automatically; the rest is human
go/no-go per TDD Part 5 §10.
