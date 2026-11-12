import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { chromium, firefox, webkit } from 'playwright'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const windows = process.platform === 'win32'
const engines = { chromium, firefox, webkit }
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon'
}
const INTERACTIVE = '#storybook-root a[href], #storybook-root button, #storybook-root input, #storybook-root select, #storybook-root textarea, #storybook-root label, #storybook-root [role="tab"], #storybook-root [role="switch"], #storybook-root [role="checkbox"]'

const styleRuns = [
  { name: 'default', globals: '', filter: () => true },
  { name: 'shadcn', globals: 'style:shadcn', filter: () => true },
  { name: 'compact-workbench-system', globals: 'density:compact;style:workbench', filter: (id) => id.startsWith('system-') }
]

const sameHashes = (left, right) => left.count === right.count && left.hashes.every((hash, index) => hash === right.hashes[index])

const indicesOf = (left, right) => left.hashes.map((hash, index) => (hash === right.hashes[index] ? -1 : index)).filter((index) => index !== -1)

export const directionOf = (control, treatment, reference) => {
  if (control === undefined || treatment === undefined || reference === undefined) return 'other'
  if (control !== reference && treatment === reference) return 'lib-wins'
  if (control === reference && treatment !== reference) return 'page-wins'

  return 'other'
}

export const directionsOf = ({ control, treatment, reference, differing }) => {
  const aligned = Boolean(reference) && reference.count === control.count && treatment.count === control.count
  const directions = differing.map((index) => ({
    label: control.labels[index],
    direction: aligned ? directionOf(control.hashes[index], treatment.hashes[index], reference.hashes[index]) : 'other'
  }))
  const counts = { 'lib-wins': 0, 'page-wins': 0, other: 0 }

  for (const item of directions) counts[item.direction] += 1

  return { counts, directions }
}

export const verdict = async ({ control, controlAgain, loadTreatment, retries = 2 }) => {
  if (!control || !controlAgain) return { status: 'error', noisy: false, labels: [], differing: [] }

  const noisy = !sameHashes(control, controlAgain)
  const matches = (shot) => sameHashes(control, shot) || sameHashes(controlAgain, shot)
  const first = await loadTreatment()

  if (first && matches(first)) return { status: 'ok', noisy }

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const again = await loadTreatment()

    if (again && matches(again)) return { status: 'flicker', noisy }
  }

  if (!first) return { status: 'error', noisy, labels: [], differing: [] }

  const differing = indicesOf(control, first)

  return { status: noisy ? 'noisy-fail' : 'fail', noisy, labels: differing.map((index) => control.labels[index]).slice(0, 6), differing, treatment: first }
}

export const gateFailures = (results) => results.filter((result) => ['fail', 'noisy-fail', 'error'].includes(result.status))

export const acceptedFlip = (result) => Boolean(result.directions) && result.directions.counts['page-wins'] === 0 && result.directions.counts.other === 0 && result.directions.counts['lib-wins'] > 0

export const pageGateFailures = (results) => gateFailures(results).filter((result) => !acceptedFlip(result))

const summarized = (results) => {
  const counts = { 'lib-wins': 0, 'page-wins': 0, other: 0 }

  for (const result of results) {
    if (!result.directions) continue

    for (const name of Object.keys(counts)) counts[name] += result.directions.counts[name]
  }

  return counts
}

export const compareFlips = (actual, expected) => ({
  missing: expected.filter((id) => !actual.includes(id)),
  unexpected: actual.filter((id) => !expected.includes(id))
})

const serve = (dir) => (route) => {
  const url = new URL(route.request().url())
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'iframe.html'
  const file = join(dir, relative)

  if (!existsSync(file) || statSync(file).isDirectory()) return route.fulfill({ status: 404, body: 'not found' })

  return route.fulfill({ status: 200, body: readFileSync(file), contentType: MIME[extname(file)] ?? 'application/octet-stream' })
}

