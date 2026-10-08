import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage()
await page.goto(pathToFileURL(path.resolve('page.html')).href)
await page.click('#openA')
const seq = []
const who = () => page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName)
seq.push('afterShowModal=' + (await who()))
for (let i = 0; i < 4; i++) {
  await page.keyboard.press('Tab')
  seq.push('Tab' + (i + 1) + '=' + (await who()))
}
console.log(seq.join('  '))
await browser.close()
