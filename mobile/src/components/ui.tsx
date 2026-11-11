import { useEffect, useMemo, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'

/** The app's one motion curve: quick to settle, no overshoot. */
export const spring = { type: 'spring', duration: 0.4, bounce: 0 } as const

// Full class names, spelled out so Tailwind keeps them in the build.
const TONES = { primary: 'btn btn-primary', ok: 'btn btn-ok', bad: 'btn btn-bad', plain: 'btn btn-plain', text: 'btn-text' }

/** Styles live in index.css (.btn-*). */
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

/** Round frosted icon button, used for close and back. */
export function IconButton({ label, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      {...rest}
      className={`glass grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink transition-transform duration-150 active:scale-90 ${className}`}
    />
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/10">
      <motion.div
        className="h-full rounded-full bg-accent"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={spring}
      />
    </div>
  )
}

const Dots = () => (
  <span className="flex gap-1.5" aria-hidden>
    {['#FF6159', '#FFBD2E', '#28C941'].map((c) => (
      <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
    ))}
  </span>
)

/** Read-only code in an editor frame. Code always reads left to right, even in Arabic. */
export function Code({ children, name }: { children: ReactNode; name?: string }) {
  return (
    <div dir="ltr" className="overflow-hidden rounded-[18px] bg-code shadow-soft">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
        <Dots />
        {name && <span className="font-mono text-[12px] text-white/50">{name}</span>}
      </div>
      <pre className="codeblock rounded-none">
        <code>{children}</code>
      </pre>
    </div>
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
      `<!doctype html><html><head><meta charset="utf-8"><style>html,body{height:100%;margin:0}body{box-sizing:border-box;display:grid;place-content:center;justify-items:center;gap:6px;padding:12px;font:16px system-ui,sans-serif;color:#1f1611;text-align:center}h1,h2,p{margin:0}button{cursor:pointer;font:inherit}</style><style>${css}</style></head><body>${html}</body></html>`,
    [html, css],
  )
  return (
    <section className="card overflow-hidden">
      <header dir="ltr" className="flex items-center gap-3 border-b border-line bg-warm px-4 py-2.5">
        <Dots />
        <span className="flex-1 rounded-md bg-white px-2.5 py-1 text-[12px] font-medium text-ink2">{t(ui.preview)}</span>
        <span className="eyebrow flex items-center gap-1.5 text-ok">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" />
          {t(ui.live)}
        </span>
      </header>
      <iframe title={t(ui.preview)} sandbox="allow-same-origin" srcDoc={doc} className="block w-full bg-white" style={{ height }} />
    </section>
  )
}

/**
 * Floating tray. Given `origin` (the viewport point of whatever opened it), it grows out of that
 * point and shrinks back into it, so the tray reads as the tapped thing opening up.
 * Portalled to <body>: an animated ancestor would otherwise become the containing block for `fixed`.
 */
export function Tray({ open, onClose, label, origin, children }: { open: boolean; onClose: () => void; label: string; origin?: { x: number; y: number } | null; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // The tray sits 12px off the bottom and sides, in a column at most 448px wide.
  const left = Math.max(0, (window.innerWidth - 448) / 2) + 12
  const transformOrigin = origin ? `${origin.x - left}px calc(100% - ${window.innerHeight - 12 - origin.y}px)` : '50% 100%'
  const closed = origin ? { opacity: 0, scale: 0.2 } : { opacity: 0, y: 60 }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-3 backdrop-blur-[3px]"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="w-full max-w-[424px] rounded-[32px] bg-white p-5 shadow-float"
            style={{ transformOrigin }}
            initial={closed}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={closed}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
          >
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
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={spring} className="card relative flex-1 px-4 py-3 text-[16px] font-semibold leading-snug">
      <span className="absolute bottom-4 -start-[7px] h-3.5 w-3.5 rotate-45 border-b border-s border-line bg-white rtl:-rotate-45" />
      <span className="relative">{children}</span>
    </motion.div>
  )
}

/** Warm sky that fades into the page behind a row of clouds. Sits behind a screen's header. */
export function Sky({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: 'linear-gradient(180deg, #FFC98A 0%, #FFE0BA 55%, #FFF1DF 100%)' }}>
      <span aria-hidden className="absolute -end-24 -top-28 h-80 w-80 rounded-full border border-white/40 bg-white/10" />
      <span aria-hidden className="absolute -end-10 -top-14 h-52 w-52 rounded-full border border-white/40 bg-white/15" />
      <div className="relative">{children}</div>
      <svg aria-hidden viewBox="0 0 375 34" preserveAspectRatio="none" className="relative -mb-px block h-9 w-full">
        <path fill="#fff" opacity=".55" d="M0 34V12q22-10 40 2 22-18 50-2 26-14 50 2 24-16 52 0 26-14 52 2 24-12 48 0 20-10 42 0 22-8 41 2V34z" />
        <path fill="#fff" d="M0 34V20q16-14 36-5 14-17 40-7 20-15 44 0 16-12 38-2 20-15 46-2 22-13 44 2 18-11 40 0 16-9 34-1 14-8 29-1 12-5 24 2V34z" />
      </svg>
    </div>
  )
}

const TILES = { orange: 'bg-brandSoft text-brand', blue: 'bg-[#E8F3FE] text-[#1667B7]', grey: 'bg-[#F4EFE9] text-ink3' }
export type Tone = keyof typeof TILES

/** Quiet icon tile: a soft tint with the icon in the matching ink. */
export function Tile({ tone = 'orange', size = 48, children }: { tone?: Tone; size?: number; children: ReactNode }) {
  return (
    <span className={`grid shrink-0 place-items-center ${TILES[tone]}`} style={{ width: size, height: size, borderRadius: size * 0.28 }}>
      {children}
    </span>
  )
}
