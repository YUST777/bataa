import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, X } from '@/components/Icon'
import { Duck } from '@/components/Duck'
import { Bubble, Button, Code, IconButton, Preview, ProgressBar, Tray, spring } from '@/components/ui'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import type { Plan } from '@/lib/plans'
import { ChatBody } from '@/screens/Practice'
import { PondDuck } from '@/screens/Pond'
import type { Progress } from '@/state/progress'
import type { Answer, L, Task } from '@/types'
import type { UIMessage } from 'ai'
import { blank, check, previewDoc, ready, solution } from './engine'
import { TaskBody } from './TaskBody'

/**
 * Runs a list of tasks: answer, check, explain, retry or continue, or step back to the one before.
 * Mistakes never end the lesson; `onFinish` reports how many tasks needed a retry.
 * "Ask" opens Bataa AI about the current step; that chat lasts as long as the lesson.
 */
export function LessonRunner({
  tasks,
  onExit,
  onFinish,
  p,
  signedIn,
  plan,
  onUpgrade,
}: {
  tasks: Task[]
  onExit: () => void
  onFinish: (missed: number) => void
  p: Progress
  signedIn: boolean
  plan: Plan
  onUpgrade: () => void
}) {
  const { t, lang } = useT()
  const [index, setIndex] = useState(0)
  const task = tasks[index]
  const [answer, setAnswer] = useState<Answer>(() => blank(task))
  const [state, setState] = useState<'idle' | 'ok' | 'bad'>('idle')
  const [why, setWhy] = useState<L | null>(null)
  const [tries, setTries] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const missed = useRef(new Set<string>())
  const [asking, setAsking] = useState(false)
  const [chat, setChat] = useState<UIMessage[]>([])

  const doc = previewDoc(task, answer)
  const touched = index > 0 || tries > 0 || ready(task, answer)
  const slide = lang === 'ar' ? -28 : 28
  const ok = state === 'ok'

  const submit = () => {
    const result = check(task, answer)
    if (task.type === 'learn') return next()
    if (result.ok) {
      sound.playAscendingCorrect(index)
      setState('ok')
    } else {
      sound.playMistake()
      missed.current.add(task.id)
      setTries((n) => n + 1)
      setWhy(result.why ?? null)
      setState('bad')
    }
  }

  const go = (to: number) => {
    setIndex(to)
    setAnswer(blank(tasks[to]))
    setState('idle')
    setTries(0)
    setWhy(null)
  }
  const next = () => (index + 1 === tasks.length ? onFinish(missed.current.size) : go(index + 1))
  const back = () => {
    sound.playClick()
    go(index - 1)
  }
  const learn = task.type === 'learn'
  // What the tutor is told about this step, so "explain this more" has something to point at.
  const about = [t(task.prompt), task.type === 'learn' ? `${t(task.body)}\n${task.code}` : (task.show ?? '')].filter(Boolean).join('\n')

  // Android's back button: close the chat, then step back, then offer to leave.
  useEffect(() => {
    window.__bataaBack = () => {
      if (asking) setAsking(false)
      else if (leaving) setLeaving(false)
      else if (index > 0) back()
      else if (touched) setLeaving(true)
      else onExit()
      return true
    }
    return () => {
      delete window.__bataaBack
    }
  })

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-warm to-page to-40%">
      <header className="flex items-center gap-3 px-4" style={{ paddingTop: 'calc(var(--sat, env(safe-area-inset-top, 0px)) + 1rem)' }}>
        <IconButton label={t(ui.close)} onClick={() => (touched ? setLeaving(true) : onExit())}>
          <X className="h-5 w-5" strokeWidth={2.5} />
        </IconButton>
        <ProgressBar value={(index + (ok ? 1 : 0)) / tasks.length} label={`${index + 1} / ${tasks.length}`} />
        <button
          type="button"
          onClick={() => {
            sound.playClick()
            setAsking(true)
          }}
          className="glass flex h-10 shrink-0 items-center gap-1.5 rounded-full pe-3.5 ps-1.5 text-[14px] font-semibold text-ink shadow-soft transition-transform active:scale-95"
        >
          <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-brandSoft">
            <PondDuck level={1} size={20} />
          </span>
          {t(ui.askAi)}
        </button>
      </header>

      <main className="flex-1 overflow-x-hidden px-4 pb-6 pt-6">
        {/* Keyed so each task springs in from the reading direction. */}
        <motion.div key={task.id} className="grid gap-4" initial={{ opacity: 0, x: slide }} animate={{ opacity: 1, x: 0 }} transition={spring}>
          <div className="flex items-end gap-2">
            <Duck size={68} mood={learn ? 'talk' : ok ? 'happy' : state === 'bad' ? 'oops' : touched ? 'idle' : 'talk'} />
            <Bubble>{t(task.prompt)}</Bubble>
          </div>
          {task.type === 'learn' ? (
            // Teaching step: the idea in words, then the code that does it.
            <>
              <p className="card px-4 py-3.5 text-[16px] font-medium leading-relaxed text-ink">{t(task.body)}</p>
              <Code>{task.code}</Code>
            </>
          ) : (
            <>
              {task.show && <Code>{task.show}</Code>}
              <TaskBody
                task={task}
                answer={answer}
                locked={ok}
                onChange={(a) => {
                  setAnswer(a)
                  if (state === 'bad') setState('idle')
                }}
              />
            </>
          )}
          {doc && <Preview html={doc.html} css={doc.css} />}
        </motion.div>
      </main>

      <footer className="sticky bottom-0 z-10" style={{ paddingBottom: 'var(--sab, env(safe-area-inset-bottom, 0px))' }}>
        {state === 'idle' ? (
          <div className="flex items-center gap-3 bg-gradient-to-t from-page from-70% to-page/0 p-4 pt-6">
            {index > 0 && (
              <button
                type="button"
                aria-label={t(ui.back)}
                onClick={back}
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-ink shadow-soft transition-transform active:scale-95"
              >
                <ArrowLeft className={`h-5 w-5 ${lang === 'ar' ? 'rotate-180' : ''}`} strokeWidth={2.5} />
              </button>
            )}
            <div className="flex-1">
              <Button disabled={!ready(task, answer)} onClick={submit}>
                {t(learn ? ui.gotIt : ui.check)}
              </Button>
            </div>
          </div>
        ) : (
          // Floating result tray: springs up from the button it replaces.
          <motion.div
            key={state}
            role={ok ? 'status' : 'alert'}
            className={`m-3 grid gap-3.5 rounded-[28px] border p-4 shadow-float ${ok ? 'border-okLine bg-okSoft' : 'border-bad/20 bg-badSoft'}`}
            // Feedback pushed past real so the moment lands: right answers rise stretched and settle with a
            // small squash; wrong ones arrive with a short shake.
            style={{ originY: 1 }}
            initial={{ y: 48, opacity: 0 }}
            animate={ok ? { y: [48, 0, -4, 0], scaleY: [0.92, 1.04, 0.98, 1], scaleX: [1.02, 0.98, 1.01, 1], opacity: 1 } : { y: 0, x: [0, -9, 8, -5, 3, 0], opacity: 1 }}
            transition={
              ok
                ? { duration: 0.42, times: [0, 0.5, 0.75, 1], ease: 'easeOut', opacity: { duration: 0.12 } }
                : { y: spring, x: { duration: 0.36, delay: 0.1 }, opacity: { duration: 0.12 } }
            }
          >
            <div>
              <div>
                <h2 className={`text-[17px] font-semibold ${ok ? 'text-okDeep' : 'text-badDeep'}`}>{t(ok ? ui.correct : ui.notYet)}</h2>
                {task.type !== 'learn' && <p className="mt-0.5 text-[15px] font-medium leading-snug text-ink">{t(ok ? task.explain : (why ?? task.hint))}</p>}
              </div>
            </div>
            {ok ? (
              <Button tone="ok" autoFocus onClick={next}>
                {t(ui.next)}
              </Button>
            ) : (
              <>
                <Button tone="bad" onClick={() => setState('idle')}>
                  {t(ui.tryAgain)}
                </Button>
                {tries >= 2 && (
                  <Button
                    tone="text"
                    onClick={() => {
                      setAnswer(solution(task))
                      setState('idle')
                    }}
                  >
                    {t(ui.showSolution)}
                  </Button>
                )}
              </>
            )}
          </motion.div>
        )}
      </footer>

      {/* Bataa AI over the lesson, about this step. */}
      <AnimatePresence>
        {asking && (
          <motion.div className="fixed inset-0 z-50" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.34, ease: [0.65, 0, 0.35, 1] }}>
            <ChatBody
              p={p}
              signedIn={signedIn}
              plan={plan}
              onUpgrade={onUpgrade}
              initial={chat}
              onSave={setChat}
              step={{ title: t(task.prompt), about, onClose: () => setAsking(false) }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Tray open={leaving} onClose={() => setLeaving(false)} label={t(ui.leaveTitle)}>
        <div className="grid justify-items-center gap-1 pb-4 pt-1 text-center">
          <Duck mood="oops" size={84} />
          <h2 className="text-[20px] font-semibold tracking-tight">{t(ui.leaveTitle)}</h2>
          <p className="text-[15px] font-medium text-ink2">{t(ui.leaveBody)}</p>
        </div>
        <div className="grid gap-1">
          <Button onClick={() => setLeaving(false)}>{t(ui.keepGoing)}</Button>
          <Button tone="text" onClick={onExit}>
            {t(ui.leave)}
          </Button>
        </div>
      </Tray>
    </div>
  )
}
