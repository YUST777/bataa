import { chromium } from '/home/yousefmsm1/.local/share/npm-global/lib/node_modules/rive-mcp-server/node_modules/playwright-core/index.mjs'
const OUT = process.argv[2]
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' })
const day = (n) => { const d = new Date('2026-11-13T12:00:00'); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }
const daily = Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 8].map((n) => [day(n), 1]))
const base = (over = {}) => ({ lang: 'en', onboarded: true, experience: 'new', goal: 1, done: ['button', 'text'], xp: 180, daily, sound: false, name: 'Yousef', photo: '', joined: '2026-10-20', badges: {},
  pond: { eggs: 3, coins: 4820, deck: [6, 5, 4, 4, 3, 2, 2, 1, 1, 0, 0, 0], at: 0, full: 0.85, fedAt: Date.parse('2026-11-13T11:30:00'), decor: ['lotus', 'lanterns'], tour: true, bread: 4, bits: 0, market: { day: '', offers: [], sold: [] } }, ...over })
const session = { access_token: 'x', token_type: 'bearer', expires_in: 3600, expires_at: 4102444800, refresh_token: 'x', user: { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'demo@bataa.app', user_metadata: { full_name: 'Yousef' }, app_metadata: {}, created_at: '2026-10-20T00:00:00Z' } }
const chats = [{ id: 'demo', title: 'Make my button orange', at: Date.parse('2026-11-13T11:50:00'), messages: [
  { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Make my button orange and round?' }] },
  { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'Like this:\n\n```html\n<style>\n  button {\n    background: #FF8A1F;\n    color: #fff; border: 0;\n    padding: 12px 24px;\n    border-radius: 999px;\n  }\n</style>\n<button>Start learning</button>\n```\n\nTap **Preview** to see it live. Want to add a hover effect next?' }] },
] }]
async function shot(name, setup, { signedIn = false, p = base(), extra } = {}) {
  if (ONLY && ONLY !== name) return
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 })
  const pg = await ctx.newPage(); pg.setDefaultTimeout(5000)
  await pg.clock.setFixedTime(new Date('2026-11-13T12:00:00'))
  await pg.route(/supabase\.co/, (r) => r.abort())
  await pg.goto('http://localhost:4178/')
  await pg.evaluate(([p, s, chats, signedIn]) => { localStorage.clear(); localStorage.setItem('bataa.mobile.v2', JSON.stringify(p)); localStorage.setItem('bataa.chats', JSON.stringify(chats)); if (signedIn) localStorage.setItem('bataa.auth', JSON.stringify(s)) }, [p, session, chats, signedIn])
  await pg.reload(); await pg.waitForTimeout(2500)
  try { await setup(pg); await pg.screenshot({ path: `${OUT}/${name}.png` }); console.log('ok', name) } catch (e) { console.log('FAIL', name, e.message.split('\n')[0]) }
  await ctx.close()
}
const ONLY = process.argv[3]
const tab = (pg, t) => pg.locator('nav[aria-label="Bataa"]').getByText(t, { exact: true }).click()
await shot('learn', async (pg) => { await pg.waitForTimeout(500) })
await shot('lesson-learn', async (pg) => { await pg.locator('ol li button').nth(2).click(); await pg.waitForTimeout(600); await pg.getByRole('button', { name: /Start/ }).last().click(); await pg.waitForTimeout(2500) })
await shot('lesson-correct', async (pg) => { await pg.locator('ol li button').nth(2).click(); await pg.waitForTimeout(600); await pg.getByRole('button', { name: /Start/ }).last().click(); await pg.waitForTimeout(1500); await pg.getByRole('button', { name: /Got it/ }).click(); await pg.waitForTimeout(800); await pg.locator('main button', { hasText: '<a>' }).first().click(); await pg.waitForTimeout(500); await pg.getByRole('button', { name: /Check/ }).click(); await pg.waitForTimeout(1800) })
await shot('chat', async (pg) => { await tab(pg, 'Practice'); await pg.waitForTimeout(800); await pg.getByRole('button', { name: 'Chats' }).click(); await pg.waitForTimeout(600); await pg.locator('aside li button').first().click(); await pg.waitForTimeout(2000); await pg.getByRole('button', { name: /Preview/ }).first().click().catch(() => {}); await pg.waitForTimeout(1200); await pg.evaluate(() => document.querySelectorAll('.overflow-y-auto').forEach((e) => (e.scrollTop = 0))); await pg.addStyleTag({ content: '[aria-label="Go to the latest message"]{display:none!important}' }); await pg.waitForTimeout(400) }, { signedIn: true })
await shot('chat-empty', async (pg) => { await tab(pg, 'Practice'); await pg.waitForTimeout(2000) }, { signedIn: true })
await shot('pond', async (pg) => { await tab(pg, 'Pond'); await pg.waitForTimeout(4000) })
await shot('profile', async (pg) => { await tab(pg, 'Profile'); await pg.waitForTimeout(2000) }, { p: base({ done: ['button', 'text', 'links', 'color'], xp: 320 }) })
await shot('badge', async (pg) => { await tab(pg, 'Profile'); await pg.waitForTimeout(1200); await pg.mouse.wheel(0, 700); await pg.waitForTimeout(600); await pg.locator('button:has(img[src^="/badges/"])').first().click(); await pg.waitForTimeout(3500) }, { p: base({ done: ['button', 'text', 'links', 'color'], xp: 320 }) })
await shot('paywall', async (pg) => { await tab(pg, 'Profile'); await pg.waitForTimeout(800); await pg.getByRole('button', { name: /Upgrade|See plans/ }).first().click(); await pg.waitForTimeout(800); await pg.getByRole('radio').nth(1).click(); await pg.waitForTimeout(1200) })
await shot('onboarding', async (pg) => { await pg.waitForTimeout(2500) }, { p: base({ onboarded: false }) })
await b.close()
