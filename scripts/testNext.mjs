import { execFileSync, spawn } from 'node:child_process'
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const windows = process.platform === 'win32'
const workdir = mkdtempSync(join(tmpdir(), 'enchase-next-'))
const port = 3100 + Math.floor(Math.random() * 400)
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'inherit', shell: windows })

const expectations = [
  ['the shell rendered by a server component', 'Server component page'],
  ['the badge of a server component', 'data-slot="badge"'],
  ['the alert of a server component', 'data-slot="alert"'],
  ['the textarea of a server component', 'data-slot="textarea-field"'],
  ['the layout markup in the wide default', 'data-layout="auto"'],
  ['the permanent sidebar', 'data-slot="layout-sidebar"'],
  ['the color mode script in the head', 'localStorage.getItem'],
  ['the theme variables inside the css layer', '@layer enchase-theme'],
  ['the dark fallback without javascript', 'prefers-color-scheme: dark'],
  ['the generated responsive rules', "[data-slot='layout'][data-layout='auto']"]
]

const cssExpectations = [
  ['the layer order from the layered stylesheet', '@layer enchase-theme, enchase-base, enchase'],
  ['the components inside the enchase layer', '@layer enchase'],
  ['the static theme variables', '--enchase-color-primary']
]

const waitFor = async (url) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      return await fetch(url)
    } catch {
      await new Promise((resolveWait) => setTimeout(resolveWait, 500))
    }
  }

  throw new Error(`next start did not answer on ${url}`)
}

let server

try {
  const packed = execFileSync(npm, ['pack', '--pack-destination', workdir, '--json'], { cwd: root, shell: windows }).toString()
  const tarball = join(workdir, JSON.parse(packed)[0].filename)
  const app = join(workdir, 'app')

  cpSync(join(root, 'scripts', 'next-consumer'), app, { recursive: true })
  writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'enchase-next-consumer', private: true, version: '0.0.0' }, null, 2))

  run(npm, ['install', '--no-audit', '--no-fund', tarball, 'next@15', 'react@19', 'react-dom@19', '@types/react@19', '@types/react-dom@19', '@types/node@22', 'typescript@5.8'], app)
  run(process.execPath, [join(app, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'], app)

  server = spawn(process.execPath, [join(app, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', String(port)], { cwd: app, stdio: 'inherit' })

  const response = await waitFor(`http://127.0.0.1:${port}/`)
  const html = await response.text()
  const missing = expectations.filter(([, needle]) => !html.includes(needle))
  const stylesheets = [...html.matchAll(/href="([^"]+\.css)"/g)].map((match) => match[1])
  const css = (await Promise.all(stylesheets.map(async (href) => (await fetch(new URL(href, `http://127.0.0.1:${port}/`))).text()))).join('\n')

  for (const [label, needle] of cssExpectations) if (!css.includes(needle)) missing.push([label])

  if (response.status !== 200) throw new Error(`unexpected status ${response.status}`)
  if (missing.length > 0) throw new Error(`the server html is missing:\n${missing.map(([label]) => `  - ${label}`).join('\n')}`)

  console.log(`next consumer rendered ${expectations.length + cssExpectations.length} server checks on port ${port}`)
} finally {
  if (server && server.exitCode === null) {
    const exited = new Promise((resolveExit) => server.once('exit', resolveExit))

    if (windows) execFileSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' })
    else server.kill()

    await exited
  }

  rmSync(workdir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 })
}
