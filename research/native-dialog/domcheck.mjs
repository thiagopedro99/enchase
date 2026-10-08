import { JSDOM } from 'jsdom'
import { Window } from 'happy-dom'

const html = `<!doctype html><body><button id="out">out</button><dialog id="d"><button id="in">in</button></dialog><div id="p" popover>p</div></body>`

const probe = async (name, win) => {
  const doc = win.document
  const d = doc.getElementById('d')
  const p = doc.getElementById('p')
  const r = { env: name }
  r.showModalType = typeof d.showModal
  r.showPopoverType = typeof p.showPopover
  r.closedByProp = 'closedBy' in d
  r.requestClose = typeof d.requestClose
  try {
    d.showModal()
    r.showModalOpen = d.open
    try { r.modalPseudo = d.matches(':modal') } catch (e) { r.modalPseudo = 'throws: ' + e.message.slice(0, 60) }
    const out = doc.getElementById('out')
    out.focus()
    r.outsideFocusableWhileModal = doc.activeElement === out
    r.outsideInertProp = out.inert ?? 'n/a'
    r.activeAfterShowModal = doc.activeElement?.id
    const ev = new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    let cancelFired = false
    d.addEventListener('cancel', () => { cancelFired = true })
    doc.activeElement.dispatchEvent(ev)
    r.escClosesDialog = !d.open
    r.cancelEventFired = cancelFired
    if (d.open) d.close()
  } catch (e) { r.showModalError = e.message.slice(0, 80) }
  try {
    p.showPopover()
    try { r.popoverOpenPseudo = p.matches(':popover-open') } catch (e) { r.popoverOpenPseudo = 'throws: ' + e.message.slice(0, 60) }
  } catch (e) { r.showPopoverError = e.message.slice(0, 80) }
  try { r.cssSupportsOverlay = win.CSS?.supports?.('overlay: auto') } catch (e) { r.cssSupportsOverlay = 'err' }
  return r
}

const jsdom = new JSDOM(html, { pretendToBeVisual: true })
console.log(JSON.stringify(await probe('jsdom ' + (await import('jsdom/package.json', { with: { type: 'json' } })).default.version, jsdom.window), null, 1))
const hw = new Window()
hw.document.write(html)
console.log(JSON.stringify(await probe('happy-dom ' + (await import('happy-dom/package.json', { with: { type: 'json' } })).default.version, hw), null, 1))
await hw.happyDOM.close()
