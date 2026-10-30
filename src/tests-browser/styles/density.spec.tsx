import { describe, expect, it } from 'vitest'
import { useEffect } from 'react'

import { differences, gallery, setDensity, settledCapture, valuesOf } from '../support/density.tsx'
import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { DatePicker } from '@components/common/DatePicker/index.tsx'
import { Pagination } from '@components/common/Pagination/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { Accordion } from '@components/common/Accordion/index.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Combobox } from '@components/common/Combobox/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { builtInStyles } from '@tests/shared/fixtures/styles.ts'
import { Popover } from '@components/common/Popover/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { frames, waitForSettled } from '../support/settle.ts'
import { Button } from '@components/common/Button/index.tsx'
import { Drawer } from '@components/common/Drawer/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Slider } from '@components/common/Slider/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Alert } from '@components/common/Alert/index.tsx'
import { Badge } from '@components/common/Badge/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Menu } from '@components/common/Menu/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'
import { Tag } from '@components/common/Tag/index.tsx'
import { useToast } from '@components/toast/index.ts'
import { densities } from '@styles/tokens/index.ts'
import Layout from '@components/layout/index.tsx'
import Navbar from '@components/navbar/index.tsx'

import type { LabelPlacement } from '@styles/tokens/types.ts'
import type { ReactElement } from 'react'

const styles = ['enchase', 'shadcn'] as const

type StyleName = (typeof styles)[number]

type Part = {
  name: string
  ui: ReactElement
  target: string
  index?: number
  enchase: string
  shadcn: string
}

const noop = () => undefined

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

const menuEntries = [
  { id: 'edit', label: 'Edit' },
  { id: 'copy', label: 'Copy' },
  { id: 'split', separator: true as const },
  { id: 'delete', label: 'Delete' }
]

const tabs = [
  { value: 'a', label: 'Account', content: 'First' },
  { value: 'b', label: 'Password', content: 'Second' }
]

const columns = [{ key: 'name', header: 'Name' }]

const rows = [{ name: 'Ana' }, { name: 'Bia' }, { name: 'Caio' }]

const Notifier = () => {
  const toast = useToast()

  useEffect(() => {
    toast.info('Saved', 60000)
  }, [toast])

  return null
}

const show = (ui: ReactElement, styleName: StyleName) => renderInBrowser(ui, 'never', 'light', { style: builtInStyles[styleName] })

const settle = async (read: () => Element | null | undefined) => {
  await waitForSettled(read)
  await frames()
}

const sizesOf = (text: string) =>
  text.split(' > ').map((side) => {
    const [block, inline] = side.split('x').map(Number).reverse()

    return { block, inline }
  })

const measure = async ({ ui, target, index = 0 }: Part, styleName: StyleName, density: string | null) => {
  setDensity(density)
  const view = show(ui, styleName)

  await expect.poll(() => document.querySelectorAll(target)[index], { timeout: 4000 }).toBeDefined()
  await settle(() => document.querySelectorAll(target)[index])

  const element = document.querySelectorAll(target)[index]
  const { width, height } = element.getBoundingClientRect()
  const portal = !view.container.contains(element)

  view.unmount()

  return { width, height, portal }
}

const expectSize = (actual: { width: number; height: number }, wanted: { block: number; inline: number | undefined }, label: string) => {
  expect(actual.height, `${label}, block size`).toBeCloseTo(wanted.block, 0)
  if (wanted.inline !== undefined) expect(actual.width, `${label}, inline size`).toBeCloseTo(wanted.inline, 0)
}

