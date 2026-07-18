# PanchangPal — Setup & Operations Guide

Version: 1.0.0
Last Updated: 2026-07-12

This guide takes a new engineer from an empty machine to running PanchangPal locally, testing it,
and understanding how it deploys — with no external guidance needed. Pair it with:

- `docs/devops/ENVIRONMENT_VARIABLES.md` — every variable and where it's read.
- `docs/devops/SECRETS_MATRIX.md` — where each secret must live.
- `docs/devops/GITHUB_ACTIONS_AUDIT.md` — CI/CD internals.
- `docs/devops/DEPLOYMENT_READINESS.md` — go/no-go + secret checklist.

> **Fast path:** clone → `bash scripts/bootstrap.sh` → fix anything red → `pnpm install` →
> copy `.env.local.example` → `apps/mobile/.env` → `pnpm --filter @panchangpal/mobile start`.

---

## 1. Project overview

PanchangPal is a calm, offline-first, AI-assisted Hindu spiritual companion. It is a **pnpm +
Turborepo monorepo**:

```
apps/mobile      React Native + Expo (Expo Router) app
apps/backend     Supabase Edge Functions (Deno) + SQL migrations + seed + tests
packages/*       shared, api (zod contracts), ui, design-tokens, database, ai
supabase/        Supabase CLI config (config.toml)
scripts/         bootstrap, preflight, migrate, codegen, command-center
.github/         CI/CD workflows
docs/            MRD/PRD/PDD/TDD, ADRs, api, database, devops
```

Backend owns business logic and state; the mobile app is a thin, offline-first client. Third-party
services are always behind adapters. See `.claude/ARCHITECTURE_SUMMARY.md`.

---

## 2. Prerequisites

| Tool | Version | Why | Install |
|---|---|---|---|
| Git | any recent | version control | system package manager |
| Node.js | **>= 20.11.0** (see `.nvmrc`) | JS runtime for tooling + app | `nvm install` in repo root |
| pnpm | **9.6.0** (pinned) | workspace package manager | `corepack enable && corepack prepare pnpm@9.6.0 --activate` |
| Supabase CLI | latest | local DB, migrations, functions, deploy | `brew install supabase/tap/supabase` |
| PostgreSQL client (`psql`) | 15 | run `scripts/migrate.sh` + DB tests | `brew install libpq` / `apt install postgresql-client` |
| pgTAP `pg_prove` | latest | DB test suites | `apt install libtap-parser-sourcehandler-pgtap-perl` / `cpanm TAP::Parser::SourceHandler::pgTAP` |
| Deno | latest | run Edge Functions locally | `brew install deno` (or via Supabase CLI) |
| Expo CLI | via `npx expo` | run/build the app | bundled — `npx expo` |
| EAS CLI | latest | builds, submits, OTA | `npm i -g eas-cli` |
| Watchman | latest | RN file watching (recommended) | `brew install watchman` |
| Java JDK + Android SDK | 17+/current | Android builds | Android Studio |
| Xcode | current | iOS builds (macOS only) | App Store |

Run the readiness check any time:

```bash
bash scripts/bootstrap.sh
```

It prints PASS/WARN/FAIL per tool and an overall percentage. **WARN** items are only needed for the
specific task (e.g. Xcode for iOS builds); **FAIL** items block core development.

---

## 3. Clone & install

```bash
git clone <REPO_URL> PanchangPal
cd PanchangPal
corepack enable                    # if pnpm isn't active yet
pnpm install                       # installs the whole workspace (frozen in CI)
```

---

## 4. Configure environment

Real `.env*` files are git-ignored; only `*.example` templates are committed.

**Mobile (public config):**
```bash
cp .env.local.example apps/mobile/.env
# edit apps/mobile/.env — set EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
```

**Local Edge Functions (only if running functions):** set `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, and optionally `OPENAI_API_KEY` / `REVENUECAT_WEBHOOK_SECRET` in your
shell or a local functions env. See `.env.local.example` and `ENVIRONMENT_VARIABLES.md`.

**Never commit real values.** `ci.yml` runs gitleaks on every PR.

---

## 5. Configure Supabase

```bash
supabase login                     # opens browser; stores a CLI token
supabase start                     # local Postgres + Studio (uses supabase/config.toml)
```

Notes specific to this repo (important):
- **Migrations live in `apps/backend/migrations/`**, not the CLI default `supabase/migrations/`
  (TDD Part 1 §4). Apply them with the repo script:
  ```bash
  bash scripts/migrate.sh "postgresql://postgres:postgres@localhost:54322/postgres"
  ```
- **Seed** is `apps/backend/seed/seed.sql` (wired via `config.toml → db.seed.sql_paths`); a local
  `supabase db reset` uses it.
- **Functions** live in `apps/backend/functions/` (Deno).

---

## 6. Configure Expo

`apps/mobile/app.config.ts` reads `EXPO_PUBLIC_*` from the environment at build time. For local dev,
those come from `apps/mobile/.env`. The deep-link scheme is `panchangpal://`.

## 7. Configure EAS (builds / OTA)

> There is no `eas.json` yet — it lands in the Beta Readiness milestone. When it does:

```bash
npm i -g eas-cli
eas login
eas build:configure          # creates eas.json (build profiles: staging, production)
```

