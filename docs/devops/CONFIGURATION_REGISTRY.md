# PanchangPal — Canonical Configuration Registry

Version: 1.0.0
Last Updated: 2026-07-12
Status: **Canonical** — the single authoritative source for every configuration item in PanchangPal.

> **Rule of record.** All future configuration changes must update this registry **before**
> implementation. Any variable, flag, or config key not listed here is not sanctioned.
>
> **Generation.** This registry was produced by scanning the repository (not invented):
> `process.env.*`, Edge Function `readEnv`/`get(...)`, `${{ secrets.* }}`, `apps/mobile/app.config.ts`,
> `supabase/config.toml`, `apps/backend/deno.json`, `turbo.json`, root/app `package.json`,
> `vitest.config.ts`, `.github/workflows/*`, and `packages/shared/src/enums.ts` (feature flags,
> notification channels). Only configuration **actually referenced by the codebase** is included.
>
> Companions: `ENVIRONMENT_VARIABLES.md` (env detail), `SECRETS_MATRIX.md` (secret storage),
> `GITHUB_ACTIONS_AUDIT.md` (workflows), `DEPLOYMENT_READINESS.md` (go/no-go), `../SETUP.md`.

Field key (per item): Name · Category · Description · Required · Sensitive · Default · Example ·
Used By · Environment(s) · Source · Owner · Validation Rule · Related Docs · Related ADR · Notes.

---

## Part A — Configuration items (full detail)

### A.1 Application Configuration

#### `NODE_ENV`
- **Category:** Application Configuration
- **Description:** Standard Node runtime mode; gates the DEV-only `MockPanchangProvider`.
- **Required:** No · **Sensitive:** No · **Default:** `development` (tool-set) · **Example:** `production`
- **Used By:** `apps/mobile/src/domain/panchang/MockPanchangProvider.dev.ts`
- **Environment(s):** Local, Development, CI, Staging, Production
- **Source:** Runtime/toolchain (never committed) · **Owner:** Platform
- **Validation:** enum `development | test | production`
- **Related Docs:** ENVIRONMENT_VARIABLES.md §4 · **Related ADR:** — · **Notes:** production build must never expose the mock provider.

### A.2 Mobile Configuration (Expo, public)

#### `EXPO_PUBLIC_SUPABASE_URL`
- **Category:** Mobile Configuration · **Description:** Supabase project URL the app calls.
- **Required:** Yes · **Sensitive:** No (public) · **Default:** — · **Example:** `https://YOUR_PROJECT.supabase.co`
- **Used By:** `app.config.ts` (`extra.supabaseUrl`), `src/data/supabaseClient.ts`
- **Environment(s):** Local, Development, Staging, Production (baked at build)
- **Source:** EAS build env / `apps/mobile/.env` · **Owner:** Platform
- **Validation:** URL, `^https://.+\.supabase\.co$` (or `http://localhost:54321` local)
- **Related Docs:** ENVIRONMENT_VARIABLES.md §1, SETUP.md §4 · **Related ADR:** ADR-030 · **Notes:** public by design; RLS is the boundary.

#### `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Category:** Mobile Configuration · **Description:** Public anon key for client Supabase auth.
- **Required:** Yes · **Sensitive:** No (public, rotate on abuse) · **Default:** — · **Example:** `eyJhbGciOi...` (JWT)
- **Used By:** `app.config.ts`, `src/data/supabaseClient.ts`
- **Environment(s):** Local, Development, Staging, Production (build)
- **Source:** EAS build env / `apps/mobile/.env` · **Owner:** Platform
- **Validation:** JWT, `^eyJ[A-Za-z0-9_-]+\.` · **Related Docs:** ENVIRONMENT_VARIABLES.md §1 · **Related ADR:** ADR-018 · **Notes:** access is RLS-guarded.

#### `EXPO_PUBLIC_REVENUECAT_KEY`
- **Category:** Mobile Configuration / RevenueCat · **Description:** RevenueCat public SDK key (subscriptions, F-4).
- **Required:** No (until billing on) · **Sensitive:** No (public SDK key) · **Default:** — · **Example:** `appl_XXXX` / `goog_XXXX`
- **Used By:** `app.config.ts` (`extra.revenueCatKey`)
- **Environment(s):** Local (opt), Development, Staging, Production (build)
- **Source:** EAS build env / `apps/mobile/.env` · **Owner:** Platform
- **Validation:** string prefix `appl_`/`goog_` · **Related Docs:** ENVIRONMENT_VARIABLES.md §1 · **Related ADR:** ADR-011 (provider adapters) · **Notes:** safe on device by design.