const parts: Part[] = [
  { name: 'the medium button', ui: <Button>Save</Button>, target: '[data-slot=button]', enchase: '40 > 32', shadcn: '36 > 32' },
  { name: 'the small button', ui: <Button size="sm">Save</Button>, target: '[data-slot=button]', enchase: '32 > 28', shadcn: '32 > 28' },
  { name: 'the large button', ui: <Button size="lg">Save</Button>, target: '[data-slot=button]', enchase: '48 > 40', shadcn: '40 > 40' },
  { name: 'the field of the input', ui: <Input label="Name" />, target: '[data-slot=input-field]', enchase: '56 > 44', shadcn: '36 > 32' },
  { name: 'the button of the password', ui: <Input label="Password" type="password" />, target: '[data-slot=input-toggle]', enchase: '40x40 > 32x32', shadcn: '32x32 > 32x32' },
  { name: 'the field of the textarea', ui: <Textarea label="Notes" />, target: '[data-slot=textarea-field]', enchase: '104 > 96', shadcn: '95 > 87' },
  { name: 'the field of the select', ui: <Select label="Plan" options={options} />, target: '[data-slot=select-field]', enchase: '56 > 44', shadcn: '36 > 32' },
  { name: 'the field of the number input', ui: <NumberInput label="Amount" defaultValue={1} />, target: '[data-slot=number-input-field]', enchase: '56 > 44', shadcn: '36 > 32' },
  { name: 'the stepper of the number input', ui: <NumberInput label="Amount" defaultValue={1} />, target: '[data-slot=number-input-increase]', enchase: '40x40 > 32x32', shadcn: '32x32 > 32x32' },
  { name: 'the steppers of the number input', ui: <NumberInput label="Amount" defaultValue={1} />, target: '[data-slot=number-input-steppers]', enchase: '84x56 > 68x44', shadcn: '68x36 > 68x32' },
  { name: 'the field of the date picker', ui: <DatePicker label="Date" />, target: '[data-slot=date-picker-input]', enchase: '56 > 44', shadcn: '36 > 32' },
  { name: 'the button of the date picker', ui: <DatePicker label="Date" />, target: '[data-slot=date-picker-toggle]', enchase: '40x40 > 32x32', shadcn: '32x32 > 32x32' },
  { name: 'the field of the combobox', ui: <Combobox label="Fruit" options={fruits} />, target: '[data-slot=combobox-input]', enchase: '56 > 44', shadcn: '36 > 32' },
  { name: 'the button of the combobox', ui: <Combobox label="Fruit" options={fruits} />, target: '[data-slot=combobox-toggle]', enchase: '40x56 > 32x44', shadcn: '32x36 > 32x32' },
  { name: 'the checkbox', ui: <Checkbox label="Terms" />, target: '[data-slot=checkbox]', enchase: '40 > 32', shadcn: '32 > 32' },
  { name: 'the radio', ui: <RadioGroup label="Plan" options={options} />, target: '[data-slot=radio-group-option]', enchase: '40 > 32', shadcn: '32 > 32' },
  { name: 'the switch', ui: <Switch label="Alerts" />, target: '[data-slot=switch]', enchase: '40 > 32', shadcn: '32 > 32' },
  { name: 'the control of the slider', ui: <Slider label="Volume" defaultValue={40} />, target: '[data-slot=slider-control]', enchase: '40 > 32', shadcn: '32 > 32' },
  { name: 'the thumb of the slider', ui: <Slider label="Volume" defaultValue={40} />, target: '[data-slot=slider-thumb]', enchase: '20x20 > 20x20', shadcn: '16x16 > 16x16' },
  { name: 'the small segmented control', ui: <SegmentedControl size="sm" ariaLabel="View" items={segments} defaultValue="a" />, target: '[data-slot=segmented-control]', enchase: '32 > 28', shadcn: '32 > 28' },
  { name: 'the medium segmented control', ui: <SegmentedControl ariaLabel="View" items={segments} defaultValue="a" />, target: '[data-slot=segmented-control]', enchase: '40 > 32', shadcn: '36 > 32' },
  { name: 'the large segmented control', ui: <SegmentedControl size="lg" ariaLabel="View" items={segments} defaultValue="a" />, target: '[data-slot=segmented-control]', enchase: '48 > 40', shadcn: '40 > 40' },
  { name: 'the list of the tabs', ui: <Tabs items={tabs} />, target: '[data-slot=tabs-list]', enchase: '44 > 36', shadcn: '36 > 32' },
  { name: 'the tab', ui: <Tabs items={tabs} />, target: '[data-slot=tabs-tab]', enchase: '44 > 36', shadcn: '36 > 32' },
  { name: 'the trigger of the accordion', ui: <Accordion items={[{ value: 'a', title: 'Question', content: 'Answer' }]} />, target: '[data-slot=accordion-trigger]', enchase: '48 > 40', shadcn: '52 > 52' },
  { name: 'the row of the medium table', ui: <Table caption="Orders" columns={columns} rows={rows} />, target: '[data-slot=table-row]', enchase: '41 > 37', shadcn: '38 > 38' },
  { name: 'the row of the small table', ui: <Table size="sm" caption="Orders" columns={columns} rows={rows} />, target: '[data-slot=table-row]', enchase: '30 > 30', shadcn: '30 > 30' },
  { name: 'the page of the medium pagination', ui: <Pagination pageCount={5} defaultPage={2} />, target: '[data-slot=pagination-page]', enchase: '40x40 > 32x32', shadcn: '36x36 > 32x32' },
  { name: 'the page of the small pagination', ui: <Pagination size="sm" pageCount={5} defaultPage={2} />, target: '[data-slot=pagination-page]', enchase: '32x32 > 28x28', shadcn: '32x32 > 28x28' },
  { name: 'the item of the sidebar', ui: <Sidebar sections={sections} currentHref="/docs" header={<span>Brand</span>} />, target: '[data-slot=sidebar-item] a', enchase: '52 > 40', shadcn: '32 > 32' },
  { name: 'the header of the sidebar', ui: <Sidebar sections={sections} currentHref="/docs" header={<span>Brand</span>} />, target: '[data-slot=sidebar-header]', enchase: '72 > 64', shadcn: '56 > 56' },
  { name: 'the collapse button of the sidebar', ui: <Sidebar sections={sections} onToggleCollapsed={noop} />, target: '[data-slot=sidebar-collapse-button]', enchase: '44x44 > 44x44', shadcn: '44x44 > 44x44' },
  { name: 'the bar of the navbar', ui: <Navbar sections={sections} />, target: '[data-slot=navbar-bar]', enchase: '64 > 56', shadcn: '56 > 56' },
  { name: 'the bar of the layout', ui: <Layout pageTitle="Page" navigationSections={sections}><p>Body</p></Layout>, target: 'header', enchase: '64 > 56', shadcn: '56 > 56' },
  { name: 'the theme toggle', ui: <ThemeToggle />, target: '[data-slot=theme-toggle]', enchase: '44x44 > 44x44', shadcn: '44x44 > 44x44' },
  { name: 'the card', ui: <Card>Card text</Card>, target: '[data-slot=card]', enchase: '72 > 60', shadcn: '74 > 62' },
  { name: 'the alert', ui: <Alert variant="info" title="Title">Message</Alert>, target: '[data-slot=alert]', enchase: '73 > 69', shadcn: '83 > 83' },
  { name: 'the badge', ui: <Badge>New</Badge>, target: '[data-slot=badge]', enchase: '24 > 24', shadcn: '20 > 20' },
  { name: 'the tag', ui: <Tag>Tag</Tag>, target: '[data-slot=tag]', enchase: '32 > 32', shadcn: '32 > 32' }
]

