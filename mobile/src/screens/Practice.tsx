import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import { ArrowLeft, Shuffle, Trash2 } from '@/components/Icon'
import { Duck } from '@/components/Duck'
import { GoogleButton } from '@/components/GoogleButton'
import { Code, IconButton, spring } from '@/components/ui'
import { lessons } from '@/data/course'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { askTutor, type ChatMessage } from '@/lib/tutor'
import { PondDuck } from '@/screens/Pond'
import type { Progress } from '@/state/progress'
import type { QuizTask, Task } from '@/types'

/** Up to five random questions from finished lessons (learn cards are not questions). */
export function reviewTasks(done: string[]): Task[] {
  const pool = lessons.filter((l) => done.includes(l.id)).flatMap((l) => l.tasks.filter((t): t is QuizTask => t.type !== 'learn'))
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 5)
}

const KEY = 'bataa.chat'
const load = (): ChatMessage[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').slice(-40) : []
  } catch {
    return []
  }
}

/** The tutor's text: ```fenced``` blocks become code cards, `backticks` inline code, "- " lines a list. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/```(\w*)\n?([\s\S]*?)(?:```|$)/g)
  const out: ReactNode[] = []
  for (let i = 0; i < parts.length; i += 3) {
    const prose = parts[i].trim()
    if (prose)
      prose.split(/\n{2,}/).forEach((para, j) => {
        const lines = para.split('\n')
        const list = lines.every((l) => /^\s*[-*•]\s/.test(l))
        out.push(
          list ? (
            <ul key={`${i}-${j}`} className="grid list-disc gap-1 ps-5">
              {lines.map((l, k) => (
                <li key={k}>{inline(l.replace(/^\s*[-*•]\s/, ''))}</li>
              ))}
            </ul>
          ) : (
            <p key={`${i}-${j}`} className="whitespace-pre-wrap">
              {inline(para)}
            </p>
          ),
        )
      })
    const code = parts[i + 2]
    if (code?.trim()) out.push(<Code key={`c${i}`}>{code.replace(/\n$/, '')}</Code>)
  }
  return <div className="grid gap-2.5">{out}</div>
}
const inline = (s: string) =>
  s.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((bit, i) =>
    bit.startsWith('`') ? (
      <code key={i} dir="ltr" className="rounded-md bg-brandSoft px-1.5 py-0.5 font-mono text-[0.88em] text-brandDeep">
        {bit.slice(1, -1)}
      </code>
    ) : bit.startsWith('**') ? (
      <b key={i}>{bit.slice(2, -2)}</b>
    ) : (
      bit
    ),
  )

/**
 * Practice is a chat with Bataa AI, a duck tutor (gpt-6.1-terra through the `tutor` Edge Function).
 * Learners ask about anything they are learning, or ask to be quizzed. The quick review of real lesson
 * questions stays one tap away in the header. Chatting needs a signed-in account.
 */
