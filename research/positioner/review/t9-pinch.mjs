import { launch } from './h.mjs'

const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>html,body{margin:0}
#ref{position:absolute;width:60px;height:30px;background:#09f}
#flt{position:fixed;left:0;top:0;width:200px;height:120px;background:#f90}</style></head><body><div style="height:2000px;width:100%"></div><div id="ref"></div><div id="flt"></div></body></html>`
const bundle = process.argv[2] ?? './bundle.js'
const { browser, page, context } = await launch({ html, bundle })
const cdp = await context.newCDPSession(page)
const state = () => page.evaluate(() => ({ scale: visualViewport.scale, offsetLeft: visualViewport.offsetLeft, offsetTop: visualViewport.offsetTop, width: visualViewport.width, height: visualViewport.height, scrollX, scrollY }))
console.log('before', JSON.stringify(await state()))
await cdp.send('Input.synthesizePinchGesture', { x: 700, y: 500, scaleFactor: 2, relativeSpeed: 800 }).catch((e) => console.log('pinch err', e.message))
await page.waitForTimeout(500)
let vv = await state()
console.log('after pinch', JSON.stringify(vv))
if (vv.scale === 1) {
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await page.waitForTimeout(300)
  vv = await state()
  console.log('after setPageScaleFactor', JSON.stringify(vv))
}
const r = await page.evaluate(async () => {
  const ref = document.getElementById('ref')
  const flt = document.getElementById('flt')
  const vv = visualViewport
  const out = {}
  for (const [name, placement, lx, ly] of [['nearVisualRightEdge', 'bottom', vv.offsetLeft + vv.width - 70, vv.offsetTop + 20], ['nearVisualBottomEdge', 'bottom', vv.offsetLeft + 50, vv.offsetTop + vv.height - 40], ['nearVisualTopLeft', 'top', vv.offsetLeft + 5, vv.offsetTop + 5]]) {
    Object.assign(ref.style, { left: `${lx + scrollX}px`, top: `${ly + scrollY}px` })
    const e = await window.fui.computePosition(ref, flt, { strategy: 'fixed', placement, middleware: [window.fui.flip(), window.fui.shift(), window.fui.hide()] })
    const h = window.hand.computePosition(ref, flt, { placement })
    Object.assign(flt.style, { left: `${h.x}px`, top: `${h.y}px` })
    const f = flt.getBoundingClientRect()
    const inside = f.left >= vv.offsetLeft - 0.01 && f.right <= vv.offsetLeft + vv.width + 0.01 && f.top >= vv.offsetTop - 0.01 && f.bottom <= vv.offsetTop + vv.height + 0.01
    out[name] = { fui: [e.x, e.y, e.placement, !!e.middlewareData.hide.referenceHidden], hand: [h.x, h.y, h.placement, h.referenceHidden], handRenderedInsideVisualViewport: inside }
  }
  return out
})
console.log(JSON.stringify(r, null, 1))
await browser.close()