const snapshot = (page) =>
  page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      if (animation.effect?.getComputedTiming?.().iterations === Infinity) {
        animation.pause()
        animation.currentTime = 0
      }
    }

    const fnv = (text) => {
      let hash = 0x811c9dc5

      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index)
        hash = Math.imul(hash, 0x01000193)
      }

      return (hash >>> 0).toString(16)
    }
    const rootElement = document.getElementById('storybook-root')

    if (!rootElement) return null

    const hashes = []
    const labels = []
    const describe = (element) => {
      const className = typeof element.className === 'string' && element.className ? `.${element.className.split(' ')[0].slice(0, 30)}` : ''

      return `${element.tagName.toLowerCase()}${className}`
    }
    const add = (element, pseudo) => {
      const style = getComputedStyle(element, pseudo || null)
      let text = pseudo ? '' : [element.getBoundingClientRect()].map((box) => [box.x, box.y, box.width, box.height].map((value) => Math.round(value * 2) / 2).join(',')).join('')

      for (const name of Array.from(style).sort()) text += `|${name}:${style.getPropertyValue(name)}`
      hashes.push(fnv(text))
      labels.push(`${describe(element)}${pseudo}`)
    }

    for (const element of [rootElement, ...rootElement.querySelectorAll('*')]) {
      add(element, '')
      add(element, '::before')
      add(element, '::after')
    }

    return { count: hashes.length, hashes, labels }
  })

const animationsDone = () =>
  Promise.race([Promise.all(document.getAnimations().filter((animation) => animation.effect?.getComputedTiming?.().iterations !== Infinity).map((animation) => animation.finished.catch(() => undefined))), new Promise((resolve) => setTimeout(resolve, 2500))])

const settled = (handle) =>
  handle.evaluate((node) => {
    const freeze = () => {
      for (const animation of document.getAnimations()) {
        if (animation.effect?.getComputedTiming?.().iterations === Infinity) {
          animation.pause()
          animation.currentTime = 0
        }
      }
    }

    freeze()

    return Promise.race([Promise.all(document.getAnimations().filter((animation) => animation.effect?.getComputedTiming?.().iterations !== Infinity).map((animation) => animation.finished.catch(() => undefined))), new Promise((resolve) => setTimeout(resolve, 2500))]).then(
      () =>
        new Promise((resolve) => {
          const read = () => {
            freeze()

            return ['', '::before', '::after']
              .map((pseudo) => {
                const style = getComputedStyle(node, pseudo || null)

                return Array.from(style).map((name) => style.getPropertyValue(name)).join('|')
              })
              .join('#')
          }
          let previous = read()
          let stable = 0
          let frames = 0

          const step = () => {
            frames += 1

            const next = read()

            stable = next === previous ? stable + 1 : 0
            previous = next

            if (stable >= 3 || frames >= 120) resolve(true)
            else requestAnimationFrame(step)
          }

          requestAnimationFrame(step)
        })
    )
  })

const labelled = async (page, state) => {
  const result = await snapshot(page)

  return result && { count: result.count, hashes: result.hashes, labels: result.labels.map((label) => `${state}:${label}`) }
}

const combine = (parts) => ({
  count: parts.reduce((sum, part) => sum + part.count, 0),
  hashes: parts.flatMap((part) => part.hashes),
  labels: parts.flatMap((part) => part.labels)
})

const statesOf = async (page, limit, skipped) => {
  const parts = []
  const candidates = page.locator(INTERACTIVE)
  const total = await candidates.count()
  let hovered = 0

  for (let index = 0; index < total && hovered < limit; index += 1) {
    const element = candidates.nth(index)

    if (!(await element.isVisible().catch(() => false))) continue

    const reached = await element.hover({ timeout: 2000 }).then(
      () => true,
      () => false
    )

    if (!reached) {
      skipped.push(`hover${index}`)
      continue
    }

    hovered += 1
    await settled(element).catch(() => undefined)
    parts.push(await labelled(page, `hover${index}`))
    await page.mouse.down()
    await settled(element).catch(() => undefined)
    parts.push(await labelled(page, `press${index}`))
    await page.mouse.up()
    await page.mouse.move(0, 0)
  }

  await page.evaluate(() => document.activeElement?.blur())

  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press('Tab')

    const focused = await page.evaluateHandle(() => document.activeElement)
    const element = focused.asElement()

    if (element) await settled(element).catch(() => undefined)
    parts.push(await labelled(page, `focus${index}`))
  }

  return parts.filter(Boolean)
}

