import { ChevronRight, Shuffle } from 'lucide-react'
import { Duck } from '@/components/Duck'
import { Bubble, Button } from '@/components/ui'
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

  if (finished.length === 0)
    return (
      <div className="grid justify-items-center gap-5 px-5 pt-16 text-center">
        <Duck mood="think" size={140} />
        <p className="max-w-[280px] text-[18px] font-extrabold leading-snug">{t(ui.practiceEmpty)}</p>
        <Button onClick={onGoLearn}>{t(ui.goLearn)}</Button>
      </div>
    )

  return (
    <div className="grid gap-5 px-4 pb-6 pt-4">
      <h1 className="px-1 text-[26px] font-black">{t(ui.practice)}</h1>

      <section className="card grid gap-4 p-4">
        <div className="flex items-end gap-2">
          <Duck mood="talk" size={72} />
          <Bubble>{t(ui.quickReviewBody)}</Bubble>
        </div>
        <Button onClick={onReview}>
          <Shuffle className="h-5 w-5" />
          {t(ui.quickReview)}
        </Button>
      </section>

      <section className="grid gap-3">
        <h2 className="px-1 text-[13px] font-extrabold uppercase tracking-wide text-ink2">{t(ui.replay)}</h2>
        {finished.map((lesson) => (
          <button
            key={lesson.id}
            type="button"
            className="pick flex items-center gap-3"
            onClick={() => {
              sound.playClick()
              onReplay(lesson)
            }}
          >
            <span>
              <span className="block text-[16px] font-extrabold">{t(lesson.title)}</span>
              <span className="block text-[13px] font-semibold text-ink2">
                {lesson.minutes} {t(ui.min)} · {lesson.tasks.length} {t(ui.steps)}
              </span>
            </span>
            <ChevronRight className="ms-auto h-5 w-5 shrink-0 text-ink2 rtl:-scale-x-100" />
          </button>
        ))}
      </section>
    </div>
  )
}
