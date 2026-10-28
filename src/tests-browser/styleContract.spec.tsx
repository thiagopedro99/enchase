import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Accordion } from '@components/common/Accordion/index.tsx'
import { Alert } from '@components/common/Alert/index.tsx'
import { Avatar } from '@components/common/Avatar/index.tsx'
import { Badge } from '@components/common/Badge/index.tsx'
import Breadcrumbs from '@components/common/Breadcrumbs/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { CardButton } from '@components/common/CardButton/index.tsx'
import { CardLink } from '@components/common/CardLink/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { CheckboxGroup } from '@components/common/CheckboxGroup/index.tsx'
import { Drawer } from '@components/common/Drawer/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Menu } from '@components/common/Menu/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { Pagination } from '@components/common/Pagination/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'
import { Slider } from '@components/common/Slider/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { Tag } from '@components/common/Tag/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { builtInStyleEntries } from '@tests/shared/fixtures/styles.ts'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { renderInBrowser } from './harness.tsx'
import { part, parts, style } from './hookProbes.ts'
import { waitForSettled } from './settle.ts'

import type { ReactElement } from 'react'

const px = (value: string) => parseFloat(value)

const paintPage = () => {
  document.body.style.backgroundColor = 'var(--enchase-color-background)'
  document.body.style.color = 'var(--enchase-color-text-primary)'
}

const options = [
  { value: 'br', label: 'Brasil' },
  { value: 'pt', label: 'Portugal' }
]

const variants = [
  ['light', undefined],
  ['dark', undefined],
  ['light', '#0B6BCB'],
  ['dark', '#0B6BCB']
] as const

