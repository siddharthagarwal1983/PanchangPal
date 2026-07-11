-- =============================================================================
-- 20260712000003_functions.sql
-- PanchangPal — shared trigger/utility functions
-- Source: TDD Part 2 §2.1/§2.2. Household RLS predicates
-- (current_household_id / is_household_member / is_household_owner) are defined
-- AFTER the household tables exist, in 20260712000020_household.sql.
-- =============================================================================

-- Generic updated_at maintenance (BEFORE UPDATE on every table with updated_at).
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create the app_user row on auth signup (TDD Part 2 §3.1 "Insert via trigger on auth signup").
-- is_anonymous is derived from the auth.users.is_anonymous flag where available.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_user (id, is_anonymous)
  values (new.id, coalesce(new.is_anonymous, false))
  on conflict (id) do nothing;
  return new;
end;
$$;
