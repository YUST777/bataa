import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from '@/components/Icon'
import { IconButton, spring } from '@/components/ui'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { CURRENCY, PLAN_ART, PRICE, type Period, type Plan } from '@/lib/plans'

/**
 * The plans page ("Choose your plan"): the sunset pond as a header that fades into the page with the
 * picked plan's art on its lily pad, monthly or yearly (20% off), Free and Pro as rows to tap (the picked
 * one opens to show what it gives), and one sticky button. `onChoose` gets the period when Pro is picked; picking Free just closes.
 */
export function Paywall({ open, current, onClose, onChoose }: { open: boolean; current: Plan; onClose: () => void; onChoose: (period: Period) => void }) {
  const { t, lang } = useT()
  const [picked, setPicked] = useState<Plan>('pro')
  const [period, setPeriod] = useState<Period>('monthly')
  const money = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 })
  const rows = [
    { id: 'free' as const, title: ui.planFree, line: ui.payFreeLine, price: money.format(0), perks: [ui.perkFreeApp, ui.perkFreeUnit, ui.perkFreeAi] },
    {
      id: 'pro' as const,
      title: ui.planPro,
      line: ui.payProLine,
      price: money.format(period === 'monthly' ? PRICE.monthly : PRICE.yearly / 12),
      perks: [ui.perkProApps, ui.perkProAi, ui.perkProCourses],
    },
  ]
  const cta = picked === current ? ui.payYourPlan : picked === 'free' ? ui.payStayFree : ui.payUpgradePro

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
          <div className="flex-1 overflow-y-auto">
            {/* Hero: the sunset pond fading into the page, the picked plan's art in front. */}
            <div className="relative h-[230px] bg-cover bg-top" style={{ backgroundImage: 'url(/plans/bg.webp)' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-page/10 to-page" />
              <div className="absolute start-4" style={{ top: 'calc(var(--sat, env(safe-area-inset-top, 0px)) + 0.75rem)' }}>
                <IconButton label={t(ui.close)} onClick={onClose}>
                  <X className="h-5 w-5" strokeWidth={2.5} />
                </IconButton>
              </div>
              <motion.img
                key={picked}
                src={PLAN_ART[picked]}
                alt=""
                draggable={false}
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={spring}
                className="absolute bottom-0 left-1/2 h-[150px] -translate-x-1/2 object-contain drop-shadow-lg"
              />
            </div>

            <div className="mx-auto grid max-w-[460px] gap-5 px-5 pb-6 pt-2">
              <header className="text-center">
                <h1 className="text-[30px] font-bold leading-tight tracking-tight">{t(ui.payTitle)}</h1>
                <p className="mt-1 text-[15px] font-medium text-ink2">{t(ui.paySub)}</p>
              </header>

              {/* Monthly or yearly. */}
              <div className="mx-auto flex rounded-full bg-white p-1 shadow-soft">
                {(['monthly', 'yearly'] as const).map((per) => (
                  <button
                    key={per}
                    type="button"
                    aria-pressed={period === per}
                    onClick={() => setPeriod(per)}
                    className={`relative flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-semibold ${period === per ? 'text-white' : 'text-ink2'}`}
                  >
                    {period === per && <motion.span layoutId="period" className="absolute inset-0 rounded-full bg-ink" transition={spring} />}
                    <span className="relative">{t(per === 'monthly' ? ui.payMonthly : ui.payYearly)}</span>
                    {per === 'yearly' && <span className="relative rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-bold text-ink">-20%</span>}
                  </button>
                ))}
              </div>

              {/* Plans as rows: tap one to pick it. */}
              <div role="radiogroup" aria-label={t(ui.payTitle)} className="grid gap-2.5">
                {rows.map((r) => {
                  const on = r.id === picked
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        sound.playClick()
                        setPicked(r.id)
                      }}
                      className={`relative block min-w-0 rounded-[22px] border-2 bg-white p-3 text-start transition-colors ${on ? 'border-accent' : 'border-transparent shadow-soft'}`}
                    >
                      {r.id === 'pro' && <span className="absolute -top-2.5 end-4 rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-bold text-white">{t(ui.payPopular)}</span>}
                      <span className="flex items-center gap-3">
                        <img src={PLAN_ART[r.id]} alt="" draggable={false} className="h-14 w-14 shrink-0 object-contain" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[17px] font-semibold leading-tight">{t(r.title)}</span>
                          <span className="block truncate text-[13px] font-medium text-ink2">{r.id === current ? t(ui.payYourPlan) : t(r.line)}</span>
                        </span>
                        <span className="text-end">
                          <span className="block text-[17px] font-bold tabular-nums">{r.price}</span>
                          <span className="block text-[11px] font-semibold text-ink3">{t(ui.payPerMonth)}</span>
                        </span>
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${on ? 'border-accent bg-accent text-ink' : 'border-lip'}`}>
                          {on && <Check className="h-3 w-3" />}
                        </span>
                      </span>
                      {/* The picked plan opens to show what it gives. */}
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.span
                            className="block overflow-hidden"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.65, 0, 0.35, 1] }}
                          >
                            <span className="mt-3 grid gap-2 border-t border-line pt-3">
                              <span className="text-[12px] font-semibold text-ink3">{t(ui.payIncludes)}</span>
                              {r.perks.map((perk) => (
                                <span key={perk.en} className="flex items-start gap-2.5 text-[14px] font-medium leading-snug text-ink">
                                  <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/30 text-ink">
                                    <Check className="h-2.5 w-2.5" />
                                  </span>
                                  {t(perk)}
                                </span>
                              ))}
                            </span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* One button, always in reach. */}
          <div className="border-t border-line bg-page/95 px-5 pt-3 backdrop-blur" style={{ paddingBottom: 'calc(var(--sab, env(safe-area-inset-bottom, 0px)) + 0.75rem)' }}>
            <div className="mx-auto grid max-w-[460px] gap-2">
              <button
                type="button"
                disabled={picked === current}
                onClick={() => (picked === 'free' ? onClose() : onChoose(period))}
                className="h-14 w-full rounded-full bg-accent text-[17px] font-bold text-ink shadow-soft transition-transform active:scale-[.98] disabled:bg-lip disabled:text-ink3"
              >
                {t(cta)}
              </button>
              <p className="text-center text-[12px] font-medium text-ink3">
                {period === 'yearly' && picked === 'pro' ? `${money.format(PRICE.yearly)} ${t(ui.payBilledYearly)} · ` : ''}
                {t(ui.payCancel)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
