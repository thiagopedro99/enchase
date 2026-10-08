import { chromium } from 'playwright'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const url = pathToFileURL(path.join(dir, 'page.html')).href
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const out = {}

const setup = async (init) => {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
  if (init) await page.addInitScript(init)
  await page.goto(url)
  const cdp = await page.context().newCDPSession(page)
  const read = async () => {
    await new Promise((r) => setTimeout(r, 50))
    const { result } = await cdp.send('Runtime.evaluate', {
      expression: `JSON.stringify({ a: document.getElementById('a').open, b: document.getElementById('b').open, activation: navigator.userActivation.isActive, log: window.log })`,
      returnByValue: true,
      userGesture: false
    })
    return JSON.parse(result.value)
  }
  return { page, read }
}

{
  const { page, read } = await setup(() => {
    addEventListener('DOMContentLoaded', () => {
      document.getElementById('a').showModal()
      document.getElementById('b').showModal()
    })
  })
  const before = await read()
  await page.keyboard.press('Escape')
  out.noActivation_AandB_oneEsc = { before, after: await read() }
  await page.close()
}

{
  const { page, read } = await setup(() => {
    addEventListener('DOMContentLoaded', () => {
      document.getElementById('a').showModal()
      setTimeout(() => document.getElementById('b').showModal(), 100)
    })
  })
  await page.waitForTimeout(300)
  await page.keyboard.press('Escape')
  out.noActivation_AthenBlater_oneEsc = await read()
  await page.close()
}

{
  const { page, read } = await setup(() => {
    addEventListener('DOMContentLoaded', () => {
      document.getElementById('a').addEventListener('cancel', (e) => {
        e.preventDefault()
        window.log.push('prevented')
      })
    })
  })
  await page.click('#openA')
  await page.keyboard.press('Escape')
  const esc1 = await read()
  await page.keyboard.press('Escape')
  const esc2 = await read()
  await page.keyboard.press('Escape')
  const esc3 = await read()
  out.clickOpenA_preventCancel = { esc1, esc2, esc3 }
  await page.close()
}

{
  const { page, read } = await setup(() => {
    addEventListener('DOMContentLoaded', () => {
      document.getElementById('a').addEventListener('cancel', (e) => {
        e.preventDefault()
        window.log.push('prevented')
      })
      document.getElementById('a').showModal()
    })
  })
  await page.keyboard.press('Escape')
  out.noActivation_preventCancel = await read()
  await page.close()
}

{
  const { page, read } = await setup()
  await page.click('#openA')
  await page.click('#openB')
  await page.keyboard.press('Escape')
  const esc1 = await read()
  await page.keyboard.press('Escape')
  out.clickA_clickB = { esc1, esc2: await read() }
  await page.close()
}

{
  const { page, read } = await setup(() => {
    addEventListener('DOMContentLoaded', () => {
      document.getElementById('openA').addEventListener('click', () => setTimeout(() => document.getElementById('b').showModal(), 50))
    })
  })
  await page.click('#openA')
  await page.waitForTimeout(200)
  await page.keyboard.press('Escape')
  out.oneClick_opensAandB = await read()
  await page.close()
}

console.log(JSON.stringify(out, null, 2))
await browser.close()
