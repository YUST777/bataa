import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BookOpenCheck, Check, Flame, Zap } from 'lucide-react'
import { Badge, awards } from '@/components/Badge'
import { Duck } from '@/components/Duck'
import { Button, Sky, Tray, spring } from '@/components/ui'
import { lessons } from '@/data/course'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { isoDay, streak, type Progress } from '@/state/progress'

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="grid flex-1 justify-items-center gap-0.5 px-2 py-4">
      {icon}
      <strong className="mt-1 text-[22px] font-bold tabular-nums tracking-tight">{value}</strong>
      <span className="text-center text-[12px] font-medium text-ink2">{label}</span>
    </div>
  )
}

/** A labelled row of mutually exclusive options. */
function Segmented<T extends string | number | boolean>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; text: string }[]; onChange: (id: T) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-[16px] font-medium">{label}</span>
      <div role="group" aria-label={label} className="flex rounded-full bg-[#F4EFE9] p-1">
        {options.map((o) => (
          <button
            key={String(o.id)}
            type="button"
            aria-pressed={value === o.id}
            className={`min-h-[36px] min-w-[44px] rounded-full px-3.5 text-[14px] font-semibold transition-all duration-200 ${value === o.id ? 'bg-white text-ink shadow-soft' : 'text-ink2'}`}
            onClick={() => {
              sound.playClick()
              onChange(o.id)
            }}
          >
            {o.text}
          </button>
        ))}
      </div>
    </div>
  )
}

const Heading = ({ children }: { children: string }) => <h2 className="eyebrow px-1 text-ink2">{children}</h2>

export function Profile({ p, set, reset }: { p: Progress; set: (patch: Partial<Progress>) => void; reset: () => void }) {
  const { t, lang } = useT()
  const [confirm, setConfirm] = useState(false)
  const weekday = new Intl.DateTimeFormat(lang, { weekday: 'narrow' })
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { key: isoDay(d), name: weekday.format(d), active: !!p.daily[isoDay(d)], today: i === 6 }
  })
  const skills = lessons.filter((l) => p.done.includes(l.id))
  const badges = awards(p)

  return (
    <div>
      <Sky>
        <div className="grid justify-items-center px-5 pt-6">
          <h1 className="text-[30px] font-extrabold tracking-tight">{t(ui.profile)}</h1>
          <Duck mood="wave" size={132} className="-mb-3 mt-2" />
        </div>
      </Sky>

      <div className="grid gap-7 px-4 pb-6 pt-3">
        <section className="card flex divide-x divide-line rtl:divide-x-reverse">
          <Stat icon={<Flame className="h-6 w-6 fill-brand text-brand" />} value={streak(p.daily)} label={t(ui.streak)} />
          <Stat icon={<Zap className="h-6 w-6 fill-sun text-sun" />} value={p.xp} label={t(ui.totalXp)} />
          <Stat icon={<BookOpenCheck className="h-6 w-6 text-ok" />} value={p.done.length} label={t(ui.lessonsDone)} />
        </section>

        <section className="grid gap-3">
          <Heading>{t(ui.thisWeek)}</Heading>
          <ol className="card grid grid-cols-7 p-3.5">
            {week.map((day) => (
              <li key={day.key} className="grid justify-items-center gap-2" aria-label={`${day.key}: ${t(day.active ? ui.done : ui.off)}`}>
                <span className={`text-[12px] font-semibold ${day.today ? 'text-brand' : 'text-ink2'}`}>{day.name}</span>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full ${day.active ? 'text-white' : day.today ? 'border border-dashed border-brand/60' : 'bg-[#F4EFE9]'}`}
                  style={day.active ? { background: 'linear-gradient(180deg,#FFA23A,#E86100)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.45), 0 6px 12px -6px #E86100' } : undefined}
                >
                  {day.active && <Check className="h-[18px] w-[18px]" strokeWidth={3.2} />}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-3">
          <Heading>{`${t(ui.badges)} · ${badges.filter((b) => b.earned).length}/${badges.length}`}</Heading>
          <ul className="card grid grid-cols-4 gap-x-2 gap-y-4 p-4">
            {badges.map((b, i) => (
              <motion.li
                key={b.id}
                className="grid justify-items-center gap-1.5"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: 0.03 * i }}
              >
                <Badge tone={b.tone} shape={b.shape} earned={b.earned} size={56}>
                  {b.mark}
                </Badge>
                <span className={`line-clamp-2 text-center text-[11px] font-medium leading-tight ${b.earned ? 'text-ink' : 'text-ink3'}`}>{t(b.label)}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="grid gap-3">
          <Heading>{t(ui.skills)}</Heading>
          <ul className="card divide-y divide-line">
            {skills.length === 0 && <li className="px-4 py-3.5 text-[15px] font-medium text-ink2">{t(ui.skillsEmpty)}</li>}
            {skills.map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-medium">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-okSoft text-ok">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <span className="first-letter:uppercase">{t(l.can)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-3">
          <Heading>{t(ui.settings)}</Heading>
          <div className="card divide-y divide-line">
            <Segmented label={t(ui.language)} value={p.lang} onChange={(v) => set({ lang: v })} options={[{ id: 'en', text: 'English' }, { id: 'ar', text: 'العربية' }]} />
            <Segmented label={t(ui.dailyGoal)} value={p.goal} onChange={(v) => set({ goal: v })} options={[{ id: 1, text: '1' }, { id: 2, text: '2' }, { id: 3, text: '3' }]} />
            <Segmented label={t(ui.sounds)} value={p.sound} onChange={(v) => set({ sound: v })} options={[{ id: true, text: t(ui.on) }, { id: false, text: t(ui.off) }]} />
          </div>
          <Button tone="text" className="!text-bad" onClick={() => setConfirm(true)}>
            {t(ui.reset)}
          </Button>
        </section>
      </div>

      <Tray open={confirm} onClose={() => setConfirm(false)} label={t(ui.resetTitle)}>
        <div className="grid gap-1 px-1 pb-5 pt-1">
          <h2 className="text-[20px] font-bold tracking-tight">{t(ui.resetTitle)}</h2>
          <p className="text-[15px] font-medium leading-snug text-ink2">{t(ui.resetBody)}</p>
        </div>
        <div className="grid gap-1">
          <Button
            tone="bad"
            onClick={() => {
              setConfirm(false)
              reset()
            }}
          >
            {t(ui.reset)}
          </Button>
          <Button tone="text" autoFocus onClick={() => setConfirm(false)}>
            {t(ui.cancel)}
          </Button>
        </div>
      </Tray>
    </div>
  )
}
