import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const workdir = mkdtempSync(join(tmpdir(), 'enchase-consumer-'))
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })
const readmeSnippets = ['README.md', 'HEADLESS.md'].flatMap((file) => [...readFileSync(join(root, file), 'utf8').matchAll(/```tsx\n([\s\S]*?)```/g)].map((match) => match[1]))
const recipe = readFileSync(join(root, 'src', 'docs', 'components', 'FormRecipe', 'index.tsx'), 'utf8')
const formPackages = ['react-hook-form', 'zod', '@hookform/resolvers']
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const formVersions = Object.fromEntries(formPackages.map((name) => [name, manifest.devDependencies?.[name]]))
const unpinned = formPackages.filter((name) => !/^\d+\.\d+\.\d+$/.test(formVersions[name] ?? ''))

const entry = `import { Accordion, Alert, Avatar, Badge, Breadcrumbs, Button, ButtonLink, Card, CardButton, CardLink, ColorModeProvider, ConfirmModal, Container, Divider, Drawer, Flex, Grid, Icon, InlineLoading, Input, Layout, Link, Loading, Menu, Modal, Navbar, NumberInput, Pagination, Popover, Progress, RadioGroup, Select, Sidebar, Skeleton, Switch, Table, Tabs, Tag, Textarea, ThemeToggle, ToastProvider, Tooltip, UIProvider, VisuallyHidden, useToast, useUIConfig } from 'enchase'
import type { AccordionProps, AlertProps, BadgeProps, ButtonLinkProps, CardButtonProps, CardLinkProps, CardProps, ContainerProps, FlexProps, GridProps, LayoutProps, NavbarProps, NumberInputFormat, NumberInputProps, PaginationProps, RadioGroupProps, SidebarSection, SwitchProps, TableColumn, TableProps, TabsProps, TextareaProps, UILabels } from 'enchase'
import { ChevronDownIcon, CloseIcon } from 'enchase/icons'
import type { IconProps } from 'enchase/icons'
import { enchase as enchaseStyle } from 'enchase/styles/enchase'
import { shadcn } from 'enchase/styles/shadcn'
import { workbench } from 'enchase/styles/workbench'
import { createTheme, defineStyle, validateTheme } from 'enchase/theme'
import type { RadiusOverrides, ShapePreset, ThemeInput, ThemeStyle, ThemeStyleMode } from 'enchase/theme'
import { en, ptBR } from 'enchase/locales'
import type { Locale } from 'enchase/locales'
import { useTabs } from 'enchase/headless/tabs'
import type { UseTabsOptions, UseTabsReturn } from 'enchase/headless/tabs'
import { usePagination } from 'enchase/headless/pagination'
import type { PaginationItem, UsePaginationOptions, UsePaginationReturn } from 'enchase/headless/pagination'
import { useSegmentedControl } from 'enchase/headless/segmented-control'
import type { UseSegmentedControlOptions, UseSegmentedControlReturn } from 'enchase/headless/segmented-control'
import { useAccordion } from 'enchase/headless/accordion'
import type { UseAccordionOptions, UseAccordionReturn } from 'enchase/headless/accordion'
import { useSlider } from 'enchase/headless/slider'
import type { UseSliderOptions, UseSliderReturn } from 'enchase/headless/slider'
import { useRef } from 'react'
import type { MouseEvent } from 'react'
import 'enchase/styles.css'
import 'enchase/styles.layer.css'
import 'enchase/theme.css'

const sections: SidebarSection[] = [{ id: 'main', items: [{ id: 'home', label: 'Home', href: '/' }] }]
const labels: Partial<UILabels> = { closeModal: 'Close', previousPage: 'Back', increaseValue: 'More' }
const locale: Locale = ptBR
const props: LayoutProps = { children: null, navigationSections: sections, translucent: true }
const docsLink: ButtonLinkProps = { href: '/docs', native: true, externalIcon: false }
const iconLink: ButtonLinkProps = { href: 'https://example.com', target: '_blank', iconOnly: true, 'aria-label': 'Example (opens in a new tab)' }
const navbarProps: NavbarProps = { logo: 'Acme', sections, translucent: true, actions: <Button>Start</Button> }
const gridProps: GridProps = { columns: { xs: 1, md: 2, xxl: 4 }, gap: '1rem', centerLastRow: true }
const fixedGridProps: GridProps = { columns: 3, minColumnWidth: '12rem' }
const listGridProps: GridProps = { as: 'ul', columns: 2, 'aria-label': 'Projects' }
const listCardProps: CardProps = { as: 'li', variant: 'elevated', padding: '1rem' }
const tileProps: CardLinkProps = { href: '/projects', variant: 'outlined', padding: '1rem', target: '_blank', native: true }
const buttonTileProps: CardButtonProps = { variant: 'elevated', disabled: false, animation: false, onClick: () => undefined }
const badgeListProps: FlexProps = { as: 'ul', wrap: true, gap: '0.5rem', 'aria-label': 'Stack' }
const mainProps: ContainerProps = { as: 'main', maxWidth: 'md' }
const alertProps: AlertProps = { variant: 'warning', title: 'Heads up', onClose: () => undefined }
const badgeProps: BadgeProps = { variant: 'success', size: 'sm' }
const areaProps: TextareaProps = { label: 'Message', rows: 4, resize: 'none' }
const switchProps: SwitchProps = { label: 'Notifications', defaultChecked: true }
const radioProps: RadioGroupProps = { label: 'Plan', options: [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro', disabled: true }], defaultValue: 'free', orientation: 'horizontal', onValueChange: () => undefined }
const tabsProps: TabsProps = { ariaLabel: 'Sections', items: [{ value: 'a', label: <span>One <Badge>3</Badge></span>, content: 'First' }, { value: 'b', label: 'Two', content: 'Second' }], activation: 'manual', onValueChange: () => undefined }
const accordionProps: AccordionProps = { items: [{ value: 'a', title: <span>One <Badge>Now</Badge></span>, content: 'First' }, { value: 'b', title: 'Two', content: 'Second' }], multiple: true, defaultValue: ['a'], headingLevel: 2, onValueChange: () => undefined }
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

declare const maybeMessage: string | undefined
declare const maybeCount: number | undefined
declare const maybeTheme: ThemeInput | undefined
declare const maybeHandler: (() => void) | undefined

const tabsOptions: UseTabsOptions = { items: [{ value: 'a' }, { value: 'b', disabled: true }], activation: 'manual', value: maybeMessage, onValueChange: (value: string) => void value }
const pagerOptions: UsePaginationOptions = { pageCount: 12, page: maybeCount, defaultPage: maybeCount, onPageChange: (page: number) => void page }
const groupOptions: UseSegmentedControlOptions = { items: [{ value: 'a' }, { value: 'b', disabled: true }], multiple: true, defaultValue: ['a'], onValueChange: (value: string[]) => void value }
const radioGroupOptions: UseSegmentedControlOptions = { items: [{ value: 'a' }], value: maybeMessage, disabled: undefined, onValueChange: (value: string) => void value }
const accordionOptions: UseAccordionOptions = { items: [{ value: 'a' }], multiple: true, value: undefined, onValueChange: (value: string[]) => void value }
const sliderOptions: UseSliderOptions = { min: 0, max: 10, step: maybeCount, value: maybeCount, formatValue: (value: number) => value + '%', onValueChange: (value: number) => void value }

export const Headless = () => {
  const tabs: UseTabsReturn = useTabs(tabsOptions)
  const pager: UsePaginationReturn = usePagination(pagerOptions)
  const group: UseSegmentedControlReturn = useSegmentedControl(groupOptions)
  const radios: UseSegmentedControlReturn = useSegmentedControl(radioGroupOptions)
  const accordion: UseAccordionReturn = useAccordion(accordionOptions)
  const slider: UseSliderReturn = useSlider(sliderOptions)
  const pages: PaginationItem[] = pager.items

  return (
    <div>
      <div {...tabs.getListProps({ 'aria-label': 'Sections' })}>
        <button {...tabs.getTabProps('a', { className: 'tab', onClick: (event) => event.preventDefault() })}>One</button>
      </div>
      <div {...tabs.getPanelProps('a', { className: 'panel' })}>First</div>
      <nav>
        <button {...pager.getPreviousProps({ 'aria-label': 'Back' })} />
        {pages.map((item) => (typeof item === 'number' ? <button key={item} {...pager.getPageProps(item)}>{item}</button> : <span key={item}>...</span>))}
        <button {...pager.getNextProps({ 'aria-label': 'Next' })} />
      </nav>
      <div {...group.getGroupProps({ 'aria-label': 'View' })}>
        <button {...group.getItemProps('a', { 'data-state': group.selected.includes('a') ? 'on' : 'off' })}>A</button>
      </div>
      <div {...radios.getGroupProps()}>
        <button {...radios.getItemProps('a')} onClick={maybeHandler}>A</button>
      </div>
      <h3>
        <button {...accordion.getTriggerProps('a', { className: 'trigger' })}>One</button>
      </h3>
      <div {...accordion.getPanelProps('a', { className: 'panel' })}>First</div>
      <div {...slider.getControlProps()}>
        <div {...slider.getTrackProps({ className: 'track', style: { position: 'absolute' } })}>
          <div {...slider.getThumbProps({ 'aria-label': 'Volume' })} style={{ insetInlineStart: slider.percent + '%' }} />
        </div>
      </div>
      <output>{slider.valueText}</output>
    </div>
  )
}

export const Refs = () => {
  const alert = useRef<HTMLDivElement>(null)
  const avatar = useRef<HTMLSpanElement>(null)
  const badge = useRef<HTMLSpanElement>(null)
  const breadcrumbs = useRef<HTMLElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const buttonLink = useRef<HTMLAnchorElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const cardButton = useRef<HTMLButtonElement>(null)
  const cardLink = useRef<HTMLAnchorElement>(null)
  const container = useRef<HTMLElement>(null)
  const divider = useRef<HTMLHRElement>(null)
  const flex = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLElement>(null)
  const icon = useRef<SVGSVGElement>(null)
  const link = useRef<HTMLAnchorElement>(null)
  const loading = useRef<HTMLDivElement>(null)
  const inlineLoading = useRef<HTMLSpanElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const skeleton = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLSpanElement>(null)
  const themeToggle = useRef<HTMLButtonElement>(null)
  const hidden = useRef<HTMLSpanElement>(null)
  const modal = useRef<HTMLDivElement>(null)
  const confirm = useRef<HTMLDivElement>(null)
  const drawer = useRef<HTMLDivElement>(null)
  const sidebar = useRef<HTMLDivElement>(null)
  const popover = useRef<HTMLDivElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const tooltip = useRef<HTMLSpanElement>(null)

  return (
    <div>
      <Alert ref={alert}>Saved</Alert>
      <Avatar ref={avatar} name="Ana Souza" />
      <Badge ref={badge}>New</Badge>
      <Breadcrumbs ref={breadcrumbs} items={[{ id: 'home', label: 'Home', href: '/' }, { id: 'page', label: 'Page' }]} />
      <Button ref={button}>Save</Button>
      <ButtonLink ref={buttonLink} href="/docs">Docs</ButtonLink>
      <Card ref={card} as="section">Card</Card>
      <CardButton ref={cardButton}>Open</CardButton>
      <CardLink ref={cardLink} href="/docs">Docs</CardLink>
      <Container ref={container} as="main">Main</Container>
      <Divider ref={divider} />
      <Flex ref={flex}>Row</Flex>
      <Grid ref={grid} as="ul">
        <li>Item</li>
      </Grid>
      <Icon ref={icon}><circle cx="12" cy="12" r="1" /></Icon>
      <Link ref={link} href="/docs">Docs</Link>
      <Loading ref={loading} />
      <InlineLoading ref={inlineLoading} />
      <Progress ref={progress} value={40} />
      <Skeleton ref={skeleton} />
      <Tag ref={tag}>React</Tag>
      <ThemeToggle ref={themeToggle} />
      <VisuallyHidden ref={hidden}>Only for screen readers</VisuallyHidden>
      <Modal ref={modal} isOpen={false} onClose={() => undefined}>Body</Modal>
      <ConfirmModal ref={confirm} isOpen={false} onClose={() => undefined} onConfirm={() => undefined} message="Delete it?" />
      <Drawer ref={drawer} open={false} onClose={() => undefined}>Body</Drawer>
      <Sidebar ref={sidebar} sections={sections} />
      <Popover ref={popover} content="More"><Button>Open</Button></Popover>
      <Menu ref={menu} label="Actions" items={[{ id: 'edit', label: 'Edit' }]}><Button>Open</Button></Menu>
      <Tooltip ref={tooltip} text="Hint"><Button>Hover</Button></Tooltip>
      <Button ref={(node: HTMLButtonElement | null) => void node}>Callback</Button>
      <Card ref={undefined}>Without</Card>
    </div>
  )
}

export const OptionalValues = () => (
  <ColorModeProvider theme={maybeTheme}>
    <Input label="Email" error={maybeMessage} helperText={maybeMessage} />
    <Select label="Plan" options={[{ value: 'free', label: 'Free' }]} error={maybeMessage} />
    <NumberInput label="Quantity" min={maybeCount} max={maybeCount} />
    <Button variant={maybeMessage === undefined ? 'primary' : undefined} size={undefined} onClick={maybeHandler}>Save</Button>
    <Alert title={maybeMessage} onClose={maybeHandler}>Saved</Alert>
    <Pagination pageCount={20} page={maybeCount} />
    <Card padding={maybeMessage} variant={undefined}>Card</Card>
    <Grid columns={maybeCount} gap={maybeMessage}>x</Grid>
  </ColorModeProvider>
)

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
        <Grid {...listGridProps}>
          <Card {...listCardProps}>One</Card>
          <li>
            <CardLink {...tileProps}>Project</CardLink>
          </li>
          <li>
            <CardButton {...buttonTileProps}>Skill</CardButton>
          </li>
        </Grid>
        <Flex {...badgeListProps}>
          <li>
            <Badge>React</Badge>
          </li>
        </Flex>
        <Container {...mainProps}>Main</Container>
        <Card onClick={(event: MouseEvent<HTMLDivElement>) => void event}>Handler typed for a div</Card>
        <ButtonLink {...docsLink}>Docs</ButtonLink>
        <ButtonLink {...iconLink}>
          <CloseIcon />
        </ButtonLink>
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
export const pressed: string = theme.base.state.pressed
export const disabledContent: string = theme.base.state.disabledContent
export const haloSize: string = theme.base.halo.size
export const hitSize: string = theme.base.hit.size
export const largeHitSize: string = theme.base.hit.sizeLg
export const normalLineHeight: number = theme.base.fonts.lineHeights.normal
export const controlSpacing: string = theme.base.fonts.letterSpacings.control
export const problems = validateTheme(theme)
export const chosen: ThemeStyle = shadcn
export const dense: ThemeStyle = workbench
export const styled = createTheme({ style: chosen })
export const labelPlacement: 'floating' | 'stacked' | 'start' | undefined = styled.defaults?.labelPlacement
export const styledProblems = validateTheme(styled)
export const unstyled = createTheme({ style: enchaseStyle })
const night: ThemeStyleMode = { colors: { background: '#101010' }, hooks: { '--enchase-badge-background-neutral': '#202020' } }
export const own: ThemeStyle = defineStyle({ base: { control: { height: { md: '2rem' } } }, radius: { button: '0.25rem' }, hooks: { '--enchase-button-font-weight': '500' }, colorHooks: { '--enchase-card-background-default': 'var(--enchase-color-surface)' }, brand: ['primary', 'onPrimary'], dark: night, defaults: { labelPlacement: 'stacked' } })
export const owned = createTheme({ style: own, brand: '#0f766e', shape: 'soft' })
export const ownedHeight: string = owned.base.control.height.md
export const mixed: ThemeInput = { style: shadcn, brand: '#0f766e' }
`

