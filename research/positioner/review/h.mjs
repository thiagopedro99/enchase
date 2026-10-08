import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'

export const launch = async ({ scrollbars = false, bundle = './bundle.js', viewport = { width: 800, height: 600 }, deviceScaleFactor = 1, html = '' } = {}) => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', ignoreDefaultArgs: scrollbars ? ['--hide-scrollbars'] : [] })
  const context = await browser.newContext({ viewport, deviceScaleFactor })
  const page = await context.newPage()
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message))
  await page.setContent(html)
  await page.addScriptTag({ content: readFileSync(new URL(bundle, import.meta.url), 'utf8') })
  return { browser, page, context }
}
