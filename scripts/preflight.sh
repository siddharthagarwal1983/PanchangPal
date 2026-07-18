#!/usr/bin/env bash
# =============================================================================
# preflight.sh — deployment preflight validator (DevOps hardening, Phase 6).
#
# Fails FAST and LOUD when the configuration required to deploy is missing, so a
# broken deploy never starts. Run as the first step of every deploy job and
# locally before a manual promotion.
#
#   Usage:  scripts/preflight.sh <target>
#   target: dev | staging | production | ci | local
#
# `dev`/`staging`/`production` map to the three isolated Supabase projects in
# TDD Part 5 §1.1 (no shared databases; migrations promote dev→staging→prod).
# `local` is the fully-local stack (`supabase start`), not the shared dev project.
#
# It validates ONLY variables/tools this repository actually uses
# (see docs/devops/ENVIRONMENT_VARIABLES.md + SECRETS_MATRIX.md). It never
# prints secret VALUES — only whether each is present.
#
# Exit codes: 0 = ready; 1 = missing required config; 2 = bad usage.
# =============================================================================
set -uo pipefail

TARGET="${1:-}"
FAILURES=0
WARNINGS=0

# ---- pretty output (respects NO_COLOR / non-tty) ----------------------------
if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
  RED=$'\033[31m'; GRN=$'\033[32m'; YEL=$'\033[33m'; BLD=$'\033[1m'; DIM=$'\033[2m'; RST=$'\033[0m'
else
  RED=""; GRN=""; YEL=""; BLD=""; DIM=""; RST=""
fi
ok()   { printf "  %s✓%s %s\n" "$GRN" "$RST" "$1"; }
warn() { printf "  %s!%s %s\n" "$YEL" "$RST" "$1"; WARNINGS=$((WARNINGS+1)); }
fail() { printf "  %s✗%s %s\n" "$RED" "$RST" "$1"; FAILURES=$((FAILURES+1)); }
hdr()  { printf "\n%s%s%s\n" "$BLD" "$1" "$RST"; }

secret_help() {
  # $1 = var name, $2 = where it belongs
  printf "      %s→ add %s in: %s%s\n" "$DIM" "$1" "$2" "$RST"
}

require_var() { # name, where
  if [[ -n "${!1:-}" ]]; then ok "$1 is set"; else
    fail "Missing required config: $1"; secret_help "$1" "$2"; fi
}
optional_var() { # name, note
  if [[ -n "${!1:-}" ]]; then ok "$1 is set"; else warn "$1 not set — ${2}"; fi
}
check_tool() { # cmd, note
  if command -v "$1" >/dev/null 2>&1; then ok "$1 available ($( "$1" --version 2>/dev/null | head -1 ))"; else
    warn "$1 not found — ${2}"; fi
}

usage() {
  cat <<EOF
${BLD}PanchangPal preflight${RST}
Usage: scripts/preflight.sh <dev|staging|production|ci|local>

  dev          Validate config for the shared dev Supabase project (§1.1)
  staging      Validate config for the staging CD pipeline
  production   Validate config for the production promotion (go/no-go)
  ci           Validate CI test prerequisites
  local        Validate a fully-local run (supabase start) — not the dev project
EOF
}

case "$TARGET" in
  dev|staging|production|ci|local) ;;
  ""|-h|--help) usage; exit 2 ;;
  *) printf "%sUnknown target: %s%s\n" "$RED" "$TARGET" "$RST"; usage; exit 2 ;;
esac

GH_SECRETS="GitHub → Settings → Secrets and variables → Actions"
printf "%s=== PanchangPal deployment preflight: %s ===%s\n" "$BLD" "$TARGET" "$RST"

