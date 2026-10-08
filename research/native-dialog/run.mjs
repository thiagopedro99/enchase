import { chromium } from 'playwright'
import { PNG } from 'pngjs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const url = pathToFileURL(path.join(dir, 'page.html')).href

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const out = {}
out.browserVersion = browser.version()

const fresh = async () => {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
  await page.goto(url)
  return page
}

const axIgnored = async (page, selector) => {
  const cdp = await page.context().newCDPSession(page)
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 })
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector })
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })
  const n = nodes[0]
  return { ignored: n.ignored, reasons: (n.ignoredReasons || []).map((r) => r.name) }
}

const pixel = async (page, x, y) => {
  const buf = await page.screenshot({ animations: 'allow' })
  const png = PNG.sync.read(buf)
  const i = (png.width * y + x) << 2
  return [png.data[i], png.data[i + 1], png.data[i + 2]]
}

const state = (page) =>
  page.evaluate(() => {
    const q = (id) => document.getElementById(id)
    const tryFocus = (id) => {
      q(id).focus()
      return document.activeElement?.id === id
    }
    return {
      aOpen: q('a').open,
      bOpen: q('b').open,
      aModal: q('a').matches(':modal'),
      bModal: q('b').matches(':modal'),
      outsideFocusable: tryFocus('outside'),
      insideAFocusable: tryFocus('insideA'),
      insideBFocusable: tryFocus('insideB'),
      topAtCenter: document.elementFromPoint(400, 300)?.id || document.elementFromPoint(400, 300)?.tagName,
      log: [...window.log]
    }
  })

{
  const page = await fresh()
  out.features = await page.evaluate(() => ({
    showModal: typeof HTMLDialogElement.prototype.showModal,
    requestClose: 'requestClose' in HTMLDialogElement.prototype,
    closedByProp: 'closedBy' in HTMLDialogElement.prototype,
    closeWatcher: 'CloseWatcher' in window,
    popoverApi: 'showPopover' in HTMLElement.prototype,
    popoverHintReflects: document.getElementById('hint').popover,
    interestFor: 'interestForElement' in HTMLButtonElement.prototype,
    startingStyleRule: 'CSSStartingStyleRule' in window,
    transitionBehavior: CSS.supports('transition-behavior: allow-discrete'),
    overlayProp: CSS.supports('overlay: auto'),
    baseSelect: CSS.supports('appearance: base-select'),
    pickerSelect: CSS.supports('selector(::picker(select))'),
    openPseudo: CSS.supports('selector(:open)'),
    anchorPositioning: CSS.supports('anchor-name: --x') && CSS.supports('position-anchor: --x'),
    positionTry: CSS.supports('position-try-fallbacks: flip-block')
  }))
  await page.close()
}

{
  const page = await fresh()
  await page.click('#openA')
  await page.click('#openB')
  const before = await state(page)
  const axOutside = await axIgnored(page, '#outside')
  const axInsideA = await axIgnored(page, '#insideA')
  const axInsideB = await axIgnored(page, '#insideB')
  await page.evaluate(() => document.getElementById('insideB').focus())
  await page.keyboard.press('Escape')
  const afterOneEsc = await state(page)
  await page.keyboard.press('Escape')
  const afterTwoEsc = await state(page)
  out.stackedByClicks = { before, axOutside, axInsideA, axInsideB, afterOneEsc, afterTwoEsc }
  await page.close()
}

{
  const page = await fresh()
  await page.evaluate(() => {
    document.getElementById('a').showModal()
    document.getElementById('b').showModal()
  })
  const before = await state(page)
  await page.keyboard.press('Escape')
  const afterOneEsc = await state(page)
  out.stackedProgrammaticNoActivation = { before, afterOneEsc }
  await page.close()
}

{
  const page = await fresh()
  await page.click('#openA')
  await page.evaluate(() => document.getElementById('b').showModal())
  await page.keyboard.press('Escape')
  const afterOneEsc = await state(page)
  out.aByClick_bProgrammatic = { afterOneEsc }
  await page.close()
}

{
  const page = await fresh()
  await page.evaluate(() =>
    document.getElementById('a').addEventListener('cancel', (e) => {
      e.preventDefault()
      window.log.push('prevented')
    })
  )
  await page.click('#openA')
  await page.keyboard.press('Escape')
  const afterEsc1 = await state(page)
  await page.keyboard.press('Escape')
  const afterEsc2 = await state(page)
  out.cancelPreventDefault = { afterEsc1: { aOpen: afterEsc1.aOpen, log: afterEsc1.log }, afterEsc2: { aOpen: afterEsc2.aOpen, log: afterEsc2.log } }
  await page.close()
}

