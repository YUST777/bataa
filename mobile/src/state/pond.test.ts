import { describe, expect, test } from 'bun:test'
import {
  BREAD,
  buyDuck,
  duckPrice,
  openMarket,
  DECK,
  buyBread,
  FULL_MS,
  MAX_LEVEL,
  buyDecor,
  dayPart,
  drop,
  sprinkle,
  CRUMBS,
  CRUMB_FILL,
  hasBread,
  freshPond,
  fullness,
  hatch,
  moodBoost,
  parsePond,
  rate,
  settle,
} from '@/state/pond'

test('hatching fills the first free slot and uses an egg', () => {
  const h = hatch(freshPond())!
  expect(h.slot).toBe(0)
  expect(h.pond.deck[0]).toBe(1)
  expect(h.pond.eggs).toBe(1)
  expect(hatch({ ...freshPond(), eggs: 0 })).toBeNull()
  expect(hatch({ ...freshPond(), deck: Array(DECK).fill(1) })).toBeNull()
})

test('same levels merge up, others move or swap, the top level never merges', () => {
  const p = { ...freshPond(), deck: [2, 2, 3, 0, ...Array(DECK - 4).fill(0)] }
  const m = drop(p, 0, 1)
  expect(m.merged).toBe(true)
  expect(m.pond.deck.slice(0, 4)).toEqual([0, 3, 3, 0])
  expect(drop(p, 0, 3).pond.deck.slice(0, 4)).toEqual([0, 2, 3, 2])
  expect(drop(p, 0, 2).pond.deck.slice(0, 3)).toEqual([3, 2, 2])
  const top = { ...freshPond(), deck: [MAX_LEVEL, MAX_LEVEL, ...Array(DECK - 2).fill(0)] }
  expect(drop(top, 0, 1).merged).toBe(false)
})

test('coins build up with time, capped while away', () => {
  const p = { ...freshPond(), deck: [1, 3, ...Array(DECK - 2).fill(0)], at: 1000, full: 0.5 }
  expect(rate(p.deck)).toBeCloseTo(1.0)
  expect(settle(p, 11_000).coins).toBeCloseTo(10)
  expect(settle(p, 1000 + 24 * 3600_000).coins).toBeCloseTo(4 * 3600)
  expect(settle(freshPond(), 5000)).toMatchObject({ coins: 0, at: 5000 })
})

test('stored data is validated', () => {
  const bad = parsePond({ eggs: -3, coins: 'x', deck: [13, 2, 'a', 1.5], at: -1 })
  expect(bad).toMatchObject({ eggs: 0, coins: 0, at: 0 })
  expect(bad.deck.slice(0, 4)).toEqual([0, 2, 0, 0])
  expect(bad.deck.length).toBe(DECK)
})

test('the flock gets hungry over time; bread from the bag fills it; mood changes earnings', () => {
  const p = { ...freshPond(), coins: 20, bread: 3, full: 0.9, fedAt: 1000 }
  expect(fullness(p, 1000 + FULL_MS / 2)).toBeCloseTo(0.4)
  expect(fullness(p, 1000 + FULL_MS * 2)).toBe(0)
  expect(moodBoost(0.1)).toBe(0.5)
  expect(moodBoost(0.5)).toBe(1)
  expect(moodBoost(0.9)).toBe(1.5)
  const half = 1000 + FULL_MS / 2
  let fed = p
  for (let i = 0; i < CRUMBS; i++) fed = sprinkle(fed, half)!
  expect(fed).toMatchObject({ coins: 20, bread: 2, bits: 0 })
  expect(fullness(fed, half)).toBeCloseTo(0.4 + CRUMB_FILL)
  expect(sprinkle({ ...p, bread: 0 }, 1000)).toBeNull()
  expect(sprinkle({ ...p, full: 1 }, 1000)).toBeNull()
  // One crumb opens a handful; the rest of it keeps until the next crumb.
  const one = sprinkle({ ...p, full: 0.5, fedAt: 0 }, 1000)!
  expect(one).toMatchObject({ bread: 2, bits: CRUMBS - 1 })
  expect(sprinkle(one, 1000)).toMatchObject({ bread: 2, bits: CRUMBS - 2 })
  expect(hasBread({ ...p, bread: 0, bits: 2 })).toBe(true)
  expect(hasBread({ ...p, bread: 0, bits: 0 })).toBe(false)
  expect(parsePond({ bits: 99 }).bits).toBe(CRUMBS - 1)
})

test('decorations are bought once each with coins; the pond follows the clock', () => {
  const rich = { ...freshPond(), coins: 100 }
  const once = buyDecor(rich, 'lotus')!
  expect(once.decor).toEqual(['lotus'])
  expect(once.coins).toBe(40)
  expect(buyDecor(once, 'lotus')).toBeNull()
  expect(buyDecor(rich, 'fireflies')).toBeNull()
  expect(parsePond({ decor: ['lotus', 'lotus', 'rocket'] }).decor).toEqual(['lotus'])
  expect([parsePond({ tour: true }).tour, parsePond({ tour: 'yes' }).tour, freshPond().tour]).toEqual([true, false, false])
  expect([6, 12, 18, 23, 2].map(dayPart)).toEqual(['dawn', 'day', 'sunset', 'night', 'night'])
})

test('bread comes by the bag from the shop; old saves get a starter bag', () => {
  expect(buyBread({ ...freshPond(), coins: BREAD.price + 1, bread: 0 })).toMatchObject({ coins: 1, bread: 1 })
  expect(buyBread({ ...freshPond(), coins: BREAD.price - 1 })).toBeNull()
  expect(parsePond({}).bread).toBe(2)
  expect(parsePond({ bread: 0 }).bread).toBe(0)
  expect(parsePond({ bread: -4 }).bread).toBe(0)
})

describe('daily duck market', () => {
  const rich = (deck: number[]) => ({ ...freshPond(), coins: 100_000, deck: [...deck, ...Array(DECK - deck.length).fill(0)] })

  test('opens four ducks a day around the best duck, once per day', () => {
    const p = openMarket(rich([3, 1]), '2026-11-13')
    expect(p.market.offers).toEqual([2, 2, 3, 4])
    expect(openMarket(p, '2026-11-13')).toBe(p)
    expect(openMarket(p, '2026-11-14').market.sold).toEqual([false, false, false, false])
  })

  test('a duck is sold once, costs coins and lands in the first empty slot', () => {
    const p = openMarket(rich([1]), '2026-11-13')
    const r = buyDuck(p, 3)!
    expect(r.slot).toBe(1)
    expect(r.pond.deck[1]).toBe(2)
    expect(r.pond.coins).toBe(100_000 - duckPrice(2))
    expect(buyDuck(r.pond, 3)).toBeNull()
  })

  test('no sale when the deck is full or coins are short', () => {
    expect(buyDuck(openMarket({ ...rich([]), coins: 0 }, 'd'), 0)).toBeNull()
    expect(buyDuck(openMarket(rich(Array(DECK).fill(1)), 'd'), 0)).toBeNull()
  })
})
