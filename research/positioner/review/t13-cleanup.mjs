import { launch } from './h.mjs'

const html = `<!doctype html><html><head><style>html,body{margin:0;height:100%;overflow:hidden}
#ref{position:fixed;left:100px;top:100px;width:80px;height:30px;background:#09f}
#flt{position:fixed;left:0;top:0;width:120px;height:80px;overflow:auto;background:#f90}
#flt>div{height:400px}
#other{position:fixed;left:400px;top:300px;width:100px;height:100px;overflow:auto}#other>div{height:500px}</style></head>
<body><div id="ref"></div><div id="flt"><div></div></div><div id="other"><div></div></div></body></html>`
const bundle = process.argv[2] ?? './bundle.js'
const { browser, page, context } = await launch({ html, bundle })
const cdp = await context.newCDPSession(page)
const listenerCount = async () => {
  const counts = {}
  for (const expr of ['window', 'visualViewport']) {
    const { result } = await cdp.send('Runtime.evaluate', { expression: expr })
    const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId })
    counts[expr] = listeners.filter((l) => l.type === 'scroll' || l.type === 'resize').length
  }
  return counts
}
const raf = (n) => page.evaluate((n) => new Promise((r) => { const f = (k) => (k ? requestAnimationFrame(() => f(k - 1)) : r()); f(n) }), n)
const out = {}
out.listenersBefore = await listenerCount()
await page.evaluate(() => {
  window.calls = 0
  const ref = document.getElementById('ref')
  const flt = document.getElementById('flt')
  window.stop = window.hand.autoUpdate(ref, flt, () => { window.calls++ })
})
await raf(3)
out.listenersWhileActive = await listenerCount()
const c0 = await page.evaluate(() => window.calls)
await page.evaluate(() => { document.getElementById('flt').scrollTop = 100 })
await raf(2)
const c1 = await page.evaluate(() => window.calls)
await page.evaluate(() => { document.getElementById('other').scrollTop = 100 })
await raf(2)
const c2 = await page.evaluate(() => window.calls)
out.updatesFromScrollingInsideFloating = c1 - c0
out.updatesFromScrollingUnrelatedContainer = c2 - c1
await page.evaluate(() => window.stop())
out.listenersAfterCleanup = await listenerCount()
const c3 = await page.evaluate(() => window.calls)
await page.evaluate(() => { document.getElementById('ref').style.width = '90px'; document.getElementById('other').scrollTop = 0 })
await raf(3)
out.updatesAfterCleanup = (await page.evaluate(() => window.calls)) - c3
out.syncCleanupInsideEveryFrameUpdate = await page.evaluate(async () => {
  const ref = document.getElementById('ref')
  const flt = document.getElementById('flt')
  let calls = 0
  let stop = null
  let stopNow = false
  const update = () => {
    calls++
    if (stopNow) stop()
  }
  stop = window.hand.autoUpdate(ref, flt, update, true)
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  stopNow = true
  ref.style.left = '150px'
  await new Promise((r) => requestAnimationFrame(r))
  const atStop = calls
  for (let i = 0; i < 10; i++) {
    ref.style.left = `${200 + i * 10}px`
    await new Promise((r) => requestAnimationFrame(r))
  }
  return { callsWhenCleanupRan: atStop, callsAfterCleanup: calls - atStop }
})
console.log(JSON.stringify(out, null, 1))
await browser.close()
