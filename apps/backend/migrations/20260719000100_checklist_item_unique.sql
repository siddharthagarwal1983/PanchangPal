-- =============================================================================
-- checklist_item — make the seed genuinely idempotent.
--
-- CD seeds staging on every merge to main. seed.sql ends its checklist insert with
-- a bare `on conflict do nothing`, which — unlike its siblings, which name a target
-- (`on conflict (code)`, `(key)`, `(slug)`) — suppresses nothing here: checklist_item
-- carried only a uuid primary key, so there was no constraint for a row to conflict
-- WITH. Every deploy therefore inserted a fresh copy.
--
-- Seven CD runs later, staging held 21 rows for 3 items, and SCR_HOME_001 rendered
-- "Light the lamp" five times (the list is ordered by "order" and truncated, so the
-- duplicates of the first item filled it entirely).
--
-- Two parts, and the order matters: the duplicates must go before a unique index can
-- be built over them.
-- =============================================================================

-- Keep the earliest row of each (tradition_code, label) pair. `is not distinct from`
-- rather than `=` so rows with a NULL tradition_code are compared as equal — plain `=`
-- yields NULL for those and would leave them duplicated.
delete from checklist_item a
using checklist_item b
where a.id > b.id
  and a.tradition_code is not distinct from b.tradition_code
  and a.label = b.label;

-- `nulls not distinct` (Postgres 15+) so a NULL tradition_code cannot be re-duplicated
-- either; by default Postgres treats NULLs as distinct and would allow repeats.
create unique index if not exists uq_checklist_item_tradition_label
  on checklist_item (tradition_code, label) nulls not distinct;
