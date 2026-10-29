import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Table } from '@components/common/Table/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { setForcedColors } from '../../../support/media.ts'
import { letGoOfTheMouse, pressMouse } from '../../../support/pointer.ts'
import { frames } from '../../../support/settle.ts'
import { unlessWebkit } from '../../../support/browserSkips.ts'

import type { TableColumn } from '@components/common/Table/types.ts'

type Order = { id: string; customer: string; city: string; status: string; total: number }

const orders: Order[] = [
  { id: '#1001', customer: 'Ana Souza', city: 'São Paulo', status: 'Pago', total: 1289.9 },
  { id: '#1002', customer: 'Bruno Lima', city: 'Recife', status: 'Pendente', total: 349 },
  { id: '#1003', customer: 'Carla Mendes', city: 'Curitiba', status: 'Pago', total: 87.5 },
  { id: '#1004', customer: 'Diego Alves', city: 'Salvador', status: 'Atrasado', total: 2150 }
]

const columns: TableColumn<Order>[] = [
  { key: 'id', header: 'Pedido', rowHeader: true },
  { key: 'customer', header: 'Cliente' },
  { key: 'city', header: 'Cidade' },
  { key: 'status', header: 'Situação' },
  { key: 'total', header: 'Total', align: 'end', cell: (row) => `R$ ${row.total.toFixed(2)}` }
]

const surfaces = ['surface', 'background', 'surface-container-high'] as const

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.prepend(style)
  added.push(style)
}

afterEach(async () => {
  await letGoOfTheMouse()
  added.splice(0).forEach((style) => style.remove())
  document.documentElement.removeAttribute('dir')
  await setForcedColors('none')
})

const part = (name: string, index = 0) => document.body.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`)[index]

const parts = (name: string) => [...document.body.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`)]

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const rect = (element: Element) => element.getBoundingClientRect()

const textRect = (element: HTMLElement) => {
  const range = document.createRange()

  range.selectNodeContents(element)

  return range.getBoundingClientRect()
}

