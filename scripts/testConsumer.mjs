import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const workdir = mkdtempSync(join(tmpdir(), 'enchase-consumer-'))
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })

const entry = `import { Accordion, Alert, Badge, Button, ButtonLink, Grid, Layout, Link, Modal, Navbar, NumberInput, Pagination, RadioGroup, Switch, Table, Tabs, Textarea, ToastProvider, UIProvider, useToast, useUIConfig } from 'enchase'
import type { AccordionProps, AlertProps, BadgeProps, ButtonLinkProps, GridProps, LayoutProps, NavbarProps, NumberInputFormat, NumberInputProps, PaginationProps, RadioGroupProps, SidebarSection, SwitchProps, TableColumn, TableProps, TabsProps, TextareaProps, UILabels } from 'enchase'
import { ChevronDownIcon, CloseIcon } from 'enchase/icons'
import type { IconProps } from 'enchase/icons'
import { createTheme, validateTheme } from 'enchase/theme'
import type { RadiusOverrides, ShapePreset, ThemeInput } from 'enchase/theme'
import { en, ptBR } from 'enchase/locales'
import type { Locale } from 'enchase/locales'
import 'enchase/styles.css'
import 'enchase/styles.layer.css'
import 'enchase/theme.css'

const sections: SidebarSection[] = [{ id: 'main', items: [{ id: 'home', label: 'Home', href: '/' }] }]
const labels: Partial<UILabels> = { closeModal: 'Close', previousPage: 'Back', increaseValue: 'More' }
const locale: Locale = ptBR
const props: LayoutProps = { children: null, navigationSections: sections, translucent: true }
const docsLink: ButtonLinkProps = { href: '/docs', native: true, externalIcon: false }
const navbarProps: NavbarProps = { logo: 'Acme', sections, translucent: true, actions: <Button>Start</Button> }
const gridProps: GridProps = { columns: { xs: 1, md: 2, xxl: 4 }, gap: '1rem', centerLastRow: true }
const fixedGridProps: GridProps = { columns: 3, minColumnWidth: '12rem' }
const alertProps: AlertProps = { variant: 'warning', title: 'Heads up', onClose: () => undefined }
const badgeProps: BadgeProps = { variant: 'success', size: 'sm' }
const areaProps: TextareaProps = { label: 'Message', rows: 4, resize: 'none' }
const switchProps: SwitchProps = { label: 'Notifications', defaultChecked: true }
const radioProps: RadioGroupProps = { label: 'Plan', options: [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro', disabled: true }], defaultValue: 'free', orientation: 'horizontal', onValueChange: () => undefined }
const tabsProps: TabsProps = { ariaLabel: 'Sections', items: [{ value: 'a', label: 'One', content: 'First' }, { value: 'b', label: 'Two', content: 'Second' }], activation: 'manual', onValueChange: () => undefined }
const accordionProps: AccordionProps = { items: [{ value: 'a', title: 'One', content: 'First' }], multiple: true, defaultValue: ['a'], headingLevel: 2, onValueChange: () => undefined }
const iconProps: IconProps = { size: 20, title: 'Close', className: 'mine' }
const priceFormat: NumberInputFormat = { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }
const numberProps: NumberInputProps = { label: 'Price', min: 0, max: 100, step: 0.5, largeStep: 5, defaultValue: 10, formatOptions: priceFormat, name: 'price', onValueChange: (value: number | null) => void value }
const pagerProps: PaginationProps = { pageCount: 12, defaultPage: 3, siblingCount: 2, boundaryCount: 1, size: 'sm', onPageChange: (page: number) => void page }
type Order = { id: string; total: number }
const orderColumns: TableColumn<Order>[] = [{ key: 'id', header: 'Order', rowHeader: true }, { key: 'total', header: 'Total', align: 'end', cell: (row) => row.total.toFixed(2) }]
const tableProps: TableProps<Order> = { columns: orderColumns, rows: [{ id: '#1', total: 10 }], caption: 'Orders', striped: true, size: 'sm', getRowKey: (row) => row.id }

const Language = () => {
  const { locale } = useUIConfig()

  return <span>{locale.toUpperCase()}</span>
}

const Toaster = () => {
  const toast = useToast()

  return <Button onClick={() => toast.success('Saved')}>{en.messages.confirm}</Button>
}

export const App = () => (
  <UIProvider locale={locale} labels={labels}>
    <ToastProvider>
      <Layout {...props}>
        <Toaster />
        <Navbar {...navbarProps} />
        <Grid {...gridProps}>
          <p>One</p>
          <p>Two</p>
          <p>Three</p>
        </Grid>
        <Grid {...fixedGridProps} />
        <ButtonLink {...docsLink}>Docs</ButtonLink>
        <Alert {...alertProps}>Saved</Alert>
        <Badge {...badgeProps}>New</Badge>
        <Textarea {...areaProps} />
        <Switch {...switchProps} />
        <RadioGroup {...radioProps} />
        <Tabs {...tabsProps} />
        <Accordion {...accordionProps} />
        <Language />
        <CloseIcon {...iconProps} />
        <ChevronDownIcon />
        <NumberInput {...numberProps} />
        <NumberInput label="Empty" value={null} onValueChange={() => undefined} steppers={false} />
        <Pagination {...pagerProps} />
        <Table {...tableProps} />
        <Table<Order> columns={orderColumns} rows={[]} empty="No orders" />
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

const shape: ShapePreset = 'soft'
const radius: RadiusOverrides = { button: '1rem', control: '0.5rem', xl: '2rem' }
const shaped: ThemeInput = { brand: '#0f766e', shape, radius }
export const theme = createTheme(shaped)
export const buttonRadius: string = theme.base.borderRadius.button
export const focusWidth: string = theme.base.focus.width
export const strongBorder: string = theme.base.border.widthStrong
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
