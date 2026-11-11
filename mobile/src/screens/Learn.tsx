import { useState, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { Check, Clock, Code2, Flame, ListChecks, Lock, Palette, Play, Zap } from 'lucide-react'
import { Button, Sky, Tile, Tray, spring } from '@/components/ui'
import { lessons, units } from '@/data/course'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { isoDay, reward, streak, unlocked, type Progress } from '@/state/progress'
import type { Lesson } from '@/types'

const unitLook = { html: { tone: 'orange', icon: Code2 }, css: { tone: 'blue', icon: Palette } } as const
const lookOf = (unitId: string) => unitLook[unitId as keyof typeof unitLook] ?? unitLook.html

/** Small progress ring with a value in the middle. */
function Ring({ value, size = 44, stroke = 5, color = '#FF8A1F', children }: { value: number; size?: number; stroke?: number; color?: string; children: React.ReactNode }) {
  const r = (size - stroke) / 2
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} stroke="rgba(31,22,17,.08)" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" stroke={color}
          opacity={value > 0 ? 1 : 0}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.min(1, value) }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <span className="relative text-[14px] font-semibold tabular-nums">{children}</span>
    </span>
  )
}

/** The course path. The next lesson is the loudest thing on screen; every node carries a text label. */
export function Learn({ p, onStart }: { p: Progress; onStart: (lesson: Lesson) => void }) {
  const { t, lang } = useT()
  // `shown` outlives `open` so the tray keeps its content while it shrinks away.
  const [open, setOpen] = useState(false)
  const [shown, setShown] = useState<{ lesson: Lesson; origin: { x: number; y: number } } | null>(null)
  const current = lessons.find((l) => !p.done.includes(l.id) && unlocked(p, l.id))
  const today = p.daily[isoDay()] ?? 0
  const hit = today >= p.goal
  const flip = lang === 'ar' ? -1 : 1

  const openBrief = (lesson: Lesson, e: MouseEvent<HTMLButtonElement>) => {
    sound.playClick()
    const r = e.currentTarget.getBoundingClientRect()
    setShown({ lesson, origin: { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    setOpen(true)
  }
  const brief = shown?.lesson
  const briefOpen = brief ? unlocked(p, brief.id) : false
  const briefUnit = brief ? units.find((u) => u.lessons.includes(brief))! : units[0]
  const BriefIcon = lookOf(briefUnit.id).icon

  return (
    <div>
      <Sky>
        <header className="flex items-center gap-2 px-5 pt-5">
          <span className="me-auto text-[26px] font-semibold tracking-tight text-ink">bataa</span>
          <span aria-label={`${streak(p.daily)} ${t(ui.streak)}`} className="glass flex h-10 items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold tabular-nums">
            <Flame className="h-[18px] w-[18px] fill-accent text-accent" />
            {streak(p.daily)}
          </span>
          <span aria-label={`${p.xp} ${t(ui.xp)}`} className="glass flex h-10 items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold tabular-nums">
            <Zap className="h-[18px] w-[18px] fill-sun text-sun" />
            {p.xp}
          </span>
        </header>

        <div className="flex items-center gap-4 px-5 pb-2 pt-6">
          <div className="flex-1">
            <p className="eyebrow text-brandDeep">{t(ui.todayGoal)}</p>
            <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight">
              {Math.min(today, p.goal)} {t(ui.goalOf)} {p.goal} {t(ui.lessonsWord)}
            </h1>
            <p className="mt-1 text-[14px] font-medium leading-snug text-ink2">{t(!current ? ui.allDone : hit ? ui.goalHit : ui.goalNext)}</p>
          </div>
          <span className="glass rounded-full p-1.5">
            <Ring value={today / p.goal} size={60} stroke={6} color={hit ? '#157A45' : '#FF8A1F'}>
              {hit ? <Check className="h-6 w-6 text-ok" strokeWidth={3} /> : `${today}/${p.goal}`}
            </Ring>
          </span>
        </div>
      </Sky>

      <div className="grid grid-cols-1 gap-8 px-4 pb-6 pt-2">
        {units.map((unit, u) => {
          const finished = unit.lessons.filter((l) => p.done.includes(l.id)).length
          const look = lookOf(unit.id)
          const Icon = look.icon
          return (
            <section key={unit.id} className="relative grid grid-cols-1 gap-7">
              <span aria-hidden className="pointer-events-none absolute -end-44 top-24 h-[360px] w-[360px] rounded-full bg-brandSoft/60" />
              <span aria-hidden className="pointer-events-none absolute -end-28 top-40 h-[232px] w-[232px] rounded-full bg-brandSoft" />

              <header className="card relative flex items-center gap-3.5 p-3.5">
                <Tile tone={look.tone}>
                  <Icon className="h-6 w-6" strokeWidth={2.4} />
                </Tile>
                <div className="min-w-0 flex-1">
                  <p className={`text-[12px] font-semibold ${look.tone === 'blue' ? 'text-[#1667B7]' : 'text-brand'}`}>
                    {t(ui.unit)} {u + 1}
                  </p>
                  <h2 className="truncate text-[17px] font-semibold leading-tight">{t(unit.title)}</h2>
                  <p className="truncate text-[13px] font-medium text-ink2">{t(unit.goal)}</p>
                </div>
                <Ring value={finished / unit.lessons.length} color="#157A45">
                  {finished}
                </Ring>
              </header>

              <ol className="relative grid gap-6">
                {unit.lessons.map((lesson, i) => {
                  const done = p.done.includes(lesson.id)
                  const isCurrent = lesson.id === current?.id
                  const locked = !unlocked(p, lesson.id)
                  return (
                    <motion.li
                      key={lesson.id}
                      className="grid justify-items-center gap-2"
                      style={{ x: [0, 56, 0, -56][i % 4] * flip }}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring, delay: 0.06 * i }}
                    >
                      <span className="relative grid place-items-center">
                        <motion.button
                          type="button"
                          aria-label={`${t(lesson.title)}. ${t(done ? ui.done : locked ? ui.locked : ui.start)}`}
                          whileTap={{ scale: 0.95 }}
                          transition={spring}
                          onClick={(e) => openBrief(lesson, e)}
                          className={`relative grid h-16 w-16 place-items-center rounded-full ${
                            done ? 'bg-okDeep text-white' : isCurrent ? 'bg-accent text-ink ring-2 ring-accent ring-offset-4 ring-offset-white' : locked ? 'border border-line bg-white text-ink3' : 'border border-brand/40 bg-white text-brand'
                          }`}
                        >
                          {done ? <Check className="h-7 w-7" strokeWidth={3.2} /> : locked ? <Lock className="h-5 w-5" /> : <Play className="h-6 w-6 translate-x-px fill-current rtl:-scale-x-100" />}
                        </motion.button>
                      </span>
                      <div className="max-w-[150px] text-center">
                        <p className={`text-[14px] font-semibold leading-tight ${locked ? 'text-ink3' : ''}`}>{t(lesson.title)}</p>
                        <p className="mt-0.5 text-[12px] font-medium text-ink2">
                          {isCurrent && <span className="font-semibold text-brand">{t(ui.start)} · </span>}
                          {lesson.minutes} {t(ui.min)}
                        </p>
                      </div>
                    </motion.li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>

      <Tray open={open} onClose={() => setOpen(false)} label={brief ? t(brief.title) : ''} origin={shown?.origin}>
        {brief && (
          <div className="grid gap-4">
            <div className="flex items-center gap-3.5">
              <Tile tone={briefOpen ? lookOf(briefUnit.id).tone : 'grey'} size={56}>
                {briefOpen ? <BriefIcon className="h-7 w-7" strokeWidth={2.4} /> : <Lock className="h-6 w-6" />}
              </Tile>
              <div>
                <p className="text-[12px] font-semibold text-ink2">{t(briefUnit.title)}</p>
                <h2 className="text-[21px] font-semibold leading-tight tracking-tight">{t(brief.title)}</h2>
              </div>
            </div>
            <p className="text-[15px] font-medium leading-snug text-ink2">
              {briefOpen ? `${t(p.done.includes(brief.id) ? ui.youCan : ui.youWill)} ${t(brief.can)}.` : t(ui.lockedBody)}
            </p>
            <div className="flex flex-wrap gap-2 text-[13px] font-semibold text-ink">
              {[
                [Clock, `${brief.minutes} ${t(ui.min)}`],
                [ListChecks, `${brief.tasks.length} ${t(ui.steps)}`],
                [Zap, `+${reward(p, brief.id, false)} ${t(ui.xp)}`],
              ].map(([I, text], i) => {
                const MetaIcon = I as typeof Clock
                return (
                  <span key={i} className="flex items-center gap-1.5 rounded-full bg-warm px-3 py-1.5">
                    <MetaIcon className="h-4 w-4 text-brand" /> {text as string}
                  </span>
                )
              })}
            </div>
            {briefOpen ? (
              <Button
                autoFocus
                onClick={() => {
                  setOpen(false)
                  onStart(brief)
                }}
              >
                {t(p.done.includes(brief.id) ? ui.review : ui.start)}
              </Button>
            ) : (
              <Button tone="plain" autoFocus onClick={() => setOpen(false)}>
                {t(ui.close)}
              </Button>
            )}
          </div>
        )}
      </Tray>
    </div>
  )
}
