import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { Duck } from '@/components/Duck'
import { Bubble, Button, Code, Preview, ProgressBar, Sheet } from '@/components/ui'
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
  const slide = lang === 'ar' ? -24 : 24

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
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 px-4 pt-4">
        <button
          type="button"
          aria-label={t(ui.close)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink2 active:bg-line"
          onClick={() => (touched ? setLeaving(true) : onExit())}
        >
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <ProgressBar value={(index + (state === 'ok' ? 1 : 0)) / tasks.length} label={`${index + 1} / ${tasks.length}`} />
        <span className="w-9 text-end text-[13px] font-extrabold tabular-nums text-ink2">
          {index + 1}/{tasks.length}
        </span>
      </header>

      <main className="flex-1 overflow-x-hidden px-4 pb-6 pt-5">
          <motion.div
            key={task.id}
            className="grid gap-4"
            initial={{ opacity: 0, x: slide }}
            animate={{ opacity: 1, x: 0 }}
           
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="flex items-end gap-2">
              <Duck size={72} mood={state === 'ok' ? 'happy' : state === 'bad' ? 'oops' : touched ? 'idle' : 'talk'} />
              <Bubble>{t(task.prompt)}</Bubble>
            </div>
            {task.show && <Code>{task.show}</Code>}
            <TaskBody
              task={task}
              answer={answer}
              locked={state === 'ok'}
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
            <motion.div key="check" className="border-t-2 border-line bg-bg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
              <Button disabled={!ready(task, answer)} onClick={submit}>
                {t(ui.check)}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={state}
              role={state === 'bad' ? 'alert' : 'status'}
              className={`grid gap-3 rounded-t-[24px] border-t-2 p-4 ${state === 'ok' ? 'border-ok/30 bg-okSoft' : 'border-bad/30 bg-badSoft'}`}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
             
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              <div className="flex gap-3">
                {state === 'ok' ? <CircleCheck className="h-7 w-7 shrink-0 text-ok" /> : <CircleAlert className="h-7 w-7 shrink-0 text-bad" />}
                <div>
                  <h2 className={`text-[18px] font-black ${state === 'ok' ? 'text-okDeep' : 'text-badDeep'}`}>{t(state === 'ok' ? ui.correct : ui.notYet)}</h2>
                  <p className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">{t(state === 'ok' ? task.explain : why)}</p>
                </div>
              </div>
              {state === 'ok' ? (
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

      <Sheet open={leaving} onClose={() => setLeaving(false)} label={t(ui.leaveTitle)}>
        <h2 className="text-[20px] font-black">{t(ui.leaveTitle)}</h2>
        <p className="mb-5 mt-1 text-[15px] font-semibold text-ink2">{t(ui.leaveBody)}</p>
        <div className="grid gap-2">
          <Button onClick={() => setLeaving(false)}>{t(ui.keepGoing)}</Button>
          <Button tone="text" onClick={onExit}>
            {t(ui.leave)}
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
