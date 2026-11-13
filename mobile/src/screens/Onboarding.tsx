import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { motion } from 'motion/react'
import { ArrowLeft, Check, Clock, Languages, Target, UserRound } from '@/components/Icon'
import { Duck, type Mood } from '@/components/Duck'
import { Bubble, Button, IconButton, Preview, ProgressBar, spring } from '@/components/ui'
import { lessons } from '@/data/course'
import { ui, useT } from '@/i18n'
import { GoogleButton } from '@/components/GoogleButton'
import { useSession } from '@/lib/account'
import { blank, check, previewDoc, ready } from '@/lesson/engine'
import { TaskBody } from '@/lesson/TaskBody'
import { sound } from '@/lib/sound'
import type { Experience, Progress } from '@/state/progress'
import type { Answer, FillTask, L } from '@/types'

// The first taste of code: one blank, two choices, and the live preview turns into a real button the
// moment the right word goes in. Checked by the real lesson engine. Kept to a single tap on purpose:
// a harder puzzle here made people quit before they started.
const sample: FillTask = {
  id: 'onboarding-try',
  type: 'fill',
  lang: 'html',
  prompt: { en: 'Tap the word that makes this a button.', ar: 'اضغط على الكلمة التي تجعل هذا زرًا.' },
  code: '<___>Start learning</button>',
  bank: ['button', 'p'],
  answer: 'button',
  explain: { en: 'The button tag makes something people can click.', ar: 'وسم button يصنع شيئًا يمكن النقر عليه.' },
  hint: { en: 'It has the same name as the closing tag at the end.', ar: 'له نفس اسم وسم الإغلاق في النهاية.' },
}
const STEPS = 5

const levels: { id: Experience; title: L; sub: L }[] = [
  { id: 'new', title: ui.obNew, sub: ui.obNewSub },
  { id: 'some', title: ui.obSome, sub: ui.obSomeSub },
  { id: 'built', title: ui.obBuilt, sub: ui.obBuiltSub },
]
const goals: { id: Progress['goal']; title: L; sub: L }[] = [
  { id: 1, title: ui.goal1, sub: ui.goal1Sub },
  { id: 2, title: ui.goal2, sub: ui.goal2Sub },
  { id: 3, title: ui.goal3, sub: ui.goal3Sub },
]

