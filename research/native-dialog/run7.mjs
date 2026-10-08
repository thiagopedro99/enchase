import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage()
await page.goto(pathToFileURL(path.resolve('page.html')).href)
await page.click('#openA')
const synthetic = await page.evaluate(async () => {
  const a = document.getElementById('a')
  const t = document.activeElement
  t.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true, cancelable: true }))
  t.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true, cancelable: true }))
  await new Promise((r) => setTimeout(r, 50))
  return { aOpenAfterSyntheticEsc: a.open, log: [...window.log] }
})
await page.keyboard.press('Escape')
const trusted = await page.evaluate(() => ({ aOpenAfterTrustedEsc: document.getElementById('a').open }))
console.log(JSON.stringify({ synthetic, trusted }))
await browser.close()
