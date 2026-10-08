import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
await page.setContent(`<!doctype html><html><head><style>
html,body{margin:0;height:100%}
button{position:absolute;width:80px;height:30px;margin:0;padding:0;border:0}
#a2{left:4px;top:200px;anchor-name:--a2}
#a3{left:360px;top:560px;anchor-name:--a3}
#a5{left:600px;top:40px;anchor-name:--a5}
#box{position:absolute;left:400px;top:150px;width:300px;height:200px;overflow:auto}
#inner{height:1200px;position:relative}
#a4{left:20px;top:80px;anchor-name:--a4}
[popover]{margin:0;padding:0;border:0;width:200px;height:120px;inset:auto;position-try-fallbacks:flip-block;background:#f90}
#p2{position-anchor:--a2;position-area:bottom;place-self:anchor-center}
#p2b{position-anchor:--a2;position-area:bottom center}
#p4{position-anchor:--a4;position-area:bottom;position-visibility:anchors-visible}
#p6{position-anchor:--a3;position-area:bottom;height:auto;max-height:100%;overflow:auto;position-try-order:most-height}
#p6 div{height:900px}
#p7{position-anchor:--a5;position-area:block-end span-inline-end;width:120px}
#p8{position-anchor:--a5;position-area:block-end span-self-inline-end;width:120px}
</style></head><body>
<button id="a2">a2</button><button id="a3">a3</button><button id="a5">a5</button>
<div id="box"><div id="inner"><button id="a4">a4</button></div></div>
<div popover="manual" id="p2">p2</div><div popover="manual" id="p2b">p2b</div><div popover="manual" id="p4">p4</div>
<div popover="manual" id="p6"><div></div></div>
<div popover="manual" id="p7" dir="rtl">p7</div><div popover="manual" id="p8" dir="rtl">p8</div>
</body></html>`)
const out = await page.evaluate(async () => {
  const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  const r = (id) => {
    const b = document.getElementById(id).getBoundingClientRect()

    return { x: b.x, y: b.y, w: b.width, h: b.height }
  }
  const hit = (id) => {
    const b = document.getElementById(id).getBoundingClientRect()

    return document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)?.id || null
  }
  for (const id of ['p2', 'p2b', 'p4', 'p6', 'p7', 'p8']) document.getElementById(id).showPopover()
  await frame()
  const res = { p2_anchorCenter_nearLeftEdge: r('p2'), p2b_bottomCenter_nearLeftEdge: r('p2b'), p6_mostHeight: r('p6'), p7_rtl_spanInlineEnd: r('p7'), p8_rtl_spanSelfInlineEnd: r('p8'), a5: r('a5'), p4_hit_before: hit('p4') }
  document.getElementById('box').scrollTop = 400
  await frame()
  res.p4_hit_anchorScrolledOut = hit('p4')
  res.p4_checkVisibility = document.getElementById('p4').checkVisibility({ visibilityProperty: true })
  return res
})
console.log(JSON.stringify(out, null, 0).replaceAll('},"', '},\n"'))
await browser.close()