#### `EXPO_PUBLIC_SENTRY_DSN`
- **Category:** Mobile Configuration / Monitoring · **Description:** Sentry DSN for crash/error reporting.
- **Required:** No · **Sensitive:** No (DSN is publishable) · **Default:** — · **Example:** `https://KEY@oXXX.ingest.sentry.io/XXX`
- **Used By:** `app.config.ts` (`extra.sentryDsn`)
- **Environment(s):** Development (opt), Staging, Production (build)
- **Source:** EAS build env / `apps/mobile/.env` · **Owner:** Platform
- **Validation:** URL, `^https://.+@.+\.ingest\.sentry\.io/.+$` · **Related Docs:** ENVIRONMENT_VARIABLES.md §1 · **Related ADR:** — · **Notes:** monitoring config; safe to embed.

#### Expo static config — `app.name`, `slug`, `scheme`, `version`, `newArchEnabled`
- **Category:** Mobile Configuration / Expo · **Description:** App identity + deep-link scheme + RN new architecture flag.
- **Required:** Yes (identity) · **Sensitive:** No · **Defaults:** `name=PanchangPal`, `slug=panchangpal`, `scheme=panchangpal`, `version=0.1.0`, `newArchEnabled=true`
- **Used By:** `apps/mobile/app.config.ts` · **Environment(s):** all builds · **Source:** committed `app.config.ts` · **Owner:** Mobile
- **Validation:** `scheme` matches deep links `panchangpal://...`; `version` semver · **Related Docs:** SETUP.md §6, TDD Part 4 §3.3 · **Related ADR:** — · **Notes:** `scheme` drives FLOW D4 invite/notification deep links; changing it breaks links.

### A.3 Backend Configuration (Edge Functions — server secrets)

#### `SUPABASE_URL`
- **Category:** Backend Configuration / Supabase · **Description:** Project URL for server-side supabase-js.
- **Required:** **Yes** (validated at boot) · **Sensitive:** No · **Default:** — · **Example:** `https://YOUR_PROJECT.supabase.co`
- **Used By:** `apps/backend/functions/_shared/env.ts` → all functions
- **Environment(s):** Local(fn), Development, Staging, Production · **Source:** Supabase Edge secret / platform-provided · **Owner:** Platform
- **Validation:** URL · **Related Docs:** ENVIRONMENT_VARIABLES.md §2 · **Related ADR:** ADR-030 · **Notes:** required by `readEnv`.

#### `SUPABASE_ANON_KEY`
- **Category:** Backend Configuration / Supabase · **Description:** Anon key for user-scoped server calls.
- **Required:** **Yes** · **Sensitive:** No (public) · **Default:** — · **Example:** `eyJhbGciOi...`
- **Used By:** `_shared/env.ts` · **Environment(s):** Local(fn), Development, Staging, Production · **Source:** Supabase Edge secret · **Owner:** Platform
- **Validation:** JWT · **Related Docs:** ENVIRONMENT_VARIABLES.md §2 · **Related ADR:** ADR-018 · **Notes:** RLS boundary.

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Category:** Backend Configuration / Supabase / Security · **Description:** Service-role key; **bypasses RLS**, full DB access.
- **Required:** **Yes** · **Sensitive:** **Yes (critical)** · **Default:** — · **Example:** `eyJhbGciOi...` (service_role JWT)
- **Used By:** `_shared/env.ts`, `_shared/supabase.ts` · **Environment(s):** Local(fn), Development, Staging, Production (**never client/CI**) · **Source:** Supabase Edge secret (`supabase secrets set`) · **Owner:** Platform
- **Validation:** JWT with `role=service_role` · **Related Docs:** SECRETS_MATRIX.md · **Related ADR:** ADR-030, ADR-018 · **Notes:** most sensitive value in the system; rotate on any suspicion.

#### `OPENAI_API_KEY`
- **Category:** AI / OpenAI · **Description:** OpenAI key for RAG generation + embeddings.
- **Required:** No at shared layer; **required** for `ask-guru`/`content-ingest` · **Sensitive:** **Yes (critical)** · **Default:** `''` (empty) · **Example:** `sk-proj-XXXX`
- **Used By:** `_shared/env.ts` → `ask-guru`, `content-ingest`; `packages/ai/src/openai.ts` (as `apiKey`) · **Environment(s):** Local(fn, opt), Development, Staging, Production · **Source:** Supabase Edge secret · **Owner:** AI
- **Validation:** `^sk-` prefix, non-empty when the function runs · **Related Docs:** ENVIRONMENT_VARIABLES.md §2 · **Related ADR:** ADR-011 · **Notes:** empty ⇒ AI functions decline; billable + abuse risk on leak.