const recipeUsage = `import { FormRecipe } from './FormRecipe.tsx'
import type { Registration } from './FormRecipe.tsx'

export const date = (values: Registration): string => values.date
export const accepted = (values: Registration): true => values.terms
export const Page = () => <FormRecipe onSubmit={(values) => void date(values)} />
`

const legacy = `import { useTabs } from 'enchase/experimental/tabs'
import type { UseTabsOptions, UseTabsReturn } from 'enchase/experimental/tabs'
import { usePagination } from 'enchase/experimental/pagination'
import type { PaginationItem, UsePaginationOptions, UsePaginationReturn } from 'enchase/experimental/pagination'
import { useSegmentedControl } from 'enchase/experimental/segmented-control'
import type { UseSegmentedControlOptions, UseSegmentedControlReturn } from 'enchase/experimental/segmented-control'
import { useAccordion } from 'enchase/experimental/accordion'
import type { UseAccordionOptions, UseAccordionReturn } from 'enchase/experimental/accordion'
import { useSlider } from 'enchase/experimental/slider'
import type { UseSliderOptions, UseSliderReturn } from 'enchase/experimental/slider'

const tabsOptions: UseTabsOptions = { items: [{ value: 'a' }], activation: 'manual' }
const sliderOptions: UseSliderOptions = { min: 0, max: 10, defaultValue: 5 }

export const Old = () => {
  const tabs: UseTabsReturn = useTabs(tabsOptions)
  const pager: UsePaginationReturn = usePagination({ pageCount: 3 } satisfies UsePaginationOptions)
  const group: UseSegmentedControlReturn = useSegmentedControl({ items: [{ value: 'a' }] } satisfies UseSegmentedControlOptions)
  const accordion: UseAccordionReturn = useAccordion({ items: [{ value: 'a' }] } satisfies UseAccordionOptions)
  const slider: UseSliderReturn = useSlider(sliderOptions)
  const items: PaginationItem[] = pager.items

  return [tabs.selected, items.length, group.selected, accordion.expanded, slider.value]
}
`

