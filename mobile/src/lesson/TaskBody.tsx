import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Code } from '@/components/ui'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import type { Answer, ChoiceTask, CodeTask, FillTask, MatchTask, OrderTask, Task } from '@/types'

interface Props<T extends Task> {
  task: T
  answer: Answer
  onChange: (answer: Answer) => void
  /** True once the answer is accepted: inputs stay visible but stop responding. */
  locked: boolean
}

const Help = ({ children }: { children: string }) => <p className="text-[13px] font-bold text-ink2">{children}</p>

function Choice({ task, answer, onChange, locked }: Props<ChoiceTask>) {
  const { t } = useT()
  return (
    <div role="group" className="grid gap-3">
      {task.options.map((o) => {
        const isCode = typeof o.text === 'string'
        return (
          <button
            key={o.id}
            type="button"
            className="pick flex items-center gap-3"
            aria-pressed={answer === o.id}
            disabled={locked}
            onClick={() => {
              sound.playClick()
              onChange(o.id)
            }}
          >
            <span dir={isCode ? 'ltr' : undefined} className={isCode ? 'font-mono' : ''}>{t(o.text)}</span>
            {answer === o.id && <Check className="ms-auto h-5 w-5 shrink-0 text-brand" strokeWidth={3} />}
          </button>
        )
      })}
    </div>
  )
}

function Fill({ task, answer, onChange, locked }: Props<FillTask>) {
  const { t } = useT()
  const [before, after] = task.code.split('___')
  return (
    <div className="grid gap-3">
      <Code>
        {before}
        <span className={`chip mx-0.5 ${answer ? 'bg-brand text-white' : 'border-2 border-dashed border-sun text-sun'}`}>
          {(answer as string) || '?'}
        </span>
        {after}
      </Code>
      <Help>{t(ui.pickToken)}</Help>
      <div role="group" dir="ltr" className="grid grid-cols-2 gap-3">
        {task.bank.map((token) => (
          <button
            key={token}
            type="button"
            className="pick text-center font-mono"
            aria-pressed={answer === token}
            disabled={locked}
            onClick={() => {
              sound.playClick()
              onChange(token)
            }}
          >
            {token}
          </button>
        ))}
      </div>
    </div>
  )
}

function Order({ task, answer, onChange, locked }: Props<OrderTask>) {
  const { t } = useT()
  const picked = answer as number[]
  const [before, after] = task.wrap?.split('___') ?? []
  // Tokens pop in where they land. No shared layoutId: it left the lesson's exit transition hanging.
  const token = (i: number, onClick: () => void) => (
    <motion.button
      key={i}
      type="button"
      className="pick min-h-[44px] px-3 py-2 font-mono text-[14px]"
      disabled={locked}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 28 }}
      onClick={() => {
        sound.playClick()
        onClick()
      }}
    >
      {task.bank[i]}
    </motion.button>
  )
  return (
    <div className="grid gap-3">
      {task.wrap && (
        <Code>
          {before}
          <span className="text-sun">{picked.map((i) => task.bank[i]).join(' ') || '?'}</span>
          {after}
        </Code>
      )}
      <Help>{t(ui.tapToBuild)}</Help>
      <div dir="ltr" aria-label={t(ui.yourCode)} className="flex min-h-[68px] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-lip bg-warm p-3">
        {picked.map((i) => token(i, () => onChange(picked.filter((p) => p !== i))))}
      </div>
      <div dir="ltr" className="flex flex-wrap justify-center gap-2">
        {task.bank.map((text, i) =>
          picked.includes(i) ? (
            <span key={i} aria-hidden className="min-h-[44px] rounded-2xl bg-line px-3 py-2 font-mono text-[14px] text-transparent">
              {text}
            </span>
          ) : (
            token(i, () => onChange([...picked, i]))
          ),
        )}
      </div>
    </div>
  )
}

