import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import { Clock, Flame, ListChecks, Zap } from 'lucide-react'
import { Duck } from '@/components/Duck'
import { Button, Tray, spring } from '@/components/ui'
import { lessons, units } from '@/data/course'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { isoDay, reward, streak, unlocked, type Progress } from '@/state/progress'
import type { Lesson, Unit } from '@/types'

/** One stop on the map, top to bottom: a unit's signpost, its lessons, then its treasure chest. */
type Stop = { kind: 'sign'; unit: Unit; n: number } | { kind: 'lesson'; lesson: Lesson; unit: Unit } | { kind: 'chest'; unit: Unit }
const stops: Stop[] = units.flatMap((unit, n): Stop[] => [
  { kind: 'sign', unit, n: n + 1 },
  ...unit.lessons.map((lesson): Stop => ({ kind: 'lesson', lesson, unit })),
  { kind: 'chest', unit },
])

// The path winds down the screen. x is a percentage of the map's width, y is in px.
const STEP = 150
const xAt = (i: number) => 50 + 26 * Math.sin(i * 1.15 + 0.5)
const yAt = (i: number) => 190 + i * STEP
const HEIGHT = yAt(stops.length - 1) + 240
const TRAIL = stops
  .map((_, i) => (i === 0 ? `M${xAt(0)} ${yAt(0)}` : `C${xAt(i - 1)} ${yAt(i) - STEP / 2} ${xAt(i)} ${yAt(i) - STEP / 2} ${xAt(i)} ${yAt(i)}`))
  .join('')

// Scenery sits on whichever side the path is not. Sizes in px; positions follow from the stop index.
const BIG = [['tree', 112], ['pine', 118], ['pond', 124], ['tree', 104], ['bush', 84], ['pine', 110]] as const
const SMALL = [['mushrooms', 62], ['rock', 58], ['bush', 60]] as const
const scenery = stops.flatMap((_, i) => {
  const pathOnRight = xAt(i) > 50
  const [big, bigSize] = BIG[i % BIG.length]
  const [small, smallSize] = SMALL[i % SMALL.length]
  return [
    { name: big, size: bigSize, x: pathOnRight ? 15 + ((i * 7) % 10) : 85 - ((i * 5) % 10), y: yAt(i) - 34 + ((i * 37) % 44) },
    { name: small, size: smallSize, x: pathOnRight ? 95 : 5, y: yAt(i) + 62 },
  ]
})

const SEEN = 'bataa.map.at' // which stop the duck was last seen at, so it only walks when that changes

