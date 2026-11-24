import { afterEach, describe, expect, it } from 'vitest'

import { Accordion } from '@components/common/Accordion/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Drawer } from '@components/common/Drawer/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { part, style } from '../support/hookProbes.ts'
import { material2 } from '@styles/presets/material2.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { waitForSettled } from '../support/settle.ts'

import type { ReactElement } from 'react'

const styled = { style: material2 } as const

const show = (ui: ReactElement) => renderInBrowser(ui, 'never', 'light', styled)

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
})

describe('the modal of the material2 style', () => {
  const opened = async () => {
    show(<Modal isOpen title="Confirm" onClose={() => undefined}>Content</Modal>)
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
})

describe('the drawer of the material2 style', () => {
  it('draws the panel square, with elevation 16', async () => {
    show(<Drawer open title="Filters" onClose={() => undefined}>Content</Drawer>)
    await waitForSettled(() => part('drawer-panel'))
    const panel = style('drawer-panel')

    expect(px(panel.borderStartStartRadius ?? panel.borderTopLeftRadius)).toBe(0)
    expect(panel.boxShadow).toContain('rgba(0, 0, 0, 0.2) 0px 8px 10px -5px')
  })
})

describe('the accordion of the material2 style', () => {
  it('casts elevation 1 and stands the trigger at 48px with no block padding of its own', () => {
    show(<Accordion items={[{ value: 'a', title: 'Question', content: 'Answer' }]} />)

    expect(style('accordion').boxShadow).toContain('rgba(0, 0, 0, 0.2) 0px 2px 1px -1px')
    expect(part('accordion-trigger').getBoundingClientRect().height).toBe(48)
    expect(px(style('accordion-trigger').paddingTop)).toBe(0)
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