function Match({ task, answer, onChange, locked }: Props<MatchTask>) {
  const { t } = useT()
  const pairs = answer as Record<string, number>
  const [active, setActive] = useState<string | null>(null)
  // Meanings are shown rotated by one, so the correct pairing is never straight across.
  const meanings = task.pairs.map((_, i) => (i + 1) % task.pairs.length)
  const badge = (n: number) => (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-[12px] font-black text-white">{n}</span>
  )
  const without = (code: string) => Object.fromEntries(Object.entries(pairs).filter(([c]) => c !== code))

  return (
    <div className="grid gap-3">
      <Help>{t(ui.matchHelp)}</Help>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid content-start gap-3">
          {task.pairs.map((p, i) => (
            <button
              key={p.code}
              type="button"
              dir="ltr"
              className="pick flex items-center gap-2 px-3 font-mono text-[13px]"
              aria-pressed={active === p.code || p.code in pairs}
              disabled={locked}
              onClick={() => {
                sound.playClick()
                if (p.code in pairs) onChange(without(p.code))
                setActive(active === p.code ? null : p.code)
              }}
            >
              {p.code in pairs && badge(i + 1)}
              <span className="break-all">{p.code}</span>
            </button>
          ))}
        </div>
        <div className="grid content-start gap-3">
          {meanings.map((m) => {
            const owner = task.pairs.findIndex((p) => pairs[p.code] === m)
            return (
              <button
                key={m}
                type="button"
                className="pick flex items-center gap-2 px-3 text-[14px]"
                aria-pressed={owner >= 0}
                disabled={locked || (!active && owner < 0)}
                onClick={() => {
                  sound.playClick()
                  if (!active) return onChange(without(task.pairs[owner].code))
                  // One meaning per code: taking a meaning frees it from its previous owner.
                  const rest = Object.fromEntries(Object.entries(pairs).filter(([, v]) => v !== m))
                  onChange({ ...rest, [active]: m })
                  setActive(null)
                }}
              >
                {owner >= 0 && badge(owner + 1)}
                <span>{t(task.pairs[m].means)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const KEYS = { html: ['<', '>', '/', '=', '"'], css: ['{', '}', ':', ';', '#'] }

function Editor({ task, answer, onChange, locked }: Props<CodeTask>) {
  const { t } = useT()
  const ref = useRef<HTMLTextAreaElement>(null)
  const value = answer as string
  // Phone keyboards bury code symbols, so the common ones get their own row.
  const insert = (key: string) => {
    const el = ref.current
    if (!el) return
    const at = el.selectionStart
    onChange(value.slice(0, at) + key + value.slice(el.selectionEnd))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(at + key.length, at + key.length)
    })
  }
  return (
    <div className="overflow-hidden rounded-2xl bg-code">
      <textarea
        ref={ref}
        dir="ltr"
        aria-label={t(ui.typeHere)}
        placeholder={t(ui.typeHere)}
        className="block w-full resize-none bg-transparent p-4 font-mono text-[15px] leading-relaxed text-[#FCEBD7] outline-none placeholder:text-[#FCEBD7]/40"
        rows={Math.max(3, value.split('\n').length + 1)}
        value={value}
        readOnly={locked}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
      />
      <div dir="ltr" className="flex gap-2 border-t border-white/10 p-2">
        {KEYS[task.lang].map((key) => (
          <button
            key={key}
            type="button"
            aria-label={key}
            disabled={locked}
            className="h-11 flex-1 rounded-xl bg-white/10 font-mono text-[17px] font-bold text-[#FCEBD7] active:bg-white/25 disabled:opacity-40"
            onClick={() => insert(key)}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}

export function TaskBody(props: Props<Task>) {
  switch (props.task.type) {
    case 'choice':
      return <Choice {...(props as Props<ChoiceTask>)} />
    case 'fill':
      return <Fill {...(props as Props<FillTask>)} />
    case 'order':
      return <Order {...(props as Props<OrderTask>)} />
    case 'match':
      return <Match {...(props as Props<MatchTask>)} />
    case 'code':
      return <Editor {...(props as Props<CodeTask>)} />
  }
}