const overlays: Part[] = [
  { name: 'the item of the menu', ui: <Menu defaultOpen label="Actions" items={menuEntries}><Button>Open</Button></Menu>, target: '[data-slot=menu-item]', enchase: '40 > 32', shadcn: '33 > 33' },
  { name: 'the popup of the menu', ui: <Menu defaultOpen label="Actions" items={menuEntries}><Button>Open</Button></Menu>, target: '[data-slot=popover-content]', enchase: '137 > 113', shadcn: '118 > 118' },
  { name: 'the list of the combobox', ui: <Combobox defaultOpen label="Fruit" options={fruits} />, target: '[data-slot=combobox-listbox]', enchase: '128 > 104', shadcn: '109 > 109' },
  { name: 'the option of the combobox', ui: <Combobox defaultOpen label="Fruit" options={fruits} />, target: '[data-slot=combobox-option]', enchase: '40 > 32', shadcn: '33 > 33' },
  { name: 'the popup of the date picker', ui: <DatePicker defaultOpen label="Date" />, target: '[data-slot=popover-content]', enchase: '320x368 > 256x294', shadcn: '266x306 > 258x296' },
  { name: 'the day of the date picker', ui: <DatePicker defaultOpen label="Date" />, target: '[data-slot=date-picker-calendar-day]', enchase: '40x40 > 32x32', shadcn: '32x32 > 32x32' },
  { name: 'the popover', ui: <Popover defaultOpen content={<p>Hello there</p>}><Button>Open</Button></Popover>, target: '[data-slot=popover-content]', enchase: '56 > 48', shadcn: '58 > 50' },
  { name: 'the close button of the modal', ui: <Modal isOpen onClose={noop} title="Title">Body</Modal>, target: '[data-slot=modal-close]', enchase: '40x40 > 32x32', shadcn: '32x32 > 32x32' },
  { name: 'the close button of the drawer', ui: <Drawer open onClose={noop} title="Title">Body</Drawer>, target: '[data-slot=drawer-close]', enchase: '40x40 > 32x32', shadcn: '32x32 > 32x32' },
  { name: 'the close button of the toast', ui: <Notifier />, target: '[data-slot=toast-close]', enchase: '40x40 > 32x32', shadcn: '32x32 > 32x32' }
]

