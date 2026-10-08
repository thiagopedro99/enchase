import { launch } from './h.mjs'

const html = `<!doctype html><html><head><style>
html,body{margin:0;height:100%;overflow:hidden}
#ref{position:fixed;left:300px;top:400px;width:80px;height:30px;background:#09f}
#flt{position:fixed;left:0;top:0;width:160px;overflow:auto;background:#f90}
#flt>div{height:500px}
</style></head><body><div id="ref"></div><div id="flt"><div></div></div></body></html>`
const bundle = process.argv[2] ?? './bundle.js'
const { browser, page } = await launch({ html, bundle })
const r = await page.evaluate(async () => {
  const ref = document.getElementById('ref')
  const flt = document.getElementById('flt')
  const raf = () => new Promise((r) => requestAnimationFrame(r))
  const gap = () => Math.round(ref.getBoundingClientRect().top - flt.getBoundingClientRect().bottom)
  const out = {}
  flt.style.maxHeight = ''
  const e = await window.fui.computePosition(ref, flt, { strategy: 'fixed', placement: 'top', middleware: [window.fui.offset(8), window.fui.flip(), window.fui.shift(), window.fui.size({ apply: ({ availableHeight }) => { flt.style.maxHeight = `${availableHeight}px` } })] })
  Object.assign(flt.style, { left: `${e.x}px`, top: `${e.y}px` })
  out.fui = { placement: e.placement, y: e.y, maxHeight: flt.style.maxHeight, gapToRef: gap(), floatingTop: flt.getBoundingClientRect().top }
  flt.style.maxHeight = ''
  const h = window.hand.computePosition(ref, flt, { placement: 'top', offset: 8 })
  Object.assign(flt.style, { left: `${h.x}px`, top: `${h.y}px`, maxHeight: `${h.availableHeight}px` })
  out.handSinglePass = { placement: h.placement, y: h.y, maxHeight: flt.style.maxHeight, gapToRef: gap(), floatingTop: flt.getBoundingClientRect().top }
  const h2 = window.hand.computePosition(ref, flt, { placement: 'top', offset: 8 })
  out.handSecondPass = { placement: h2.placement, y: h2.y, availableHeight: h2.availableHeight }
  flt.style.maxHeight = ''
  Object.assign(flt.style, { left: '0px', top: '0px' })
  await raf(); await raf()
  const painted = []
  const stop = await new Promise((resolve) => requestAnimationFrame(() => {
    const s = window.hand.autoUpdate(ref, flt, () => {
      const p = window.hand.computePosition(ref, flt, { placement: 'top', offset: 8 })
      Object.assign(flt.style, { left: `${p.x}px`, top: `${p.y}px`, maxHeight: `${p.availableHeight}px` })
    })
    const probe = (n) => requestAnimationFrame(() => { painted.push(gap()); if (n > 1) probe(n - 1); else resolve(s) })
    probe(4)
  }))
  stop()
  out.handAutoUpdate_gapPaintedPerFrame = painted
  return out
})
console.log(JSON.stringify(r, null, 1))
await browser.close()