describe('Table in a real browser', () => {
  it('is exposed as a named table with column headers, row headers and cells', () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} />)

    expect(page.getByRole('table', { name: 'Pedidos' }).element()).toBe(part('table-element'))
    expect(page.getByRole('columnheader').elements()).toHaveLength(5)
    expect(page.getByRole('rowheader').elements()).toHaveLength(4)
    expect(page.getByRole('cell').elements()).toHaveLength(16)
    expect(page.getByRole('row').elements()).toHaveLength(5)
  })

  it('fills the width of its container and lines every header up with the cells of its column', () => {
    renderInBrowser(
      <div style={{ inlineSize: 700 }}>
        <Table caption="Pedidos" columns={columns} rows={orders} />
      </div>
    )
    const headers = parts('table-header')
    const firstRow = [part('table-row-header'), ...parts('table-cell').slice(0, 4)]

    expect(rect(part('table')).width).toBeCloseTo(700, 0)
    expect(rect(part('table-element')).width).toBeGreaterThan(690)

    headers.forEach((header, index) => {
      expect(rect(header).left, `column ${index}`).toBeCloseTo(rect(firstRow[index]).left, 0)
      expect(rect(header).width, `column ${index}`).toBeCloseTo(rect(firstRow[index]).width, 0)
    })
  })

  it('divides the rows with a line and leaves the last one to the border of the container', () => {
    renderInBrowser(<Table columns={columns} rows={orders} />)
    const bottom = (row: number) => parseFloat(getComputedStyle(parts('table-row')[row].querySelector('td') as HTMLElement).borderBottomWidth)

    expect(bottom(0)).toBe(1)
    expect(bottom(2)).toBe(1)
    expect(bottom(3)).toBe(0)
    expect(parseFloat(getComputedStyle(part('table-header')).borderBottomWidth)).toBe(1)
    expect(parseFloat(getComputedStyle(part('table')).borderTopWidth)).toBe(1)
  })

  it('aligns the text of an end column to the end of its cell in both directions', () => {
    renderInBrowser(<Table columns={columns} rows={orders} />)
    const cell = parts('table-cell')[3]
    const padding = parseFloat(getComputedStyle(cell).paddingInlineEnd)

    expect(textRect(cell).right).toBeCloseTo(rect(cell).right - padding, 0)
    expect(textRect(cell).left).toBeGreaterThan(rect(cell).left + padding + 5)
  })

  it('aligns the text of an end column to the left in right-to-left text', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<Table columns={columns} rows={orders} />)
    const cell = parts('table-cell')[3]
    const padding = parseFloat(getComputedStyle(cell).paddingInlineEnd)

    expect(textRect(cell).left).toBeCloseTo(rect(cell).left + padding, 0)
    expect(rect(parts('table-header')[0]).left).toBeGreaterThan(rect(parts('table-header')[4]).left)
  })

  it('centers the text of a center column and starts the others at the start', () => {
    renderInBrowser(<Table columns={[{ key: 'id', header: 'Pedido' }, { key: 'status', header: 'Situação', align: 'center' }]} rows={orders} />)
    const [first, second] = parts('table-cell').slice(0, 2)
    const middle = (element: HTMLElement) => (textRect(element).left + textRect(element).right) / 2

    expect(textRect(first).left).toBeCloseTo(rect(first).left + parseFloat(getComputedStyle(first).paddingInlineStart), 0)
    expect(middle(second)).toBeCloseTo((rect(second).left + rect(second).right) / 2, 0)
  })

  it.each(['light', 'dark'] as const)('keeps the headers, the cells and the empty text readable in the %s theme', (mode) => {
    renderInBrowser(
      <>
        <Table caption="Cheia" columns={columns} rows={orders} striped />
        <Table caption="Vazia" columns={columns} rows={[]} empty="Nenhum pedido" />
      </>,
      'never',
      mode
    )
    const header = getComputedStyle(part('table-header'))
    const cell = getComputedStyle(part('table-cell'))
    const striped = getComputedStyle(parts('table-row')[1])

    expect(contrastRatio(header.color, header.backgroundColor), 'header').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(cell.color, striped.backgroundColor), 'cell on a striped row').toBeGreaterThanOrEqual(4.5)

    for (const name of surfaces) {
      expect(contrastRatio(cell.color, surface(name)), `cell on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('table-caption')).color, surface(name)), `caption on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('table-empty')).color, surface(name)), `empty on ${name}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('shades every other row when striped and none when plain', () => {
    renderInBrowser(
      <>
        <Table caption="Zebra" columns={columns} rows={orders} striped />
        <Table caption="Lisa" columns={columns} rows={orders} />
      </>
    )
    const background = (index: number) => getComputedStyle(parts('table-row')[index]).backgroundColor
    const transparent = 'rgba(0, 0, 0, 0)'

    expect([background(0), background(1), background(2), background(3)]).toEqual([transparent, expect.not.stringMatching(/^rgba\(0, 0, 0, 0\)$/), transparent, expect.not.stringMatching(/^rgba\(0, 0, 0, 0\)$/)])
    expect([background(4), background(5), background(6), background(7)]).toEqual([transparent, transparent, transparent, transparent])
  })

  it('highlights the row under the pointer, over the stripes, and never the header', async () => {
    renderInBrowser(<Table columns={columns} rows={orders} striped />)
    const background = (element: HTMLElement) => getComputedStyle(element).backgroundColor
    const stripe = background(parts('table-row')[1])

    await userEvent.hover(parts('table-row')[1])
    expect(background(parts('table-row')[1])).not.toBe(stripe)

    await userEvent.hover(parts('table-row')[0])
    expect(background(parts('table-row')[0])).not.toBe('rgba(0, 0, 0, 0)')
    expect(background(parts('table-row')[1])).toBe(stripe)

    await userEvent.hover(part('table-header'))
    expect(getComputedStyle(part('table-header')).backgroundColor).toBe(getComputedStyle(parts('table-header')[1]).backgroundColor)
  })

  it('packs the rows tighter and the text smaller when small', () => {
    renderInBrowser(
      <>
        <Table caption="Média" columns={columns} rows={orders} />
        <Table caption="Pequena" columns={columns} rows={orders} size="sm" />
      </>
    )
    const medium = getComputedStyle(parts('table-cell')[0])
    const small = getComputedStyle(parts('table-cell')[20])

    expect(rect(parts('table-row')[4]).height).toBeLessThan(rect(parts('table-row')[0]).height)
    expect(parseFloat(small.paddingBlockStart)).toBeLessThan(parseFloat(medium.paddingBlockStart))
    expect(parseFloat(small.paddingInlineStart)).toBeLessThan(parseFloat(medium.paddingInlineStart))
    expect(parseFloat(small.fontSize)).toBeLessThan(parseFloat(medium.fontSize))
    expect(parseFloat(getComputedStyle(parts('table-header')[5]).paddingBlockStart)).toBeLessThan(parseFloat(getComputedStyle(parts('table-header')[0]).paddingBlockStart))
  })

  it('keeps long unbreakable content inside the box and the page out of horizontal scroll', () => {
    renderInBrowser(
      <div style={{ inlineSize: 240 }}>
        <Table columns={[{ key: 'id', header: 'Pedido' }, { key: 'customer', header: 'Cliente' }]} rows={[{ id: '#1', customer: 'bartholomew.fitzgerald@northwind-industries-holdings.example.com' }]} />
      </div>
    )

    expect(rect(part('table')).width).toBeLessThanOrEqual(240)
    expect(part('table').scrollWidth).toBeGreaterThan(part('table').clientWidth)
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth)
  })

  it('lets the caller class and slot selectors win on layout even when its css loads before the library', () => {
    addStyle('.mine { max-inline-size: 500px; } [data-slot="table-cell"] { padding-block: 21px; } [data-slot="table-header"] { text-align: center; }')
    renderInBrowser(<Table columns={columns} rows={orders} className="mine" />)

    expect(rect(part('table')).width).toBeLessThanOrEqual(500)
    expect(getComputedStyle(part('table-cell')).paddingBlockStart).toBe('21px')
    expect(getComputedStyle(part('table-header')).textAlign).toBe('center')
  })
})

describe('Table scrolling in a real browser', () => {
  const wide = (
    <div style={{ inlineSize: 260 }}>
      <Table caption="Pedidos" columns={columns} rows={orders} />
    </div>
  )

  it('becomes a focusable region named after the caption when the table is wider than its box', () => {
    renderInBrowser(wide)

    expect(part('table').scrollWidth).toBeGreaterThan(part('table').clientWidth)
    expect(part('table').getAttribute('tabindex')).toBe('0')
    expect(page.getByRole('region', { name: 'Pedidos' }).element()).toBe(part('table'))
  })

  it('takes the focus once with Tab and scrolls with the arrow keys', async () => {
    renderInBrowser(
      <>
        <button>Antes</button>
        {wide}
        <button>Depois</button>
      </>
    )

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Antes' }).element())

    await userEvent.tab()
    expect(document.activeElement).toBe(part('table'))
    expect(part('table').scrollLeft).toBe(0)

    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect.poll(() => part('table').scrollLeft).toBeGreaterThan(0)

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Depois' }).element())
  })

  it('shows a visible focus ring on the region when reached by keyboard', async () => {
    renderInBrowser(wide)

    await userEvent.tab()
    const style = getComputedStyle(part('table'))

    expect(style.outlineStyle).toBe('solid')
    expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2)

    for (const name of surfaces) expect(contrastRatio(style.outlineColor, surface(name)), name).toBeGreaterThanOrEqual(3)
  })

  it('is not a tab stop while the table fits', async () => {
    renderInBrowser(
      <>
        <button>Antes</button>
        <div style={{ inlineSize: 900 }}>
          <Table caption="Pedidos" columns={columns} rows={orders} />
        </div>
        <button>Depois</button>
      </>
    )

    expect(part('table').hasAttribute('tabindex')).toBe(false)
    expect(part('table').hasAttribute('role')).toBe(false)

    await userEvent.tab()
    await userEvent.tab()

    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Depois' }).element())
  })

  it('follows the width of its box: focusable when it shrinks and plain again when it grows', async () => {
    renderInBrowser(
      <div id="box" style={{ inlineSize: 900 }}>
        <Table caption="Pedidos" columns={columns} rows={orders} />
      </div>
    )
    const box = document.getElementById('box') as HTMLElement

    expect(part('table').hasAttribute('tabindex')).toBe(false)

    box.style.inlineSize = '260px'
    await expect.poll(() => part('table').getAttribute('tabindex')).toBe('0')

    box.style.inlineSize = '900px'
    await expect.poll(() => part('table').hasAttribute('tabindex')).toBe(false)
  })

  it('follows a change of the rows that makes the table wider', async () => {
    const Growing = () => (
      <div style={{ inlineSize: 320 }}>
        <Table caption="Pedidos" columns={[{ key: 'id', header: 'Pedido' }, { key: 'customer', header: 'Cliente' }]} rows={[{ id: '#1', customer: 'Ana' }]} />
      </div>
    )
    renderInBrowser(<Growing />)

    expect(part('table').hasAttribute('tabindex')).toBe(false)

    part('table-cell', 1).textContent = 'bartholomew.fitzgerald@northwind-industries-holdings.example.com'

    await expect.poll(() => part('table').getAttribute('tabindex')).toBe('0')
  })
})

const sortableColumns: TableColumn<Order>[] = columns.map((column) => ({ ...column, sortable: column.key !== 'status' }))

const many: Order[] = Array.from({ length: 30 }, (_, index) => ({ id: `#${2000 + index}`, customer: `Cliente ${index}`, city: 'Recife', status: 'Pago', total: 10 + index }))

const sortButton = (name: string) => page.getByRole('button', { name }).element() as HTMLElement

const labelOf = (name: string) => rect(sortButton(name).querySelector('[data-slot="table-sort-label"]') as HTMLElement)

const iconOf = (name: string) => rect(sortButton(name).querySelector('[data-slot="table-sort-icon"]') as HTMLElement)

const transparent = 'rgba(0, 0, 0, 0)'

describe('Table sorting in a real browser', () => {
  it('fills the whole header cell with the button, so the padding around the label is clickable', async () => {
    const calls: unknown[] = []

    renderInBrowser(<Table columns={sortableColumns} rows={orders} onSortChange={(sort) => calls.push(sort)} />)
    const cell = parts('table-header')[1]
    const box = rect(cell)

    expect(document.elementFromPoint(box.left + 3, box.top + 3)).toBe(sortButton('Cliente'))
    expect(document.elementFromPoint(box.right - 3, box.bottom - 3)).toBe(sortButton('Cliente'))

    await userEvent.click(cell, { position: { x: 3, y: 3 } })

    expect(calls).toEqual([{ key: 'customer', direction: 'ascending' }])
  })

  it('names the button after the header, marks the sorted header and leaves the others without a button', () => {
    renderInBrowser(<Table columns={sortableColumns} rows={orders} sort={{ key: 'customer', direction: 'descending' }} />)

    expect(page.getByRole('button').elements().map((button) => button.textContent)).toEqual(['Pedido', 'Cliente', 'Cidade', 'Total'])
    expect(parts('table-header').map((header) => header.getAttribute('aria-sort'))).toEqual([null, 'descending', null, null, null])
    expect(parts('table-header')[3].querySelector('button')).toBeNull()
  })

  it('shows a ring around the whole cell, inside the container, when the button is reached by keyboard, and none after a click', async () => {
    renderInBrowser(<Table columns={sortableColumns} rows={orders} />)

    await userEvent.tab()
    const button = document.activeElement as HTMLElement
    const ring = getComputedStyle(button, '::after')

    expect(button).toBe(sortButton('Pedido'))
    expect(getComputedStyle(button).outlineStyle).toBe('none')
    expect(ring.outlineStyle).toBe('solid')
    expect(parseFloat(ring.outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(ring.outlineOffset).toBe('-2px')
    expect(contrastRatio(ring.outlineColor, getComputedStyle(parts('table-header')[0]).backgroundColor)).toBeGreaterThanOrEqual(3)

    await userEvent.click(sortButton('Cliente'))

    expect(getComputedStyle(sortButton('Cliente'), '::after').outlineStyle).toBe('none')
  })

  it('puts the indicator after the label and before it in an end column', () => {
    renderInBrowser(<Table columns={sortableColumns} rows={orders} />)

    expect(iconOf('Cliente').left - labelOf('Cliente').right).toBeGreaterThanOrEqual(0)
    expect(labelOf('Total').left - iconOf('Total').right).toBeGreaterThanOrEqual(0)
  })

  it('mirrors the indicator in right-to-left text', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<Table columns={sortableColumns} rows={orders} />)

    expect(labelOf('Cliente').left - iconOf('Cliente').right).toBeGreaterThanOrEqual(0)
    expect(iconOf('Total').left - labelOf('Total').right).toBeGreaterThanOrEqual(0)
  })

  it('keeps the label of an end column against the end of the cell, in line with its numbers', () => {
    renderInBrowser(<Table columns={sortableColumns} rows={orders} />)

    expect(Math.abs(labelOf('Total').right - textRect(parts('table-cell')[3]).right)).toBeLessThanOrEqual(1)
  })

  it('draws the sorted direction at full strength and the other triangle dimmed', () => {
    renderInBrowser(
      <>
        <Table caption="Ascendente" columns={sortableColumns} rows={orders} sort={{ key: 'customer', direction: 'ascending' }} />
        <Table caption="Descendente" columns={sortableColumns} rows={orders} sort={{ key: 'customer', direction: 'descending' }} />
      </>
    )
    const [ascending, descending] = page.getByRole('button', { name: 'Cliente' }).elements() as HTMLElement[]
    const idle = page.getByRole('button', { name: 'Cidade' }).elements()[0] as HTMLElement
    const strengths = (button: HTMLElement) => [...button.querySelectorAll('path')].map((path) => getComputedStyle(path).opacity)

    expect(strengths(ascending)).toEqual(['1', '0.4'])
    expect(strengths(descending)).toEqual(['0.4', '1'])
    expect(strengths(idle)).toEqual(['0.4', '0.4'])
  })

  it('tints the whole cell under the pointer, and more while it is pressed', async () => {
    renderInBrowser(<Table columns={sortableColumns} rows={orders} />)
    const tint = () => getComputedStyle(sortButton('Pedido'), '::after').backgroundColor

    expect(tint()).toBe(transparent)

    await userEvent.hover(sortButton('Pedido'))
    await expect.poll(tint).not.toBe(transparent)

    const hovered = tint()

    await pressMouse('[data-slot="table-sort"]')
    await expect.poll(tint).not.toBe(hovered)
  })

  it('keeps every sort button at least 24 by 24 px, in the small size too', () => {
    renderInBrowser(<Table columns={sortableColumns} rows={orders} size="sm" />)

    for (const name of ['Pedido', 'Cliente', 'Cidade', 'Total']) {
      const box = rect(sortButton(name))

      expect(box.height, name).toBeGreaterThanOrEqual(24)
      expect(box.width, name).toBeGreaterThanOrEqual(24)
    }
  })

  it('wraps a very long header beside its indicator instead of pushing the table wide', () => {
    const long = 'Benachrichtigungseinstellungsverwaltungsseite'

    renderInBrowser(
      <div style={{ inlineSize: 260 }}>
        <Table
          columns={[
            { key: 'id', header: long, sortable: true },
            { key: 'customer', header: 'Cliente', sortable: true }
          ]}
          rows={[{ id: '#1', customer: 'Ana' }]}
        />
      </div>
    )

    expect(iconOf(long).width).toBeGreaterThan(8)
    expect(iconOf(long).height).toBeGreaterThan(8)
    expect(labelOf(long).width).toBeLessThan(260)
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth)
  })
})

