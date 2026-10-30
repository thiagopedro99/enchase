import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { ConfirmModal, Modal } from '@components/common/Modal/index.tsx'
import { Accordion } from '@components/common/Accordion/index.tsx'
import { Popover } from '@components/common/Popover/index.tsx'
import { Drawer } from '@components/common/Drawer/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { at, part, style } from '../support/hookProbes.ts'
import { Card } from '@components/common/Card/index.tsx'
import { workbench } from '@styles/presets/workbench.ts'
import { parseComputedColor } from '../support/color.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { waitForSettled } from '../support/settle.ts'

import type { ReactElement } from 'react'

const styled = { style: workbench } as const

const show = (ui: ReactElement, mode: 'light' | 'dark' = 'light') => renderInBrowser(ui, 'never', mode, styled)

const showDark = async (ui: ReactElement) => {
  show(ui, 'dark')
  await expect.poll(() => document.documentElement.dataset.theme).toBe('dark')
  await waitForSettled(() => document.body)
}

const px = (value: string) => parseFloat(value)

const alphaOf = (value: string) => parseComputedColor(value).a

const channelsOf = (value: string) => {
  const { r, g, b } = parseComputedColor(value)

  return [r, g, b]
}

const popupShadow = 'rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px'

const cardShadow = 'rgba(0, 0, 0, 0.16) 0px 1px 2px -2px, rgba(0, 0, 0, 0.12) 0px 3px 6px 0px, rgba(0, 0, 0, 0.09) 0px 5px 12px 4px'

const darkShadow = 'rgba(0, 0, 0, 0.5) 0px 1px 2px 0px, rgba(0, 0, 0, 0.3) 0px 2px 6px 2px'

const accordion = (
  <Accordion
    items={[
      { value: 'a', title: 'First', content: <p>One</p> },
      { value: 'b', title: 'Second', content: <p>Two</p> },
      { value: 'c', title: 'Third', content: <p>Three</p> }
    ]}
    defaultValue={['a']}
  />
)

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'age', header: 'Age' },
  { key: 'city', header: 'City' }
]

const rows = [
  { name: 'Ana', age: 32, city: 'Lisbon' },
  { name: 'Bia', age: 41, city: 'Porto' },
  { name: 'Caio', age: 27, city: 'Recife' }
]

const table = <Table columns={columns} rows={rows} getRowKey={(row) => row.name} ariaLabel="People" selectedKeys={['Bia']} onSelectedKeysChange={() => undefined} />

const plainTable = <Table columns={columns} rows={rows} getRowKey={(row) => row.name} ariaLabel="People" />

const modal = (
  <Modal isOpen onClose={() => undefined} title="Title" footer={<Button>Save</Button>}>
    Body
  </Modal>
)

const drawer = (
  <Drawer open onClose={() => undefined} title="Title" footer={<Button>Save</Button>}>
    Body
  </Drawer>
)

const popover = (
  <Popover content={<span>Content</span>} defaultOpen>
    <button type="button">Open</button>
  </Popover>
)

