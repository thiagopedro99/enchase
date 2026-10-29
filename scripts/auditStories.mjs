import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import { cpus, loadavg } from 'node:os'
import { chromium } from 'playwright'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const storybookDirectory = join(root, 'storybook-static')
const require = createRequire(import.meta.url)
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const axeVersion = require('axe-core/package.json').version

const usage = 'usage: node scripts/auditStories.mjs [--jobs=<n>] [--only=<story id prefix>[,<story id prefix>]] [--combo=<theme>:<style>] [--control]'
const optionNames = ['jobs', 'only', 'combo', 'control']
const defaultJobs = 2
const viewport = { width: 1280, height: 800 }
const probeStory = 'components-button--playground'
const settleLimit = 4000
const attempts = 2
const runLimit = 120000

const combinations = [
  { name: 'light:enchase', theme: 'light', style: 'enchase' },
  { name: 'dark:enchase', theme: 'dark', style: 'enchase' },
  { name: 'light:shadcn', theme: 'light', style: 'shadcn' },
  { name: 'dark:shadcn', theme: 'dark', style: 'shadcn' }
]

const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']

const pageRules = [
  { id: 'region', reason: 'a story is a fragment inside the iframe of Storybook, with no main, header or footer around it, so all its content cannot sit inside a landmark' },
  { id: 'landmark-one-main', reason: 'a document rule: the iframe holds one story and not a page, and only the Layout stories render a main' },
  { id: 'page-has-heading-one', reason: 'a document rule: a component story is not a page and has no h1 of its own' },
  { id: 'bypass', reason: 'a document rule: a story has no repeated blocks to skip, and axe leaves it as incomplete on the html node' }
]

const accepted = [
  {
    story: 'components-slider--disabled',
    rule: 'color-contrast',
    selector: '[data-slot="slider-value"]',
    reason: 'RC-01: the value of a disabled Slider is an inactive component, which WCAG 1.4.3 exempts from the contrast minimum'
  }
]

const knownIncomplete = [
  { id: 'bgOverlap', rule: 'color-contrast', messageKeys: ['bgOverlap'], cause: 'the outline of a text field is a fieldset drawn over the control, so axe cannot read the background under the text' },
  { id: 'bgGradient', rule: 'color-contrast', messageKeys: ['bgGradient'], cause: 'the translucent Navbar passes over the gradient of the Layout demo, and axe cannot read a gradient' },
  { id: 'controlsWithinPopup', rule: 'aria-valid-attr-value', messageKeys: ['controlsWithinPopup'], cause: 'aria-controls next to aria-haspopup always needs review in axe, even when the id exists' },
  { id: 'pseudoContent', rule: 'color-contrast', messageKeys: ['pseudoContent'], cause: 'the ::after layer of the hover state sits over the text, and axe does not read pseudo-elements' },
  { id: 'elmPartiallyObscured', rule: 'color-contrast', messageKeys: ['elmPartiallyObscured', 'elmPartiallyObscuring'], cause: 'text partly covered by another element, such as the edge of a panel or a list cut by its scroll' }
]

const openStates = [
  { story: 'components-drawer--long-content', trigger: '#storybook-root [data-slot="button"]', opened: '[role="dialog"]', scrolls: '[data-slot="drawer-body"]', reason: 'RC-02: the scrollable body of a Drawer only exists while it is open' },
  { story: 'components-modal--long-content', trigger: '#storybook-root [data-slot="button"]', opened: '[role="dialog"]', scrolls: '[data-slot="modal-body"]', reason: 'RC-02: the scrollable body of a Modal only exists while it is open' }
]

const control = {
  html: [
    '<!doctype html>',
    '<html lang="en"><head><meta charset="utf-8"><title>Control</title></head><body>',
    '<main>',
    '<h1>Control page</h1>',
    '<p id="low-contrast" style="margin:0;color:#bbbbbb;background:#ffffff;font-size:16px">Text with low contrast</p>',
    '<img id="no-alt" width="20" height="20" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==">',
    '<button id="no-name" type="button" style="min-width:44px;min-height:44px"></button>',
    '<p id="good-contrast" style="margin:0;color:#1a1a1a;background:#ffffff;font-size:16px">Text with good contrast</p>',
    '<img id="with-alt" width="20" height="20" alt="One pixel" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==">',
    '<button id="with-name" type="button" style="min-width:44px;min-height:44px">Save</button>',
    '</main></body></html>'
  ].join('\n'),
  defects: [
    { rule: 'color-contrast', selector: '#low-contrast' },
    { rule: 'image-alt', selector: '#no-alt' },
    { rule: 'button-name', selector: '#no-name' }
  ],
  clean: ['#good-contrast', '#with-alt', '#with-name']
}