const shifts: Part[] = [
  { name: 'the medium button', ui: <Button>Save</Button>, target: '[data-slot=button]', enchase: '-12', shadcn: '0' },
  { name: 'the small button', ui: <Button size="sm">Save</Button>, target: '[data-slot=button]', enchase: '-8', shadcn: '0' },
  { name: 'the large button', ui: <Button size="lg">Save</Button>, target: '[data-slot=button]', enchase: '-16', shadcn: '0' },
  { name: 'the badge', ui: <Badge>New</Badge>, target: '[data-slot=badge]', enchase: '-4', shadcn: '0' },
  { name: 'the tag', ui: <Tag>Tag</Tag>, target: '[data-slot=tag]', enchase: '-8', shadcn: '-8' },
  { name: 'the checkbox', ui: <Checkbox label="Terms" />, target: '[data-slot=checkbox]', enchase: '-4', shadcn: '0' },
  { name: 'the tab', ui: <Tabs items={tabs} />, target: '[data-slot=tabs-tab]', enchase: '-8', shadcn: '-8' }
]

describe.each(styles)('the compact density on the root, in the sizes of the parts in the %s style', (styleName) => {
  it.each(parts)('sizes $name as the table says, without and with the attribute on the root', async (part) => {
    const [initial, compact] = sizesOf(part[styleName])

    expectSize(await measure(part, styleName, null), initial, 'without the attribute')
    expectSize(await measure(part, styleName, 'compact'), compact, 'with the attribute')
  })

  it.each(shifts)('shifts the inline size of $name by its padding', async (part) => {
    const wanted = Number(part[styleName])
    const initial = await measure(part, styleName, null)
    const compact = await measure(part, styleName, 'compact')

    expect(compact.width - initial.width).toBeCloseTo(wanted, 0)
  })
})

describe.each(styles)('the compact density on the root, in the overlays that go to the body in the %s style', (styleName) => {
  it.each(overlays)('sizes $name, which is out of the page, from the attribute on the root', async (overlay) => {
    const [initial, compact] = sizesOf(overlay[styleName])
    const before = await measure(overlay, styleName, null)
    const after = await measure(overlay, styleName, 'compact')

    expect([before.portal, after.portal]).toEqual([true, true])
    expectSize(before, initial, 'without the attribute')
    expectSize(after, compact, 'with the attribute')
  })
})

