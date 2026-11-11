import { useEffect, useState, type ReactNode } from 'react'
import { animate, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Flame, Target, Zap } from 'lucide-react'
import { Duck } from '@/components/Duck'
import { Button, Preview } from '@/components/ui'
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
  useEffect(() => animate(0, to, { duration: 0.8, delay: 0.3, onUpdate: (v) => setN(Math.round(v)) }).stop, [to])
  return <>{n}</>
}

function Stat({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="card grid justify-items-center gap-1 px-2 py-3">
      {icon}
      <strong className="text-[20px] font-black tabular-nums">{children}</strong>
      <span className="text-center text-[12px] font-bold text-ink2">{label}</span>
    </div>
  )
}

/** One short celebration, then the real reward: what was built and what the learner can now do. */
export function Complete({ result, onContinue }: { result: Result; onContinue: () => void }) {
  const { t } = useT()
  const { lesson } = result

  useEffect(() => {
    sound.playCelebrationFanfare()
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.35 }, colors: ['#F26B00', '#FFD600', '#2E8B57', '#FFFFFF'], disableForReducedMotion: true })
  }, [])

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-10">
      <div className="grid flex-1 content-start justify-items-center gap-5">
        <Duck mood="happy" size={132} />
        <motion.h1 className="text-center text-[28px] font-black" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          {t(lesson ? ui.lessonDone : ui.reviewDone)}
        </motion.h1>

        {lesson && (
          <motion.div className="grid w-full gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <p className="text-center text-[16px] font-bold text-ink2">
              {t(ui.youCan)} <span className="text-ink">{t(lesson.can)}</span>.
            </p>
            <Preview html={lesson.artifact.html} css={lesson.artifact.css} height={120} />
          </motion.div>
        )}

        <motion.div className="grid w-full grid-cols-3 gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Stat icon={<Zap className="h-6 w-6 fill-sun text-brand" />} label={t(ui.earned)}>
            +<CountUp to={result.xp} /> {t(ui.xp)}
          </Stat>
          <Stat icon={<Target className="h-6 w-6 text-ok" />} label={t(ui.accuracy)}>
            <CountUp to={result.accuracy} />%
          </Stat>
          <Stat icon={<Flame className="h-6 w-6 fill-brand text-brand" />} label={t(ui.streak)}>
            <CountUp to={result.streak} />
          </Stat>
        </motion.div>
      </div>

      <div className="sticky bottom-0 bg-bg py-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <Button autoFocus onClick={onContinue}>
          {t(ui.next)}
        </Button>
      </div>
    </div>
  )
}
