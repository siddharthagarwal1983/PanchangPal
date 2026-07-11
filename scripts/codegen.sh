#!/usr/bin/env bash
# codegen.sh — regenerate typed contracts + DB types from the source docs/schema.
#   1. packages/database/src/generated.ts  ← supabase gen types (from apps/backend/migrations)
#   2. packages/api contracts              ← docs/api/openapi.yaml (F-8 backend-owned)
# Run in CI (and locally) after schema or OpenAPI changes so the workspace stays in
# lockstep (TDD Part 1 §1.3 "contracts before code"; ADR-014).
set -euo pipefail

echo "[codegen] DB types → packages/database/src/generated.ts"
echo "  supabase gen types typescript --local > packages/database/src/generated.ts"

echo "[codegen] API contracts ← docs/api/openapi.yaml"
echo "  (openapi-zod-client / orval) → packages/api/src/contracts/"

echo "[codegen] done (wire the generators with the toolchain install)."
