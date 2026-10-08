import { launch } from './h.mjs'

const cases = ['overflow-x:hidden', 'overflow-y:clip', 'overflow-x:clip', 'overflow-y:auto', 'overflow:overlay', 'overflow-inline:hidden', 'overflow-block:scroll', 'overflow:visible', 'contain:paint', 'overflow:hidden;display:inline', 'overflow:hidden;display:contents']
const html = `<!doctype html><html><body>${cases.map((c, i) => `<div id="c${i}" style="${c}"></div>`).join('')}<div id="flt"></div></body></html>`
const { browser, page } = await launch({ html })
const r = await page.evaluate((cases) => cases.map((c, i) => {
  const s = getComputedStyle(document.getElementById(`c${i}`))
  return { css: c, shorthand: s.overflow, x: s.overflowX, y: s.overflowY, regexMatches: /auto|scroll|hidden|clip|overlay/.test(s.overflow), display: s.display }
}), cases)
console.table(r)
await browser.close()
