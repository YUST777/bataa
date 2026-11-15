/**
 * Plans: Free and Pro. The plan lives in Supabase (`subscriptions`, written only by the server) and is read
 * through the current_plan() function; signed out means Free. What each plan unlocks:
 * - Free: the first unit and DAILY.free Waddle AI messages a day. Every plan has a daily AI limit (DAILY),
 *   which the tutor function enforces.
 * - Pro (199 EGP a month): the desktop and mobile apps, every unit and Waddle AI.
 * - Max (499 EGP a month): everything in Pro with more Waddle AI.
 * See supabase/migrations/20261113120000_plans.sql.
 */
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/account'
import { units } from '@/data/course'

export type Plan = 'free' | 'pro' | 'max'
export type Period = 'monthly' | 'yearly'

/** Waddle AI messages a day on each plan. Keep in step with DAILY in supabase/functions/tutor. */
export const DAILY: Record<Plan, number> = { free: 10, pro: 100, max: 300 }
/** Units open on the Free plan. */
export const FREE_UNITS = ['html']

/** Paid plans' prices in Egyptian pounds. Yearly is about 20% off twelve months. */
export const CURRENCY = 'EGP'
export const PRICE: Record<Exclude<Plan, 'free'>, Record<Period, number>> = { pro: { monthly: 199, yearly: 1910 }, max: { monthly: 499, yearly: 4790 } }

/** Each plan's art: an egg on a lily pad for Free, the crowned duck for Pro, a clutch of eggs for Max. */
export const PLAN_ART: Record<Plan, string> = { free: '/plans/free.webp', pro: '/plans/pro.webp', max: '/plans/team.webp' }

/** True when a lesson's unit is closed on this plan. */
export const proOnly = (plan: Plan, lessonId: string) => plan === 'free' && !units.some((u) => FREE_UNITS.includes(u.id) && u.lessons.some((l) => l.id === lessonId))

/** The signed-in learner's plan (Free when signed out or offline), refreshed on sign-in and on `refresh`. */
export function usePlan(session: Session | null) {
  const [plan, setPlan] = useState<Plan>('free')
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!supabase || !session) return setPlan('free')
    let live = true
    // The database also allows 'team', which the app does not sell: it counts as Pro.
    supabase.rpc('current_plan').then(({ data }) => live && setPlan(data === 'max' ? 'max' : data === 'free' || !data ? 'free' : 'pro'))
    return () => {
      live = false
    }
  }, [session?.user.id, tick])
  return { plan, refresh: () => setTick((n) => n + 1) }
}

/** Waddle AI messages used today (UTC day, like the server). */
export async function aiUsedToday(): Promise<number> {
  if (!supabase) return 0
  const day = new Date().toISOString().slice(0, 10)
  const { data } = await supabase.from('ai_usage').select('count').eq('day', day).maybeSingle()
  return data?.count ?? 0
}
