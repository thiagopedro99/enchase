import { launch, openPage, state, active } from './lib.mjs'
const browser = await launch()
{
  const page = await openPage(browser, 'scene=nested')
  await page.click('#open-modal')
  await page.click('#open-b')
  console.log('F1 nested: dialogs before Esc', (await state(page)).dialogs, 'active', await active(page))
  await page.keyboard.press('Escape')
  console.log('F1 after one Escape', JSON.stringify(await state(page)))
  await page.context().close()
}
{
  const page = await openPage(browser, 'scene=tooltip')
  await page.click('#open-modal')
  await page.focus('#tt-trigger')
  await page.waitForTimeout(50)
  const tipShown = await page.evaluate(() => [...document.querySelectorAll('span[aria-hidden=true]')].some((s) => s.textContent === 'Tip text'))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(50)
  const s = await state(page)
  const tipAfter = await page.evaluate(() => [...document.querySelectorAll('span[aria-hidden=true]')].some((s) => s.textContent === 'Tip text'))
  console.log('G1 Tooltip inside Modal: tip shown before', tipShown, '| after one Escape: dialogs', s.dialogs, 'tip', tipAfter, 'log', JSON.stringify(s.log))
  await page.context().close()
}
{
  const page = await openPage(browser, 'scene=popmodal')
  await page.click('#pop-trigger')
  await page.click('#p-open-modal')
  const s1 = await state(page)
  const inert = await page.evaluate(() => ({ popoverInert: !!document.querySelector('[data-popover]')?.hasAttribute('inert'), children: [...document.body.children].map((c) => (c.id || c.tagName.toLowerCase()) + (c.hasAttribute('inert') ? '{inert}' : '')) }))
  console.log('H1 popover->modal: after opening modal', JSON.stringify({ dialogs: s1.dialogs, popover: s1.popover, active: s1.active, ...inert }))
  await page.click('#m-ok')
  const s2 = await state(page)
  console.log('H1 after clicking OK in modal', JSON.stringify(s2))
  await page.context().close()
}
{
  const page = await openPage(browser, 'scene=popmodal')
  await page.click('#pop-trigger')
  await page.click('#p-open-modal')
  await page.keyboard.press('Escape')
  console.log('H2 popover->modal: one Escape', JSON.stringify(await state(page)))
  await page.context().close()
}
await browser.close()
