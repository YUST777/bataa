-- Waddle plans: Free, Pro and Team. A learner can read their own plan; only the server (service role, e.g. a
-- payment webhook) writes it, so nobody can make themselves Pro from the app. No row means Free.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  period text check (period in ('monthly', 'yearly')),
  -- When the paid period ends; past this date the learner is back on Free.
  renews_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
drop policy if exists "subscriptions: read own" on public.subscriptions;
create policy "subscriptions: read own" on public.subscriptions for select to authenticated using (auth.uid() = user_id);

-- Waddle AI messages per learner per day (UTC), for the Free plan's daily limit.
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  count int not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
drop policy if exists "ai_usage: read own" on public.ai_usage;
create policy "ai_usage: read own" on public.ai_usage for select to authenticated using (auth.uid() = user_id);

-- The caller's plan right now: a paid plan whose period has ended counts as Free. The app calls it to know
-- what to unlock; it only ever answers for the signed-in learner.
create or replace function public.current_plan() returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select s.plan from subscriptions s where s.user_id = auth.uid() and (s.renews_at is null or s.renews_at > now())), 'free')
$$;

-- Called by the tutor Edge Function (with the learner's token) before each Waddle AI reply. Counts the
-- message and says whether it is allowed: Free stops at `free_limit` a day, paid plans never do.
-- One statement, so two messages sent at once cannot both slip past the limit.
create or replace function public.use_ai_message(free_limit int) returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  user_plan text;
  used int;
begin
  if uid is null then
    return json_build_object('ok', false, 'plan', 'free', 'used', 0, 'limit', free_limit);
  end if;
  user_plan := current_plan();
  insert into ai_usage (user_id, day, count) values (uid, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update set count = ai_usage.count + 1
    where user_plan <> 'free' or ai_usage.count < free_limit
  returning count into used;
  if used is null then
    return json_build_object('ok', false, 'plan', user_plan, 'used', free_limit, 'limit', free_limit);
  end if;
  return json_build_object('ok', true, 'plan', user_plan, 'used', used, 'limit', case when user_plan = 'free' then free_limit end);
end
$$;

revoke all on function public.current_plan() from public, anon;
revoke all on function public.use_ai_message(int) from public, anon;
grant execute on function public.current_plan() to authenticated;
grant execute on function public.use_ai_message(int) to authenticated;
