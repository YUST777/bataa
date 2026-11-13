-- Bataa AI chats, kept with the account so they follow the learner to any phone. One row per chat; the
-- app keeps the newest 30 and at most 40 messages each. Learners can only see and change their own.
create table if not exists public.chats (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null check (char_length(id) <= 64),
  title text not null default '' check (char_length(title) <= 120),
  -- When the chat last changed, in ms since epoch (the app's clock), so the newer copy wins a merge.
  at bigint not null,
  messages jsonb not null default '[]'::jsonb check (jsonb_typeof(messages) = 'array' and octet_length(messages::text) <= 300000),
  primary key (user_id, id)
);
alter table public.chats enable row level security;
drop policy if exists "chats: read own" on public.chats;
drop policy if exists "chats: add own" on public.chats;
drop policy if exists "chats: change own" on public.chats;
drop policy if exists "chats: delete own" on public.chats;
create policy "chats: read own" on public.chats for select to authenticated using (auth.uid() = user_id);
create policy "chats: add own" on public.chats for insert to authenticated with check (auth.uid() = user_id);
create policy "chats: change own" on public.chats for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chats: delete own" on public.chats for delete to authenticated using (auth.uid() = user_id);
