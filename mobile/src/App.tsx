import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { Toaster } from 'sonner'
import { spring } from '@/components/ui'
import { ui, LangContext } from '@/i18n'
import { Complete, type Result } from '@/lesson/Complete'
import { LessonRunner } from '@/lesson/LessonRunner'
import { sound } from '@/lib/sound'
import { Learn } from '@/screens/Learn'
import { Onboarding } from '@/screens/Onboarding'
import { Practice, reviewTasks } from '@/screens/Practice'
import { Pond } from '@/screens/Pond'
import { Profile } from '@/screens/Profile'
import { awards } from '@/components/Badge'
import { isoDay, newSerial, streak, useProgress } from '@/state/progress'
import { useCloudSync, useSession } from '@/lib/account'
import type { Lesson, Task } from '@/types'

/** Questions in a run; learn cards are not graded. */
const quizCount = (tasks: Task[]) => tasks.filter((t) => t.type !== 'learn').length

type Tab = 'learn' | 'practice' | 'pond' | 'profile'
/** Tab icons come from one art sheet (public/nav/icons.svg): `x` is the icon's center there. Each is a 16-unit
 * square, outlined on the top row, filled orange on the row below for the active tab. */
const tabs = [
  { id: 'learn', x: 7.8, label: ui.learn },
  { id: 'practice', x: 28.8, label: ui.practice },
  { id: 'pond', x: 50.2, label: ui.pond },
  { id: 'profile', x: 71.6, label: ui.profile },
] as const

// Screens animate in only. Exit animations (AnimatePresence) around whole screens left them
// mounted when a sheet inside was closing, so the next screen never appeared.
const fade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: spring } as const

