-- =============================================================================
-- 20260712000050_ai.sql
-- PanchangPal — Ask Guru (TBL_CONVERSATION, TBL_MESSAGE, TBL_MESSAGE_SOURCE)
-- Source: TDD Part 2 §3.12, §4. Owner-only (private). No cross-session memory:
-- retrieval never reads other conversations (AI Non-Goal, ADR-031).
-- =============================================================================

-- ---- TBL_CONVERSATION --------------------------------------------------------
create table if not exists conversation (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references app_user(id) on delete cascade,
  title      text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);
create index if not exists idx_conversation_user_updated on conversation(user_id, updated_at desc);
drop trigger if exists trg_conversation_updated_at on conversation;
create trigger trg_conversation_updated_at
  before update on conversation for each row execute function set_updated_at();

-- ---- TBL_MESSAGE -------------------------------------------------------------
create table if not exists message (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversation(id) on delete cascade,
  role            message_role not null,
  content         text null,
  outcome         message_outcome null,
  first_token_ms  int null,
  error_code      text null,                        -- ERR_* (packages/shared), feeds AI analytics §9.9
  created_at      timestamptz not null default now()
);
create index if not exists idx_message_conversation on message(conversation_id, created_at);

-- ---- TBL_MESSAGE_SOURCE (citations per assistant message; EVT_031) ----------
create table if not exists message_source (
  id               uuid primary key default gen_random_uuid(),
  message_id       uuid not null references message(id) on delete cascade,
  content_chunk_id uuid null references content_chunk(id),
  title            text null,
  score            real null
);
create index if not exists idx_message_source_message on message_source(message_id);

-- ---- RLS: owner-only across the conversation graph --------------------------
alter table conversation enable row level security;
alter table message enable row level security;
alter table message_source enable row level security;

drop policy if exists conversation_sel_own on conversation;
create policy conversation_sel_own on conversation for select using (user_id = auth.uid());
drop policy if exists conversation_ins_own on conversation;
create policy conversation_ins_own on conversation for insert with check (user_id = auth.uid());
drop policy if exists conversation_upd_own on conversation;
create policy conversation_upd_own on conversation for update using (user_id = auth.uid());
drop policy if exists conversation_del_own on conversation;
create policy conversation_del_own on conversation for delete using (user_id = auth.uid());

-- Messages/sources are scoped through their owning conversation.
drop policy if exists message_sel_own on message;
create policy message_sel_own on message
  for select using (exists (
    select 1 from conversation c where c.id = message.conversation_id and c.user_id = auth.uid()
  ));
drop policy if exists message_ins_own on message;
create policy message_ins_own on message
  for insert with check (exists (
    select 1 from conversation c where c.id = message.conversation_id and c.user_id = auth.uid()
  ));

drop policy if exists message_source_sel_own on message_source;
create policy message_source_sel_own on message_source
  for select using (exists (
    select 1 from message m
    join conversation c on c.id = m.conversation_id
    where m.id = message_source.message_id and c.user_id = auth.uid()
  ));
