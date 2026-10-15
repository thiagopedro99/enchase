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

process.stdout.write(output)

if (result.status !== 0) {
  mkdirSync('.vitest/failures', { recursive: true })
  writeFileSync(`.vitest/failures/${browser}.log`, output)
}

process.exit(result.status ?? 1)