#### `REVENUECAT_WEBHOOK_SECRET`
- **Category:** RevenueCat / Backend / Security · **Description:** Verifies inbound RevenueCat webhooks (F-4).
- **Required:** No at shared layer; **required** for `revenuecat-webhook` · **Sensitive:** **Yes** · **Default:** `''` · **Example:** high-entropy random string
- **Used By:** `_shared/env.ts` → `revenuecat-webhook` · **Environment(s):** Development, Staging, Production · **Source:** Supabase Edge secret · **Owner:** Platform
- **Validation:** non-empty, ≥ 24 chars · **Related Docs:** SECRETS_MATRIX.md · **Related ADR:** ADR-011 · **Notes:** leak allows forged entitlement events.

### A.4 CI/CD, Supabase-ops, Deployment (GitHub secrets)

#### `SUPABASE_ACCESS_TOKEN`
- **Category:** Supabase / GitHub Actions / Deployment · **Description:** Supabase **CLI** auth for function deploys.
- **Required:** Yes (CD deploy-functions/prod) · **Sensitive:** **Yes (critical)** · **Default:** — · **Example:** `sbp_XXXX`
- **Used By:** `.github/workflows/cd.yml`, Supabase CLI · **Environment(s):** CI (Staging, Production jobs) · **Source:** GitHub Repository Secret · **Owner:** Platform
- **Validation:** `^sbp_` · **Related Docs:** SECRETS_MATRIX.md · **Related ADR:** ADR-024 · **Notes:** account-level CLI power.

#### `SUPABASE_STAGING_DB_URL`
- **Category:** Supabase / Deployment · **Description:** Staging Postgres connection string for migrations.
- **Required:** Yes (CD migrate-staging) · **Sensitive:** **Yes (critical)** · **Default:** — · **Example:** `postgresql://USER:PASSWORD@HOST:5432/postgres`
- **Used By:** `scripts/migrate.sh`, `.github/workflows/cd.yml`, `scripts/preflight.sh` · **Environment(s):** CI → Staging · **Source:** GitHub Environment Secret (`staging`) · **Owner:** Platform
- **Validation:** `^postgres(ql)?://` connection string · **Related Docs:** SECRETS_MATRIX.md · **Related ADR:** ADR-018 · **Notes:** contains a DB password; scope to `staging`.

#### `SUPABASE_STAGING_REF`
- **Category:** Supabase / Deployment · **Description:** Staging project ref for function deploy.
- **Required:** Yes (CD deploy-functions) · **Sensitive:** No (identifier) · **Default:** — · **Example:** `abcdstagingref`
- **Used By:** `.github/workflows/cd.yml`, `scripts/preflight.sh` · **Environment(s):** CI → Staging · **Source:** GitHub Environment Secret (`staging`) (or Variable) · **Owner:** Platform
- **Validation:** `^[a-z0-9]{20}$`-ish project ref · **Related Docs:** SECRETS_MATRIX.md · **Related ADR:** ADR-024 · **Notes:** not truly secret; kept with siblings.

#### `SUPABASE_PROD_DB_URL`
- **Category:** Supabase / Deployment / Security · **Description:** Production Postgres connection string for migrations.
- **Required:** Yes (CD promote-production) · **Sensitive:** **Yes (critical)** · **Default:** — · **Example:** `postgresql://USER:PASSWORD@HOST:5432/postgres`
- **Used By:** `.github/workflows/cd.yml` (promote-production), `scripts/preflight.sh` · **Environment(s):** CI → Production · **Source:** GitHub Environment Secret (`production`) · **Owner:** Platform
- **Validation:** `^postgres(ql)?://` · **Related Docs:** SECRETS_MATRIX.md · **Related ADR:** ADR-018 · **Notes:** never exposed to staging jobs; behind manual approval.

