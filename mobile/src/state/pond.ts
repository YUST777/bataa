/**
 * Duck Pond: the merge mini-game. Pure rules, no React, so they are easy to test.
 *
 * Finishing a lesson earns eggs. An egg hatches into a level-1 duck on the deck. Two ducks of the same
 * level merge into one of the next level. Every duck earns coins over time, more at higher levels.
 * Lessons are the only way to get eggs: the pond rewards learning, it never replaces it.
 *
 * Coins are for caring: ducks get hungry over a few hours, hungry ducks earn half. Bread, bought by the bag
 * in the shop and sprinkled on the water crumb by crumb (drag the bag over it), fills them up; a well-fed flock earns more. Coins
 * also buy decorations.
 * The pond follows the real clock (dawn, day, sunset, night); at night the ducks sleep.
 */
export const DECK = 12
export const MAX_LEVEL = 12
/** Coins earned while away stop piling up after this long, so a long break is not a jackpot. */
const AWAY_CAP_MS = 4 * 60 * 60 * 1000

export interface Pond {
  eggs: number
  coins: number
  /** Deck slots: 0 is empty, otherwise the duck's level (1..MAX_LEVEL). */
  deck: number[]
  /** When coins were last counted (ms since epoch); 0 before the first visit. */
  at: number
  /** How full the flock was (0..1) at `fedAt`; it drains over FULL_MS. */
  full: number
  fedAt: number
  /** Decorations bought, by id (see DECOR). */
  decor: string[]
  /** The first-visit tutorial has been shown. */
  tour: boolean
  /** Handfuls of bread in the bag, bought in the shop (BREAD). */
  bread: number
  /** Crumbs left in the handful that is open in the bag's hand (0 when none is open). */
  bits: number
}

/** A full flock is hungry again after this long. */
export const FULL_MS = 8 * 60 * 60 * 1000
/**
 * Bread comes in bags: `bread` counts the unopened ones, `bits` the crumbs left in the open one. A bag is
 * one long drag over the water (CRUMBS crumbs) and fills the flock by CRUMB_FILL in all.
 */
export const BREAD = { price: 25 } as const
export const CRUMBS = 24
export const CRUMB_FILL = 0.6
export const DECOR = [
  { id: 'lotus', price: 60 },
  { id: 'lanterns', price: 150 },
  { id: 'fireflies', price: 260 },
] as const
export type DecorId = (typeof DECOR)[number]['id']

/** New players start with two eggs, so the pond is playable before their first lesson ends. */
export const freshPond = (): Pond => ({ eggs: 2, coins: 0, deck: Array(DECK).fill(0), at: 0, full: 0.6, fedAt: 0, decor: [], tour: false, bread: 2, bits: 0 })

const count = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0)

/** Stored data is untrusted: every field is checked and falls back to a fresh value. */
export function parsePond(v: any): Pond {
  if (!v || typeof v !== 'object') return freshPond()
  const deck = Array.isArray(v.deck) ? v.deck.slice(0, DECK).map((l: unknown) => (Number.isInteger(l) && (l as number) >= 1 && (l as number) <= MAX_LEVEL ? l : 0)) : []
  while (deck.length < DECK) deck.push(0)
  const full = typeof v.full === 'number' && v.full >= 0 ? Math.min(1, v.full) : 0.6
  const decor = Array.isArray(v.decor) ? [...new Set<string>(v.decor)].filter((d) => DECOR.some((x) => x.id === d)) : []
  return {
    eggs: count(v.eggs),
    coins: typeof v.coins === 'number' && v.coins > 0 ? v.coins : 0,
    deck,
    at: count(v.at),
    full,
    fedAt: count(v.fedAt),
    decor,
    tour: v.tour === true,
    bread: v.bread === undefined ? 2 : count(v.bread),
    bits: Math.min(count(v.bits), CRUMBS - 1),
  }
}

/** Coins per second a duck earns: doubles with every level (0.2/s at level 1, 6.4/s at level 6, 409.6/s at level 12). */
export const duckRate = (level: number) => (level ? 0.2 * 2 ** (level - 1) : 0)
export const rate = (deck: number[]) => deck.reduce((sum, l) => sum + duckRate(l), 0)

/** How full the flock is right now, 0..1. Before the first feed it holds at its start value. */
export const fullness = (p: Pond, now: number) => (p.fedAt ? Math.max(0, p.full - (now - p.fedAt) / FULL_MS) : p.full)
/** Earnings by mood: hungry ducks earn half, a well-fed flock earns half again. */
export const moodBoost = (full: number) => (full < 0.3 ? 0.5 : full > 0.7 ? 1.5 : 1)
export const hungry = (full: number) => full < 0.3

/** Adds the coins earned since the last count, at the flock's current mood. */
export function settle(p: Pond, now: number): Pond {
  if (!p.at) return { ...p, at: now }
  const ms = Math.min(Math.max(0, now - p.at), AWAY_CAP_MS)
  return { ...p, coins: p.coins + (rate(p.deck) * moodBoost(fullness(p, now)) * ms) / 1000, at: now }
}

/** Sprinkles one crumb. Opens the next bag when none is open. Null when the bag is empty or the flock is already full. */
export function sprinkle(p: Pond, now: number): Pond | null {
  const f = fullness(p, now)
  if ((!p.bits && p.bread < 1) || f >= 1) return null
  const open = p.bits || CRUMBS
  return { ...p, bread: p.bits ? p.bread : p.bread - 1, bits: open - 1, full: Math.min(1, f + CRUMB_FILL / CRUMBS), fedAt: now }
}

/** True when there is bread left to sprinkle. */
export const hasBread = (p: Pond) => p.bread > 0 || p.bits > 0

/** Buys one bag of bread. Null when there are not enough coins. */
export function buyBread(p: Pond): Pond | null {
  return p.coins < BREAD.price ? null : { ...p, coins: p.coins - BREAD.price, bread: p.bread + 1 }
}

export function buyDecor(p: Pond, id: DecorId): Pond | null {
  const item = DECOR.find((d) => d.id === id)
  if (!item || p.decor.includes(id) || p.coins < item.price) return null
  return { ...p, coins: p.coins - item.price, decor: [...p.decor, id] }
}

/** The pond's light, from the local hour. */
export type DayPart = 'dawn' | 'day' | 'sunset' | 'night'
export function dayPart(hour: number): DayPart {
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'sunset'
  return 'night'
}

/** Hatches an egg into the first free slot. Returns null when there is no egg or no room. */
export function hatch(p: Pond): { pond: Pond; slot: number } | null {
  const slot = p.deck.indexOf(0)
  if (!p.eggs || slot < 0) return null
  const deck = [...p.deck]
  deck[slot] = 1
  return { pond: { ...p, eggs: p.eggs - 1, deck }, slot }
}

/**
 * Drops the duck in slot `from` onto slot `to`. The same level merges into one duck a level up
 * (unless both are already at the top level); an empty slot is a move; a different level swaps them.
 */
export function drop(p: Pond, from: number, to: number): { pond: Pond; merged: boolean } {
  const a = p.deck[from]
  const b = p.deck[to]
  if (from === to || !a) return { pond: p, merged: false }
  const deck = [...p.deck]
  if (a === b && a < MAX_LEVEL) {
    deck[to] = a + 1
    deck[from] = 0
    return { pond: { ...p, deck }, merged: true }
  }
  deck[to] = a
  deck[from] = b
  return { pond: { ...p, deck }, merged: false }
}

/** Eggs for finishing a lesson or review: one, and a bonus one for a perfect run. */
export const lessonEggs = (perfect: boolean) => (perfect ? 2 : 1)
