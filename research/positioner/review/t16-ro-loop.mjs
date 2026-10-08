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
  const errors = []
  window.addEventListener('error', (e) => errors.push(e.message))
  const ref = document.getElementById('ref')
  const flt = document.getElementById('flt')
  const raf = () => new Promise((r) => requestAnimationFrame(r))
  let calls = 0
  const stop = window.hand.autoUpdate(ref, flt, () => {
    calls++
    const p = window.hand.computePosition(ref, flt, { placement: 'top', offset: 8 })
    Object.assign(flt.style, { left: `${p.x}px`, top: `${p.y}px`, maxHeight: `${p.availableHeight}px` })
  })
  for (let i = 0; i < 5; i++) await raf()
  for (const top of [300, 200, 450, 100]) {
    ref.style.top = `${top}px`
    ref.style.height = `${top / 10}px`
    for (let i = 0; i < 3; i++) await raf()
  }
  stop()
  return { calls, errors }
})
console.log(bundle, JSON.stringify(r))
await browser.close()
