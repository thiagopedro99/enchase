import { launch } from './h.mjs'

const html = `<!doctype html><html><head><style>html,body{margin:0;height:100%;overflow:hidden}
#flt{position:fixed;left:0;top:0;width:120px;height:40px;background:#f90}</style></head><body><div id="flt"></div></body></html>`
const bundle = process.argv[2] ?? './bundle.js'
const { browser, page } = await launch({ html, bundle })
const r = await page.evaluate(async () => {
  const flt = document.getElementById('flt')
  let point = { x: 100, y: 100 }
  const virtual = { getBoundingClientRect: () => DOMRect.fromRect({ ...point, width: 0, height: 0 }) }
  let calls = 0
  const stop = window.hand.autoUpdate(virtual, flt, () => {
    calls++
    const p = window.hand.computePosition(virtual, flt, { placement: 'bottom-start' })
    Object.assign(flt.style, { left: `${p.x}px`, top: `${p.y}px` })
  }, true)
  const lag = []
  for (let i = 0; i < 20; i++) {
    point = { x: 100 + i * 10, y: 100 }
    await new Promise((r) => requestAnimationFrame(r))
    lag.push(Math.round(flt.getBoundingClientRect().left - point.x))
  }
  stop()
  Object.assign(flt.style, { width: '1000px', height: '50px', left: '0px', top: '0px' })
  const ref = { getBoundingClientRect: () => DOMRect.fromRect({ x: 600, y: 100, width: 40, height: 20 }) }
  const h = window.hand.computePosition(ref, flt, { placement: 'bottom', padding: 8 })
  const e = await window.fui.computePosition(ref, flt, { strategy: 'fixed', placement: 'bottom', middleware: [window.fui.flip({ padding: 8 }), window.fui.shift({ padding: 8 }), window.fui.size({ padding: 8, apply: () => {} })] })
  return { virtualEveryFrame: { calls, floatingLeftMinusPointerX: lag }, oversized1000pxIn800: { hand: { x: h.x, right: h.x + 1000, availableWidth: h.availableWidth }, fui: { x: e.x } } }
})
console.log(bundle, JSON.stringify(r))
await browser.close()
