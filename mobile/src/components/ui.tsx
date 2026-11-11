import { useEffect, useMemo, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'

// Full class names, spelled out so Tailwind keeps them in the build.
const TONES = { primary: 'btn btn-primary', ok: 'btn btn-ok', bad: 'btn btn-bad', plain: 'btn btn-plain', text: 'btn-text' }

/** The tactile button. Styles live in index.css (.btn-*). */
export function Button({
  tone = 'primary',
  className = '',
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof TONES }) {
  return (
    <button
      type="button"
      {...rest}
      className={`${TONES[tone]} ${className}`}
      onClick={(e) => {
        sound.playClick(tone === 'primary' ? 440 : 380)
        onClick?.(e)
      }}
    />
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-3.5 flex-1 overflow-hidden rounded-full bg-line">
      <motion.div
        className="h-full rounded-full bg-brand"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 140, damping: 22 }}
      />
    </div>
  )
}

/** Read-only code. Code always reads left to right, even in Arabic. */
export function Code({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <pre dir="ltr" className={`codeblock ${className}`}>
      <code>{children}</code>
    </pre>
  )
}

/**
 * Renders learner code as a real page in a sandboxed frame.
 * The sandbox has no allow-scripts, so nothing in the frame can run. It keeps allow-same-origin
 * because a fully opaque srcdoc frame painted blank in the embedded browser this was tested in.
 */
export function Preview({ html, css, height = 104 }: { html: string; css: string; height?: number }) {
  const { t } = useT()
  const doc = useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8"><style>html,body{height:100%;margin:0}body{box-sizing:border-box;display:grid;place-content:center;justify-items:center;gap:6px;padding:12px;font:16px system-ui,sans-serif;color:#2d180b;text-align:center}h1,h2,p{margin:0}button{cursor:pointer;font:inherit}</style><style>${css}</style></head><body>${html}</body></html>`,
    [html, css],
  )
  return (
    <section className="card overflow-hidden">
      <header className="flex items-center justify-between border-b-2 border-line px-4 py-2 text-[12px] font-extrabold uppercase tracking-wide text-ink2">
        <span>{t(ui.preview)}</span>
        <span className="flex items-center gap-1.5 text-ok">
          <span className="h-2 w-2 rounded-full bg-ok" />
          {t(ui.live)}
        </span>
      </header>
      <iframe title={t(ui.preview)} sandbox="allow-same-origin" srcDoc={doc} className="block w-full bg-white" style={{ height }} />
    </section>
  )
}

/**
 * Bottom sheet for briefs and confirmations. Closes on backdrop tap or Escape.
 * Portalled to <body>: an animated ancestor would otherwise become the containing block for `fixed`.
 */
export function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="w-full max-w-md rounded-t-[28px] bg-surface px-5 pt-3"
            style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/** The duck's speech bubble. The tail points back at the duck on the inline-start side. */
export function Bubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="card relative flex-1 px-4 py-3 text-[16px] font-bold leading-snug"
    >
      <span className="absolute bottom-4 -start-[9px] h-4 w-4 rotate-45 border-b-2 border-s-2 border-line bg-surface rtl:-rotate-45" />
      <span className="relative">{children}</span>
    </motion.div>
  )
}
