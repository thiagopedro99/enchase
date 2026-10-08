import { launch, openPage, state } from './lib.mjs'
const browser = await launch()
console.log('chromium', browser.version())
for (const esc of ['doc', 'docstop', 'capture', 'react', 'reactstop']) {
  for (const where of ['popover', 'trigger']) {
    const page = await openPage(browser, 'scene=modal&esc=' + esc)
    await page.click('#open-modal')
    await page.click('#pop-trigger')
    if (where === 'popover') await page.click('#p1')
    const before = await state(page)
    await page.keyboard.press('Escape')
    const after = await state(page)
    console.log(JSON.stringify({ esc, focusBeforeEsc: before.active, popoverBefore: before.popover, dialogsAfter: after.dialogs, popoverAfter: after.popover, activeAfter: after.active, log: after.log }))
    await page.context().close()
  }
}
await browser.close()