# -----------------------------------------------------------------------------
case "$TARGET" in
  dev)
    hdr "Toolchain (warn-only here)"
    check_tool psql "needed for scripts/migrate.sh"
    check_tool supabase "needed to deploy Edge Functions"

    # The dev project is the first link in the dev→staging→prod promotion chain
    # (§1.1), so it needs the same trio staging does. It is a real, separate
    # Supabase project — `local` covers the fully-local stack instead.
    hdr "Required secrets — dev"
    require_var SUPABASE_DEV_DB_URL   "$GH_SECRETS → Environment: dev"
    require_var SUPABASE_DEV_REF      "$GH_SECRETS → Environment: dev"
    require_var SUPABASE_ACCESS_TOKEN "$GH_SECRETS → Repository secrets"

    hdr "Edge Function runtime secrets (set on the dev Supabase project)"
    optional_var SUPABASE_SERVICE_ROLE_KEY "set via 'supabase secrets set' on the dev project"
    optional_var OPENAI_API_KEY            "ask-guru / content-ingest disabled without it"
    optional_var REVENUECAT_WEBHOOK_SECRET "RevenueCat SANDBOX secret for dev (§1.1)"
    ;;

  staging)
    hdr "Toolchain (installed by CD, warn-only here)"
    check_tool psql "needed for scripts/migrate.sh"
    check_tool supabase "needed to deploy Edge Functions"
    check_tool eas "needed for EAS build/submit"

    hdr "Required secrets — staging"
    require_var SUPABASE_STAGING_DB_URL "$GH_SECRETS → Environment: staging"
    require_var SUPABASE_STAGING_REF    "$GH_SECRETS → Environment: staging"
    require_var SUPABASE_ACCESS_TOKEN   "$GH_SECRETS → Repository secrets"
    require_var EXPO_ACCESS_TOKEN       "$GH_SECRETS → Repository secrets"

    hdr "Edge Function runtime secrets (set on the staging Supabase project)"
    optional_var SUPABASE_SERVICE_ROLE_KEY "set via 'supabase secrets set' on the staging project"
    optional_var OPENAI_API_KEY            "ask-guru / content-ingest disabled without it"
    optional_var REVENUECAT_WEBHOOK_SECRET "revenuecat-webhook cannot verify events without it"
    ;;

  production)
    hdr "Toolchain"
    check_tool psql "needed for scripts/migrate.sh"
    check_tool supabase "needed to deploy Edge Functions"
    check_tool eas "needed for EAS submit"

    hdr "Required secrets — production"
    require_var SUPABASE_PROD_DB_URL "$GH_SECRETS → Environment: production"
    # Symmetric with SUPABASE_STAGING_REF: `supabase functions deploy --project-ref`
    # needs a project ref, and production previously required only a DB URL — so a
    # promotion could pass preflight with no way to deploy Edge Functions at all.
    require_var SUPABASE_PROD_REF    "$GH_SECRETS → Environment: production"
    require_var SUPABASE_ACCESS_TOKEN "$GH_SECRETS → Repository secrets"
    require_var EXPO_ACCESS_TOKEN     "$GH_SECRETS → Repository secrets"

    # Production-only promotions. These are warnings for dev/staging, where a missing
    # key merely disables a feature, but in production the same absence ships a live
    # release with billing webhooks unverifiable (revenuecat-webhook cannot check
    # signatures) or Ask Guru dark. Fail the go/no-go instead.
    hdr "Production guardrails (required at this tier)"
    require_var REVENUECAT_WEBHOOK_SECRET "$GH_SECRETS → Environment: production"
    optional_var SUPABASE_SERVICE_ROLE_KEY "set on the PROD Supabase project"
    optional_var OPENAI_API_KEY            "live Ask Guru stays dark without it (GURU_LIVE gate)"
    printf "  %sReminder: production requires manual approval on the 'production' Environment.%s\n" "$DIM" "$RST"
    ;;

  ci)
    hdr "CI prerequisites"
    check_tool node "CI pins Node ${NODE_VERSION:-20.11.0}"
    check_tool pnpm "CI pins pnpm ${PNPM_VERSION:-9.6.0}"
    optional_var DATABASE_URL "db-tests uses an ephemeral local Postgres if unset"
    check_tool psql "db-tests apply migrations via scripts/migrate.sh"
    check_tool pg_prove "db-tests run pgTAP suites"
    ;;

  local)
    hdr "Local toolchain"
    check_tool node "install Node >= 20.11.0"
    check_tool pnpm "corepack enable && corepack prepare pnpm@9.6.0 --activate"
    check_tool supabase "brew install supabase/tap/supabase"
    check_tool psql "local migrations/tests"
    hdr "Local env (optional)"
    optional_var EXPO_PUBLIC_SUPABASE_URL "apps/mobile/.env — app cannot reach a backend without it"
    optional_var EXPO_PUBLIC_SUPABASE_ANON_KEY "apps/mobile/.env"
    optional_var OPENAI_API_KEY "only if running ask-guru/content-ingest locally"
    ;;
esac

# -----------------------------------------------------------------------------
hdr "Preflight summary"
printf "  failures: %s%d%s   warnings: %s%d%s\n" \
  "$([[ $FAILURES -gt 0 ]] && echo "$RED" || echo "$GRN")" "$FAILURES" "$RST" \
  "$([[ $WARNINGS -gt 0 ]] && echo "$YEL" || echo "$GRN")" "$WARNINGS" "$RST"

if [[ $FAILURES -gt 0 ]]; then
  printf "\n%s✗ Preflight FAILED — %d required item(s) missing. Stopping deployment.%s\n" "$RED" "$FAILURES" "$RST"
  printf "%sFix the items marked ✗ above, then re-run: scripts/preflight.sh %s%s\n" "$DIM" "$TARGET" "$RST"
  exit 1
fi
printf "\n%s✓ Preflight passed for '%s'.%s\n" "$GRN" "$TARGET" "$RST"
[[ $WARNINGS -gt 0 ]] && printf "%s  (%d warning(s) — optional items unset; see above.)%s\n" "$DIM" "$WARNINGS" "$RST"
exit 0
