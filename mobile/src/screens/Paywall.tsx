import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Lock, X } from '@/components/Icon'
import { IconButton, spring } from '@/components/ui'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { PLANS, PRICES, type Period, type Plan } from '@/lib/plans'

/** Small line icons for the trust row, drawn like the icon sheet. */
const TRUST = [
  { d: 'M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3zM9 12l2 2 4-4.5', text: ui.payCancel },
  { d: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6zM12 15v2', text: ui.paySecure },
  { d: 'M4 13a8 8 0 0 1 16 0M4 13v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2zM20 13v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z', text: ui.paySupport },
]

const price = (plan: Plan, period: Period) => (plan === 'free' ? 0 : period === 'monthly' ? PRICES[plan].monthly : PRICES[plan].yearly / 12)

/**
 * The plans page ("Choose your plan"): Free, Pro and Team over the sunset pond, monthly or yearly
 * (20% off). Pro is picked to start with. `onChoose` gets the plan and period the learner settled on.
 */
export function Paywall({ open, current, onClose, onChoose }: { open: boolean; current: Plan; onClose: () => void; onChoose: (plan: Plan, period: Period) => void }) {
  const { t, lang } = useT()
  const [picked, setPicked] = useState<Plan>(current === 'free' ? 'pro' : current)
  const [period, setPeriod] = useState<Period>('monthly')
  const money = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'USD' })
  const cta = picked === current ? ui.payYourPlan : picked === 'free' ? ui.payStayFree : picked === 'pro' ? ui.payUpgradePro : ui.payUpgradeTeam

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t(ui.payTitle)}
          className="fixed inset-0 z-[60] overflow-y-auto bg-[#FBD4AE] bg-cover bg-top"
          style={{ backgroundImage: 'url(/plans/bg.webp)', paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))', paddingBottom: 'var(--sab, env(safe-area-inset-bottom, 0px))' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.38, ease: [0.65, 0, 0.35, 1] }}
        >
          <div className="mx-auto grid max-w-[460px] gap-5 px-4 pb-8 pt-3">
            <IconButton label={t(ui.close)} onClick={onClose}>
              <X className="h-5 w-5" strokeWidth={2.5} />
            </IconButton>

            <header className="px-1">
              <h1 className="text-[34px] font-bold leading-[1.05] tracking-tight text-[#4A2A12]">{t(ui.payTitle)}</h1>
              <span aria-hidden className="mt-1 block h-1 w-28 rounded-full bg-accent" />
              <p className="mt-2 text-[15px] font-medium text-[#6B4A30]">{t(ui.paySub)}</p>
            </header>

            {/* Plan cards: tap one to pick it. The art sits on top of each card. */}
            <div className="grid grid-cols-3 items-end gap-2 pt-10">
              {PLANS.map((p, i) => {
                const on = p.id === picked
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      sound.playClick()
                      setPicked(p.id)
                    }}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0, scale: on ? 1 : 0.97 }}
                    transition={{ ...spring, delay: 0.1 + i * 0.06 }}
                    className={`relative flex flex-col items-center rounded-[24px] px-2 pb-3 pt-14 text-center shadow-soft backdrop-blur-md transition-colors ${
                      on ? 'border-2 border-accent bg-gradient-to-b from-[#FFF3D6] to-white/95' : 'border border-white/80 bg-white/75'
                    }`}
                  >
                    <img
                      src={p.art}
                      alt=""
                      draggable={false}
                      className={`pointer-events-none absolute -top-12 left-1/2 w-auto -translate-x-1/2 object-contain drop-shadow-md ${p.id === 'pro' ? 'h-[104px]' : 'h-[92px]'}`}
                    />
                    {p.id === 'pro' && (
                      <span className="absolute top-9 z-10 rounded-full bg-[#E5533D] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-soft">{t(ui.payPopular)}</span>
                    )}
                    <span className="text-[22px] font-bold leading-tight text-[#4A2A12]">{t(p.title)}</span>
                    <span className="mt-0.5 min-h-[32px] text-[11.5px] font-medium leading-tight text-[#6B4A30]">{t(p.tagline)}</span>
                    <ul className="mt-2 grid w-full gap-1.5 text-start">
                      {p.perks.map((perk) => (
                        <li key={perk.text.en} className={`flex items-start gap-1.5 text-[11.5px] font-semibold leading-tight ${perk.on ? 'text-ink' : 'text-ink3'}`}>
                          {perk.on ? (
                            <span className="mt-px grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ok text-white">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                          ) : (
                            <Lock className="mt-px h-4 w-4 shrink-0 text-ink3" />
                          )}
                          {t(perk.text)}
                        </li>
                      ))}
                    </ul>
                  </motion.button>
                )
              })}
            </div>

            {/* Monthly or yearly. */}
            <div className="mx-auto flex rounded-full bg-white/80 p-1 shadow-soft backdrop-blur">
              {(['monthly', 'yearly'] as const).map((per) => (
                <button
                  key={per}
                  type="button"
                  aria-pressed={period === per}
                  onClick={() => setPeriod(per)}
                  className={`relative flex h-10 items-center gap-2 rounded-full px-5 text-[15px] font-semibold ${period === per ? 'text-white' : 'text-ink2'}`}
                >
                  {period === per && <motion.span layoutId="period" className="absolute inset-0 rounded-full bg-accent" transition={spring} />}
                  <span className="relative">{t(per === 'monthly' ? ui.payMonthly : ui.payYearly)}</span>
                  {per === 'yearly' && <span className="relative rounded-full bg-[#FFE2B8] px-2 py-0.5 text-[11px] font-bold text-brandDeep">-20%</span>}
                </button>
              ))}
            </div>

            {/* Prices, under their cards. */}
            <div className="grid grid-cols-3 gap-2">
              {PLANS.map((p) => (
                <div key={p.id} className={`rounded-[20px] py-2.5 text-center shadow-soft ${p.id === picked ? 'bg-accent text-white' : 'bg-white/80 text-[#4A2A12]'}`}>
                  <div className="text-[20px] font-bold tabular-nums">{p.id === 'free' ? money.format(0).replace(/[.,٫]00/, '') : money.format(price(p.id, period))}</div>
                  <div className="text-[11px] font-semibold opacity-80">{t(ui.payPerMonth)}</div>
                </div>
              ))}
            </div>
            {period === 'yearly' && picked !== 'free' && (
              <p className="-mt-3 text-center text-[12px] font-semibold text-[#6B4A30]">
                {money.format(PRICES[picked].yearly)} {t(ui.payBilledYearly)}
              </p>
            )}

            <button
              type="button"
              disabled={picked === current}
              onClick={() => onChoose(picked, period)}
              className="mx-auto flex h-14 w-full max-w-[340px] items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#FF9A3C] to-[#F27A12] text-[18px] font-bold text-white shadow-float active:scale-[.98] transition-transform disabled:opacity-60"
            >
              {t(cta)}
            </button>

            <div className="mx-auto flex items-start justify-center gap-4 rounded-full bg-white/75 px-4 py-2 text-[#6B4A30] shadow-soft backdrop-blur">
              {TRUST.map((item) => (
                <span key={item.text.en} className="flex items-center gap-1.5 text-[11.5px] font-semibold leading-tight">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-6 w-6 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={item.d} />
                  </svg>
                  {t(item.text)}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
