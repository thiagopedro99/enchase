import type { HookRow, SizeGroup, TokenRow } from './types.ts'
import type { SidebarSection } from 'enchase'

export const tokenRows: TokenRow[] = [
  { name: '--enchase-hit-size', enchase: '40px', shadcn: '2rem', compact: '32px' },
  { name: '--enchase-control-height-sm', enchase: '2rem', shadcn: '2rem', compact: '1.75rem' },
  { name: '--enchase-control-height-md', enchase: '2.5rem', shadcn: '2.25rem', compact: '2rem' },
  { name: '--enchase-control-height-lg', enchase: '3rem', shadcn: '2.5rem', compact: '2.5rem' },
  { name: '--enchase-space-sm', enchase: '0.5rem', shadcn: '0.5rem', compact: '0.375rem' },
  { name: '--enchase-space-md', enchase: '1rem', shadcn: '1rem', compact: '0.75rem' },
  { name: '--enchase-space-lg', enchase: '1.5rem', shadcn: '1.5rem', compact: '1.125rem' },
  { name: '--enchase-space-xl', enchase: '2rem', shadcn: '2rem', compact: '1.5rem' },
  { name: '--enchase-space-2xl', enchase: '3rem', shadcn: '3rem', compact: '2.25rem' },
  { name: '--enchase-space-3xl', enchase: '4rem', shadcn: '4rem', compact: '3rem' }
]

export const hookRows: HookRow[] = [
  { name: '--enchase-input-height', enchase: '3.5rem', shadcn: 'var(--enchase-control-height-md)', compact: '2.75rem', shadcnCompact: '2rem', follows: true },
  { name: '--enchase-textarea-min-height', enchase: '3.5rem', shadcn: '4rem', compact: '2.75rem', shadcnCompact: '4rem', follows: false },
  { name: '--enchase-tabs-tab-min-height', enchase: '2.75rem', shadcn: 'var(--enchase-control-height-md)', compact: '2.25rem', shadcnCompact: '2rem', follows: true },
  { name: '--enchase-accordion-trigger-min-height', enchase: '3rem', shadcn: '0px', compact: '2.5rem', shadcnCompact: '0px', follows: false },
  { name: '--enchase-select-option-padding-block', enchase: '0.75rem', shadcn: '0.375rem', compact: '0.5rem', shadcnCompact: '0.375rem', follows: false },
  { name: '--enchase-badge-padding-inline-md', enchase: '0.625rem', shadcn: '0.5rem', compact: '0.5rem', shadcnCompact: '0.5rem', follows: false },
  { name: '--enchase-sidebar-item-control-height', enchase: '52px', shadcn: '2rem', compact: '2.5rem', shadcnCompact: '2rem', follows: false },
  { name: '--enchase-sidebar-header-min-height', enchase: '72px', shadcn: '3.5rem', compact: '4rem', shadcnCompact: '3.5rem', follows: false },
  { name: '--enchase-navbar-bar-height', enchase: '64px', shadcn: '3.5rem', compact: '3.5rem', shadcnCompact: '3.5rem', follows: false },
  { name: '--enchase-layout-header-height', enchase: '64px', shadcn: '3.5rem', compact: '3.5rem', shadcnCompact: '3.5rem', follows: false }
]

export const followedHooks = hookRows.filter((row) => row.follows)

export const keptHooks = hookRows.filter((row) => !row.follows)

