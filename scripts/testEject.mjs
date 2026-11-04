import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const workdir = mkdtempSync(join(tmpdir(), 'enchase-eject-'))
const contractFolder = join(root, '.eject-contract')
const run = (command, args, cwd, env = {}) => execFileSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32', env: { ...process.env, ...env } })
const capture = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'pipe', shell: process.platform === 'win32' }).toString()
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const kit = JSON.parse(readFileSync(join(root, 'eject', 'index.json'), 'utf8'))
const names = Object.keys(kit.components).sort()
const contract = ['Button', 'Tabs', 'Menu']
const folderOf = (name) => dirname(kit.components[name]).replace(/^components\//, '')
const importOf = (name) => `./enchase/${kit.components[name].replace(/\.tsx$/, '').replace(/\/index$/, '')}`
const failures = []
const expect = (condition, message) => condition || failures.push(message)

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

  run(npm, ['install', '--no-audit', '--no-fund', tarball, 'react@19', 'react-dom@19', '@types/react@19', '@types/react-dom@19', 'typescript@5.8', `vite@${manifest.devDependencies.vite}`, `@vitejs/plugin-react@${manifest.devDependencies['@vitejs/plugin-react']}`], consumer)

  const listed = capture(command, ['eject', '--list'], consumer)

  expect(names.every((name) => listed.includes(`${name} (`)), 'enchase eject --list does not print every component of the kit')

  const first = capture(command, ['eject', ...names, '--dir', 'src/enchase'], consumer)

  expect(first.includes('ejected'), 'enchase eject did not say what it did')

  const again = capture(command, ['eject', 'Button', '--dir', 'src/enchase'], consumer)

  expect(again.includes('0 files written'), 'ejecting a component twice must not write anything the second time')

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

  console.log(`eject: ${names.length} components copied by the installed command, compiled with tsc and bundled by vite, ${contract.join(', ')} rendered on the server inside the UIProvider of the package, and the jsdom specs of ${contract.join(', ')} pass against the copies`)
} finally {
  rmSync(workdir, { recursive: true, force: true })
  if (existsSync(contractFolder)) rmSync(contractFolder, { recursive: true, force: true })
}
