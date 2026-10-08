import { launch, openPage, state, tabs } from './lib.mjs'
const browser = await launch()
const page = await openPage(browser, 'scene=modal&esc=doc')
await page.click('#open-modal')
await page.click('#pop-trigger')
const b = await page.evaluate(() => { const r = document.getElementById('p-far').getBoundingClientRect(); return [r.right - 5, (r.top + r.bottom) / 2] })
await page.mouse.click(b[0], b[1])
console.log('C1b after clicking non-focusable popover area: active', (await state(page)).active, '; Tab x3 ->', JSON.stringify(await tabs(page, 3)))
await browser.close()
