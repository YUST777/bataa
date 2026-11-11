import { useEffect, useState } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import { BookOpen, Dumbbell, UserRound } from 'lucide-react'
import { ui, LangContext } from '@/i18n'
import { Complete, type Result } from '@/lesson/Complete'
import { LessonRunner } from '@/lesson/LessonRunner'
import { sound } from '@/lib/sound'
import { Learn } from '@/screens/Learn'
import { Onboarding } from '@/screens/Onboarding'
import { Practice, reviewTasks } from '@/screens/Practice'
import { Profile } from '@/screens/Profile'
import { isoDay, streak, useProgress } from '@/state/progress'
import type { Lesson, Task } from '@/types'

type Tab = 'learn' | 'practice' | 'profile'
const tabs = [
  { id: 'learn', icon: BookOpen, label: ui.learn },
  { id: 'practice', icon: Dumbbell, label: ui.practice },
  { id: 'profile', icon: UserRound, label: ui.profile },
] as const

// Screens animate in only. Exit animations (AnimatePresence) around whole screens left them
// mounted when a sheet inside was closing, so the next screen never appeared.
const fade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.22, ease: 'easeOut' } } as const

export default function App() {
  const { p, set, complete, reset } = useProgress()
  const [tab, setTab] = useState<Tab>('learn')
  /** The running session: a lesson, or a mixed review when `lesson` is undefined. */
  const [run, setRun] = useState<{ lesson?: Lesson; tasks: Task[] } | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    document.documentElement.lang = p.lang
    document.documentElement.dir = p.lang === 'ar' ? 'rtl' : 'ltr'
  }, [p.lang])
  sound.enabled = p.sound

  const finish = (missed: number) => {
    if (!run) return
    const xp = complete(run.lesson?.id, missed === 0)
    setResult({
      lesson: run.lesson,
      xp,
      accuracy: Math.round(((run.tasks.length - missed) / run.tasks.length) * 100),
      // `complete` has just marked today active, which this render cannot see yet.
      streak: streak({ ...p.daily, [isoDay()]: 1 }),
    })
    setRun(null)
  }

  const screen = !p.onboarded ? 'onboarding' : run ? 'lesson' : result ? 'done' : 'tabs'

  return (
    <LangContext.Provider value={p.lang}>
      {/* reducedMotion="user": people who ask their device for less motion get fades instead of movement. */}
      <MotionConfig reducedMotion="user">
        <div className="mx-auto min-h-dvh max-w-md overflow-x-clip" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            {screen === 'onboarding' && (
              <motion.div key="onboarding" {...fade}>
                <Onboarding onToggleLang={() => set({ lang: p.lang === 'en' ? 'ar' : 'en' })} onDone={(answers) => set({ ...answers, onboarded: true })} />
              </motion.div>
            )}
            {screen === 'lesson' && run && (
              <motion.div key="lesson" {...fade}>
                <LessonRunner tasks={run.tasks} onExit={() => setRun(null)} onFinish={finish} />
              </motion.div>
            )}
            {screen === 'done' && result && (
              <motion.div key="done" {...fade}>
                <Complete
                  result={result}
                  onContinue={() => {
                    setResult(null)
                    setTab('learn')
                  }}
                />
              </motion.div>
            )}
            {screen === 'tabs' && (
              <motion.div key="tabs" {...fade} className="pb-[88px]">
                  <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16 }}>
                    {tab === 'learn' && <Learn p={p} onStart={(lesson) => setRun({ lesson, tasks: lesson.tasks })} />}
                    {tab === 'practice' && (
                      <Practice
                        p={p}
                        onReview={() => setRun({ tasks: reviewTasks(p.done) })}
                        onReplay={(lesson) => setRun({ lesson, tasks: lesson.tasks })}
                        onGoLearn={() => setTab('learn')}
                      />
                    )}
                    {tab === 'profile' && <Profile p={p} set={set} reset={reset} />}
                  </motion.div>

              </motion.div>
            )}
          {/* Outside the animated screens, so `fixed` stays pinned to the viewport. */}
          {screen === 'tabs' && (
            <nav
              aria-label="Bataa"
              className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md border-t-2 border-line bg-surface px-2"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {tabs.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={tab === id ? 'page' : undefined}
                  className={`relative grid h-16 flex-1 place-content-center justify-items-center gap-0.5 text-[12px] font-extrabold ${tab === id ? 'text-brandDeep' : 'text-ink2'}`}
                  onClick={() => {
                    sound.playClick()
                    setTab(id)
                  }}
                >
                  {tab === id && <motion.span layoutId="tab" className="absolute inset-x-3 inset-y-1.5 rounded-2xl bg-brandSoft" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <Icon className="relative h-6 w-6" strokeWidth={tab === id ? 2.6 : 2} />
                  <span className="relative">{p.lang === 'ar' ? label.ar : label.en}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
      </MotionConfig>
    </LangContext.Provider>
  )
}
