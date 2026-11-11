import { useEffect, useState, type ReactNode } from 'react'
import { animate, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Flame, Target, Zap } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Duck } from '@/components/Duck'
import { Button, Preview, Sky, spring } from '@/components/ui'
import { lessons, units } from '@/data/course'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import type { Lesson } from '@/types'

export interface Result {
  /** Undefined for a mixed practice session. */
  lesson?: Lesson
  xp: number
  accuracy: number
  streak: number
}

function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0)
  useEffect(() => animate(0, to, { duration: 0.9, delay: 0.45, onUpdate: (v) => setN(Math.round(v)) }).stop, [to])
  return <>{n}</>
}

function Stat({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="grid flex-1 justify-items-center gap-0.5 px-2 py-4">
      {icon}
      <strong className="mt-1 text-[20px] font-semibold tabular-nums tracking-tight">{children}</strong>
      <span className="text-center text-[12px] font-medium text-ink2">{label}</span>
    </div>
  )
}

const rise = (delay: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { ...spring, delay } })

/** One short celebration, then the real reward: what was built and what the learner can now do. */
export function Complete({ result, onContinue }: { result: Result; onContinue: () => void }) {
  const { t } = useT()
  const { lesson } = result

  useEffect(() => {
    sound.playCelebrationFanfare()
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.3 }, colors: ['#F26B00', '#FFC533', '#23A160', '#2F9BF0'], disableForReducedMotion: true })
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <Sky>
        <div className="relative grid justify-items-center pt-12">
          <Duck mood="happy" size={170} className="-mb-2" />
          {lesson && (
            <motion.span className="absolute bottom-0 start-1/2 ms-10" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 8 }} transition={{ ...spring, delay: 0.5 }}>
              <Badge tone={units[0].lessons.includes(lesson) ? 'orange' : 'blue'} shape="hex" size={60}>
                {lessons.indexOf(lesson) + 1}
              </Badge>
            </motion.span>
          )}
        </div>
      </Sky>

      <div className="grid flex-1 content-start gap-5 px-5 pt-3">
        <motion.div className="text-center" {...rise(0.1)}>
          <h1 className="text-[30px] font-semibold tracking-tight">{t(lesson ? ui.lessonDone : ui.reviewDone)}</h1>
          {lesson && (
            <p className="mt-1 text-[16px] font-medium text-ink2">
              {t(ui.youCan)} <span className="font-semibold text-ink">{t(lesson.can)}</span>.
            </p>
          )}
        </motion.div>

        <motion.div className="card flex divide-x divide-line rtl:divide-x-reverse" {...rise(0.22)}>
          <Stat icon={<Zap className="h-6 w-6 fill-sun text-sun" />} label={t(ui.earned)}>
            +<CountUp to={result.xp} /> {t(ui.xp)}
          </Stat>
          <Stat icon={<Target className="h-6 w-6 text-ok" />} label={t(ui.accuracy)}>
            <CountUp to={result.accuracy} />%
          </Stat>
          <Stat icon={<Flame className="h-6 w-6 fill-accent text-accent" />} label={t(ui.streak)}>
            <CountUp to={result.streak} />
          </Stat>
        </motion.div>

        {lesson && (
          <motion.div className="grid gap-2" {...rise(0.34)}>
            <p className="eyebrow px-1 text-ink2">{t(ui.youBuilt)}</p>
            <Preview html={lesson.artifact.html} css={lesson.artifact.css} height={116} />
          </motion.div>
        )}
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-white from-70% to-white/0 p-4 pt-6" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <Button autoFocus onClick={onContinue}>
          {t(ui.next)}
        </Button>
      </div>
    </div>
  )
}
