-- Every plan gets a daily Waddle AI limit: Free, Pro and Max each pass their own (the tutor Edge Function
-- holds the numbers); 'team' counts as Max. The one-argument use_ai_message stays until the new tutor is
-- deployed, so the live function keeps working in between.
create or replace function public.use_ai_message(free_limit int, pro_limit int, max_limit int) returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  user_plan text;
  day_limit int;
  used int;
begin
  if uid is null then
    return json_build_object('ok', false, 'plan', 'free', 'used', 0, 'limit', free_limit);
  end if;
  user_plan := current_plan();
  day_limit := case user_plan when 'free' then free_limit when 'pro' then pro_limit else max_limit end;
  -- One statement, so two messages sent at once cannot both slip past the limit.
  insert into ai_usage (user_id, day, count) values (uid, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update set count = ai_usage.count + 1
    where ai_usage.count < day_limit
  returning count into used;
  if used is null then
    return json_build_object('ok', false, 'plan', user_plan, 'used', day_limit, 'limit', day_limit);
  end if;
  return json_build_object('ok', true, 'plan', user_plan, 'used', used, 'limit', day_limit);
end
$$;

revoke all on function public.use_ai_message(int, int, int) from public, anon;
grant execute on function public.use_ai_message(int, int, int) to authenticated;
