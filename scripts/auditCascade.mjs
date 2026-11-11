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

const styleRuns = [
  { name: 'default', globals: '', filter: () => true },
  { name: 'shadcn', globals: 'style:shadcn', filter: () => true },
  { name: 'compact-workbench-system', globals: 'density:compact;style:workbench', filter: (id) => id.startsWith('system-') }
]

const sameHashes = (left, right) => left.count === right.count && left.hashes.every((hash, index) => hash === right.hashes[index])

const differingLabels = (left, right) => left.hashes.map((hash, index) => (hash === right.hashes[index] ? null : left.labels[index])).filter(Boolean)

export const verdict = async ({ control, controlAgain, loadTreatment, retries = 2 }) => {
  if (!control || !controlAgain) return { status: 'error', noisy: false, labels: [] }

  const noisy = !sameHashes(control, controlAgain)
  const first = await loadTreatment()

  if (first && sameHashes(control, first)) return { status: 'ok', noisy }

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const again = await loadTreatment()

    if (again && sameHashes(control, again)) return { status: 'flicker', noisy }
  }

  if (!first) return { status: 'error', noisy, labels: [] }

  return { status: noisy ? 'noisy-fail' : 'fail', noisy, labels: differingLabels(control, first).slice(0, 6) }
}

export const gateFailures = (results) => results.filter((result) => ['fail', 'noisy-fail', 'error'].includes(result.status))

const serve = (dir) => (route) => {
  const url = new URL(route.request().url())
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'iframe.html'
  const file = join(dir, relative)

  if (!existsSync(file) || statSync(file).isDirectory()) return route.fulfill({ status: 404, body: 'not found' })

  return route.fulfill({ status: 200, body: readFileSync(file), contentType: MIME[extname(file)] ?? 'application/octet-stream' })
}

const snapshot = (page) =>
  page.evaluate(() => {
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

    const elements = [rootElement, ...rootElement.querySelectorAll('*')]
    const hashes = []
    const labels = []

    for (const element of elements) {
      const style = getComputedStyle(element)
      const box = element.getBoundingClientRect()
      let text = [box.x, box.y, box.width, box.height].map((value) => Math.round(value * 2) / 2).join(',')

      for (const name of Array.from(style).sort()) text += `|${name}:${style.getPropertyValue(name)}`
      hashes.push(fnv(text))
      const className = typeof element.className === 'string' && element.className ? `.${element.className.split(' ')[0].slice(0, 30)}` : ''
      labels.push(`${element.tagName.toLowerCase()}${className}`)
    }

    return { count: elements.length, hashes, labels }
  })

const load = async (context, host, id, globals) => {
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
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(400)

    return await snapshot(page)
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

const auditEngine = async (name, control, treatment, stories, run) => {
  const browser = await engines[name].launch({ headless: true })
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } })
  const results = []

  await context.route('http://audit-control.test/**', serve(control))
  await context.route('http://audit-treatment.test/**', serve(treatment))

  try {
    for (const id of stories) {
      const reference = await load(context, 'audit-control.test', id, run.globals)
      const again = await load(context, 'audit-control.test', id, run.globals)

      results.push({ id, ...(await verdict({ control: reference, controlAgain: again, loadTreatment: () => load(context, 'audit-treatment.test', id, run.globals) })) })
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
  const work = mkdtempSync(join(tmpdir(), 'enchase-cascade-audit-'))
  const control = join(work, 'control')
  const treatment = join(work, 'treatment')

  try {
    buildStorybook(control, false)
    buildStorybook(treatment, true)

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

    for (const engine of selected) {
      for (const run of styleRuns) {
        const stories = ids.filter(run.filter).slice(0, limit > 0 ? limit : undefined)

        if (stories.length === 0) continue

        const results = await auditEngine(engine, control, treatment, stories, run)
        const failed = gateFailures(results)
        const key = `${engine}/${run.name}`

        report[key] = {
          stories: results.length,
          ok: results.filter((result) => result.status === 'ok').length,
          flicker: results.filter((result) => result.status === 'flicker').map((result) => result.id),
          noisy: results.filter((result) => result.noisy).map((result) => result.id),
          fail: failed.map(({ id, status, labels }) => ({ id, status, labels }))
        }
        failures += failed.length
        console.log(`${key}: ${results.length} stories, ${report[key].ok} ok, ${report[key].flicker.length} flicker, ${report[key].noisy.length} with unstable control, ${failed.length} outside noise`)
      }
    }

    if (output) writeFileSync(output, JSON.stringify(report, null, 2))

    if (failures > 0) {
      console.error(`${failures} stories differ outside the noise of the control. See the report${output ? ` in ${output}` : ''}.`)
      process.exitCode = 1
    }
  } finally {
    rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main()
