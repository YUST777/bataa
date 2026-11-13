/**
 * Plans: Free, Pro and Team. The plan lives in Supabase (`subscriptions`, written only by the server) and
 * is read through the current_plan() function; signed out means Free. What each plan unlocks:
 * - Free: the first unit and FREE_DAILY Bataa AI messages a day (the tutor function enforces the limit).
 * - Pro and Team: every unit and unlimited Bataa AI. Team adds classrooms (coming later).
 * See supabase/migrations/20261113120000_plans.sql.
 */
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/account'
import { units } from '@/data/course'
import type { L } from '@/types'

export type Plan = 'free' | 'pro' | 'team'
export type Period = 'monthly' | 'yearly'

/** Keep in step with FREE_DAILY in supabase/functions/tutor. */
export const FREE_DAILY = 10
/** Units open on the Free plan. */
export const FREE_UNITS = ['html']

/** Prices in US dollars. Yearly is 20% off twelve months. */
export const PRICES: Record<Exclude<Plan, 'free'>, Record<Period, number>> = {
  pro: { monthly: 4.99, yearly: 47.99 },
  team: { monthly: 9.99, yearly: 95.99 },
}

export const PLANS: { id: Plan; art: string; title: L; tagline: L; perks: { text: L; on: boolean }[] }[] = [
  {
    id: 'free',
    art: '/plans/free.webp',
    title: { en: 'Free', ar: 'مجاني' },
    tagline: { en: 'Start learning for free.', ar: 'ابدأ التعلّم مجانًا.' },
    perks: [
      { text: { en: 'HTML unit', ar: 'وحدة HTML' }, on: true },
      { text: { en: `${FREE_DAILY} AI messages a day`, ar: `${FREE_DAILY} رسائل ذكاء اصطناعي يوميًا` }, on: true },
      { text: { en: 'CSS unit', ar: 'وحدة CSS' }, on: false },
      { text: { en: 'Unlimited Bataa AI', ar: 'بطّة الذكية بلا حدود' }, on: false },
    ],
  },
  {
    id: 'pro',
    art: '/plans/pro.webp',
    title: { en: 'Pro', ar: 'برو' },
    tagline: { en: 'Unlock the full course.', ar: 'افتح الدورة كاملة.' },
    perks: [
      { text: { en: 'All lessons and units', ar: 'كل الدروس والوحدات' }, on: true },
      { text: { en: 'Unlimited Bataa AI', ar: 'بطّة الذكية بلا حدود' }, on: true },
      { text: { en: 'New lessons first', ar: 'الدروس الجديدة أولًا' }, on: true },
      { text: { en: 'Support Bataa', ar: 'ادعم بطّة' }, on: true },
    ],
  },
  {
    id: 'team',
    art: '/plans/team.webp',
    title: { en: 'Team', ar: 'فريق' },
    tagline: { en: 'Learn together.', ar: 'تعلّموا معًا.' },
    perks: [
      { text: { en: 'Everything in Pro', ar: 'كل ما في برو' }, on: true },
      { text: { en: 'Classrooms (soon)', ar: 'فصول دراسية (قريبًا)' }, on: true },
      { text: { en: 'Shared progress (soon)', ar: 'تقدّم مشترك (قريبًا)' }, on: true },
      { text: { en: 'Group challenges (soon)', ar: 'تحديات جماعية (قريبًا)' }, on: true },
    ],
  },
]

/** True when a lesson's unit is closed on this plan. */
export const proOnly = (plan: Plan, lessonId: string) => plan === 'free' && !units.some((u) => FREE_UNITS.includes(u.id) && u.lessons.some((l) => l.id === lessonId))

/** The signed-in learner's plan (Free when signed out or offline), refreshed on sign-in and on `refresh`. */
export function usePlan(session: Session | null) {
  const [plan, setPlan] = useState<Plan>('free')
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!supabase || !session) return setPlan('free')
    let live = true
    supabase.rpc('current_plan').then(({ data }) => live && setPlan(data === 'pro' || data === 'team' ? data : 'free'))
    return () => {
      live = false
    }
  }, [session?.user.id, tick])
  return { plan, refresh: () => setTick((n) => n + 1) }
}

/** Bataa AI messages used today (UTC day, like the server). */
export async function aiUsedToday(): Promise<number> {
  if (!supabase) return 0
  const day = new Date().toISOString().slice(0, 10)
  const { data } = await supabase.from('ai_usage').select('count').eq('day', day).maybeSingle()
  return data?.count ?? 0
}