const tokens = [
  ['--enchase-hit-size', '40px', '32px', '2rem', '32px'],
  ['--enchase-control-height-sm', '2rem', '1.75rem', '2rem', '1.75rem'],
  ['--enchase-control-height-md', '2.5rem', '2rem', '2.25rem', '2rem'],
  ['--enchase-control-height-lg', '3rem', '2.5rem', '2.5rem', '2.5rem'],
  ['--enchase-space-sm', '0.5rem', '0.375rem', '0.5rem', '0.375rem'],
  ['--enchase-space-md', '1rem', '0.75rem', '1rem', '0.75rem'],
  ['--enchase-space-lg', '1.5rem', '1.125rem', '1.5rem', '1.125rem'],
  ['--enchase-space-xl', '2rem', '1.5rem', '2rem', '1.5rem'],
  ['--enchase-space-2xl', '3rem', '2.25rem', '3rem', '2.25rem'],
  ['--enchase-space-3xl', '4rem', '3rem', '4rem', '3rem'],
  ['--enchase-hit-size-lg', '44px', '44px', '44px', '44px'],
  ['--enchase-space-xs', '0.25rem', '0.25rem', '0.25rem', '0.25rem']
]

const hooks = [
  ['--enchase-input-height', '', '2.75rem', '2.25rem', '2rem'],
  ['--enchase-textarea-min-height', '', '2.75rem', '4rem', '4rem'],
  ['--enchase-tabs-tab-min-height', '', '2.25rem', '2.25rem', '2rem'],
  ['--enchase-accordion-trigger-min-height', '', '2.5rem', '0px', '0px'],
  ['--enchase-select-option-padding-block', '', '0.5rem', '0.375rem', '0.375rem'],
  ['--enchase-badge-padding-inline-md', '', '0.5rem', '0.5rem', '0.5rem'],
  ['--enchase-sidebar-item-control-height', '', '2.5rem', '2rem', '2rem'],
  ['--enchase-sidebar-header-min-height', '', '4rem', '3.5rem', '3.5rem'],
  ['--enchase-navbar-bar-height', '', '3.5rem', '3.5rem', '3.5rem'],
  ['--enchase-layout-header-height', '', '3.5rem', '3.5rem', '3.5rem']
]

const onRoot = (names: string[], styleName: StyleName, density: string | null) => {
  setDensity(density)
  const view = show(<span />, styleName)
  const values = valuesOf(document.documentElement, names)

  view.unmount()

  return values
}

describe('the variables of the compact density on the root, as the browser computes them', () => {
  it('gives the tokens the compact values in the two styles, and leaves the large target and the extra small space alone', () => {
    const names = tokens.map(([name]) => name)

    expect(names).toEqual([...Object.keys(densities.compact.tokens), '--enchase-hit-size-lg', '--enchase-space-xs'])

    for (const [index, styleName] of styles.entries()) {
      expect(onRoot(names, styleName, null), `${styleName} without the attribute`).toEqual(tokens.map((token) => token[1 + 2 * index]))
      expect(onRoot(names, styleName, 'compact'), `${styleName} with the attribute`).toEqual(tokens.map((token) => token[2 + 2 * index]))
    }
  })

  it('gives the enchase style all the hooks of the density, because it declares none', () => {
    const names = hooks.map(([name]) => name)

    expect(names).toEqual(Object.keys(densities.compact.hooks))
    expect(onRoot(names, 'enchase', null)).toEqual(hooks.map((hook) => hook[1]))
    expect(onRoot(names, 'enchase', 'compact')).toEqual(hooks.map((hook) => hook[2]))
  })

  it('leaves the shadcn style half compact, because it declares the hooks itself and follows only the tokens, in the field and the tab through their alias of the control height', () => {
    const names = hooks.map(([name]) => name)
    const followed = ['--enchase-input-height', '--enchase-tabs-tab-min-height']
    const initial = onRoot(names, 'shadcn', null)
    const compact = onRoot(names, 'shadcn', 'compact')

    expect(initial).toEqual(hooks.map((hook) => hook[3]))
    expect(compact).toEqual(hooks.map((hook) => hook[4]))
    expect(names.filter((_, index) => initial[index] !== compact[index])).toEqual(followed)
  })
})

const sizedByTheStyle = [
  'the trigger of the accordion',
  'the row of the medium table',
  'the item of the sidebar',
  'the header of the sidebar',
  'the bar of the navbar',
  'the bar of the layout',
  'the alert',
  'the item of the menu'
]

