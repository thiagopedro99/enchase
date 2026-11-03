import { afterEach, describe, expect, it } from 'vitest'

import { Table } from '@components/common/Table/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { onRoot, parts } from '../../../support/hookProbes.ts'

import type { TableColumn } from '@components/common/Table/types.ts'

type Order = { id: string; customer: string; total: number }

const orders: Order[] = [
  { id: '#1001', customer: 'Ana Souza', total: 1289.9 },
  { id: '#1002', customer: 'Bruno Lima', total: 349 },
  { id: '#1003', customer: 'Carla Mendes', total: 87.5 }
]

const columns: TableColumn<Order>[] = [
  { key: 'id', header: 'Pedido', rowHeader: true },
  { key: 'customer', header: 'Cliente' },
  { key: 'total', header: 'Total', align: 'end', cell: (row) => `R$ ${row.total.toFixed(2)}` }
]

const rows = () => parts('table-row')

const cellsOf = (row: Element) => [...row.children] as HTMLElement[]

const headerCells = () => cellsOf(document.body.querySelector('thead tr') as Element)

const endSide = (element: HTMLElement) => (getComputedStyle(element).direction === 'rtl' ? 'left' : 'right')

const endLine = (element: HTMLElement) => {
  const computed = getComputedStyle(element)
  const side = endSide(element)

  return [computed.getPropertyValue(`border-${side}-width`), computed.getPropertyValue(`border-${side}-style`), computed.getPropertyValue(`border-${side}-color`)]
}

const line = (name: string) => {
  const probe = document.createElement('span')

  probe.style.color = `var(--enchase-color-${name})`
  document.body.append(probe)

  const result = getComputedStyle(probe).color

  probe.remove()

  return result
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('dir')
})

describe('the bordered Table in a real browser', () => {
  it('draws no line between the columns unless it is told to', () => {
    renderInBrowser(<Table columns={columns} rows={orders} caption="Orders" />)

    for (const cell of [...headerCells(), ...rows().flatMap(cellsOf)]) expect(endLine(cell)[0]).toBe('0px')
  })

  it('draws a line of the theme between the columns, in the header and in every row, and none after the last column', () => {
    renderInBrowser(<Table columns={columns} rows={orders} caption="Orders" bordered />)

    for (const group of [headerCells(), ...rows().map(cellsOf)]) {
      expect(group.slice(0, -1).map(endLine)).toEqual(group.slice(0, -1).map(() => ['1px', 'solid', line('border')]))
      expect(endLine(group.at(-1) as HTMLElement)[0]).toBe('0px')
    }
  })

  it('keeps the lines between the rows, and none under the last row', () => {
    renderInBrowser(<Table columns={columns} rows={orders} caption="Orders" bordered />)

    expect(cellsOf(rows()[0]).map((cell) => getComputedStyle(cell).borderBottomWidth)).toEqual(['1px', '1px', '1px'])
    expect(cellsOf(rows().at(-1) as Element).map((cell) => getComputedStyle(cell).borderBottomWidth)).toEqual(['0px', '0px', '0px'])
  })

  it('draws the lines of the selection column and of the rows that are loading', () => {
    renderInBrowser(
      <>
        <Table columns={columns} rows={orders} caption="Selectable" bordered selectedKeys={[]} onSelectedKeysChange={() => undefined} />
        <Table columns={columns} rows={[]} caption="Loading" bordered loading />
      </>
    )
    const selectable = cellsOf(rows()[0])

    expect(selectable).toHaveLength(4)
    expect(selectable.slice(0, -1).map((cell) => endLine(cell)[0])).toEqual(['1px', '1px', '1px'])
    expect(headerCells().slice(0, 3).map((cell) => endLine(cell)[0])).toEqual(['1px', '1px', '1px'])
    expect(cellsOf(rows().at(-1) as Element).slice(0, -1).map((cell) => endLine(cell)[0])).toEqual(['1px', '1px'])
  })

  it('draws the line on the other side when the text runs from right to left', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<Table columns={columns} rows={orders} caption="Orders" bordered />)
    const cells = cellsOf(rows()[0])

    expect(endSide(cells[0])).toBe('left')
    expect(cells.slice(0, -1).map((cell) => endLine(cell)[0])).toEqual(['1px', '1px'])
    expect(getComputedStyle(cells[0]).borderRightWidth).toBe('0px')
  })

  it('takes the color of the line between the columns from its hook, and from the line between the rows before the theme', () => {
    onRoot({ '--enchase-table-cell-border-color': 'rgb(1, 2, 3)' })
    renderInBrowser(<Table columns={columns} rows={orders} caption="Orders" bordered />)

    expect(endLine(cellsOf(rows()[0])[0])[2]).toBe('rgb(1, 2, 3)')
    expect(getComputedStyle(cellsOf(rows()[0])[0]).borderBottomColor).toBe('rgb(1, 2, 3)')

    onRoot({ '--enchase-table-cell-border-color-end': 'rgb(4, 5, 6)' })

    expect(endLine(cellsOf(rows()[0])[0])[2]).toBe('rgb(4, 5, 6)')
    expect(endLine(headerCells()[0])[2]).toBe('rgb(4, 5, 6)')
    expect(getComputedStyle(cellsOf(rows()[0])[0]).borderBottomColor).toBe('rgb(1, 2, 3)')
  })

  it('draws the frame with its own hook before the one of the table, and as the table does without it', () => {
    onRoot({ '--enchase-table-border-color': 'rgb(1, 2, 3)' })
    renderInBrowser(
      <>
        <Table columns={columns} rows={orders} caption="Plain" />
        <Table columns={columns} rows={orders} caption="Bordered" bordered />
      </>
    )
    const frame = (index: number) => getComputedStyle(parts('table')[index]).borderTopColor

    expect([frame(0), frame(1)]).toEqual(['rgb(1, 2, 3)', 'rgb(1, 2, 3)'])

    onRoot({ '--enchase-table-border-color-bordered': 'rgb(4, 5, 6)' })

    expect([frame(0), frame(1)]).toEqual(['rgb(1, 2, 3)', 'rgb(4, 5, 6)'])
  })

  it('draws the line of the cells in the header too, instead of the hooks of the line that the header draws alone', () => {
    onRoot({ '--enchase-table-header-border-width-end': '3px', '--enchase-table-header-border-style-end': 'dotted', '--enchase-table-header-border-color-end': 'rgb(7, 8, 9)' })
    renderInBrowser(
      <>
        <Table columns={columns} rows={orders} caption="Plain" />
        <Table columns={columns} rows={orders} caption="Bordered" bordered />
      </>
    )
    const [plain, bordered] = [document.body.querySelectorAll('table')[0], document.body.querySelectorAll('table')[1]].map((table) => cellsOf(table.querySelector('thead tr') as Element)[0])

    expect(endLine(plain)).toEqual(['3px', 'dotted', 'rgb(7, 8, 9)'])
    expect(endLine(bordered)).toEqual(['1px', 'solid', line('border')])
  })
})
