import { expect, test } from 'bun:test'
import { units } from '@/data/course'
import { PRICE, proOnly } from './plans'

test('Free opens the first unit only; Pro opens everything', () => {
  const [html, css] = units
  for (const l of html.lessons) expect(proOnly('free', l.id)).toBe(false)
  for (const l of css.lessons) expect(proOnly('free', l.id)).toBe(true)
  for (const u of units) for (const l of u.lessons) expect(proOnly('pro', l.id)).toBe(false)
})

test('yearly is about 20% off twelve months', () => {
  for (const p of Object.values(PRICE)) expect(p.yearly / (p.monthly * 12)).toBeCloseTo(0.8, 2)
})