const impacts = ['critical', 'serious', 'moderate', 'minor']

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8'
}

class Failure extends Error {
  constructor(message, code = 2) {
    super(message)
    this.code = code
  }
}

const parseOptions = (argv) => {
  const given = Object.fromEntries(
    argv.map((argument) => {
      const [name, ...value] = argument.replace(/^--/, '').split('=')

      return [name, value.length > 0 ? value.join('=') : 'true']
    })
  )
  const unknown = Object.keys(given).filter((name) => !optionNames.includes(name))
  const jobs = Number(given.jobs ?? defaultJobs)
  const combination = combinations.find((candidate) => candidate.name === given.combo)

  if (unknown.length > 0) throw new Failure(`unknown option: ${unknown.join(', ')}\n${usage}`)
  if (!Number.isInteger(jobs) || jobs < 1) throw new Failure(`--jobs needs a whole number from 1 up\n${usage}`)
  if (given.combo !== undefined && !combination) throw new Failure(`--combo needs one of ${combinations.map((candidate) => candidate.name).join(', ')}\n${usage}`)

  return {
    jobs,
    only: (given.only ?? '').split(',').filter((prefix) => prefix !== ''),
    combinations: combination ? [combination] : combinations,
    control: given.control !== undefined
  }
}

const pathnameOf = (request) => {
  try {
    return decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  } catch {
    return null
  }
}

const serve = (directory) =>
  new Promise((resolveServer, rejectServer) => {
    const base = resolve(directory)

    const server = createServer((request, response) => {
      const pathname = pathnameOf(request) ?? '/not-found'
      const file = join(base, pathname.endsWith('/') ? `${pathname}index.html` : pathname)

      if (!file.startsWith(base + sep) || !existsSync(file) || statSync(file).isDirectory()) {
        response.writeHead(404)
        response.end('not found')

        return
      }

      response.writeHead(200, { 'content-type': contentTypes[extname(file)] ?? 'application/octet-stream', 'cache-control': 'public, max-age=3600' })
      createReadStream(file).pipe(response)
    })

    server.once('error', rejectServer)
    server.listen(0, '127.0.0.1', () => resolveServer(server))
  })

const storyState = () => {
  const storyRoot = document.querySelector('#storybook-root')

  if (document.body.classList.contains('sb-show-errordisplay')) return 'error'
  if (storyRoot && storyRoot.childElementCount > 0 && document.body.classList.contains('sb-show-main')) return 'content'

  return false
}

const readLook = () => {
  const style = getComputedStyle(document.documentElement)
  const message = document.querySelector('#error-message')

  return {
    theme: document.documentElement.dataset.theme || null,
    radius: style.getPropertyValue('--enchase-radius-md').trim(),
    background: style.getPropertyValue('--enchase-color-background').trim(),
    error: message ? message.textContent.trim().slice(0, 240) : ''
  }
}

const settleInPage = async ({ limit }) => {
  const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms))
  const frame = () => new Promise((resolveFrame) => requestAnimationFrame(() => resolveFrame()))
  const started = performance.now()
  const finiteAnimations = () =>
    document.getAnimations().filter((animation) => {
      const timing = animation.effect && animation.effect.getComputedTiming()

      return (animation.playState === 'running' || animation.playState === 'pending') && timing && Number.isFinite(timing.endTime)
    })

  await document.fonts.ready.catch(() => undefined)
  await frame()
  await frame()

  while (finiteAnimations().length > 0 && performance.now() - started < limit) {
    await Promise.race([Promise.allSettled(finiteAnimations().map((animation) => animation.finished)), sleep(250)])
    await frame()
  }

  await frame()
  await frame()
}

const auditInPage = async ({ options }) => {
  const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms))
  const clip = (text, max) => (text.length > max ? `${text.slice(0, max)}...` : text)

  const run = async (attempt) => {
    try {
      return await window.axe.run(document, options)
    } catch (error) {
      if (attempt >= 6 || !/already running/i.test(String((error && error.message) || error))) throw error

      await sleep(250)

      return run(attempt + 1)
    }
  }

  const results = await run(0)
  const targetOf = (node) => node.target.map((part) => (Array.isArray(part) ? part.join(' >>> ') : part)).join(' >> ')

  const selectorOf = (node) => {
    const slot = node.element && node.element.getAttribute ? node.element.getAttribute('data-slot') : null

    return slot ? `[data-slot="${slot}"]` : targetOf(node)
  }

  const nodeOut = (rule, node) => {
    const checks = [...node.any, ...node.all, ...node.none]
    const worded = checks.find((check) => check.message)
    const keyed = checks.find((check) => check.data && check.data.messageKey)

    return {
      rule: rule.id,
      impact: node.impact || rule.impact || null,
      selector: selectorOf(node),
      target: targetOf(node),
      message: clip(((worded && worded.message) || node.failureSummary || '').replace(/\s+/g, ' ').trim(), 240),
      messageKey: keyed ? keyed.data.messageKey : null
    }
  }

  const nodesOf = (rules) => rules.flatMap((rule) => rule.nodes.map((node) => nodeOut(rule, node)))

  return { version: window.axe.version, violations: nodesOf(results.violations), incomplete: nodesOf(results.incomplete) }
}

