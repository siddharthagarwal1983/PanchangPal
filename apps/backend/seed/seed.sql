-- =============================================================================
-- seed.sql
-- PanchangPal — seed data (dev/staging)
-- Source: TDD Part 2 §6.2. Seeds the tradition set (F-9), feature-flag defaults
-- (all post-v1 FF_* OFF), and a representative festival/ritual/checklist row per
-- structure. Reviewer-approved festival/ritual CONTENT and the RAG corpus
-- (content_item/content_chunk) are loaded by SVC_content_ingest (TDD Part 3),
-- NOT raw-seeded here.
-- =============================================================================

-- ---- Traditions (F-9 bundled set) -------------------------------------------
insert into tradition (code, name, description, is_active) values
  ('generic',             'Generic',              'Pan-Indian default tradition.', true),
  ('north_indian',        'North Indian',         'North Indian regional variant.', true),
  ('south_indian_tamil',  'South Indian (Tamil)', 'Tamil regional variant.', true),
  ('bengali',             'Bengali',              'Bengali regional variant.', true)
on conflict (code) do nothing;

-- ---- Feature flags (all post-v1 FF_* default OFF; §7.3 / ADR-021) -----------
insert into feature_flag (key, enabled) values
  ('FF_GREETING_CARD',  false),
  ('FF_JAIN_MODE',      false),
  ('FF_FAMILY_PLAN',    false),
  ('FF_LIFECYCLE_EMAIL',false)
on conflict (key) do nothing;

-- ---- Representative ritual + festival (structure only; content is reviewer-owned)
insert into ritual (slug, tradition_code, title, intro, steps, depth) values
  ('daily-generic', 'generic', 'Daily Practice',
   'A calm daily observance.',
   '[{"text":"Light a lamp","audio_key":null,"duration":60}]'::jsonb,
   'quick')
on conflict (slug) do nothing;

insert into festival (slug, tradition_code, name, significance, depth_quick, ritual_id)
select 'sample-festival', 'generic', 'Sample Festival',
       'Placeholder significance (reviewer content to follow).',
       'Quick description.',
       r.id
from ritual r where r.slug = 'daily-generic'
on conflict (slug) do nothing;

-- ---- Representative checklist items (curated 3–5/day) ------------------------
-- Names its conflict target, like every other insert here. A BARE `on conflict do
-- nothing` suppresses nothing unless a constraint exists to conflict with: this table
-- had only a uuid primary key, so seven CD runs produced seven copies of every row.
-- The supporting unique index is added by 20260719000100_checklist_item_unique.sql.
insert into checklist_item (tradition_code, label, "order", type) values
  ('generic', 'Light the lamp', 1, 'ritual'),
  ('generic', 'Offer water',    2, 'ritual'),
  ('generic', 'Moment of stillness', 3, 'reflection')
on conflict (tradition_code, label) do nothing;
