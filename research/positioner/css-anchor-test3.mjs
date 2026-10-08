import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
await page.setContent(`<!doctype html><html><head><style>
html,body{margin:0;height:100%;background:#fff}
button{position:absolute;width:80px;height:30px;margin:0;padding:0;border:0}
#a5{left:600px;top:40px;anchor-name:--a5}
#box{position:absolute;left:400px;top:150px;width:300px;height:200px;overflow:auto}
#inner{height:1200px;position:relative}
#a4{left:20px;top:80px;anchor-name:--a4}
[popover]{margin:0;padding:0;border:0;width:200px;height:120px;inset:auto;background:rgb(255,153,0)}
#p4{position-anchor:--a4;position-area:bottom;position-visibility:anchors-visible}
#p8{position-anchor:--a5;position-area:self-block-end span-self-inline-end;width:120px}
</style></head><body><button id="a5">a5</button>
<div id="box"><div id="inner"><button id="a4">a4</button></div></div>
<div popover="manual" id="p4"></div><div popover="manual" id="p8" dir="rtl">p8</div></body></html>`)
await page.evaluate(() => { document.getElementById('p4').showPopover(); document.getElementById('p8').showPopover() })
const pixel = async () => {
  const b = await page.evaluate(() => document.getElementById('p4').getBoundingClientRect().toJSON())
  const buf = await page.screenshot({ clip: { x: b.x + b.width / 2, y: b.y + b.height / 2, width: 1, height: 1 } })
  return { rect: [b.x, b.y], bytes: buf.length }
}
const shot1 = await page.screenshot({ clip: { x: 450, y: 300, width: 1, height: 1 } })
await page.evaluate(() => { document.getElementById('box').scrollTop = 115 })
await page.waitForTimeout(100)
const p4after = await page.evaluate(() => document.getElementById('p4').getBoundingClientRect().toJSON())
const shot2 = await page.screenshot({ clip: { x: p4after.x + 100, y: Math.max(1, p4after.y + 60), width: 1, height: 1 } })
const p8 = await page.evaluate(() => document.getElementById('p8').getBoundingClientRect().toJSON())
await page.screenshot({ path: 'vis.png' })
console.log(JSON.stringify({ p4after, shot1: shot1.toString('base64'), shot2: shot2.toString('base64'), p8 }))
await browser.close()