export const sizeGroups: SizeGroup[] = [
  {
    title: 'Buttons and controls',
    rows: [
      { part: 'Button, small', enchase: '32 → 28', shadcn: '32 → 28' },
      { part: 'Button, medium', enchase: '40 → 32', shadcn: '36 → 32' },
      { part: 'Button, large', enchase: '48 → 40', shadcn: '40 → 40' },
      { part: 'SegmentedControl, small', enchase: '32 → 28', shadcn: '32 → 28' },
      { part: 'SegmentedControl, medium', enchase: '40 → 32', shadcn: '36 → 32' },
      { part: 'SegmentedControl, large', enchase: '48 → 40', shadcn: '40 → 40' },
      { part: 'Pagination page, small', enchase: '32 × 32 → 28 × 28', shadcn: '32 × 32 → 28 × 28' },
      { part: 'Pagination page, medium', enchase: '40 × 40 → 32 × 32', shadcn: '36 × 36 → 32 × 32' },
      { part: 'Tabs, the list and each tab', enchase: '44 → 36', shadcn: '36 → 32' }
    ]
  },
  {
    title: 'Fields',
    rows: [
      { part: 'Input, Select, NumberInput, DatePicker and Combobox field', enchase: '56 → 44', shadcn: '36 → 32' },
      { part: 'Textarea field', enchase: '104 → 96', shadcn: '95 → 87' },
      { part: 'Button inside a field: password, stepper, calendar', enchase: '40 × 40 → 32 × 32', shadcn: '32 × 32 → 32 × 32' },
      { part: 'Button of the Combobox', enchase: '40 × 56 → 32 × 44', shadcn: '32 × 36 → 32 × 32' },
      { part: 'Both steppers of the NumberInput', enchase: '84 × 56 → 68 × 44', shadcn: '68 × 36 → 68 × 32' }
    ]
  },
  {
    title: 'Selection controls',
    rows: [
      { part: 'Checkbox, RadioGroup option and Switch, the clickable row', enchase: '40 → 32', shadcn: '32 → 32' },
      { part: 'Slider, the control around the thumb', enchase: '40 → 32', shadcn: '32 → 32' },
      { part: 'Slider, the thumb', enchase: '20 × 20 → 20 × 20', shadcn: '16 × 16 → 16 × 16' }
    ]
  },
  {
    title: 'Content',
    rows: [
      { part: 'Accordion trigger', enchase: '48 → 40', shadcn: '52 → 52' },
      { part: 'Table row, medium', enchase: '41 → 37', shadcn: '38 → 38' },
      { part: 'Table row, small', enchase: '30 → 30', shadcn: '30 → 30' },
      { part: 'Card with one line of text', enchase: '72 → 60', shadcn: '74 → 62' },
      { part: 'Alert with a title and a line of text', enchase: '73 → 69', shadcn: '83 → 83' },
      { part: 'Badge', enchase: '24 → 24', shadcn: '20 → 20' },
      { part: 'Tag', enchase: '32 → 32', shadcn: '32 → 32' }
    ]
  },
  {
    title: 'Navigation and bars',
    rows: [
      { part: 'Sidebar item', enchase: '52 → 40', shadcn: '32 → 32' },
      { part: 'Sidebar header', enchase: '72 → 64', shadcn: '56 → 56' },
      { part: 'Navbar bar', enchase: '64 → 56', shadcn: '56 → 56' },
      { part: 'Layout top bar', enchase: '64 → 56', shadcn: '56 → 56' },
      { part: 'Collapse button of the Sidebar and ThemeToggle', enchase: '44 × 44 → 44 × 44', shadcn: '44 × 44 → 44 × 44' }
    ]
  },
  {
    title: 'Overlays, which render on the body and still follow the attribute on the root',
    rows: [
      { part: 'Menu item', enchase: '40 → 32', shadcn: '33 → 33' },
      { part: 'Menu popup with three items and a separator', enchase: '137 → 113', shadcn: '118 → 118' },
      { part: 'Combobox option', enchase: '40 → 32', shadcn: '33 → 33' },
      { part: 'Combobox list with three options', enchase: '128 → 104', shadcn: '109 → 109' },
      { part: 'DatePicker day', enchase: '40 × 40 → 32 × 32', shadcn: '32 × 32 → 32 × 32' },
      { part: 'DatePicker popup', enchase: '320 × 368 → 256 × 294', shadcn: '266 × 306 → 258 × 296' },
      { part: 'Popover with one line of text', enchase: '56 → 48', shadcn: '58 → 50' },
      { part: 'Close button of Modal, Drawer and toast', enchase: '40 × 40 → 32 × 32', shadcn: '32 × 32 → 32 × 32' }
    ]
  }
]

export const planOptions = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' }
]

export const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'grape', label: 'Grape' }
]

export const segments = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' }
]

export const tabItems = [
  { value: 'account', label: 'Account', content: 'Account details' },
  { value: 'password', label: 'Password', content: 'Change the password' }
]

export const accordionItems = [
  { value: 'size', title: 'Does it change the font?', content: 'No: the density changes heights and spaces, not the type.' },
  { value: 'touch', title: 'Is it for touch screens?', content: 'No: the targets go down to 32px with any pointer.' }
]

export const tableColumns = [
  { key: 'order', header: 'Order', rowHeader: true },
  { key: 'status', header: 'Status' },
  { key: 'total', header: 'Total', align: 'end' as const }
]

export const tableRows = [
  { order: '#1001', status: 'Paid', total: '$120.00' },
  { order: '#1002', status: 'Pending', total: '$80.00' },
  { order: '#1003', status: 'Paid', total: '$45.00' }
]

export const breadcrumbItems = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'settings', label: 'Settings', href: '/settings' },
  { id: 'now', label: 'Density' }
]

export const navigationSections: SidebarSection[] = [
  {
    id: 'main',
    title: 'Application',
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'docs', label: 'Documentation', href: '/docs' },
      { id: 'api', label: 'API', href: '/api' }
    ]
  }
]
