import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Clock, Flame, ListChecks, Lock, Star, Zap } from 'lucide-react'
import { Duck } from '@/components/Duck'
import { Button, Sheet } from '@/components/ui'
import { lessons, units } from '@/data/course'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { isoDay, streak, unlocked, type Progress } from '@/state/progress'
import type { Lesson } from '@/types'

function Chip({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <span aria-label={`${value} ${label}`} className="card flex h-10 items-center gap-1.5 rounded-full px-3 text-[15px] font-black tabular-nums">
      {icon}
      {value}
    </span>
  )
}

/** Daily goal as a ring that fills with each finished lesson. */
function GoalCard({ p }: { p: Progress }) {
  const { t } = useT()
  const today = p.daily[isoDay()] ?? 0
  const hit = today >= p.goal
  return (
    <section className="card flex items-center gap-4 p-4">
      <div className="relative grid h-16 w-16 shrink-0 place-items-center">
        <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
          <circle cx="32" cy="32" r="27" fill="none" strokeWidth="7" className="stroke-line" />
          <motion.circle
            cx="32" cy="32" r="27" fill="none" strokeWidth="7" strokeLinecap="round"
            className={hit ? 'stroke-ok' : 'stroke-brand'}
            opacity={today ? 1 : 0}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: Math.min(1, today / p.goal) }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        {hit ? <Check className="h-7 w-7 text-ok" strokeWidth={3.5} /> : <span className="text-[17px] font-black tabular-nums">{today}/{p.goal}</span>}
      </div>
      <div>
        <h2 className="text-[16px] font-black">
          {t(ui.today)}: {Math.min(today, p.goal)} {t(ui.goalOf)} {p.goal} {t(ui.lessonsWord)}
        </h2>
        <p className="text-[14px] font-semibold leading-snug text-ink2">{t(hit ? ui.goalHit : ui.goalNext)}</p>
      </div>
    </section>
  )
}

/** The course path. The next lesson is the loudest thing on screen; every node carries a text label. */
export function Learn({ p, onStart }: { p: Progress; onStart: (lesson: Lesson) => void }) {
  const { t } = useT()
  const [brief, setBrief] = useState<Lesson | null>(null)
  const [shown, setShown] = useState<Lesson | null>(null)
  const current = lessons.find((l) => !p.done.includes(l.id) && unlocked(p, l.id))
  const open = (lesson: Lesson) => {
    sound.playClick()
    setShown(lesson)
    setBrief(lesson)
  }
  // `shown` outlives `brief` so the sheet keeps its content while it slides away.
  const isOpen = shown ? unlocked(p, shown.id) : false

  return (
    <div className="grid gap-5 px-4 pb-6 pt-4">
      <header className="flex items-center gap-2">
        <span className="me-auto px-1 text-[26px] font-black text-brand">bataa</span>
        <Chip icon={<Flame className="h-5 w-5 fill-brand text-brand" />} value={streak(p.daily)} label={t(ui.streak)} />
        <Chip icon={<Zap className="h-5 w-5 fill-sun text-brand" />} value={p.xp} label={t(ui.xp)} />
      </header>

      <GoalCard p={p} />
      {!current && <p className="text-center text-[15px] font-bold text-ink2">{t(ui.allDone)}</p>}

      {units.map((unit, u) => {
        const finished = unit.lessons.filter((l) => p.done.includes(l.id)).length
        return (
          <section key={unit.id} className="grid gap-6">
            <header className="rounded-[20px] bg-brand p-4 text-white" style={{ boxShadow: '0 4px 0 #B94B00' }}>
              <p className="text-[13px] font-extrabold opacity-90">
                {u + 1} · {finished}/{unit.lessons.length}
              </p>
              <h2 className="text-[20px] font-black leading-tight">{t(unit.title)}</h2>
              <p className="mt-0.5 text-[14px] font-semibold opacity-95">{t(unit.goal)}</p>
            </header>

            <ol className="grid gap-7 pb-2">
              {unit.lessons.map((lesson, i) => {
                const done = p.done.includes(lesson.id)
                const isCurrent = lesson.id === current?.id
                const locked = !unlocked(p, lesson.id)
                const shift = [0, 52, 0, -52][i % 4]
                return (
                  <motion.li
                    key={lesson.id}
                    className="grid justify-items-center gap-2"
                    style={{ x: shift }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                  >
                    <div className="relative">
                      {isCurrent && (
                        <Duck mood="wave" size={76} className={`pointer-events-none absolute -top-2 ${shift > 0 ? 'right-full me-2' : 'left-full ms-2'}`} />
                      )}
                      <button
                        type="button"
                        aria-label={`${t(lesson.title)}. ${t(done ? ui.done : locked ? ui.locked : ui.start)}`}
                        onClick={() => open(lesson)}
                        className={`grid h-[76px] w-[76px] place-items-center rounded-full border-b-[6px] transition-transform duration-75 active:translate-y-1 active:border-b-2 ${
                          done ? 'border-okDeep bg-ok text-white' : locked ? 'border-lip bg-line text-lock' : 'border-brandDeep bg-brand text-white'
                        } ${isCurrent ? 'ring-4 ring-sun ring-offset-4 ring-offset-bg' : ''}`}
                      >
                        {done ? <Check className="h-9 w-9" strokeWidth={3.5} /> : locked ? <Lock className="h-7 w-7" /> : <Star className="h-9 w-9 fill-white" />}
                      </button>
                    </div>
                    <div className="max-w-[200px] text-center">
                      <p className={`text-[15px] font-extrabold leading-tight ${locked ? 'text-lock' : ''}`}>{t(lesson.title)}</p>
                      <p className="text-[13px] font-bold text-ink2">
                        {isCurrent ? <span className="text-brandDeep">{t(ui.start)} · </span> : null}
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

      <Sheet open={brief !== null} onClose={() => setBrief(null)} label={shown ? t(shown.title) : ''}>
        {shown && (
          <div className="grid gap-4">
            <div>
              <h2 className="text-[22px] font-black leading-tight">{t(shown.title)}</h2>
              <p className="mt-1 text-[15px] font-semibold text-ink2">
                {isOpen ? (
                  <>
                    {t(p.done.includes(shown.id) ? ui.youCan : ui.youWill)} {t(shown.can)}.
                  </>
                ) : (
                  t(ui.lockedBody)
                )}
              </p>
            </div>
            <div className="flex gap-4 text-[14px] font-bold text-ink2">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {shown.minutes} {t(ui.min)}
              </span>
              <span className="flex items-center gap-1.5">
                <ListChecks className="h-4 w-4" /> {shown.tasks.length} {t(ui.steps)}
              </span>
            </div>
            {isOpen ? (
              <Button
                autoFocus
                onClick={() => {
                  setBrief(null)
                  onStart(shown)
                }}
              >
                {t(p.done.includes(shown.id) ? ui.review : ui.start)}
              </Button>
            ) : (
              <Button tone="plain" autoFocus onClick={() => setBrief(null)}>
                {t(ui.close)}
              </Button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}