describe('Table with a sticky header in a real browser', () => {
  const scrolling = <Table caption="Pedidos" columns={columns} rows={many} stickyHeader style={{ maxBlockSize: 220 }} />

  const top = () => rect(part('table')).top + parseFloat(getComputedStyle(part('table')).borderTopWidth)

  it('keeps the header at the top of the container while the rows scroll under it', async () => {
    renderInBrowser(scrolling)

    expect(getComputedStyle(parts('table-header')[0]).position).toBe('sticky')
    expect(part('table').scrollHeight).toBeGreaterThan(part('table').clientHeight)

    part('table').scrollTop = 300

    await expect.poll(() => part('table').scrollTop).toBeGreaterThan(100)
    for (const header of parts('table-header')) expect(Math.abs(rect(header).top - top()), header.textContent ?? '').toBeLessThanOrEqual(1)

    const second = rect(parts('table-header')[1])

    expect(document.elementFromPoint(second.left + 6, second.top + 6)).toBe(parts('table-header')[1])
  })

  it('lets the header scroll away when it is not sticky', async () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={many} style={{ maxBlockSize: 220 }} />)

    part('table').scrollTop = 300

    await expect.poll(() => part('table').scrollTop).toBeGreaterThan(100)
    expect(rect(parts('table-header')[0]).bottom).toBeLessThan(top())
  })

  it('paints the header opaque and above the rows that go under it', () => {
    renderInBrowser(scrolling)

    expect(getComputedStyle(parts('table-header')[0]).backgroundColor).not.toBe(transparent)
    expect(Number(getComputedStyle(parts('table-header')[0]).zIndex)).toBeGreaterThan(0)
  })

  it('keeps the stacking of the header inside the table, under an element that overlaps it', () => {
    renderInBrowser(
      <>
        <Table caption="Pedidos" columns={columns} rows={orders} stickyHeader />
        <div id="cover" style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
      </>
    )
    const header = rect(parts('table-header')[0])

    expect(document.elementFromPoint(header.left + 8, header.top + 8)).toBe(document.getElementById('cover'))
  })

  it('becomes a focusable named region while the rows scroll, and the keyboard scrolls it', async () => {
    renderInBrowser(
      <>
        <button>Antes</button>
        {scrolling}
        <button>Depois</button>
      </>
    )

    await expect.poll(() => part('table').getAttribute('tabindex')).toBe('0')
    expect(page.getByRole('region', { name: 'Pedidos' }).element()).toBe(part('table'))

    await userEvent.tab()
    await userEvent.tab()
    expect(document.activeElement).toBe(part('table'))

    await userEvent.keyboard('{PageDown}')
    await expect.poll(() => part('table').scrollTop).toBeGreaterThan(0)

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Depois' }).element())
  })

  it('stays out of the tab order while the rows fit', () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} stickyHeader />)

    expect(part('table').hasAttribute('tabindex')).toBe(false)
  })

  it('keeps the sort buttons of the header working while the rows are scrolled', async () => {
    const calls: unknown[] = []

    renderInBrowser(<Table caption="Pedidos" columns={sortableColumns} rows={many} stickyHeader style={{ maxBlockSize: 220 }} onSortChange={(sort) => calls.push(sort)} />)
    part('table').scrollTop = 200

    await expect.poll(() => part('table').scrollTop).toBeGreaterThan(100)
    await userEvent.click(sortButton('Cliente'))

    expect(calls).toEqual([{ key: 'customer', direction: 'ascending' }])
  })
})