const axeOptions = {
  runOnly: { type: 'tag', values: axeTags },
  rules: { 'color-contrast': { enabled: true }, ...Object.fromEntries(pageRules.map((rule) => [rule.id, { enabled: false }])) },
  resultTypes: ['violations', 'incomplete'],
  elementRef: true
}

const auditPage = async (page) => {
  await page.evaluate(() => {
    try {
      delete window.axe
    } catch {
      window.axe = undefined
    }
  })
  await page.addScriptTag({ content: axeSource })
  await page.evaluate(settleInPage, { limit: settleLimit })

  const result = await page.evaluate(auditInPage, { options: axeOptions })

  if (result.version !== axeVersion) throw new Error(`the page ran axe ${result.version} and not the axe ${axeVersion} of the repository`)

  return result
}

const withTimeout = (promise, ms, label) =>
  new Promise((resolveTimeout, rejectTimeout) => {
    const timer = setTimeout(() => rejectTimeout(new Error(`${label} took more than ${ms} ms`)), ms)

    promise.then(resolveTimeout, rejectTimeout).finally(() => clearTimeout(timer))
  })

const storyUrl = (origin, story, combination) => `${origin}/iframe.html?id=${encodeURIComponent(story)}&viewMode=story&globals=theme:${combination.theme};style:${combination.style};motion:never`

const loadStory = async (page, origin, story, combination) => {
  await page.goto(storyUrl(origin, story, combination), { waitUntil: 'load', timeout: 30000 })

  const state = await page
    .waitForFunction(storyState, null, { timeout: 20000 })
    .then((handle) => handle.jsonValue())
    .catch(() => 'timeout')

  return { state, look: await page.evaluate(readLook) }
}

const openStory = async (page, open) => {
  try {
    await page.locator(open.trigger).first().click({ timeout: 8000 })
    await page.locator(open.opened).first().waitFor({ state: 'visible', timeout: 6000 })
  } catch (error) {
    throw new Error(`could not open the story with ${open.trigger}: ${String(error.message).split('\n')[0]}`)
  }

  return page.evaluate((selector) => {
    const element = document.querySelector(selector)

    return element !== null && element.scrollHeight > element.clientHeight
  }, open.scrolls)
}

const attemptJob = async (context, origin, job) => {
  const page = await context.newPage()

  try {
    const { state, look } = await loadStory(page, origin, job.story, job.combination)

    if (state === 'error') return { job, problem: `Storybook shows an error: ${look.error}`, retry: false }
    if (state !== 'content') return { job, problem: 'the story did not render', retry: true }
    if (look.theme !== job.combination.theme) return { job, problem: `the page is ${look.theme} and the combination asks for ${job.combination.theme}`, retry: false }

    if (job.open && !(await openStory(page, job.open))) return { job, problem: `${job.open.scrolls} does not scroll in the open state, so the story no longer guards: ${job.open.reason}`, retry: false }

    const result = await auditPage(page)

    return { job, violations: result.violations.map((node) => ({ ...node, story: job.story, combination: job.combination.name })), incomplete: result.incomplete }
  } finally {
    await page.close().catch(() => undefined)
  }
}

const runJob = async (context, origin, job, attempt = 1) => {
  const outcome = await withTimeout(attemptJob(context, origin, job), runLimit, `${job.story} ${job.combination.name}`).catch((error) => ({ job, problem: String(error.message).split('\n')[0], retry: true }))

  return outcome.problem !== undefined && outcome.retry && attempt < attempts ? runJob(context, origin, job, attempt + 1) : outcome
}

const runPool = async (jobs, concurrency, work, onDone) => {
  const outcomes = []
  let next = 0
  let done = 0

  const worker = async () => {
    while (next < jobs.length) {
      const index = next

      next += 1
      outcomes[index] = await work(jobs[index])
      done += 1
      onDone(done)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker))

  return outcomes
}

