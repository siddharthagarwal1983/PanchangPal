# Secrets Matrix — PanchangPal

Version: 1.1.0
Last Updated: 2026-08-02 (Sentry provisioning runbook; four missing SENTRY_* rows)

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
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Edge Secret | Local Only (local functions) | 🔴 Critical | Bypasses RLS entirely; full DB access. Server-only, must never reach the client or git (ADR-030). Set per project via `supabase secrets set`. ⚠️ **Supabase now marks this DEPRECATED** in favour of `SUPABASE_SECRET_KEYS` (JWT Signing Keys) — see the deprecation note below. |
| `OPENAI_API_KEY` | Supabase Edge Secret | Local Only | 🔴 Critical | Billable OpenAI access for `ask-guru`/`content-ingest`. Server-only; a leak is a financial + abuse risk. |
| `REVENUECAT_WEBHOOK_SECRET` | Supabase Edge Secret | Local Only | 🟠 High | Verifies inbound RevenueCat webhooks (F-4). A leak lets attackers forge entitlement events. |
| `SUPABASE_URL` | Supabase Edge Secret | GitHub Variable (non-secret), Local | 🟢 Low | Public project URL. Not secret, but set alongside the keys for the functions runtime. |
| `SUPABASE_ANON_KEY` | Supabase Edge Secret | Local, client build | 🟢 Low | Public anon key; RLS is the boundary. Rotate if abused. ⚠️ **Supabase now marks this DEPRECATED** in favour of `SUPABASE_PUBLISHABLE_KEYS` (JWT Signing Keys) — see below. |
| `SUPABASE_ACCESS_TOKEN` | GitHub Repository Secret | Local (CLI login alt) | 🔴 Critical | Supabase **CLI** auth used by CD to deploy functions. Grants account-level CLI power → repo secret consumed by `cd.yml`. |
| `SUPABASE_STAGING_DB_URL` | GitHub Environment Secret (`staging`) | — | 🔴 Critical | Direct Postgres connection (contains password) for staging migrations. Scope to `staging` so prod jobs can't read it. |
| `SUPABASE_PROD_DB_URL` | GitHub Environment Secret (`production`) | — | 🔴 Critical | Direct Postgres connection for prod migrations. Scope to `production` (behind manual approval) — never exposed to staging jobs. |
| `SUPABASE_STAGING_REF` | GitHub Environment Secret (`staging`) | GitHub Variable (acceptable) | 🟢 Low | Project ref identifier for function deploy. Not truly secret, but kept in the staging scope with its siblings. |
| `EXPO_ACCESS_TOKEN` | GitHub Repository Secret | EAS Secret / Local | 🟠 High | Expo/EAS auth for build, submit, and OTA (`cd.yml`, `ota.yml`). Grants publish rights to the Expo account. |
| `EXPO_PUBLIC_SUPABASE_URL` | EAS Secret / build env | Local (`apps/mobile/.env`) | 🟢 Low (public) | Baked into the app binary; public by design. Provided at build time per profile. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | EAS Secret / build env | Local | 🟢 Low (public) | Public anon key embedded in the app; RLS-guarded. |
| `EXPO_PUBLIC_REVENUECAT_KEY` | EAS Secret / build env | Local | 🟢 Low (public) | RevenueCat **public** SDK key; safe on device by design. |
| `EXPO_PUBLIC_SENTRY_DSN` | **EAS environment variable** (`preview` + `production`) | Local Only (`apps/mobile/.env`) | 🟢 Low (public) | The DSN the APP reads. Publishable — write-only ingest, safe in the bundle. **Inlined at build time** (`app.config.ts` → `extra.sentryDsn` → `telemetryAdapter.ts`), so adding it needs a NEW BUILD, not a restart. The GitHub copy below does not reach the app. |
| `SENTRY_DSN` | **Supabase Edge Secret** (per project) | GitHub (gate only) | 🟢 Low (public) | The DSN the EDGE FUNCTIONS read (`_shared/http.ts`), from a SEPARATE Sentry project — one project would merge device crashes with database errors and make the §7.2 crash-free-sessions metric meaningless, since it is computed per project. Resolved at MODULE LOAD, so warm instances keep the old value until redeployed. |
| `SENTRY_ENVIRONMENT` | **Supabase Edge Secret** (per project) | — | 🟢 Low | The environment tag Edge errors carry (`_shared/http.ts`). ⚠️ **Defaults to `production` when unset**, so an unlabelled staging project reports its errors as production — found 2026-08-02, the same defect PR #98 fixed on the mobile side. Set it explicitly on EVERY project, including production, so correctness is not a coincidence. Values follow the backend's own naming: `staging`, `production`. Resolved at MODULE LOAD, like the DSN. |
| `SENTRY_AUTH_TOKEN` | **EAS environment variable** (`production`, secret) | GitHub Repository Secret (gate only) | 🟠 High | Source-map upload from inside the EAS build that produced the bundle. The one Sentry value that grants WRITE access to the org. Scopes: `org:read`, `project:read`, `project:releases`. Never in a committed file. |
| `SENTRY_ORG` | **EAS environment variable** (`production`) | GitHub Repository Secret (gate only) | 🟢 Low | Org slug, for the source-map upload. Not secret; an identifier. |
| `SENTRY_PROJECT` | **EAS environment variable** (`production`) | GitHub Repository Secret (gate only) | 🟢 Low | Mobile project slug, for the source-map upload. Not secret; an identifier. |
| `DATABASE_URL` | Local Only | CI job env (ephemeral) | 🟠 Depends | Local/CI uses a throwaway Postgres URL. If ever pointed at a real DB it becomes critical — never commit a real one. |
| `NODE_ENV` | Local Only (tool-set) | CI | 🟢 Low | Standard Node mode flag; not a secret. |
| `PORT` | Local Only | — | 🟢 Low | Command Center dev server port; tooling only. |
| `NODE_VERSION` / `PNPM_VERSION` | GitHub Variable (workflow `env`) | — | 🟢 Low | Toolchain pins in `ci.yml`. Non-secret config. |
| `POSTGRES_PASSWORD` (CI service) | — (literal `postgres`) | — | 🟢 Low | Ephemeral CI Postgres password; not a real secret. |

