import { lessons } from '@/data/course'
import { ui } from '@/i18n'
import { streak, type Progress } from '@/state/progress'
import type { L } from '@/types'

/** A badge image from public/badges. `earned: false` greys it out so the set still reads as a collection. */
export function Badge({ id, earned = true, size = 64 }: { id: string; earned?: boolean; size?: number }) {
  return (
    <img
      src={`/badges/${id}.webp`}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={earned ? 'shrink-0 select-none' : 'shrink-0 select-none grayscale opacity-45'}
    />
  )
}

export interface Award {
  id: string
  label: L
  earned: boolean
}

/** Every badge the course offers, each derived from real progress. */
export function awards(p: Progress): Award[] {
  const days = streak(p.daily)
  return [
    ...lessons.map((l): Award => ({ id: l.id, label: l.title, earned: p.done.includes(l.id) })),
    ...[1, 3, 7].map((n): Award => ({ id: `streak-${n}`, label: { en: `${n}-day streak`, ar: `سلسلة ${n} أيام` }, earned: days >= n })),
    ...[50, 100].map((n): Award => ({ id: `xp-${n}`, label: { en: `${n} ${ui.xp.en}`, ar: `${n} ${ui.xp.ar}` }, earned: p.xp >= n })),
    { id: 'course', label: { en: 'Course complete', ar: 'أكملت المسار' }, earned: p.done.length === lessons.length },
  ]
}
