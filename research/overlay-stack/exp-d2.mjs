import { launch, openPage } from './lib.mjs'
const browser = await launch()
const page = await openPage(browser, 'scene=modal&esc=doc')
await page.click('#open-modal')
await page.click('#pop-trigger')
const cdp = await page.context().newCDPSession(page)
await cdp.send('Accessibility.enable')
const { root } = await cdp.send('DOM.getDocument', { depth: -1 })
for (const sel of ['#page-before', '#m-input', '#p1', '[data-popover]', '[role=dialog]']) {
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel })
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: true })
  const self = nodes.find((n) => n.backendDOMNodeId && n.ignored !== undefined && (n.name?.value || n.role?.value)) && nodes[0]
  const ancestors = nodes.slice(1).map((n) => n.role?.value + (n.name?.value ? '"' + n.name.value + '"' : '')).filter(Boolean)
  console.log(sel, JSON.stringify({ role: self.role?.value, name: self.name?.value, ignored: self.ignored, reasons: (self.ignoredReasons ?? []).map((r) => r.name) }), 'relatives:', JSON.stringify(ancestors.slice(0, 6)))
}
const { nodes } = await cdp.send('Accessibility.getFullAXTree')
const pb = nodes.filter((n) => n.name?.value === 'Page before')
console.log('full-tree nodes named "Page before":', pb.length)
await browser.close()
