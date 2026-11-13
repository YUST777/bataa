import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react'
import { AnimatePresence, animate, motion, useDragControls, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react'
import NumberFlow from '@number-flow/react'
import { ArrowLeft, Croissant, Heart, Info, Moon, Store } from '@/components/Icon'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { IconButton, Tray, spring } from '@/components/ui'
import { ui, useT } from '@/i18n'
import { sound } from '@/lib/sound'
import { DUCK_PARTS } from '@/screens/pondDuckArt'
import {
  BREAD,
  FULL_MS,
  CRUMBS,
  DECOR,
  buyBread,
  buyDecor,
  dayPart,
  drop,
  hasBread,
  sprinkle,
  fullness,
  hatch,
  hungry,
  moodBoost,
  rate,
  settle,
  type DayPart,
  type DecorId,
  type Pond as PondState,
} from '@/state/pond'

/** Pieces of public/pond/items.svg (the art sheet), as [x, y, width, height] in its 80x80 units. */
const ITEMS = {
  bandana: [3, 24.5, 14, 9.2],
  glasses: [19, 26, 11.8, 5.8],
  book: [32.6, 24.8, 11, 9.6],
  headphones: [45.6, 23.1, 14, 11.2],
  laptop: [61.6, 24.4, 15.4, 9.6],
  egg: [0.6, 36.5, 7.6, 8.8],
  eggCracked: [9.4, 36.5, 7.6, 8.8],
  eggHatching: [18.2, 36.6, 7.6, 8.6],
  coin: [35.6, 37.9, 5.9, 5.9],
  coins: [42.4, 38.2, 7.4, 5.8],
  sparkles: [59.8, 36.3, 8.2, 8],
  lily: [0.3, 47.6, 11.4, 7.2],
  lily2: [12.2, 47.6, 11, 7],
  ripple: [46.4, 48.4, 11, 5],
  lotus: [66.6, 46.6, 11.8, 7.8],
} as const
type Item = keyof typeof ITEMS
/** Pieces of public/pond/gadgets.svg: what ducks wear from level 7 up (some are spare, for later levels). */
const GADGETS = {
  partyHat: [3.0, 8.7, 12.9, 16.2],
  beanie: [21.4, 8.6, 15.4, 16.5],
  chefHat: [41.2, 8.6, 16.1, 16.7],
  gradCap: [59.5, 10.2, 18.6, 14.9],
  crown: [3.3, 31.5, 14.1, 13.2],
  pencils: [23.7, 30.7, 12.4, 16.9],
  mug: [41.1, 32.5, 16.2, 14.8],
  keychain: [61.0, 29.5, 14.5, 19.4],
  medal: [4.3, 52.6, 12.7, 18.8],
  scarf: [22.5, 53.5, 14.0, 17.8],
  backpack: [40.6, 53.5, 16.6, 17.7],
  wand: [63.2, 52.9, 14.7, 18.3],
} as const
type Gadget = keyof typeof GADGETS

function Sprite({ name, size, className = '' }: { name: Item; size: number; className?: string }) {
  const [x, y, w, h] = ITEMS[name]
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={size} height={(size * h) / w} className={`block ${className}`} aria-hidden>
      <image href="/pond/items.svg" width="80" height="80" />
    </svg>
  )
}

/**
 * A pond duck at a level, fully animated: it breathes, blinks, bobs and tilts its head, sways its tuft
 * and wags its tail, each on its own timing (index.css, .pd-*). `seed` offsets the timings so ducks never
 * move in step. Each level wears exactly one item from the art sheet (level 1 none, then bandana, glasses,
 * book, headphones, laptop, then from gadgets.svg: party hat, scarf, beanie, chef hat, graduation cap, crown), so a merge swaps the gadget for the next one. Head items move with the head. The duck is seen three-quarters on, so the
 * headphones' far ear cup is clipped away (it would cover an eye); the band and the near cup stay.
 * Coordinates are the duck's own (viewBox 2 0 32 40), from the rig parts (pondDuckArt.ts).
 */
type Gear = [level: number, item: Item | Gadget, x: number, y: number, w: number]
const BODY_GEAR: Gear[] = [
  [2, 'bandana', 9.5, 16.6, 12],
  [4, 'book', 3.6, 20.5, 9.5],
  [6, 'laptop', 2.6, 21.6, 11],
  [8, 'scarf', 10, 15.3, 10],
]
const HEADPHONES: Gear[] = [[5, 'headphones', 8.9, 0.2, 17]]
const HEAD_GEAR: Gear[] = [
  [3, 'glasses', 7.9, 8.2, 12.5],
  [7, 'partyHat', 13.5, -3.2, 8],
  [9, 'beanie', 8.2, -7.6, 16],
  [10, 'chefHat', 9.8, -5.2, 12.5],
  [11, 'gradCap', 8.2, -4.6, 15.5],
  [12, 'crown', 11.2, -2.6, 10.5],
]
function gear(list: Gear[], level: number) {
  return list
    .filter(([at]) => at === level)
    .map(([, item, x, y, w]) => {
      const [ix, iy, iw, ih] = item in ITEMS ? ITEMS[item as Item] : GADGETS[item as Gadget]
      return (
        <svg key={item} x={x} y={y} width={w} height={(w * ih) / iw} viewBox={`${ix} ${iy} ${iw} ${ih}`}>
          <image href={item in ITEMS ? '/pond/items.svg' : '/pond/gadgets.svg'} width="80" height="80" />
        </svg>
      )
    })
}
const part = (name: keyof typeof DUCK_PARTS) => <g dangerouslySetInnerHTML={{ __html: DUCK_PARTS[name] }} />
export function PondDuck({ level, size, seed = 0, asleep = false }: { level: number; size: number; seed?: number; asleep?: boolean }) {
  const clip = useId()
  return (
    <svg
      viewBox="2 0 32 40"
      width={size}
      height={(size * 40) / 32}
      className="block overflow-visible"
      style={{ ['--d' as string]: `${-((seed * 0.731) % 3).toFixed(2)}s` }}
      aria-hidden
    >
      {/* A level-1 duck is a little smaller: a duckling. */}
      <g transform={level === 1 ? 'translate(18 40) scale(.84) translate(-18 -40)' : undefined}>
        <g className="pd-tail">{part('tail')}</g>
        {part('legL')}
        {part('legR')}
        <g className="pd-body">
          {part('body')}
          {gear(BODY_GEAR, level)}
        </g>
        <g className="pd-head">
          {part('head')}
          <g className="pd-tuft">{part('tuft')}</g>
          {part('mClosed')}
          {/* The eyes glance about together (pd-look) and blink on their own beat (pd-eye). */}
          {asleep ? (
            // Asleep: eyes shut, two soft arcs.
            <g fill="none" stroke="#181616" strokeWidth=".6" strokeLinecap="round">
              <path d="M9.5 11.4q1.2 1 2.4 0" />
              <path d="M16.4 11.9q1.2 1 2.4 0" />
            </g>
          ) : (
            <g className="pd-look">
              <g className="pd-eye">
                <ellipse cx="10.7" cy="11" rx="1.15" ry="1.75" fill="#181616" />
                <circle cx="10.35" cy="10.35" r=".4" fill="#fff" />
              </g>
              <g className="pd-eye">
                <ellipse cx="17.6" cy="11.5" rx="1.15" ry="1.75" fill="#181616" />
                <circle cx="17.25" cy="10.85" r=".4" fill="#fff" />
              </g>
            </g>
          )}
          {gear(HEAD_GEAR, level)}
          {level === 5 && (
            <>
              {/* Keeps the band (above y 3.6) and everything behind the near eye (x past 20.1). */}
              <clipPath id={clip}>
                <path d="M0-2H40V40H20.1V3.6H0z" />
              </clipPath>
              <g clipPath={`url(#${clip})`}>{gear(HEADPHONES, level)}</g>
            </>
          )}
        </g>
      </g>
    </svg>
  )
}

