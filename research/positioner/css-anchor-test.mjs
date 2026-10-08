import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
await page.setContent(`<!doctype html><html><head><style>
html,body{margin:0;height:100%}
body{height:2000px}
button{position:absolute;width:80px;height:30px;margin:0;padding:0;border:0}
#a1{left:360px;top:20px;anchor-name:--a1}
#a2{left:4px;top:200px;anchor-name:--a2}
#a3{left:360px;top:560px;anchor-name:--a3}
#box{position:absolute;left:400px;top:150px;width:300px;height:200px;overflow:auto}
#inner{height:1200px;position:relative}
#a4{left:20px;top:80px;anchor-name:--a4}
[popover]{margin:0;padding:0;border:0;width:200px;height:120px;inset:auto;position-try-fallbacks:flip-block}
#p1{position-anchor:--a1;position-area:bottom}
#p2{position-anchor:--a2;position-area:bottom}
#p3{position-anchor:--a3;position-area:bottom}
#p4{position-anchor:--a4;position-area:bottom;position-visibility:anchors-visible}
#p5{position-area:bottom;position-anchor:auto}
#p6{position-anchor:--a3;position-area:bottom;height:auto;max-height:100%;overflow:auto}
#p6 div{height:900px}
#p7{position-anchor:--a1;position-area:bottom span-inline-end;width:120px}
</style></head><body>
<button id="a1">a1</button><button id="a2">a2</button><button id="a3">a3</button>
<div id="box"><div id="inner"><button id="a4">a4</button></div></div>
<button id="src" style="left:600px;top:40px">src</button>
<div popover="manual" id="p1">p1</div><div popover="manual" id="p2">p2</div><div popover="manual" id="p3">p3</div>
<div popover="manual" id="p4">p4</div><div popover="manual" id="p5">p5</div><div popover="manual" id="p6"><div></div></div>
<div popover="manual" id="p7" dir="rtl">p7</div>
</body></html>`)

console.log('chromium', browser.version())
const out = await page.evaluate(async () => {
  const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  const r = (id) => {
    const b = document.getElementById(id).getBoundingClientRect()

    return { x: b.x, y: b.y, w: b.width, h: b.height }
  }
  const visible = (id) => getComputedStyle(document.getElementById(id)).visibility
  for (const id of ['p1', 'p2', 'p3', 'p4', 'p6', 'p7']) document.getElementById(id).showPopover()
  document.getElementById('p5').showPopover({ source: document.getElementById('src') })
  await frame()
  const res = {
    supports: CSS.supports('position-area: bottom') && CSS.supports('anchor-name: --x'),
    a1: r('a1'), p1_centeredBelow: r('p1'),
    a2: r('a2'), p2_nearLeftEdge: r('p2'),
    a3: r('a3'), p3_nearBottom_flipBlock: r('p3'),
    p5_implicitAnchorViaShowPopoverSource: { src: r('src'), pop: r('p5') },
    p6_maxHeight100: r('p6'),
    p7_rtlSpanInlineEnd: r('p7'),
    p4_inScroller_before: r('p4'), a4_before: r('a4'), p4_visibility_before: visible('p4')
  }
  document.getElementById('box').scrollTop = 60
  await frame()
  res.p4_afterScroll60 = r('p4')
  res.a4_afterScroll60 = r('a4')
  document.getElementById('box').scrollTop = 400
  await frame()
  res.p4_visibility_anchorScrolledOut = visible('p4')
  window.scrollTo(0, 100)
  await frame()
  res.p1_afterWindowScroll = r('p1')
  res.a1_afterWindowScroll = r('a1')
  return res
})
console.log(JSON.stringify(out, null, 0).replaceAll('},"', '},\n"'))
await browser.close()
