import { launch, openPage, state, active } from './lib.mjs'
const browser = await launch()
const layers = (page) => page.evaluate(() => window.__layers())
const variants = process.env.ONLY === 'stack' ? [['stack', 'stack/', 'stack']] : [['baseline(doc)', '', 'doc'], ['baseline(capture)', '', 'capture'], ['stack', 'stack/', 'stack']]
const run = async (title, scene, fn) => {
  for (const [name, prefix, esc] of variants) {
    const page = await openPage(browser, `scene=${scene}&esc=${esc}`, prefix)
    const r = await fn(page)
    console.log(title.padEnd(44), name.padEnd(18), JSON.stringify(r))
    await page.context().close()
  }
}
const short = async (page) => { const s = await state(page); return { dialogs: s.dialogs, popover: s.popover, active: s.active, log: s.log.map((l) => l.replace('popover:close:', 'pc:')) } }
await run('S1 Esc, focus in popover (in modal)', 'modal', async (p) => { await p.click('#open-modal'); await p.click('#pop-trigger'); await p.click('#p1'); await p.keyboard.press('Escape'); return short(p) })
await run('S2 Esc, focus on trigger (in modal)', 'modal', async (p) => { await p.click('#open-modal'); await p.click('#pop-trigger'); await p.keyboard.press('Escape'); return short(p) })
await run('S3 Esc twice (in modal)', 'modal', async (p) => { await p.click('#open-modal'); await p.click('#pop-trigger'); await p.click('#p1'); await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); return { ...(await short(p)), layers: await layers(p) } })
await run('S4 click backdrop once, then again', 'modal', async (p) => { await p.click('#open-modal'); await p.click('#pop-trigger'); await p.mouse.click(20, 20); const first = await short(p); await p.mouse.click(20, 20); return { first: { d: first.dialogs, p: first.popover }, second: await short(p) } })
await run('S5 click modal body text', 'modal', async (p) => { await p.click('#open-modal'); await p.click('#pop-trigger'); await p.click('#m-text'); return short(p) })
await run('S6 click popover area over backdrop', 'modal', async (p) => { await p.click('#open-modal'); await p.click('#pop-trigger'); const b = await p.evaluate(() => { const r = document.getElementById('p-far').getBoundingClientRect(); return [r.right - 5, (r.top + r.bottom) / 2] }); await p.mouse.click(b[0], b[1]); return short(p) })
await run('S7 nested modals, inline onClose, 1 Esc', 'nested', async (p) => { await p.click('#open-modal'); await p.click('#open-b'); await p.keyboard.press('Escape'); return short(p) })
await run('S8 nested modals, stable onClose, 1 Esc', 'nestedstable', async (p) => { await p.click('#open-modal'); await p.click('#open-b'); await p.keyboard.press('Escape'); return short(p) })
await run('S9 Tooltip in modal, 1 Esc', 'tooltip', async (p) => { await p.click('#open-modal'); await p.focus('#tt-trigger'); await p.waitForTimeout(30); await p.keyboard.press('Escape'); await p.waitForTimeout(30); const tip = await p.evaluate(() => [...document.querySelectorAll('span[aria-hidden=true]')].some((s) => s.textContent === 'Tip text')); return { ...(await short(p)), tip } })
await run('S10 nested popovers: click B1', 'nestedpop', async (p) => { await p.click('#pa'); await p.click('#pb'); await p.click('#b1'); return { a: await p.locator('#pa-content').count(), b: await p.locator('#pb-content').count(), log: (await short(p)).log } })
await run('S10b nested popovers: click outside both', 'nestedpop', async (p) => { await p.click('#pa'); await p.click('#pb'); await p.click('#page-before'); return { a: await p.locator('#pa-content').count(), b: await p.locator('#pb-content').count(), log: (await short(p)).log } })
await run('S10c nested popovers: click A1 (in A only)', 'nestedpop', async (p) => { await p.click('#pa'); await p.click('#pb'); await p.click('#a1'); return { a: await p.locator('#pa-content').count(), b: await p.locator('#pb-content').count(), log: (await short(p)).log } })
await run('S11 nested popovers: Esc with focus on B1', 'nestedpop', async (p) => { await p.click('#pa'); await p.click('#pb'); await p.click('#b1'); await p.keyboard.press('Escape'); return { a: await p.locator('#pa-content').count(), b: await p.locator('#pb-content').count(), active: await active(p), log: (await short(p)).log } })
await run('S12 popover->modal: click OK in modal', 'popmodal', async (p) => { await p.click('#pop-trigger'); await p.click('#p-open-modal'); await p.click('#m-ok'); return short(p) })
await run('S13 popover->modal: 1 Esc', 'popmodal', async (p) => { await p.click('#pop-trigger'); await p.click('#p-open-modal'); await p.keyboard.press('Escape'); const s = await short(p); const inert = await p.evaluate(() => !!document.querySelector('[data-popover]')?.closest('[inert]')); return { ...s, popoverInert: inert } })
await run('S14 layer count after open/close cycle', 'modal', async (p) => { await p.click('#open-modal'); await p.click('#pop-trigger'); const open = await p.evaluate(() => window.__layers()); await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); return { whileOpen: open, after: await p.evaluate(() => window.__layers()) } })
await browser.close()
