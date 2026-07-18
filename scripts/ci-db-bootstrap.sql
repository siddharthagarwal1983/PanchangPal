-- =============================================================================
-- scripts/ci-db-bootstrap.sql
-- CI-ONLY emulation of the Supabase-managed environment (auth schema + roles) that
-- a bare Postgres container does NOT provide. This is applied ONLY to the ephemeral
-- CI Postgres service, before scripts/migrate.sh, so that:
--   • migrations' FKs to auth.users(id) resolve,
--   • migrations' GRANT ... TO anon / authenticated resolve,
--   • the RLS pgTAP suite can SET ROLE authenticated and read auth.uid() from the
--     JWT claim it sets via set_config('request.jwt.claims', {"sub": ...}).
--
-- NEVER run this against a real Supabase project — Supabase already provides the auth
-- schema, auth.users, auth.uid(), and the anon/authenticated/service_role roles. This
-- file exists purely to stand up an equivalent surface for local/CI Postgres.
-- Idempotent (safe to re-run).
-- =============================================================================

-- Supabase roles referenced by GRANTs and RLS policies. NOLOGIN (assumed via SET ROLE).
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
  END IF;
END
$$;

-- Let the CI superuser switch into these roles (the RLS suite does SET ROLE authenticated).
GRANT anon, authenticated, service_role TO CURRENT_USER;

-- Roles need schema access; Supabase grants these by default.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- auth schema + minimal auth.users mirror (the columns migrations FK to and the RLS
-- suite inserts: id, is_anonymous). Supabase's real auth.users is a superset.
CREATE SCHEMA IF NOT EXISTS auth;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS auth.users (
  id            uuid PRIMARY KEY,
  is_anonymous  boolean NOT NULL DEFAULT false
);
GRANT SELECT ON auth.users TO anon, authenticated, service_role;

-- auth.uid() exactly as Supabase defines it: the 'sub' claim of the request JWT, else NULL.
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
  LANGUAGE sql
  STABLE
  AS $$ SELECT nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid $$;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
