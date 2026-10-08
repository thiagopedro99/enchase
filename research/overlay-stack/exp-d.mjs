import { launch, openPage } from './lib.mjs'
const browser = await launch()
const ax = async (page) => {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Accessibility.enable')
  const { nodes } = await cdp.send('Accessibility.getFullAXTree')
  const pick = (name) => nodes.filter((n) => n.name?.value === name && n.role?.value !== 'StaticText' && n.role?.value !== 'InlineTextBox').map((n) => ({ name, role: n.role?.value, ignored: n.ignored, reasons: (n.ignoredReasons ?? []).filter((r) => r.value?.value !== false && r.value?.type !== 'boolean' || r.value?.value === true).map((r) => r.name) }))
  return ['Page before', 'Open modal', 'Name', 'Options', 'Modal last', 'P1', 'P2'].flatMap(pick)
}
const flags = (page) => page.evaluate(() => [...document.body.children].map((c) => (c.id ? '#' + c.id : c.tagName.toLowerCase()) + (c.hasAttribute('data-popover') ? '[data-popover]' : '') + (c.hasAttribute('inert') ? '{inert}' : '') + (c.getAttribute('aria-hidden') ? '{aria-hidden}' : '')))
for (const step of ['modal-only', 'modal+popover', 'modal+popover+focus-in-popover']) {
  const page = await openPage(browser, 'scene=modal&esc=doc')
  await page.click('#open-modal')
  if (step !== 'modal-only') await page.click('#pop-trigger')
  if (step === 'modal+popover+focus-in-popover') await page.click('#p1')
  console.log('==', step, 'body children:', JSON.stringify(await flags(page)))
  for (const n of await ax(page)) console.log('  ', JSON.stringify(n))
  const pw = await page.evaluate(() => ({ p1Inert: !!document.getElementById('p1')?.closest('[inert]'), p1Matches: document.getElementById('p1')?.matches(':focus') }))
  console.log('  dom:', JSON.stringify(pw))
  if (step !== 'modal-only') {
    console.log('  playwright getByRole P1 count:', await page.getByRole('button', { name: 'P1' }).count())
    console.log('  ariaSnapshot(body):\n' + (await page.locator('body').ariaSnapshot()).split('\n').map((l) => '     ' + l).join('\n'))
  }
  await page.context().close()
}
await browser.close()
