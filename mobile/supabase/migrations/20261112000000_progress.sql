-- Waddle mobile: each signed-in learner's progress (the same JSON the app keeps in local storage).
-- Run once in the Supabase SQL editor (or with `supabase db push`). Safe to run again.

create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row level security: a learner can only read and write their own row.
alter table public.progress enable row level security;

drop policy if exists "progress: read own" on public.progress;
create policy "progress: read own" on public.progress
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "progress: insert own" on public.progress;
create policy "progress: insert own" on public.progress
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "progress: update own" on public.progress;
create policy "progress: update own" on public.progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- A save is a few KB, plus a profile photo of about 20 KB; cap it so one row cannot grow without bound.
alter table public.progress drop constraint if exists progress_data_size;
alter table public.progress add constraint progress_data_size check (pg_column_size(data) < 400000);