#### `EXPO_ACCESS_TOKEN`
- **Category:** Expo / EAS / Deployment · **Description:** Expo/EAS auth for build, submit, OTA.
- **Required:** Yes (CD eas-build/prod, OTA) · **Sensitive:** **Yes** · **Default:** — · **Example:** `<expo token>`
- **Used By:** `.github/workflows/cd.yml`, `.github/workflows/ota.yml`, `scripts/preflight.sh` · **Environment(s):** CI (Staging, Production) · **Source:** GitHub Repository Secret · **Owner:** Platform
- **Validation:** non-empty token · **Related Docs:** SECRETS_MATRIX.md · **Related ADR:** ADR-024 · **Notes:** grants publish rights to the Expo account.

### A.5 Testing / operational

#### `DATABASE_URL`
- **Category:** Testing / Backend · **Description:** Target DB for `migrate.sh` + pgTAP suites.
- **Required:** Local + CI db-tests · **Sensitive:** Yes if pointed at a real DB · **Default:** — · **Example:** `postgresql://postgres:postgres@localhost:5432/postgres`
- **Used By:** `scripts/migrate.sh` (arg), `.github/workflows/ci.yml` (db-tests env) · **Environment(s):** Local, CI · **Source:** CI job env / local shell · **Owner:** Platform
- **Validation:** `^postgres(ql)?://` · **Related Docs:** SETUP.md §11 · **Related ADR:** DEC-022 · **Notes:** CI uses an ephemeral local Postgres.

#### `POSTGRES_PASSWORD` (CI service)
- **Category:** Testing · **Description:** Password for the ephemeral CI Postgres service container.
- **Required:** CI only · **Sensitive:** No (ephemeral) · **Default:** `postgres` · **Example:** `postgres`
- **Used By:** `.github/workflows/ci.yml` (services.postgres) · **Environment(s):** CI · **Source:** literal in workflow · **Owner:** Platform
- **Validation:** any · **Related Docs:** GITHUB_ACTIONS_AUDIT.md · **Related ADR:** — · **Notes:** not a real secret; container is discarded.

#### `PORT`
- **Category:** Build Configuration / Tooling · **Description:** Port for the local Command Center static server.
- **Required:** No · **Sensitive:** No · **Default:** script default (`4173` suggested) · **Example:** `4173`
- **Used By:** `scripts/command-center/serve.mjs` · **Environment(s):** Local · **Source:** local shell · **Owner:** Platform
- **Validation:** integer 1–65535 · **Related Docs:** SETUP.md §10 · **Related ADR:** — · **Notes:** observability tool, not product runtime.

### A.6 Build Configuration (toolchain)

#### `NODE_VERSION` / `PNPM_VERSION` (workflow env) · `engines.node` · `packageManager`
- **Category:** Build Configuration / GitHub Actions · **Description:** Pinned toolchain versions.
- **Required:** Yes · **Sensitive:** No · **Defaults:** `NODE_VERSION=20.11.0`, `PNPM_VERSION=9.6.0`, `engines.node>=20.11.0`, `packageManager=pnpm@9.6.0`
- **Used By:** `.github/workflows/ci.yml` (`env`), root `package.json` · **Environment(s):** CI, Local · **Source:** committed · **Owner:** Platform
- **Validation:** semver; CI jobs must reference `${{ env.* }}` (see finding CI-3, fixed) · **Related Docs:** GITHUB_ACTIONS_AUDIT.md · **Related ADR:** ADR-024 · **Notes:** single source of truth for versions.

#### `turbo` tasks (`build`, `typecheck`, `lint`, `test`)
- **Category:** Build Configuration · **Description:** Turborepo task graph + outputs/deps.
- **Required:** Yes · **Sensitive:** No · **Default:** as in `turbo.json` · **Example:** `build → dependsOn ^build, outputs dist/**`
- **Used By:** `turbo.json`, root `package.json` scripts · **Environment(s):** CI, Local · **Source:** committed · **Owner:** Platform
- **Validation:** valid `turbo.json` schema · **Related Docs:** SETUP.md · **Related ADR:** — · **Notes:** `globalDependencies: tsconfig.base.json`.

### A.7 Supabase project config (`supabase/config.toml`)

#### `project_id`, `db.major_version`, `db.seed.sql_paths`, `db.migrations.schema_paths`
- **Category:** Supabase / Build Configuration · **Description:** Supabase CLI project config.
- **Required:** Yes · **Sensitive:** No · **Defaults:** `project_id=panchangpal`, `db.major_version=15`, `db.seed.sql_paths=["../apps/backend/seed/seed.sql"]`, `db.migrations.schema_paths=[]`
- **Used By:** Supabase CLI (`supabase start/db reset`) · **Environment(s):** Local, CI · **Source:** committed `supabase/config.toml` · **Owner:** Platform
- **Validation:** valid TOML; paths exist · **Related Docs:** SETUP.md §5 · **Related ADR:** DEC-022 (migrations under `apps/backend/migrations/`) · **Notes:** migrations intentionally kept out of the CLI default dir.

