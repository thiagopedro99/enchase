import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const workdir = mkdtempSync(join(tmpdir(), 'enchase-eject-'))
const contractFolder = join(root, '.eject-contract')
const run = (command, args, cwd, env = {}) => execFileSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32', env: { ...process.env, ...env } })
const capture = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'pipe', shell: process.platform === 'win32' }).toString()
const installedVersion = (name) => JSON.parse(readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8')).version
const kit = JSON.parse(readFileSync(join(root, 'eject', 'index.json'), 'utf8'))
const names = Object.keys(kit.components).sort()
const contract = ['Button', 'Tabs', 'Menu']
const folderOf = (name) => dirname(kit.components[name]).replace(/^components\//, '')
const importOf = (name) => `./enchase/${kit.components[name].replace(/\.tsx$/, '').replace(/\/index$/, '')}`
const failures = []
const expect = (condition, message) => condition || failures.push(message)

expect(readdirSync(join(root, 'eject', 'files'), { recursive: true }).filter((name) => /\.(css|tsx?)$/.test(name) && readFileSync(join(root, 'eject', 'files', name), 'utf8').includes(':not(_')).length === 0, 'the kit must carry the css of the sources as they are written: the ladder belongs to the package, and a copy is code that the user reads and owns')

const consumerConfig = {
  compilerOptions: {
    target: 'ES2022',
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    moduleResolution: 'bundler',
    jsx: 'react-jsx',
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    skipLibCheck: true,
    noEmit: true,
    types: []
  },
  include: ['src']
}

const mainSource = `import { createRoot } from 'react-dom/client'
import { UIProvider } from 'enchase'
import 'enchase/styles.css'
import 'enchase/theme.css'
${names.map((name, index) => `import * as component${index} from '${importOf(name)}'`).join('\n')}

Object.assign(window, { ejected: [${names.map((_, index) => `component${index}`).join(', ')}] })

createRoot(document.getElementById('root')!).render(<UIProvider>ejected</UIProvider>)
`

const smokeSource = `import { renderToString } from 'react-dom/server'
import { UIProvider } from 'enchase'
import { Button } from '${importOf('Button')}'
import { Menu } from '${importOf('Menu')}'
import { Pagination } from '${importOf('Pagination')}'
import { Tabs } from '${importOf('Tabs')}'

export const render = () =>
  renderToString(
    <UIProvider labels={{ previousPage: 'Voltar' }}>
      <Button>Save</Button>
      <Tabs ariaLabel="Sections" items={[{ value: 'a', label: 'One', content: 'First' }, { value: 'b', label: 'Two', content: 'Second' }]} />
      <Menu label="Actions" items={[{ id: 'a', label: 'One' }]}>
        <Button>Open</Button>
      </Menu>
      <Pagination pageCount={3} />
    </UIProvider>
  )
`

const smokeRunner = `import { createServer } from 'vite'

const server = await createServer({ root: process.cwd(), appType: 'custom', server: { middlewareMode: true }, logLevel: 'error' })

try {
  const { render } = await server.ssrLoadModule('/src/smoke.tsx')

  process.stdout.write(render())
} finally {
  await server.close()
}
`

try {
  const packed = execFileSync(npm, ['pack', '--pack-destination', workdir, '--json'], { cwd: root, shell: process.platform === 'win32' }).toString()
  const tarball = join(workdir, JSON.parse(packed)[0].filename)
  const consumer = join(workdir, 'app')
  const command = join(consumer, 'node_modules', '.bin', process.platform === 'win32' ? 'enchase.cmd' : 'enchase')

  mkdirSync(join(consumer, 'src'), { recursive: true })
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'enchase-eject-consumer', private: true, type: 'module', version: '0.0.0' }, null, 2))
  writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify(consumerConfig, null, 2))
  writeFileSync(join(consumer, 'vite.config.ts'), "import react from '@vitejs/plugin-react'\n\nexport default { plugins: [react()] }\n")
  writeFileSync(join(consumer, 'index.html'), '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n')
  writeFileSync(join(consumer, 'src', 'css.d.ts'), "declare module '*.css'\n")
  writeFileSync(join(consumer, 'smoke.mjs'), smokeRunner)

  run(npm, ['install', '--no-audit', '--no-fund', tarball, 'react@19', 'react-dom@19', '@types/react@19', '@types/react-dom@19', 'typescript@5.8', `vite@${installedVersion('vite')}`, `@vitejs/plugin-react@${installedVersion('@vitejs/plugin-react')}`], consumer)

  const listed = capture(command, ['eject', '--list'], consumer)

  expect(names.every((name) => listed.includes(`${name} (`)), 'enchase eject --list does not print every component of the kit')

  const first = capture(command, ['eject', ...names, '--dir', 'src/enchase'], consumer)

  expect(first.includes('ejected'), 'enchase eject did not say what it did')

  const folder = join(consumer, 'src', 'enchase')
  const installed = JSON.parse(readFileSync(join(consumer, 'node_modules', 'enchase', 'package.json'), 'utf8'))
  const recorded = JSON.parse(readFileSync(join(folder, 'enchase.eject.json'), 'utf8'))
  const copied = new Set(names.flatMap((name) => kit.entries[kit.components[name]].files))

  expect(readFileSync(join(folder, 'LICENSE'), 'utf8') === readFileSync(join(root, 'LICENSE'), 'utf8'), 'the license of the package must be next to the copies')
  expect(recorded.version === installed.version && recorded.license === 'MIT', 'the manifest must carry the version and the license of the package')
  expect(names.every((name) => recorded.components[name] === installed.version), 'the manifest must list every component that was ejected, with its version')
  expect(Object.keys(recorded.files).length === copied.size && Object.values(recorded.files).every((hash) => /^[0-9a-f]{16}$/.test(hash)), 'the manifest must hold a hash for every file that was copied')

  const hooks = ['Tabs', 'Pagination', 'SegmentedControl', 'Accordion', 'Slider']
  const withoutHook = hooks.filter((name) => !copied.has(`components/common/${name}/use${name}.ts`))
  const importingHooks = readdirSync(folder, { recursive: true }).filter((file) => /\.tsx?$/.test(file) && /enchase\/(headless|experimental)/.test(readFileSync(join(folder, file), 'utf8')))

  expect(withoutHook.length === 0, `the copy of ${withoutHook.join(', ')} must carry its hook as a file of its own`)
  expect(importingHooks.length === 0, `a copy must not import enchase/headless or enchase/experimental, because the code that you ejected has to be yours, hooks included: ${importingHooks.join(', ')}`)

  const again = capture(command, ['eject', 'Button', '--dir', 'src/enchase'], consumer)

  expect(again.includes('0 files written'), 'ejecting a component twice must not write anything the second time')
  expect(JSON.stringify(JSON.parse(readFileSync(join(folder, 'enchase.eject.json'), 'utf8'))) === JSON.stringify(recorded), 'ejecting a component again must keep what the manifest says of the others')

  const button = join(consumer, 'src', 'enchase', kit.components.Button)
  const original = readFileSync(button, 'utf8')

  writeFileSync(button, `${original}\nexport const mine = 1\n`)

  const refused = (() => {
    try {
      capture(command, ['eject', 'Button', '--dir', 'src/enchase'], consumer)

      return false
    } catch (error) {
      return error.status === 1
    }
  })()

  expect(refused && readFileSync(button, 'utf8').endsWith('export const mine = 1\n'), 'a file that you changed must stop the command, and be left as it is')

  capture(command, ['eject', 'Button', '--dir', 'src/enchase', '--force'], consumer)

  expect(readFileSync(button, 'utf8') === original, '--force must put the file of the library back')

  const outcome = (args) => {
    try {
      return { code: 0, output: capture(command, args, consumer) }
    } catch (error) {
      return { code: error.status, output: `${error.stdout}${error.stderr}` }
    }
  }

  const compare = ['eject', '--diff', 'Button', '--dir', 'src/enchase']
  const unchanged = outcome(compare)

  expect(unchanged.code === 0 && unchanged.output.includes('the copy is the library'), '--diff must say that a copy that nobody touched is the library')

  const types = join(folder, 'components', 'common', 'Button', 'types.ts')
  const typesOriginal = readFileSync(types, 'utf8')

  writeFileSync(types, `${typesOriginal}\nexport const mine = 1\n`)

  const yours = outcome(compare)

  expect(yours.code === 0 && /yours\s+components\/common\/Button\/types\.ts/.test(yours.output), '--diff must name the file that you changed, and exit with 0 while the library has not changed anything')

  const styles = join(folder, 'components', 'common', 'Button', 'styles.module.css')
  const libraryStyles = join(consumer, 'node_modules', 'enchase', 'eject', 'files', 'components', 'common', 'Button', 'styles.module.css')
  const stylesOriginal = readFileSync(styles, 'utf8')

  writeFileSync(libraryStyles, `${stylesOriginal}\n.extra { color: red; }\n`)

  const changed = outcome(compare)

  expect(changed.code === 1 && /library\s+components\/common\/Button\/styles\.module\.css/.test(changed.output) && changed.output.includes('+.extra { color: red; }'), '--diff must show what the library changed, and exit with 1')

  writeFileSync(styles, `${stylesOriginal}\n.extra { color: blue; }\n`)

  const both = outcome(compare)

  expect(both.code === 1 && /both\s+components\/common\/Button\/styles\.module\.css/.test(both.output), '--diff must tell a file that both sides changed')

  writeFileSync(libraryStyles, stylesOriginal)
  writeFileSync(styles, stylesOriginal)
  writeFileSync(types, typesOriginal)

  const elsewhere = outcome(['eject', '--diff', 'Button', '--dir', 'src/other'])

  expect(elsewhere.code === 1 && elsewhere.output.includes('does not exist'), '--diff must refuse a folder where nothing was ejected')
  expect(outcome(compare).output.includes('the copy is the library'), 'the copies must be the library again after the changes of the test are undone')

  writeFileSync(join(consumer, 'src', 'main.tsx'), mainSource)
  writeFileSync(join(consumer, 'src', 'smoke.tsx'), smokeSource)

  run(process.execPath, [join(consumer, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.json'], consumer)
  run(process.execPath, [join(consumer, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'], consumer)

  const html = capture(process.execPath, ['smoke.mjs'], consumer)

  expect(html.includes('data-slot="button"'), 'the ejected Button did not render its part')
  expect(html.includes('role="tablist"') && html.includes('role="tab"'), 'the ejected Tabs did not render its roles')
  expect(html.includes('aria-haspopup'), 'the ejected Menu did not render its trigger')
  expect(html.includes('aria-label="Voltar"'), 'the ejected Pagination did not read the labels of the UIProvider of the package')

  rmSync(contractFolder, { recursive: true, force: true })
  run(process.execPath, [join(root, 'bin', 'enchase.mjs'), 'eject', ...contract, '--dir', '.eject-contract'], root)
  run(process.execPath, [join(root, 'node_modules', 'vitest', 'vitest.mjs'), 'run', '--config', 'vitest.eject.config.ts', ...contract.map((name) => `src/tests/components/${folderOf(name)}`)], root, { ENCHASE_EJECT_FOLDERS: contract.map(folderOf).join(',') })

  if (failures.length > 0) throw new Error(`the eject command is not as it should be:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`)

  console.log(`eject: ${names.length} components copied by the installed command, compiled with tsc and bundled by vite, ${contract.join(', ')} rendered on the server inside the UIProvider of the package, and the jsdom specs of ${contract.join(', ')} pass against the copies, and the copies carry their hooks (${hooks.join(', ')}) as files of their own, with no import of enchase/experimental`)
} finally {
  rmSync(workdir, { recursive: true, force: true })
  if (existsSync(contractFolder)) rmSync(contractFolder, { recursive: true, force: true })
}
