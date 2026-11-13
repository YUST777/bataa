import { useState, type ChangeEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import NumberFlow from '@number-flow/react'
import { BookOpenCheck, Camera, Check, Flame, ImageIcon, Settings, Trash2, Zap } from '@/components/Icon'
import Cropper, { type Area } from 'react-easy-crop'
import { toast } from 'sonner'
import { Badge, awards, type Award } from '@/components/Badge'
import { BadgeModel } from '@/components/BadgeModel'
import { Duck } from '@/components/Duck'
import { Button, Sky, Tray, spring } from '@/components/ui'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { saveAvatar, signOut } from '@/lib/account'
import { PLAN_ART, type Plan } from '@/lib/plans'
import { GoogleButton } from '@/components/GoogleButton'
import { NAME_MAX, isoDay, streak, type Progress } from '@/state/progress'

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="grid flex-1 justify-items-center gap-0.5 px-2 py-4">
      {icon}
      <strong className="mt-1 text-[22px] font-semibold tabular-nums tracking-tight">
        <NumberFlow value={value} />
      </strong>
      <span className="text-center text-[12px] font-medium text-ink2">{label}</span>
    </div>
  )
}

/** A labelled row of mutually exclusive options. */
function Segmented<T extends string | number | boolean>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { id: T; text: string }[]
  onChange: (id: T) => void
}) {
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

/** Cuts the chosen square out of the picture as a 256px JPEG data URL (about 20 KB), small enough for local storage. */
async function cropToAvatar(src: string, area: Area): Promise<string> {
  const img = new Image()
  img.src = src
  await img.decode()
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  canvas.getContext('2d')!.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, 256, 256)
  return canvas.toDataURL('image/jpeg', 0.85)
}

