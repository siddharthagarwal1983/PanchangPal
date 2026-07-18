#!/usr/bin/env bash
# =============================================================================
# resolve-db-url.sh — print a Postgres URL that is actually reachable from here.
#
# Supabase gives new projects an IPv6-ONLY direct endpoint (db.<ref>.supabase.co).
# GitHub-hosted runners are IPv4-only, so migrating the dev project failed with:
#
#   connection to server at "db.<ref>.supabase.co" (2406:da1a:...) port 5432 failed:
#   Network is unreachable
#
# The session pooler is IPv4-reachable. Its hostname includes a region and an instance
# prefix that vary per project (staging is aws-1-ap-south-1, others are aws-0-...), and no
# CLI command exposes the right one — so candidates are tried until one authenticates.
#
# WHY THIS EXISTS RATHER THAN A HAND-EDITED SECRET: the URL contains a database password.
# Deriving it here means the password stays inside the CI secret and is never fetched,
# pasted, or read by a human. A staging password was leaked exactly that way on
# 2026-07-18 and had to be rotated.
#
#   Usage:  DB_URL="$(scripts/resolve-db-url.sh "$SOME_DB_URL" [region])"
#
# Prints the working URL on stdout and NOTHING else — the caller must mask it before it
# can reach a log (in Actions: `echo "::add-mask::$DB_URL"` immediately after capture).
# Diagnostics go to stderr, and never include the URL.
# =============================================================================
set -uo pipefail

INPUT_URL="${1:?Usage: resolve-db-url.sh <postgres-url> [region]}"
REGION="${2:-ap-south-1}"

try_connect() { psql "$1" -tAc 'select 1' >/dev/null 2>&1; }

# The supplied URL first: staging's pooler URL already works and must pass through
# untouched, and a direct URL is correct anywhere with IPv6.
if try_connect "$INPUT_URL"; then
  echo >&2 "resolve-db-url: supplied URL is reachable"
  printf '%s' "$INPUT_URL"
  exit 0
fi
echo >&2 "resolve-db-url: supplied URL unreachable — trying session pooler hosts"

# Only a direct URL can be rewritten; anything else has already had its chance above.
if [[ ! "$INPUT_URL" =~ ^postgresql://([^:]+):([^@]+)@db\.([a-z0-9]+)\.supabase\.co:([0-9]+)/(.+)$ ]]; then
  echo >&2 "resolve-db-url: not a direct db.<ref>.supabase.co URL — cannot derive a pooler form."
  exit 1
fi
PASSWORD="${BASH_REMATCH[2]}"
REF="${BASH_REMATCH[3]}"
DBNAME="${BASH_REMATCH[5]}"

# Pooler auth uses a tenant-qualified username: postgres.<project-ref>.
for prefix in aws-0 aws-1; do
  CANDIDATE="postgresql://postgres.${REF}:${PASSWORD}@${prefix}-${REGION}.pooler.supabase.com:5432/${DBNAME}"
  if try_connect "$CANDIDATE"; then
    echo >&2 "resolve-db-url: connected via ${prefix}-${REGION}.pooler.supabase.com"
    printf '%s' "$CANDIDATE"
    exit 0
  fi
  echo >&2 "resolve-db-url: ${prefix}-${REGION} did not accept the connection"
done

echo >&2 "resolve-db-url: no reachable endpoint found. Check the region, or copy the session pooler URI from Supabase → Settings → Database and update the secret."
exit 1
