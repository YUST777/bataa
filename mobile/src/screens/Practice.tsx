import { isValidElement, startTransition, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useChat } from '@ai-sdk/react'
import type { UIMessage } from 'ai'
import { Streamdown } from 'streamdown'
import { toast } from 'sonner'
import { ArrowLeft, BookOpenCheck, ListChecks, Shuffle, Target, Trash2, Zap } from '@/components/Icon'
import { GoogleButton } from '@/components/GoogleButton'
import { IconButton, Preview } from '@/components/ui'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { textOf, tutorTransport, type TutorContext } from '@/lib/tutor'
import { deleteChat, loadChats, saveChat, syncChats, titleOf, type SavedChat } from '@/lib/chats'
import { DAILY, aiUsedToday, type Plan } from '@/lib/plans'
import type { Progress } from '@/state/progress'

/** Every animation in Waddle AI eases in and out the same way: no springs, no bounce. */
const smooth = { duration: 0.4, ease: [0.65, 0, 0.35, 1] } as const

/** Small line icons drawn here, in the style of the icon sheet. */
export const Glyph = {
  copy: 'M9 9h9v11H9zM6 15H5V4h11v1',
  menu: 'M4 8h16M4 16h10',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  again: 'M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4',
  down: 'M12 5v14M6 13l6 6 6-6',
  stop: 'M8 8h8v8H8z',
  eye: 'M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12zM12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z',
  spark: 'M12 3c.5 4.6 4.4 8.5 9 9-4.6.5-8.5 4.4-9 9-.5-4.6-4.4-8.5-9-9 4.6-.5 8.5-4.4 9-9z',
}
export function G({ d, className = 'h-[18px] w-[18px]', fill = false }: { d: string; className?: string; fill?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

async function copy(text: string, t: (l: { en: string; ar: string }) => string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(t(ui.aiCopied))
  } catch {
    toast.error(t(ui.aiCopyFailed))
  }
}

/** A code block in a reply: copy it, and see HTML or CSS run live in the same preview the lessons use. */
function ChatCode({ lang, code }: { lang: string; code: string }) {
  const { t } = useT()
  const [html, setHtml] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const runs = lang === 'html' || lang === 'css'
  useEffect(() => {
    let live = true
    import('@/lib/highlight')
      .then((m) => m.highlight(code))
      .then(
        (h) => live && setHtml(h),
        () => {},
      )
    return () => {
      live = false
    }
  }, [code])
  return (
    <div dir="ltr" className="my-1 overflow-hidden rounded-[20px] bg-code shadow-soft">
      <div className="flex items-center gap-2 border-b border-white/10 py-1.5 pe-1.5 ps-4">
        <span className="me-auto font-mono text-[12px] font-medium uppercase tracking-wide text-white/50">{lang || 'code'}</span>
        {runs && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-colors ${open ? 'bg-accent text-ink' : 'bg-white/10 text-white/80'}`}
          >
            <G d={Glyph.eye} className="h-4 w-4" />
            {t(ui.aiPreview)}
          </button>
        )}
        <button
          type="button"
          aria-label={t(ui.aiCopy)}
          onClick={() => copy(code, t)}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/80 active:scale-90 transition-transform"
        >
          <G d={Glyph.copy} className="h-4 w-4" />
        </button>
      </div>
      <pre className="codeblock rounded-none">{html ? <code dangerouslySetInnerHTML={{ __html: html }} /> : <code>{code}</code>}</pre>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.65, 0, 0.35, 1] }}
            className="overflow-hidden bg-white"
          >
            <Preview html={lang === 'html' ? code : '<button>Start learning</button>\n<h1>Title</h1>\n<p>Some text.</p>'} css={lang === 'css' ? code : ''} height={150} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Markdown elements for the tutor's replies (Streamdown renders while the text streams in). */
const markdown = {
  pre: ({ children }: { children?: ReactNode }) => {
    const el = (Array.isArray(children) ? children[0] : children) as ReactElement<{ className?: string; children?: ReactNode }>
    if (!isValidElement(el)) return <pre>{children}</pre>
    const lang = /language-([\w-]+)/.exec(el.props.className ?? '')?.[1] ?? ''
    return <ChatCode lang={lang} code={String(el.props.children ?? '').replace(/\n$/, '')} />
  },
  code: ({ children, className }: { children?: ReactNode; className?: string }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code dir="ltr" className="rounded-md bg-brandSoft px-1.5 py-0.5 font-mono text-[0.88em] font-medium text-brandDeep">
        {children}
      </code>
    ),
}

/**
 * Practice is a chat with Waddle AI, a duck tutor (gpt-6.1-terra through the `tutor` Edge Function), built
 * on the AI SDK's useChat: streaming replies, stop, regenerate and errors. Replies render as markdown with
 * code cards that copy and run live. A soft aurora moves behind it. Chatting needs a signed-in account;
 * the quick review of real lesson questions stays in the header.
 */
export function ChatBody({
  p,
  signedIn,
  onReview,
  onMenu,
  initial,
  onSave,
  plan,
  onUpgrade,
  step,
}: {
  p: Progress
  signedIn: boolean
  plan: Plan
  onUpgrade: () => void
  onReview?: () => void
  onMenu?: () => void
  initial: UIMessage[]
  onSave: (messages: UIMessage[]) => void
  /** Opened from a lesson: asks about that step (`about` goes to the tutor as context), closes back to it. */
  step?: { title: string; about: string; onClose: () => void }
}) {
  const { t, lang } = useT()
  const context = useRef<TutorContext>({ lang, done: p.done, name: p.name, step: step?.about })
  context.current = { lang, done: p.done, name: p.name, step: step?.about }
  const transport = useMemo(() => tutorTransport(() => context.current), [])
  const { messages, sendMessage, status, stop, regenerate, error, clearError } = useChat({ transport, messages: initial })
  const [draft, setDraft] = useState('')
  const [atEnd, setAtEnd] = useState(true)
  const list = useRef<HTMLDivElement>(null)
  const busy = status === 'submitted' || status === 'streaming'
  const finished = p.done.length > 0 && !!onReview
  // Messages left today on this plan, from the same count the tutor function keeps.
  const [used, setUsed] = useState<number | null>(null)
  useEffect(() => {
    if (signedIn && status === 'ready') aiUsedToday().then(setUsed, () => {})
  }, [signedIn, plan, status])

  useEffect(() => {
    // Only real changes: opening an old chat must not move it to the top of the list.
    const unchanged = messages.length === initial.length && messages[messages.length - 1]?.id === initial[initial.length - 1]?.id
    if (!busy && messages.length && !unchanged) onSave(messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, busy])
  // Follow the reply as it streams in, unless the learner scrolled up to read.
  useEffect(() => {
    if (atEnd) list.current?.scrollTo({ top: list.current.scrollHeight })
  }, [messages, status, atEnd])

  const send = (text: string) => {
    const q = text.trim()
    if (!q || busy || !signedIn) return
    sound.playClick()
    clearError()
    setAtEnd(true)
    setDraft('')
    sendMessage({ text: q })
  }

  const limited = !!error && /"limit"/.test(error.message)
  const errorText = error ? t(limited ? ui.aiLimit : /sign_in/.test(error.message) ? ui.aiSignIn : ui.aiError) : null
  const last = messages[messages.length - 1]
  const cards = step
    ? [
        { icon: BookOpenCheck, title: ui.askMore, body: null, ask: ui.askMore },
        { icon: Zap, title: ui.askExample, body: null, ask: ui.askExample },
        { icon: ListChecks, title: ui.askWhy, body: null, ask: ui.askWhy },
        { icon: Target, title: ui.askStuck, body: null, ask: ui.askStuck },
      ]
    : [
        { icon: Target, title: ui.aiCardQuizTitle, body: ui.aiCardQuizBody, ask: ui.aiChipQuiz },
        { icon: BookOpenCheck, title: ui.aiCardExplainTitle, body: ui.aiCardExplainBody, ask: ui.aiChipExplain },
        { icon: Zap, title: ui.aiCardBuildTitle, body: ui.aiCardBuildBody, ask: ui.aiChipBuild },
        { icon: ListChecks, title: ui.aiCardCompareTitle, body: ui.aiCardCompareBody, ask: ui.aiChipPadding },
      ]
  const followUps = [ui.aiFollowSimpler, ui.aiFollowExample, ui.aiFollowQuiz]

  return (
    <div className="relative isolate flex h-dvh flex-col overflow-hidden" style={{ paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))' }}>
      {/* Aurora: warm light drifting slowly behind the chat. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-page">
        <span className="aurora-a absolute -start-24 -top-24 h-[22rem] w-[22rem] rounded-full bg-[#FFB46B]/55 blur-3xl" />
        <span className="aurora-b absolute -end-28 top-40 h-[20rem] w-[20rem] rounded-full bg-[#FF9C8A]/35 blur-3xl" />
        <span className="aurora-c absolute -bottom-20 start-10 h-[18rem] w-[18rem] rounded-full bg-[#FFD966]/40 blur-3xl" />
        <span className="absolute inset-0 bg-[radial-gradient(rgba(122,106,93,.13)_1px,transparent_1.2px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)]" />
      </div>

      <header className="flex items-center gap-2 px-4 pb-1 pt-3">
        {step ? (
          <IconButton label={t(ui.close)} onClick={step.onClose}>
            <G d={Glyph.close} className="h-5 w-5" />
          </IconButton>
        ) : (
          <IconButton label={t(ui.aiChats)} onClick={onMenu ?? (() => {})}>
            <G d={Glyph.menu} className="h-5 w-5" />
          </IconButton>
        )}
        <div className="me-auto flex min-w-0 items-center gap-2">
          <div className="min-w-0">
            <h1 className="text-[18px] font-semibold leading-tight tracking-tight">{t(ui.aiTitle)}</h1>
            <p className={`truncate text-[11px] font-semibold text-ink3 ${step ? '' : 'uppercase tracking-wide'}`}>{step ? step.title : 'gpt-6.1 terra'}</p>
          </div>
        </div>
        {finished && (
          <button
            type="button"
            onClick={onReview}
            className="glass flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold active:scale-95 transition-transform"
          >
            <Shuffle className="h-4 w-4" />
            {t(ui.quickReview)}
          </button>
        )}
      </header>

      <div
        ref={list}
        onScroll={(e) => {
          const el = e.currentTarget
          setAtEnd(el.scrollHeight - el.scrollTop - el.clientHeight < 80)
        }}
        className="flex-1 overflow-y-auto overscroll-contain px-4 pt-2"
        // Messages fade out under the header instead of cutting off against it.
        style={{
          paddingBottom: `calc(var(--sab, env(safe-area-inset-bottom, 0px)) + ${step ? 10 : 15}rem)`,
          maskImage: 'linear-gradient(to bottom, transparent, #000 28px)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 28px)',
        }}
      >
        {messages.length === 0 ? (
          // Greeting, like the big mobile assistants: a hello, then a few things to start with.
          <div className="grid gap-6 pt-[8vh]">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={smooth} className="grid gap-1 px-1">
              <h2 className="ai-gradient text-[34px] font-bold leading-[1.1] tracking-tight">
                {step ? t(ui.askTitle) : t(ui.aiHello)}
                {!step && p.name ? `, ${p.name}` : ''}
              </h2>
              <p className={`font-semibold leading-[1.15] tracking-tight text-ink3 ${step ? 'text-[20px]' : 'text-[28px]'}`}>{step ? step.title : t(ui.aiHelloSub)}</p>
            </motion.div>
            <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
              {cards.map((c, i) => (
                <motion.button
                  key={c.title.en}
                  type="button"
                  disabled={!signedIn}
                  onClick={() => send(t(c.ask))}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...smooth, delay: 0.08 + i * 0.06 }}
                  className="glass flex h-[132px] w-[148px] shrink-0 snap-start flex-col justify-between rounded-[24px] p-4 text-start active:scale-[.97] transition-transform disabled:opacity-60"
                >
                  <span className="text-[15px] font-semibold leading-snug text-ink">
                    {t(c.title)}
                    {c.body && <span className="mt-0.5 block text-[13px] font-medium text-ink2">{t(c.body)}</span>}
                  </span>
                  <span className="grid h-9 w-9 place-items-center self-end rounded-full bg-white/80">
                    <c.icon className="h-5 w-5" />
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-5">
            {messages.map((m) => {
              const text = textOf(m)
              const live = busy && m === last && m.role === 'assistant'
              if (m.role === 'user')
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={smooth} className="flex justify-end">
                    <p className="max-w-[82%] whitespace-pre-wrap rounded-[24px] rounded-ee-lg bg-white/90 px-4 py-2.5 text-[15px] font-medium leading-relaxed text-ink shadow-soft">
                      {text}
                    </p>
                  </motion.div>
                )
              return (
                <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-brandSoft ${live ? 'ai-pulse' : ''}`}>
                      <G d={Glyph.spark} fill className="h-4 w-4 text-brand" />
                    </span>
                    <span className="text-[13px] font-semibold text-ink2">Waddle</span>
                  </div>
                  <div className="ai-md text-[15.5px] leading-relaxed text-ink">
                    <Streamdown mode={live ? 'streaming' : 'static'} isAnimating={live} caret={live ? 'block' : undefined} controls={false} components={markdown}>
                      {text}
                    </Streamdown>
                  </div>
                  {!live && text && (
                    <div className="-ms-2 flex items-center gap-1 text-ink2">
                      <button type="button" aria-label={t(ui.aiCopy)} onClick={() => copy(text, t)} className="grid h-9 w-9 place-items-center rounded-full active:bg-white/70">
                        <G d={Glyph.copy} />
                      </button>
                      {m === last && (
                        <button
                          type="button"
                          aria-label={t(ui.aiRegenerate)}
                          onClick={() => regenerate()}
                          className="grid h-9 w-9 place-items-center rounded-full active:bg-white/70"
                        >
                          <G d={Glyph.again} />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            })}
            {status === 'submitted' && (
              <div className="flex items-center gap-2">
                <span className="ai-pulse grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-brandSoft">
                  <G d={Glyph.spark} fill className="h-4 w-4 text-brand" />
                </span>
                <span className="ai-shimmer text-[15px] font-semibold">{t(ui.aiThinking)}</span>
              </div>
            )}
            {errorText && (
              <div className="flex items-center gap-3 rounded-[20px] border border-bad/20 bg-badSoft/90 px-4 py-3">
                <p className="flex-1 text-[14px] font-medium text-badDeep">{errorText}</p>
                {limited ? (
                  <button type="button" onClick={onUpgrade} className="rounded-full bg-accent px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-soft">
                    {t(ui.upgrade)}
                  </button>
                ) : (
                  signedIn && (
                    <button type="button" onClick={() => regenerate()} className="rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-ink shadow-soft">
                      {t(ui.tryAgain)}
                    </button>
                  )
                )}
              </div>
            )}
            {status === 'ready' && last?.role === 'assistant' && (
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
                {followUps.map((f) => (
                  <button
                    key={f.en}
                    type="button"
                    onClick={() => send(t(f))}
                    className="glass shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold text-ink active:scale-95 transition-transform"
                  >
                    {t(f)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer: above the tab bar, or above the keyboard while typing (--kb, from the Android app). */}
      <div
        className="fixed inset-x-3 z-40 mx-auto max-w-[424px]"
        // In a lesson there is no tab bar to sit above.
        style={{ bottom: `max(calc(var(--kb, 0px) + 0.5rem), calc(var(--sab, env(safe-area-inset-bottom, 0px)) + ${step ? 0.75 : 6}rem))` }}
      >
        <AnimatePresence>
          {!atEnd && (
            <motion.button
              type="button"
              aria-label={t(ui.aiToBottom)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setAtEnd(true)
                list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
              }}
              className="glass absolute -top-14 start-1/2 -ms-5 grid h-10 w-10 place-items-center rounded-full shadow-float"
            >
              <G d={Glyph.down} />
            </motion.button>
          )}
        </AnimatePresence>
        {signedIn ? (
          <form
            className="glass rounded-[28px] p-2 shadow-float"
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
              className="block max-h-32 min-h-[44px] w-full resize-none bg-transparent px-3 pt-2.5 text-[16px] font-medium leading-snug text-ink outline-none placeholder:text-ink3 [field-sizing:content]"
            />
            <div className="flex items-center gap-2 px-1 pt-1">
              <span className="flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[12px] font-semibold text-ink2">
                <G d={Glyph.spark} fill className="h-3.5 w-3.5 text-brand" />
                {used !== null ? `${Math.max(0, DAILY[plan] - used)}/${DAILY[plan]} ${t(ui.aiLeft)}` : 'HTML · CSS'}
              </span>
              {plan === 'free' && (
                <button type="button" onClick={onUpgrade} className="rounded-full bg-gradient-to-b from-[#FFC533] to-[#F2A100] px-2.5 py-1 text-[11px] font-bold text-[#4A2A12]">
                  PRO
                </button>
              )}
              <span className="me-auto" />
              {busy ? (
                <button
                  type="button"
                  aria-label={t(ui.aiStop)}
                  onClick={() => stop()}
                  className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white active:scale-90 transition-transform"
                >
                  <G d={Glyph.stop} fill className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label={t(ui.aiSend)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-accent text-ink transition-transform active:scale-90 disabled:bg-lip disabled:text-ink3"
                >
                  <ArrowLeft className="h-5 w-5 rotate-90" />
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="glass grid gap-2 rounded-[28px] p-3 shadow-float">
            <p className="px-1 text-center text-[14px] font-medium text-ink2">{t(ui.aiSignIn)}</p>
            <GoogleButton />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Practice is a chat with Waddle AI. Chats are kept on the phone and in the account (lib/chats); the menu button opens a side drawer with
 * a new chat and every earlier one (newest first), each deletable.
 */
export function Practice({ p, signedIn, plan, onUpgrade, onReview }: { p: Progress; signedIn: boolean; plan: Plan; onUpgrade: () => void; onReview: () => void }) {
  const { t, lang } = useT()
  const [chats, setChats] = useState<SavedChat[]>(loadChats)
  const [current, setCurrent] = useState<string>(() => crypto.randomUUID())
  const [drawer, setDrawer] = useState(false)
  // Signed in: bring in the account's chats (from other phones) and upload any made only here.
  useEffect(() => {
    if (!signedIn) return
    let live = true
    syncChats().then((merged) => live && merged && setChats(merged))
    return () => {
      live = false
    }
  }, [signedIn])
  const open = chats.find((c) => c.id === current)
  const save = (messages: UIMessage[]) => setChats(saveChat({ id: current, title: titleOf(messages), at: Date.now(), messages }))
  const fresh = () => {
    setCurrent(crypto.randomUUID())
    setDrawer(false)
  }
  const when = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short' })
  const today = new Date().toDateString()

  return (
    <MotionConfig transition={smooth}>
      <ChatBody
        key={current}
        p={p}
        signedIn={signedIn}
        plan={plan}
        onUpgrade={onUpgrade}
        onReview={onReview}
        onMenu={() => setDrawer(true)}
        initial={open?.messages ?? []}
        onSave={save}
      />
      <AnimatePresence>
        {drawer && (
          <motion.div
            key="dim"
            className="fixed inset-0 z-50 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={smooth}
            onClick={() => setDrawer(false)}
          />
        )}
        {drawer && (
          <motion.aside
            key="drawer"
            aria-label={t(ui.aiChats)}
            // Solid, not frosted: a blur under a moving panel stutters on phones.
            className="fixed inset-y-0 start-0 z-50 flex w-[84%] max-w-[330px] flex-col rounded-e-[28px] bg-page shadow-float"
            style={{ paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))', paddingBottom: 'var(--sab, env(safe-area-inset-bottom, 0px))' }}
            initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
            transition={smooth}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={lang === 'ar' ? { left: 0, right: 0.6 } : { left: 0.6, right: 0 }}
            onDragEnd={(_, info) => (lang === 'ar' ? info.offset.x > 80 : info.offset.x < -80) && setDrawer(false)}
          >
            <div className="flex items-center gap-2 px-4 pb-3 pt-4">
              <h2 className="me-auto text-[20px] font-semibold tracking-tight">{t(ui.aiChats)}</h2>
              <IconButton label={t(ui.close)} onClick={() => setDrawer(false)}>
                <G d={Glyph.close} />
              </IconButton>
            </div>
            <div className="px-3">
              <button
                type="button"
                onClick={fresh}
                className="flex h-12 w-full items-center gap-2.5 rounded-full bg-accent px-4 text-[15px] font-semibold text-ink active:scale-[.98] transition-transform"
              >
                <G d={Glyph.plus} />
                {t(ui.aiNewChat)}
              </button>
            </div>
            <p className="px-5 pb-1 pt-5 text-[12px] font-semibold uppercase tracking-wide text-ink3">{t(ui.aiRecent)}</p>
            <ul className="flex-1 overflow-y-auto px-2 pb-4">
              {chats.length === 0 && <li className="px-3 py-2 text-[14px] font-medium text-ink3">{t(ui.aiNoChats)}</li>}
              {chats.map((c, i) => (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, x: lang === 'ar' ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...smooth, delay: 0.12 + Math.min(i, 8) * 0.035 }}
                  className={`group flex items-center rounded-2xl ${c.id === current ? 'bg-white shadow-soft' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setDrawer(false)
                      // Drawing a long chat is heavy: as a transition it never stalls the drawer sliding shut.
                      startTransition(() => setCurrent(c.id))
                    }}
                    className="min-w-0 flex-1 px-3 py-2.5 text-start"
                  >
                    <span className="block truncate text-[15px] font-semibold text-ink">{c.title || t(ui.aiNewChat)}</span>
                    <span className="block text-[12px] font-medium text-ink3">{new Date(c.at).toDateString() === today ? t(ui.today) : when.format(c.at)}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={t(ui.aiDeleteChat)}
                    onClick={() => {
                      setChats(deleteChat(c.id))
                      if (c.id === current) setCurrent(crypto.randomUUID())
                    }}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink3 active:bg-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.aside>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