const load = async (context, host, id, globals, options) => {
  const page = await context.newPage()
  const query = `id=${id}&viewMode=story${globals ? `&globals=${globals}` : ''}`

  try {
    await page.goto(`http://${host}/iframe.html?${query}`, { waitUntil: 'load', timeout: 30000 })
    await page.waitForFunction(
      () => {
        const element = document.getElementById('storybook-root')

        return Boolean(element) && element.children.length > 0
      },
      null,
      { timeout: 20000 }
    )

    await page.evaluate(() => {
      for (const type of ['click', 'auxclick']) {
        document.addEventListener(
          type,
          (event) => {
            event.preventDefault()
            event.stopPropagation()
          },
          true
        )
      }
    })

    if (options.pageCss) await page.addStyleTag({ content: options.pageCss })

    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(400)
    await page.evaluate(animationsDone)

    const rest = await snapshot(page)

    if (!rest || options.states === 0) return rest

    return combine([rest, ...(await statesOf(page, options.states, options.skipped))])
  } catch {
    return null
  } finally {
    await page.close()
  }
}

const buildStorybook = (output, ladder) => {
  execFileSync(npx, ['storybook', 'build', '-o', output, '--quiet'], {
    cwd: root,
    stdio: 'inherit',
    shell: windows,
    env: { ...process.env, ENCHASE_CASCADE_LADDER: ladder ? 'on' : 'off' }
  })
}

const ladderIn = (dir) =>
  readdirSync(dir, { recursive: true })
    .filter((name) => name.endsWith('.css'))
    .reduce((sum, name) => sum + (readFileSync(join(dir, name), 'utf8').split(':not(_').length - 1), 0)

const auditEngine = async (name, control, treatment, stories, run, options) => {
  const browser = await engines[name].launch({ headless: true })
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } })
  const results = []

  await context.route('http://audit-control.test/**', serve(control))
  await context.route('http://audit-treatment.test/**', serve(treatment))

  try {
    for (const id of stories) {
      const skipped = []
      const scoped = { ...options, skipped, states: options.deep && new RegExp(options.deep).test(id) ? 60 : options.states }
      const reference = await load(context, 'audit-control.test', id, run.globals, scoped)
      const again = await load(context, 'audit-control.test', id, run.globals, scoped)
      const { treatment, differing, ...outcome } = await verdict({ control: reference, controlAgain: again, loadTreatment: () => load(context, 'audit-treatment.test', id, run.globals, scoped) })
      const directions = options.pageCss && treatment && differing ? directionsOf({ control: reference, treatment, reference: await load(context, 'audit-control.test', id, run.globals, { ...scoped, pageCss: '' }), differing }) : undefined

      results.push({ id, ...outcome, ...(directions ? { directions } : {}), skipped })
    }
  } finally {
    await browser.close()
  }

  return results
}

