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
  { label: 'CloseIcon', source: "export { CloseIcon } from 'enchase/icons'\n", maxBytes: 4096 },
  { label: 'AllIcons', source: "export * from 'enchase/icons'\n", maxBytes: 8192 },
  { label: 'Button', source: "export { Button } from 'enchase'\n", maxBytes: 12288 },
  { label: 'Drawer', source: "export { Drawer } from 'enchase'\n", maxBytes: 22528 },
  { label: 'CheckboxGroup', source: "export { CheckboxGroup } from 'enchase'\n", maxBytes: 14336 },
  { label: 'SegmentedControl', source: "export { SegmentedControl } from 'enchase'\n", maxBytes: 14336 },
  { label: 'Slider', source: "export { Slider } from 'enchase'\n", maxBytes: 16384 },
  { label: 'Table', source: "export { Table } from 'enchase'\n", maxBytes: 21504 },
  { label: 'Menu', source: "export { Menu } from 'enchase'\n", maxBytes: 36864 },
  { label: 'Combobox', source: "export { Combobox } from 'enchase'\n", maxBytes: 43008 },
  { label: 'DatePicker', source: "export { DatePicker } from 'enchase'\n", maxBytes: 53248 },
  { label: 'ColorModeProvider', source: "export { ColorModeProvider } from 'enchase'\n", maxBytes: 40960, styles: [], density: true },
  { label: 'createTheme', source: "export { createTheme } from 'enchase/theme'\n", maxBytes: 32768, styles: [] },
  { label: 'enchase style', source: "export { enchase } from 'enchase/styles/enchase'\n", maxBytes: 16384, styles: ['enchase'] },
  { label: 'shadcn style', source: "export { shadcn } from 'enchase/styles/shadcn'\n", maxBytes: 34816, styles: ['shadcn'] },
  { label: 'workbench style', source: "export { workbench } from 'enchase/styles/workbench'\n", maxBytes: 35840, styles: ['workbench'] },
  { label: 'ColorModeProvider with shadcn', source: "export { ColorModeProvider } from 'enchase'\nexport { shadcn } from 'enchase/styles/shadcn'\n", maxBytes: 59392, styles: ['shadcn'], density: true }
]

const hookNames = `import { readFileSync } from 'node:fs'

const { exports } = JSON.parse(readFileSync(new URL('./node_modules/enchase/package.json', import.meta.url), 'utf8'))
const names = Object.keys(exports).filter((key) => key.startsWith('./styles/')).map((key) => key.slice('./styles/'.length))
const records = (style) => [style.hooks, style.colorHooks, style.light?.hooks, style.dark?.hooks, style.density?.compact?.hooks]
const theme = new Set(readFileSync(new URL('./node_modules/enchase/dist-lib/theme.css', import.meta.url), 'utf8').match(/--enchase-[a-z0-9-]+(?=:)/g))
const hooks = {}

for (const name of names) {
  const style = (await import('enchase/styles/' + name))[name]

  hooks[name] = [...new Set(records(style).flatMap((record) => Object.keys(record ?? {})))].filter((hook) => !theme.has(hook))
}

console.log(JSON.stringify(hooks))
`

const devOnlyMessages = ['below the minimum contrast', 'should stay at']

const bundle = async (project, entry, define = {}) => {
  const result = await build({
    root: project,
    configFile: false,
    logLevel: 'silent',
    define,
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

  writeFileSync(join(consumer, 'hooks.mjs'), hookNames)

  const styleHooks = JSON.parse(execFileSync(process.execPath, ['hooks.mjs'], { cwd: consumer }).toString())
  const failures = []

  const styleNames = Object.keys(styleHooks)
  const hookCount = Object.values(styleHooks).flat().length

  if (hookCount < 50) failures.push(`the styles of the package name only ${hookCount} hooks, too few to tell whether they leak into the core`)

  for (const name of styleNames) {
    if (!budgets.some(({ styles = [] }) => styles.includes(name))) failures.push(`no budget bundles the ${name} style: add one to the budgets of this script`)
  }

  for (const { label, source, maxBytes, styles, density } of budgets) {
    const entry = join(consumer, `${label.replaceAll(' ', '-')}.js`)

    writeFileSync(entry, source)

    const code = await bundle(consumer, entry)
    const bytes = Buffer.byteLength(code)

    console.log(`${label}: ${bytes} bytes minified, ${gzipSync(code).length} bytes gzip, budget ${maxBytes}`)

    if (bytes < 200) failures.push(`${label} bundled to ${bytes} bytes, so the import did not resolve`)
    else if (bytes > maxBytes) failures.push(`${label} is ${bytes} bytes, over the ${maxBytes} byte budget`)

    if (density === true && !code.includes('data-density')) failures.push(`${label} does not carry the compact density block of the theme css, so the budget does not measure the code that writes the theme`)
    if (density !== true && code.includes('data-density')) failures.push(`${label} carries the compact density block of the theme css, so it leaks into code that does not write the theme`)

    if (styles === undefined) continue

    const asked = new Set(styles.flatMap((name) => styleHooks[name]))
    const present = new Set(code.match(/--enchase-[a-z0-9-]+/g))

    for (const [name, hooks] of Object.entries(styleHooks)) {
      const carried = hooks.filter((hook) => present.has(hook))
      const leaked = carried.filter((hook) => !asked.has(hook))

      if (!styles.includes(name) && leaked.length > 0) failures.push(`${label} carries ${leaked.length} hooks of the ${name} style, so its data leaks into code that did not ask for it`)
      if (styles.includes(name) && carried.length < hooks.length * 0.9) failures.push(`${label} carries ${carried.length} of the ${hooks.length} hooks of the ${name} style, so the check for a leak cannot be trusted`)
    }
  }

  const providerEntry = join(consumer, 'ColorModeProvider.js')
  const development = await bundle(consumer, providerEntry)
  const production = await bundle(consumer, providerEntry, { 'process.env.NODE_ENV': '"production"' })

  console.log(`ColorModeProvider with NODE_ENV production: ${Buffer.byteLength(production)} bytes minified, against ${Buffer.byteLength(development)} bytes with the environment left to the bundler`)

  if (!devOnlyMessages.every((message) => development.includes(message))) failures.push('the warnings of the theme are not in the development bundle of the ColorModeProvider, so the production check below cannot be trusted')

  const leaked = devOnlyMessages.filter((message) => production.includes(message))

  if (leaked.length > 0) failures.push(`the production bundle of the ColorModeProvider still carries the warnings of the theme (${leaked.map((message) => `"${message}"`).join(', ')}): the check of process.env.NODE_ENV no longer lets the bundler drop them`)

  if (failures.length > 0) throw new Error(`a single import pulls in too much code:\n${failures.map((line) => `  - ${line}`).join('\n')}`)
} finally {
  rmSync(workdir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 })
}
