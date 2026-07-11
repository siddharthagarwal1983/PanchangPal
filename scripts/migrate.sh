#!/usr/bin/env bash
# migrate.sh — apply PanchangPal migrations in lexical order (TDD Part 2 §6.1;
# DEC-022). Migrations live in apps/backend/migrations/ (not the Supabase CLI default),
# so CI applies them explicitly. Forward-only; RLS ships with each table.
#
# Usage: scripts/migrate.sh "postgresql://user:pass@host:5432/db"
set -euo pipefail

DB_URL="${1:?Usage: migrate.sh <DATABASE_URL>}"
MIGRATIONS_DIR="$(cd "$(dirname "$0")/.." && pwd)/apps/backend/migrations"

echo "Applying migrations from ${MIGRATIONS_DIR} → ${DB_URL%%\?*}"
for f in "${MIGRATIONS_DIR}"/*.sql; do
  echo "  → $(basename "$f")"
  psql "${DB_URL}" -v ON_ERROR_STOP=1 -f "$f"
done
echo "Migrations applied."
