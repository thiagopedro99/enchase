import { launch } from './h.mjs'

const html = `<!doctype html><html><head><style>html,body{margin:0}
#ref{position:absolute;left:600px;top:400px;width:60px;height:30px;background:#09f}
#flt{position:fixed;left:0;top:0;width:200px;height:120px;background:#f90}</style></head><body><div style="height:2000px"></div><div id="ref"></div><div id="flt"></div></body></html>`
const bundle = process.argv[2] ?? './bundle.js'
const { browser, page, context } = await launch({ html, bundle })
const cdp = await context.newCDPSession(page)
await cdp.send('Input.synthesizePinchGesture', { x: 400, y: 300, scaleFactor: 2, relativeSpeed: 800 })
await page.waitForTimeout(300)
await page.evaluate(() => {
  window.calls = 0
  const ref = document.getElementById('ref')
  const flt = document.getElementById('flt')
  window.stop = window.hand.autoUpdate(ref, flt, () => {
    window.calls++
    const p = window.hand.computePosition(ref, flt, { placement: 'bottom' })
    Object.assign(flt.style, { left: `${p.x}px`, top: `${p.y}px` })
  })
})
await page.waitForTimeout(200)
const before = await page.evaluate(() => ({ calls: window.calls, offsetLeft: visualViewport.offsetLeft, offsetTop: visualViewport.offsetTop, scrollY }))
await page.mouse.move(300, 200); await page.mouse.wheel(150, 100)
await page.waitForTimeout(300)
const after = await page.evaluate(() => {
  const f = document.getElementById('flt').getBoundingClientRect()
  const vv = visualViewport
  return { calls: window.calls, offsetLeft: vv.offsetLeft, offsetTop: vv.offsetTop, scrollY, floating: [f.left, f.top, f.right, f.bottom], visible: [vv.offsetLeft, vv.offsetTop, vv.offsetLeft + vv.width, vv.offsetTop + vv.height] }
})
console.log(JSON.stringify({ before, after }))
await browser.close()
