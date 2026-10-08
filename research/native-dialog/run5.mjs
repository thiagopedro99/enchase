import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
await page.goto(pathToFileURL(path.resolve('page.html')).href)
await page.click('#openA')
const r = await page.evaluate(() => {
  const toast = document.createElement('div')
  toast.popover = 'manual'
  toast.innerHTML = '<button id="toastBtn">Undo</button>'
  toast.style.cssText = 'margin:0;inset:auto;top:0;left:0;width:200px;height:50px;background:yellow'
  document.body.append(toast)
  toast.showPopover()
  const btn = document.getElementById('toastBtn')
  btn.focus()
  return { toastOpen: toast.matches(':popover-open'), toastButtonFocusable: document.activeElement === btn, hitTop: document.elementFromPoint(10, 10)?.id || document.elementFromPoint(10, 10)?.tagName }
})
const cdp = await page.context().newCDPSession(page)
const { root } = await cdp.send('DOM.getDocument', { depth: -1 })
const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#toastBtn' })
const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })
r.toastAx = { ignored: nodes[0].ignored, reasons: (nodes[0].ignoredReasons || []).map((x) => x.name) }
await page.mouse.click(10, 10)
r.clickReachedToast = await page.evaluate(() => document.activeElement?.id)
console.log(JSON.stringify(r, null, 2))
await browser.close()
