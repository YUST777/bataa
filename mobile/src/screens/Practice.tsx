import { motion } from 'framer-motion'
import { ChevronRight, Shuffle } from 'lucide-react'
import { Duck } from '@/components/Duck'
import { Button, Sky, spring } from '@/components/ui'
import { lessons } from '@/data/course'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import type { Progress } from '@/state/progress'
import type { Lesson, Task } from '@/types'

/** Up to five random tasks from finished lessons. */
export function reviewTasks(done: string[]): Task[] {
  const pool = lessons.filter((l) => done.includes(l.id)).flatMap((l) => l.tasks)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 5)
}

export function Practice({ p, onReview, onReplay, onGoLearn }: { p: Progress; onReview: () => void; onReplay: (lesson: Lesson) => void; onGoLearn: () => void }) {
  const { t } = useT()
  const finished = lessons.filter((l) => p.done.includes(l.id))
  const empty = finished.length === 0

  return (
    <div>
      <Sky>
        <div className="flex items-end gap-2 px-5 pt-6">
          <div className="flex-1 pb-4">
            <h1 className="text-[30px] font-semibold tracking-tight">{t(ui.practice)}</h1>
            <p className="mt-1 text-[15px] font-medium leading-snug text-ink2">{t(empty ? ui.practiceEmpty : ui.quickReviewBody)}</p>
          </div>
          <Duck mood={empty ? 'think' : 'talk'} size={96} className="-mb-4" />
        </div>
      </Sky>

      <div className="grid gap-6 px-4 pb-6 pt-3">
        <div>
          {empty ? (
            <Button onClick={onGoLearn}>{t(ui.goLearn)}</Button>
          ) : (
            <Button onClick={onReview}>
              <Shuffle className="h-5 w-5" />
              {t(ui.quickReview)}
            </Button>
          )}
        </div>
        {!empty && (
          <>

            <section className="grid gap-3">
              <h2 className="eyebrow px-1 text-ink2">{t(ui.replay)}</h2>
              {finished.map((lesson, i) => {
                return (
                  <motion.button
                    key={lesson.id}
                    type="button"
                    className="pick flex items-center gap-3.5 p-3"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.05 * i }}
                    onClick={() => {
                      sound.playClick()
                      onReplay(lesson)
                    }}
                  >
                    <img src="/map/coin-check.webp" alt="" className="w-11 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] font-semibold">{t(lesson.title)}</span>
                      <span className="block text-[13px] font-medium text-ink2">
                        {lesson.minutes} {t(ui.min)} · {lesson.tasks.length} {t(ui.steps)}
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-ink3 rtl:-scale-x-100" />
                  </motion.button>
                )
              })}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
