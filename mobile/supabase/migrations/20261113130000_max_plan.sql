-- Bataa Max: a third plan above Pro (more Bataa AI). Like Pro it has no daily AI limit in use_ai_message,
-- which only limits 'free'. 'team' stays allowed for rows that may already use it.
alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions add constraint subscriptions_plan_check check (plan in ('free', 'pro', 'max', 'team'));
