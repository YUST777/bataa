import { useState } from 'react'
import { lessons } from '@/data/course'
import { ui } from '@/i18n'
import { streak, type Progress } from '@/state/progress'
import type { L } from '@/types'

/** A badge image from public/badges. `earned: false` greys it out so the set still reads as a collection. */
export function Badge({ id, earned = true, size = 64 }: { id: string; earned?: boolean; size?: number }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src={`/badges/${id}.webp`}
      alt=""
      width={size}
      height={size}
      draggable={false}
      onLoad={() => setLoaded(true)}
      className={`shrink-0 select-none ${earned ? '' : 'grayscale opacity-45'} ${loaded ? '' : 'skeleton rounded-full'}`}
    />
  )
}

export interface Award {
  id: string
  label: L
  /** How to earn it, in one sentence. */
  how: L
  /** Progress toward it: `have` out of `need`. */
  have: number
  need: number
  earned: boolean
}

const award = (id: string, label: L, how: L, have: number, need: number): Award => ({ id, label, how, have: Math.min(have, need), need, earned: have >= need })

/** Every badge the course offers, each derived from real progress. */
export function awards(p: Progress): Award[] {
  const days = streak(p.daily)
  return [
    ...lessons.map((l) =>
      award(l.id, l.title, { en: `Finish the lesson “${l.title.en}”.`, ar: `أكمل درس «${l.title.ar}».` }, p.done.includes(l.id) ? 1 : 0, 1),
    ),
    ...[1, 3, 7].map((n) =>
      award(`streak-${n}`, { en: `${n}-day streak`, ar: `سلسلة ${n} أيام` }, n === 1 ? { en: 'Finish a lesson today.', ar: 'أكمل درسًا اليوم.' } : { en: `Finish a lesson ${n} days in a row.`, ar: `أكمل درسًا ${n} أيام متتالية.` }, days, n),
    ),
    ...[50, 100].map((n) =>
      award(`xp-${n}`, { en: `${n} ${ui.xp.en}`, ar: `${n} ${ui.xp.ar}` }, { en: `Earn ${n} XP from lessons and reviews.`, ar: `اجمع ${n} نقطة من الدروس والمراجعات.` }, p.xp, n),
    ),
    award('course', { en: 'Course complete', ar: 'أكملت المسار' }, { en: 'Finish every lesson in the course.', ar: 'أكمل كل دروس المسار.' }, p.done.length, lessons.length),
  ]
}
