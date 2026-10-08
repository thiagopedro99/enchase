import { launch } from './h.mjs'

const html = `<!doctype html><html><head><style>
html,body{margin:0;height:100%;overflow:hidden}
#ref{position:fixed;left:100px;top:100px;width:80px;height:30px;background:#09f}
#flt{position:fixed;left:0;top:0;width:120px;height:40px;background:#f90}
</style></head><body><div id="ref"></div><div id="flt"></div></body></html>`
const bundle = process.argv[2] ?? './bundle.js'
const { browser, page } = await launch({ html, bundle })
for (const lib of ['hand', 'fui']) {
  const r = await page.evaluate(async (lib) => {
    const ref = document.getElementById('ref')
    const flt = document.getElementById('flt')
    ref.style.height = '30px'
    const raf = () => new Promise((r) => requestAnimationFrame(r))
    const apply = async () => {
      const p = lib === 'hand' ? window.hand.computePosition(ref, flt, { placement: 'bottom', offset: 4 }) : await window.fui.computePosition(ref, flt, { strategy: 'fixed', placement: 'bottom', middleware: [window.fui.offset(4)] })
      flt.style.left = `${p.x}px`
      flt.style.top = `${p.y}px`
    }
    const stop = lib === 'hand' ? window.hand.autoUpdate(ref, flt, apply) : window.fui.autoUpdate(ref, flt, apply)
    await raf(); await raf(); await raf()
    const gap = () => flt.getBoundingClientRect().top - ref.getBoundingClientRect().bottom
    const before = gap()
    const probe = await new Promise((resolve) => requestAnimationFrame(() => {
      ref.style.height = '60px'
      requestAnimationFrame(() => resolve(gap()))
    }))
    await raf()
    const settled = gap()
    stop()
    return { before, gapAtStartOfNextFrame_whatWasPainted: probe, settled }
  }, lib)
  console.log(lib, JSON.stringify(r))
}
await browser.close()
