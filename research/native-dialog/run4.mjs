import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const file = pathToFileURL(path.resolve('app/dist/native-false.html')).href
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const out = {}
for (const hash of ['#guard', '#noguard']) {
  const page = await browser.newPage()
  await page.goto(file + hash)
  await page.waitForTimeout(200)
  await page.click('#opener')
  await page.waitForTimeout(300)
  await page.click('#inA')
  await page.waitForTimeout(300)
  const snap = () => page.evaluate(() => ({ dialogs: [...document.querySelectorAll('dialog')].map((d) => d.getAttribute('aria-label') + (d.matches(':modal') ? ':modal' : ':notmodal')), active: document.activeElement?.id || document.activeElement?.tagName, outsideInert: (() => { const o = document.getElementById('outside'); const prev = document.activeElement; o.focus(); const r = document.activeElement !== o; prev?.focus(); return r })() }))
  const stacked = await snap()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
  const duringExit = await page.evaluate(() => window.__exit && { startedModal: window.__exit.startedModal, samples: window.__exit.samples.map((s) => s.modal + '/' + Number(s.opacity).toFixed(2)).join(' ') })
  await page.waitForTimeout(500)
  const afterEsc1 = await snap()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(650)
  const afterEsc2 = await snap()
  const exit2 = await page.evaluate(() => window.__exit.samples.map((s) => s.modal + '/' + Number(s.opacity).toFixed(2)).join(' '))
  out[hash] = { stacked, duringExit, afterEsc1, afterEsc2, exit2 }
  await page.close()
}
console.log(JSON.stringify(out, null, 2))
await browser.close()
