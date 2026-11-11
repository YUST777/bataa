import { useEffect, useState } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import { Map, Repeat, UserRound } from 'lucide-react'
import { spring } from '@/components/ui'
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
  { id: 'learn', icon: Map, label: ui.learn },
  { id: 'practice', icon: Repeat, label: ui.practice },
  { id: 'profile', icon: UserRound, label: ui.profile },
] as const

// Screens animate in only. Exit animations (AnimatePresence) around whole screens left them
// mounted when a sheet inside was closing, so the next screen never appeared.
const fade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: spring } as const

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
              <motion.div key="tabs" {...fade} className="pb-28">
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
              className="fixed inset-x-3 z-40 border border-line bg-white/95 backdrop-blur-md mx-auto flex max-w-[424px] rounded-[28px] p-1.5 shadow-float"
              style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
            >
              {tabs.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={tab === id ? 'page' : undefined}
                  className={`relative grid h-14 flex-1 place-content-center justify-items-center gap-0.5 text-[11px] font-semibold transition-colors ${tab === id ? 'text-brandDeep' : 'text-ink2'}`}
                  onClick={() => {
                    sound.playClick()
                    setTab(id)
                  }}
                >
                  {tab === id && <motion.span layoutId="tab" className="absolute inset-0 rounded-[22px] bg-brandSoft" transition={spring} />}
                  <Icon className="relative h-[22px] w-[22px]" strokeWidth={tab === id ? 2.5 : 2} />
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