### A.8 Deno / Edge runtime config (`apps/backend/deno.json`)
- **Category:** Backend Configuration · **Description:** Deno import map + compiler/lint/fmt for Edge Functions.
- **Required:** Yes · **Sensitive:** No · **Default:** as in `deno.json` (`strict`, `lib: deno.window`, lineWidth 100)
- **Used By:** Supabase Edge Functions (Deno) · **Environment(s):** Local(fn), Deploy · **Source:** committed · **Owner:** Backend
- **Validation:** valid JSON; import specifiers resolve · **Related Docs:** SETUP.md · **Related ADR:** — · **Notes:** `*.logic.ts` avoid Deno globals so Vitest can run them (TDD Part 1 §3 #17).

### A.9 Notifications config (`packages/shared/src/enums.ts` + PDD §8)
- **Category:** Notifications · **Description:** Channels, types, and quiet-hours default.
- **Required:** Yes · **Sensitive:** No · **Defaults:** `NOTIF_CHANNELS = daily|festival|personal|household|growth|lifecycle`; `NOTIF_TYPES = morning|festival|evening|streak|household|personal|household_invite|subscription|winback`; **quiet hours 21:00–07:00 local** (assumption P4-A2)
- **Used By:** notification scheduler/prefs; `user_profile.notif_prefs` jsonb default `{}` · **Environment(s):** all · **Source:** committed enums + PDD · **Owner:** Product/Platform
- **Validation:** channel/type ∈ enum; quiet-hours `HH:MM` local · **Related Docs:** PDD §8.0/§8.10 · **Related ADR:** — · **Notes:** per-category toggles stored server-side in `notif_prefs`.

### A.10 Feature Flags (`packages/shared/src/enums.ts`, `FEATURE_FLAGS`)
- **Category:** Feature Flags · **Description:** Post-v1 flags (FF_*), default **off**.
- **Required:** No · **Sensitive:** No · **Default:** off · **Examples:** `FF_GREETING_CARD`, `FF_JAIN_MODE`, `FF_FAMILY_PLAN`, `FF_LIFECYCLE_EMAIL`
- **Used By:** `packages/shared` (`FeatureFlag` type); consumed by feature gates · **Environment(s):** all (flag store) · **Source:** committed enum · **Owner:** Product
- **Validation:** flag ∈ `FEATURE_FLAGS` · **Related Docs:** TDD Part 1 §7.3 · **Related ADR:** ADR-021 · **Notes:** enumerated now; runtime flag store lands post-v1.

### A.11 Fixed constants (NOT environment variables — recorded to prevent misuse)
- `OPENAI_BASE = https://api.openai.com/v1` — hardcoded const in `packages/ai/src/openai.ts`. Category: AI/OpenAI. Not env; do not externalize without an ADR.
- `SUPABASE_FUNCTIONS_URL` — appears only in a **code comment** in `ProductionGuruTransport.ts`. Not a variable; the transport receives its `url` as config derived from the Supabase URL.

### A.12 Deliberately ABSENT (searched, not present — do not invent)
- **Apple:** `APPLE_*` / ASC API key/issuer — none. Store signing/submission is **EAS-managed** (EAS credentials + App Store Connect). Category placeholder retained for future.
- **Google:** `GOOGLE_*` / Play service-account JSON — none. EAS-managed + Play Console.
- **EAS:** no `eas.json`; only `EXPO_ACCESS_TOKEN` exists. `STRIPE_*` — not used (payments = RevenueCat).

---

## Part B — Dependency Matrix

Downstream chains for the critical items (what breaks if the item is missing/wrong):

```
SUPABASE_STAGING_DB_URL
  ↓ scripts/migrate.sh (psql applies apps/backend/migrations/)
  ↓ .github/workflows/cd.yml (migrate-staging job)
  ↓ Edge Functions run against the migrated schema
  ↓ CI/CD staging deploy
  ↓ Deployment (staging release)

SUPABASE_ACCESS_TOKEN
  ↓ Supabase CLI auth
  ↓ cd.yml deploy-functions (supabase functions deploy)
  ↓ Edge Functions (SVC_*) live on staging/prod
  ↓ Ask Guru / panchang / sync / billing endpoints

SUPABASE_SERVICE_ROLE_KEY
  ↓ _shared/env.ts (readEnv, boot)
  ↓ _shared/supabase.ts (service client)
  ↓ every Edge Function privileged path
  ↓ Backend runtime

OPENAI_API_KEY
  ↓ _shared/env.ts
  ↓ packages/ai OpenAiClient (apiKey)
  ↓ ask-guru (RAG generation) + content-ingest (embeddings)
  ↓ Live Ask Guru (gated GURU_LIVE)

EXPO_ACCESS_TOKEN
  ↓ EAS CLI auth
  ↓ cd.yml eas-build / promote-production + ota.yml
  ↓ App binary (TestFlight/Play) + OTA updates
  ↓ Store distribution

EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY
  ↓ app.config.ts (extra) → expo-constants
  ↓ src/data/supabaseClient.ts
  ↓ all mobile server calls (TanStack Query hooks)
  ↓ App functionality

REVENUECAT_WEBHOOK_SECRET
  ↓ _shared/env.ts → revenuecat-webhook
  ↓ entitlement events verified
  ↓ subscription state (F-4)
```

---

## Part C — Environment Matrix

✔ = needed in that environment · ✘ = not used · (b) = build-time public · (opt) = optional.

| Variable | Local | Development | CI | Staging | Production |
|---|---|---|---|---|---|
| `NODE_ENV` | ✔ | ✔ | ✔ | ✔ | ✔ |
| `EXPO_PUBLIC_SUPABASE_URL` | ✔(b) | ✔(b) | ✔(b) | ✔(b) | ✔(b) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✔(b) | ✔(b) | ✔(b) | ✔(b) | ✔(b) |
| `EXPO_PUBLIC_REVENUECAT_KEY` | opt | ✔(b) | ✘ | ✔(b) | ✔(b) |
| `EXPO_PUBLIC_SENTRY_DSN` | opt | ✔(b) | ✘ | ✔(b) | ✔(b) |
| `SUPABASE_URL` | ✔(fn) | ✔ | ✘ | ✔ | ✔ |
| `SUPABASE_ANON_KEY` | ✔(fn) | ✔ | ✘ | ✔ | ✔ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✔(fn) | ✔ | ✘ | ✔ | ✔ |
| `OPENAI_API_KEY` | opt | ✔ | ✘ | ✔ | ✔ |
| `REVENUECAT_WEBHOOK_SECRET` | opt | ✔ | ✘ | ✔ | ✔ |
| `SUPABASE_ACCESS_TOKEN` | ✘ | ✘ | ✔ | ✔ | ✔ |
| `SUPABASE_STAGING_DB_URL` | ✘ | ✘ | ✔ | ✔ | ✘ |
| `SUPABASE_STAGING_REF` | ✘ | ✘ | ✔ | ✔ | ✘ |
| `SUPABASE_PROD_DB_URL` | ✘ | ✘ | ✔ | ✘ | ✔ |
| `EXPO_ACCESS_TOKEN` | ✘ | ✘ | ✔ | ✔ | ✔ |
| `DATABASE_URL` | ✔ | opt | ✔ | ✘ | ✘ |
| `NODE_VERSION` / `PNPM_VERSION` | ✔ | ✔ | ✔ | ✔ | ✔ |

> Note: `SUPABASE_URL`/`ANON_KEY`/`SERVICE_ROLE_KEY` are marked ✘ for **CI** because the test job
> uses an ephemeral local Postgres and does not call the hosted Supabase API. They are ✔ wherever
> Edge Functions actually run.

---

## Part D — Secret Ownership Matrix

| Variable | Owner | Rotation Required | Rotation Frequency | Storage Location | Backup Strategy |
|---|---|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Platform | Yes | 90d or on suspicion | Supabase Edge secret | Regenerate from Supabase dashboard (source of truth) |
| `OPENAI_API_KEY` | AI | Yes | 90d or on spike | Supabase Edge secret | Reissue in OpenAI dashboard |
| `REVENUECAT_WEBHOOK_SECRET` | Platform | Yes | 180d or on leak | Supabase Edge secret | Rotate in RevenueCat + update webhook |
| `SUPABASE_ACCESS_TOKEN` | Platform | Yes | 90d / offboarding | GitHub Repository Secret | Reissue via Supabase account |
| `EXPO_ACCESS_TOKEN` | Platform | Yes | 90d / offboarding | GitHub Repository Secret | Reissue via Expo account |
| `SUPABASE_STAGING_DB_URL` | Platform | Yes | On DB password rotation | GitHub Env Secret (`staging`) | Rotate DB password; update secret |
| `SUPABASE_PROD_DB_URL` | Platform | Yes | On DB password rotation | GitHub Env Secret (`production`) | Rotate DB password; update secret |
| `SUPABASE_STAGING_REF` | Platform | No | — | GitHub Env Secret / Variable | Re-read from Supabase project |
| `EXPO_PUBLIC_*` (4) | Platform | On abuse only | — | EAS build env / `apps/mobile/.env` | Re-derive from provider dashboards |
| `DATABASE_URL` (real) | Platform | With DB rotation | — | CI job env / local | Not stored; derived |

---

## Part E — Validation Matrix

| Variable | Type | Allowed / Regex | Required | Fallback | Validation error |
|---|---|---|---|---|---|
| `NODE_ENV` | enum | `development\|test\|production` | No | `development` | "NODE_ENV must be development, test, or production" |
| `EXPO_PUBLIC_SUPABASE_URL` | URL | `^https://.+\.supabase\.co$` or `http://localhost:54321` | Yes | none | "must be a Supabase https URL" |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | JWT | `^eyJ[A-Za-z0-9_-]+\.` | Yes | none | "must be a JWT anon key" |
| `EXPO_PUBLIC_REVENUECAT_KEY` | string | `^(appl_\|goog_).+` | No | none (billing off) | "must be a RevenueCat public SDK key" |
| `EXPO_PUBLIC_SENTRY_DSN` | URL | `^https://.+@.+ingest\.sentry\.io/.+$` | No | none (reporting off) | "must be a valid Sentry DSN" |
| `SUPABASE_URL` | URL | `^https://.+\.supabase\.co$` | Yes | none (boot fails) | readEnv: "Missing required server env: SUPABASE_URL" |
| `SUPABASE_ANON_KEY` | JWT | `^eyJ` | Yes | none | readEnv missing-env throw |
| `SUPABASE_SERVICE_ROLE_KEY` | JWT | `^eyJ` (role=service_role) | Yes | none | readEnv missing-env throw |
| `OPENAI_API_KEY` | secret | `^sk-` | Cond. | `''` → function declines | function-level "OpenAI not configured" |
| `REVENUECAT_WEBHOOK_SECRET` | secret | length ≥ 24 | Cond. | `''` → webhook rejects | "webhook secret not configured" |
| `SUPABASE_ACCESS_TOKEN` | token | `^sbp_` | Yes (deploy) | none | preflight: "Missing required config: SUPABASE_ACCESS_TOKEN" |
| `SUPABASE_STAGING_DB_URL` | conn str | `^postgres(ql)?://` | Yes (deploy) | none | preflight fail-fast |
| `SUPABASE_PROD_DB_URL` | conn str | `^postgres(ql)?://` | Yes (prod) | none | preflight fail-fast |
| `SUPABASE_STAGING_REF` | id | `^[a-z0-9]{16,}$` | Yes (deploy) | none | preflight fail-fast |
| `EXPO_ACCESS_TOKEN` | token | non-empty | Yes (build/OTA) | none | preflight fail-fast |
| `DATABASE_URL` | conn str | `^postgres(ql)?://` | Yes (migrate) | none | migrate.sh usage error |
| `NODE_VERSION`/`PNPM_VERSION` | semver | `^\d+\.\d+\.\d+$` | Yes | pinned | n/a (pinned in repo) |

> Today `scripts/preflight.sh` validates **presence** (fail-fast). The **format** regexes above are
> the target for a future `--strict` preflight mode; documenting them here makes the contract explicit.

---

## Part F — Configuration Lifecycle

| Variable | Created By | Consumed By | Updated By | Deployment Dependency | Removal Criteria |
|---|---|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_*` | Platform (project setup) | mobile app | Platform on project change | required for app build | remove if Supabase is replaced |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project | Edge Functions | Platform on rotation | required for backend runtime | never (core) |
| `OPENAI_API_KEY` | AI (OpenAI acct) | ask-guru, content-ingest | AI on rotation | required for live AI | remove if AI provider changes (ADR-011) |
| `REVENUECAT_WEBHOOK_SECRET` | Platform (RC dashboard) | revenuecat-webhook | Platform on rotation | required for billing | remove if RevenueCat dropped |
| `SUPABASE_ACCESS_TOKEN` | Platform (Supabase acct) | CD | Platform on rotation | required for function deploy | remove if deploy method changes |
| `SUPABASE_{STAGING,PROD}_DB_URL` | Platform (project) | migrate.sh, CD | Platform on DB rotation | required for migrations | remove if managed-migrations adopted |
| `SUPABASE_STAGING_REF` | Platform | CD | Platform | required for function deploy | remove with staging retirement |
| `EXPO_ACCESS_TOKEN` | Platform (Expo acct) | CD, OTA | Platform on rotation | required for build/OTA | remove if EAS dropped |
| `EXPO_PUBLIC_REVENUECAT_KEY` | Platform | mobile app | Platform | required once billing ships | remove if billing dropped |
| `EXPO_PUBLIC_SENTRY_DSN` | Platform (Sentry) | mobile app | Platform | optional | remove if monitoring changes |
| Feature flags `FF_*` | Product (enum) | feature gates | Product | none | remove when feature GA or cut |
| `NODE_VERSION`/`PNPM_VERSION` | Platform | CI/local | Platform on upgrade | required for CI | update, not remove |

---

## Part G — Configuration Health Report

Scan date 2026-07-12. Counts cover sanctioned configuration items in this registry.

| Metric | Value |
|---|---|
| **Total configuration items** | **40** (20 env/ops variables + 20 structural/config/flags) |
| Environment variables (env/secret/ops) | 20 |
| Secrets (Sensitive = Yes) | 7 critical/high: `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `REVENUECAT_WEBHOOK_SECRET`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_STAGING_DB_URL`, `SUPABASE_PROD_DB_URL`, `EXPO_ACCESS_TOKEN` (+ `DATABASE_URL` conditionally) |
| Public / non-secret variables | 13 (4 `EXPO_PUBLIC_*`, `SUPABASE_URL/ANON_KEY`, `SUPABASE_STAGING_REF`, `NODE_ENV`, `PORT`, `NODE_VERSION`, `PNPM_VERSION`, `POSTGRES_PASSWORD`, `DATABASE_URL` local) |
| Feature flags | 4 (`FF_*`, default off) |
| **Unused variables** | **0** — every inventoried variable has a cited usage site |
| **Duplicate variables** | **0 true duplicates.** Prior drift: CI version pins were hardcoded per-job vs `env.NODE_VERSION`/`PNPM_VERSION` — **fixed** in Phase 8 |
| **Missing documentation** | **0** — all items documented here + in ENVIRONMENT_VARIABLES.md / SECRETS_MATRIX.md |
| **Missing validation** | Presence validation exists (`preflight.sh`); **format** validation (Part E regexes) is not yet enforced — 1 gap |
| **Potential security risks** | (1) `SERVICE_ROLE_KEY`/`PROD_DB_URL` are critical — must stay env-scoped, never client/CI-wide; (2) DB URLs embed passwords; (3) gitleaks in CI is the committed-secret backstop |
| **Configuration drift** | Low. Resolved: `.gitignore` ignoring templates (fixed); env-name `prod`/`production` (aligned); CI version-pin duplication (fixed). Remaining: live projects/`eas.json` not yet provisioned (tracked in DEPLOYMENT_READINESS.md) |
| **Overall Configuration Health Score** | **88 / 100 — Good** |

**Score rationale.** Strong: complete inventory, zero unused/undocumented items, secrets classified
+ owned, presence-validation enforced, templates committable. Deductions: format-level validation
not yet enforced at runtime (−6); several consumers still scaffolded pending provisioning (−4);
store-credential path (Apple/Google via EAS) not yet configured (−2).

**Top actions to raise the score:**
1. Add a `preflight.sh --strict` mode enforcing the Part E regexes (→ +6).
2. Provision live Supabase/EAS + configure the `production` approval gate (→ +4, unblocks real deploy).
3. Wire EAS store credentials when `eas.json` lands (→ +2).

---

## Change control

Any change to configuration (add/rename/remove a variable, flag, or config key) MUST:
1. Update this registry (item block + all five matrices + lifecycle).
2. Update `ENVIRONMENT_VARIABLES.md`, `SECRETS_MATRIX.md`, and the relevant `.env.*.example`.
3. Add presence (and ideally format) checks to `scripts/preflight.sh`.
4. Reference the driving ADR if the change alters architecture or provider choice.

This document is the canonical reference for developers, DevOps, CI/CD, and AI assistants.
