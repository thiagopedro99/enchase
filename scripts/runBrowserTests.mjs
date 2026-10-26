import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const browser = process.argv[2] ?? 'chromium'
const extra = process.argv.slice(3)
const windows = process.platform === 'win32'
const npx = windows ? 'npx.cmd' : 'npx'
const npm = windows ? 'npm.cmd' : 'npm'

if (!['chromium', 'firefox', 'webkit'].includes(browser)) {
  console.error(`unknown browser: ${browser}`)
  process.exit(2)
}

const build = spawnSync(npm, ['run', 'build:lib'], { stdio: 'inherit', shell: windows })
if (build.status !== 0) process.exit(build.status ?? 1)

const result = spawnSync(npx, ['vitest', 'run', '--config', 'vitest.browser.config.ts', ...(browser === 'chromium' ? [] : ['--no-file-parallelism']), ...extra], {
  encoding: 'utf8',
  shell: windows,
  maxBuffer: 64 * 1024 * 1024,
  env: { ...process.env, ENCHASE_BROWSER: browser }
})
const output = `${result.stdout}\n${result.stderr}`
const late = [...new Set([...output.matchAll(/dependency optimized: (\S+)/g)].map((match) => match[1]))]
const status = result.status ?? 1

process.stdout.write(output)

if (late.length > 0) console.error(`\nVite optimized ${late.join(', ')} while the tests were running and reloaded the page. Add ${late.length > 1 ? 'them' : 'it'} to optimizeDeps.include in vitest.browser.config.ts.`)

if (status !== 0 || late.length > 0) {
  mkdirSync('.vitest/failures', { recursive: true })
  writeFileSync(`.vitest/failures/${browser}.log`, output)
}

process.exit(late.length > 0 ? 1 : status)
