import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'

const bundle = readFileSync(new URL('./bundle.js', import.meta.url), 'utf8')
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
await page.setContent(`<!doctype html><html><head><style>
html,body{margin:0;height:100%;overflow:hidden}
#ref{position:fixed;background:#09f}
#flt{position:fixed;left:0;top:0;background:#f90;box-sizing:border-box}
#box{position:absolute;left:100px;top:100px;width:300px;height:200px;overflow:auto;background:#eee}
#inner{height:1000px;position:relative}
#ref2{position:absolute;left:20px;top:80px;width:60px;height:30px;background:#0c6}
</style></head><body><div id="ref"></div><div id="flt"></div>
<div id="box"><div id="inner"><div id="ref2"></div></div></div></body></html>`)
await page.addScriptTag({ content: bundle })

console.log('chromium', browser.version())

const result = await page.evaluate(async (count) => {
  const { fui, hand } = window
  let seed = 42
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
  const pick = (items) => items[Math.floor(rand() * items.length)]
  const int = (min, max) => Math.round(min + rand() * (max - min))
  const ref = document.getElementById('ref')
  const flt = document.getElementById('flt')
  const placements = ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end']
  const mismatches = []
  const placementChanges = { flipped: 0, shifted: 0 }
  for (let i = 0; i < count; i++) {
    const placement = pick(placements)
    const gap = pick([0, 8])
    const padding = pick([0, 8])
    const dir = pick(['ltr', 'rtl'])
    Object.assign(ref.style, { left: `${int(-40, 840)}px`, top: `${int(-40, 640)}px`, width: `${int(8, 220)}px`, height: `${int(8, 60)}px` })
    Object.assign(flt.style, { width: `${int(16, 420)}px`, height: `${int(16, 320)}px`, direction: dir })
    let sizeData = null
    const expected = await fui.computePosition(ref, flt, {
      strategy: 'fixed',
      placement,
      middleware: [fui.offset(gap), fui.flip({ padding }), fui.shift({ padding }), fui.size({ padding, apply: (s) => (sizeData = { w: s.availableWidth, h: s.availableHeight }) }), fui.hide({ strategy: 'referenceHidden' })]
    })
    const actual = hand.computePosition(ref, flt, { placement, offset: gap, padding })
    const same = (a, b) => Math.abs(a - b) < 0.001
    const ok = same(expected.x, actual.x) && same(expected.y, actual.y) && expected.placement === actual.placement && same(sizeData.w, actual.availableWidth) && same(sizeData.h, actual.availableHeight) && !!expected.middlewareData.hide.referenceHidden === actual.referenceHidden
    if (expected.placement !== placement) placementChanges.flipped++
    if (expected.middlewareData.shift && (expected.middlewareData.shift.x || expected.middlewareData.shift.y)) placementChanges.shifted++
    if (!ok) mismatches.push({ i, placement, gap, padding, dir, ref: ref.getBoundingClientRect().toJSON(), flt: [flt.offsetWidth, flt.offsetHeight], expected: { x: expected.x, y: expected.y, p: expected.placement, ...sizeData, hidden: expected.middlewareData.hide.referenceHidden }, actual })
  }
  const ref2 = document.getElementById('ref2')
  const box = document.getElementById('box')
  const hiddenChecks = []
  for (const top of [0, 60, 100, 300]) {
    box.scrollTop = top
    const expected = await fui.computePosition(ref2, flt, { strategy: 'fixed', middleware: [fui.hide({ strategy: 'referenceHidden' })] })
    const actual = hand.computePosition(ref2, flt, {})
    hiddenChecks.push({ scrollTop: top, fui: !!expected.middlewareData.hide.referenceHidden, hand: actual.referenceHidden })
  }
  const virtual = { getBoundingClientRect: () => DOMRect.fromRect({ x: 790, y: 590, width: 0, height: 0 }) }
  Object.assign(flt.style, { width: '120px', height: '80px', direction: 'ltr' })
  const vExpected = await fui.computePosition(virtual, flt, { strategy: 'fixed', placement: 'bottom-start', middleware: [fui.flip(), fui.shift()] })
  const vActual = hand.computePosition(virtual, flt, { placement: 'bottom-start' })
  return { count, mismatches: mismatches.slice(0, 5), mismatchCount: mismatches.length, placementChanges, hiddenChecks, virtual: { fui: [vExpected.x, vExpected.y, vExpected.placement], hand: [vActual.x, vActual.y, vActual.placement] } }
}, 5000)
console.log(JSON.stringify(result, null, 1))

const auto = await page.evaluate(async () => {
  const { hand } = window
  const ref2 = document.getElementById('ref2')
  const box = document.getElementById('box')
  const flt = document.getElementById('flt')
  box.scrollTop = 0
  Object.assign(flt.style, { width: '100px', height: '40px' })
  let calls = 0
  const apply = () => {
    calls++
    const r = hand.computePosition(ref2, flt, { placement: 'bottom', offset: 4 })
    flt.style.transform = `translate(${r.x}px, ${r.y}px)`
  }
  const stop = hand.autoUpdate(ref2, flt, apply)
  const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  await frame()
  const before = flt.getBoundingClientRect().top - ref2.getBoundingClientRect().bottom
  box.scrollTop = 50
  await frame()
  const afterScroll = flt.getBoundingClientRect().top - ref2.getBoundingClientRect().bottom
  ref2.style.height = '50px'
  await frame()
  const afterResize = flt.getBoundingClientRect().top - ref2.getBoundingClientRect().bottom
  stop()
  return { calls, before, afterScroll, afterResize }
})
console.log('autoUpdate', JSON.stringify(auto))
await browser.close()
