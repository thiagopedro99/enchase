import { afterEach, describe, expect, it } from 'vitest'

import { Accordion } from '@components/common/Accordion/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Drawer } from '@components/common/Drawer/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { part, style } from '../support/hookProbes.ts'
import { material2 } from '@styles/presets/material2.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { waitForSettled } from '../support/settle.ts'

import type { ReactElement } from 'react'

const styled = { style: material2 } as const

const show = (ui: ReactElement, mode: 'light' | 'dark' = 'light') => renderInBrowser(ui, 'never', mode, styled)

const settled = async (mode: 'light' | 'dark') => {
  await expect.poll(() => document.documentElement.dataset.theme).toBe(mode)
  await waitForSettled(() => document.body)
}

const px = (value: string) => parseFloat(value)

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the card of the material2 style', () => {
  it('rounds the card at 4px and casts elevation 1, with no border', () => {
    show(<Card>Content</Card>)
    const card = style('card')

    expect(px(card.borderTopLeftRadius)).toBe(4)
    expect(card.boxShadow).toContain('rgba(0, 0, 0, 0.2) 0px 2px 1px -1px')
    expect(card.borderTopWidth).toBe('0px')
  })

  it.each([
    ['light', 'rgb(255, 255, 255)'],
    ['dark', 'rgb(30, 30, 30)']
  ] as const)('leaves the card flat in the %s mode at its own dp tint, not a tinted surface token', async (mode, background) => {
    show(<Card>Content</Card>, mode)
    await settled(mode)

    expect(style('card').backgroundColor).toBe(background)
  })
})

describe('the modal of the material2 style', () => {
  const opened = async (mode: 'light' | 'dark' = 'light') => {
    show(<Modal isOpen title="Confirm" onClose={() => undefined}>Content</Modal>, mode)
    await waitForSettled(() => part('modal-panel'))
  }

  it('rounds the panel at 4px and casts elevation 24', async () => {
    await opened()
    const panel = style('modal-panel')

    expect(px(panel.borderTopLeftRadius)).toBe(4)
    expect(panel.boxShadow).toContain('rgba(0, 0, 0, 0.2) 0px 11px 15px -7px')
  })

  it('sizes the title at 1.25rem and the header padding block at 16px', async () => {
    await opened()

    expect(style('modal-title').fontSize).toBe('20px')
    expect(px(style('modal-header').paddingTop)).toBe(16)
  })

  it.each([
    ['light', 'rgb(255, 255, 255)'],
    ['dark', 'rgb(56, 56, 56)']
  ] as const)('panels the modal flat in the %s mode at its 24dp tint', async (mode, background) => {
    await opened(mode)
    await settled(mode)

    expect(style('modal-panel').backgroundColor).toBe(background)
  })
})

describe('the drawer of the material2 style', () => {
  it('draws the panel square, with elevation 16', async () => {
    show(<Drawer open title="Filters" onClose={() => undefined}>Content</Drawer>)
    await waitForSettled(() => part('drawer-panel'))
    const panel = style('drawer-panel')

    expect(px(panel.borderStartStartRadius ?? panel.borderTopLeftRadius)).toBe(0)
    expect(panel.boxShadow).toContain('rgba(0, 0, 0, 0.2) 0px 8px 10px -5px')
  })

  it('sizes the title at 1.25rem in medium weight', async () => {
    show(<Drawer open title="Filters" onClose={() => undefined}>Content</Drawer>)
    await waitForSettled(() => part('drawer-panel'))

    expect(style('drawer-title').fontSize).toBe('20px')
    expect(style('drawer-title').fontWeight).toBe('500')
  })

  it.each([
    ['light', 'rgb(255, 255, 255)'],
    ['dark', 'rgb(54, 54, 54)']
  ] as const)('panels the drawer flat in the %s mode at its 16dp tint', async (mode, background) => {
    show(<Drawer open title="Filters" onClose={() => undefined}>Content</Drawer>, mode)
    await waitForSettled(() => part('drawer-panel'))
    await settled(mode)

    expect(style('drawer-panel').backgroundColor).toBe(background)
  })
})

