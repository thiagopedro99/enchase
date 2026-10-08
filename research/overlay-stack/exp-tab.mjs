import { launch, openPage, state, active } from './lib.mjs'
const browser = await launch()
const pop = async (p) => (await state(p)).popover
for (const [label, prefix, q] of [['native', '', 'esc=doc'], ['preserve', 'stack/', 'esc=stack&tab=preserve']]) {
  {
    const p = await openPage(browser, 'scene=page&' + q, prefix)
    await p.focus('#pop-trigger'); await p.keyboard.press('Enter')
    const seq = []
    for (let i = 0; i < 3; i++) { await p.keyboard.press('Tab'); seq.push((await active(p)) + (await pop(p) ? '' : '(closed)')) }
    console.log(label.padEnd(9), 'T1 page: Enter on trigger, Tab x3:', JSON.stringify(seq))
    await p.context().close()
  }
  {
    const p = await openPage(browser, 'scene=page&focus=1&' + q, prefix)
    await p.focus('#pop-trigger'); await p.keyboard.press('Enter')
    const a = await active(p)
    await p.keyboard.press('Shift+Tab')
    console.log(label.padEnd(9), 'T2 page: focus moved to', a, '; Shift+Tab ->', await active(p), 'open', await pop(p))
    await p.context().close()
  }
  {
    const p = await openPage(browser, 'scene=page&' + q, prefix)
    await p.click('#pop-trigger'); await p.focus('#page-after')
    await p.keyboard.press('Shift+Tab')
    console.log(label.padEnd(9), 'T3 page: open, focus #page-after, Shift+Tab ->', await active(p))
    await p.context().close()
  }
  {
    const p = await openPage(browser, 'scene=modal&' + q, prefix)
    await p.click('#open-modal'); await p.focus('#pop-trigger'); await p.keyboard.press('Enter')
    const seq = []
    for (let i = 0; i < 4; i++) { await p.keyboard.press('Tab'); seq.push((await active(p)) + (await pop(p) ? '' : '(closed)')) }
    console.log(label.padEnd(9), 'T4 modal: Enter on trigger, Tab x4:', JSON.stringify(seq))
    await p.context().close()
  }
  {
    const p = await openPage(browser, 'scene=modal&' + q, prefix)
    await p.click('#open-modal'); await p.click('#pop-trigger'); await p.focus('#m-last')
    await p.keyboard.press('Shift+Tab')
    console.log(label.padEnd(9), 'T5 modal: open, focus #m-last, Shift+Tab ->', await active(p))
    await p.context().close()
  }
}
await browser.close()
