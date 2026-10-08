import { launch, openPage, state, tabs, active } from './lib.mjs'
const browser = await launch()
{
  const page = await openPage(browser, 'scene=page&esc=doc')
  await page.focus('#pop-trigger')
  await page.keyboard.press('Enter')
  const s0 = await state(page)
  console.log('E1 focus=0 open via Enter; active', s0.active, 'popover', s0.popover)
  console.log('E1 Tab x5 from trigger:', JSON.stringify(await tabs(page, 5)), 'popover open after:', (await state(page)).popover)
  await page.context().close()
}
{
  const page = await openPage(browser, 'scene=page&esc=doc&focus=1')
  await page.focus('#pop-trigger')
  await page.keyboard.press('Enter')
  console.log('E2 focus=1 open via Enter; active', await active(page))
  const seq = []
  for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); seq.push(await active(page) + (await page.evaluate(() => document.hasFocus() ? '' : '(doc lost focus)'))) }
  console.log('E2 Tab x5 from #p1:', JSON.stringify(seq), 'popover open after:', (await state(page)).popover)
  await page.context().close()
}
{
  const page = await openPage(browser, 'scene=page&esc=doc&focus=1')
  await page.focus('#pop-trigger')
  await page.keyboard.press('Enter')
  console.log('E3 Shift+Tab x3 from #p1:', JSON.stringify(await tabs(page, 3, 'Shift+Tab')), 'popover open after:', (await state(page)).popover)
  await page.context().close()
}
{
  const page = await openPage(browser, 'scene=page&esc=doc')
  await page.click('#pop-trigger')
  await page.click('#p2')
  console.log('E4 mouse on #p2 then Tab x2:', JSON.stringify(await tabs(page, 2)))
  const order = await page.evaluate(() => [...document.body.children].map((c) => c.id || c.tagName.toLowerCase()))
  console.log('E4 body children order:', JSON.stringify(order))
  await page.context().close()
}
await browser.close()