describe('Table loading in a real browser', () => {
  it('shows placeholder rows as tall as the rows they stand for', () => {
    renderInBrowser(
      <>
        <Table caption="Pronta" columns={columns} rows={orders} />
        <Table caption="Carregando" columns={columns} rows={orders} loading />
      </>
    )
    const rowsOf = (table: number) => parts('table-body')[table].querySelectorAll('tr')

    expect(rowsOf(1)).toHaveLength(4)

    for (let index = 0; index < 4; index += 1) expect(Math.abs(rect(rowsOf(1)[index]).height - rect(rowsOf(0)[index]).height), `row ${index}`).toBeLessThanOrEqual(1)
  })

  it('fills 70% of the content of the cell from its start, and against its end in an end column', () => {
    renderInBrowser(<Table columns={columns} rows={orders} loading />)
    const cells = [...parts('table-row')[1].querySelectorAll('td')]
    const padding = parseFloat(getComputedStyle(cells[0]).paddingInlineStart)
    const bar = (cell: HTMLElement) => rect(cell.querySelector('[data-slot="skeleton"]') as HTMLElement)

    expect(bar(cells[0]).width / (rect(cells[0]).width - padding * 2)).toBeCloseTo(0.7, 1)
    expect(bar(cells[0]).left).toBeCloseTo(rect(cells[0]).left + padding, 0)
    expect(bar(cells[4]).right).toBeCloseTo(rect(cells[4]).right - padding, 0)
  })

  it('does not tint a placeholder row under the pointer', async () => {
    renderInBrowser(<Table columns={columns} rows={orders} loading />)

    await userEvent.hover(parts('table-row')[1])
    await frames(4)

    expect(getComputedStyle(parts('table-row')[1]).backgroundColor).toBe(transparent)
  })

  it('keeps the status message out of sight and in the accessibility tree, and the table busy', () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} loading />)
    const status = part('table').querySelector('[role="status"]') as HTMLElement
    const box = rect(status)

    expect(status.textContent).toBe('Carregando')
    expect(box.width).toBeLessThanOrEqual(1)
    expect(box.height).toBeLessThanOrEqual(1)
    expect(part('table-element').getAttribute('aria-busy')).toBe('true')
  })

  it('hides the placeholder rows from the accessibility tree and keeps the header', () => {
    renderInBrowser(<Table caption="Pedidos" columns={sortableColumns} rows={orders} loading />)

    expect(page.getByRole('row').elements()).toHaveLength(1)
    expect(page.getByRole('columnheader').elements()).toHaveLength(5)
    expect(page.getByRole('button', { name: 'Cliente' }).element()).toBeTruthy()
  })
})