describe('the shadcn style, which is half compact on purpose', () => {
  it.each(sizedByTheStyle)('keeps %s at the size that the style gave it, while the enchase style makes it smaller', async (name) => {
    const part = [...parts, ...overlays].find((item) => item.name === name) as Part
    const kept = [await measure(part, 'shadcn', null), await measure(part, 'shadcn', 'compact')]
    const shrunk = [await measure(part, 'enchase', null), await measure(part, 'enchase', 'compact')]

    expect(kept[1].height).toBe(kept[0].height)
    expect(shrunk[1].height).toBeLessThan(shrunk[0].height)
  })
})

const fields = [
  { name: 'input', prefix: 'input', field: 'input-field', ui: (labelPlacement?: LabelPlacement) => <Input label="Name" defaultValue="Ana" labelPlacement={labelPlacement} /> },
  { name: 'textarea', prefix: 'textarea', field: 'textarea-field', ui: (labelPlacement?: LabelPlacement) => <Textarea label="Notes" defaultValue="Ana" labelPlacement={labelPlacement} /> },
  { name: 'select', prefix: 'select', field: 'select-field', ui: (labelPlacement?: LabelPlacement) => <Select label="Plan" options={options} defaultValue="a" labelPlacement={labelPlacement} /> },
  { name: 'number input', prefix: 'number-input', field: 'number-input-field', ui: (labelPlacement?: LabelPlacement) => <NumberInput label="Amount" defaultValue={1} labelPlacement={labelPlacement} /> },
  { name: 'date picker', prefix: 'date-picker', field: 'date-picker-input', ui: (labelPlacement?: LabelPlacement) => <DatePicker label="Date" defaultValue="2026-01-15" labelPlacement={labelPlacement} /> },
  { name: 'combobox', prefix: 'combobox', field: 'combobox-input', ui: (labelPlacement?: LabelPlacement) => <Combobox label="Fruit" options={fruits} defaultValue="apple" labelPlacement={labelPlacement} /> }
]

const labelGeometry = async (field: (typeof fields)[number], styleName: StyleName, labelPlacement: LabelPlacement | undefined, density: string | null) => {
  setDensity(density)
  const view = show(field.ui(labelPlacement), styleName)

  await settle(() => view.container)

  const outline = `[data-slot=${field.prefix}-outline]`
  const box = (selector: string) => (document.querySelector(selector) as Element).getBoundingClientRect()
  const input = box(`[data-slot=${field.field}]`)
  const label = box(`[data-slot=${field.prefix}-label]`)
  const notch = box(`${outline} legend`)
  const span = box(`${outline} legend span`)
  const padding = parseFloat(getComputedStyle(document.querySelector(`${outline} legend span`) as Element).paddingLeft)
  const rtl = document.documentElement.dir === 'rtl'
  const middle = label.top + label.height / 2

  view.unmount()

  return {
    height: input.height,
    above: middle - input.top,
    centered: middle - (notch.top + notch.height / 2),
    aligned: rtl ? label.right - (span.right - padding) : label.left - (span.left + padding),
    gap: span.width - 2 * padding - label.width,
    notch: span.width,
    clearance: label.bottom - input.top,
    inside: rtl ? [span.right - label.right, label.left - span.left] : [label.left - span.left, span.right - label.right]
  }
}