const launch = () =>
  chromium.launch().catch((error) => {
    throw new Failure(`could not start the Chromium of Playwright: ${String(error.message).split('\n')[0]}\nrun npx playwright install chromium`)
  })

const newContext = (browser) => browser.newContext({ viewport, reducedMotion: 'no-preference', deviceScaleFactor: 1 })

const lookProblems = async (context, origin) => {
  const page = await context.newPage()
  const looks = []

  for (const combination of combinations) {
    const { state, look } = await loadStory(page, origin, probeStory, combination)

    if (state !== 'content') throw new Failure(`the probe story ${probeStory} did not render, so the combinations cannot be checked: change probeStory in scripts/auditStories.mjs`)

    looks.push({ combination, look })
  }

  await page.close()

  const lookOf = (name) => looks.find((entry) => entry.combination.name === name).look

  return [
    ...looks.filter(({ combination, look }) => look.theme !== combination.theme).map(({ combination, look }) => `${combination.name} rendered as ${look.theme}`),
    ...(lookOf('light:enchase').background === lookOf('dark:enchase').background ? ['the light and the dark themes have the same background'] : []),
    ...(lookOf('light:enchase').radius === lookOf('light:shadcn').radius ? ['the enchase and the shadcn styles have the same radius'] : [])
  ]
}

const runControl = async () => {
  const browser = await launch()

  try {
    const page = await (await newContext(browser)).newPage()

    await page.setContent(control.html)

    const { violations } = await auditPage(page)
    const detected = control.defects.map((defect) => ({ ...defect, found: violations.some((node) => node.rule === defect.rule && node.target === defect.selector) }))
    const flagged = violations.filter((node) => control.clean.includes(node.target))
    const passed = detected.every((defect) => defect.found) && flagged.length === 0

    console.log(`Control page, axe ${axeVersion}: ${violations.length} violation nodes`)
    detected.forEach((defect) => console.log(`  ${defect.found ? 'detected' : 'MISSED  '} ${defect.rule} on ${defect.selector}`))
    flagged.forEach((node) => console.log(`  FALSE POSITIVE ${node.rule} on ${node.target}`))
    console.log(passed ? `PASS: ${detected.length} of ${detected.length} known defects detected, no false positive` : 'FAIL: the pipeline does not report what it should')

    return passed ? 0 : 1
  } finally {
    await browser.close()
  }
}

const countBy = (items, keyOf) => items.reduce((counts, item) => ({ ...counts, [keyOf(item)]: (counts[keyOf(item)] ?? 0) + 1 }), {})

const listOf = (counts) => (Object.keys(counts).length > 0 ? Object.entries(counts).map(([name, count]) => `${name} ${count}`).join(', ') : 'none')

const duration = (ms) => `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`

const load = () => `${loadavg()[0].toFixed(2)} on ${cpus().length} cores`

const acceptedBy = (node) => accepted.find((entry) => entry.story === node.story && entry.rule === node.rule && entry.selector === node.selector)

const familyOf = (node) => knownIncomplete.find((family) => family.rule === node.rule && family.messageKeys.includes(node.messageKey))