---

## ⚠️ Both legacy Supabase keys are deprecated by the platform (noticed 2026-08-02)

The Edge Function Secrets dashboard now labels **`SUPABASE_ANON_KEY`** and
**`SUPABASE_SERVICE_ROLE_KEY`** as `DEPRECATED`, directing to `SUPABASE_PUBLISHABLE_KEYS` and
`SUPABASE_SECRET_KEYS` issued through **JWT Signing Keys**.

**Every Edge Function depends on both.** `_shared/env.ts` lists them in `REQUIRED` and `readEnv()`
**throws** when either is absent — so the day Supabase removes them, every function fails at boot,
not gracefully and not partially.

**Deprecated is not removed**, and nothing is broken today; this is recorded so it is a scheduled
migration rather than an outage someone diagnoses live. Two things make it less alarming than it
sounds:

- **`SVC_health` catches it.** Its dependency check wraps `readEnv` in a `try`, so a missing or
  malformed environment returns **503 degraded** rather than crashing — which is exactly the case
  the NFR-14 uptime monitor exists to catch. The failure would page rather than lurk.
- The migration is mechanical (new key names, same values' role), but it touches the service-role
  path, so it wants its own change with the RLS suites run against it — not a drive-by edit.

**Not scheduled.** Whoever picks it up should check whether Supabase has announced a removal date.

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

## Provisioning Sentry, end to end (B4.4)

⚠️ **Read this before doing any of it: the four `SENTRY_*` values already in GitHub satisfy only
`scripts/preflight.sh` and `release-build.yml`. Neither the app nor the Edge Functions ever read
them.** So CI can report Sentry as fully configured while the app reports nothing — which is the
state the project was in, and why B4 looked closeable when it was not. The values below go to
**four different destinations**, and they are not interchangeable.

**Almost none of this goes in a file.** Three of the four destinations are hosted secret stores;
the only file is a git-ignored local `.env` for development.

### 1. Sentry — create the org and TWO projects

1. Sign up at **sentry.io** (the free Developer tier is sufficient).
2. Create an organization. Its **slug** — Settings → General → *Organization Slug*, also the
   `sentry.io/organizations/<slug>/` path segment — is `SENTRY_ORG`.
3. Create **two** projects (Projects → Create Project):
   - platform **React Native**, e.g. `panchangpal-mobile` → its slug is `SENTRY_PROJECT`
   - platform **Deno** (or Node), e.g. `panchangpal-edge`

   Two, not one: §7.1 wires the client and the Edge Functions through separate ports, and
   crash-free sessions (NFR-06 / §7.2) is computed **per project**. Merging a device crash with a
   Postgres error into one stream makes that number meaningless.

### 2. Sentry — copy the two DSNs

Per project: Settings → Projects → *(project)* → **Client Keys (DSN)** → copy the `DSN`.

- mobile project → `EXPO_PUBLIC_SENTRY_DSN`
- edge project → `SENTRY_DSN`

A DSN is **publishable** (write-only ingest), which is why the matrix classes both 🟢 Low.

⚠️ **A DSN alone is not enough — set `SENTRY_ENVIRONMENT` on the same project.** `_shared/http.ts`
defaults it to `production`, so a staging project with only a DSN reports **staging errors as
production**: they land in the same bucket real incidents will, and any alert scoped to
`environment:production` fires on staging traffic. Found 2026-08-02, the first time an Edge error was
ever deliberately triggered — the DSN had been in place since 2026-08-01, so nothing was broken;
there had simply never been a server failure to report. It is the identical defect PR #98 fixed on
the mobile side — where CI
builds reported as production because the environment was derived from a value only EAS Build sets.

It stayed hidden because `panchangpal-edge` had never received a single event — **you cannot notice
a mislabelled environment in a project with no data**, and an empty dashboard looks the same whether
telemetry is broken or merely unexercised. Set the variable on every project, production
included — relying on the default being right is how the mobile side went wrong.

⚠️ **The two Sentry projects use different names for the same tier, and that is deliberate.** Mobile
takes its tag from the EAS channel, so staging is `preview` (and E2E is `ci`); the edge project
follows the backend's own vocabulary, so staging is `staging` — the word `preflight.sh` and `cd.yml`
already use. Each matches its own tooling. Recorded here so the mismatch reads as a decision rather
than a mistake.

| Sentry project | staging tier | production |
|---|---|---|
| `panchangpal-mobile` | `preview` · `ci` (E2E) | `production` |
| `panchangpal-edge` | `staging` | `production` |

### 3. Sentry — create the auth token (the only secret here)

Settings → **Auth Tokens** → *Create New Token*, scopes **`org:read`**, **`project:read`**,
**`project:releases`** → `SENTRY_AUTH_TOKEN`. Sentry shows it once. If the source-map upload later
returns 403, widen the scopes first — that is the usual cause.

### 4. Place in EAS — the app, and source maps

```bash
cd apps/mobile && eas login

eas env:create --environment preview    --name EXPO_PUBLIC_SENTRY_DSN --value "<mobile DSN>"
eas env:create --environment production --name EXPO_PUBLIC_SENTRY_DSN --value "<mobile DSN>"

eas env:create --environment production --name SENTRY_ORG        --value "<org-slug>"
eas env:create --environment production --name SENTRY_PROJECT     --value "<mobile-project-slug>"
eas env:create --environment production --name SENTRY_AUTH_TOKEN  --value "<token>" --visibility secret
```

(Dashboard equivalent: **expo.dev** → project → *Environment variables*, per environment. The
environment names come from `eas.json`'s three profiles.)

⚠️ **`EXPO_PUBLIC_*` is inlined at bundle time.** A DSN added after a build does not reach that
build. Rebuild — restarting the app cannot help.

### 5. Place in Supabase — the Edge Functions

Get the project refs first: `supabase projects list`, or the dashboard URL segment
`https://supabase.com/dashboard/project/<REF>` (also Project Settings → General → *Reference ID*).
Use the **`panchangpal-edge`** DSN here, never the mobile one — crossing them sends server errors
into the mobile project and corrupts the population crash-free sessions is computed over.

```bash
# 1. Build the two workspace packages the functions import. NOT optional — see below.
pnpm build --filter=@panchangpal/shared --filter=@panchangpal/ai

# 2. Set the secret
supabase secrets set SENTRY_DSN="<edge DSN>" --project-ref <PROJECT_REF>

# 3. Redeploy BY NAME, from the repo root
supabase functions deploy \
  account ask-guru content-ingest notify-scheduler panchang revenuecat-webhook sync \
  --project-ref <PROJECT_REF>
```

**Three things here are easy to get wrong, and each fails in a way that does not name its cause.**

1. **Build `shared` and `ai` first.** `cd.yml` does this (its comment: *Deno cannot rewrite the
   packages' TS-ESM '.js' specifiers to '.ts'*), and `packages/*/dist/` is git-ignored, so a fresh
   clone has neither. Skipping it fails with
   `ENOENT: … packages/ai/dist/index.js` **after** every asset has uploaded — it reads as a
   corrupt repo rather than a missing build step, and it takes down exactly `ask-guru` and
   `content-ingest`, the two functions that import that package.
2. **Deploy BY NAME.** Sources live under `apps/backend/functions` with entrypoints declared in
   `supabase/config.toml`; a bare `supabase functions deploy` looks in the (non-existent)
   `supabase/functions/` default directory.
3. **The redeploy is not tidiness.** `_shared/http.ts` resolves the DSN at **module load**, so
   already-warm instances keep the previous value — absent — and the dashboard shows the secret
   configured while the functions report nothing.

`WARNING: Docker is not running` during deploy is harmless: bundling and upload go through the API,
and Docker is only needed for `supabase start` / local `functions serve`.

**There is no production project** — the free tier allows two per org and dev + staging use both.
That is the same constraint blocking B1 and NFR-15.

### 6. GitHub — already placed, and gate-only

`SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` are set as repository/environment
secrets and are consumed **only** by `preflight.sh`'s production tier and `release-build.yml`'s
readiness gate. Leave them; just do not mistake them for runtime configuration.

### 7. Local development (the only file)

`apps/mobile/.env` — git-ignored:

```
EXPO_PUBLIC_SENTRY_DSN=<mobile DSN>
```

**Never** put `SENTRY_AUTH_TOKEN` here.

### 8. Verify — configured is not the same as effective

This step is the point of the section. Do not close B4.4 on configuration alone:

- **Client:** `getTelemetryBackend()` returns `'sentry'`, not `'none'`, and an E2E artifact's
  logcat shows `[telemetry] reporter=sentry` once per launch. That log line exists specifically
  because this state was reported wrongly once already.
- **Server:** `getServerTelemetryBackend()` stops reporting the null backend.
- **End to end:** trigger one real error and confirm it lands in the expected project. §8.4 is
  explicit that alerting which has never been triggered is a plan, not a capability.

---

## Rotation & hygiene

| Secret | Rotate when | How |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Suspected leak; staff offboarding | Supabase dashboard → API → regenerate; re-set Edge secret |
| `OPENAI_API_KEY` | Leak; usage spike | OpenAI dashboard → new key; update Edge secret; revoke old |
| `SUPABASE_ACCESS_TOKEN` / `EXPO_ACCESS_TOKEN` | Leak; offboarding | Provider dashboard → revoke + reissue; update GitHub secret |
| `SENTRY_AUTH_TOKEN` | Leak; offboarding | Sentry → Settings → Auth Tokens → revoke + reissue; update the **EAS** variable (and the GitHub copy). The DSNs need no rotation on their own — they are write-only ingest — but a compromised token can rewrite releases. |
| `REVENUECAT_WEBHOOK_SECRET` | Leak | RevenueCat dashboard → rotate; update Edge secret + webhook config |
| DB URLs | Leak; credential rotation | Rotate DB password; update the environment secret |

**Detection:** `ci.yml` runs **gitleaks** on every PR (secret scan) — a committed secret fails the
build. Treat any gitleaks hit as a rotation event, not just a revert.
