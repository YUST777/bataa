// Renders mockup.html into out/: node render.mjs (needs `npx serve`-free file:// access only).
import { chromium } from '/home/yousefmsm1/.local/share/npm-global/lib/node_modules/rive-mcp-server/node_modules/playwright-core/index.mjs'
const sets = { 'waddle-learn': 'learn,lesson-learn,lesson-correct', 'waddle-ai-pond': 'chat-empty,pond,profile', 'waddle-start': 'onboarding,paywall,badge' }
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--allow-file-access-from-files'] })
const pg = await b.newPage({ viewport: { width: 2000, height: 1520 }, deviceScaleFactor: 2 })
for (const [name, s] of Object.entries(sets)) {
  await pg.goto(`file://${process.cwd()}/mockup.html?s=${s}`)
  await pg.waitForLoadState('networkidle')
  await pg.screenshot({ path: `out/${name}.png` })
  console.log('ok', name)
}
await b.close()
