# Secrets Matrix — PanchangPal

Version: 1.0.0
Last Updated: 2026-07-12

Purpose: classify every secret/variable the repository uses by **where it must be stored** and
**why**. Grounded in the code/workflow scan (see `ENVIRONMENT_VARIABLES.md`). No invented secrets.

## Classification vocabulary

| Class | Where it lives | Meaning |
|---|---|---|
| **GitHub Repository Secret** | GitHub → Settings → Secrets and variables → Actions → *Repository secrets* | Available to all workflows; used by CI/CD that isn't environment-scoped |
| **GitHub Environment Secret** | GitHub → Settings → Environments → (`staging`/`production`) → *Secrets* | Scoped to one environment; enables approval gates (prod) |
| **GitHub Variable** | GitHub → …→ Actions → *Variables* | Non-sensitive config (identifiers, versions) |
| **Supabase Edge Secret** | `supabase secrets set` on the target project | Runtime secrets for Edge Functions (server-only) |
| **EAS Secret / Credentials** | `eas secret:create` + EAS credentials service | Expo build-time secrets + store signing/submission |
| **Local Only** | Developer machine `.env` (git-ignored) | Never leaves the machine |
| **Never Committed** | — | Applies to all above: real values never in git |

> **Universal rule:** every value below is **Never Committed**. The templates (`.env.*.example`)
> contain placeholders only; `.gitignore` ignores real `.env*` files (with explicit negations for
> the `*.example` templates).

---

## Matrix

| Secret / Variable | Primary class | Also set as | Sensitive | Why (reason) |
|---|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Edge Secret | Local Only (local functions) | 🔴 Critical | Bypasses RLS entirely; full DB access. Server-only, must never reach the client or git (ADR-030). Set per project via `supabase secrets set`. |
| `OPENAI_API_KEY` | Supabase Edge Secret | Local Only | 🔴 Critical | Billable OpenAI access for `ask-guru`/`content-ingest`. Server-only; a leak is a financial + abuse risk. |
| `REVENUECAT_WEBHOOK_SECRET` | Supabase Edge Secret | Local Only | 🟠 High | Verifies inbound RevenueCat webhooks (F-4). A leak lets attackers forge entitlement events. |
| `SUPABASE_URL` | Supabase Edge Secret | GitHub Variable (non-secret), Local | 🟢 Low | Public project URL. Not secret, but set alongside the keys for the functions runtime. |
| `SUPABASE_ANON_KEY` | Supabase Edge Secret | Local, client build | 🟢 Low | Public anon key; RLS is the boundary. Rotate if abused. |
| `SUPABASE_ACCESS_TOKEN` | GitHub Repository Secret | Local (CLI login alt) | 🔴 Critical | Supabase **CLI** auth used by CD to deploy functions. Grants account-level CLI power → repo secret consumed by `cd.yml`. |
| `SUPABASE_STAGING_DB_URL` | GitHub Environment Secret (`staging`) | — | 🔴 Critical | Direct Postgres connection (contains password) for staging migrations. Scope to `staging` so prod jobs can't read it. |
| `SUPABASE_PROD_DB_URL` | GitHub Environment Secret (`production`) | — | 🔴 Critical | Direct Postgres connection for prod migrations. Scope to `production` (behind manual approval) — never exposed to staging jobs. |
| `SUPABASE_STAGING_REF` | GitHub Environment Secret (`staging`) | GitHub Variable (acceptable) | 🟢 Low | Project ref identifier for function deploy. Not truly secret, but kept in the staging scope with its siblings. |
| `EXPO_ACCESS_TOKEN` | GitHub Repository Secret | EAS Secret / Local | 🟠 High | Expo/EAS auth for build, submit, and OTA (`cd.yml`, `ota.yml`). Grants publish rights to the Expo account. |
| `EXPO_PUBLIC_SUPABASE_URL` | EAS Secret / build env | Local (`apps/mobile/.env`) | 🟢 Low (public) | Baked into the app binary; public by design. Provided at build time per profile. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | EAS Secret / build env | Local | 🟢 Low (public) | Public anon key embedded in the app; RLS-guarded. |
| `EXPO_PUBLIC_REVENUECAT_KEY` | EAS Secret / build env | Local | 🟢 Low (public) | RevenueCat **public** SDK key; safe on device by design. |
| `EXPO_PUBLIC_SENTRY_DSN` | EAS Secret / build env | Local | 🟢 Low (public) | Sentry DSN is publishable; safe on device. |
| `DATABASE_URL` | Local Only | CI job env (ephemeral) | 🟠 Depends | Local/CI uses a throwaway Postgres URL. If ever pointed at a real DB it becomes critical — never commit a real one. |
| `NODE_ENV` | Local Only (tool-set) | CI | 🟢 Low | Standard Node mode flag; not a secret. |
| `PORT` | Local Only | — | 🟢 Low | Command Center dev server port; tooling only. |
| `NODE_VERSION` / `PNPM_VERSION` | GitHub Variable (workflow `env`) | — | 🟢 Low | Toolchain pins in `ci.yml`. Non-secret config. |
| `POSTGRES_PASSWORD` (CI service) | — (literal `postgres`) | — | 🟢 Low | Ephemeral CI Postgres password; not a real secret. |

---

## Placement guidance (do this)

**Runtime (Edge Functions) — per project (dev/staging/prod):**
```bash
supabase secrets set \
  SUPABASE_SERVICE_ROLE_KEY=... \
  OPENAI_API_KEY=... \
  REVENUECAT_WEBHOOK_SECRET=... \
  --project-ref <PROJECT_REF>
```
(`SUPABASE_URL` / `SUPABASE_ANON_KEY` are provided to functions automatically by the platform, but
are listed as required by `readEnv`; set them explicitly for local `functions serve`.)

**CI/CD — repository-wide:** `SUPABASE_ACCESS_TOKEN`, `EXPO_ACCESS_TOKEN`.

**CI/CD — environment-scoped:**
- `staging` Environment → `SUPABASE_STAGING_DB_URL`, `SUPABASE_STAGING_REF`
- `production` Environment (with required reviewers) → `SUPABASE_PROD_DB_URL`

**Store credentials (Apple/Google):** managed by the **EAS credentials service** (and App Store
Connect / Play Console) when `eas.json` + build/submit are made real — **not** environment variables
in this repo. See `docs/SETUP.md`.

---

## Rotation & hygiene

| Secret | Rotate when | How |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Suspected leak; staff offboarding | Supabase dashboard → API → regenerate; re-set Edge secret |
| `OPENAI_API_KEY` | Leak; usage spike | OpenAI dashboard → new key; update Edge secret; revoke old |
| `SUPABASE_ACCESS_TOKEN` / `EXPO_ACCESS_TOKEN` | Leak; offboarding | Provider dashboard → revoke + reissue; update GitHub secret |
| `REVENUECAT_WEBHOOK_SECRET` | Leak | RevenueCat dashboard → rotate; update Edge secret + webhook config |
| DB URLs | Leak; credential rotation | Rotate DB password; update the environment secret |

**Detection:** `ci.yml` runs **gitleaks** on every PR (secret scan) — a committed secret fails the
build. Treat any gitleaks hit as a rotation event, not just a revert.