describe.each(fields)('the label of the $name', (field) => {
  describe.each(['ltr', 'rtl'] as const)('in %s text', (direction) => {
    it('floats over the outline of the enchase style at the same height, alignment and notch gap in the compact density', async () => {
      document.documentElement.dir = direction

      const initial = await labelGeometry(field, 'enchase', undefined, null)
      const compact = await labelGeometry(field, 'enchase', undefined, 'compact')

      expect(compact.height).toBeLessThan(initial.height)
      expect(compact.above).toBeCloseTo(initial.above, 1)
      expect(compact.centered).toBeCloseTo(initial.centered, 1)
      expect(compact.aligned).toBeCloseTo(initial.aligned, 1)
      expect(compact.gap).toBeCloseTo(initial.gap, 1)
      expect(Math.abs(initial.gap)).toBeLessThan(0.1)
      expect(Math.abs(initial.aligned)).toBeLessThanOrEqual(2)
      expect(initial.above).toBeCloseTo(field.name === 'textarea' ? 0 : -3, 0)
      expect(initial.centered).toBeCloseTo(field.name === 'textarea' ? -0.5 : -3.5, 0)
    })

    it('stays above the field in the shadcn style, as far from it in the compact density, with no notch in the outline', async () => {
      document.documentElement.dir = direction

      const initial = await labelGeometry(field, 'shadcn', undefined, null)
      const compact = await labelGeometry(field, 'shadcn', undefined, 'compact')

      expect(compact.height).toBeLessThan(initial.height)
      expect(initial.clearance).toBeLessThan(0)
      expect(compact.clearance).toBeCloseTo(initial.clearance, 1)
      expect(compact.above).toBeCloseTo(initial.above, 1)
      expect([initial.notch, compact.notch]).toEqual([0, 0])
    })

    it('floats inside the notch of the shadcn style when asked to, at the same height and notch gap in the compact density', async () => {
      document.documentElement.dir = direction

      const initial = await labelGeometry(field, 'shadcn', 'floating', null)
      const compact = await labelGeometry(field, 'shadcn', 'floating', 'compact')

      expect(compact.above).toBeCloseTo(initial.above, 1)
      expect(compact.centered).toBeCloseTo(initial.centered, 1)
      expect(compact.gap).toBeCloseTo(initial.gap, 1)
      expect(Math.abs(initial.gap)).toBeLessThan(0.1)
      expect(initial.inside.every((margin) => margin >= 0)).toBe(true)
      expect(compact.inside.every((margin) => margin >= 0)).toBe(true)
    })
  })
})

const interactive =
  'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=menuitem], [role=option], [role=switch], [role=checkbox], [role=radio], [role=slider], [role=link], [role=combobox], [tabindex]:not([tabindex="-1"])'

const slotOf = (element: Element) => element.getAttribute('data-slot') ?? element.getAttribute('role') ?? element.tagName.toLowerCase()

const nameOf = (element: Element) => (slotOf(element) === 'link' ? `${element.parentElement?.closest('[data-slot]')?.getAttribute('data-slot') ?? 'page'} link` : slotOf(element))

const targetOf = (element: HTMLElement) => {
  const { width, height } = element.getBoundingClientRect()
  const choice = element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type)

  if (!choice && width * height > 4) return element

  return element.closest('label') ?? (element.id ? document.querySelector<HTMLElement>(`label[for="${element.id}"]`) : null)
}

const rounded = (value: number) => Math.round(value * 100) / 100

const targetsOf = (root: ParentNode) => {
  const found = new Set<HTMLElement>()

  for (const element of root.querySelectorAll<HTMLElement>(interactive)) {
    if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) || element.closest('[inert], [hidden], [aria-hidden=true]')) continue

    const target = targetOf(element)

    if (target) found.add(target)
  }

  return [...found].map((target) => {
    const { width, height } = target.getBoundingClientRect()

    return { name: nameOf(target), width: rounded(width), height: rounded(height) }
  })
}

const survey = async (styleName: StyleName, density: string | null) => {
  setDensity(density)
  const view = show(gallery, styleName)

  await settle(() => view.container)

  const found = targetsOf(view.container)

  view.unmount()

  return found
}

const smallest = { enchase: 'slider-thumb 20x20', shadcn: 'slider-thumb 16x16' }

const fill = ['combobox-input', 'sidebar-item link']

const inline = ['page link']