export function Practice({ p, signedIn, onReview }: { p: Progress; signedIn: boolean; onReview: () => void }) {
  const { t, lang } = useT()
  const [messages, setMessages] = useState<ChatMessage[]>(load)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const list = useRef<HTMLDivElement>(null)
  const stop = useRef<AbortController | null>(null)
  const finished = p.done.length > 0

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(messages.slice(-40)))
    } catch {
      // Storage full or blocked: the chat still works, it just is not kept.
    }
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [messages])
  useEffect(() => () => stop.current?.abort(), [])

  const send = async (text: string) => {
    const question = text.trim()
    if (!question || busy) return
    sound.playClick()
    const history: ChatMessage[] = [...messages, { role: 'user', content: question }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setDraft('')
    setBusy(true)
    stop.current = new AbortController()
    try {
      await askTutor(history, { lang, done: p.done, name: p.name }, (reply) => setMessages([...history, { role: 'assistant', content: reply }]), stop.current.signal)
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setMessages(history.slice(0, -1))
      setDraft(question)
      toast.error(t((e as Error).message === 'sign_in' ? ui.aiSignIn : ui.aiError))
    } finally {
      setBusy(false)
    }
  }

  const chips = [ui.aiChipQuiz, ui.aiChipExplain, ui.aiChipPadding, ui.aiChipCenter]
  const waiting = busy && messages[messages.length - 1]?.content === ''

  return (
    <div className="flex h-dvh flex-col" style={{ paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))' }}>
      <header className="flex items-center gap-3 px-4 pb-2 pt-3">
        <span className="glass grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full">
          <Duck mood={busy ? 'think' : 'talk'} size={52} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-[20px] font-semibold leading-tight tracking-tight">{t(ui.aiTitle)}</h1>
          <p className="truncate text-[13px] font-medium text-ink2">{t(busy ? ui.aiThinking : ui.aiSubtitle)}</p>
        </div>
        {finished && (
          <button
            type="button"
            onClick={onReview}
            className="glass flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold active:scale-95 transition-transform"
          >
            <Shuffle className="h-4 w-4" />
            {t(ui.quickReview)}
          </button>
        )}
        {messages.length > 0 && (
          <IconButton
            label={t(ui.aiNewChat)}
            onClick={() => {
              stop.current?.abort()
              setBusy(false)
              setMessages([])
            }}
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </IconButton>
        )}
      </header>

      {/* The conversation. Room at the bottom for the input and the tab bar (or the keyboard). */}
      <div ref={list} className="flex-1 overflow-y-auto overscroll-contain px-4 pb-60 pt-2">
        <div className="grid gap-3">
          <Said who="assistant">
            <p>{t(ui.aiWelcome)}</p>
          </Said>
          {messages.length === 0 && (
            <motion.div className="flex flex-wrap gap-2 ps-10" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.15 }}>
              {chips.map((c) => (
                <button
                  key={c.en}
                  type="button"
                  disabled={!signedIn}
                  onClick={() => send(t(c))}
                  className="glass rounded-full px-3.5 py-2 text-start text-[14px] font-semibold text-ink active:scale-95 transition-transform disabled:opacity-50"
                >
                  {t(c)}
                </button>
              ))}
            </motion.div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m, i) =>
              m.role === 'assistant' && !m.content ? null : (
                <Said key={i} who={m.role}>
                  {m.role === 'assistant' ? <Rich text={m.content} /> : <p className="whitespace-pre-wrap">{m.content}</p>}
                </Said>
              ),
            )}
          </AnimatePresence>
          {waiting && (
            <Said who="assistant">
              <span className="flex h-5 items-center gap-1" aria-label={t(ui.aiThinking)}>
                {[0, 1, 2].map((d) => (
                  <motion.span key={d} className="h-2 w-2 rounded-full bg-ink3" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }} />
                ))}
              </span>
            </Said>
          )}
        </div>
      </div>

      {/* Input: floats above the tab bar, or above the keyboard while typing (--kb, from the Android app). */}
      <div
        className="fixed inset-x-3 z-40 mx-auto max-w-[424px]"
        style={{ bottom: 'max(calc(var(--kb, 0px) + 0.5rem), calc(var(--sab, env(safe-area-inset-bottom, 0px)) + 6rem))' }}
      >
        {signedIn ? (
          <form
            className="glass flex items-end gap-2 rounded-[26px] p-1.5 ps-4 shadow-float"
            onSubmit={(e) => {
              e.preventDefault()
              send(draft)
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(draft)
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder={t(ui.aiPlaceholder)}
              aria-label={t(ui.aiPlaceholder)}
              className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[16px] font-medium leading-snug text-ink outline-none placeholder:text-ink3 [field-sizing:content]"
            />
            <button
              type="submit"
              disabled={!draft.trim() || busy}
              aria-label={t(ui.aiSend)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-ink transition-transform active:scale-90 disabled:bg-lip disabled:text-ink3"
            >
              <ArrowLeft className="h-5 w-5 rotate-90" />
            </button>
          </form>
        ) : (
          <div className="glass grid gap-2 rounded-[26px] p-3 shadow-float">
            <p className="px-1 text-center text-[14px] font-medium text-ink2">{t(ui.aiSignIn)}</p>
            <GoogleButton />
          </div>
        )}
      </div>
    </div>
  )
}

/** One chat bubble. The tutor's sit on the start side with the duck; the learner's on the end side, in orange. */
function Said({ who, children }: { who: ChatMessage['role']; children: ReactNode }) {
  const me = who === 'user'
  return (
    <motion.div
      className={`flex items-end gap-2 ${me ? 'justify-end' : ''}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring}
    >
      {!me && (
        <span aria-hidden className="mb-1 grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-brandSoft">
          <PondDuck level={1} size={22} />
        </span>
      )}
      <div
        className={`max-w-[85%] px-4 py-3 text-[15px] font-medium leading-relaxed ${me ? 'rounded-[22px] rounded-ee-md bg-accent text-ink' : 'card min-w-0 flex-1 rounded-[22px] rounded-es-md text-ink'}`}
      >
        {children}
      </div>
    </motion.div>
  )
}
