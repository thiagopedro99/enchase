import { launch } from './h.mjs'

const bundle = process.argv[2] ?? './bundle.js'
const tall = '<div style="height:3000px"></div>'
const scenarios = {
  classicScrollbar: { head: '', body: tall },
  enchaseGutterShortPage: { head: 'html{scrollbar-gutter:stable}', body: '' },
  enchaseGutterModalLock: { head: 'html{scrollbar-gutter:stable}body{overflow:hidden}', body: tall },
  rtlClassicScrollbar: { head: '', body: tall, dir: 'rtl' }
}
const out = {}
for (const [name, s] of Object.entries(scenarios)) {
  const html = `<!doctype html><html dir="${s.dir ?? 'ltr'}"><head><style>html,body{margin:0}${s.head}
  #ref{position:fixed;top:100px;width:60px;height:30px;background:#09f}
  #flt{position:fixed;left:0;top:0;width:200px;height:40px;background:#f90}</style></head><body>${s.body}<div id="ref"></div><div id="flt"></div></body></html>`
  const { browser, page } = await launch({ html, bundle, scrollbars: true })
  const info = await page.evaluate(async (dir) => {
    const ref = document.getElementById('ref')
    const flt = document.getElementById('flt')
    const edge = dir === 'rtl' ? 'left' : 'right'
    ref.style[edge] = '0px'
    const placement = 'bottom'
    const e = await window.fui.computePosition(ref, flt, { strategy: 'fixed', placement, middleware: [window.fui.shift()] })
    const h = window.hand.computePosition(ref, flt, { placement })
    const r = ref.getBoundingClientRect()
    return { innerWidth, htmlClientWidth: document.documentElement.clientWidth, bodyClientWidth: document.body.clientWidth, visualViewportWidth: visualViewport.width, visualViewportOffsetLeft: visualViewport.offsetLeft, htmlRectLeft: document.documentElement.getBoundingClientRect().left, refLeft: r.left, refRight: r.right, fuiX: e.x, handX: h.x, fuiRight: e.x + 200, handRight: h.x + 200 }
  }, s.dir ?? 'ltr')
  const shot = async (x, y) => (await page.screenshot({ clip: { x, y, width: 1, height: 1 } })).toString('base64')
  await page.evaluate((x) => { const f = document.getElementById('flt'); f.style.left = `${x}px`; f.style.top = '200px' }, info.handX)
  const orange = await shot(Math.floor(info.handX) + 5, 210)
  const probeX = s.dir === 'rtl' ? Math.max(0, Math.floor(info.handX) + 1) : Math.floor(info.handRight) - 3
  info.handFloatingPixelAtProbeIsVisible = (await shot(probeX, 210)) === orange
  info.probeX = probeX
  out[name] = info
  await browser.close()
}
console.log(JSON.stringify(out, null, 1))