{
  const page = await fresh()
  await page.click('#openA')
  await page.evaluate(() => document.getElementById('a').close())
  await page.evaluate(() => {
    const cd = document.getElementById('cd')
    cd.showModal()
  })
  await page.keyboard.press('Escape')
  const noneAfterEsc = await page.evaluate(() => document.getElementById('cd').open)
  await page.evaluate(() => {
    const cd = document.getElementById('cd')
    cd.close()
    cd.setAttribute('closedby', 'any')
    cd.showModal()
  })
  await page.mouse.click(5, 5)
  const anyAfterBackdropClick = await page.evaluate(() => document.getElementById('cd').open)
  await page.evaluate(() => {
    const cd = document.getElementById('cd')
    cd.removeAttribute('closedby')
  })
  await page.click('#outside', { force: true }).catch(() => {})
  await page.evaluate(() => document.getElementById('cd').showModal())
  await page.mouse.click(5, 5)
  const defaultAfterBackdropClick = await page.evaluate(() => document.getElementById('cd').open)
  out.closedby = { noneAfterEsc, anyAfterBackdropClick, defaultModalAfterBackdropClick: defaultAfterBackdropClick }
  await page.close()
}

const exitTransition = async (id) => {
  const page = await fresh()
  await page.evaluate(() => document.body.classList.add('hostile'))
  await page.evaluate((id) => document.getElementById(id).showModal(), id)
  await page.waitForTimeout(1200)
  const openPixel = await pixel(page, 400, 300)
  const mid = await page.evaluate((id) => {
    const d = document.getElementById(id)
    d.close()
    const anims = d.getAnimations()
    for (const a of anims) {
      a.pause()
      a.currentTime = 500
    }
    const cs = getComputedStyle(d)
    return {
      transitions: anims.map((a) => a.transitionProperty),
      openAttr: d.open,
      modal: d.matches(':modal'),
      opacity: cs.opacity,
      display: cs.display,
      overlay: cs.overlay,
      position: cs.position
    }
  }, id)
  const midPixel = await pixel(page, 400, 300)
  const end = await page.evaluate((id) => {
    const d = document.getElementById(id)
    for (const a of d.getAnimations()) a.finish()
    const cs = getComputedStyle(d)
    return { display: cs.display, overlay: cs.overlay, opacity: cs.opacity }
  }, id)
  const endPixel = await pixel(page, 400, 300)
  await page.close()
  return { openPixel, mid, midPixel, end, endPixel }
}

out.exitWithOverlay = await exitTransition('fade')
out.exitWithoutOverlay = await exitTransition('fadeNoOverlay')

{
  const page = await fresh()
  await page.click('#openA')
  const r = await page.evaluate(async () => {
    const a = document.getElementById('a')
    const anim = a.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' })
    await new Promise((r) => setTimeout(r, 150))
    const midModal = a.matches(':modal')
    await anim.finished
    a.close()
    anim.cancel()
    return { midModal, activeAfterClose: document.activeElement?.id, log: [...window.log] }
  })
  out.waapiThenClose = r
  await page.close()
}

{
  const page = await fresh()
  await page.click('#openA')
  const r = await page.evaluate(() => {
    const a = document.getElementById('a')
    a.remove()
    const outside = document.getElementById('outside')
    outside.focus()
    const outsideFocusable = document.activeElement === outside
    return { openAttrAfterRemove: a.open, modalAfterRemove: a.matches(':modal'), outsideFocusable, log: [...window.log] }
  })
  const r2 = await page.evaluate(() => {
    document.getElementById('openA').focus()
    const a = document.getElementById('a')
    return { activeBeforeRemove: document.activeElement?.id }
  })
  out.removeOpenDialogFromDom = r
  const page2 = await fresh()
  await page2.click('#openA')
  out.removeOpenDialogFromDomFocus = await page2.evaluate(() => {
    const a = document.getElementById('a')
    const activeBefore = document.activeElement?.id
    a.remove()
    return { activeBefore, activeAfter: document.activeElement?.tagName + '#' + (document.activeElement?.id || '') }
  })
  out.closeRestoresFocus = await (async () => {
    const p = await fresh()
    await p.click('#openA')
    const v = await p.evaluate(() => {
      document.getElementById('a').close()
      return document.activeElement?.id
    })
    await p.close()
    return v
  })()
  await page.close()
  await page2.close()
}

{
  const page = await fresh()
  await page.click('#openP1')
  await page.click('#openP2')
  const both = await page.evaluate(() => ({
    p1: document.getElementById('p1').matches(':popover-open'),
    p2: document.getElementById('p2').matches(':popover-open'),
    outsideFocusable: (() => {
      document.getElementById('outside').focus()
      return document.activeElement.id === 'outside'
    })()
  }))
  await page.keyboard.press('Escape')
  const afterEsc = await page.evaluate(() => ({
    p1: document.getElementById('p1').matches(':popover-open'),
    p2: document.getElementById('p2').matches(':popover-open')
  }))
  out.popoverStack = { both, afterEsc }
  await page.close()
}

{
  const page = await fresh()
  await page.click('#openA')
  const r = await page.evaluate(() => {
    const p = document.createElement('div')
    p.popover = 'auto'
    p.id = 'pInDialog'
    p.textContent = 'popover in dialog'
    p.style.cssText = 'position:fixed;inset:auto;top:280px;left:380px;width:60px;height:60px;margin:0;background:rgb(255,255,0)'
    document.getElementById('a').append(p)
    p.showPopover()
    return { open: p.matches(':popover-open'), top: document.elementFromPoint(400, 300)?.id }
  })
  out.popoverInsideModal = r
  await page.close()
}

console.log(JSON.stringify(out, null, 2))
await browser.close()