function Options<T extends string | number>({ items, value, onPick }: { items: { id: T; title: L; sub: L }[]; value: T | null; onPick: (id: T) => void }) {
  const { t } = useT()
  return (
    <div role="group" className="grid gap-3">
      {items.map((item, i) => (
        <motion.button
          key={item.id}
          type="button"
          className="pick flex items-center gap-3 py-4"
          aria-pressed={value === item.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          transition={{ ...spring, delay: 0.05 * i }}
          onClick={() => {
            sound.playClick()
            onPick(item.id)
          }}
        >
          <span className="flex-1">
            <span className="block text-[16px] font-semibold">{t(item.title)}</span>
            <span className="mt-0.5 block text-[13px] font-medium text-ink2">{t(item.sub)}</span>
          </span>
          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${value === item.id ? 'border-brand bg-brand text-white' : 'border-lip'}`}>
            {value === item.id && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}>
                <Check className="h-4 w-4" strokeWidth={3.2} />
              </motion.span>
            )}
          </span>
        </motion.button>
      ))}
    </div>
  )
}

/** A headline that arrives one word at a time. */
function Words({ text }: { text: string }) {
  return (
    <h1 aria-label={text} className="max-w-[320px] text-[32px] font-semibold leading-[1.1] tracking-tight">
      {text.split(' ').map((word, i) => (
        <motion.span key={i} aria-hidden className="inline-block whitespace-pre" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.15 + 0.05 * i }}>
          {word}{' '}
        </motion.span>
      ))}
    </h1>
  )
}

/**
 * One decision per screen and a real task before the path opens.
 * The duck is one element for the whole flow: it shrinks beside its speech bubble for the questions
 * and grows back for the ending, so the steps read as one scene.
 */
export function Onboarding({ onToggleLang, onDone }: { onToggleLang: () => void; onDone: (answers: Pick<Progress, 'experience' | 'goal'>) => void }) {
  const { t, lang } = useT()
  const [step, setStep] = useState(0)
  // +1 moving forward, -1 moving back: new content slides in from the side it comes from.
  const [dir, setDir] = useState(1)
  const [experience, setExperience] = useState<Experience | null>(null)
  const [goal, setGoal] = useState<Progress['goal'] | null>(null)
  const [answer, setAnswer] = useState<Answer>(() => blank(sample))
  const [wrong, setWrong] = useState(false)
  // True for the moment between picking an option and the next step: the duck nods at the choice.
  const [nodding, setNodding] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const go = (to: number) => {
    clearTimeout(timer.current)
    setNodding(false)
    setDir(to > step ? 1 : -1)
    setStep(to)
  }
  // A pick is the answer: show the tick, then move on without a second tap.
  const pickThen = (to: number) => {
    clearTimeout(timer.current)
    setNodding(true)
    timer.current = window.setTimeout(() => go(to), 380)
  }

  const slide = (lang === 'ar' ? -36 : 36) * dir
  const doc = previewDoc(sample, answer)
  const hero = step === 0 || step === 4
  // Hello on the welcome, listening on the questions with a nod at each pick, pointing at the try-it task,
  // and a dance at the end.
  const mood: Mood = step === 0 ? 'hello' : step === 4 ? 'dance' : wrong ? 'oops' : step === 3 ? 'point' : nodding ? 'nod' : 'curious'
  const title = [ui.obWelcome, ui.obLevel, ui.obGoal, ui.obTry, ui.obReady][step]
  const line = [ui.obWelcomeBody, ui.obLevelBody, ui.obGoalBody, wrong ? sample.hint : sample.prompt, ui.obReadyBody][step]

  // Signed in from the welcome ("I already have an account"): carry on. If the account has saved progress,
  // App loads it and leaves onboarding by itself (lib/account.ts useCloudSync).
  const session = useSession()
  useEffect(() => {
    if (session && step === 0) go(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const advance = () => {
    if (step === 3) {
      if (!check(sample, answer).ok) {
        sound.playMistake()
        return setWrong(true)
      }
      sound.playAscendingCorrect(4)
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.3 }, colors: ['#F9801D', '#FFC533', '#FFE9C4', '#FF6B6B', '#23A160'], disableForReducedMotion: true })
    }
    if (step === STEPS - 1) return onDone({ experience: experience ?? 'new', goal: goal ?? 1 })
    go(step + 1)
  }

  const plan: [typeof Clock, string][] = [
    [UserRound, t(levels.find((l) => l.id === (experience ?? 'new'))!.title)],
    [Target, `${t(goals.find((g) => g.id === (goal ?? 1))!.title)} · ${t(ui.todayGoal)}`],
    [Clock, `${t(lessons[0].title)} · ${lessons[0].minutes} ${t(ui.min)}`],
  ]

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      {/* The sky fills the top for the opening and ending, and pulls up out of the way for the questions. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[62dvh] origin-top"
        style={{ background: 'linear-gradient(180deg, #FFC98A 0%, #FFE0BA 45%, #FFF4E8 100%)' }}
        initial={false}
        animate={{ scaleY: hero ? 1 : 0.32, opacity: hero ? 1 : 0.7 }}
        transition={spring}
      />

      <header className="relative flex h-[60px] items-center gap-3 px-4 pt-4" style={{ marginTop: 'var(--sat, env(safe-area-inset-top, 0px))' }}>
        {step === 0 ? (
          <span className="me-auto ps-1 text-[26px] font-semibold tracking-tight">bataa</span>
        ) : (
          <>
            <IconButton label={t(ui.back)} onClick={() => go(step - 1)}>
              <ArrowLeft className="h-5 w-5 rtl:-scale-x-100" strokeWidth={2.5} />
            </IconButton>
            <motion.div className="flex flex-1" initial={{ opacity: 0, scaleX: 0.6 }} animate={{ opacity: 1, scaleX: 1 }} transition={spring}>
              <ProgressBar value={step / (STEPS - 1)} label={`${step + 1} / ${STEPS}`} />
            </motion.div>
          </>
        )}
        <button type="button" className="glass flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold transition-transform active:scale-95" onClick={onToggleLang}>
          <Languages className="h-[18px] w-[18px]" />
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
      </header>

      <main className="relative flex-1 px-5 pb-6">
        <div className={hero ? 'grid justify-items-center gap-2 pt-8 text-center' : 'flex items-end gap-2 pt-6'}>
          <motion.div layout transition={spring} className="shrink-0">
            <Duck mood={mood} size={hero ? 188 : 72} />
          </motion.div>
          {hero ? (
            <motion.div key={step} layout="position" className="grid justify-items-center gap-3">
              <Words text={t(title)} />
              <motion.p className="max-w-[300px] text-[17px] font-medium leading-snug text-ink2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.45 }}>
                {t(line)}
              </motion.p>
            </motion.div>
          ) : (
            <Bubble key={`${step}${wrong}`}>
              <span className="block text-[17px] leading-tight">{t(title)}</span>
              <span className="mt-1 block text-[14px] font-medium text-ink2">{t(line)}</span>
            </Bubble>
          )}
        </div>

        <motion.div key={step} className="mt-6 grid gap-5" initial={{ opacity: 0, x: slide }} animate={{ opacity: 1, x: 0 }} transition={spring}>
          {step === 1 && (
            <Options
              items={levels}
              value={experience}
              onPick={(id) => {
                setExperience(id)
                pickThen(2)
              }}
            />
          )}
          {step === 2 && (
            <Options
              items={goals}
              value={goal}
              onPick={(id) => {
                setGoal(id)
                pickThen(3)
              }}
            />
          )}
          {step === 3 && (
            <>
              <TaskBody
                task={sample}
                answer={answer}
                locked={false}
                onChange={(a) => {
                  setAnswer(a)
                  setWrong(false)
                }}
              />
              {/* Shown once a word is in, so it never displays half-written code. */}
              {doc && ready(sample, answer) && <Preview html={doc.html} css={doc.css} />}
            </>
          )}
          {step === 4 && (
            <ul className="card mx-auto grid w-full max-w-[340px] divide-y divide-line px-4">
              {plan.map(([Icon, text], i) => (
                <motion.li key={i} className="flex items-center gap-3 py-3.5 text-[15px] font-semibold" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.5 + 0.08 * i }}>
                  <Icon className="h-5 w-5 shrink-0 text-brand" />
                  {text}
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </main>

      {/* The two question steps move on by themselves, so they have no button. */}
      {step !== 1 && step !== 2 && (
        <motion.footer
          className="sticky bottom-0 bg-gradient-to-t from-page from-70% to-page/0 p-4 pt-6"
          style={{ paddingBottom: 'calc(1rem + var(--sab, env(safe-area-inset-bottom, 0px)))' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <Button disabled={step === 3 && !ready(sample, answer)} onClick={advance}>
            {t(step === 0 ? ui.obStart : step === 3 ? ui.check : ui.obGo)}
          </Button>
          {/* Returning learners: sign in and their saved progress comes back (lib/account.ts). */}
          {step === 0 && !session && <GoogleButton label={t(ui.haveAccount)} className="mt-2" />}
        </motion.footer>
      )}
    </div>
  )
}
