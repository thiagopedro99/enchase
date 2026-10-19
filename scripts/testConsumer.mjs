import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const workdir = mkdtempSync(join(tmpdir(), 'enchase-consumer-'))
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })

const entry = `import { Button, ButtonLink, Layout, Link, Modal, ToastProvider, UIProvider, useToast } from 'enchase'
import type { ButtonLinkProps, LayoutProps, SidebarSection, UILabels } from 'enchase'
import { createTheme, validateTheme } from 'enchase/theme'
import { en, ptBR } from 'enchase/locales'
import type { Locale } from 'enchase/locales'
import 'enchase/styles.css'
import 'enchase/styles.layer.css'
import 'enchase/theme.css'

const sections: SidebarSection[] = [{ id: 'main', items: [{ id: 'home', label: 'Home', href: '/' }] }]
const labels: Partial<UILabels> = { closeModal: 'Close' }
const locale: Locale = ptBR
const props: LayoutProps = { children: null, navigationSections: sections }
const docsLink: ButtonLinkProps = { href: '/docs', native: true }

const Toaster = () => {
  const toast = useToast()

  return <Button onClick={() => toast.success('Saved')}>{en.messages.confirm}</Button>
}

export const App = () => (
  <UIProvider locale={locale} labels={labels}>
    <ToastProvider>
      <Layout {...props}>
        <Toaster />
        <ButtonLink {...docsLink}>Docs</ButtonLink>
        <Link href="/about#team" native>
          About
        </Link>
        <Modal isOpen onClose={() => undefined} title="Title">
          Body
        </Modal>
      </Layout>
    </ToastProvider>
  </UIProvider>
)

export const theme = createTheme({ brand: '#0f766e' })
export const problems = validateTheme(theme)
`

const consumerPackage = { name: 'enchase-consumer', private: true, type: 'module', version: '0.0.0' }

const consumerConfig = {
  compilerOptions: {
    target: 'ES2022',
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    moduleResolution: 'bundler',
    jsx: 'react-jsx',
    strict: true,
    skipLibCheck: false,
    noEmit: true,
    types: []
  },
  include: ['index.tsx', 'css.d.ts']
}

try {
  const packed = execFileSync(npm, ['pack', '--pack-destination', workdir, '--json'], { cwd: root, shell: process.platform === 'win32' }).toString()
  const tarball = join(workdir, JSON.parse(packed)[0].filename)
  const consumer = join(workdir, 'app')

  mkdirSync(consumer)
  writeFileSync(join(consumer, 'package.json'), JSON.stringify(consumerPackage, null, 2))
  writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify(consumerConfig, null, 2))
  writeFileSync(join(consumer, 'css.d.ts'), "declare module '*.css'\n")
  writeFileSync(join(consumer, 'index.tsx'), entry)

  run(npm, ['install', '--no-audit', '--no-fund', tarball, 'react@19', 'react-dom@19', '@types/react@19', '@types/react-dom@19', 'typescript@5.8'], consumer)
  run(process.execPath, [join(consumer, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.json'], consumer)

  const installed = JSON.parse(readFileSync(join(consumer, 'node_modules', 'enchase', 'package.json'), 'utf8'))
  console.log(`consumer compiled against enchase@${installed.version} with skipLibCheck: false`)
} finally {
  rmSync(workdir, { recursive: true, force: true })
}
