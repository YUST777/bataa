import type { ReactNode } from 'react'
import { lessons, units } from '@/data/course'
import { ui } from '@/i18n'
import { streak, type Progress } from '@/state/progress'
import type { L } from '@/types'

const TONES = {
  orange: ['#FFC06A', '#F26B00', '#B94B00'],
  blue: ['#8AD2FF', '#1E86E5', '#125FAE'],
  green: ['#7CE3AE', '#1C9456', '#0F6B3B'],
  gold: ['#FFE98A', '#F5A300', '#B87400'],
  red: ['#FF9C8A', '#E5483B', '#A82B21'],
  silver: ['#F6F2ED', '#D9CFC3', '#B5A99D'],
} as const
type BadgeTone = keyof typeof TONES

// A 12-lobed medal outline and a soft hexagon, both on a 0..100 box.
const scallop = Array.from({ length: 24 }, (_, i) => {
  const r = i % 2 ? 44 : 49
  const a = (i / 24) * Math.PI * 2
  return `${i ? 'L' : 'M'}${(50 + r * Math.sin(a)).toFixed(1)} ${(50 - r * Math.cos(a)).toFixed(1)}`
}).join('') + 'Z'
const hex = 'M50 3 91 26.5V73.5L50 97 9 73.5V26.5Z'

/** A glossy medal. `earned: false` renders it in silver so the set still reads as a collection. */
export function Badge({ tone, shape = 'scallop', earned = true, size = 64, children }: { tone: BadgeTone; shape?: 'scallop' | 'hex'; earned?: boolean; size?: number; children: ReactNode }) {
  const [light, mid, deep] = TONES[earned ? tone : 'silver']
  const id = `${earned ? tone : 'silver'}-${shape}`
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 104" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`b-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={light} />
            <stop offset="1" stopColor={mid} />
          </linearGradient>
        </defs>
        <path d={shape === 'hex' ? hex : scallop} fill={deep} transform="translate(0 4)" strokeLinejoin="round" stroke={deep} strokeWidth="6" />
        <path d={shape === 'hex' ? hex : scallop} fill={`url(#b-${id})`} strokeLinejoin="round" stroke={`url(#b-${id})`} strokeWidth="6" />
        <circle cx="50" cy="50" r="31" fill={mid} opacity=".55" />
        <circle cx="50" cy="50" r="31" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
        <path d="M22 40q6-22 28-26 14 0 24 8-22-4-40 6-8 5-12 12z" fill="#fff" opacity=".45" />
      </svg>
      <span className="relative text-[0.34em] font-extrabold leading-none text-white" style={{ fontSize: size * 0.3, textShadow: `0 1px 0 ${deep}` }}>
        {children}
      </span>
    </span>
  )
}

export interface Award {
  id: string
  label: L
  tone: BadgeTone
  shape: 'scallop' | 'hex'
  mark: string
  earned: boolean
}

/** Every badge the course offers, each derived from real progress. */
export function awards(p: Progress): Award[] {
  const days = streak(p.daily)
  return [
    ...lessons.map((l, i): Award => ({
      id: l.id,
      label: l.title,
      tone: units[0].lessons.includes(l) ? 'orange' : 'blue',
      shape: 'hex',
      mark: String(i + 1),
      earned: p.done.includes(l.id),
    })),
    ...[1, 3, 7].map((n): Award => ({ id: `streak-${n}`, label: { en: `${n}-day streak`, ar: `سلسلة ${n} أيام` }, tone: 'red', shape: 'scallop', mark: String(n), earned: days >= n })),
    ...[50, 100].map((n): Award => ({ id: `xp-${n}`, label: { en: `${n} ${ui.xp.en}`, ar: `${n} ${ui.xp.ar}` }, tone: 'gold', shape: 'scallop', mark: String(n), earned: p.xp >= n })),
    { id: 'course', label: { en: 'Course complete', ar: 'أكملت المسار' }, tone: 'green', shape: 'scallop', mark: '★', earned: p.done.length === lessons.length },
  ]
}
