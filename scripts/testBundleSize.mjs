import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const windows = process.platform === 'win32'
const npm = windows ? 'npm.cmd' : 'npm'
const workdir = mkdtempSync(join(tmpdir(), 'enchase-size-'))
const env = { ...process.env, npm_config_dry_run: 'false' }
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'inherit', shell: windows, env })

const budgets = [
  { label: 'Icon', source: "export { Icon } from 'enchase'\n", maxBytes: 4096 },
  { label: 'Button', source: "export { Button } from 'enchase'\n", maxBytes: 12288 }
]

const bundle = async (project, entry) => {
  const result = await build({
    root: project,
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      minify: true,
      lib: { entry, formats: ['es'] },
      rolldownOptions: { external: [/^react($|\/)/, /^react-dom($|\/)/] }
    }
  })
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) => item.output)

  return outputs
    .filter((item) => item.type === 'chunk')
    .map((item) => item.code)
    .join('\n')
}

try {
  const packed = execFileSync(npm, ['pack', '--pack-destination', workdir, '--json'], { cwd: root, shell: windows, env }).toString()
  const tarball = join(workdir, JSON.parse(packed)[0].filename)
  const consumer = join(workdir, 'app')

  mkdirSync(consumer)
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'enchase-size', private: true, type: 'module', version: '0.0.0' }, null, 2))

  run(npm, ['install', '--no-audit', '--no-fund', tarball, 'react@19', 'react-dom@19'], consumer)

  const failures = []

  for (const { label, source, maxBytes } of budgets) {
    const entry = join(consumer, `${label}.js`)

    writeFileSync(entry, source)

    const code = await bundle(consumer, entry)
    const bytes = Buffer.byteLength(code)

    console.log(`${label}: ${bytes} bytes minified, ${gzipSync(code).length} bytes gzip, budget ${maxBytes}`)

    if (bytes < 200) failures.push(`${label} bundled to ${bytes} bytes, so the import did not resolve`)
    else if (bytes > maxBytes) failures.push(`${label} is ${bytes} bytes, over the ${maxBytes} byte budget`)
  }

  if (failures.length > 0) throw new Error(`a single import pulls in too much code:\n${failures.map((line) => `  - ${line}`).join('\n')}`)
} finally {
  rmSync(workdir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 })
}
