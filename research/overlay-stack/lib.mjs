import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'
import { join, extname } from 'node:path'
const here = fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '')
const dist = here + '/dist'
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' }
export const launch = async () => {
  const browser = await chromium.launch({ args: ['--disable-background-networking','--disable-component-update'], executablePath: '/opt/pw-browsers/chromium' })
  return browser
}
export const openPage = async (browser, query, prefix = '') => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message))
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)) })
  await page.route('http://t.test/**', (route) => {
    const u = new URL(route.request().url())
    const stack = u.pathname.startsWith('/stack/')
    const rel = stack ? u.pathname.slice(6) : u.pathname
    const p = rel === '/' ? '/index.html' : rel
    route.fulfill({ body: readFileSync(join(stack ? dist + '-stack' : dist, p)), contentType: types[extname(p)] ?? 'text/plain' })
  })
  await page.goto('http://t.test/' + prefix + '?' + query)
  await page.waitForSelector('button')
  return page
}
export const state = (page) => page.evaluate(() => {
  const d = (n) => !n ? 'null' : n === document.body ? 'BODY' : n.id ? '#' + n.id : n.tagName.toLowerCase() + (n.getAttribute('aria-label') ? '[' + n.getAttribute('aria-label') + ']' : '')
  return {
    dialogs: document.querySelectorAll('[role=dialog],[role=alertdialog]').length,
    popover: !!document.querySelector('[data-popover]'),
    active: d(document.activeElement),
    hasFocus: document.hasFocus(),
    log: [...window.__log]
  }
})
export const active = (page) => page.evaluate(() => { const n = document.activeElement; return !n ? 'null' : n === document.body ? 'BODY' : n.id ? '#' + n.id : n.tagName.toLowerCase() + (n.getAttribute('aria-label') ? '[' + n.getAttribute('aria-label') + ']' : '') })
export const tabs = async (page, n, key = 'Tab') => { const out = []; for (let i = 0; i < n; i++) { await page.keyboard.press(key); out.push(await active(page)) } return out }
