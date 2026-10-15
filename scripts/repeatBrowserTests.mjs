import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const browserFlag = args.indexOf('--browser')
const browser = browserFlag === -1 ? 'chromium' : (args[browserFlag + 1] ?? 'chromium')
const count = args.find((arg, index) => /^\d+$/.test(arg) && index !== browserFlag + 1)
const runs = Number(count ?? 10)
const windows = process.platform === 'win32'
const npx = windows ? 'npx.cmd' : 'npx'
const npm = windows ? 'npm.cmd' : 'npm'

const build = spawnSync(npm, ['run', 'build:lib'], { stdio: 'inherit', shell: windows })
if (build.status !== 0) process.exit(build.status ?? 1)

const failures = []

for (let run = 1; run <= runs; run += 1) {
  const result = spawnSync(npx, ['vitest', 'run', '--config', 'vitest.browser.config.ts', ...(browser === 'chromium' ? [] : ['--no-file-parallelism'])], { encoding: 'utf8', shell: windows, env: { ...process.env, ENCHASE_BROWSER: browser } })
  const output = `${result.stdout}\n${result.stderr}`
  const failed = [...output.matchAll(/FAIL\s+\|\w+\|\s+(.+)/g)].map((match) => match[1].trim())
  const summary = output.match(/Tests\s+(.+)/)?.[1]?.trim() ?? 'no summary'

  console.log(`run ${run}/${runs}: ${result.status === 0 ? 'ok' : 'FAILED'} (${summary})`)

  if (result.status !== 0) {
    mkdirSync('.vitest/failures', { recursive: true })
    writeFileSync(`.vitest/failures/${browser}-run-${run}.log`, output)
    failures.push({ run, failed })
    for (const name of new Set(failed)) console.log(`  ${name}`)
  }
}

console.log(`${runs - failures.length}/${runs} runs passed`)
process.exit(failures.length === 0 ? 0 : 1)