/** A crumb of bread on the water, in the open water's own pixels. `by` is the duck (seed) sent to eat it. */
/** `fx`, `fy`: where it was thrown from (the dock, where the learner stands). */
type Crumb = { id: number; x: number; y: number; by: number; fx: number; fy: number; sprinkled?: boolean }
type Spot = { x: number; y: number }

/**
 * One duck swimming loose on the lake. It sits low in the water (feet hidden under the waterline, a
 * ripple ring around it), faces the way it swims, and wanders: glides to a random spot, sometimes rests
 * and bobs, then picks a new one. Further away (higher up) means smaller and behind. Driven by a small
 * per-frame loop that writes transforms straight to the element, so React does not re-render 60 times
 * a second. When a crumb is meant for it, it hurries over and eats it; at night it sleeps and drifts.
 */
function Swimmer({
  level,
  seed,
  ate,
  area,
  asleep,
  peckish,
  food,
  spots,
  onEat,
}: {
  level: number
  seed: number
  ate: number | null
  area: { w: number; h: number; top: number }
  asleep: boolean
  peckish: boolean
  food: { current: Crumb[] }
  spots: { current: Record<number, Spot> }
  onEat: (crumb: number, seed: number) => void
}) {
  const el = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const flip = useRef<HTMLDivElement>(null)
  // Read by the frame loop, so changing them does not restart the swim.
  const sleepy = useRef(asleep)
  sleepy.current = asleep
  const eat = useRef(onEat)
  eat.current = onEat
  const [chasing, setChasing] = useState(false)
  useEffect(() => {
    if (!area.w || !area.h) return
    let rnd = seed * 9301 + 49297
    const rand = () => (rnd = (rnd * 9301 + 49297) % 233280) / 233280
    const pad = 34
    // Never above y 40: a far duck's head then stays below the shore line.
    const spot = () => ({
      x: pad + rand() * (area.w - pad * 2),
      y: 40 + rand() * Math.max(0, area.h - 50),
    })
    const pos = spot()
    spots.current[seed] = pos
    let goal: Spot = spot()
    const vel = { x: 0, y: 0 }
    let facing = rand() < 0.5 ? 1 : -1
    let wantFace = facing
    let wantFor = 0 // seconds the duck has been heading the other way
    let rest = 0
    let hunting = false
    const speed = 22 + rand() * 12 // px per second at full glide
    let last = performance.now()
    let raf = 0
    // Turning around: a short eased turn with a slight squash, so it reads as the duck turning, not the
    // picture flipping. scaleX passes close to zero mid-turn, as a body seen side-on does.
    const turn = (to: number) => {
      flip.current?.animate([{ transform: `scaleX(${-to})` }, { transform: 'scaleX(.18) scaleY(1.05)', offset: 0.5 }, { transform: `scaleX(${to})` }], {
        duration: 280,
        easing: 'cubic-bezier(.45,0,.25,1)',
        fill: 'forwards',
      })
    }
    if (flip.current) flip.current.style.transform = `scaleX(${facing})`
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      // A crumb meant for this duck wins over wandering.
      const meal = food.current.find((c) => c.by === seed)
      if (!!meal !== hunting) setChasing((hunting = !!meal))
      if (meal) {
        goal = meal
        rest = 0
      }
      const dx = goal.x - pos.x
      const dy = goal.y - pos.y
      const dist = Math.hypot(dx, dy)
      // Steering with momentum: the duck eases toward the speed and heading it wants, so its path
      // curves and it glides to a stop instead of snapping between straight lines.
      let want = { x: 0, y: 0 }
      if (meal && dist < 10) {
        eat.current(meal.id, seed)
        goal = spot()
        rest = 1.2
      } else if (rest > 0) rest -= dt
      else if (dist < 6) {
        goal = spot()
        if (rand() < (sleepy.current ? 0.9 : 0.45)) rest = (sleepy.current ? 4 : 0.8) + rand() * 2.2 // a little rest now and then
      } else {
        // Asleep it barely drifts; for bread it hurries.
        const v = speed * (meal ? 1.9 : sleepy.current ? 0.25 : 1) * Math.min(1, dist / 50)
        want = { x: (dx / dist) * v, y: (dy / dist) * v * 0.7 }
      }
      const ease = 1 - Math.exp(-dt * (meal ? 3.5 : 2.2))
      vel.x += (want.x - vel.x) * ease
      vel.y += (want.y - vel.y) * ease
      pos.x += vel.x * dt
      pos.y += vel.y * dt
      // Turn only when it has really been heading the other way for a moment: no jitter.
      if (Math.abs(vel.x) > 5) {
        const f = vel.x > 0 ? -1 : 1 // the art faces left; flip to swim right
        if (f !== facing) {
          wantFor = f === wantFace ? wantFor + dt : 0
          wantFace = f
          if (wantFor > 0.18) {
            facing = f
            wantFor = 0
            turn(facing)
          }
        } else wantFor = 0
      }
      const s = 0.72 + 0.38 * (pos.y / area.h) // perspective: further up is further away
      const bob = Math.sin(now / (sleepy.current ? 900 : 520) + seed) * 1.6
      // Leans a touch into its swim, and rocks gently.
      const lean = Math.max(-5, Math.min(5, (vel.x / speed) * -4 * facing))
      if (el.current) {
        el.current.style.transform = `translate(${pos.x}px, ${pos.y + bob}px) scale(${s})`
        el.current.style.zIndex = String(Math.round(pos.y))
      }
      if (body.current) body.current.style.transform = `rotate(${lean + Math.sin(now / 700 + seed) * 2.5}deg)`
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      delete spots.current[seed]
    }
  }, [area.w, area.h, seed, food, spots])

  const size = 58
  const h = (size * 40) / 32
  const waterline = h * 0.74 // the duck shows above this; feet and belly are under water
  return (
    <div ref={el} className="absolute left-0 top-0 will-change-transform" style={{ marginLeft: -size / 2, marginTop: -waterline }}>
      <div className="relative" style={{ width: size, height: waterline }}>
        {/* A still ring on the surface where the duck sits. */}
        <span
          className={`absolute left-1/2 rounded-[50%] border-[1.5px] ${asleep ? 'border-[#FFF2DF]/25' : 'border-[#FFF2DF]/60'}`}
          style={{
            top: waterline - 7,
            width: size * 1.1,
            height: 14,
            marginLeft: -size * 0.55,
          }}
        />
        <div className="absolute inset-0 overflow-hidden">
          <div ref={body} style={{ transformOrigin: '50% 80%' }}>
            <div ref={flip}>
              <PondDuck level={level} size={size} seed={seed} asleep={asleep} />
            </div>
          </div>
        </div>
        {/* Asleep: little z's float up. Hungry: a thought bubble with bread in it. */}
        {asleep && (
          <span className="pointer-events-none absolute -top-2 right-0 text-[13px] font-bold text-[#FFF1DA]">
            <span className="pd-z absolute" style={{ animationDelay: `${-seed * 0.7}s` }}>
              z
            </span>
            <span className="pd-z absolute text-[10px]" style={{ animationDelay: `${-seed * 0.7 - 1.2}s` }}>
              z
            </span>
          </span>
        )}
        {peckish && !asleep && !chasing && (
          <motion.span
            className="pointer-events-none absolute -top-6 -right-3 grid h-7 w-7 place-items-center rounded-full bg-white shadow-[0_2px_6px_rgba(120,50,0,.25)]"
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: [0, -3, 0] }}
            transition={{
              y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
              scale: spring,
            }}
          >
            <Croissant className="h-4 w-4 text-[#C97A2E]" strokeWidth={2.4} />
            <span className="absolute -bottom-1 left-0.5 h-2 w-2 rounded-full bg-white" />
          </motion.span>
        )}
        <AnimatePresence>
          {ate !== null && (
            <motion.span key={ate} className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2" exit={{ opacity: 0 }}>
              {[-14, 0, 14].map((x, i) => (
                <motion.span
                  key={i}
                  className="absolute"
                  initial={{ opacity: 0, x: 0, y: 4, scale: 0.4 }}
                  animate={{ opacity: [0, 1, 0], x, y: -26 - i * 4, scale: 1 }}
                  transition={{
                    duration: 1.1,
                    delay: i * 0.12,
                    ease: 'easeOut',
                  }}
                >
                  <Heart className="h-4 w-4 fill-[#FF6B6B] text-[#FF6B6B]" strokeWidth={0} />
                </motion.span>
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Pieces of public/pond/decor.svg (the decoration art), as [x, y, width, height] in its 80x80 units. */
const DECOR_ART = { lotus: [0.4, 28.6, 22, 19.4], lantern: [28.7, 24.4, 22.7, 27.4], fireflies: [57.4, 27.4, 22.6, 22] } as const
function Decor({ name, size, className = '', style }: { name: keyof typeof DECOR_ART; size: number; className?: string; style?: CSSProperties }) {
  const [x, y, w, h] = DECOR_ART[name]
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={size} height={(size * h) / w} className={`block ${className}`} style={style} aria-hidden>
      <image href="/pond/decor.svg" width="80" height="80" />
    </svg>
  )
}

/** A sky lantern. The art has its own glow; lit (after sunset) it shines out, by day it rests dimmer. */
function Lantern({ size, lit }: { size: number; lit: boolean }) {
  return <Decor name="lantern" size={size} style={{ filter: lit ? 'drop-shadow(0 0 8px rgba(255,193,90,.75))' : 'saturate(.75) brightness(.95)' }} />
}

/** Light over the pond for each part of the day. Sunset is the art as drawn; the others tint it. Warm and purple only. */
const TINT: Record<DayPart, string | null> = {
  dawn: 'linear-gradient(180deg, rgba(214,130,190,.55) 0%, rgba(255,150,170,.38) 40%, rgba(255,175,175,.22) 100%)',
  day: 'linear-gradient(180deg, rgba(255,250,228,.5) 0%, rgba(255,238,205,.22) 60%, rgba(255,238,205,.06) 100%)',
  sunset: null,
  night: 'linear-gradient(180deg, rgba(30,16,54,.8) 0%, rgba(58,24,72,.64) 45%, rgba(72,30,62,.55) 100%)',
}
/** The far shore line in the art, as a fraction of its height (y 18.9 of 80). */
/** How often the held bread bag drops a crumb: CRUMBS of them pour in about three seconds. */
const POUR_MS = 125
const SHORE = 0.236
const STARS = [
  [22, 5],
  [30, 11],
  [26, 21],
  [36, 3],
  [49, 7],
  [55, 13],
  [59, 4],
  [33, 16],
  [52, 22],
  [20, 14],
  [46, 26],
  [57, 28],
]
/** The phase from the clock; `?time=night` (or dawn, day, sunset) pins it, to preview. */
const pinned = new URLSearchParams(window.location.search).get('time') as DayPart | null
const nowPart = (): DayPart => (pinned && pinned in TINT ? pinned : dayPart(new Date().getHours()))

/**
 * Duck Pond. The top is the pond, with every duck you own swimming in it; the bottom is the wooden deck
 * where they sit in slots and merge: drag a duck onto one of the same level and they become one duck a
 * level up. Eggs come from lessons. The app's tab bar is hidden here; the back button leaves.
 *
 * Care keeps you coming back: the flock gets hungry over a few hours, and hungry ducks earn half. Tap the
 * water to toss bread (coins); the nearest duck hurries over and eats it. Coins also buy decorations. The
 * pond follows the real clock: dawn, day, sunset and night, when the ducks sleep and the lanterns glow.
 */
export function Pond({ pond, setPond, onExit }: { pond: PondState; setPond: (p: PondState) => void; onExit: () => void }) {
  const { t } = useT()
  const live = useRef(pond)
  live.current = pond
  const [hatching, setHatching] = useState<number | null>(null)
  const [merged, setMerged] = useState<{ slot: number; key: number } | null>(null)
  const [ate, setAte] = useState<Record<number, number>>({})
  const [crumbs, setCrumbs] = useState<Crumb[]>([])
  const food = useRef<Crumb[]>([])
  const spots = useRef<Record<number, Spot>>({})
  const [shop, setShop] = useState(false)
  const [shopInfo, setShopInfo] = useState(false)
  const [care, setCare] = useState(false)
  const [phase, setPhase] = useState(nowPart)
  useEffect(() => {
    const id = window.setInterval(() => setPhase(nowPart()), 60_000)
    return () => clearInterval(id)
  }, [])
  const night = phase === 'night'
  // Bags left, counting the open one.
  const bags = pond.bread + (pond.bits ? 1 : 0)
  const lit = night || phase === 'sunset'
  // In the Android app: light status-bar icons over the dark night pond, dark ones otherwise (MainActivity).
  useEffect(() => {
    window.BataaNative?.setTheme?.(night ? 'dark' : 'light')
    return () => window.BataaNative?.setTheme?.('light')
  }, [night])
  // The pond is fixed to the screen: the page under it must not scroll up and down.
  useEffect(() => {
    const html = document.documentElement
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = ''
    }
  }, [])
  // Swipe toward the right to leave, with motion's drag (it handles touch, pointer capture and flick speed).
  // The scene follows the finger and the app shows through behind it; let go past 60px, or flick, and it
  // slides away, otherwise it springs back. A swipe can start anywhere outside the dock and buttons, or
  // anywhere within 40px of the left edge. Android's own back gesture (MainActivity asks window.__bataaBack)
  // does the same slide: edge swipes belong to the system there, not to the page.
  const CLOSE_AT = 60
  const dragX = useMotionValue(0)
  const swipeControls = useDragControls()
  // The back badge that rides in from the left edge as the pond uncovers it; it fills orange once letting go will close.
  const backLeft = useTransform(dragX, (v) => Math.min(v, 120) / 2 - 22)
  const backOpacity = useTransform(dragX, [0, CLOSE_AT], [0, 1])
  const backScale = useTransform(dragX, [0, CLOSE_AT], [0.6, 1])
  const [armed, setArmed] = useState(false)
  useMotionValueEvent(dragX, 'change', (v) => setArmed(v >= CLOSE_AT))
  const leaving = useRef(false)
  const slideAway = () => {
    if (leaving.current) return
    leaving.current = true
    sound.playClick(360)
    animate(dragX, window.innerWidth * 1.05, { duration: 0.26, ease: [0.4, 0, 0.2, 1] }).then(onExit)
  }
  useEffect(() => {
    window.__bataaBack = () => {
      slideAway()
      return true
    }
    return () => {
      delete window.__bataaBack
    }
  })
  const swipeStart = (e: RPointerEvent<HTMLDivElement>) => {
    const edge = e.clientX < 40
    if ((e.target as HTMLElement).closest(edge ? '[role=dialog]' : '[data-slot],[data-bag],button,[role=dialog]')) return
    swipeControls.start(e)
  }
  // The lake: from the far shore in the art down to the dock. Nothing on the water goes past the shore.
  // `top` is where the shore falls inside the water box; the art covers the screen from the top, so the
  // shore is a fixed fraction (SHORE) of the art's drawn height.
  const root = useRef<HTMLDivElement>(null)
  const water = useRef<HTMLDivElement>(null)
  const [area, setArea] = useState({ w: 0, h: 0, top: 0, sky: 0 })
  useEffect(() => {
    const node = water.current
    const box = root.current
    if (!node || !box) return
    const measure = () => {
      const r = box.getBoundingClientRect()
      const w = node.getBoundingClientRect()
      const artH = 800 * Math.max(r.width / 446, r.height / 800)
      const top = Math.max(0, Math.round(artH * SHORE - (w.top - r.top)))
      setArea({ w: w.width, h: Math.max(0, w.height - top), top, sky: artH * SHORE })
    }
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  // Coins tick up while the pond is open (and once on entry for the time away).
  useEffect(() => {
    setPond(settle(live.current, Date.now()))
    const id = window.setInterval(() => setPond(settle(live.current, Date.now())), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setFood = (next: Crumb[]) => {
    food.current = next
    setCrumbs(next)
  }
  // The bread bag: pick it up and hold it over the water; it shakes out a crumb every POUR_MS (a whole bag
  // pours for about three seconds), like feeding pigeons, and the nearest free duck races for each one.
  // Let go and the bag hops back home.
  const bagEl = useRef<HTMLButtonElement>(null)
  const grip = useRef<{ x: number; y: number; dx: number; dy: number; over: boolean; tick: number; timer: number; done: boolean } | null>(null)
  const crumb = (cx: number, cy: number) => {
    const now = Date.now()
    const fed = sprinkle(settle(live.current, now), now)
    if (!fed) {
      if (grip.current) grip.current.done = true
      if (fullness(live.current, now) >= 1) toast(t(ui.flockFull))
      else {
        toast(t(ui.needBread))
        setShop(true)
      }
      return
    }
    live.current = fed
    setPond(fed)
    // That was the last crumb in this bag: it goes back home empty; the next drag opens a new one.
    if (!fed.bits && grip.current) grip.current.done = true
    const owned = fed.deck.map((l, i) => (l ? i + 1 : 0)).filter(Boolean)
    const busy = new Set(food.current.map((c) => c.by))
    const x = Math.max(20, Math.min(area.w - 20, cx + (Math.random() - 0.5) * 18))
    const y = Math.max(40, Math.min(area.h - 10, cy + (Math.random() - 0.5) * 14))
    let by = owned[0]
    let best = Infinity
    for (const seed of owned) {
      const p = spots.current[seed]
      if (!p) continue
      const d = Math.hypot(p.x - x, p.y - y) + (busy.has(seed) ? 10_000 : 0)
      if (d < best) [best, by] = [d, seed]
    }
    const c: Crumb = { id: now + Math.random(), x, y, by, fx: x, fy: y - 30, sprinkled: true }
    setFood([...food.current, c])
    // Each crumb a little higher in pitch, so a long pour builds up.
    sound.playClick(280 + (CRUMBS - fed.bits) * 12)
    // Uneaten bread sinks after a while.
    window.setTimeout(() => food.current.some((k) => k.id === c.id) && setFood(food.current.filter((k) => k.id !== c.id)), 9000)
  }
  const bagDown = (e: RPointerEvent<HTMLButtonElement>) => {
    if (night) return void toast(t(ui.ducksAsleep))
    if (!live.current.deck.some((l) => l)) return void toast(t(ui.hatchFirst))
    if (!hasBread(live.current)) {
      toast(t(ui.needBread))
      return setShop(true)
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    bagEl.current?.style.removeProperty('transition')
    const g = { x: e.clientX, y: e.clientY, dx: 0, dy: 0, over: false, tick: 0, timer: 0, done: false }
    g.timer = window.setInterval(() => pour.current(), POUR_MS)
    grip.current = g
  }
  // One shake of the bag: a crumb lands under it while it is over the water. Read through a ref so the
  // interval always sees this render's pond.
  const pour = useRef(() => {})
  useEffect(() => () => window.clearInterval(grip.current?.timer), [])
  pour.current = () => {
    const g = grip.current
    const w = water.current
    if (!g || !w || !bagEl.current) return
    if (g.done) return bagUp()
    if (!g.over) return
    g.tick++
    bagEl.current.style.transform = `translate(${g.dx}px, ${g.dy}px) rotate(${g.tick % 2 ? -44 : -28}deg) scale(1.12)`
    const r = w.getBoundingClientRect()
    crumb(g.x - r.left, g.y - r.top - area.top)
  }
  const bagMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const g = grip.current
    const w = water.current
    if (!g || !w || !bagEl.current) return
    if (g.done) return bagUp()
    g.x = e.clientX
    g.y = e.clientY
    g.dx += e.movementX
    g.dy += e.movementY
    // Follows the finger, tilted like it is being shaken out.
    bagEl.current.style.transform = `translate(${g.dx}px, ${g.dy}px) rotate(${Math.max(-25, Math.min(25, e.movementX * 3)) - 35}deg) scale(1.12)`
    const r = w.getBoundingClientRect()
    const over = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top + area.top && e.clientY < r.bottom
    // The first crumb falls the moment the bag reaches the water; the rest follow on the timer.
    const entering = over && !g.over && !g.tick
    g.over = over
    if (entering) pour.current()
  }
  const bagUp = () => {
    if (grip.current) window.clearInterval(grip.current.timer)
    grip.current = null
    const el = bagEl.current
    if (!el) return
    el.style.transition = 'transform 320ms cubic-bezier(.2,.9,.3,1.4)'
    el.style.transform = ''
  }
  const onEat = (id: number, seed: number) => {
    setFood(food.current.filter((c) => c.id !== id))
    setAte((a) => ({ ...a, [seed]: Date.now() }))
    window.setTimeout(() => setAte((a) => ({ ...a, [seed]: 0 })), 1300)
    sound.playClick(720)
  }
  const buy = (id: DecorId) => {
    const next = buyDecor(live.current, id)
    if (!next) return void toast(t(ui.needCoins))
    setPond(next)
    sound.playAscendingCorrect()
  }

  const doHatch = () => {
    const h = hatch(live.current)
    if (!h) return
    sound.playClick(520)
    setHatching(h.slot)
    // The egg cracks open on its slot, then the duckling pops out.
    window.setTimeout(() => {
      setPond(h.pond)
      setHatching(null)
      sound.playAscendingCorrect()
    }, 650)
  }
  const onDrop = (from: number, e: RPointerEvent | PointerEvent | MouseEvent | TouchEvent) => {
    const pt = 'changedTouches' in e ? e.changedTouches[0] : (e as PointerEvent)
    const target = document.elementsFromPoint(pt.clientX, pt.clientY).find((n) => (n as HTMLElement).dataset?.slot !== undefined) as HTMLElement | undefined
    if (!target) return
    const to = Number(target.dataset.slot)
    const r = drop(live.current, from, to)
    if (r.pond === live.current) return
    setPond(r.pond)
    if (r.merged) {
      const key = Date.now()
      setMerged({ slot: to, key })
      // Clear it once the effect has played, so nothing lingers on the pad.
      window.setTimeout(() => setMerged((m) => (m?.key === key ? null : m)), 900)
      sound.playAscendingCorrect(2)
      // A small warm burst from the pad, so a merge lands as a moment.
      const r = target.getBoundingClientRect()
      confetti({
        particleCount: 36,
        spread: 70,
        startVelocity: 22,
        scalar: 0.8,
        ticks: 90,
        origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight },
        colors: ['#F9801D', '#FFC533', '#FFE9C4', '#7DBE4F'],
        disableForReducedMotion: true,
      })
    } else sound.playClick()
  }

  const full = pond.deck.every((l) => l)
  const fill = fullness(pond, Date.now())
  const boost = moodBoost(fill)
  const starving = hungry(fill)
  const perSec = rate(pond.deck) * boost
  const mood = night ? ui.moodAsleep : starving ? ui.moodHungry : boost > 1 ? ui.moodHappy : ui.moodOk
  // Fullness drains in a straight line, so the time until it drops below hungry is simple to tell.
  const untilHungry = Math.max(0, (fill - 0.3) * FULL_MS)
  const hungryIn = `${Math.floor(untilHungry / 3_600_000)}h ${Math.floor((untilHungry % 3_600_000) / 60_000)}m`
  const has = (id: DecorId) => pond.decor.includes(id)
  const DECOR_INFO = {
    lotus: {
      name: ui.lotus,
      info: ui.lotusInfo,
      icon: <Decor name="lotus" size={46} />,
    },
    lanterns: {
      name: ui.lanterns,
      info: ui.lanternsInfo,
      icon: <Lantern size={36} lit />,
    },
    fireflies: {
      name: ui.fireflies,
      info: ui.firefliesInfo,
      icon: <Decor name="fireflies" size={44} />,
    },
  }

  return (
    // The whole screen is the sunset pond (public/pond/sunset.svg, from the art set). Ducks swim in the open
    // water; the wooden dock floats on the water below them. Layers: water (z-10) < light of the hour (z-15)
    // < moon, stars, sky lanterns, fireflies (z-16) < ducks and bread (z-17) < dock (z-20) < header (z-30).
    <>
      {/* Swipe-to-close badge, outside the moving scene so it stays on screen. */}
      <motion.div
        aria-hidden
        className={`pointer-events-none fixed top-1/2 z-50 -mt-[22px] grid h-11 w-11 place-items-center rounded-full shadow-float backdrop-blur-md transition-colors duration-150 ${armed ? 'bg-brand text-white' : 'bg-white/85 text-ink'}`}
        style={{ left: backLeft, opacity: backOpacity, scale: backScale }}
      >
        <ArrowLeft className="h-5 w-5 rtl:-scale-x-100" />
      </motion.div>
      <motion.div
        ref={root}
        className="relative flex h-dvh touch-none flex-col overflow-hidden bg-[#F98427] bg-cover bg-top"
        style={{ backgroundImage: 'url(/pond/sunset.svg)', x: dragX }}
        drag="x"
        dragListener={false}
        dragControls={swipeControls}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 1 }}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (info.offset.x > CLOSE_AT || (info.offset.x > 24 && info.velocity.x > 250)) slideAway()
        }}
        onPointerDown={swipeStart}
      >
        <AnimatePresence>
          {TINT[phase] && (
            <motion.div
              key={phase}
              className="pointer-events-none absolute inset-0 z-[15]"
              style={{ background: TINT[phase]! }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6 }}
            />
          )}
        </AnimatePresence>
        {night && (
          // Same box as the background art (cover, top), so the moon sits where the sun was.
          <svg viewBox="17.65 0 44.61 80" preserveAspectRatio="xMidYMin slice" className="pointer-events-none absolute inset-0 z-[16] h-full w-full" aria-hidden>
            <defs>
              <radialGradient id="moonGlow">
                <stop offset="0" stopColor="#FFE9C4" stopOpacity=".55" />
                <stop offset="1" stopColor="#FFE9C4" stopOpacity="0" />
              </radialGradient>
              {/* The ridge in front of the sun (y 18 of 80): the moon sits behind it, half risen, as the sun does. */}
              <clipPath id="aboveRidge">
                <rect x="17" y="0" width="46" height="18.05" />
              </clipPath>
            </defs>
            {STARS.map(([x, y], i) => (
              <circle key={i} className="pond-star" cx={x} cy={y} r={i % 3 ? 0.22 : 0.32} fill="#FFF3DC" style={{ animationDelay: `${-i * 0.63}s` }} />
            ))}
            <circle cx="43.18" cy="18.02" r="9" fill="url(#moonGlow)" />
            <g clipPath="url(#aboveRidge)">
              <circle cx="43.18" cy="18.02" r="3.2" fill="#FFF1D6" />
              <circle cx="42.1" cy="16.4" r=".55" fill="#F2DDB8" />
              <circle cx="44.3" cy="15.9" r=".35" fill="#F2DDB8" />
              <circle cx="44.6" cy="17.3" r=".45" fill="#F2DDB8" />
            </g>
          </svg>
        )}

        {/* Things that give their own light float in the sky, between the header and the far shore, above the
          dark of night. */}
        <div className="pointer-events-none absolute inset-x-0 z-[16]" style={{ top: 70, height: Math.max(0, area.sky - 70) }}>
          {has('lanterns') &&
            [
              [6, 30],
              [24, 4],
              [76, 40],
              [88, 8],
            ].map(([x, y], i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: `${x}%`, top: `${y}%` }}
                animate={{ y: [0, -5, 0], rotate: [-3, 3, -3] }}
                transition={{
                  duration: 4 + i * 0.7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Lantern size={24} lit={lit} />
              </motion.div>
            ))}
          {has('fireflies') &&
            lit &&
            Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                className="firefly absolute h-1.5 w-1.5 rounded-full bg-[#FFE38A] shadow-[0_0_8px_3px_rgba(255,214,110,.75)]"
                style={{
                  left: `${((i * 37) % 92) + 4}%`,
                  top: `${((i * 53) % 80) + 6}%`,
                  animationDelay: `${-i * 1.3}s`,
                  animationDuration: `${7 + (i % 4)}s`,
                }}
              />
            ))}
        </div>

        {/* One row: back, the title, the flock's mood (how full they are), the wallet. */}
        <header className="relative z-30 flex items-center gap-1.5 px-4 min-[360px]:gap-2" style={{ paddingTop: 'calc(var(--sat, env(safe-area-inset-top, 0px)) + 14px)' }}>
          <IconButton label={t(ui.back)} onClick={onExit}>
            <ArrowLeft className="h-5 w-5 rtl:-scale-x-100" strokeWidth={2.5} />
          </IconButton>
          {/* On the narrowest phones (under 360px) the title gives its room to the pills; screen readers still get it. */}
          <span className={`me-auto ps-1 text-[22px] font-semibold tracking-tight max-[359px]:sr-only ${night ? 'text-white' : ''}`}>{t(ui.pond)}</span>
          {/* The flock's mood; tap for the details. */}
          <button type="button" aria-label={t(mood)} onClick={() => setCare(true)} className="glass ms-auto flex h-10 items-center gap-1 rounded-full px-2 active:scale-95">
            {night ? (
              <Moon className="h-4 w-4 fill-[#8E6BB0] text-[#8E6BB0]" strokeWidth={0} />
            ) : (
              <Heart className={`h-4 w-4 ${starving ? 'fill-[#E5533D] text-[#E5533D]' : 'fill-[#FF6B6B] text-[#FF6B6B]'}`} strokeWidth={0} />
            )}
            <span className="h-1.5 w-7 overflow-hidden rounded-full bg-ink/10">
              <motion.span
                className={`block h-full rounded-full ${starving ? 'bg-[#E5533D]' : 'bg-brand'}`}
                animate={{ width: `${Math.round(fill * 100)}%` }}
                transition={spring}
              />
            </span>
          </button>
          <span className="glass flex h-10 items-center gap-1 rounded-full px-2.5 text-[14px] font-semibold tabular-nums">
            <Sprite name="coin" size={18} />
            {/* Large totals go compact (12.3K) so the pill always fits the header. */}
            <NumberFlow value={Math.floor(pond.coins)} format={pond.coins >= 10_000 ? { notation: 'compact', maximumFractionDigits: 1 } : undefined} />
            <span className="h-4 w-px bg-ink/15" />
            <Sprite name="egg" size={13} />
            {pond.eggs}
          </span>
        </header>

        {/* Open water: every duck you own swims here. Drag the bread bag over it to feed them. */}
        <div ref={water} className="relative min-h-[150px] flex-1">
          {/* No ducks yet: say where they come from. */}
          {!pond.deck.some((l) => l) && (
            <p
              className="pointer-events-none absolute inset-x-6 z-20 mx-auto max-w-[280px] rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-center text-[14px] font-semibold text-ink shadow-soft backdrop-blur-md"
              style={{ top: area.top + 24 }}
            >
              {t(pond.eggs ? ui.noDucksEgg : ui.noDucksLesson)}
            </p>
          )}
          <div className="absolute inset-x-0 bottom-0 isolate z-10" style={{ top: area.top }}>
            {/* Lily pads drifting on the swell. */}
            <motion.div
              className="absolute left-[4%] top-[58%]"
              animate={{ y: [0, -3, 0], rotate: [-3, 3, -3], x: [0, 6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sprite name="lily" size={44} className="opacity-90" />
            </motion.div>
            <motion.div
              className="absolute right-[6%] top-[22%]"
              animate={{ y: [0, 2, 0], rotate: [4, -3, 4], x: [0, -5, 0] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sprite name="lily2" size={36} className="opacity-90" />
            </motion.div>
            {has('lotus') &&
              [
                [18, 26, 40],
                [70, 64, 34],
                [44, 88, 30],
              ].map(([x, y, s], i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  animate={{ y: [0, -2, 0], rotate: [-2, 2, -2] }}
                  transition={{
                    duration: 5 + i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Decor name="lotus" size={s} />
                </motion.div>
              ))}
          </div>
          {/* Ducks and bread sit above the light of the hour, so the flock is never lost in the dark;
            at night they are just a little dimmer. */}
          <div className={`absolute inset-x-0 bottom-0 isolate z-[17] ${night ? 'brightness-[.8] saturate-[.85]' : ''}`} style={{ top: area.top }}>
            {/* Bread: tossed in, it lands with a splash and floats until a duck gets it. */}
            <AnimatePresence>
              {crumbs.map((c) => (
                // Thrown from the dock in an arc (up, then down onto the water), then a splash.
                <motion.div
                  key={c.id}
                  className="pointer-events-none absolute"
                  style={{ left: c.x, top: c.y, zIndex: Math.round(c.y) }}
                  initial={{ x: c.fx - c.x, y: c.fy - c.y, scale: 0.7 }}
                  animate={{ x: 0, y: c.sprinkled ? 0 : [c.fy - c.y, Math.min(c.fy - c.y, 0) / 2 - 70, 0], scale: 1 }}
                  transition={
                    c.sprinkled
                      ? { duration: 0.22, ease: 'easeIn' }
                      : { duration: 0.55, x: { duration: 0.55, ease: 'linear' }, y: { duration: 0.55, times: [0, 0.45, 1], ease: ['easeOut', 'easeIn'] } }
                  }
                  exit={{ opacity: 0, scale: 0.4 }}
                >
                  <motion.span
                    className="absolute -left-6 -top-2 h-4 w-12 rounded-[50%] border-2 border-[#FFF2DF]"
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: [0, 0.9, 0], scale: [0.3, 0.3, 1.5] }}
                    transition={{ duration: 0.8, delay: c.sprinkled ? 0.18 : 0.5 }}
                  />
                  <motion.span
                    className="absolute -left-2.5 -top-3 block"
                    // Squashed as it hits the water.
                    initial={{ scaleX: 1, scaleY: 1 }}
                    animate={{ scaleX: [1, 1.3, 0.95, 1], scaleY: [1, 0.7, 1.05, 1] }}
                    transition={{ duration: 0.3, delay: c.sprinkled ? 0.2 : 0.52 }}
                  >
                    {c.sprinkled ? (
                      <span className="absolute left-1.5 top-1.5 h-[7px] w-2 rotate-12 rounded-[2px] bg-[#F7C987] shadow-[inset_0_-1.5px_0_#D9954A]" />
                    ) : (
                      <>
                        <span className="absolute left-0 top-1 h-2.5 w-3 rotate-12 rounded-[3px] border border-[#B9722F] bg-[#F2B66A]" />
                        <span className="absolute left-2.5 top-0 h-2 w-2.5 -rotate-12 rounded-[3px] border border-[#B9722F] bg-[#F7C987]" />
                        <span className="absolute left-1.5 top-2.5 h-1.5 w-2 rounded-[2px] border border-[#B9722F] bg-[#F2B66A]" />
                      </>
                    )}
                  </motion.span>
                </motion.div>
              ))}
            </AnimatePresence>
            {pond.deck.map((l, i) =>
              l ? <Swimmer key={i} level={l} seed={i + 1} ate={ate[i + 1] || null} area={area} asleep={night} peckish={starving} food={food} spots={spots} onEat={onEat} /> : null,
            )}
          </div>
          {/* The bread bag: sits by the dock; pick it up and drag it over the water. */}
          <button
            ref={bagEl}
            type="button"
            data-bag
            aria-label={t(ui.breadBag)}
            onPointerDown={bagDown}
            onPointerMove={bagMove}
            onPointerUp={bagUp}
            onPointerCancel={bagUp}
            className="absolute bottom-2 end-3 z-[19] grid h-[74px] w-[64px] touch-none select-none place-items-center"
            style={{ transformOrigin: '50% 80%' }}
          >
            {/* An open bag sags as it empties. */}
            <svg
              viewBox="0 0 64 74"
              className="pointer-events-none h-full w-full drop-shadow-[0_4px_6px_rgba(90,50,20,.35)] transition-transform duration-200"
              style={{ transform: `scaleY(${pond.bits ? 0.62 + (0.38 * pond.bits) / CRUMBS : 1})`, transformOrigin: '50% 100%' }}
              aria-hidden
            >
              {/* Kraft-paper bag, drawn like the pond item sheet: flat shapes, soft shading, no outlines. */}
              <path d="M13 20Q7 42 10 65Q32 73 54 65Q57 42 51 20Z" fill="#F5C590" />
              <path d="M44 21Q50 42 47 67Q51 66 54 65Q57 42 51 20Z" fill="#E8AB74" />
              <path d="M13 20Q9 40 10 52Q11 38 16 21Z" fill="#FAD5A7" />
              <path d="M12 20Q32 27 52 20L50 9Q32 15 14 9Z" fill="#F7D0A7" />
              <path d="M14 9Q32 15 50 9L51 13Q32 19 13 13Z" fill="#F0AB69" />
              <path d="M12 20Q32 27 52 20L51.5 23Q32 30 12.5 23Z" fill="#E8AB74" />
              <ellipse cx="32" cy="45" rx="14" ry="10" fill="#FEF5EC" />
              <path d="M21 47Q21 38 32 38Q43 38 43 47Q43 51 32 51Q21 51 21 47Z" fill="#F7B26D" />
              <path d="M21 47Q21 38 32 38Q43 38 43 47Q37 43 32 43Q27 43 21 47Z" fill="#F9A408" />
              <path d="M27 41.5l1.6 3M32 40.5l0 3.2M37 41.5l-1.6 3" stroke="#FEF5EC" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="pointer-events-none absolute -end-1 -top-1 grid min-w-[22px] place-items-center rounded-full bg-white px-1 text-[12px] font-bold leading-[22px] text-ink shadow-soft">
              {bags}
            </span>
          </button>
        </div>

        {/* The dock: wooden planks floating on the water, a lily pad per slot. Drag a duck onto its twin to merge. */}
        <div className="relative z-20 px-3">
          <div
            className="relative rounded-[28px] p-2 shadow-float"
            style={{
              background: 'linear-gradient(180deg, #D99554 0%, #B56A31 100%)',
            }}
          >
            <div
              className="grid grid-cols-4 gap-1 rounded-[22px] px-1.5 py-2"
              style={{
                background:
                  'repeating-linear-gradient(90deg, transparent 0 calc(25% - 3px), rgba(150,85,35,.28) calc(25% - 3px) 25%), linear-gradient(180deg, #FAD7A6 0%, #F1BF80 100%)',
              }}
            >
              {pond.deck.map((level, i) => (
                <div key={i} data-slot={i} className="relative grid aspect-[1/1.05] place-items-end justify-items-center">
                  <Sprite name={i % 3 === 1 ? 'lily2' : 'lily'} size={64} className="pointer-events-none absolute bottom-1 drop-shadow-[0_2px_0_rgba(90,50,20,.35)]" />
                  {/* Merge: a cream ring bursts from the pad and fades away. */}
                  {merged?.slot === i && (
                    <motion.span
                      key={merged.key}
                      className="pointer-events-none absolute bottom-2 h-6 w-16 rounded-[50%] border-[3px] border-[#FFF6E6]"
                      initial={{ opacity: 0.95, scale: 0.6 }}
                      animate={{ opacity: 0, scale: 1.6 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  )}
                  {hatching === i && (
                    <motion.div
                      className="relative mb-3"
                      initial={{ scale: 0.6 }}
                      animate={{
                        scale: [0.6, 1.1, 1],
                        rotate: [0, -8, 8, -6, 0],
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <Sprite name="eggCracked" size={38} />
                    </motion.div>
                  )}
                  {level > 0 && (
                    <motion.div
                      key={level}
                      className="relative z-10 mb-2 cursor-grab touch-none active:cursor-grabbing"
                      drag
                      dragSnapToOrigin
                      dragElastic={1}
                      // A small press-in before the lift (anticipation), then it rises to be carried.
                      whileTap={{ scale: 0.92 }}
                      whileDrag={{ scale: 1.15, zIndex: 50 }}
                      onDragStart={() => sound.playClick(380)}
                      onDragEnd={(e) => onDrop(i, e)}
                      // A new duck (hatched or merged) drops onto its pad: stretched as it falls, squashed as it
                      // lands, a little rebound, then still. Squash from the feet.
                      style={{ originY: 1 }}
                      initial={{ scaleX: 0.6, scaleY: 1.4, y: -18, opacity: 0 }}
                      animate={{ scaleX: [0.6, 1.25, 0.95, 1], scaleY: [1.4, 0.75, 1.05, 1], y: [-18, 0, -2, 0], opacity: 1 }}
                      transition={{ duration: 0.5, times: [0, 0.45, 0.75, 1], ease: 'easeOut', opacity: { duration: 0.1 } }}
                    >
                      <PondDuck level={level} size={62} seed={i + 0.5} asleep={night} />
                      <span className="absolute -right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-brand px-1 text-[11px] font-bold text-white">
                        {level}
                      </span>
                      {merged?.slot === i && (
                        <motion.div
                          className="pointer-events-none absolute -inset-3"
                          initial={{ opacity: 1, scale: 0.5 }}
                          animate={{ opacity: 0, scale: 1.4 }}
                          transition={{ duration: 0.8 }}
                        >
                          <Sprite name="sparkles" size={80} />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-20 px-4 pt-3" style={{ paddingBottom: 'calc(var(--sab, env(safe-area-inset-bottom, 0px)) + 14px)' }}>
          <div className="flex gap-2">
            {pond.eggs > 0 ? (
              <button type="button" disabled={full || hatching !== null} onClick={doHatch} className="btn btn-primary shadow-float">
                <Sprite name="egg" size={22} />
                {full ? t(ui.deckFull) : `${t(ui.hatchEgg)} · ${pond.eggs}`}
              </button>
            ) : (
              // Eggs only come from lessons, so with none left the button sends you to learn.
              <button type="button" onClick={onExit} className="btn bg-white/90 text-ink shadow-float backdrop-blur-sm">
                <Sprite name="egg" size={22} />
                {t(ui.earnEgg)}
              </button>
            )}
            <button
              type="button"
              aria-label={t(ui.pondShop)}
              onClick={() => setShop(true)}
              className="relative grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] bg-white/90 text-ink shadow-float backdrop-blur-sm active:scale-95"
            >
              <Store className="h-6 w-6" strokeWidth={2.2} />
              {/* Bread left in the bag, on the shop where more is bought. */}
              <span className="absolute -end-1.5 -top-1.5 flex h-6 items-center gap-0.5 rounded-full border-2 border-white bg-brand pe-1.5 ps-1 text-[12px] font-bold tabular-nums text-white">
                <Croissant className="h-3.5 w-3.5" />
                {bags}
              </span>
            </button>
          </div>
        </div>

        <Tray open={shop} onClose={() => setShop(false)} label={t(ui.pondShop)}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-[20px] font-semibold tracking-tight">
              {t(ui.pondShop)}
              <button
                type="button"
                aria-label={t(ui.howItWorks)}
                aria-expanded={shopInfo}
                onClick={() => setShopInfo((v) => !v)}
                className="hit relative grid h-8 w-8 place-items-center rounded-full text-ink/45 active:bg-ink/5"
              >
                <Info className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </button>
            </h2>
            <span className="flex items-center gap-1.5 text-[15px] font-semibold tabular-nums">
              <Sprite name="coin" size={18} />
              {Math.floor(pond.coins)}
            </span>
          </div>
          {shopInfo && <p className="-mt-1 mb-3 text-[13px] text-ink/60">{t(ui.feedHint)}</p>}
          <ul className="space-y-2">
            {/* Bread: bought again and again, by the bag. */}
            <li className="flex items-center gap-3 rounded-2xl bg-ink/[.04] p-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center">
                <Croissant className="h-10 w-10" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{t(ui.breadBag)}</span>
                <span className="block text-[13px] text-ink/60">
                  {t(ui.breadInfo)} · {t(ui.inBag)} {bags}
                </span>
              </span>
              <button
                type="button"
                disabled={pond.coins < BREAD.price}
                onClick={() => {
                  const next = buyBread(live.current)
                  if (!next) return void toast(t(ui.needCoins))
                  setPond(next)
                  sound.playClick(620)
                }}
                className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-brand px-3 text-[14px] font-semibold text-white active:scale-95 disabled:bg-ink/10 disabled:text-ink/50"
              >
                <Sprite name="coin" size={15} />
                {BREAD.price}
              </button>
            </li>
            {DECOR.map(({ id, price }) => {
              const d = DECOR_INFO[id]
              const owned = has(id)
              return (
                <li key={id} className="flex items-center gap-3 rounded-2xl bg-ink/[.04] p-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center">{d.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold">{t(d.name)}</span>
                    <span className="block text-[13px] text-ink/60">{t(d.info)}</span>
                  </span>
                  <button
                    type="button"
                    disabled={owned || pond.coins < price}
                    onClick={() => buy(id)}
                    className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-brand px-3 text-[14px] font-semibold text-white disabled:bg-ink/10 disabled:text-ink/50"
                  >
                    {owned ? (
                      t(ui.owned)
                    ) : (
                      <>
                        <Sprite name="coin" size={15} />
                        {price}
                      </>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </Tray>

        {/* The flock's wellbeing: how full they are, what that does to earnings, and how to care for them. */}
        <Tray open={care} onClose={() => setCare(false)} label={t(mood)}>
          <div className="mb-4 flex items-center gap-2">
            {night ? (
              <Moon className="h-6 w-6 fill-[#8E6BB0] text-[#8E6BB0]" strokeWidth={0} />
            ) : (
              <Heart className={`h-6 w-6 ${starving ? 'fill-[#E5533D] text-[#E5533D]' : 'fill-[#FF6B6B] text-[#FF6B6B]'}`} strokeWidth={0} />
            )}
            <h2 className="me-auto text-[20px] font-semibold tracking-tight">{t(mood)}</h2>
            <span className="text-[15px] font-semibold tabular-nums text-ink/60">{Math.round(fill * 100)}%</span>
          </div>
          <span className="block h-2.5 overflow-hidden rounded-full bg-ink/10">
            <span className={`block h-full rounded-full ${starving ? 'bg-[#E5533D]' : 'bg-brand'}`} style={{ width: `${Math.round(fill * 100)}%` }} />
          </span>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-ink/[.04] p-3">
              <dt className="text-[13px] text-ink/55">{t(ui.earning)}</dt>
              <dd className="flex items-center gap-1 text-[17px] font-semibold tabular-nums">
                <Sprite name="coin" size={15} />+{perSec.toFixed(1)}/s
                {boost !== 1 && <span className={`text-[14px] ${boost > 1 ? 'text-[#2E9E5B]' : 'text-[#E5533D]'}`}>×{boost}</span>}
              </dd>
            </div>
            <div className="rounded-2xl bg-ink/[.04] p-3">
              <dt className="text-[13px] text-ink/55">{t(ui.hungryIn)}</dt>
              <dd className="text-[17px] font-semibold tabular-nums">{starving ? t(ui.now) : hungryIn}</dd>
            </div>
          </dl>
          <ul className="mt-4 space-y-2 text-[14px] text-ink/70">
            <li>{t(ui.careDrain)}</li>
            <li>{t(ui.careBoost)}</li>
            <li>{t(ui.feedHint)}</li>
            <li>{t(ui.careSleep)}</li>
            <li>{t(ui.pondHint)}</li>
          </ul>
        </Tray>

        {!pond.tour && <PondTour onDone={() => setPond({ ...live.current, tour: true })} />}

        {/* Edge handle: a quiet hint that the pond swipes away from the left edge. */}
        <span aria-hidden className="pointer-events-none absolute left-1 top-[38%] z-[25] h-10 w-1 rounded-full bg-white/55" />
      </motion.div>
    </>
  )
}

/** First visit: four short cards on how the pond works. */
const TOUR = [
  { icon: 'egg', title: ui.tourEggsTitle, body: ui.tourEggsBody },
  { icon: 'sparkles', title: ui.tourMergeTitle, body: ui.tourMergeBody },
  { icon: 'bread', title: ui.tourFeedTitle, body: ui.tourFeedBody },
  { icon: 'moon', title: ui.tourTimeTitle, body: ui.tourTimeBody },
] as const
function PondTour({ onDone }: { onDone: () => void }) {
  const { t } = useT()
  const [step, setStep] = useState(0)
  const card = TOUR[step]
  const last = step === TOUR.length - 1
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-end bg-ink/45 p-3"
      style={{ paddingBottom: 'calc(var(--sab, env(safe-area-inset-bottom, 0px)) + 12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="w-full rounded-[28px] bg-white p-5 shadow-float" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="grid justify-items-center gap-2 text-center"
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <span className="grid h-16 w-16 place-items-center">
              {card.icon === 'egg' ? (
                <Sprite name="egg" size={40} />
              ) : card.icon === 'sparkles' ? (
                <PondDuck level={2} size={52} />
              ) : card.icon === 'bread' ? (
                <Croissant className="h-12 w-12" />
              ) : (
                <Moon className="h-12 w-12" />
              )}
            </span>
            <h2 className="text-[20px] font-semibold tracking-tight">{t(card.title)}</h2>
            <p className="text-[15px] leading-snug text-ink2">{t(card.body)}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-4 flex justify-center gap-1.5">
          {TOUR.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-brand' : 'w-1.5 bg-ink/15'}`} />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {!last && (
            <button type="button" onClick={onDone} className="btn-text !w-auto px-4">
              {t(ui.skip)}
            </button>
          )}
          <button type="button" onClick={() => (last ? onDone() : setStep(step + 1))} className="btn btn-primary flex-1">
            {t(last ? ui.gotIt : ui.next)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