const rowCell = (row: number, column = 0) => part('table-row', row).querySelectorAll('td, th')[column] as HTMLElement

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the accordion of the workbench style', () => {
  it('drops the box around the group, which the original draws in #D9D9D9 with 8px corners, as the flat accordion of the other style does', () => {
    show(accordion)
    const box = style('accordion')

    expect(px(box.borderTopLeftRadius)).toBe(0)
    expect(box.borderTopColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('makes the trigger 46px high with 12px above and below the title, 16px on each side and 14px regular type, as the original does', () => {
    show(accordion)
    const trigger = style('accordion-trigger')

    expect(part('accordion-trigger').getBoundingClientRect().height).toBe(46)
    expect([px(trigger.paddingTop), px(trigger.paddingBottom)]).toEqual([12, 12])
    expect([px(trigger.paddingLeft), px(trigger.paddingRight)]).toEqual([16, 16])
    expect(px(trigger.fontSize)).toBe(14)
    expect(trigger.fontWeight).toBe('400')
    expect(trigger.columnGap).toBe('12px')
  })

  it('fills the trigger with the second surface, #FAFAFA, which is the 2% fill of the original flattened over white', () => {
    show(accordion)

    expect(style('accordion-trigger').backgroundColor).toBe('rgb(250, 250, 250)')
  })

  it('pads the content by 16px at the sides and below, where the original also pads it by 16px above because the panel has no hook for the top', () => {
    show(accordion)
    const panel = style('accordion-panel')

    expect([px(panel.paddingLeft), px(panel.paddingRight), px(panel.paddingBottom)]).toEqual([16, 16, 16])
    expect(px(panel.paddingTop)).toBe(0)
  })

  it('keeps a 1px line in the border color between the items', () => {
    show(accordion)
    const second = style('accordion-item', 1)

    expect(second.borderTopWidth).toBe('1px')
    expect(second.borderTopColor).toBe('rgb(240, 240, 240)')
  })

  it('fills the trigger with the elevated surface #1F1F1F and draws the line in #303030 in the dark mode', async () => {
    await showDark(accordion)

    expect(style('accordion-trigger').backgroundColor).toBe('rgb(31, 31, 31)')
    expect(style('accordion-item', 1).borderTopColor).toBe('rgb(48, 48, 48)')
  })
})

describe('the card of the workbench style', () => {
  it('draws the card white with a 1px border in the border color, 8px corners and 24px of padding, as the original does', () => {
    show(<Card>Body</Card>)
    const card = style('card')

    expect(card.backgroundColor).toBe('rgb(255, 255, 255)')
    expect(card.borderTopWidth).toBe('1px')
    expect(card.borderTopColor).toBe('rgb(240, 240, 240)')
    expect(px(card.borderTopLeftRadius)).toBe(8)
    expect(px(card.paddingTop)).toBe(24)
    expect(px(card.paddingLeft)).toBe(24)
  })

  it('keeps the elevated card white, with the small shadow at rest and the card shadow of the original under the pointer', async () => {
    show(<Card variant="elevated">Body</Card>)

    expect(style('card').backgroundColor).toBe('rgb(255, 255, 255)')
    expect(style('card').boxShadow).toBe('rgba(0, 0, 0, 0.05) 0px 1px 2px 0px, rgba(0, 0, 0, 0.03) 0px 1px 6px -1px, rgba(0, 0, 0, 0.03) 0px 2px 4px 0px')
    await userEvent.hover(part('card'))
    await waitForSettled(at('card'))
    expect(style('card').boxShadow).toBe(cardShadow)
  })

  it('paints the card in the dark surface with a #303030 border, and lifts the elevated card with the shadow of the dark mode, which is not the white glow of the original', async () => {
    await showDark(
      <>
        <Card>Body</Card>
        <Card variant="elevated">Lifted</Card>
      </>
    )

    expect(style('card', 0).backgroundColor).toBe('rgb(20, 20, 20)')
    expect(style('card', 0).borderTopColor).toBe('rgb(48, 48, 48)')
    await userEvent.hover(part('card', 1))
    await waitForSettled(at('card', 1))
    expect(style('card', 1).boxShadow).toBe(darkShadow)
  })
})

describe('the table of the workbench style', () => {
  it('pads the cell by 16px and makes the row 55px high, which is the 16px, the 22px line, the 16px and the 1px line of the original', () => {
    show(plainTable)
    const cell = getComputedStyle(rowCell(0))

    expect([px(cell.paddingTop), px(cell.paddingBottom), px(cell.paddingLeft), px(cell.paddingRight)]).toEqual([16, 16, 16, 16])
    expect(part('table-row', 0).getBoundingClientRect().height).toBeCloseTo(55, 0)
  })

  it('pads the cell of the small table by 8px and makes the row 39px high, as the original does', () => {
    show(<Table columns={columns} rows={rows} ariaLabel="People" size="sm" />)
    const cell = getComputedStyle(rowCell(0))

    expect([px(cell.paddingTop), px(cell.paddingLeft)]).toEqual([8, 8])
    expect(part('table-row', 0).getBoundingClientRect().height).toBeCloseTo(39, 0)
  })

  it('draws no box around the table and rounds it at 8px, where the original rounds only the top corners', () => {
    show(plainTable)
    const box = style('table')

    expect(box.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(px(box.borderTopLeftRadius)).toBe(8)
  })

  it('writes the header in 600 weight and 0.88 black on #FAFAFA, as the original does, with a 1px line in the border color between the columns where the original draws a 1.6em separator', () => {
    show(plainTable)
    const header = style('table-header', 0)

    expect(header.fontWeight).toBe('600')
    expect(header.color).toBe('rgba(0, 0, 0, 0.88)')
    expect(header.backgroundColor).toBe('rgb(250, 250, 250)')
    expect(header.borderRightWidth).toBe('1px')
    expect(header.borderRightStyle).toBe('solid')
    expect(header.borderRightColor).toBe('rgb(240, 240, 240)')
    expect(style('table-header', 2).borderRightWidth).toBe('0px')
  })

  it('draws the line under each cell in the border color and writes the cells in 14px regular type', () => {
    show(plainTable)
    const cell = getComputedStyle(rowCell(0, 1))

    expect(cell.borderBottomWidth).toBe('1px')
    expect(cell.borderBottomColor).toBe('rgb(240, 240, 240)')
    expect(px(cell.fontSize)).toBe(14)
    expect(cell.fontWeight).toBe('400')
  })

  it('writes the row header in 14px regular type, as the original writes its cells', () => {
    show(
      <Table
        columns={[
          { key: 'name', header: 'Name', rowHeader: true },
          { key: 'age', header: 'Age' }
        ]}
        rows={rows}
        ariaLabel="People"
      />
    )
    const header = style('table-row-header')

    expect(px(header.fontSize)).toBe(14)
    expect(header.fontWeight).toBe('400')
  })

  it('lays 2% of the text color over the row under the pointer, as the original paints #FAFAFA', async () => {
    show(plainTable)
    await userEvent.hover(part('table-row', 0))
    await waitForSettled(at('table'))

    expect(alphaOf(getComputedStyle(part('table-row', 0)).backgroundColor)).toBeCloseTo(0.0176, 2)
  })

  it('fills the selected row with the primary container #E6F4FF, as the original does, and moves it 12% towards the primary blue under the pointer, where the original paints #BAE0FF', async () => {
    show(table)

    expect(getComputedStyle(part('table-row', 1)).backgroundColor).toBe('rgb(230, 244, 255)')
    await userEvent.hover(part('table-row', 1))
    await waitForSettled(at('table'))
    expect(channelsOf(getComputedStyle(part('table-row', 1)).backgroundColor)).toEqual([203, 225, 250])
  })

  it('fills the header with the elevated surface #1F1F1F and the selected row with the dark primary container in the dark mode', async () => {
    await showDark(table)

    expect(style('table-header', 1).backgroundColor).toBe('rgb(31, 31, 31)')
    expect(style('table-header', 1).borderRightColor).toBe('rgb(48, 48, 48)')
    expect(getComputedStyle(part('table-row', 1)).backgroundColor).toBe('rgb(21, 50, 91)')
  })
})

describe('the modal of the workbench style', () => {
  it('makes the panel 520px wide with 8px corners and the popup shadow of the original, in white', async () => {
    show(modal)
    await waitForSettled(at('modal-panel'))
    const panel = style('modal-panel')

    expect(part('modal-panel').getBoundingClientRect().width).toBe(520)
    expect(px(panel.borderTopLeftRadius)).toBe(8)
    expect(panel.backgroundColor).toBe('rgb(255, 255, 255)')
    expect(panel.boxShadow).toBe(popupShadow)
  })

  it('pads the panel by 20px above and below and 24px at the sides, which the header, the body and the footer share, with the 8px and 12px of space that the original keeps as margins', async () => {
    show(modal)
    await waitForSettled(at('modal-panel'))

    expect([px(style('modal-header').paddingTop), px(style('modal-header').paddingLeft)]).toEqual([20, 24])
    expect([px(style('modal-body').paddingTop), px(style('modal-body').paddingBottom), px(style('modal-body').paddingLeft)]).toEqual([8, 12, 24])
    expect([px(style('modal-footer').paddingBottom), px(style('modal-footer').paddingLeft)]).toEqual([20, 24])
  })

  it('writes the title in 16px with 600 weight and the body in 14px and 0.88 black, as the original does', async () => {
    show(modal)
    await waitForSettled(at('modal-panel'))

    expect(px(style('modal-title').fontSize)).toBe(16)
    expect(style('modal-title').fontWeight).toBe('600')
    expect(px(style('modal-body').fontSize)).toBe(14)
    expect(style('modal-body').color).toBe('rgba(0, 0, 0, 0.88)')
  })

  it('makes the close button 32px by 32px with 4px corners, as the original does', async () => {
    show(modal)
    await waitForSettled(at('modal-panel'))
    const box = part('modal-close').getBoundingClientRect()

    expect([box.width, box.height]).toEqual([32, 32])
    expect(px(style('modal-close').borderTopLeftRadius)).toBe(4)
  })

  it('gives the confirm modal the same panel, 520px wide where the original confirm is 416px because both read one width hook', async () => {
    show(<ConfirmModal isOpen onClose={() => undefined} onConfirm={() => undefined} title="Delete" message="Sure?" />)
    await waitForSettled(at('modal-panel'))

    expect(part('modal-panel').getBoundingClientRect().width).toBe(520)
    expect(style('modal-panel').backgroundColor).toBe('rgb(255, 255, 255)')
    expect(px(style('modal-title').fontSize)).toBe(16)
  })

  it('fills the panel with the elevated surface #1F1F1F in the dark mode', async () => {
    await showDark(modal)
    await waitForSettled(at('modal-panel'))

    expect(style('modal-panel').backgroundColor).toBe('rgb(31, 31, 31)')
    expect(style('modal-body').color).toBe('rgba(255, 255, 255, 0.85)')
  })
})

describe('the drawer of the workbench style', () => {
  it('makes the panel 378px wide with square corners, in white, as the original does', async () => {
    show(drawer)
    await waitForSettled(at('drawer-panel'))
    const panel = style('drawer-panel')

    expect(part('drawer-panel').getBoundingClientRect().width).toBe(378)
    expect(px(panel.borderTopRightRadius)).toBe(0)
    expect(panel.backgroundColor).toBe('rgb(255, 255, 255)')
  })

  it('pads the header by 16px and 24px, the body by 24px and the footer by 8px and 16px, as the original does, where the lines under the header and over the footer have no hook', async () => {
    show(drawer)
    await waitForSettled(at('drawer-panel'))

    expect([px(style('drawer-header').paddingTop), px(style('drawer-header').paddingBottom), px(style('drawer-header').paddingLeft)]).toEqual([16, 16, 24])
    expect([px(style('drawer-body').paddingTop), px(style('drawer-body').paddingBottom), px(style('drawer-body').paddingLeft)]).toEqual([24, 24, 24])
    expect([px(style('drawer-footer').paddingTop), px(style('drawer-footer').paddingBottom), px(style('drawer-footer').paddingLeft)]).toEqual([8, 8, 16])
  })

  it('writes the title in 16px with 600 weight and the body in 0.88 black, and rounds the close button at 4px', async () => {
    show(drawer)
    await waitForSettled(at('drawer-panel'))

    expect(px(style('drawer-title').fontSize)).toBe(16)
    expect(style('drawer-title').fontWeight).toBe('600')
    expect(style('drawer-body').color).toBe('rgba(0, 0, 0, 0.88)')
    expect(px(style('drawer-close').borderTopLeftRadius)).toBe(4)
  })

  it('fills the panel with the elevated surface #1F1F1F in the dark mode', async () => {
    await showDark(drawer)
    await waitForSettled(at('drawer-panel'))

    expect(style('drawer-panel').backgroundColor).toBe('rgb(31, 31, 31)')
  })
})

describe('the popover of the workbench style', () => {
  it('pads the panel by 12px, rounds it at 8px and fills it in white with the popup shadow, as the original does', async () => {
    show(popover)
    await waitForSettled(at('popover-content'))
    const panel = style('popover-content')
    const body = style('popover-body')

    expect([px(body.paddingTop), px(body.paddingLeft)]).toEqual([12, 12])
    expect(px(panel.borderTopLeftRadius)).toBe(8)
    expect(panel.backgroundColor).toBe('rgb(255, 255, 255)')
    expect(panel.boxShadow).toBe(popupShadow)
  })

  it('fills the panel with the elevated surface #1F1F1F in the dark mode', async () => {
    await showDark(popover)
    await waitForSettled(at('popover-content'))

    expect(style('popover-content').backgroundColor).toBe('rgb(31, 31, 31)')
  })
})
