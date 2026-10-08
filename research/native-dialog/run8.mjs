import { chromium } from 'playwright'
import { PNG } from 'pngjs'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
await page.goto(pathToFileURL(path.resolve('page.html')).href)
await page.addStyleTag({ content: 'body{background:#fff} #a::backdrop{background:rgb(0,0,0)}' })
await page.click('#openA')
const px = async () => { const p = PNG.sync.read(await page.screenshot()); const i = (p.width * 5 + 5) << 2; return [p.data[i], p.data[i + 1], p.data[i + 2]] }
const before = await px()
await page.evaluate(() => { const a = document.getElementById('a'); const an = a.animate([{ opacity: 1 }, { opacity: 0 }], { pseudoElement: '::backdrop', duration: 1000, fill: 'forwards' }); an.pause(); an.currentTime = 500 })
const mid = await px()
console.log(JSON.stringify({ backdropPixelBefore: before, backdropPixelMidAnimation: mid }))
await browser.close()