describe('Table row selection in a real browser', () => {
  const selectable = (initial: (string | number)[] = []) => {
    const changes = vi.fn()
    const Harness = ({ loading }: { loading?: boolean }) => {
      const [selected, setSelected] = useState(initial)

      return (
        <Table
          caption="Pedidos"
          columns={columns}
          rows={orders}
          getRowKey={(row) => row.id}
          selectedKeys={selected}
          loading={loading}
          onSelectedKeysChange={(keys) => {
            changes(keys)
            setSelected(keys)
          }}
        />
      )
    }

    return { Harness, changes }
  }

  const inputs = () => [...document.body.querySelectorAll<HTMLInputElement>('[data-slot="checkbox-input"]')]

  const rowBackground = (index: number) => getComputedStyle(parts('table-row')[index]).backgroundColor

  const transparent = 'rgba(0, 0, 0, 0)'

  it('keeps the first column as narrow as its box and its padding, and the others in the rest of the width', () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={[]} />)
    const cell = rect(part('table-select-header'))
    const wrapper = rect(parts('checkbox')[0])
    const padding = parseFloat(getComputedStyle(part('table-select-header')).paddingInlineStart) * 2

    expect(cell.width).toBeLessThanOrEqual(wrapper.width + padding + 2)
    expect(cell.width).toBeGreaterThanOrEqual(24)
    expect(Math.abs(rect(part('table')).width - rect(part('table-element')).width)).toBeLessThanOrEqual(2)
  })

  it('puts the selection column first, before the row header, in both directions', () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={[]} />)

    expect(rect(part('table-select-header')).right).toBeLessThanOrEqual(rect(parts('table-header')[0]).left + 1)
    expect(rect(part('table-select')).right).toBeLessThanOrEqual(rect(part('table-row-header')).left + 1)

    document.documentElement.setAttribute('dir', 'rtl')

    expect(rect(part('table-select-header')).left).toBeGreaterThanOrEqual(rect(parts('table-header')[0]).right - 1)
    expect(rect(part('table-select')).left).toBeGreaterThanOrEqual(rect(part('table-row-header')).right - 1)
  })

  it('centers each box in its cell, in the header and in the rows', () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={[]} />)

    for (const [cell, box] of [[part('table-select-header'), parts('checkbox-box')[0]], [part('table-select'), parts('checkbox-box')[1]]] as const) {
      const outer = rect(cell)
      const inner = rect(box)

      expect(Math.abs(outer.left + outer.width / 2 - (inner.left + inner.width / 2)), 'horizontally').toBeLessThanOrEqual(1)
      expect(Math.abs(outer.top + outer.height / 2 - (inner.top + inner.height / 2)), 'vertically').toBeLessThanOrEqual(1)
    }
  })

  it('does not make the rows taller than the touch area of the box, nor the header', () => {
    renderInBrowser(
      <>
        <Table caption="Sem seleção" columns={columns} rows={orders} />
        <Table caption="Com seleção" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={[]} />
      </>
    )
    const hit = parseFloat(getComputedStyle(parts('checkbox')[0]).minBlockSize)

    for (const index of [0, 1, 2, 3]) {
      const plain = rect(parts('table-row')[index]).height
      const withBox = rect(parts('table-row')[index + 4]).height

      expect(withBox, `row ${index}`).toBeGreaterThanOrEqual(hit - 1)
      expect(withBox, `row ${index}`).toBeLessThanOrEqual(Math.max(plain, hit) + 1)
    }

    expect(rect(part('table-select-header')).height).toBeGreaterThanOrEqual(hit - 1)
    expect(rect(part('table-select-header')).height).toBeLessThanOrEqual(Math.max(rect(parts('table-header')[0]).height, hit) + 1)
  })

  it('keeps every box at least 24 by 24 px to click, in the header and in the rows, in the small size too', () => {
    renderInBrowser(<Table caption="Pequena" size="sm" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={[]} />)

    for (const wrapper of parts('checkbox')) {
      expect(rect(wrapper).width).toBeGreaterThanOrEqual(24)
      expect(rect(wrapper).height).toBeGreaterThanOrEqual(24)
    }
  })

  it('keeps the width of the first column when it starts loading', async () => {
    const Toggling = () => {
      const [loading, setLoading] = useState(false)

      return (
        <>
          <button onClick={() => setLoading(true)}>Carregar</button>
          <Table caption="Pedidos" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={[]} loading={loading} />
        </>
      )
    }
    renderInBrowser(<Toggling />)
    const loaded = rect(part('table-select-header')).width
    const placeholderCell = () => document.body.querySelector('[data-placeholder] [data-slot="table-select"]')

    await userEvent.click(page.getByRole('button', { name: 'Carregar' }))

    await expect.poll(() => placeholderCell()).not.toBeNull()
    expect(Math.abs(rect(part('table-select-header')).width - loaded)).toBeLessThanOrEqual(1)
    expect(Math.abs(rect(placeholderCell() as Element).width - loaded)).toBeLessThanOrEqual(1)
  })

  it('shades only the selected rows, with the surface above the stripes, and no other', async () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={['#1002', '#1004']} striped />)
    const high = surface('surface-container-high')
    const probe = document.createElement('span')

    probe.style.backgroundColor = high
    document.body.append(probe)

    const expected = getComputedStyle(probe).backgroundColor

    probe.remove()

    expect(rowBackground(1)).toBe(expected)
    expect(rowBackground(3)).toBe(expected)
    expect(rowBackground(0)).toBe(transparent)
    expect(rowBackground(2)).toBe(transparent)
  })

  it('takes the selected row from its hook', () => {
    document.documentElement.style.setProperty('--enchase-table-row-background-selected', 'rgb(1, 2, 3)')
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={['#1001']} />)

    expect(rowBackground(0)).toBe('rgb(1, 2, 3)')
    document.documentElement.style.removeProperty('--enchase-table-row-background-selected')
  })

  it.each(['light', 'dark'] as const)('keeps the text and the boxes readable on a selected row in the %s theme', (mode) => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={['#1001', '#1002', '#1003', '#1004']} />, 'never', mode)
    const background = rowBackground(0)

    expect(contrastRatio(getComputedStyle(part('table-row-header')).color, background)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(getComputedStyle(parts('table-cell')[1]).color, background)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(getComputedStyle(parts('checkbox-box')[1]).backgroundColor, background)).toBeGreaterThanOrEqual(3)
  })

  it('keeps the selected shade under the pointer and adds the hover layer to it', async () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={['#1002']} />)
    const selected = rowBackground(1)

    await userEvent.hover(parts('table-row')[1])

    expect(rowBackground(1)).toBe(selected)
    expect(getComputedStyle(parts('table-row')[1]).backgroundImage).toMatch(/linear-gradient/)

    await userEvent.hover(parts('table-row')[0])

    expect(getComputedStyle(parts('table-row')[1]).backgroundImage).toBe('none')
    expect(rowBackground(0)).not.toBe(transparent)
  })

  it('selects a row with a mouse click on its box, and the select all box turns mixed', async () => {
    const { Harness, changes } = selectable()
    renderInBrowser(<Harness />)

    await userEvent.click(parts('checkbox')[2])

    expect(changes).toHaveBeenLastCalledWith(['#1002'])
    expect(inputs()[2].checked).toBe(true)
    expect(parts('table-row')[1].hasAttribute('data-selected')).toBe(true)
    expect(inputs()[0].matches(':indeterminate')).toBe(true)
    expect(inputs()[0].checked).toBe(false)
  })

  it('selects every row from the select all box and clears them from it, with the mixed state gone', async () => {
    const { Harness, changes } = selectable(['#1003'])
    renderInBrowser(<Harness />)

    expect(inputs()[0].matches(':indeterminate')).toBe(true)
    await userEvent.click(parts('checkbox')[0])

    expect(changes).toHaveBeenLastCalledWith(['#1003', '#1001', '#1002', '#1004'])
    expect(inputs().every((input) => input.checked)).toBe(true)
    expect(inputs()[0].matches(':indeterminate')).toBe(false)

    await userEvent.click(parts('checkbox')[0])

    expect(changes).toHaveBeenLastCalledWith([])
    expect(inputs().every((input) => !input.checked)).toBe(true)
    expect(document.body.querySelector('[data-selected]')).toBeNull()
  })

  it('walks the boxes with Tab and selects with Space', async () => {
    const { Harness, changes } = selectable()
    renderInBrowser(<Harness />)

    await userEvent.tab()
    expect(document.activeElement).toBe(inputs()[0])
    await userEvent.tab()
    expect(document.activeElement).toBe(inputs()[1])
    await userEvent.keyboard(' ')

    expect(changes).toHaveBeenLastCalledWith(['#1001'])
    expect(inputs()[1].checked).toBe(true)
  })

  it('names every box for a screen reader, the row boxes after the row header', () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={['#1001']} />)

    expect(page.getByRole('checkbox', { name: 'Selecionar todas as linhas' }).element()).toBe(inputs()[0])
    expect(page.getByRole('checkbox', { name: 'Selecionar linha #1001' }).element()).toBe(inputs()[1])
    expect(page.getByRole('checkbox', { name: 'Selecionar linha #1004' }).element()).toBe(inputs()[4])
  })

  it('shows the focus ring of a box whole, inside the container, when reached by keyboard', async () => {
    renderInBrowser(<Table caption="Pedidos" columns={columns} rows={orders} getRowKey={(row) => row.id} selectedKeys={[]} />)

    await userEvent.tab()
    await userEvent.tab()

    const box = rect(parts('checkbox-box')[1])
    const container = rect(part('table'))
    const ring = getComputedStyle(parts('checkbox-box')[1])
    const reach = parseFloat(ring.outlineOffset) + parseFloat(ring.outlineWidth)

    expect(ring.outlineStyle).toBe('solid')
    expect(box.left - reach).toBeGreaterThanOrEqual(container.left)
    expect(box.top - reach).toBeGreaterThanOrEqual(rect(parts('table-row')[0]).top)
  })

  it('keeps the select all box with the header when the rows scroll, and the boxes usable', async () => {
    const Many = () => {
      const [selected, setSelected] = useState<(string | number)[]>([])

      return <Table caption="Pedidos" columns={columns} rows={many} getRowKey={(row) => row.id} selectedKeys={selected} onSelectedKeysChange={setSelected} stickyHeader style={{ maxBlockSize: 220 }} />
    }

    renderInBrowser(<Many />)
    part('table').scrollTop = 300
    await expect.poll(() => part('table').scrollTop).toBeGreaterThan(100)

    const header = rect(part('table-select-header'))
    const top = rect(part('table')).top + parseFloat(getComputedStyle(part('table')).borderTopWidth)

    expect(getComputedStyle(part('table-select-header')).position).toBe('sticky')
    expect(Math.abs(header.top - top)).toBeLessThanOrEqual(1)

    await userEvent.click(parts('checkbox')[0])

    expect(inputs().every((input) => input.checked)).toBe(true)
  })

  it('disables the select all box while it loads and draws no box in the placeholder rows', async () => {
    const { Harness } = selectable(['#1001'])
    renderInBrowser(<Harness loading />)

    expect(inputs()).toHaveLength(1)
    expect(inputs()[0].disabled).toBe(true)
    expect(getComputedStyle(parts('checkbox-box')[0]).cursor).toBe('not-allowed')
  })
})

