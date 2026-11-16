import { useEffect, useState } from 'react'
import { lessons, units } from '@/data/course'
import type { Lang } from '@/types'
import { freshPond, lessonEggs, parsePond, type Pond } from '@/state/pond'

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
  /** Display name, at most NAME_MAX characters. Empty until the learner sets one. */
  name: string
  /** Profile photo as a small JPEG data URL (see Profile), or empty. */
  photo: string
  /** Local ISO date the learner started, or empty if unknown. */
  joined: string
  /** Badges earned on this device: when, in what order (1st, 2nd...), and a serial unique to this copy. */
  badges: Record<string, Earned>
  /** The Duck Pond mini-game (see pond.ts). */
  pond: Pond
}

export interface Earned {
  at: string
  no: number
  serial: string
}

/** A serial like WDL-8F3A-C21B, random per earned badge. Badges earned before the rename keep their BTA- serial. */
export function newSerial(): string {
  const hex = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  return `WDL-${hex.slice(0, 4)}-${hex.slice(4)}`
}

export const NAME_MAX = 30
// A 256px JPEG is about 20 KB; the cap keeps a bad value from filling storage.
const PHOTO_MAX = 200_000

// The old name stays in the storage keys so learners keep their saved progress.
const KEY = 'bataa.mobile.v2'
const FRESH: Progress = { lang: 'en', onboarded: false, experience: 'new', goal: 1, done: [], xp: 0, daily: {}, sound: true, name: '', photo: '', joined: '', badges: {}, pond: freshPond() }

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
      name: typeof v.name === 'string' ? v.name.trim().slice(0, NAME_MAX) : '',
      photo: typeof v.photo === 'string' && v.photo.startsWith('data:image/') && v.photo.length <= PHOTO_MAX ? v.photo : '',
      // Older saves have no join date: the first active day is the best guess.
      joined: typeof v.joined === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.joined) ? v.joined : (Object.keys(daily).sort()[0] ?? ''),
      badges: Object.fromEntries(
        Object.entries(v.badges && typeof v.badges === 'object' ? v.badges : {}).filter(
          ([, e]: [string, any]) =>
            e && /^\d{4}-\d{2}-\d{2}$/.test(e.at) && Number.isInteger(e.no) && e.no > 0 && /^(WDL|BTA)-[0-9A-F]{4}-[0-9A-F]{4}$/.test(e.serial),
        ),
      ) as Record<string, Earned>,
      pond: parsePond(v.pond),
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
    /** Replaces the whole save, e.g. with the cloud copy after signing in on a new device. */
    load: (next: Progress) => setP(next),
    /** Records a finished lesson (or a review when `lessonId` is undefined). Returns XP earned. */
    complete(lessonId: string | undefined, perfect: boolean): number {
      const gain = reward(p, lessonId, perfect)
      const day = isoDay()
      setP((cur) => ({
        ...cur,
        xp: cur.xp + gain,
        pond: { ...cur.pond, eggs: cur.pond.eggs + lessonEggs(perfect) },
        done: lessonId && !cur.done.includes(lessonId) ? [...cur.done, lessonId] : cur.done,
        daily: { ...cur.daily, [day]: (cur.daily[day] ?? 0) + 1 },
      }))
      return gain
    },
    // Resetting clears learning progress, not who the learner is.
    reset: () => setP((cur) => ({ ...FRESH, lang: cur.lang, name: cur.name, photo: cur.photo, joined: cur.joined })),
  }
}
