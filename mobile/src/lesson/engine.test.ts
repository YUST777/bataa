import { expect, test } from 'bun:test'
import { lessons } from '@/data/course'
import { newSerial, parse, reward, streak, unlocked } from '@/state/progress'
import type { CodeTask } from '@/types'
import { blank, check, previewDoc, ready, solution } from './engine'

const tasks = lessons.flatMap((l) => l.tasks)
const task = (id: string) => tasks.find((t) => t.id === id)!

test('every task: blank answer fails, its own solution passes', () => {
  expect(new Set(tasks.map((t) => t.id)).size).toBe(tasks.length)
  for (const t of tasks) {
    if (t.type !== 'learn') expect(check(t, blank(t)).ok).toBe(false)
    expect(ready(t, solution(t))).toBe(true)
    expect(check(t, solution(t))).toEqual({ ok: true })
  }
})

test('every lesson teaches before it asks: it opens with a learn card that shows working code', () => {
  for (const l of lessons) expect(l.tasks[0].type).toBe('learn')
  for (const t of tasks) if (t.type === 'learn') expect(previewDoc(t, blank(t))).not.toBeNull()
})

test('code checks accept equivalent answers and explain the first failure', () => {
  const button = task('button-6') as CodeTask
  expect(check(button, '<BUTTON class="x">  start learning </BUTTON>').ok).toBe(true)
  expect(check(button, '<div>Start learning</div>').why).toBe(button.rules[0].fail)
  expect(check(button, '<button>Go</button>').why).toBe(button.rules[1].fail)

  const link = task('links-6') as CodeTask
  expect(check(link, '<a href="">Visit Waddle</a>').ok).toBe(false)
  expect(check(link, "<a href='/x'>Visit Waddle</a>").ok).toBe(true)

  const color = task('color-6') as CodeTask
  expect(check(color, 'button{background-color:red;color:#fff}').ok).toBe(true)
  // background-color must not count as the text color
  expect(check(color, 'button { background-color: red; }').why).toBe(color.rules[1].fail)

  const hover = task('hover-5') as CodeTask
  expect(check(hover, hover.starter).why).toBe(hover.rules[1].fail)
  expect(check(hover, 'button:hover { background: red }').why).toBe(hover.rules[0].fail)
})

test('order answers compare tokens, and preview follows the task language', () => {
  const order = task('button-2')
  expect(check(order, [3, 1, 0]).ok).toBe(true)
  expect(check(order, [2, 1, 0]).ok).toBe(false)
  expect(previewDoc(order, [3, 1])).toEqual({ html: '<button>Start learning', css: '' })
  expect(previewDoc(task('shape-5'), solution(task('shape-5')))!.css).toContain('border-radius : 12px;')
  expect(previewDoc(task('button-4'), {})).toBeNull()
})

test('streak counts back from today or yesterday', () => {
  const now = new Date(2026, 10, 11)
  expect(streak({}, now)).toBe(0)
  expect(streak({ '2026-11-11': 1, '2026-11-10': 2, '2026-11-08': 1 }, now)).toBe(2)
  expect(streak({ '2026-11-10': 1, '2026-11-09': 1 }, now)).toBe(2)
  expect(streak({ '2026-11-09': 1 }, now)).toBe(0)
})

test('stored progress is validated, and lessons unlock in order', () => {
  expect(parse('not json').done).toEqual([])
  const p = parse(JSON.stringify({ lang: 'ar', goal: 9, xp: -4, done: ['button', 'button', 'nope'], daily: { bad: 1, '2026-11-11': 2 } }))
  expect(p).toMatchObject({ lang: 'ar', goal: 1, xp: 0, done: ['button'], daily: { '2026-11-11': 2 } })
  // Profile fields: trimmed and capped name, only image data URLs, join date falls back to the first active day.
  expect(p).toMatchObject({ name: '', photo: '', joined: '2026-11-11' })
  const who = parse(JSON.stringify({ name: `  ${'a'.repeat(40)} `, photo: 'javascript:alert(1)', joined: '2026-01-02' }))
  expect(who).toMatchObject({ name: 'a'.repeat(30), photo: '', joined: '2026-01-02' })
  expect(parse(JSON.stringify({ photo: 'data:image/jpeg;base64,AAAA' })).photo).toBe('data:image/jpeg;base64,AAAA')
  // Earned badges: only well-formed records survive.
  const good = { at: '2026-11-12', no: 1, serial: 'BTA-8F3A-C21B' }
  const stored = parse(JSON.stringify({ badges: { button: good, text: { ...good, no: 0 }, links: { ...good, serial: 'x' }, color: null } }))
  expect(stored.badges).toEqual({ button: good })
  expect(newSerial()).toMatch(/^WDL-[0-9A-F]{4}-[0-9A-F]{4}$/)

  expect(unlocked(p, 'button')).toBe(true)
  expect(unlocked(p, 'text')).toBe(true)
  expect(unlocked(p, 'links')).toBe(false)
  expect(unlocked(p, 'color')).toBe(false)
  expect(unlocked({ ...p, experience: 'built' }, 'color')).toBe(true)

  expect(reward(p, 'text', true)).toBe(25)
  expect(reward(p, 'button', true)).toBe(5)
  expect(reward(p, undefined, false)).toBe(5)
})
