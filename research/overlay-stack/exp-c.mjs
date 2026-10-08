import { launch, openPage, state } from './lib.mjs'
const browser = await launch()
const setup = async () => {
  const page = await openPage(browser, 'scene=modal&esc=doc')
  await page.click('#open-modal')
  await page.click('#pop-trigger')
  return page
}
const geo = (page) => page.evaluate(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)] }
  return { dialog: r(document.querySelector('[role=dialog]')), popover: r(document.querySelector('[data-popover]')), far: r(document.getElementById('p-far')) }
})
{
  const page = await setup()
  const g = await geo(page)
  const x = g.far[2] - 5, y = Math.round((g.far[1] + g.far[3]) / 2)
  const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const dlg = document.querySelector('[role=dialog]').getBoundingClientRect(); return { hitId: e.id || e.tagName, insidePopover: !!e.closest('[data-popover]'), pointOutsideDialogBox: x > dlg.right || x < dlg.left || y < dlg.top || y > dlg.bottom } }, [x, y])
  await page.mouse.click(x, y)
  console.log('C1 click popover part lying over backdrop', JSON.stringify({ geo: g, point: [x, y], ...hit }), JSON.stringify(await state(page)))
  await page.context().close()
}
{
  const page = await setup()
  await page.click('#m-text')
  console.log('C2 click modal body text', JSON.stringify(await state(page)))
  await page.context().close()
}
{
  const page = await setup()
  const hit = await page.evaluate(() => document.elementFromPoint(20, 20).className)
  await page.mouse.click(20, 20)
  console.log('C3 click backdrop at (20,20) hit', hit, JSON.stringify(await state(page)))
  await page.context().close()
}
{
  const page = await setup()
  await page.click('#p1')
  console.log('C4 click #p1', JSON.stringify(await state(page)))
  await page.context().close()
}
{
  const page = await setup()
  const r = await page.evaluate(() => {
    const out = []
    document.querySelector('.' + [...document.querySelectorAll('div')].find((d) => getComputedStyle(d).zIndex === '1040')?.className)
    return out
  })
  const z = await page.evaluate(() => ({ backdrop: getComputedStyle([...document.querySelectorAll('div')].find((d) => getComputedStyle(d).zIndex === '1040')).zIndex, dialog: getComputedStyle(document.querySelector('[role=dialog]')).zIndex, popover: getComputedStyle(document.querySelector('[data-popover]')).zIndex }))
  console.log('C5 z-index', JSON.stringify(z))
  await page.context().close()
}
await browser.close()
