import { afterEach, describe, expect, it } from 'vitest'

import { ConfirmModal, Modal } from '@components/common/Modal/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { Accordion } from '@components/common/Accordion/index.tsx'
import { Combobox } from '@components/common/Combobox/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Alert } from '@components/common/Alert/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { workbench } from '@styles/presets/workbench.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { part, style } from '../support/hookProbes.ts'
import { waitForSettled } from '../support/settle.ts'
import Layout from '@components/layout/index.tsx'

import type { ReactElement } from 'react'

const styled = { style: workbench } as const

const show = (ui: ReactElement, density?: 'compact') => {
  renderInBrowser(ui, 'never', 'light', styled)

  if (density) document.documentElement.setAttribute('data-density', density)
}

const px = (value: string) => parseFloat(value)

const baseSelect = CSS.supports('appearance', 'base-select')

const options = [
  { value: 'br', label: 'Brasil' },
  { value: 'pt', label: 'Portugal' }
]

const tabs = [
  { value: 'one', label: 'One', content: <p>First</p> },
  { value: 'two', label: 'Two', content: <p>Second</p> }
]

const accordion = (
  <Accordion
    items={[
      { value: 'a', title: 'First', content: <p>One</p> },
      { value: 'b', title: 'Second', content: <p>Two</p> }
    ]}
    defaultValue={['a']}
  />
)

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'age', header: 'Age' }
]

const rows = [
  { name: 'Ana', age: 32 },
  { name: 'Bia', age: 41 }
]

const sections = [{ id: 's1', title: 'Main', items: [{ id: 'home', label: 'Home', href: '/' }, { id: 'docs', label: 'Docs', href: '/docs' }] }]

const sidebarLink = (index: number) => () => part('sidebar-nav').querySelectorAll('a')[index]

const cellOf = (row: number) => getComputedStyle(part('table-row', row).querySelector('td') as HTMLElement)

afterEach(() => {
  document.documentElement.removeAttribute('data-density')
  document.documentElement.removeAttribute('style')
})

describe('the compact density of the workbench style, in the tabs and the accordion', () => {
  it('makes the tab 36px high with 8px above and below the text, as the original does, and keeps 16px on each side, because the original keeps the 32px between the tabs', () => {
    show(<Tabs ariaLabel="Account" items={tabs} defaultValue="one" />, 'compact')
    const tab = style('tabs-tab')

    expect(part('tabs-tab').getBoundingClientRect().height).toBe(36)
    expect([px(tab.paddingTop), px(tab.paddingBottom)]).toEqual([8, 8])
    expect([px(tab.paddingLeft), px(tab.paddingRight)]).toEqual([16, 16])
  })

  it('brings the 46px tab back when the attribute leaves the root', () => {
    show(<Tabs ariaLabel="Account" items={tabs} defaultValue="one" />, 'compact')
    document.documentElement.removeAttribute('data-density')

    expect(part('tabs-tab').getBoundingClientRect().height).toBe(46)
    expect(px(style('tabs-tab').paddingTop)).toBe(12)
  })

  it('makes the trigger 36px high with 8px above and below the title, as the original does, and the content 8px below and 16px at the sides', () => {
    show(accordion, 'compact')
    const trigger = style('accordion-trigger')
    const panel = style('accordion-panel')

    expect(part('accordion-trigger').getBoundingClientRect().height).toBe(36)
    expect([px(trigger.paddingTop), px(trigger.paddingBottom), px(trigger.paddingLeft)]).toEqual([8, 8, 8])
    expect([px(panel.paddingBottom), px(panel.paddingLeft), px(panel.paddingRight)]).toEqual([8, 16, 16])
  })
})

describe('the compact density of the workbench style, in the lists', () => {
  it('pads the option of the combobox by 4px above and below and 12px at the sides, as the original does, which makes it 30px high where the original is 28px because the style keeps the type', async () => {
    show(<Combobox label="Fruit" options={options} defaultOpen />, 'compact')
    await waitForSettled(() => part('combobox-listbox'))
    const option = style('combobox-option')

    expect([px(option.paddingTop), px(option.paddingBottom)]).toEqual([4, 4])
    expect([px(option.paddingLeft), px(option.paddingRight)]).toEqual([12, 12])
    expect(part('combobox-option').getBoundingClientRect().height).toBeCloseTo(30, 0)
  })

  it.runIf(baseSelect)('pads the option of the select by 4px above and below and 12px at the sides, as the original does', () => {
    show(<Select label="Country" options={options} defaultValue="pt" />, 'compact')
    const option = getComputedStyle(document.querySelector('select option') as HTMLElement)

    expect([px(option.paddingTop), px(option.paddingBottom)]).toEqual([4, 4])
    expect([px(option.paddingLeft), px(option.paddingRight)]).toEqual([12, 12])
  })

  it('makes the item of the sidebar 35px high, as the original does, and keeps 4px between the items', () => {
    show(<Sidebar variant="permanent" currentHref="/" sections={sections} />, 'compact')
    const first = sidebarLink(0)().getBoundingClientRect()
    const second = sidebarLink(1)().getBoundingClientRect()

    expect([first.height, second.height]).toEqual([35, 35])
    expect(second.top - first.bottom).toBe(4)
  })
})

