import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Languages } from 'lucide-react'
import { Duck, type Mood } from '@/components/Duck'
import { Bubble, Button, Preview, ProgressBar } from '@/components/ui'
import { lessons } from '@/data/course'
import { ui, useT } from '@/i18n'
import { blank, check, previewDoc, ready } from '@/lesson/engine'
import { TaskBody } from '@/lesson/TaskBody'
import { sound } from '@/lib/sound'
import type { Experience, Progress } from '@/state/progress'
import type { Answer, L } from '@/types'

// The sample is a real lesson task, checked by the real engine.
const sample = lessons[0].tasks[1]
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
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="pick flex items-center gap-3 py-4"
          aria-pressed={value === item.id}
          onClick={() => {
            sound.playClick()
            onPick(item.id)
          }}
        >
          <span>
            <span className="block text-[16px] font-extrabold">{t(item.title)}</span>
            <span className="block text-[13px] font-semibold text-ink2">{t(item.sub)}</span>
          </span>
          {value === item.id && <Check className="ms-auto h-5 w-5 shrink-0 text-brand" strokeWidth={3} />}
        </button>
      ))}
    </div>
  )
}

/** One decision per screen, progress always visible, and a real task before the path opens. */
export function Onboarding({ onToggleLang, onDone }: { onToggleLang: () => void; onDone: (answers: Pick<Progress, 'experience' | 'goal'>) => void }) {
  const { t, lang } = useT()
  const [step, setStep] = useState(0)
  const [experience, setExperience] = useState<Experience | null>(null)
  const [goal, setGoal] = useState<Progress['goal'] | null>(null)
  const [answer, setAnswer] = useState<Answer>(() => blank(sample))
  const [wrong, setWrong] = useState(false)

  const slide = lang === 'ar' ? -28 : 28
  const doc = previewDoc(sample, answer)
  const canContinue = [true, experience !== null, goal !== null, ready(sample, answer), true][step]
  const mood: Mood = step === 0 ? 'wave' : step === 4 ? 'happy' : wrong ? 'oops' : 'talk'
  const line = [ui.obWelcomeBody, ui.obLevelBody, ui.obGoalBody, wrong ? sample.hint : sample.prompt, ui.obReadyBody][step]
  const title = [ui.obWelcome, ui.obLevel, ui.obGoal, ui.obTry, ui.obReady][step]

  const advance = () => {
    if (step === 3) {
      if (!check(sample, answer).ok) {
        sound.playMistake()
        return setWrong(true)
      }
      sound.playAscendingCorrect(4)
    }
    if (step === STEPS - 1) return onDone({ experience: experience ?? 'new', goal: goal ?? 1 })
    setStep(step + 1)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-[60px] items-center gap-3 px-4 pt-4">
        {step > 0 ? (
          <button type="button" aria-label={t(ui.back)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink2 active:bg-line" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="h-6 w-6 rtl:-scale-x-100" strokeWidth={2.5} />
          </button>
        ) : (
          <span className="px-1 text-[24px] font-black text-brand">bataa</span>
        )}
        {step > 0 ? <ProgressBar value={step / (STEPS - 1)} label={`${step + 1} / ${STEPS}`} /> : <span className="flex-1" />}
        <button type="button" className="flex h-11 items-center gap-1.5 rounded-full px-3 text-[14px] font-extrabold text-ink2 active:bg-line" onClick={onToggleLang}>
          <Languages className="h-5 w-5" />
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
      </header>

      <main className="flex-1 overflow-x-hidden px-5 pb-6 pt-6">
          <motion.div key={step} className="grid gap-5" initial={{ opacity: 0, x: slide }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            {step === 0 || step === 4 ? (
              <div className="grid justify-items-center gap-5 pt-8 text-center">
                <Duck mood={mood} size={176} />
                <h1 className="text-[30px] font-black leading-tight">{t(title)}</h1>
                <p className="max-w-[300px] text-[17px] font-semibold leading-snug text-ink2">{t(line)}</p>
              </div>
            ) : (
              <>
                <h1 className="text-[24px] font-black leading-tight">{t(title)}</h1>
                <div className="flex items-end gap-2">
                  <Duck mood={mood} size={72} />
                  <Bubble>{t(line)}</Bubble>
                </div>
                {step === 1 && <Options items={levels} value={experience} onPick={setExperience} />}
                {step === 2 && <Options items={goals} value={goal} onPick={setGoal} />}
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
                    {doc && <Preview html={doc.html} css={doc.css} />}
                  </>
                )}
              </>
            )}
          </motion.div>
      </main>

      <footer className="sticky bottom-0 border-t-2 border-line bg-bg p-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <Button disabled={!canContinue} onClick={advance}>
          {t(step === 0 ? ui.obStart : step === 3 ? ui.check : step === 4 ? ui.obGo : ui.next)}
        </Button>
      </footer>
    </div>
  )
}