Store credentials (Apple/Google) are managed by the **EAS credentials service** (`eas credentials`)
and App Store Connect / Play Console — **not** environment variables. `EXPO_ACCESS_TOKEN` (a GitHub
secret) authenticates CI for builds/submits/OTA.

## 8. Configure GitHub Secrets

Set these in **GitHub → Settings → Secrets and variables → Actions** (see `SECRETS_MATRIX.md`):

Repository secrets: `SUPABASE_ACCESS_TOKEN`, `EXPO_ACCESS_TOKEN`.
`staging` Environment: `SUPABASE_STAGING_DB_URL`, `SUPABASE_STAGING_REF`.
`production` Environment (add **required reviewers**): `SUPABASE_PROD_DB_URL`.

Validate locally before a deploy:
```bash
SUPABASE_STAGING_DB_URL=... SUPABASE_STAGING_REF=... SUPABASE_ACCESS_TOKEN=... EXPO_ACCESS_TOKEN=... \
  bash scripts/preflight.sh staging
```

## 9. Configure Apple / Google (store submission)

Deferred until store submission (Beta Readiness). High level:
- **Apple:** enroll in the Apple Developer Program; create the App ID + App Store Connect app; let
  `eas credentials` manage signing; an ASC API key enables `eas submit`.
- **Google:** create the Play Console app; a Play service-account JSON (uploaded to EAS credentials,
  not the repo) enables `eas submit` to the Internal track.

These are configured in EAS/consoles, not as repo env vars.

---

## 10. Run locally

**Mobile app:**
```bash
pnpm --filter @panchangpal/mobile start      # Expo dev server
pnpm --filter @panchangpal/mobile ios         # or: android
```

**Backend (Edge Functions):**
```bash
supabase functions serve --env-file <your-local-functions-env>
```

**Command Center (internal engineering dashboard):**
```bash
node scripts/command-center/generate.mjs && PORT=4173 node scripts/command-center/serve.mjs
```

---

## 11. Run tests

```bash
pnpm test                                   # Vitest logic suites (packages/* + backend)
pnpm --filter @panchangpal/ui test          # UI component tests
pnpm --filter @panchangpal/mobile test      # jest-expo (component + a11y)
pnpm lint && pnpm typecheck                 # lint + TS across the workspace
```

DB tests (needs local Postgres + `pg_prove`):
```bash
bash scripts/migrate.sh "$DATABASE_URL"
pg_prove -d "$DATABASE_URL" apps/backend/tests/rls/*.test.sql apps/backend/tests/integration/*.test.sql
```

---

## 12. Run migrations

```bash
bash scripts/migrate.sh "postgresql://USER:PASS@HOST:5432/DB"
```
Forward-only, expand-then-contract; RLS ships with each table. Migrations apply in lexical order
from `apps/backend/migrations/`.

---

## 13. Deploy

**Staging** is automatic on merge to `main` (`cd.yml`): preflight → migrations → deploy functions →
E2E → EAS build. **Production** is a manual promotion:

```
GitHub → Actions → CD → Run workflow (workflow_dispatch)
```
which runs `promote-production` behind the `production` Environment approval. **OTA** (JS-only):
```
GitHub → Actions → OTA → Run workflow → choose channel (staging|production)
```

Every deploy job runs `scripts/preflight.sh <target>` first and **fails fast** if a required secret
is missing.

---

## 14. Troubleshooting / FAQ

**`pnpm install` fails with a lockfile error.** Your `package.json` and `pnpm-lock.yaml` drifted.
Run `pnpm install` (without `--frozen-lockfile`) locally and commit the updated lockfile.

**`scripts/migrate.sh` — `psql: command not found`.** Install the Postgres client (see §2).

**`pg_prove: command not found`.** Install pgTAP's `pg_prove` (see §2).

**Preflight says a secret is missing.** It prints the exact GitHub path. Add the secret there, then
re-run `scripts/preflight.sh <target>`. Deploys never continue with missing config.

**The app can't reach the backend.** Check `apps/mobile/.env` has `EXPO_PUBLIC_SUPABASE_URL` +
`EXPO_PUBLIC_SUPABASE_ANON_KEY`. Restart the Expo dev server after changing env.

**CI `db-tests` fails locally but the SQL looks fine.** Ensure the pgvector image / a pgvector-capable
Postgres is used; migrations require the `vector` extension.

**gitleaks flagged a file.** You may have committed a secret. Rotate it (treat as compromised) and
remove it from history; add a `.gitleaks.toml` allowlist only for genuine false positives.

**Reset local environment.**
```bash
supabase stop && supabase start      # fresh local DB
pnpm store prune && pnpm install     # clean dependency state
rm -rf node_modules **/node_modules && pnpm install   # nuclear option
```

**New-developer onboarding checklist.**
1. Install prerequisites (§2) → `bash scripts/bootstrap.sh` until core is green.
2. `pnpm install`.
3. `cp .env.local.example apps/mobile/.env` and fill in Supabase values.
4. `supabase start` → `bash scripts/migrate.sh <local-db-url>`.
5. `pnpm --filter @panchangpal/mobile start`.
6. `pnpm test` to confirm a green baseline.
