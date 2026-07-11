# Migrations moved

PanchangPal migrations now live at **`apps/backend/migrations/`** and seed at
**`apps/backend/seed/seed.sql`**, per the authoritative repo layout in
TDD Part 1 §4 and TDD Part 2 §6.1 (decision recorded 2026-07-12; see
`docs/database/README.md` and Decision Log DEC-022).

This directory is intentionally empty. Supabase CLI configuration lives at
`supabase/config.toml`; CI applies the migrations from `apps/backend/migrations`.