const everything = (
  <div style={{ display: 'grid', gap: '1rem', padding: '1rem' }}>
    <div>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
    <Input label="Email" helperText="Never shared" />
    <Input label="Email" defaultValue="ana@" error="Invalid email" />
    <Input label="Name" placeholder="Type here" />
    <NumberInput label="Amount" defaultValue={2} />
    <Select label="Country" options={options} />
    <Textarea label="Notes" placeholder="Type here" />
    <Checkbox label="Accept the terms" />
    <Switch label="Alerts" />
    <RadioGroup label="Plan" options={[{ value: 'a', label: 'Free' }]} helperText="Change any time" />
    <SegmentedControl ariaLabel="View" items={[{ value: 'a', label: 'List' }, { value: 'b', label: 'Board' }]} defaultValue="a" />
    <SegmentedControl multiple ariaLabel="Days" items={[{ value: 'a', label: 'Mon' }, { value: 'b', label: 'Tue' }]} defaultValue={['b']} />
    <CheckboxGroup label="Topics" options={[{ value: 'a', label: 'News' }]} defaultValue={['a']} helperText="Pick any" />
    <CheckboxGroup label="Channels" options={[{ value: 'a', label: 'Email' }]} error="Pick one" />
    <Slider label="Volume" showValue defaultValue={40} />
    <div>
      {(['neutral', 'primary', 'success', 'warning', 'error', 'info'] as const).map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
    <div>
      <Tag>Static tag</Tag>
      <Tag size="sm" onRemove={() => undefined}>
        Removable tag
      </Tag>
      <Avatar name="Ana Souza" size="sm" />
      <Avatar name="Ana Souza" />
    </div>
    {(['info', 'success', 'warning', 'error'] as const).map((variant) => (
      <Alert key={variant} variant={variant} title={`Alert ${variant}`}>
        Message of the alert
      </Alert>
    ))}
    <Tabs
      items={[
        { value: 'a', label: 'Account', content: 'First' },
        { value: 'b', label: 'Password', content: 'Second' }
      ]}
    />
    <Accordion items={[{ value: 'a', title: 'Question', content: 'Answer' }]} defaultValue={['a']} />
    <Breadcrumbs
      items={[
        { id: 'home', label: 'Home', href: '/' },
        { id: 'now', label: 'Now' }
      ]}
    />
    <Pagination pageCount={5} defaultPage={2} />
    <Table caption="Orders" columns={[{ key: 'name', header: 'Name' }]} rows={[{ name: 'Ana' }]} />
    <Card>Card text</Card>
    <CardButton>Button tile text</CardButton>
    <CardLink href="/tile" variant="outlined">
      Link tile text
    </CardLink>
    <CardButton variant="elevated">Elevated tile text</CardButton>
  </div>
)

const audit = async () => {
  const results = await axe.run(document.body, { runOnly: { type: 'rule', values: ['color-contrast'] } })
  const unchecked = results.incomplete.flatMap((item) => item.nodes.map((node) => document.querySelector(node.target.join(' '))))

  return {
    checked: results.passes.flatMap((item) => item.nodes).length,
    violations: results.violations.flatMap((violation) => violation.nodes.map((node) => `${node.target.join(' ')}: ${node.any[0]?.message ?? ''}`)),
    unchecked
  }
}

const background = () => getComputedStyle(document.documentElement).getPropertyValue('--enchase-color-background').trim()

describe.each(builtInStyleEntries)('the contract of the %s style in a real browser', (_, themeStyle) => {
  const show = (ui: ReactElement, mode: 'light' | 'dark' = 'light', brand?: string) => renderInBrowser(ui, 'never', mode, { style: themeStyle, ...(brand === undefined ? {} : { brand }) })

  it.each(variants)('has no color contrast violation in the %s mode with the brand %s, and measures by hand what axe cannot read: the labels that float on the outline and the text of the fields', async (mode, brand) => {
    paintPage()
    show(everything, mode, brand)
    await waitForSettled(() => document.body)

    const { checked, violations, unchecked } = await audit()
    const fields = [...document.querySelectorAll<HTMLElement>('input:not([type="checkbox"]):not([type="radio"]):not([role="switch"]), select, textarea')]

    expect(checked).toBeGreaterThan(30)
    expect(violations).toEqual([])
    expect(fields.length).toBeGreaterThanOrEqual(6)

    const labels = [...document.querySelectorAll<HTMLElement>('[data-slot$="-label"]')]

    expect(unchecked.filter((element) => element && !fields.includes(element as HTMLElement) && !labels.includes(element as HTMLElement))).toEqual([])

    for (const label of unchecked.filter((element): element is HTMLElement => element !== null && labels.includes(element as HTMLElement))) {
      expect(contrastRatio(getComputedStyle(label).color, background()), `label ${label.textContent}`).toBeGreaterThanOrEqual(4.5)
    }

    for (const field of fields) expect(contrastRatio(getComputedStyle(field).color, background()), `text of ${field.id}`).toBeGreaterThanOrEqual(4.5)

    for (const field of fields.filter((element) => element.hasAttribute('placeholder') && element.getAttribute('placeholder') !== ' ')) {
      expect(contrastRatio(getComputedStyle(field, '::placeholder').color, background()), `placeholder of ${field.id}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it.each(['light', 'dark'] as const)('keeps the overlays above the contrast floor in the %s mode', async (mode) => {
    paintPage()
    show(
      <Modal isOpen onClose={() => undefined} title="Title" footer={<Button>Save</Button>}>
        <Input label="Name" />
      </Modal>,
      mode
    )
    await expect.poll(() => parts('modal-panel').length).toBe(1)
    await waitForSettled(() => document.body)
    const { violations } = await audit()

    expect(violations).toEqual([])
  })

  it.each(['light', 'dark'] as const)('keeps the drawer above the contrast floor in the %s mode', async (mode) => {
    paintPage()
    show(
      <Drawer open onClose={() => undefined} title="Title" footer={<Button>Save</Button>}>
        <Input label="Name" />
      </Drawer>,
      mode
    )
    await expect.poll(() => parts('drawer-panel').length).toBe(1)
    await waitForSettled(() => document.body)
    const { violations } = await audit()

    expect(violations).toEqual([])
  })

  it.each(['light', 'dark'] as const)('keeps the menu above the contrast floor in the %s mode', async (mode) => {
    paintPage()
    show(
      <Menu
        defaultOpen
        label="Actions"
        items={[
          { id: 'edit', label: 'Edit', icon: <svg /> },
          { id: 'split', separator: true },
          { id: 'archive', label: 'Archive', disabled: true },
          { id: 'delete', label: 'Delete' }
        ]}
      >
        <Button>Open</Button>
      </Menu>,
      mode
    )
    await expect.poll(() => parts('menu').length).toBe(1)
    await waitForSettled(() => document.body)
    const { violations } = await audit()

    expect(violations).toEqual([])
  })

  it('keeps every target at the 24px floor or more', () => {
    show(
      <>
        <Button size="sm">Save</Button>
        <Input label="Name" />
        <Checkbox label="Accept" />
        <Switch label="Alerts" />
        <RadioGroup label="Plan" options={[{ value: 'a', label: 'A' }]} />
      </>
    )

    for (const name of ['button', 'input-field', 'checkbox', 'switch', 'radio-group-option']) expect(part(name).getBoundingClientRect().height, name).toBeGreaterThanOrEqual(24)
  })

  it('draws a focus ring of 2px or more on the button', async () => {
    show(<Button>Save</Button>)
    await userEvent.tab()

    expect(style('button').outlineStyle).not.toBe('none')
    expect(px(style('button').outlineWidth)).toBeGreaterThanOrEqual(2)
  })

  it('draws a focus ring of 2px or more on the checkbox', async () => {
    show(<Checkbox label="Accept" />)
    await userEvent.tab()

    expect(style('checkbox-input').outlineStyle).not.toBe('none')
    expect(px(style('checkbox-input').outlineWidth)).toBeGreaterThanOrEqual(2)
  })
})
