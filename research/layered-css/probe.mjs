import { readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { renderButton } from './render.mjs'

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8')
const vars = `:root { --enchase-color-primary: rgb(0, 0, 255); --enchase-color-on-primary: rgb(255, 255, 255); --enchase-space-sm: 8px; --enchase-space-lg: 24px; --enchase-radius-full: 9999px; }`
const themeLayered = `@layer enchase { ${vars} }`
const reset = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } button { font-family: inherit; cursor: pointer; border: none; background: none; }`
const userCss = `.my-btn { background-color: rgb(255, 0, 0); }`
const whereify = (css) => css.replace(/(\._button_[a-z0-9]+_\d+)((?:\[data-[^\]]+\])+)/g, '$1:where($2)')

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage()
const probe = async (label, styles, markup) => {
  const head = styles.map((css) => `<style>${css}</style>`).join('')
  await page.setContent(`<!doctype html><html><head>${head}</head><body>${markup}</body></html>`)
  const r = await page.$eval('#b', (el) => { const s = getComputedStyle(el); return { display: s.display, minHeight: s.minHeight, bg: s.backgroundColor, border: s.borderTopWidth + ' ' + s.borderTopStyle, padL: s.paddingLeft } })
  console.log(label.padEnd(62), JSON.stringify(r))
}

const plain = await renderButton('dist')
const mine = await renderButton('dist', { className: 'my-btn' })
const patternBtn = await renderButton('dist-pattern')
const css = read('./dist/styles.css')
const layered = read('./dist/styles.layer.css')

console.log('Chromium', browser.version())
console.log('-- Q1 collision: Button with hashed classes vs enchase-[local]')
await probe('default hashed (_button_xxx)', [vars, css], plain)
await probe("generateScopedName: 'enchase-[local]'", [vars, read('./dist-pattern/styles.css')], patternBtn)
await probe('function form enchase-Button-button-hash', [vars, read('./dist-fn/styles.css')], await renderButton('dist-fn'))

console.log('-- Q2 runtime GlobalStyles (unlayered <style>) + lib CSS')
await probe('styles.css + unlayered reset', [vars, css, reset], plain)
await probe('styles.layer.css + unlayered reset  (BROKEN)', [vars, layered, reset], plain)
await probe('styles.layer.css + reset inside @layer enchase (fix)', [vars, `@layer enchase { ${reset} }`, layered], plain)

console.log('-- Q1 user className override (.my-btn {background red}), user CSS after lib')
await probe('styles.css, user after', [vars, css, userCss], mine)
await probe('styles.css with :where() variants, user after', [vars, whereify(css), userCss], mine)
await probe('styles.css with :where() variants, user BEFORE lib', [vars, userCss, whereify(css)], mine)
await probe('styles.layer.css, user BEFORE lib', [vars, userCss, layered], mine)

console.log('-- Q2 theme variables vs layers')
await probe('unlayered runtime vars, user @layer app override', [vars, layered, `@layer enchase, app; @layer app { :root { --enchase-color-primary: rgb(0, 128, 0); } }`], plain)
await probe('layered runtime vars, user @layer app override', [themeLayered, layered, `@layer enchase, app; @layer app { :root { --enchase-color-primary: rgb(0, 128, 0); } }`], plain)
await probe('layered runtime vars + unlayered styles.css', [themeLayered, css], plain)
await browser.close()
