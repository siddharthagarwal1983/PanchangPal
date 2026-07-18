# GitHub Actions Audit — PanchangPal

Version: 1.0.0
Last Updated: 2026-07-12
Author: Platform / DevOps audit (read-only audit; behavior-preserving hardening tracked separately)

Purpose: a per-workflow audit of every GitHub Actions workflow in `.github/workflows/`,
covering purpose, triggers, inputs/outputs, dependencies, required secrets/variables,
environment, failure modes, and recovery. Findings feed the hardening pass (Phase 8) and the
deployment-readiness dashboard.

Scope: `.github/workflows/ci.yml`, `cd.yml`, `ota.yml`. (`.gitkeep`, `README.md` are not workflows.)

> **Important context:** Several CD/OTA steps are intentional **scaffolds** — they `echo` the
> command they will run once the toolchain/stores are provisioned (Beta Readiness milestone,
> TDD Part 5). They are wired now so the pipeline shape, gates, and environments exist and
> fail-closed. This audit flags where a scaffold must become real before it can deploy, without
> changing current behavior.

---

## Summary table

| Workflow | Trigger | Environments | Real today? | Blocking |
|---|---|---|---|---|
| `ci.yml` | `pull_request → main`, `workflow_dispatch` | none | Mostly real (2 scaffold steps) | Yes (merge gate) |
| `cd.yml` | `push → main`, `workflow_dispatch` | staging, production | Scaffold (migrations real) | Deploy pipeline |
| `ota.yml` | `workflow_dispatch` (channel input) | staging \| prod | Scaffold | Manual OTA |

---

## 1. `ci.yml` — CI (PR gates)

**Purpose.** Release-blocking pull-request gates (TDD Part 5 §2.1/§2.2, ADR-024): lint + typecheck
→ unit/component/a11y → API/zod contract → RLS policy + DB integration → AI eval subset → secret +
dependency scan.

**Trigger.** `pull_request` targeting `main`; manual `workflow_dispatch`.

**Concurrency.** `ci-${{ github.ref }}`, `cancel-in-progress: true` — supersedes stale PR runs. ✅

**Inputs.** None (event-driven).

**Outputs.** Pass/fail checks per job. No artifacts published.

**Jobs & dependencies.**

| Job | Needs | What it does |
|---|---|---|
| `lint-typecheck` | — | `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm typecheck` |
| `unit-component-a11y` | `lint-typecheck` | `pnpm test` (vitest) + `@panchangpal/ui` + `@panchangpal/mobile` (jest-expo) |
| `api-contract` | `lint-typecheck` | `vitest run packages/api --passWithNoTests` |
| `db-tests` | `lint-typecheck` | postgres service (pgvector/pgvector:pg15) → `scripts/migrate.sh` → `pg_prove` RLS + integration suites |
| `ai-eval-subset` | `lint-typecheck` | **Scaffold** (`echo`) — refusal/golden harness lands with TDD Part 3 |
| `security-scan` | `lint-typecheck` | gitleaks secret scan + `pnpm audit --audit-level=high \|\| true` |

**Secrets required.** None. gitleaks runs on a public-action basis; `pnpm audit` needs no secret.
`db-tests` uses a throwaway local Postgres password (`postgres`) — not a real secret.

**Variables required.** Workflow-level `env.NODE_VERSION=20.11.0`, `env.PNPM_VERSION=9.6.0`.

**Environment.** None (no GitHub Environment; no deploy).

**Failure modes & recovery.**

| Failure | Cause | Recovery |
|---|---|---|
| `pnpm install` fails | lockfile drift vs `package.json` | run `pnpm install` locally, commit updated `pnpm-lock.yaml` |
| `db-tests` cannot find `pg_prove`/`psql` | runner lacks `postgresql-client` + `pgTAP` client (`pg_prove`); **not installed by the job today** | **Finding CI-1** — install `postgresql-client` + `libtap-parser-sourcehandler-pgtap-perl` (or `cpanm TAP::Parser::SourceHandler::pgTAP`) before running |
| `security-scan` node/pnpm mismatch | job runs `corepack enable` + `pnpm install` with **no `setup-node`/`pnpm/action-setup`** | **Finding CI-2** — add setup steps so the pinned Node/pnpm are used and pnpm cache applies |
| `pnpm audit` noise | transitive advisories | currently non-blocking (`|| true`); triage high/critical manually |
| gitleaks false positive | test fixture resembling a secret | add a `.gitleaks.toml` allowlist entry |

