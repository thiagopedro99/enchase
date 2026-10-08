import { launch, openPage, state, tabs, active } from './lib.mjs'
const browser = await launch()
const order = (page) => page.evaluate(() => [...document.body.children].map((c) => c.id ? '#' + c.id : c.tagName.toLowerCase() + (c.hasAttribute('data-popover') ? '[data-popover]' : '') + (c.hasAttribute('inert') ? '{inert}' : '')))
{
  const page = await openPage(browser, 'scene=modal&esc=doc')
  await page.click('#open-modal')
  console.log('B0 focus after modal open:', await active(page))
  await page.click('#pop-trigger')
  console.log('B0 body children:', JSON.stringify(await order(page)))
  console.log('B1 focus=0, from trigger Tab x6:', JSON.stringify(await tabs(page, 6)))
  await page.focus('#pop-trigger')
  console.log('B1 from trigger Shift+Tab x6:', JSON.stringify(await tabs(page, 6, 'Shift+Tab')))
  const s = await state(page)
  console.log('B1 popover still open:', s.popover, 'dialogs', s.dialogs)
  await page.context().close()
}
{
  const page = await openPage(browser, 'scene=modal&esc=doc&focus=1')
  await page.click('#open-modal')
  await page.focus('#pop-trigger')
  await page.keyboard.press('Enter')
  console.log('B2 focus=1 after Enter on trigger:', await active(page))
  console.log('B2 Tab x6 from #p1:', JSON.stringify(await tabs(page, 6)))
  const s = await state(page)
  console.log('B2 popover open:', s.popover, 'dialogs', s.dialogs)
  await page.context().close()
}
{
  const page = await openPage(browser, 'scene=modal&esc=doc&focus=1')
  await page.click('#open-modal')
  await page.focus('#pop-trigger')
  await page.keyboard.press('Enter')
  console.log('B3 Shift+Tab x4 from #p1:', JSON.stringify(await tabs(page, 4, 'Shift+Tab')))
  await page.context().close()
}
{
  const page = await openPage(browser, 'scene=modal&esc=doc')
  await page.click('#open-modal')
  await page.click('#pop-trigger')
  await page.click('#p2')
  console.log('B4 mouse click on #p2 -> active:', await active(page))
  const r = await tabs(page, 3)
  console.log('B4 Tab x3 from #p2 (mouse-focused):', JSON.stringify(r))
  const trapListenerFires = await page.evaluate(() => {
    const dlg = document.querySelector('[role=dialog]')
    let hit = false
    const h = () => { hit = true }
    dlg.addEventListener('keydown', h)
    document.getElementById('p1')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    dlg.removeEventListener('keydown', h)
    return { hit, p1InDialog: dlg.contains(document.getElementById('p1')) }
  })
  console.log('B4 keydown from popover reaches dialog container listener:', JSON.stringify(trapListenerFires))
  await page.context().close()
}
await browser.close()
