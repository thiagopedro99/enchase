import { launch } from './h.mjs'

const html = `<!doctype html><html><head><style>
html,body{margin:0;height:100%;overflow:hidden}
#ref{position:fixed;left:300px;top:400px;width:80px;height:30px;background:#09f}
#flt{position:fixed;left:0;top:0;width:160px;overflow:auto;background:#f90}
#flt>div{height:500px}
</style></head><body><div id="ref"></div><div id="flt"><div></div></div></body></html>`
const { browser, page } = await launch({ html, bundle: './bundle-fixed.js' })
const r = await page.evaluate(() => {
  const ref = document.getElementById('ref')
  const flt = document.getElementById('flt')
  const h = window.hand.computePosition(ref, flt, { placement: 'top', offset: 8, apply: ({ availableHeight }) => { flt.style.maxHeight = `${availableHeight}px` } })
  Object.assign(flt.style, { left: `${h.x}px`, top: `${h.y}px` })
  return { placement: h.placement, y: h.y, maxHeight: flt.style.maxHeight, gapToRef: Math.round(ref.getBoundingClientRect().top - flt.getBoundingClientRect().bottom) }
})
console.log('fixed single call with apply', JSON.stringify(r))
await browser.close()