**Findings.**
- **CI-1 (fragile):** `db-tests` calls `scripts/migrate.sh` (uses `psql`) and `pg_prove` but never installs the Postgres client or pgTAP `pg_prove` on the runner. Will fail on first real run.
- **CI-2 (fragile):** `security-scan` runs `pnpm install` without `setup-node` + `pnpm/action-setup`; relies on the runner's ambient Node and gets no pnpm store cache.
- **CI-3 (duplication):** `env.NODE_VERSION` / `env.PNPM_VERSION` are declared but **every job hardcodes** `'20.11.0'` / `'9.6.0'` in `with:` instead of referencing `${{ env.* }}`. Version bumps must be made in 8+ places.
- **CI-4 (caching):** only `setup-node` `cache: pnpm` is used; the `db-tests` and `security-scan` jobs get no dependency cache. No shared install job / artifact reuse across the 6 jobs (6× `pnpm install`).
- **CI-5 (scaffold):** `ai-eval-subset` is an `echo`; the gate exists but does not yet block on AI regressions.
- **CI-6 (retries):** no retry wrapper on network-bound steps (`pnpm install`, gitleaks download).

---

## 2. `cd.yml` — CD (deploy on merge to main)

**Purpose.** Continuous delivery to staging on merge, with a manual production promotion (TDD Part 5
§2.1, ADR-024): migrations → staging → deploy Edge Functions → Maestro E2E → EAS build → internal
distribution; production is a gated manual `workflow_dispatch`.

**Trigger.** `push` to `main`; manual `workflow_dispatch` (also the production-promotion condition).

**Concurrency.** `cd-main`, `cancel-in-progress: false` — deployments never cancel each other. ✅

**Inputs.** None declared (production job keys off `github.event_name == 'workflow_dispatch'`).

**Outputs.** Deployed migrations (real) + scaffolded function/app deploys.

**Jobs & dependencies.**

| Job | Needs | Environment | Real today? | Secrets |
|---|---|---|---|---|
| `migrate-staging` | — | staging | ✅ Real (`scripts/migrate.sh`) | `SUPABASE_STAGING_DB_URL` |
| `deploy-functions` | `migrate-staging` | staging | ⚠️ Scaffold (`echo`) | `SUPABASE_STAGING_REF`, `SUPABASE_ACCESS_TOKEN` |
| `e2e-staging` | `deploy-functions` | — | ⚠️ Scaffold (`echo`) | none |
| `eas-build` | `e2e-staging` | staging | ⚠️ Scaffold (`echo`) | `EXPO_ACCESS_TOKEN` |
| `promote-production` | `eas-build` | production (manual approval) | ⚠️ Scaffold (`echo`) | `SUPABASE_PROD_DB_URL`, `EXPO_ACCESS_TOKEN` |

**Secrets required (union).** `SUPABASE_STAGING_DB_URL`, `SUPABASE_STAGING_REF`,
`SUPABASE_ACCESS_TOKEN`, `EXPO_ACCESS_TOKEN`, `SUPABASE_PROD_DB_URL`. See `SECRETS_MATRIX.md`.

**Variables required.** None beyond secrets.

**Environment.** `staging` and `production` GitHub Environments. `production` is expected to require
**manual reviewers** (approval gate) — this must be configured in repo settings (see readiness dashboard).

**Failure modes & recovery.**

| Failure | Cause | Recovery |
|---|---|---|
| `migrate-staging` fails | `SUPABASE_STAGING_DB_URL` missing/invalid, or a migration errors | preflight validator (Phase 6) fails fast with the exact missing secret; fix migration, re-run job |
| `deploy-functions` no-op | scaffold `echo` | replace with `supabase functions deploy --project-ref $SUPABASE_STAGING_REF`; requires `SUPABASE_ACCESS_TOKEN` + Supabase CLI |
| `promote-production` runs on every push | `if` guards to `workflow_dispatch` only ✅ | n/a |
| Missing `production` approval | Environment reviewers not configured | configure required reviewers on the `production` Environment |
| Partial deploy (migrations applied, functions not) | non-atomic pipeline | migrations are forward-only/expand-contract; re-run `deploy-functions` — safe by design |

**Findings.**
- **CD-1 (missing validation):** no preflight secret/tool validation before `migrate-staging`; a missing secret surfaces as an opaque `psql` error. Phase 6 preflight addresses this.
- **CD-2 (scaffold → real):** `deploy-functions`, `e2e-staging`, `eas-build`, `promote-production` are `echo` scaffolds. Track each in the Beta Readiness milestone before real deploys.
- **CD-3 (no Supabase CLI setup):** `deploy-functions` will need `supabase/setup-cli` (or install step); not present.
- **CD-4 (no checkout depth / caching):** deploy jobs `checkout` but install nothing cacheable yet; fine while scaffolded, revisit when real.
- **CD-5 (production DB URL only in prod job):** ✅ correctly scoped; prod secret not exposed to staging jobs.

