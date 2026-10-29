import { expect } from 'vitest'

import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'
import { CheckboxGroup } from '@components/common/CheckboxGroup/index.tsx'
import { Breadcrumbs } from '@components/common/Breadcrumbs/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { ButtonLink } from '@components/common/ButtonLink/index.tsx'
import { CardButton } from '@components/common/CardButton/index.tsx'
import { DatePicker } from '@components/common/DatePicker/index.tsx'
import { Pagination } from '@components/common/Pagination/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { Accordion } from '@components/common/Accordion/index.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { CardLink } from '@components/common/CardLink/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Combobox } from '@components/common/Combobox/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { Popover } from '@components/common/Popover/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Slider } from '@components/common/Slider/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Badge } from '@components/common/Badge/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Link } from '@components/common/Link/index.tsx'
import { Menu } from '@components/common/Menu/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { Tag } from '@components/common/Tag/index.tsx'
import Footer from '@components/footer/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { frames } from './settle.ts'

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' }
]

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'grape', label: 'Grape' }
]

const sections = [
  {
    id: 'main',
    title: 'Main',
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'docs', label: 'Docs', href: '/docs' },
      { id: 'api', label: 'Api', href: '/api' }
    ]
  }
]

const segments = [
  { value: 'a', label: 'List' },
  { value: 'b', label: 'Board' }
]

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'total', header: 'Total', align: 'end' as const }
]

const rows = [
  { name: 'Ana', total: 10 },
  { name: 'Bia', total: 20 }
]

const menuEntries = [
  { id: 'edit', label: 'Edit' },
  { id: 'copy', label: 'Copy' }
]

export const gallery = (
  <div style={{ display: 'grid', gap: 16, inlineSize: 960 }}>
    <Navbar sections={sections} />
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 }}>
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
      <Button variant="outline">Outline</Button>
      <ButtonLink href="/docs">Docs</ButtonLink>
      <Link href="/api">Api</Link>
      <ThemeToggle />
      <Menu label="Actions" items={menuEntries}>
        <Button variant="ghost">Menu</Button>
      </Menu>
      <Popover content={<p>Details</p>}>
        <Button variant="ghost">Popover</Button>
      </Popover>
      <Tooltip text="Tip">
        <Button variant="ghost">Tooltip</Button>
      </Tooltip>
    </div>
    <Input label="Name" />
    <Input label="Password" type="password" />
    <Textarea label="Notes" />
    <Select label="Plan" options={options} />
    <NumberInput label="Amount" defaultValue={1} />
    <DatePicker label="Date" />
    <Combobox label="Fruit" options={fruits} />
    <Combobox label="Fruits" options={fruits} multiple defaultValue={['apple', 'banana']} />
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 24 }}>
      <Checkbox label="Terms" />
      <Switch label="Alerts" />
      <RadioGroup label="Plan" options={options} defaultValue="a" />
      <CheckboxGroup label="Topics" options={options} defaultValue={['a']} />
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 }}>
      <SegmentedControl size="sm" ariaLabel="Small view" items={segments} defaultValue="a" />
      <SegmentedControl ariaLabel="View" items={segments} defaultValue="a" />
      <SegmentedControl size="lg" multiple ariaLabel="Large view" items={segments} defaultValue={['b']} />
    </div>
    <Slider label="Volume" showValue defaultValue={40} />
    <Tabs
      items={[
        { value: 'a', label: 'Account', content: 'First' },
        { value: 'b', label: 'Password', content: 'Second' }
      ]}
    />
    <Accordion items={[{ value: 'a', title: 'Question', content: 'Answer' }]} />
    <Breadcrumbs
      items={[
        { id: 'home', label: 'Home', href: '/' },
        { id: 'now', label: 'Now' }
      ]}
    />
    <Pagination pageCount={5} defaultPage={2} />
    <Pagination size="sm" pageCount={5} defaultPage={2} />
    <Table caption="Orders" columns={columns} rows={rows} selectedKeys={[0]} onSelectedKeysChange={() => undefined} />
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 }}>
      <Tag onRemove={() => undefined}>Tag</Tag>
      <Badge>New</Badge>
      <CardButton>Tile button</CardButton>
      <CardLink href="/docs">Tile link</CardLink>
    </div>
    <Sidebar sections={sections} currentHref="/docs" header={<span>Brand</span>} style={{ blockSize: 360 }} />
    <Footer companyName="Enchase" notice="MIT" links={[{ label: 'Docs', href: '/docs' }]} />
  </div>
)

export const setDensity = (value: string | null) => {
  if (value === null) document.documentElement.removeAttribute('data-density')
  else document.documentElement.setAttribute('data-density', value)
}

export const valuesOf = (element: Element, names: string[]) => names.map((name) => getComputedStyle(element).getPropertyValue(name).trim())

const rounded = (value: number) => Math.round(value * 100) / 100

export const capture = (root: ParentNode, properties: string[] = []) =>
  [...root.querySelectorAll<HTMLElement>('[data-slot]')].map((element, index) => {
    const { left, top, width, height } = element.getBoundingClientRect()

    return [`${index} ${element.dataset.slot}`, [left, top, width, height].map(rounded).join(','), valuesOf(element, properties).join(',')].join(' ')
  })

export const differences = (before: string[], after: string[]) =>
  Array.from({ length: Math.max(before.length, after.length) }, (_, index) => [before[index], after[index]])
    .filter(([first, second]) => first !== second)
    .map(([first, second]) => `${first} became ${second}`)

export const settledCapture = async (root: ParentNode, properties: string[] = []) => {
  let latest = capture(root, properties)
  let unchanged = 0

  for (let round = 0; round < 20 && unchanged < 2; round += 1) {
    await frames(3)

    const next = capture(root, properties)

    unchanged = differences(latest, next).length === 0 ? unchanged + 1 : 0
    latest = next
  }

  expect(unchanged, 'the computed styles never settled').toBe(2)

  return latest
}