const report = (outcomes, jobs, elapsed, loadStart) => {
  const audited = outcomes.filter((outcome) => outcome.problem === undefined)
  const problems = outcomes.filter((outcome) => outcome.problem !== undefined)
  const violations = audited.flatMap((outcome) => outcome.violations)
  const failing = violations.filter((node) => !acceptedBy(node))
  const incomplete = audited.flatMap((outcome) => outcome.incomplete)
  const known = countBy(incomplete.filter(familyOf), (node) => familyOf(node).id)
  const unknown = countBy(incomplete.filter((node) => !familyOf(node)), (node) => `${node.rule}/${node.messageKey ?? '-'}`)
  const byImpact = countBy(violations, (node) => node.impact)
  const passed = failing.length === 0 && problems.length === 0

  console.log('\nSummary')
  console.log(`  runs: ${jobs.length} (${jobs.filter((job) => !job.open).length} closed, ${jobs.filter((job) => job.open).length} open), audited ${audited.length}, not audited ${problems.length}`)
  console.log(`  violations: ${violations.length} nodes in ${new Set(violations.map((node) => node.story)).size} stories, ${violations.length - failing.length} accepted, ${failing.length} failing`)
  console.log(`    by impact: ${impacts.map((impact) => `${impact} ${byImpact[impact] ?? 0}`).join(', ')}`)
  console.log(`    by rule: ${listOf(countBy(violations, (node) => node.rule))}`)
  console.log(`  accepted entries (${accepted.length}):`)
  accepted.forEach((entry) => console.log(`    ${entry.story} ${entry.rule} ${entry.selector}: matched ${violations.filter((node) => acceptedBy(node) === entry).length} nodes. ${entry.reason}`))
  console.log(`  incomplete (needs review, never fails the audit): ${incomplete.length} nodes in ${audited.filter((outcome) => outcome.incomplete.length > 0).length} runs`)
  knownIncomplete.forEach((family) => console.log(`    ${family.id} ${known[family.id] ?? 0} nodes: ${family.cause}`))
  console.log(`    not in the known families: ${listOf(unknown)}`)
  console.log(`  open states audited besides the closed one: ${[...new Set(jobs.filter((job) => job.open).map((job) => job.open))].map((state) => `${state.story} (${state.reason})`).join('; ') || 'none'}`)
  console.log(`  rules switched off by name: ${pageRules.map((rule) => rule.id).join(', ')}`)
  pageRules.forEach((rule) => console.log(`    ${rule.id}: ${rule.reason}`))
  console.log(`  time: ${duration(elapsed)}, ${(jobs.length / (elapsed / 1000)).toFixed(2)} runs per second, load average ${loadStart} at the start and ${load()} at the end`)

  if (failing.length > 0) {
    console.log('\nFailing nodes (story | combination | rule (impact) | selector | message)')
    failing.forEach((node) => console.log(`  ${node.story} | ${node.combination} | ${node.rule} (${node.impact}) | ${node.selector}${node.selector === node.target ? '' : ` | axe target ${node.target}`} | ${node.message}`))
  }

  if (problems.length > 0) {
    console.log('\nRuns that could not be audited (story | combination | state | problem)')
    problems.forEach((outcome) => console.log(`  ${outcome.job.story} | ${outcome.job.combination.name} | ${outcome.job.open ? 'open' : 'closed'} | ${outcome.problem}`))
  }

  console.log(passed ? '\nPASS: no violation outside the accepted list' : `\nFAIL: ${failing.length} violation nodes outside the accepted list, ${problems.length} runs not audited`)

  return passed ? 0 : 1
}

const runAudit = async (options) => {
  const indexFile = join(storybookDirectory, 'index.json')

  if (!existsSync(indexFile)) throw new Failure('storybook-static is missing or has no index.json: run npm run build-storybook first')

  const stories = Object.values(JSON.parse(readFileSync(indexFile, 'utf8')).entries)
    .filter((entry) => entry.type === 'story' && (options.only.length === 0 || options.only.some((prefix) => entry.id.startsWith(prefix))))
    .map((entry) => entry.id)
    .sort()

  if (stories.length === 0) throw new Failure(`no story matches --only=${options.only.join(',')}`)

  const jobs = stories.flatMap((story) => {
    const open = openStates.find((state) => state.story === story)

    return options.combinations.flatMap((combination) => [{ story, combination }, ...(open ? [{ story, combination, open }] : [])])
  })

  console.log(`Stories accessibility audit: ${stories.length} stories, ${options.combinations.length} combinations, ${jobs.length} runs, ${options.jobs} pages at a time`)
  console.log(`axe ${axeVersion}, tags ${axeTags.join(' ')}, color-contrast on, motion never, ${viewport.width}x${viewport.height}`)

  const browser = await launch()
  const server = await serve(storybookDirectory).catch(async (error) => {
    await browser.close()

    throw error
  })

  try {
    const origin = `http://127.0.0.1:${server.address().port}`
    const context = await newContext(browser)
    const loadStart = load()
    const started = Date.now()

    console.log(`Chromium ${browser.version()}, load average ${loadStart}`)

    const problems = options.combinations.length === combinations.length ? await lookProblems(context, origin) : []

    if (problems.length > 0) throw new Failure(`the combinations do not change the page, so the audit would repeat one combination: ${problems.join('; ')}`, 1)

    const outcomes = await runPool(
      jobs,
      options.jobs,
      (job) => runJob(context, origin, job),
      (done) => {
        if (done % 100 === 0 || done === jobs.length) console.log(`  ${done}/${jobs.length} runs, ${duration(Date.now() - started)}`)
      }
    )

    return report(outcomes, jobs, Date.now() - started, loadStart)
  } finally {
    await browser.close()
    server.close()
  }
}

const main = async () => {
  const options = parseOptions(process.argv.slice(2))

  return options.control ? runControl() : runAudit(options)
}

main().then(
  (code) => {
    process.exitCode = code
  },
  (error) => {
    console.error(error instanceof Failure ? error.message : error)
    process.exitCode = error instanceof Failure ? error.code : 2
  }
)