describe('the accordion of the material2 style', () => {
  it('casts elevation 1 and stands the trigger at 48px with no block padding of its own', () => {
    show(<Accordion items={[{ value: 'a', title: 'Question', content: 'Answer' }]} />)

    expect(style('accordion').boxShadow).toContain('rgba(0, 0, 0, 0.2) 0px 2px 1px -1px')
    expect(part('accordion-trigger').getBoundingClientRect().height).toBe(48)
    expect(px(style('accordion-trigger').paddingTop)).toBe(0)
  })

  it.each([
    ['light', 'rgb(255, 255, 255)'],
    ['dark', 'rgb(30, 30, 30)']
  ] as const)('tints the trigger in the %s mode at the same 1dp level as the card', async (mode, background) => {
    show(<Accordion items={[{ value: 'a', title: 'Question', content: 'Answer' }]} />, mode)
    await settled(mode)

    expect(style('accordion-trigger').backgroundColor).toBe(background)
  })
})

describe('the navbar of the material2 style', () => {
  it('leaves the header borderless and casts elevation 4 under it', () => {
    show(<Navbar />)

    expect(style('navbar').borderBottomWidth).toBe('0px')
    expect(style('navbar').boxShadow).toContain('rgba(0, 0, 0, 0.2) 0px 2px 4px -1px')
  })

  it.each([
    ['light', 'rgb(255, 255, 255)'],
    ['dark', 'rgb(39, 39, 39)']
  ] as const)('tints the header in the %s mode at the 4dp level', async (mode, background) => {
    show(<Navbar />, mode)
    await settled(mode)

    expect(style('navbar').backgroundColor).toBe(background)
  })
})

describe('the sidebar of the material2 style', () => {
  const sidebar = () => (
    <Sidebar ariaLabel="Navigation" sections={[{ id: 'main', items: [{ id: 'home', label: 'Home', onClick: () => undefined }] }]} />
  )

  it('draws only an inner divider border, 1px wide, with no elevation tint of its own', () => {
    show(sidebar())
    const panel = style('sidebar')

    expect(panel.borderInlineEndWidth ?? panel.borderRightWidth).toBe('1px')
    expect(panel.borderInlineEndColor ?? panel.borderRightColor).toBe('rgba(0, 0, 0, 0.12)')
  })

  it.each([
    ['light', 'rgb(255, 255, 255)'],
    ['dark', 'rgb(18, 18, 18)']
  ] as const)('keeps the sidebar flat against the %s page background, unlike the elevated surfaces', async (mode, background) => {
    show(sidebar(), mode)
    await settled(mode)

    expect(style('sidebar').backgroundColor).toBe(background)
  })
})

describe('the table of the material2 style', () => {
  it('pads the cell at 16px with the header in medium weight', () => {
    show(
      <Table
        columns={[{ key: 'name', header: 'Name' }]}
        rows={[{ name: 'Ana' }]}
      />
    )

    expect(px(style('table-cell').paddingTop)).toBe(16)
    expect(style('table-header').fontWeight).toBe('500')
    expect(style('table-header').fontSize).toBe('14px')
  })

  it('leaves the header background transparent and its text at the primary text color, not the muted secondary', () => {
    show(
      <Table
        columns={[{ key: 'name', header: 'Name' }]}
        rows={[{ name: 'Ana' }]}
      />
    )

    expect(style('table-header').backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style('table-header').color).toBe('rgba(0, 0, 0, 0.87)')
  })

  it('pads the compact cell at 6px by 16px', () => {
    show(
      <Table
        size="sm"
        columns={[{ key: 'name', header: 'Name' }]}
        rows={[{ name: 'Ana' }]}
      />
    )

    expect(px(style('table-cell').paddingTop)).toBe(6)
    expect(px(style('table-cell').paddingLeft)).toBe(16)
  })
})
