import { createPortal } from 'react-dom'
import { Suspense, lazy, startTransition, useEffect, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { Toaster, toast } from 'sonner'
import { spring } from '@/components/ui'
import { ui, LangContext } from '@/i18n'
import type { Result } from '@/lesson/Complete'
import { reviewTasks } from '@/lesson/review'
import { lessons } from '@/data/course'
import { sound } from '@/lib/sound'
import { Learn } from '@/screens/Learn'
import { Onboarding } from '@/screens/Onboarding'

import { awards } from '@/components/Badge'
import { isoDay, newSerial, streak, useProgress } from '@/state/progress'
import { useCloudSync, useSession } from '@/lib/account'
import type { Lesson, Task } from '@/types'
import { usePlan } from '@/lib/plans'

// Learn and Onboarding are the first screens and ship in the main bundle. Every other screen is its own chunk (the chat's
// markdown, the 3D medals, the pond), fetched in the background once the app is idle, so a tab still opens
// at once but the first load stays small.
const screens = {
  lesson: () => import('@/lesson/LessonRunner'),
  complete: () => import('@/lesson/Complete'),
  practice: () => import('@/screens/Practice'),
  pond: () => import('@/screens/Pond'),
  duck: () => import('@/components/DuckRig'),
  profile: () => import('@/screens/Profile'),
  paywall: () => import('@/screens/Paywall'),
}
const LessonRunner = lazy(() => screens.lesson().then((m) => ({ default: m.LessonRunner })))
const Complete = lazy(() => screens.complete().then((m) => ({ default: m.Complete })))
const Practice = lazy(() => screens.practice().then((m) => ({ default: m.Practice })))
const Pond = lazy(() => screens.pond().then((m) => ({ default: m.Pond })))
const Profile = lazy(() => screens.profile().then((m) => ({ default: m.Profile })))
const Paywall = lazy(() => screens.paywall().then((m) => ({ default: m.Paywall })))

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
// Screens come in with a short fade: long enough to soften the cut, short enough never to look washed out.
const fade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { ...spring, opacity: { duration: 0.12 } } } as const

export default function App() {
  // Fetch the other screens while the learner looks at the first one.
  useEffect(() => {
    const warm = () => {
      Object.values(screens).forEach((load) => load().catch(() => {}))
      import('@/lib/highlight').then(
        (m) => m.warm(),
        () => {},
      )
      // Art the other screens draw, so the pond and the plans page never paint before their pictures.
      for (const src of [
        '/pond/sunset.svg',
        '/pond/day.svg',
        '/pond/night.svg',
        '/pond/items.svg',
        '/pond/gadgets.svg',
        '/pond/decor.svg',
        '/pond/bread-bag.webp',
        '/plans/bg.webp',
        '/plans/free.webp',
        '/plans/pro.webp',
        '/plans/team.webp',
      ])
        new Image().src = src
    }
    // Safari has no requestIdleCallback: a short timer does the same job there.
    const idle = typeof requestIdleCallback === 'function'
    const id = idle ? requestIdleCallback(warm, { timeout: 2500 }) : window.setTimeout(warm, 1200)
    return () => (idle ? cancelIdleCallback(id) : window.clearTimeout(id))
  }, [])
  const { p, set, load, complete, reset } = useProgress()
  // Signed in with Google: progress is also kept in the cloud (lib/account.ts).
  const session = useSession()
  const { plan } = usePlan(session)
  const [paywall, setPaywall] = useState(false)
  const upgrade = () => setPaywall(true)
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
        <Suspense fallback={null}>
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
                    // New learners see the plans once, right after onboarding (not on a replay from settings).
                    if (!p.onboarded) setPaywall(true)
                  }}
                />
              </motion.div>
            )}
            {screen === 'lesson' && run && (
              <motion.div key="lesson" {...fade}>
                <LessonRunner tasks={run.tasks} onExit={() => setRun(null)} onFinish={finish} p={p} signedIn={!!session} plan={plan} onUpgrade={upgrade} />
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
              <motion.div key="tabs" {...fade} className={tab === 'practice' ? undefined : 'pb-28'}>
                {/* Tabs switch instantly, like a native tab bar: a fade here flashed the whole screen pale. */}
                <div key={tab === 'pond' ? 'learn' : tab}>
                  {/* Learn also sits under the pond, so swiping the pond away shows where it goes back to. */}
                  {(tab === 'learn' || tab === 'pond') && <Learn p={p} plan={plan} onUpgrade={upgrade} onStart={(lesson) => setRun({ lesson, tasks: lesson.tasks })} />}
                  {tab === 'practice' && <Practice p={p} signedIn={!!session} plan={plan} onUpgrade={upgrade} onReview={() => setRun({ tasks: reviewTasks(p.done) })} />}
                  {tab === 'profile' && <Profile p={p} set={set} reset={reset} email={session?.user.email ?? null} plan={plan} onUpgrade={upgrade} />}
                  {tab === 'pond' &&
                    // In a portal: the animated wrappers here use transforms, which would break `fixed`.
                    createPortal(
                      <div className="fixed inset-0 z-30">
                        <Pond pond={p.pond} setPond={(pond) => set({ pond })} onExit={() => setTab('learn')} lessonsDone={lessons.every((l) => p.done.includes(l.id))} />
                      </div>,
                      document.body,
                    )}
                </div>
              </motion.div>
            )}
            {/* Outside the animated screens, so `fixed` stays pinned to the viewport. The pond is full-screen: no tab bar. */}
            {screen === 'tabs' && tab !== 'pond' && (
              <nav
                aria-label="Waddle"
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
                      // A transition: React draws the new tab in slices, so the tap and the tab bar never stall on it.
                      startTransition(() => setTab(id))
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
          <Paywall
            open={paywall}
            current={plan}
            onClose={() => setPaywall(false)}
            onChoose={() =>
              // shortcut: no payment provider is connected yet, so Continue only says so; start Google Play Billing here.
              toast((session ? ui.paySoon : ui.paySignIn)[p.lang])
            }
          />
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
        </Suspense>
      </MotionConfig>
    </LangContext.Provider>
  )
}
