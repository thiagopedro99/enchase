import { launch } from './h.mjs'

const bundle = process.argv[2] ?? './bundle.js'
const out = {}
for (const css of ['', 'transform:translateZ(0)', 'filter:blur(0)', 'container-type:inline-size', 'will-change:transform', 'contain:layout']) {
  const html = `<!doctype html><html><head><style>html{margin:0}body{margin:20px;${css}}
  #ref{position:absolute;left:100px;top:600px;width:60px;height:30px;background:#09f}
  #flt{position:fixed;left:0;top:0;width:120px;height:40px;background:#f90}</style></head><body><div style="height:3000px"></div><div id="ref"></div><div id="flt"></div></body></html>`
  const { browser, page } = await launch({ html, bundle })
  out[css || 'none'] = await page.evaluate(async () => {
    scrollTo(0, 400)
    const ref = document.getElementById('ref')
    const flt = document.getElementById('flt')
    const h = window.hand.computePosition(ref, flt, { placement: 'bottom', offset: 4 })
    Object.assign(flt.style, { left: `${h.x}px`, top: `${h.y}px` })
    const a = ref.getBoundingClientRect()
    const b = flt.getBoundingClientRect()
    const handRendered = { dx: b.left - (a.left + a.width / 2 - 60), dy: b.top - (a.bottom + 4) }
    const e = await window.fui.computePosition(ref, flt, { strategy: 'fixed', placement: 'bottom', middleware: [window.fui.offset(4)] })
    Object.assign(flt.style, { left: `${e.x}px`, top: `${e.y}px` })
    const c = flt.getBoundingClientRect()
    return { handRenderedError: handRendered, fuiRenderedError: { dx: c.left - (a.left + a.width / 2 - 60), dy: c.top - (a.bottom + 4) } }
  })
  await browser.close()
}
console.log(JSON.stringify(out))