/** The course as a map. The duck stands at the next lesson and walks there when you finish one. */
export function Learn({ p, onStart }: { p: Progress; onStart: (lesson: Lesson) => void }) {
  const { t } = useT()
  // `shown` outlives `open` so the tray keeps its content while it shrinks away.
  const [open, setOpen] = useState(false)
  const [shown, setShown] = useState<{ stop: Stop; origin: { x: number; y: number } } | null>(null)
  const here = useRef<HTMLLIElement>(null)

  const current = lessons.find((l) => !p.done.includes(l.id) && unlocked(p, l.id))
  // The duck's stop: the next lesson, or the last chest once everything is done.
  const at = current ? stops.findIndex((s) => s.kind === 'lesson' && s.lesson.id === current.id) : stops.length - 1
  const [from] = useState(() => {
    const seen = Number(sessionStorage.getItem(SEEN) ?? at)
    return Number.isInteger(seen) && seen >= 0 && seen < stops.length ? seen : at
  })
  const [walking, setWalking] = useState(from !== at)
  const today = p.daily[isoDay()] ?? 0
  const unitDone = (unit: Unit) => unit.lessons.every((l) => p.done.includes(l.id))

  useEffect(() => {
    sessionStorage.setItem(SEEN, String(at))
    here.current?.scrollIntoView({ block: 'center' })
  }, [at])

  const openTray = (stop: Stop, e: MouseEvent<HTMLButtonElement>) => {
    sound.playClick()
    const r = e.currentTarget.getBoundingClientRect()
    setShown({ stop, origin: { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    setOpen(true)
  }

  // The duck stands beside its stop, on the side with more room.
  const duckX = (i: number) => xAt(i) + (xAt(i) > 50 ? -25 : 25)
  const duckY = (i: number) => yAt(i) - 96

  const stop = shown?.stop
  return (
    <div className="relative" style={{ background: 'linear-gradient(180deg, #B4E38A 0%, #9BD873 40%, #8ECF68 100%)' }}>
      {/* Heads-up bar: today's goal on the left, streak and XP on the right. */}
      <header className="sticky top-0 z-30 px-3 pt-3">
        <div className="flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/90 p-3 shadow-float backdrop-blur-md">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">
              {t(ui.todayGoal)} · {Math.min(today, p.goal)}/{p.goal}
            </p>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink/10">
              <motion.div className={`h-full rounded-full ${today >= p.goal ? 'bg-ok' : 'bg-accent'}`} initial={false} animate={{ width: `${Math.min(1, today / p.goal) * 100}%` }} transition={spring} />
            </div>
          </div>
          <span aria-label={`${streak(p.daily)} ${t(ui.streak)}`} className="flex h-10 items-center gap-1 rounded-full bg-brandSoft px-3 text-[15px] font-semibold tabular-nums">
            <Flame className="h-[18px] w-[18px] fill-accent text-accent" />
            <NumberFlow value={streak(p.daily)} />
          </span>
          <span aria-label={`${p.xp} ${t(ui.xp)}`} className="flex h-10 items-center gap-1 rounded-full bg-[#FFF6D6] px-3 text-[15px] font-semibold tabular-nums">
            <Zap className="h-[18px] w-[18px] fill-sun text-sun" />
            <NumberFlow value={p.xp} />
          </span>
        </div>
      </header>

      <div className="relative -mt-[76px] overflow-hidden" style={{ height: HEIGHT }}>
        {/* Soft light patches so the grass is not one flat colour. */}
        <div aria-hidden className="absolute inset-0 opacity-35" style={{ background: 'radial-gradient(circle at 18% 12%, #C9EDA0 0 90px, transparent 91px), radial-gradient(circle at 84% 34%, #C1EA98 0 120px, transparent 121px), radial-gradient(circle at 22% 61%, #C9EDA0 0 110px, transparent 111px), radial-gradient(circle at 80% 86%, #C1EA98 0 100px, transparent 101px)' }} />

        {/* The trail: a sandy track with a lighter line of stepping stones down the middle. */}
        <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${HEIGHT}`} preserveAspectRatio="none">
          <path d={TRAIL} fill="none" stroke="#7DBB58" strokeWidth="66" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={TRAIL} fill="none" stroke="#F1DFAE" strokeWidth="56" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={TRAIL} fill="none" stroke="#FBF0CF" strokeWidth="26" strokeLinecap="round" strokeDasharray="30 22" vectorEffect="non-scaling-stroke" />
        </svg>

        {scenery.map((s, i) => (
          <img key={i} src={`/map/${s.name}.webp`} alt="" draggable={false} className="pointer-events-none absolute -translate-x-1/2 select-none" style={{ left: `${s.x}%`, top: s.y, width: s.size }} />
        ))}

        <ol>
          {stops.map((s, i) => {
            const place = { left: `${xAt(i)}%`, top: yAt(i) }
            if (s.kind === 'sign')
              return (
                <li key={`sign-${s.unit.id}`} className="absolute w-[156px] -translate-x-1/2 -translate-y-1/2" style={place}>
                  <img src="/map/sign.webp" alt="" draggable={false} className="w-full select-none" />
                  {/* The lettering sits on the board, which is the top two thirds of the sign art. */}
                  <div className="absolute inset-x-3 top-[9%] grid h-[52%] place-content-center text-center text-[#4A2A12]">
                    <span className="text-[11px] font-semibold opacity-80">
                      {t(ui.unit)} {s.n}
                    </span>
                    <span className="text-[13px] font-semibold leading-tight">{t(s.unit.title)}</span>
                  </div>
                </li>
              )

            if (s.kind === 'chest') {
              const done = unitDone(s.unit)
              return (
                <li key={`chest-${s.unit.id}`} className="absolute -translate-x-1/2 -translate-y-1/2" style={place}>
                  <motion.button type="button" aria-label={t(done ? ui.chestOpen : ui.chestLocked)} whileTap={{ scale: 0.94 }} transition={spring} onClick={(e) => openTray(s, e)}>
                    <img src={`/map/${done ? 'chest-open' : 'chest'}.webp`} alt="" draggable={false} className={`w-[92px] select-none ${done ? '' : 'opacity-90 saturate-[0.7]'}`} />
                  </motion.button>
                </li>
              )
            }

            const done = p.done.includes(s.lesson.id)
            const isCurrent = s.lesson.id === current?.id
            const locked = !unlocked(p, s.lesson.id)
            return (
              <li key={s.lesson.id} ref={isCurrent ? here : undefined} className="absolute grid w-[150px] -translate-x-1/2 justify-items-center" style={{ ...place, marginTop: -44 }}>
                {isCurrent && (
                  <motion.span
                    className="absolute bottom-full mb-1 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-brand shadow-soft"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.3 }}
                  >
                    {t(ui.startHere)}
                    <span aria-hidden className="absolute left-1/2 top-full -mt-1.5 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
                  </motion.span>
                )}
                <motion.button
                  type="button"
                  aria-label={`${t(s.lesson.title)}. ${t(done ? ui.done : locked ? ui.locked : ui.start)}`}
                  // The coin is a thick button: pressing it pushes it down onto its rim.
                  whileTap={{ scale: 0.95, y: 4 }}
                  transition={spring}
                  onClick={(e) => openTray(s, e)}
                >
                  <img src={`/map/coin-${done ? 'check' : locked ? 'lock' : 'star'}.webp`} alt="" draggable={false} className="w-[88px] select-none" />
                </motion.button>
                <span className={`mt-1 rounded-full px-2.5 py-1 text-center text-[12px] font-semibold leading-tight shadow-soft ${locked ? 'bg-white/70 text-ink2' : 'bg-white text-ink'}`}>{t(s.lesson.title)}</span>
              </li>
            )
          })}
        </ol>

        {/* The duck. It walks from where it last stood to the next lesson, then waits there. */}
        <motion.div
          className="pointer-events-none absolute z-10 -translate-x-1/2"
          initial={{ left: `${duckX(from)}%`, top: duckY(from) }}
          animate={{ left: `${duckX(at)}%`, top: duckY(at) }}
          transition={{ duration: walking ? 1.1 + Math.abs(at - from) * 0.5 : 0, ease: 'linear' }}
          onAnimationComplete={() => setWalking(false)}
        >
          {/* The art faces left, so it is mirrored when the duck walks or stands looking right. */}
          <Duck mood={walking ? 'walk' : 'idle'} size={78} flip={walking ? duckX(at) > duckX(from) : duckX(at) < xAt(at)} />
        </motion.div>
      </div>

      <Tray open={open} onClose={() => setOpen(false)} label={stop?.kind === 'lesson' ? t(stop.lesson.title) : ''} origin={shown?.origin}>
        {stop?.kind === 'lesson' && (
          <LessonBrief
            p={p}
            lesson={stop.lesson}
            unit={stop.unit}
            onClose={() => setOpen(false)}
            onStart={() => {
              setOpen(false)
              onStart(stop.lesson)
            }}
          />
        )}
        {stop?.kind === 'chest' && (
          <div className="grid justify-items-center gap-3 text-center">
            <img src={`/map/${unitDone(stop.unit) ? 'chest-open' : 'chest'}.webp`} alt="" className="w-28" />
            <h2 className="text-[20px] font-semibold tracking-tight">{t(stop.unit.title)}</h2>
            {unitDone(stop.unit) ? (
              <ul className="grid gap-1 text-[15px] font-medium text-ink2">
                {stop.unit.lessons.map((l) => (
                  <li key={l.id} className="first-letter:uppercase">
                    {t(l.can)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] font-medium text-ink2">{t(ui.chestLocked)}</p>
            )}
            <Button tone="plain" autoFocus onClick={() => setOpen(false)}>
              {t(ui.close)}
            </Button>
          </div>
        )}
      </Tray>
    </div>
  )
}

function LessonBrief({ p, lesson, unit, onStart, onClose }: { p: Progress; lesson: Lesson; unit: Unit; onStart: () => void; onClose: () => void }) {
  const { t } = useT()
  const done = p.done.includes(lesson.id)
  const isOpen = unlocked(p, lesson.id)
  const facts: [typeof Clock, string][] = [
    [Clock, `${lesson.minutes} ${t(ui.min)}`],
    [ListChecks, `${lesson.tasks.length} ${t(ui.steps)}`],
    [Zap, `+${reward(p, lesson.id, false)} ${t(ui.xp)}`],
  ]
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3.5">
        <img src={`/map/coin-${done ? 'check' : isOpen ? 'star' : 'lock'}.webp`} alt="" className="w-16 shrink-0" />
        <div>
          <p className="text-[12px] font-semibold text-ink2">{t(unit.title)}</p>
          <h2 className="text-[21px] font-semibold leading-tight tracking-tight">{t(lesson.title)}</h2>
        </div>
      </div>
      <p className="text-[15px] font-medium leading-snug text-ink2">{isOpen ? `${t(done ? ui.youCan : ui.youWill)} ${t(lesson.can)}.` : t(ui.lockedBody)}</p>
      <div className="flex flex-wrap gap-2 text-[13px] font-semibold">
        {facts.map(([Icon, text]) => (
          <span key={text} className="flex items-center gap-1.5 rounded-full bg-warm px-3 py-1.5">
            <Icon className="h-4 w-4 text-brand" /> {text}
          </span>
        ))}
      </div>
      {isOpen ? (
        <Button autoFocus onClick={onStart}>
          {t(done ? ui.review : ui.start)}
        </Button>
      ) : (
        <Button tone="plain" autoFocus onClick={onClose}>
          {t(ui.close)}
        </Button>
      )}
    </div>
  )
}