describe('Table in forced colors', () => {
  const run = unlessWebkit('forcedColors') ? it : it.skip

  run('keeps the lines between the rows and under the header so the structure still shows', async () => {
    renderInBrowser(<Table columns={columns} rows={orders} />)

    await setForcedColors('active')
    const cell = getComputedStyle(part('table-cell'))
    const header = getComputedStyle(part('table-header'))

    expect(cell.borderBottomStyle).toBe('solid')
    expect(cell.borderBottomColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(header.borderBottomColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(parseInt(header.fontWeight)).toBeGreaterThanOrEqual(600)
    expect(getComputedStyle(part('table')).borderTopStyle).toBe('solid')
  })

  run('draws the sort indicator in a system color that stands out from the page', async () => {
    renderInBrowser(<Table columns={sortableColumns} rows={orders} sort={{ key: 'customer', direction: 'ascending' }} />)
    await setForcedColors('active')
    const probe = document.createElement('div')

    probe.style.backgroundColor = 'Canvas'
    document.body.append(probe)

    const canvas = getComputedStyle(probe).backgroundColor

    probe.remove()

    await expect.poll(() => contrastRatio(getComputedStyle(sortButton('Cliente').querySelector('path') as SVGPathElement).fill, canvas)).toBeGreaterThanOrEqual(3)
  })
})
