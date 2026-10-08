import { launch } from './h.mjs'

const html = `<!doctype html><html><head><style>html,body{margin:0}html{scrollbar-gutter:stable}body{overflow:hidden}
#flt{position:fixed;left:600px;top:200px;width:200px;height:40px;background:#f90}</style></head><body><div style="height:3000px"></div><div id="flt"></div></body></html>`
const { browser, page } = await launch({ html, scrollbars: true })
const px = async (x) => (await page.screenshot({ clip: { x, y: 210, width: 1, height: 1 } })).toString('base64')
const orange = await px(650)
const r = {}
for (const x of [780, 784, 785, 786, 790, 799]) r[x] = (await px(x)) === orange
console.log('floating spans x=600..800; pixel visible at x:', JSON.stringify(r))
await browser.close()
