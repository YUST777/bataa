import { useState, type ReactNode } from 'react'
import { BookOpenCheck, Check, Flame, Zap } from 'lucide-react'
import { Duck } from '@/components/Duck'
import { Button, Sheet } from '@/components/ui'
import { lessons } from '@/data/course'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { isoDay, streak, type Progress } from '@/state/progress'

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="card grid justify-items-center gap-1 px-2 py-3">
      {icon}
      <strong className="text-[22px] font-black tabular-nums">{value}</strong>
      <span className="text-center text-[12px] font-bold text-ink2">{label}</span>
    </div>
  )
}

/** A labelled row of mutually exclusive options. */
function Segmented<T extends string | number | boolean>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; text: string }[]; onChange: (id: T) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-[16px] font-bold">{label}</span>
      <div role="group" aria-label={label} className="flex rounded-xl bg-line p-1">
        {options.map((o) => (
          <button
            key={String(o.id)}
            type="button"
            aria-pressed={value === o.id}
            className={`min-h-[36px] min-w-[44px] rounded-lg px-3 text-[14px] font-extrabold transition-colors ${value === o.id ? 'bg-surface text-ink shadow-sm' : 'text-ink2'}`}
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

const Heading = ({ children }: { children: string }) => <h2 className="px-1 text-[13px] font-extrabold uppercase tracking-wide text-ink2">{children}</h2>

export function Profile({ p, set, reset }: { p: Progress; set: (patch: Partial<Progress>) => void; reset: () => void }) {
  const { t, lang } = useT()
  const [confirm, setConfirm] = useState(false)
  const weekday = new Intl.DateTimeFormat(lang, { weekday: 'short' })
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { key: isoDay(d), name: weekday.format(d), active: !!p.daily[isoDay(d)] }
  })
  const skills = lessons.filter((l) => p.done.includes(l.id))

  return (
    <div className="grid gap-5 px-4 pb-6 pt-4">
      <header className="grid justify-items-center gap-1 pt-2">
        <Duck mood="wave" size={112} />
        <h1 className="text-[26px] font-black">{t(ui.profile)}</h1>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <Stat icon={<Flame className="h-6 w-6 fill-brand text-brand" />} value={streak(p.daily)} label={t(ui.streak)} />
        <Stat icon={<Zap className="h-6 w-6 fill-sun text-brand" />} value={p.xp} label={t(ui.totalXp)} />
        <Stat icon={<BookOpenCheck className="h-6 w-6 text-ok" />} value={p.done.length} label={t(ui.lessonsDone)} />
      </section>

      <section className="grid gap-3">
        <Heading>{t(ui.thisWeek)}</Heading>
        <ol className="card grid grid-cols-7 gap-1 p-3">
          {week.map((day) => (
            <li key={day.key} className="grid justify-items-center gap-1.5" aria-label={`${day.name}: ${t(day.active ? ui.done : ui.off)}`}>
              <span className="text-[12px] font-bold text-ink2">{day.name}</span>
              <span className={`grid h-9 w-9 place-items-center rounded-full ${day.active ? 'bg-brand text-white' : 'bg-line'}`}>
                {day.active && <Check className="h-5 w-5" strokeWidth={3.5} />}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-3">
        <Heading>{t(ui.skills)}</Heading>
        <ul className="card divide-y-2 divide-line">
          {skills.length === 0 && <li className="px-4 py-3 text-[15px] font-semibold text-ink2">{t(ui.skillsEmpty)}</li>}
          {skills.map((l) => (
            <li key={l.id} className="flex items-center gap-3 px-4 py-3 text-[15px] font-bold">
              <Check className="h-5 w-5 shrink-0 text-ok" strokeWidth={3} />
              <span className="first-letter:uppercase">{t(l.can)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <Heading>{t(ui.settings)}</Heading>
        <div className="card divide-y-2 divide-line">
          <Segmented label={t(ui.language)} value={p.lang} onChange={(v) => set({ lang: v })} options={[{ id: 'en', text: 'English' }, { id: 'ar', text: 'العربية' }]} />
          <Segmented label={t(ui.dailyGoal)} value={p.goal} onChange={(v) => set({ goal: v })} options={[{ id: 1, text: '1' }, { id: 2, text: '2' }, { id: 3, text: '3' }]} />
          <Segmented label={t(ui.sounds)} value={p.sound} onChange={(v) => set({ sound: v })} options={[{ id: true, text: t(ui.on) }, { id: false, text: t(ui.off) }]} />
        </div>
        <Button tone="text" className="!text-bad" onClick={() => setConfirm(true)}>
          {t(ui.reset)}
        </Button>
      </section>

      <Sheet open={confirm} onClose={() => setConfirm(false)} label={t(ui.resetTitle)}>
        <h2 className="text-[20px] font-black">{t(ui.resetTitle)}</h2>
        <p className="mb-5 mt-1 text-[15px] font-semibold text-ink2">{t(ui.resetBody)}</p>
        <div className="grid gap-2">
          <Button tone="bad" onClick={() => { setConfirm(false); reset() }}>
            {t(ui.reset)}
          </Button>
          <Button tone="text" autoFocus onClick={() => setConfirm(false)}>
            {t(ui.cancel)}
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
