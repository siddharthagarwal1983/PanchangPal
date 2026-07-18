#!/usr/bin/env bash
# =============================================================================
# provision-dev-env.sh — create the `dev` Supabase project and place its secrets.
#
# TDD Part 5 §1.1 mandates three isolated environments (dev / staging / prod), each a
# separate Supabase project with no shared databases. Only staging exists today, which is
# why `scripts/preflight.sh dev` has never been exercised against real credentials.
#
# WHY A SCRIPT: the database password is generated here and piped straight into GitHub
# secrets. It is never printed, never written to disk, and never passes through a
# clipboard. On 2026-07-18 a staging DB password was pasted into a file by hand and had to
# be rotated; this removes that step entirely.
#
#   Prerequisites (both interactive, both yours to run):
#     supabase login          # or export SUPABASE_ACCESS_TOKEN
#     gh auth status          # needs `repo` scope, which you have
#
#   Usage:
#     scripts/provision-dev-env.sh <org-id> [region]
#
#   Find the org id with:  supabase orgs list
#   Region should normally match staging so latency comparisons mean something.
#
# COST: Supabase's free plan allows 2 active projects per organization. If staging and
# prod already exist, creating dev exceeds it and moves the org to a paid plan. Check
# `supabase projects list` before running.
# =============================================================================
set -euo pipefail

ORG_ID="${1:?Usage: provision-dev-env.sh <org-id> [region]   (find it with: supabase orgs list)}"
REGION="${2:-ap-south-1}"
PROJECT_NAME="panchangpal-dev"
REPO="siddharthagarwal1983/PanchangPal"

command -v supabase >/dev/null || { echo "supabase CLI not found: brew install supabase/tap/supabase"; exit 1; }
command -v gh        >/dev/null || { echo "gh CLI not found"; exit 1; }

supabase projects list >/dev/null 2>&1 || {
  echo "Not authenticated. Run 'supabase login' (interactive) or export SUPABASE_ACCESS_TOKEN."
  exit 1
}

echo "Existing projects (check free-tier headroom before continuing):"
supabase projects list
echo
read -r -p "Create '${PROJECT_NAME}' in ${REGION}? [y/N] " reply
[[ "${reply:-}" == "y" || "${reply:-}" == "Y" ]] || { echo "Aborted."; exit 0; }

# Generated locally, never echoed. If you ever need it again, rotate rather than recover:
# Supabase dashboard -> Settings -> Database -> Reset database password.
DB_PASSWORD="$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32)"

echo "Creating project…"
CREATE_OUT="$(supabase projects create "${PROJECT_NAME}" \
  --org-id "${ORG_ID}" \
  --region "${REGION}" \
  --db-password "${DB_PASSWORD}" 2>&1)"

# The ref is a public identifier, not a secret — safe to show.
PROJECT_REF="$(printf '%s' "${CREATE_OUT}" | grep -oE '[a-z]{20}' | head -1)"
[[ -n "${PROJECT_REF}" ]] || { printf '%s\n' "${CREATE_OUT}"; echo "Could not determine the project ref."; exit 1; }
echo "Created: ${PROJECT_REF}"

# Direct connection string. If migrations later fail to connect (Supabase is moving new
# projects to IPv6-only direct connections), replace this secret with the SESSION POOLER
# URI from Settings -> Database — the same shape staging uses.
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo "Placing secrets (values are piped, never printed)…"
printf '%s' "${DB_URL}"      | gh secret set SUPABASE_DEV_DB_URL --repo "${REPO}"
printf '%s' "${PROJECT_REF}" | gh secret set SUPABASE_DEV_REF    --repo "${REPO}"

unset DB_PASSWORD DB_URL

cat <<EOF

Done. SUPABASE_DEV_DB_URL and SUPABASE_DEV_REF are set on ${REPO}.

The password was generated, used, and discarded — it exists only inside the GitHub secret.
To change it: Supabase dashboard -> Settings -> Database -> Reset database password, then
re-set SUPABASE_DEV_DB_URL.

Next:
  1. Enable anonymous sign-ins: Authentication -> Sign In / Providers.
     The app bootstraps an anonymous session before any screen renders (UX-2 / ADR-009),
     so it cannot start without this. Staging needed the same change.
  2. Apply migrations + seed against the new project.
  3. Verify the environment: scripts/preflight.sh dev
EOF