const consumerPackage = { name: 'enchase-consumer', private: true, type: 'module', version: '0.0.0' }

const hookNames = ['useTabs', 'UseTabsOptions', 'UseTabsReturn', 'usePagination', 'PaginationItem', 'UsePaginationOptions', 'UsePaginationReturn', 'useSegmentedControl', 'UseSegmentedControlOptions', 'UseSegmentedControlReturn', 'useAccordion', 'UseAccordionOptions', 'UseAccordionReturn', 'useSlider', 'UseSliderOptions', 'UseSliderReturn']

const consumerConfig = {
  compilerOptions: {
    target: 'ES2022',
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    moduleResolution: 'bundler',
    jsx: 'react-jsx',
    strict: true,
    exactOptionalPropertyTypes: true,
    skipLibCheck: false,
    allowImportingTsExtensions: true,
    noEmit: true,
    types: []
  },
  include: ['index.tsx', 'legacy.tsx', 'css.d.ts', 'readme/*.tsx', 'recipe/*.tsx']
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
  writeFileSync(join(consumer, 'legacy.tsx'), legacy)

  if (readmeSnippets.length === 0) throw new Error('README.md and HEADLESS.md have no tsx block to compile')
  if (unpinned.length > 0) throw new Error(`${unpinned.join(', ')} must be devDependencies with an exact version (no ^ or ~), because the consumer compiles the forms recipe against the versions the repository tests`)

  mkdirSync(join(consumer, 'readme'))
  writeFileSync(join(consumer, 'readme', 'App.tsx'), 'export default function App() {\n  return null\n}\n')
  readmeSnippets.forEach((code, index) => writeFileSync(join(consumer, 'readme', `snippet${index}.tsx`), code))
  mkdirSync(join(consumer, 'recipe'))
  writeFileSync(join(consumer, 'recipe', 'FormRecipe.tsx'), recipe)
  writeFileSync(join(consumer, 'recipe', 'usage.tsx'), recipeUsage)

  run(npm, ['install', '--no-audit', '--no-fund', tarball, 'react@19', 'react-dom@19', '@types/react@19', '@types/react-dom@19', 'typescript@5.8', ...formPackages.map((name) => `${name}@${formVersions[name]}`)], consumer)
  run(process.execPath, [join(consumer, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.json'], consumer)

  const typescript = createRequire(join(consumer, 'package.json'))('typescript')

  const service = typescript.createLanguageService({
    getScriptFileNames: () => [join(consumer, 'index.tsx'), join(consumer, 'legacy.tsx'), join(consumer, 'css.d.ts')],
    getScriptVersion: () => '1',
    getScriptSnapshot: (file) => (typescript.sys.fileExists(file) ? typescript.ScriptSnapshot.fromString(typescript.sys.readFile(file) ?? '') : undefined),
    getCurrentDirectory: () => consumer,
    getCompilationSettings: () => typescript.convertCompilerOptionsFromJson(consumerConfig.compilerOptions, consumer).options,
    getDefaultLibFileName: (settings) => typescript.getDefaultLibFilePath(settings),
    fileExists: typescript.sys.fileExists,
    readFile: typescript.sys.readFile,
    readDirectory: typescript.sys.readDirectory
  })

  const flagged = (file) =>
    new Set(
      service
        .getSuggestionDiagnostics(join(consumer, file))
        .filter((diagnostic) => diagnostic.code === 6385)
        .map((diagnostic) => /'([^']+)' is deprecated/.exec(typescript.flattenDiagnosticMessageText(diagnostic.messageText, ' '))?.[1])
    )

  const oldFlagged = flagged('legacy.tsx')
  const newFlagged = flagged('index.tsx')
  const notFlagged = hookNames.filter((name) => !oldFlagged.has(name))
  const flaggedNew = hookNames.filter((name) => newFlagged.has(name))

  if (notFlagged.length > 0) throw new Error(`the language service must flag as deprecated what is imported from enchase/experimental, and it did not flag: ${notFlagged.join(', ')}`)
  if (flaggedNew.length > 0) throw new Error(`nothing imported from enchase/headless may be deprecated, and the language service flagged: ${flaggedNew.join(', ')}`)

  console.log(`the ${hookNames.length} names imported from enchase/experimental are flagged as deprecated by the language service, and none imported from enchase/headless is`)

  const same = JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `const differing = []
for (const name of ['tabs', 'pagination', 'segmented-control', 'accordion', 'slider']) {
  const headless = await import('enchase/headless/' + name)
  const experimental = await import('enchase/experimental/' + name)
  const keys = Object.keys(headless)

  if (keys.length === 0 || Object.keys(experimental).join() !== keys.join() || keys.some((key) => headless[key] !== experimental[key])) differing.push(name)
}
console.log(JSON.stringify(differing))`
      ],
      { cwd: consumer }
    ).toString()
  )

  if (same.length > 0) throw new Error(`enchase/experimental/<name> must be the same hook as enchase/headless/<name>, and it is not for: ${same.join(', ')}`)

  console.log('each enchase/experimental/<name> exports the very hooks of enchase/headless/<name>')

  const resolves = (specifier) => {
    try {
      execFileSync(process.execPath, ['--input-type=module', '-e', `import.meta.resolve(${JSON.stringify(specifier)})`], { cwd: consumer, stdio: 'pipe' })

      return true
    } catch {
      return false
    }
  }

  const packedTheme = readFileSync(join(consumer, 'node_modules', 'enchase', 'dist-lib', 'theme.css'), 'utf8')
  const densityRules = [
    ":root[data-density='compact'] {",
    ":where(:root[data-density='compact']) {"
  ]

  if (densityRules.some((rule) => packedTheme.split(rule).length !== 2)) throw new Error(`the packed theme.css must carry the compact density block once, as the rules ${densityRules.join(' and ')}`)

  console.log('the packed theme.css carries the compact density block once')

  const expected = { 'enchase/styles/shadcn': true, 'enchase/styles/workbench': true, 'enchase/styles/enchase': true, 'enchase/styles.css': true, 'enchase/styles': false, 'enchase/styles/theme/style': false, 'enchase/headless/tabs': true, 'enchase/headless/pagination': true, 'enchase/headless/segmented-control': true, 'enchase/headless/accordion': true, 'enchase/headless/slider': true, 'enchase/headless': false, 'enchase/headless/menu': false, 'enchase/experimental/tabs': true, 'enchase/experimental/pagination': true, 'enchase/experimental/segmented-control': true, 'enchase/experimental/accordion': true, 'enchase/experimental/slider': true, 'enchase/experimental': false, 'enchase/experimental/menu': false }
  const wrong = Object.entries(expected).filter(([specifier, should]) => resolves(specifier) !== should)

  if (wrong.length > 0) throw new Error(`the installed package resolves the wrong entries:\n${wrong.map(([specifier, should]) => `  - ${specifier} should ${should ? 'resolve' : 'fail, so forgetting the .css of enchase/styles.css is an error and not an import that does nothing'}`).join('\n')}`)

  const installedRoot = join(consumer, 'node_modules', 'enchase')
  const installed = JSON.parse(readFileSync(join(installedRoot, 'package.json'), 'utf8'))
  const importsFormPackage = (code) => formPackages.some((name) => new RegExp(`['"]${name}(/[^'"]*)?['"]`).test(code))

  const leaks = [
    ...formPackages.filter((name) => ['dependencies', 'peerDependencies', 'optionalDependencies'].some((field) => installed[field]?.[name] !== undefined)).map((name) => `${name} is in the package.json of the packed enchase`),
    ...readdirSync(join(installedRoot, 'dist-lib'), { recursive: true }).filter((file) => /\.(js|ts)$/.test(file) && importsFormPackage(readFileSync(join(installedRoot, 'dist-lib', file), 'utf8'))).map((file) => `dist-lib/${file} imports one of them`)
  ]

  if (leaks.length > 0) throw new Error(`the packed enchase must not depend on the packages of the forms recipe, which are only devDependencies:\n${leaks.map((leak) => `  - ${leak}`).join('\n')}`)

  console.log(`consumer, the ${readmeSnippets.length} tsx blocks of the README and of HEADLESS.md and the forms recipe (${formPackages.map((name) => `${name}@${formVersions[name]}`).join(', ')}) compiled against enchase@${installed.version} with skipLibCheck: false and exactOptionalPropertyTypes, enchase does not depend on those packages, and enchase/styles alone does not resolve`)
} finally {
  rmSync(workdir, { recursive: true, force: true })
}
