import { chromium } from '/home/yousefmsm1/.local/share/npm-global/lib/node_modules/rive-mcp-server/node_modules/playwright-core/index.mjs'
const D = process.argv[2]
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--allow-file-access-from-files'] })
const pg = await b.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 })
await pg.goto('file://' + D + '/slides.html'); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(500)
for (const [i, id] of ['s1', 's2', 's3', 's4', 's5', 's6'].entries()) await pg.locator('#' + id).screenshot({ path: `${D}/out/bataa-store-${i + 1}.png` })
await b.close()