describe.each(styles)('the compact density on the root, in every target of the gallery in the %s style', (styleName) => {
  it('keeps the target at 24px or more in the compact density, but for the thumb of the slider, which was already smaller in the default one, and a link inside the text counts by its height only', async () => {
    const initial = await survey(styleName, null)
    const compact = await survey(styleName, 'compact')
    const below = (targets: typeof initial) => targets.filter(({ name, width, height }) => (inline.includes(name) ? height : Math.min(width, height)) < 24).map(({ name, width, height }) => `${name} ${width}x${height}`)

    expect(initial.length).toBeGreaterThan(60)
    expect(compact.map(({ name }) => name)).toEqual(initial.map(({ name }) => name))
    expect(below(initial)).toEqual([smallest[styleName]])
    expect(below(compact)).toEqual([smallest[styleName]])
  })

  it('never makes a target taller in the compact density', async () => {
    const initial = await survey(styleName, null)
    const compact = await survey(styleName, 'compact')

    expect(compact.filter(({ height }, index) => height > initial[index].height + 0.5).map(({ name }) => name)).toEqual([])
    expect(compact.filter(({ height }, index) => height < initial[index].height - 0.5).length).toBeGreaterThan(30)
  })

  it('makes a target wider in the compact density only where it fills the room that a neighbor gave back: the input of the combobox and the items of the sidebar', async () => {
    const initial = await survey(styleName, null)
    const compact = await survey(styleName, 'compact')
    const wider = compact.filter(({ width }, index) => width > initial[index].width + 0.5).map(({ name }) => name)

    expect([...new Set(wider)]).toEqual(fill)
  })
})

const probes = [
  'width',
  'height',
  'min-height',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-bottom',
  'column-gap',
  'row-gap',
  'font-size',
  'line-height'
]

const variables = [...Object.keys(densities.compact.tokens), ...Object.keys(densities.compact.hooks)]

const snapshot = async (styleName: StyleName, density: string | null) => {
  setDensity(density)
  const view = show(gallery, styleName)

  await settle(() => view.container)

  const parts = await settledCapture(view.container, probes)
  const root = valuesOf(document.documentElement, variables)

  view.unmount()

  return { parts, root }
}

describe.each(styles)('the default look of the %s style', (styleName) => {
  it.each(['default', 'spacious', ''])('is the same with the value "%s" on the root as with no attribute, in every part of the gallery and in every variable', async (value) => {
    const initial = await snapshot(styleName, null)
    const other = await snapshot(styleName, value)

    expect(initial.parts.length).toBeGreaterThan(150)
    expect(differences(initial.parts, other.parts)).toEqual([])
    expect(other.root).toEqual(initial.root)
  })

  it('is what the same measures tell apart from the compact density, which changes most of the parts', async () => {
    const initial = await snapshot(styleName, null)
    const compact = await snapshot(styleName, 'compact')

    expect(differences(initial.parts, compact.parts).length).toBeGreaterThan(80)
  })
})

describe.each(styles)('the active indicator of the sidebar in the %s style', (styleName) => {
  it('stays on its item while the attribute goes on and off the root after the sidebar is mounted', async () => {
    show(<Sidebar sections={sections} currentHref="/docs" header={<span>Brand</span>} />, styleName)

    const item = () => document.querySelector('[data-slot=sidebar-item] [aria-current]') as HTMLElement
    const indicator = () => document.querySelector('[data-slot=sidebar-indicator]') as HTMLElement
    const misfit = () => {
      const marker = indicator().getBoundingClientRect()
      const current = item().getBoundingClientRect()

      return Math.max(Math.abs(marker.top - current.top), Math.abs(marker.height - current.height))
    }
    const heights = { enchase: [40, 52, 40], shadcn: [32, 32, 32] }[styleName]
    const tops: number[] = []

    await expect.poll(misfit, { timeout: 4000 }).toBeLessThanOrEqual(0.5)
    tops.push(item().getBoundingClientRect().top)

    for (const [index, density] of ['compact', null, 'compact'].entries()) {
      setDensity(density)

      expect(item().getBoundingClientRect().height).toBe(heights[index])
      await expect.poll(misfit, { timeout: 4000 }).toBeLessThanOrEqual(0.5)
      tops.push(item().getBoundingClientRect().top)
    }

    expect(tops[1]).not.toBe(tops[0])
    expect(tops[2]).toBe(tops[0])
    expect(tops[3]).toBe(tops[1])
  })
})
