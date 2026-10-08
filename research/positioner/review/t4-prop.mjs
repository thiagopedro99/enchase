import { launch } from './h.mjs'

const [,, mode = 'int', dprArg = '1', countArg = '3000', bundle = './bundle.js', boxSizing = 'border-box'] = process.argv
const html = `<!doctype html><html><head><style>
html,body{margin:0;height:100%;overflow:hidden}
#ref{position:fixed;background:#09f}
#flt{position:fixed;left:0;top:0;background:#f90;box-sizing:${boxSizing}}
</style></head><body><div id="ref"></div><div id="flt"></div></body></html>`
const { browser, page } = await launch({ html, bundle, deviceScaleFactor: Number(dprArg) })
const result = await page.evaluate(async ({ count, mode }) => {
  const { fui, hand } = window
  let seed = 7
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
  const pick = (items) => items[Math.floor(rand() * items.length)]
  const num = (min, max) => (mode === 'int' || mode === 'big' ? Math.round(min + rand() * (max - min)) : Math.round((min + rand() * (max - min)) * 100) / 100)
  const ref = document.getElementById('ref')
  const flt = document.getElementById('flt')
  const placements = ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end']
  const fields = { x: 0, y: 0, placement: 0, w: 0, h: 0, hidden: 0 }
  let mismatches = 0
  let maxErr = 0
  const examples = []
  const big = mode === 'big'
  for (let i = 0; i < count; i++) {
    const placement = pick(placements)
    const gap = pick([0, 8, 4.5])
    const padding = pick([0, 8])
    const dir = pick(['ltr', 'rtl'])
    Object.assign(ref.style, { left: `${num(-40, 840)}px`, top: `${num(-40, 640)}px`, width: `${num(0, 220)}px`, height: `${num(0, 60)}px` })
    Object.assign(flt.style, { width: `${num(16, big ? 1000 : 420)}px`, height: `${num(16, big ? 900 : 320)}px`, direction: dir, padding: mode === 'pad' ? '3.3px' : '0px' })
    let sizeData = null
    const expected = await fui.computePosition(ref, flt, { strategy: 'fixed', placement, middleware: [fui.offset(gap), fui.flip({ padding }), fui.shift({ padding }), fui.size({ padding, apply: (s) => (sizeData = { w: s.availableWidth, h: s.availableHeight }) }), fui.hide({ strategy: 'referenceHidden' })] })
    const actual = hand.computePosition(ref, flt, { placement, offset: gap, padding })
    const d = { x: Math.abs(expected.x - actual.x), y: Math.abs(expected.y - actual.y), w: Math.abs(sizeData.w - actual.availableWidth), h: Math.abs(sizeData.h - actual.availableHeight) }
    const bad = { x: d.x > 0.001, y: d.y > 0.001, placement: expected.placement !== actual.placement, w: d.w > 0.001, h: d.h > 0.001, hidden: !!expected.middlewareData.hide.referenceHidden !== actual.referenceHidden }
    Object.keys(bad).forEach((k) => { if (bad[k]) fields[k]++ })
    if (Object.values(bad).some(Boolean)) {
      mismatches++
      if (!bad.placement) maxErr = Math.max(maxErr, d.x, d.y)
      if (examples.length < 3) examples.push({ placement, gap, padding, dir, css: { w: getComputedStyle(flt).width, h: getComputedStyle(flt).height }, offset: [flt.offsetWidth, flt.offsetHeight], fui: { x: expected.x, y: expected.y, p: expected.placement, ...sizeData }, hand: { x: actual.x, y: actual.y, p: actual.placement, w: actual.availableWidth, h: actual.availableHeight } })
    }
  }
  return { count, mismatches, fields, maxPositionErrorWhenSamePlacement: maxErr, examples }
}, { count: Number(countArg), mode })
console.log(`mode=${mode} dpr=${dprArg} boxSizing=${boxSizing}`, JSON.stringify(result, null, 1))
await browser.close()