---

## 3. `ota.yml` — OTA (Expo Updates)

**Purpose.** Ship JS-only, store-policy-compliant fixes to Expo Updates channels (TDD Part 5 §2.4,
ADR-024, TRISK-10: no native/config-plugin changes via OTA).

**Trigger.** `workflow_dispatch` only (deliberate action, not every merge). ✅

**Inputs.** `channel` (choice: `staging` | `prod`, default `staging`).

**Outputs.** A published Expo Update on the chosen channel (scaffolded `echo` today).

**Jobs.** `publish-ota` → `environment: ${{ inputs.channel }}` → `eas update` (scaffold).

**Secrets required.** `EXPO_ACCESS_TOKEN`.

**Environment.** `staging` or `prod` (from input). Note the CD/OTA naming mismatch below.

**Failure modes & recovery.**

| Failure | Cause | Recovery |
|---|---|---|
| Wrong channel targeted | operator selects `prod` by mistake | default is `staging`; `prod` should require the `prod` Environment approval |
| `eas update` fails | `EXPO_ACCESS_TOKEN` missing/expired | preflight validator flags it; rotate token in repo secrets |
| Native change shipped via OTA | policy violation (TRISK-10) | forbidden by process; OTA is JS-only. Add a runtime-version guard when made real |

**Findings.**
- **OTA-1 (env naming mismatch):** OTA uses Environments named `staging` / **`prod`**, while CD uses `staging` / **`production`**. Align names (choose one) so Environment protection rules apply consistently.
- **OTA-2 (scaffold):** `eas update` is an `echo`; needs EAS CLI setup + runtime-version pinning + staged rollout + Sentry crash-free auto-rollback when made real.
- **OTA-3 (message source):** uses `github.event.head_commit.message`, which is empty on `workflow_dispatch`. Use the `inputs` or `github.sha` for the update message.

---

## Cross-cutting findings

| ID | Severity | Finding | Fix (Phase 8 / follow-up) |
|---|---|---|---|
| GA-1 | Medium | Version pins duplicated/hardcoded across ci jobs, ignoring `env.NODE_VERSION`/`PNPM_VERSION` | reference `${{ env.* }}`; single source |
| GA-2 | Medium | `db-tests` lacks `psql`/`pg_prove` install | add install step |
| GA-3 | Medium | `security-scan` lacks node/pnpm setup | add setup + cache |
| GA-4 | Low | No network-retry on installs / downloads | wrap with `nick-fields/retry` or `pnpm` retry |
| GA-5 | Low | No `permissions:` block (least privilege) | add top-level `permissions: contents: read` (+ per-job as needed) |
| GA-6 | Low | No step grouping / job summaries (`$GITHUB_STEP_SUMMARY`) | add readiness summaries |
| GA-7 | Low | Stale `.github/workflows/README.md` says "Placeholder — workflows authored in next task" but 3 workflows exist | refresh README |
| GA-8 | Medium | No preflight secret validation before deploy | Phase 6 `scripts/preflight.sh` |
| GA-9 | Low | Env name mismatch `production` (CD) vs `prod` (OTA) | standardize |

None of the three workflows is **obsolete** or a **duplicate** — each has a distinct purpose (PR gates, delivery, OTA). No workflow should be removed. `migrate.sh` is correctly shared by CI and CD (no duplication).

---

## Recommended hardening (behavior-preserving)

1. Add a top-level `permissions: { contents: read }` to all three workflows (least privilege).
2. Reference `${{ env.NODE_VERSION }}` / `${{ env.PNPM_VERSION }}` instead of hardcoded pins.
3. Add `postgresql-client` + `pg_prove` install to `db-tests`; add `setup-node` + `pnpm/action-setup` to `security-scan`.
4. Wrap `pnpm install` in a retry for transient network failures.
5. Emit `$GITHUB_STEP_SUMMARY` readiness/error summaries per job.
6. Standardize Environment names (`staging` / `production`) and configure required reviewers on `production`.
7. Call `scripts/preflight.sh <target>` as the first step of every deploy job (fail fast on missing secrets).

All of the above improve diagnostics and reliability **without changing what the pipeline deploys**.
