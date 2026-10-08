import { launch } from './h.mjs'

const html = `<!doctype html><html><head><style>
html,body{margin:0;height:100%;overflow:hidden}
#ref{position:fixed;left:100px;top:100px;width:80px;height:30px;background:#09f}
#ref.anim{animation:move 2s linear infinite alternate}
@keyframes move{from{transform:translateX(0)}to{transform:translateX(400px)}}
#flt{position:fixed;left:0;top:0;width:120px;height:40px;background:#f90}
</style></head><body><div id="ref"></div><div id="flt"></div></body></html>`
const bundle = process.argv[2] ?? './bundle.js'
const { browser, page } = await launch({ html, bundle })
console.log('chromium', browser.version(), 'bundle', bundle)
for (const lib of ['hand', 'fui']) {
  const r = await page.evaluate(async (lib) => {
    const ref = document.getElementById('ref')
    const flt = document.getElementById('flt')
    ref.classList.remove('anim')
    flt.style.left = '0px'
    flt.style.top = '0px'
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    let calls = 0
    const apply = async () => {
      calls++
      const p = lib === 'hand' ? window.hand.computePosition(ref, flt, { placement: 'bottom', offset: 4 }) : await window.fui.computePosition(ref, flt, { strategy: 'fixed', placement: 'bottom', middleware: [window.fui.offset(4)] })
      flt.style.left = `${p.x}px`
      flt.style.top = `${p.y}px`
    }
    const stop = lib === 'hand' ? window.hand.autoUpdate(ref, flt, apply, true) : window.fui.autoUpdate(ref, flt, apply, { animationFrame: true })
    ref.classList.add('anim')
    const samples = []
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => requestAnimationFrame(r))
      const a = ref.getBoundingClientRect()
      const b = flt.getBoundingClientRect()
      samples.push(Math.round((b.left + b.width / 2) - (a.left + a.width / 2)))
    }
    stop()
    ref.classList.remove('anim')
    return { calls, refMovedTo: Math.round(ref.getBoundingClientRect().left), centerDeltaFirst5: samples.slice(0, 5), centerDeltaLast5: samples.slice(-5), maxAbsDelta: Math.max(...samples.map(Math.abs)) }
  }, lib)
  console.log(lib, JSON.stringify(r))
}
await browser.close()
