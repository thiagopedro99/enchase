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
  ['the switch of a server component', 'data-slot="switch-track"'],
  ['the radio group of a server component', 'data-slot="radio-group-control"'],
  ['the tabs of a server component', 'data-slot="tabs-tab"'],
  ['the accordion of a server component', 'data-slot="accordion-trigger"'],
  ['the translucent navbar of a server component', 'data-translucent'],
  ['the translucent app bar of the layout next to the navbar', 'data-translucent=""', 2],
  ['the grid with columns by breakpoint of a server component', 'data-responsive'],
  ['the grid that centers its last row of a server component', 'data-center-last'],
  ['the columns of the first breakpoint on the grid', '--enchase-grid-n-xs:1'],
  ['the generated rules of the grid columns', "[data-slot='grid'][data-responsive]"],
  ['the number input of a server component', 'data-slot="number-input-field"'],
  ['an icon of enchase/icons in a server component', 'data-icon="close"'],
  ['a directional icon of enchase/icons in a server component', 'data-directional'],
  ['the formatted number of a server component', 'value="$12.50"'],
  ['the pagination of a server component', 'data-slot="pagination-page"'],
  ['the table of a server component', 'data-slot="table-cell"'],
  ['the layout markup in the wide default', 'data-layout="auto"'],
  ['the permanent sidebar', 'data-slot="layout-sidebar"'],
  ['the color mode script in the head', 'localStorage.getItem'],
  ['the theme variables inside the css layer', '@layer enchase-theme'],
  ['the dark fallback without javascript', 'prefers-color-scheme: dark'],
  ['the radius of the shape preset in the theme variables', '--enchase-radius-button: 0.75rem'],
  ['the control radius of the shape preset in the theme variables', '--enchase-radius-control: 0.75rem'],
  ['the focus ring width in the theme variables', '--enchase-focus-width: 2px'],
  ['the offset of the focus ring inside a container in the theme variables', '--enchase-focus-offset-inset: -2px'],
  ['the strong border width in the theme variables', '--enchase-border-width-strong: 2px'],
  ['the pressed state layer in the theme variables', '--enchase-state-pressed: 0.1'],
  ['the disabled state layer in the theme variables', '--enchase-state-disabled-content: 0.38'],
  ['the halo of the selection controls in the theme variables', '--enchase-halo-size-switch: 0.5rem'],
  ['the regular target size in the theme variables', '--enchase-hit-size: 40px'],
  ['the large target size in the theme variables', '--enchase-hit-size-lg: 44px'],
  ['the normal line height in the theme variables', '--enchase-line-height-normal: 1.5'],
  ['the control letter spacing in the theme variables', '--enchase-letter-spacing-control: 0.01em'],
  ['the generated responsive rules', "[data-slot='layout'][data-layout='auto']"]
]

const forbidden = [
  ['the label placement of a style on the page without one', 'data-label-placement'],
  ['a hook of a style on the page without one', '--enchase-input-height:']
]

const styledExpectations = [
  ['the page of the layout that takes a style', 'Styled server page'],
  ['the label above the field, which comes from the defaults of the style', 'data-label-placement="stacked"'],
  ['the control height of the style in the theme variables', '--enchase-control-height-md: 2.25rem'],
  ['the target size of the style in the theme variables', '--enchase-hit-size: 2rem'],
  ['the strong border width of the style in the theme variables', '--enchase-border-width-strong: 1px'],
  ['the corners of the style in the theme variables', '--enchase-radius-button: 0.5rem'],
  ['the neutral surface of the style in the theme variables', '--enchase-color-surface-container: #F5F5F5'],
  ['a hook of the style on the root', '--enchase-button-font-weight: var(--enchase-font-weight-medium)'],
  ['a hook of the style that cites a color, inside the mode blocks', '--enchase-button-border-color-outline: var(--enchase-color-border)'],
  ['the theme variables inside the css layer', '@layer enchase-theme']
]

const cssExpectations = [
  ['the layer order from the layered stylesheet', '@layer enchase-theme, enchase-base, enchase'],
  ['the components inside the enchase layer', '@layer enchase'],
  ['the static theme variables', '--enchase-color-primary']
]

const occurrences = (text, needle) => text.split(needle).length - 1

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
  const missing = expectations.filter(([, needle, minimum = 1]) => occurrences(html, needle) < minimum)
  const stylesheets = [...html.matchAll(/href="([^"]+\.css)"/g)].map((match) => match[1])
  const css = (await Promise.all(stylesheets.map(async (href) => (await fetch(new URL(href, `http://127.0.0.1:${port}/`))).text()))).join('\n')

  for (const [label, needle] of cssExpectations) if (!css.includes(needle)) missing.push([label])
  for (const [label, needle] of forbidden) if (html.includes(needle)) missing.push([`no ${label}`])

  const styled = await fetch(`http://127.0.0.1:${port}/styled`)
  const styledHtml = await styled.text()

  for (const [label, needle] of styledExpectations) if (!styledHtml.includes(needle)) missing.push([label])

  if (response.status !== 200) throw new Error(`unexpected status ${response.status}`)
  if (styled.status !== 200) throw new Error(`unexpected status ${styled.status} on /styled`)
  if (missing.length > 0) throw new Error(`the server html is missing:\n${missing.map(([label]) => `  - ${label}`).join('\n')}`)

  console.log(`next consumer rendered ${expectations.length + cssExpectations.length + forbidden.length + styledExpectations.length} server checks on port ${port}`)
} finally {
  if (server && server.exitCode === null) {
    const exited = new Promise((resolveExit) => server.once('exit', resolveExit))

    if (windows) execFileSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' })
    else server.kill()

    await exited
  }

  rmSync(workdir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 })
}
