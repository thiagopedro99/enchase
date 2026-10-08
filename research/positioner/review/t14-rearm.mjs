import { launch } from './h.mjs'

const html = `<!doctype html><html><head><style>html,body{margin:0;height:100%;overflow:hidden}
#ref{position:fixed;left:100px;top:100px;width:80px;height:30px;background:#09f}
#flt{position:fixed;left:0;top:0;width:120px;height:80px;background:#f90}</style></head>
<body><div id="ref"></div><div id="flt"></div></body></html>`
const bundle = process.argv[2] ?? './bundle.js'
const { browser, page } = await launch({ html, bundle })
const r = await page.evaluate(async () => {
  const ref = document.getElementById('ref')
  const flt = document.getElementById('flt')
  const raf = () => new Promise((r) => requestAnimationFrame(r))
  const log = []
  let calls = 0
  let stop = null
  let stopNow = false
  let stopped = false
  stop = window.hand.autoUpdate(ref, flt, () => {
    calls++
    if (stopNow && !stopped) {
      stopped = true
      stop()
    }
  }, true)
  for (let i = 0; i < 4; i++) await raf()
  log.push(['settled', calls])
  stopNow = true
  for (let i = 0; i < 8; i++) {
    ref.style.left = `${120 + i * 10}px`
    await raf()
    log.push([`frame${i}`, calls, stopped])
  }
  return log
})
console.log(bundle, JSON.stringify(r))
await browser.close()