describe('the compact density of the workbench style, in the buttons and the fields', () => {
  it('pads the medium and the large button by 11px at the sides and makes them 28px and 35px high, as the original does, and keeps the 7px and the 24px of the small one, where the original is 21px high, under the floor of 24px for a target', () => {
    show(
      <>
        <Button size="sm">Save</Button>
        <Button size="md">Save</Button>
        <Button size="lg">Save</Button>
        <Button size="md" variant="ghost">
          Save
        </Button>
      </>,
      'compact'
    )

    expect([0, 1, 2, 3].map((index) => px(style('button', index).paddingLeft))).toEqual([7, 11, 11, 11])
    expect([0, 1, 2].map((index) => part('button', index).getBoundingClientRect().height)).toEqual([24, 28, 35])
  })

  it('pads the field by 8px at the sides, which is the 7px of the original and its 1px border, and the textarea by 4px above and below, which is the 3px of the original and its 1px border', () => {
    show(
      <>
        <Input label="Name" />
        <Textarea label="Notes" />
      </>,
      'compact'
    )

    expect(px(style('input-field').paddingLeft)).toBe(8)
    expect(px(style('input-control').height)).toBe(28)
    expect(px(style('textarea-field').paddingTop)).toBe(4)
    expect(px(style('textarea-field').paddingLeft)).toBe(8)
  })
})

describe('the compact density of the workbench style, in the containers', () => {
  it('pads the cell of the table by 8px, as the original does, and the cell of the small table by 4px', () => {
    show(
      <>
        <Table columns={columns} rows={rows} ariaLabel="People" />
        <Table columns={columns} rows={rows} ariaLabel="Small people" size="sm" />
      </>,
      'compact'
    )

    expect([px(cellOf(0).paddingTop), px(cellOf(0).paddingLeft)]).toEqual([8, 8])
    expect([px(cellOf(2).paddingTop), px(cellOf(2).paddingLeft)]).toEqual([4, 4])
  })

  it('pads the body of the card by 16px, as the original does', () => {
    show(<Card>Body</Card>, 'compact')

    expect([px(style('card').paddingTop), px(style('card').paddingLeft)]).toEqual([16, 16])
  })

  it('pads the modal by 16px on every side, as the original does, with 4px between the header and the body and 8px between the body and the footer', async () => {
    show(
      <Modal isOpen onClose={() => undefined} title="Title" footer={<Button>Save</Button>}>
        Body
      </Modal>,
      'compact'
    )
    await waitForSettled(() => part('modal-panel'))

    expect([px(style('modal-header').paddingTop), px(style('modal-header').paddingBottom), px(style('modal-header').paddingLeft)]).toEqual([16, 0, 16])
    expect([px(style('modal-body').paddingTop), px(style('modal-body').paddingBottom), px(style('modal-body').paddingLeft)]).toEqual([4, 8, 16])
    expect([px(style('modal-footer').paddingTop), px(style('modal-footer').paddingBottom), px(style('modal-footer').paddingLeft)]).toEqual([0, 16, 16])
  })

  it('gives the confirm modal the same compact padding', async () => {
    show(<ConfirmModal isOpen onClose={() => undefined} onConfirm={() => undefined} title="Delete" message="Sure?" />, 'compact')
    await waitForSettled(() => part('modal-panel'))

    expect([px(style('modal-header').paddingTop), px(style('modal-footer').paddingBottom)]).toEqual([16, 16])
  })

  it('pads the alert by 4px above and below and 12px at the sides, as the original does', () => {
    show(<Alert variant="info">Message</Alert>, 'compact')

    expect([px(style('alert').paddingTop), px(style('alert').paddingBottom)]).toEqual([4, 4])
    expect([px(style('alert').paddingLeft), px(style('alert').paddingRight)]).toEqual([12, 12])
  })

  it('makes the bar of the layout 56px high, as the original does, from the default compact block, because the style does not declare the height of the bar', () => {
    show(
      <Layout pageTitle="Teste" navigationSections={demoSections}>
        <p>Content</p>
      </Layout>,
      'compact'
    )

    expect(part('layout-header').getBoundingClientRect().height).toBe(56)
  })

  it('brings the default padding back when the attribute leaves the root', () => {
    show(
      <>
        <Card>Body</Card>
        <Alert variant="info">Message</Alert>
        <Table columns={columns} rows={rows} ariaLabel="People" />
      </>,
      'compact'
    )
    document.documentElement.removeAttribute('data-density')

    expect(px(style('card').paddingTop)).toBe(24)
    expect(px(style('alert').paddingTop)).toBe(8)
    expect(px(cellOf(0).paddingTop)).toBe(16)
  })
})
