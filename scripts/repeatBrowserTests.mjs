import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const runs = Number(process.argv[2] ?? 10)
const windows = process.platform === 'win32'
const npx = windows ? 'npx.cmd' : 'npx'
const npm = windows ? 'npm.cmd' : 'npm'

const build = spawnSync(npm, ['run', 'build:lib'], { stdio: 'inherit', shell: windows })
if (build.status !== 0) process.exit(build.status ?? 1)

const failures = []

for (let run = 1; run <= runs; run += 1) {
  const result = spawnSync(npx, ['vitest', 'run', '--config', 'vitest.browser.config.ts'], { encoding: 'utf8', shell: windows })
  const output = `${result.stdout}\n${result.stderr}`
  const failed = [...output.matchAll(/FAIL\s+\|chromium\|\s+(.+)/g)].map((match) => match[1].trim())
  const summary = output.match(/Tests\s+(.+)/)?.[1]?.trim() ?? 'no summary'

  console.log(`run ${run}/${runs}: ${result.status === 0 ? 'ok' : 'FAILED'} (${summary})`)

  if (result.status !== 0) {
    mkdirSync('.vitest/failures', { recursive: true })
    writeFileSync('.vitest/failures/run-' + run + '.log', output)
    failures.push({ run, failed })
    for (const name of new Set(failed)) console.log(`  ${name}`)
  }
}

console.log(`${runs - failures.length}/${runs} runs passed`)
process.exit(failures.length === 0 ? 0 : 1)
