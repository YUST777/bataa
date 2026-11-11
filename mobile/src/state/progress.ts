import { useEffect, useState } from 'react'
import { lessons, units } from '@/data/course'
import type { Lang } from '@/types'

export type Experience = 'new' | 'some' | 'built'

export interface Progress {
  lang: Lang
  onboarded: boolean
  experience: Experience
  /** Lessons per day the learner chose. */
  goal: 1 | 2 | 3
  /** Completed lesson ids. */
  done: string[]
  xp: number
  /** Local ISO date -> lessons or reviews finished that day. Streaks derive from this. */
  daily: Record<string, number>
  sound: boolean
}

const KEY = 'bataa.mobile.v2'
const FRESH: Progress = { lang: 'en', onboarded: false, experience: 'new', goal: 1, done: [], xp: 0, daily: {}, sound: true }

export const isoDay = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Consecutive active days ending today, or yesterday if today has not been done yet. */
export function streak(daily: Record<string, number>, now = new Date()): number {
  const d = new Date(now)
  if (!daily[isoDay(d)]) d.setDate(d.getDate() - 1)
  let n = 0
  while (daily[isoDay(d)]) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

/** A lesson opens after the one before it. Experienced learners may start any unit. */
export function unlocked(p: Pick<Progress, 'done' | 'experience'>, lessonId: string): boolean {
  const i = lessons.findIndex((l) => l.id === lessonId)
  if (i <= 0 || p.done.includes(lessonId) || p.done.includes(lessons[i - 1].id)) return i >= 0
  return p.experience === 'built' && units.some((u) => u.lessons[0].id === lessonId)
}

/** Stored data is untrusted: every field is checked and falls back to a fresh value. */
export function parse(raw: string | null): Progress {
  try {
    const v = JSON.parse(raw ?? 'null')
    if (!v || typeof v !== 'object') return FRESH
    const known = new Set(lessons.map((l) => l.id))
    const daily: Record<string, number> = {}
    if (v.daily && typeof v.daily === 'object')
      for (const [day, n] of Object.entries(v.daily))
        if (/^\d{4}-\d{2}-\d{2}$/.test(day) && typeof n === 'number' && n > 0) daily[day] = Math.floor(n)
    return {
      lang: v.lang === 'ar' ? 'ar' : 'en',
      onboarded: v.onboarded === true,
      experience: v.experience === 'some' || v.experience === 'built' ? v.experience : 'new',
      goal: v.goal === 2 || v.goal === 3 ? v.goal : 1,
      done: Array.isArray(v.done) ? [...new Set<string>(v.done)].filter((id) => known.has(id)) : [],
      xp: typeof v.xp === 'number' && v.xp > 0 ? Math.floor(v.xp) : 0,
      daily,
      sound: v.sound !== false,
    }
  } catch {
    return FRESH
  }
}

/** XP for finishing: a first completion pays in full, a repeat or review pays a little. */
export function reward(p: Progress, lessonId: string | undefined, perfect: boolean): number {
  return !lessonId || p.done.includes(lessonId) ? 5 : 20 + (perfect ? 5 : 0)
}

export function useProgress() {
  const [p, setP] = useState<Progress>(() => parse(localStorage.getItem(KEY)))

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      // Storage can be full or blocked; the session still works in memory.
    }
  }, [p])

  return {
    p,
    set: (patch: Partial<Progress>) => setP((cur) => ({ ...cur, ...patch })),
    /** Records a finished lesson (or a review when `lessonId` is undefined). Returns XP earned. */
    complete(lessonId: string | undefined, perfect: boolean): number {
      const gain = reward(p, lessonId, perfect)
      const day = isoDay()
      setP((cur) => ({
        ...cur,
        xp: cur.xp + gain,
        done: lessonId && !cur.done.includes(lessonId) ? [...cur.done, lessonId] : cur.done,
        daily: { ...cur.daily, [day]: (cur.daily[day] ?? 0) + 1 },
      }))
      return gain
    },
    reset: () => setP((cur) => ({ ...FRESH, lang: cur.lang })),
  }
}