/** The learner's picture: their photo, else the first letter of their name, else the duck. */
function Avatar({ photo, name, size }: { photo: string; name: string; size: number }) {
  return (
    <span className="relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-brandSoft ring-4 ring-white shadow-soft" style={{ width: size, height: size }}>
      {photo ? (
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : name ? (
        <span className="font-semibold text-brandDeep" style={{ fontSize: size * 0.42 }}>
          {[...name][0].toUpperCase()}
        </span>
      ) : (
        <Duck mood="idle" size={size * 1.15} className="absolute left-[46%] top-[-4%] -translate-x-1/2" />
      )}
    </span>
  )
}

/** Ref callback: pointer presses inside this element never reach the sheet's drag-to-close. The sheet
 * listens natively, so React's own stopPropagation would come too late. */
const keepDragInside = (el: HTMLElement | null) => el?.addEventListener('pointerdown', (e) => e.stopPropagation())

const Heading = ({ children }: { children: string }) => <h2 className="eyebrow px-1 text-ink2">{children}</h2>

export function Profile({
  p,
  set,
  reset,
  email,
  plan,
  onUpgrade,
}: {
  p: Progress
  set: (patch: Partial<Progress>) => void
  reset: () => void
  email: string | null
  plan: Plan
  onUpgrade: () => void
}) {
  const { t, lang } = useT()
  const [confirm, setConfirm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [settings, setSettings] = useState(false)
  // `shownBadge` outlives `badgeOpen` so the sheet keeps its content while it closes.
  const [badgeOpen, setBadgeOpen] = useState(false)
  const [shownBadge, setShownBadge] = useState<Award | null>(null)
  const earnedAt = shownBadge && p.badges[shownBadge.id]
  const dateFmt = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' })
  const [draft, setDraft] = useState({ name: p.name, photo: p.photo })
  // A picked picture waits here while the learner frames it: pinch or scroll to zoom, drag to move.
  const [crop, setCrop] = useState<{ src: string; at: { x: number; y: number }; zoom: number; area: Area | null } | null>(null)
  const endCrop = () => {
    if (crop) URL.revokeObjectURL(crop.src)
    setCrop(null)
  }
  const openEdit = () => {
    sound.playClick()
    setDraft({ name: p.name, photo: p.photo })
    setEditing(true)
  }
  const pickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // so picking the same file again still fires
    if (!file) return
    try {
      ;(await createImageBitmap(file)).close() // formats the browser cannot decode (HEIC on some devices) fail here
      setCrop({ src: URL.createObjectURL(file), at: { x: 0, y: 0 }, zoom: 1, area: null })
    } catch {
      toast.error(t(ui.photoError))
    }
  }
  const since = p.joined ? new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(new Date(`${p.joined}T12:00`)) : ''
  const weekday = new Intl.DateTimeFormat(lang, { weekday: 'narrow' })
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { key: isoDay(d), name: weekday.format(d), active: !!p.daily[isoDay(d)], today: i === 6 }
  })
  const badges = awards(p)

  return (
    <div>
      <Sky>
        {/* Top bar: title centred, settings at the end; a spacer the button's size balances the row (mirrors in Arabic). */}
        <div className="grid h-14 grid-cols-[2.5rem_1fr_2.5rem] items-center px-4">
          <span aria-hidden />
          <span className="text-center text-[17px] font-semibold tracking-tight">{t(ui.profile)}</span>
          <button
            type="button"
            onClick={() => {
              sound.playClick()
              setSettings(true)
            }}
            aria-label={t(ui.settings)}
            className="glass hit grid h-10 w-10 place-items-center rounded-full active:scale-95 transition-transform"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="flex flex-col items-center px-5 pb-6 pt-1 text-center">
          <button type="button" onClick={openEdit} aria-label={t(ui.editProfile)} className="relative rounded-full active:scale-[0.97] transition-transform">
            <Avatar photo={p.photo} name={p.name} size={104} />
            {/* Tapping the photo edits the profile; the camera badge says so. */}
            <span className="glass absolute -bottom-0.5 end-0 grid h-8 w-8 place-items-center rounded-full">
              <Camera className="h-4 w-4 text-brand" />
            </span>
          </button>
          <h1 className="mt-3 max-w-full truncate text-[26px] font-semibold tracking-tight">{p.name || t(ui.learner)}</h1>
          <p className="mt-0.5 text-[14px] font-medium text-ink2">
            {t(ui.webPath)}
            {since && ` · ${t(ui.learningSince)} ${since}`}
          </p>
        </div>
      </Sky>

      <div className="grid gap-7 px-4 pb-6 pt-3">
        {/* Plan: what the learner is on, and the way to the plans page. */}
        <button type="button" onClick={onUpgrade} className="card flex items-center gap-3 p-3 text-start active:scale-[.99] transition-transform">
          <img src={PLAN_ART[plan]} alt="" className="h-12 w-12 shrink-0 object-contain" />
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-semibold text-ink2">{t(ui.planLabel)}</span>
            <span className="block text-[17px] font-semibold">{t(plan === 'free' ? ui.planFree : plan === 'max' ? ui.planMax : ui.planPro)}</span>
          </span>
          <span className={`rounded-full px-3.5 py-2 text-[13px] font-semibold ${plan === 'free' ? 'bg-accent text-ink' : 'bg-warm text-ink'}`}>
            {t(plan === 'free' ? ui.upgrade : ui.managePlan)}
          </span>
        </button>
        <section className="card flex divide-x divide-line rtl:divide-x-reverse">
          <Stat icon={<Flame className="h-6 w-6 fill-accent text-accent" />} value={streak(p.daily)} label={t(ui.streak)} />
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
                  className={`grid h-9 w-9 place-items-center rounded-full ${day.active ? 'bg-accent text-ink' : day.today ? 'border border-dashed border-brand/60' : 'bg-[#F4EFE9]'}`}
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
              <motion.li key={b.id} className="grid" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.03 * i }}>
                <button
                  type="button"
                  className="grid justify-items-center gap-1.5 rounded-2xl p-1 transition-transform active:scale-95"
                  onClick={() => {
                    sound.playClick()
                    setShownBadge(b)
                    setBadgeOpen(true)
                  }}
                >
                  <Badge id={b.id} earned={b.earned} size={64} />
                  <span className={`line-clamp-2 text-center text-[11px] font-medium leading-tight ${b.earned ? 'text-ink' : 'text-ink3'}`}>{t(b.label)}</span>
                </button>
              </motion.li>
            ))}
          </ul>
        </section>
      </div>

      <Tray open={badgeOpen} onClose={() => setBadgeOpen(false)} label={shownBadge ? t(shownBadge.label) : ''}>
        {shownBadge && (
          <div className="grid justify-items-center gap-4 text-center">
            <div className="grid justify-items-center">
              {/* Mounted only while open, so the 3D renderer is torn down with the sheet. */}
              {badgeOpen && <BadgeModel id={shownBadge.id} earned={shownBadge.earned} hint={t(ui.dragToSpin)} />}
            </div>
            <div className="grid gap-1">
              <h2 className="text-[22px] font-semibold tracking-tight">{t(shownBadge.label)}</h2>
              <p className={`text-[14px] font-semibold ${shownBadge.earned ? 'text-ok' : 'text-ink2'}`}>
                {shownBadge.earned && earnedAt ? `${t(ui.earnedOn)} ${dateFmt.format(new Date(`${earnedAt.at}T12:00`))}` : t(ui.notEarned)}
              </p>
            </div>
            {shownBadge.earned && earnedAt ? (
              <dl className="card grid w-full grid-cols-2 divide-x divide-line text-start rtl:divide-x-reverse">
                <div className="px-4 py-3">
                  <dt className="text-[12px] font-medium text-ink2">{t(ui.badgeNo)}</dt>
                  <dd className="font-mono text-[17px] font-bold tabular-nums">#{String(earnedAt.no).padStart(3, '0')}</dd>
                </div>
                <div className="px-4 py-3">
                  <dt className="text-[12px] font-medium text-ink2">{t(ui.serial)}</dt>
                  <dd className="font-mono text-[15px] font-bold" dir="ltr">
                    {earnedAt.serial}
                  </dd>
                </div>
              </dl>
            ) : null}
            <div className="card w-full px-4 py-3 text-start">
              <p className="text-[12px] font-medium text-ink2">{t(ui.howToGet)}</p>
              <p className="mt-0.5 text-[15px] font-medium leading-snug">{t(shownBadge.how)}</p>
              {!shownBadge.earned && shownBadge.need > 1 && (
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F4EFE9]">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(shownBadge.have / shownBadge.need) * 100}%` }} />
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums text-ink2">
                    {shownBadge.have}/{shownBadge.need}
                  </span>
                </div>
              )}
            </div>
            <Button tone="plain" onClick={() => setBadgeOpen(false)}>
              {t(ui.close)}
            </Button>
          </div>
        )}
      </Tray>

      <Tray open={settings} onClose={() => setSettings(false)} label={t(ui.settings)}>
        <div className="grid gap-3">
          <h2 className="px-1 pt-1 text-[20px] font-semibold tracking-tight">{t(ui.settings)}</h2>
          {/* Account: signed in, who as; signed out, a way in, so progress follows them to any device. */}
          {email ? (
            <div className="card flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] text-ink2">{t(ui.signedInAs)}</span>
                <span className="block truncate text-[15px] font-semibold">{email}</span>
              </span>
              <button
                type="button"
                className="min-h-[40px] shrink-0 rounded-full bg-ink/5 px-4 text-[14px] font-semibold active:scale-95"
                onClick={async () => {
                  await signOut()
                  toast(t(ui.signedOut))
                }}
              >
                {t(ui.signOut)}
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <GoogleButton />
              <p className="px-1 text-center text-[13px] text-ink2">{t(ui.syncHint)}</p>
            </div>
          )}
          <div className="card divide-y divide-line">
            <Segmented
              label={t(ui.language)}
              value={p.lang}
              onChange={(v) => set({ lang: v })}
              options={[
                { id: 'en', text: 'English' },
                { id: 'ar', text: 'العربية' },
              ]}
            />
            <Segmented
              label={t(ui.dailyGoal)}
              value={p.goal}
              onChange={(v) => set({ goal: v })}
              options={[
                { id: 1, text: '1' },
                { id: 2, text: '2' },
                { id: 3, text: '3' },
              ]}
            />
            <Segmented
              label={t(ui.sounds)}
              value={p.sound}
              onChange={(v) => set({ sound: v })}
              options={[
                { id: true, text: t(ui.on) },
                { id: false, text: t(ui.off) },
              ]}
            />
          </div>
          <Button
            tone="text"
            className="!text-bad"
            onClick={() => {
              setSettings(false)
              setConfirm(true)
            }}
          >
            {t(ui.reset)}
          </Button>
        </div>
      </Tray>

      <Tray open={editing} onClose={() => setEditing(false)} label={t(ui.editProfile)}>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            set({ name: draft.name.trim(), photo: draft.photo })
            // Signed in: the photo also goes to the avatars bucket, so it comes back on any device.
            if (draft.photo !== p.photo) saveAvatar(draft.photo).then((err) => err && toast.error(err))
            setEditing(false)
            toast.success(t(ui.profileSaved))
          }}
        >
          <h2 className="px-1 pt-1 text-[20px] font-semibold tracking-tight">{t(ui.editProfile)}</h2>
          <div className="grid justify-items-center gap-3">
            <Avatar photo={draft.photo} name={draft.name.trim()} size={88} />
            {/* Camera opens the camera on phones (`capture`); Gallery opens the device's photos and files. */}
            <div className="flex w-full gap-2">
              <label className="pick flex flex-1 cursor-pointer items-center justify-center gap-2 !text-[14px]">
                <Camera className="h-[18px] w-[18px] text-brand" />
                {t(ui.takePhoto)}
                <input type="file" accept="image/*" capture="user" className="sr-only" onChange={pickPhoto} />
              </label>
              <label className="pick flex flex-1 cursor-pointer items-center justify-center gap-2 !text-[14px]">
                <ImageIcon className="h-[18px] w-[18px] text-brand" />
                {t(ui.fromGallery)}
                <input type="file" accept="image/*" className="sr-only" onChange={pickPhoto} />
              </label>
              {draft.photo && (
                <button
                  type="button"
                  aria-label={t(ui.removePhoto)}
                  className="pick grid w-[52px] shrink-0 place-items-center !px-0"
                  onClick={() => setDraft((d) => ({ ...d, photo: '' }))}
                >
                  <Trash2 className="h-[18px] w-[18px] text-bad" />
                </button>
              )}
            </div>
          </div>
          <label className="grid gap-1.5 px-1">
            <span className="text-[14px] font-medium text-ink2">{t(ui.yourName)}</span>
            <input
              value={draft.name}
              maxLength={NAME_MAX}
              autoComplete="given-name"
              placeholder={t(ui.namePlaceholder)}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="h-12 rounded-[14px] border border-line bg-white px-4 text-[16px] font-medium outline-none focus:border-brand"
            />
          </label>
          <div className="grid gap-1">
            <Button type="submit">{t(ui.save)}</Button>
            <Button tone="text" onClick={() => setEditing(false)}>
              {t(ui.cancel)}
            </Button>
          </div>
        </form>
      </Tray>

      <Tray open={!!crop} onClose={endCrop} label={t(ui.framePhoto)}>
        {crop && (
          <div className="grid gap-4">
            <h2 className="px-1 pt-1 text-[20px] font-semibold tracking-tight">{t(ui.framePhoto)}</h2>
            <div ref={keepDragInside} className="relative h-[280px] overflow-hidden rounded-[20px] bg-ink">
              <Cropper
                image={crop.src}
                crop={crop.at}
                zoom={crop.zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={(at) => setCrop((c) => c && { ...c, at })}
                onZoomChange={(zoom) => setCrop((c) => c && { ...c, zoom })}
                onCropComplete={(_, area) => setCrop((c) => c && { ...c, area })}
              />
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={crop.zoom}
              aria-label={t(ui.zoom)}
              ref={keepDragInside}
              onChange={(e) => setCrop((c) => c && { ...c, zoom: Number(e.target.value) })}
              className="mx-1 accent-accent"
            />
            <div className="grid gap-1">
              <Button
                disabled={!crop.area}
                onClick={async () => {
                  const photo = await cropToAvatar(crop.src, crop.area!)
                  setDraft((d) => ({ ...d, photo }))
                  endCrop()
                }}
              >
                {t(ui.usePhoto)}
              </Button>
              <Button tone="text" onClick={endCrop}>
                {t(ui.cancel)}
              </Button>
            </div>
          </div>
        )}
      </Tray>

      <Tray open={confirm} onClose={() => setConfirm(false)} label={t(ui.resetTitle)}>
        <div className="grid gap-1 px-1 pb-5 pt-1">
          <h2 className="text-[20px] font-semibold tracking-tight">{t(ui.resetTitle)}</h2>
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
