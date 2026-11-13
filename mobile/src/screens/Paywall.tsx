import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from '@/components/Icon'
import { IconButton, spring } from '@/components/ui'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { PLAN_ART, PRICE, type Period, type Plan } from '@/lib/plans'

/**
 * The Bataa Pro page: the crowned duck on its lily pad, one headline, then Monthly or Yearly as two cards
 * (the picked one dark), the price and one Continue button. `onChoose` gets the period picked.
 */
export function Paywall({ open, current, onClose, onChoose }: { open: boolean; current: Plan; onClose: () => void; onChoose: (period: Period) => void }) {
  const { t, lang } = useT()
  const [period, setPeriod] = useState<Period>('yearly')
  const money = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'USD' })
  const options = [
    { id: 'monthly' as const, art: PLAN_ART.free, name: ui.payMonthly, price: money.format(PRICE.monthly), per: ui.payPerMonth, note: t(ui.payCancel) },
    {
      id: 'yearly' as const,
      art: '/plans/team.webp',
      name: ui.payYearly,
      price: money.format(PRICE.yearly),
      per: ui.payPerYear,
      note: `${money.format(PRICE.yearly / 12)} ${t(ui.payYearlyNote)}`,
    },
  ]
  const pro = current === 'pro'

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t(ui.payTitle)}
          className="fixed inset-0 z-[60] flex flex-col bg-page"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.38, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* The sunset pond, faded into the page behind the top. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-cover bg-top opacity-60" style={{ backgroundImage: 'url(/plans/bg.webp)' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-page/30 via-page/40 to-page" />
          </div>

          <header className="relative flex items-center px-4 pb-1" style={{ paddingTop: 'calc(var(--sat, env(safe-area-inset-top, 0px)) + 0.75rem)' }}>
            <span className="w-11" />
            <h1 className="flex-1 text-center text-[17px] font-semibold">{t(ui.payTitle)}</h1>
            <IconButton label={t(ui.close)} onClick={onClose}>
              <X className="h-5 w-5" strokeWidth={2.5} />
            </IconButton>
          </header>

          <div className="relative flex-1 overflow-y-auto">
            <div className="mx-auto grid max-w-[460px] gap-6 px-5 pb-6 pt-2">
              <div className="grid justify-items-center gap-3 text-center">
                <div className="relative grid h-48 w-48 place-items-center">
                  <span aria-hidden className="absolute inset-3 rounded-full bg-white/70 shadow-soft" />
                  <motion.img
                    src={PLAN_ART.pro}
                    alt=""
                    draggable={false}
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.15 }}
                    className="relative h-44 object-contain drop-shadow-md"
                  />
                </div>
                <h2 className="text-[26px] font-bold leading-tight tracking-tight">{t(ui.payHeadline)}</h2>
                <p className="text-[15px] font-medium text-ink2">{t(ui.paySub)}</p>
              </div>

              <div role="radiogroup" aria-label={t(ui.payTitle)} className="grid gap-3">
                {options.map((o) => {
                  const on = o.id === period
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        sound.playClick()
                        setPeriod(o.id)
                      }}
                      className={`relative flex items-center gap-4 rounded-[24px] p-4 text-start transition-colors ${on ? 'bg-ink text-white shadow-float' : 'bg-white text-ink shadow-soft'}`}
                    >
                      <img src={o.art} alt="" draggable={false} className="h-16 w-20 shrink-0 object-contain" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-[17px] font-semibold">
                          {t(o.name)}
                          {o.id === 'yearly' && <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-ink">{t(ui.payOff)}</span>}
                        </span>
                        <span className="mt-0.5 block text-[15px] font-semibold">
                          {o.price} <span className={`font-medium ${on ? 'text-white/70' : 'text-ink2'}`}>{t(o.per)}</span>
                        </span>
                        <span className={`block text-[13px] font-medium ${on ? 'text-white/70' : 'text-brand'}`}>{o.note}</span>
                      </span>
                      <span className={`absolute end-4 top-4 grid h-6 w-6 place-items-center rounded-full border-2 ${on ? 'border-accent bg-accent text-ink' : 'border-lip'}`}>
                        {on && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="relative rounded-t-[28px] bg-white px-5 pt-4 shadow-float" style={{ paddingBottom: 'calc(var(--sab, env(safe-area-inset-bottom, 0px)) + 0.75rem)' }}>
            <div className="mx-auto grid max-w-[460px] gap-2.5 text-center">
              <p className="text-[14px] font-semibold">
                {period === 'yearly' && <s className="me-1.5 font-medium text-ink3">{money.format(PRICE.monthly * 12)}</s>}
                {period === 'yearly' ? `${money.format(PRICE.yearly)} ${t(ui.payPerYear)} (${t(ui.payOff)})` : `${money.format(PRICE.monthly)} ${t(ui.payPerMonth)}`}
              </p>
              <button
                type="button"
                disabled={pro}
                onClick={() => onChoose(period)}
                className="h-14 w-full rounded-full bg-accent text-[17px] font-bold text-ink shadow-soft transition-transform active:scale-[.98] disabled:bg-lip disabled:text-ink3"
              >
                {t(pro ? ui.payYourPlan : ui.payContinue)}
              </button>
              <p className="text-[12px] font-medium text-ink3">{t(ui.payCancel)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