export default function App() {
  const { p, set, load, complete, reset } = useProgress()
  // Signed in with Google: progress is also kept in the cloud (lib/account.ts).
  const session = useSession()
  useCloudSync(session, p, load, set)
  const [tab, setTab] = useState<Tab>('learn')
  /** The running session: a lesson, or a mixed review when `lesson` is undefined. */
  const [run, setRun] = useState<{ lesson?: Lesson; tasks: Task[] } | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  // Opening the app with ?onboarding replays the intro without touching saved progress.
  const [replay, setReplay] = useState(() => new URLSearchParams(window.location.search).has('onboarding'))

  useEffect(() => {
    document.documentElement.lang = p.lang
    document.documentElement.dir = p.lang === 'ar' ? 'rtl' : 'ltr'
  }, [p.lang])
  sound.enabled = p.sound

  // Stamp each badge the first time it is earned: the date, its place in the order, and a serial.
  useEffect(() => {
    const fresh = awards(p).filter((a) => a.earned && !p.badges[a.id])
    if (!fresh.length) return
    const badges = { ...p.badges }
    let no = Object.keys(badges).length
    for (const a of fresh) badges[a.id] = { at: isoDay(), no: ++no, serial: newSerial() }
    set({ badges })
  }, [p])

  const finish = (missed: number) => {
    if (!run) return
    const xp = complete(run.lesson?.id, missed === 0)
    setResult({
      lesson: run.lesson,
      xp,
      accuracy: Math.round(((quizCount(run.tasks) - missed) / Math.max(1, quizCount(run.tasks))) * 100),
      // `complete` has just marked today active, which this render cannot see yet.
      streak: streak({ ...p.daily, [isoDay()]: 1 }),
    })
    setRun(null)
  }

  const screen = !p.onboarded || replay ? 'onboarding' : run ? 'lesson' : result ? 'done' : 'tabs'

  return (
    <LangContext.Provider value={p.lang}>
      {/* reducedMotion="user": people who ask their device for less motion get fades instead of movement. */}
      <MotionConfig reducedMotion="user">
        {/* No top padding here: each screen's own header reaches under the status bar and pads itself. */}
        <div className="mx-auto min-h-dvh max-w-md overflow-x-clip">
          {screen === 'onboarding' && (
            <motion.div key="onboarding" {...fade}>
              <Onboarding
                onToggleLang={() => set({ lang: p.lang === 'en' ? 'ar' : 'en' })}
                onDone={(answers) => {
                  set({ ...answers, onboarded: true, joined: p.joined || isoDay() })
                  setReplay(false)
                  window.history.replaceState(null, '', window.location.pathname)
                }}
              />
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
              <motion.div key={tab === 'pond' ? 'learn' : tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16 }}>
                {/* Learn also sits under the pond, so swiping the pond away shows where it goes back to. */}
                {(tab === 'learn' || tab === 'pond') && <Learn p={p} onStart={(lesson) => setRun({ lesson, tasks: lesson.tasks })} />}
                {tab === 'practice' && (
                  <Practice
                    p={p}
                    onReview={() => setRun({ tasks: reviewTasks(p.done) })}
                    onReplay={(lesson) => setRun({ lesson, tasks: lesson.tasks })}
                    onGoLearn={() => setTab('learn')}
                  />
                )}
                {tab === 'profile' && <Profile p={p} set={set} reset={reset} email={session?.user.email ?? null} />}
                {tab === 'pond' &&
                  // In a portal: the animated wrappers here use transforms, which would break `fixed`.
                  createPortal(
                    <div className="fixed inset-0 z-30">
                      <Pond pond={p.pond} setPond={(pond) => set({ pond })} onExit={() => setTab('learn')} />
                    </div>,
                    document.body,
                  )}
              </motion.div>
            </motion.div>
          )}
          {/* Outside the animated screens, so `fixed` stays pinned to the viewport. The pond is full-screen: no tab bar. */}
          {screen === 'tabs' && tab !== 'pond' && (
            <nav
              aria-label="Bataa"
              className="glass fixed inset-x-3 z-40 mx-auto flex max-w-[424px] rounded-full p-1.5 shadow-float"
              style={{ bottom: 'calc(0.75rem + var(--sab, env(safe-area-inset-bottom, 0px)))' }}
            >
              {tabs.map(({ id, x, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={tab === id ? 'page' : undefined}
                  className={`relative grid h-14 flex-1 place-content-center justify-items-center gap-0.5 text-[11px] font-semibold transition-[color,transform] duration-150 active:scale-90 ${tab === id ? 'text-brandDeep' : 'text-ink2'}`}
                  onClick={() => {
                    sound.playClick()
                    setTab(id)
                  }}
                >
                  {tab === id && <motion.span layoutId="tab" className="absolute inset-0 rounded-full bg-brandSoft" transition={spring} />}
                  <svg aria-hidden viewBox={`${x - 8} ${tab === id ? 40.6 : 22.3} 16 16`} className="relative h-[26px] w-[26px]">
                    <image href="/nav/icons.svg" width="80" height="80" />
                  </svg>
                  <span className="relative">{p.lang === 'ar' ? label.ar : label.en}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
        {/* Short confirmations and errors, as a glass pill at the top. Swipe one up (or sideways) to dismiss it.
            On phones sonner reads mobileOffset, not offset, so both are set. */}
        <Toaster
          position="top-center"
          dir={p.lang === 'ar' ? 'rtl' : 'ltr'}
          offset="calc(var(--sat, env(safe-area-inset-top, 0px)) + 12px)"
          mobileOffset={{ top: 'calc(var(--sat, env(safe-area-inset-top, 0px)) + 12px)', left: 16, right: 16 }}
          swipeDirections={['top', 'left', 'right']}
          toastOptions={{
            className: '!justify-center !rounded-full !border-white/80 !bg-white/85 !px-5 !py-3 !font-sans !text-[15px] !font-semibold !text-ink !shadow-float !backdrop-blur-md',
          }}
        />
      </MotionConfig>
    </LangContext.Provider>
  )
}