const main = async () => {
  const args = process.argv.slice(2)
  const option = (name, fallback) => {
    const index = args.indexOf(name)

    return index === -1 ? fallback : args[index + 1]
  }
  const selected = option('--engines', 'chromium,firefox,webkit').split(',')
  const filter = option('--filter', null)
  const limit = Number(option('--limit', '0'))
  const output = option('--out', null)
  const states = Number(option('--states', '0'))
  const styleOnly = option('--style', null)
  const pageFile = option('--page-css', null)
  const deep = option('--deep', null)
  const expectFile = option('--expect', null)
  const controlDir = option('--control-dir', null)
  const treatmentDir = option('--treatment-dir', null)
  const pageCss = pageFile ? readFileSync(pageFile, 'utf8') : ''
  const expected = expectFile ? JSON.parse(readFileSync(expectFile, 'utf8')) : null
  const work = mkdtempSync(join(tmpdir(), 'enchase-cascade-audit-'))
  const control = controlDir ?? join(work, 'control')
  const treatment = treatmentDir ?? join(work, 'treatment')

  if (expected && (expected.filter !== filter || expected.states !== states || Boolean(expected.page) !== Boolean(pageFile))) {
    throw new Error(`the expectation was recorded with other options: filter ${expected.filter}, states ${expected.states}, page ${Boolean(expected.page)}`)
  }

  try {
    if (!controlDir) buildStorybook(control, false)
    if (!treatmentDir) buildStorybook(treatment, true)

    if (ladderIn(control) !== 0 || ladderIn(treatment) === 0) {
      throw new Error(`the builds do not differ as expected: the control has ${ladderIn(control)} ladder selectors and the treatment has ${ladderIn(treatment)}`)
    }

    const index = JSON.parse(readFileSync(join(control, 'index.json'), 'utf8'))
    const ids = Object.values(index.entries)
      .filter((entry) => entry.type === 'story')
      .map((entry) => entry.id)
      .filter((id) => !filter || new RegExp(filter).test(id))
    const report = {}
    let failures = 0
    let mismatches = 0

    for (const engine of selected) {
      for (const run of styleRuns.filter((item) => !styleOnly || item.name === styleOnly)) {
        const stories = ids.filter(run.filter).slice(0, limit > 0 ? limit : undefined)

        if (stories.length === 0) continue

        const results = await auditEngine(engine, control, treatment, stories, run, { states, pageCss, deep })
        const flagged = gateFailures(results)
        const failed = pageCss ? pageGateFailures(results) : flagged
        const key = `${engine}/${run.name}`
        const flips = flagged.map((result) => result.id).sort()

        report[key] = {
          stories: results.length,
          ok: results.filter((result) => result.status === 'ok').length,
          flicker: results.filter((result) => result.status === 'flicker').map((result) => result.id),
          noisy: results.filter((result) => result.noisy).map((result) => result.id),
          skipped: results.filter((result) => result.skipped.length > 0).map((result) => ({ id: result.id, hovers: result.skipped })),
          directions: pageCss ? summarized(results) : undefined,
          accepted: pageCss ? flagged.filter(acceptedFlip).map((result) => result.id) : undefined,
          fail: failed.map(({ id, status, labels, directions }) => ({ id, status, labels, directions: directions?.directions }))
        }
        failures += failed.length
        console.log(`${key}: ${results.length} stories, ${report[key].ok} ok, ${report[key].flicker.length} flicker, ${report[key].noisy.length} with unstable control, ${flagged.length} differ${pageCss ? ` (${report[key].directions['lib-wins']} lib wins, ${report[key].directions['page-wins']} page wins, ${report[key].directions.other} other)` : ''}, ${failed.length} outside ${pageCss ? 'the accepted directions' : 'noise'}`)

        if (expected) {
          const { missing, unexpected } = compareFlips(flips, [...(expected.fails[key] ?? [])].sort())

          if (missing.length > 0 || unexpected.length > 0) {
            mismatches += 1
            console.error(`${key}: the flips changed. missing ${missing.join(', ') || 'none'}; unexpected ${unexpected.join(', ') || 'none'}`)
          }
        }
      }
    }

    if (output) writeFileSync(output, JSON.stringify(report, null, 2))

    if (failures > 0) {
      console.error(`${failures} stories differ outside the ${pageCss ? 'accepted directions' : 'noise of the control'}. See the report${output ? ` in ${output}` : ''}.`)
      process.exitCode = 1
    }

    if (expected && mismatches > 0) {
      console.error(`${mismatches} engine and style runs do not match the expected flips.`)
      process.exitCode = 1
    }
  } finally {
    rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main()
