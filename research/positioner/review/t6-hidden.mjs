import { launch } from './h.mjs'

const bundle = process.argv[2] ?? './bundle.js'
const scenarios = {
  displayContents: `<div style="display:contents;overflow:hidden"><div id="ref" style="margin:100px;width:80px;height:30px;background:#09f"></div></div>`,
  absoluteEscapesStaticScroller: `<div style="position:relative"><div style="overflow:auto;height:100px;width:300px;background:#eee"><div id="ref" style="position:absolute;top:300px;left:100px;width:80px;height:30px;background:#09f"></div></div></div>`,
  fixedEscapesScroller: `<div style="overflow:hidden;height:100px;width:300px;background:#eee"><div id="ref" style="position:fixed;top:300px;left:100px;width:80px;height:30px;background:#09f"></div></div>`,
  bodyOverflowXHiddenShortBody: `<style>body{overflow-x:hidden}</style><div style="height:100px"></div><div id="ref" style="position:fixed;top:400px;left:100px;width:80px;height:30px;background:#09f"></div>`,
  refUnderScrollerBorder: `<div id="box" style="position:absolute;left:100px;top:100px;width:300px;height:200px;border:40px solid #333;overflow:hidden;background:#eee"><div style="height:1000px;position:relative"><div id="ref" style="position:absolute;top:220px;left:20px;width:80px;height:30px;background:#09f"></div></div></div>`
}
const out = {}
for (const [name, body] of Object.entries(scenarios)) {
  const html = `<!doctype html><html><head><style>html,body{margin:0}#flt{position:fixed;left:0;top:0;width:50px;height:20px}</style></head><body>${body}<div id="flt"></div></body></html>`
  const { browser, page } = await launch({ html, bundle })
  out[name] = await page.evaluate(async () => {
    const ref = document.getElementById('ref')
    const flt = document.getElementById('flt')
    const r = ref.getBoundingClientRect()
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
    const e = await window.fui.computePosition(ref, flt, { strategy: 'fixed', middleware: [window.fui.hide()] })
    return { refRect: [r.x, r.y, r.width, r.height].map(Math.round), actuallyVisible: hit === ref, fuiHidden: !!e.middlewareData.hide.referenceHidden, handHidden: window.hand.computePosition(ref, flt).referenceHidden }
  })
  await browser.close()
}
console.log(JSON.stringify(out, null, 1))
