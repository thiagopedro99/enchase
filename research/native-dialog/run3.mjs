import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const dist = path.resolve('app/dist')
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const out = {}
const load = async (name) => {
  const page = await browser.newPage()
  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message.slice(0, 200)))
  await page.goto(pathToFileURL(path.join(dist, name + '.html')).href)
  await page.waitForTimeout(400)
  return { page, consoleErrors }
}
for (const name of ['native-false', 'native-true', 'portal-false', 'portal-true']) {
  const { page, consoleErrors } = await load(name)
  out[name] = await page.evaluate(() => ({
    recoverable: window.__errors,
    dialogs: [...document.querySelectorAll('dialog')].map((d) => ({ label: d.getAttribute('aria-label'), modal: d.matches(':modal') })),
    roleDialogs: document.querySelectorAll('[role=dialog]').length
  }))
  out[name].consoleErrors = consoleErrors
  await page.close()
}
{
  const { page, consoleErrors } = await load('native-false')
  await page.click('#opener')
  await page.waitForTimeout(300)
  await page.click('#inA')
  await page.waitForTimeout(300)
  const stacked = await page.evaluate(() => ({
    modal: [...document.querySelectorAll('dialog')].map((d) => d.getAttribute('aria-label') + ':' + d.matches(':modal')),
    active: document.activeElement?.id
  }))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(100)
  const midExitB = await page.evaluate(() => ({ dialogs: [...document.querySelectorAll('dialog')].map((d) => d.getAttribute('aria-label') + ':' + d.matches(':modal') + ':op=' + getComputedStyle(d).opacity) }))
  await page.waitForTimeout(500)
  const afterEsc1 = await page.evaluate(() => ({ dialogs: [...document.querySelectorAll('dialog')].map((d) => d.getAttribute('aria-label') + ':' + d.matches(':modal')), active: document.activeElement?.id, exit: window.__exit }))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(600)
  const afterEsc2 = await page.evaluate(() => ({ dialogs: document.querySelectorAll('dialog').length, active: document.activeElement?.id, exitSamples: window.__exit.samples.map((s) => s.modal + '/' + Number(s.opacity).toFixed(2)).join(' ') }))
  out.nativeInteraction = { stacked, midExitB, afterEsc1, afterEsc2, consoleErrors }
  await page.close()
}
console.log(JSON.stringify(out, null, 2))
await browser.close()
