# scripts — dev / ops scripts

Operational scripts referenced by TDD Part 1 §4. Added as the toolchain lands; each is
a thin wrapper, not business logic.

- `migrate` — apply `apps/backend/migrations/` to a target DB (CI + local).
- `seed` — load `apps/backend/seed/seed.sql`.
- `ingest-content` — run the RAG content-ingestion CLI (`SVC_content_ingest`, TDD Part 3).
- `codegen` — regenerate `packages/database` types (`supabase gen types`) and
  `packages/api` contracts from `docs/api/openapi.yaml`.

Placeholder directory — scripts are implemented alongside CI/CD.
