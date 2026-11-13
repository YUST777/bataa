/**
 * Plans: Free and Pro. The plan lives in Supabase (`subscriptions`, written only by the server) and is read
 * through the current_plan() function; signed out means Free. What each plan unlocks:
 * - Free: the first unit and FREE_DAILY Bataa AI messages a day (the tutor function enforces the limit).
 * - Pro: every unit and unlimited Bataa AI.
 * See supabase/migrations/20261113120000_plans.sql.
 */
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/account'
import { units } from '@/data/course'

export type Plan = 'free' | 'pro'
export type Period = 'monthly' | 'yearly'

/** Keep in step with FREE_DAILY in supabase/functions/tutor. */
export const FREE_DAILY = 10
/** Units open on the Free plan. */
export const FREE_UNITS = ['html']

/** Pro prices in US dollars. Yearly is 20% off twelve months. */
export const PRICE: Record<Period, number> = { monthly: 4.99, yearly: 47.99 }

/** Each plan's art: an egg on a lily pad for Free, the crowned duck for Pro. */
export const PLAN_ART: Record<Plan, string> = { free: '/plans/free.webp', pro: '/plans/pro.webp' }

/** True when a lesson's unit is closed on this plan. */
export const proOnly = (plan: Plan, lessonId: string) => plan === 'free' && !units.some((u) => FREE_UNITS.includes(u.id) && u.lessons.some((l) => l.id === lessonId))

/** The signed-in learner's plan (Free when signed out or offline), refreshed on sign-in and on `refresh`. */
export function usePlan(session: Session | null) {
  const [plan, setPlan] = useState<Plan>('free')
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!supabase || !session) return setPlan('free')
    let live = true
    // The database also allows 'team'; the app sells Pro only, so any paid plan counts as Pro.
    supabase.rpc('current_plan').then(({ data }) => live && setPlan(data === 'free' || !data ? 'free' : 'pro'))
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
