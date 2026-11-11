import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Lightbulb, X } from 'lucide-react'
import { Duck } from '@/components/Duck'
import { Bubble, Button, Code, IconButton, Preview, ProgressBar, Tray, spring } from '@/components/ui'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import type { Answer, L, Task } from '@/types'
import { blank, check, previewDoc, ready, solution } from './engine'
import { TaskBody } from './TaskBody'

/**
 * Runs a list of tasks: answer, check, explain, retry or continue.
 * Mistakes never end the lesson; `onFinish` reports how many tasks needed a retry.
 */
export function LessonRunner({ tasks, onExit, onFinish }: { tasks: Task[]; onExit: () => void; onFinish: (missed: number) => void }) {
  const { t, lang } = useT()
  const [index, setIndex] = useState(0)
  const task = tasks[index]
  const [answer, setAnswer] = useState<Answer>(() => blank(task))
  const [state, setState] = useState<'idle' | 'ok' | 'bad'>('idle')
  const [why, setWhy] = useState<L>(task.hint)
  const [tries, setTries] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const missed = useRef(new Set<string>())

  const doc = previewDoc(task, answer)
  const touched = index > 0 || tries > 0 || ready(task, answer)
  const slide = lang === 'ar' ? -28 : 28
  const ok = state === 'ok'

  const submit = () => {
    const result = check(task, answer)
    if (result.ok) {
      sound.playAscendingCorrect(index)
      setState('ok')
    } else {
      sound.playMistake()
      missed.current.add(task.id)
      setTries((n) => n + 1)
      setWhy(result.why ?? task.hint)
      setState('bad')
    }
  }

  const next = () => {
    if (index + 1 === tasks.length) return onFinish(missed.current.size)
    setIndex(index + 1)
    setAnswer(blank(tasks[index + 1]))
    setState('idle')
    setTries(0)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-warm to-white to-40%">
      <header className="flex items-center gap-3 px-4 pt-4">
        <IconButton label={t(ui.close)} onClick={() => (touched ? setLeaving(true) : onExit())}>
          <X className="h-5 w-5" strokeWidth={2.5} />
        </IconButton>
        <ProgressBar value={(index + (ok ? 1 : 0)) / tasks.length} label={`${index + 1} / ${tasks.length}`} />
        <span className="w-9 text-end text-[13px] font-semibold tabular-nums text-ink2">
          {index + 1}/{tasks.length}
        </span>
      </header>

      <main className="flex-1 overflow-x-hidden px-4 pb-6 pt-6">
        {/* Keyed so each task springs in from the reading direction. */}
        <motion.div key={task.id} className="grid gap-4" initial={{ opacity: 0, x: slide }} animate={{ opacity: 1, x: 0 }} transition={spring}>
          <div className="flex items-end gap-2">
            <Duck size={68} mood={ok ? 'happy' : state === 'bad' ? 'oops' : touched ? 'idle' : 'talk'} />
            <Bubble>{t(task.prompt)}</Bubble>
          </div>
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
          {doc && <Preview html={doc.html} css={doc.css} />}
        </motion.div>
      </main>

      <footer className="sticky bottom-0 z-10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {state === 'idle' ? (
          <div className="bg-gradient-to-t from-white from-70% to-white/0 p-4 pt-6">
            <Button disabled={!ready(task, answer)} onClick={submit}>
              {t(ui.check)}
            </Button>
          </div>
        ) : (
          // Floating result tray: springs up from the button it replaces.
          <motion.div
            key={state}
            role={ok ? 'status' : 'alert'}
            className={`m-3 grid gap-3.5 rounded-[28px] border p-4 shadow-float ${ok ? 'border-okLine bg-okSoft' : 'border-bad/20 bg-badSoft'}`}
            initial={{ y: 48, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={spring}
          >
            <div className="flex gap-3">
              <motion.span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white ${ok ? 'bg-ok' : 'bg-bad'}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...spring, delay: 0.08 }}
              >
                {ok ? <Check className="h-5 w-5" strokeWidth={3.2} /> : <Lightbulb className="h-5 w-5" strokeWidth={2.4} />}
              </motion.span>
              <div>
                <h2 className={`text-[17px] font-semibold ${ok ? 'text-okDeep' : 'text-badDeep'}`}>{t(ok ? ui.correct : ui.notYet)}</h2>
                <p className="mt-0.5 text-[15px] font-medium leading-snug text-ink">{t(ok ? task.explain : why)}</p>
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
