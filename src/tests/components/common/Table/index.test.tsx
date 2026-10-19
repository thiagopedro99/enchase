import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Table } from '@components/common/Table/index.tsx'

import type { TableColumn } from '@components/common/Table/types.ts'

type Order = { id: string; customer: string; total: number; note?: string | null; paid: boolean }

const orders: Order[] = [
  { id: '#1001', customer: 'Ana', total: 120.5, paid: true },
  { id: '#1002', customer: 'Bruno', total: 80, note: null, paid: false },
  { id: '#1003', customer: 'Carla', total: 45.9, note: 'Frágil', paid: true }
]

const columns: TableColumn<Order>[] = [
  { key: 'id', header: 'Pedido', rowHeader: true },
  { key: 'customer', header: 'Cliente' },
  { key: 'total', header: 'Total', align: 'end', cell: (row) => `R$ ${row.total.toFixed(2)}` }
]

const mockOverflow = (scroll: number, client: number) => {
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(() => scroll)
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => client)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Table', () => {
  it('is a table named by its caption, with a column header per column and a row per record', () => {
    renderWithProviders(<Table caption="Pedidos recentes" columns={columns} rows={orders} />)

    expect(screen.getByRole('table', { name: 'Pedidos recentes' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['Pedido', 'Cliente', 'Total'])
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('writes the caption as a caption element', () => {
    renderWithProviders(<Table caption="Pedidos" columns={columns} rows={orders} />)

    expect(screen.getByText('Pedidos').tagName).toBe('CAPTION')
  })

  it('takes the name of the table from ariaLabel when there is no caption', () => {
    renderWithProviders(<Table ariaLabel="Lista de pedidos" columns={columns} rows={orders} />)

    expect(screen.getByRole('table', { name: 'Lista de pedidos' })).toBeInTheDocument()
    expect(document.querySelector('caption')).toBeNull()
  })

  it('shows the value of each key as text when a column has no cell function', () => {
    renderWithProviders(
      <Table
        columns={[
          { key: 'customer', header: 'Cliente' },
          { key: 'paid', header: 'Pago' },
          { key: 'total', header: 'Total' },
          { key: 'note', header: 'Nota' },
          { key: 'missing', header: 'Outra' }
        ]}
        rows={[orders[1]]}
      />
    )
    const cells = within(screen.getAllByRole('row')[1]).getAllByRole('cell')

    expect(cells.map((cell) => cell.textContent)).toEqual(['Bruno', 'false', '80', '', ''])
  })

  it('renders what the cell function returns and passes it the row and its index', () => {
    const cell = vi.fn((row: Order, index: number) => <strong>{`${index}:${row.customer}`}</strong>)
    renderWithProviders(<Table columns={[{ key: 'customer', header: 'Cliente', cell }]} rows={orders} />)

    expect(screen.getAllByRole('cell').map((item) => item.textContent)).toEqual(['0:Ana', '1:Bruno', '2:Carla'])
    expect(cell).toHaveBeenCalledWith(orders[2], 2)
    expect(screen.getByText('0:Ana').tagName).toBe('STRONG')
  })

  it('renders the cells of a row header column as row headers', () => {
    renderWithProviders(<Table columns={columns} rows={orders} />)

    expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(['#1001', '#1002', '#1003'])
    expect(screen.getAllByRole('rowheader')[0]).toHaveAttribute('scope', 'row')
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('scope', 'col')
  })

  it('marks the alignment of a column on its header and its cells', () => {
    renderWithProviders(<Table columns={[...columns, { key: 'paid', header: 'Pago', align: 'center' }]} rows={orders} />)

    expect(screen.getByRole('columnheader', { name: 'Total' })).toHaveAttribute('data-align', 'end')
    expect(within(screen.getAllByRole('row')[1]).getAllByRole('cell')[1]).toHaveAttribute('data-align', 'end')
    expect(screen.getByRole('columnheader', { name: 'Pago' })).toHaveAttribute('data-align', 'center')
    expect(screen.getByRole('columnheader', { name: 'Cliente' })).not.toHaveAttribute('data-align')
  })

  it('sets the width of a column on its header only when given', () => {
    renderWithProviders(<Table columns={[{ key: 'id', header: 'Pedido', width: '8rem' }, { key: 'customer', header: 'Cliente' }]} rows={orders} />)

    expect(screen.getByRole('columnheader', { name: 'Pedido' }).style.inlineSize).toBe('8rem')
    expect(screen.getByRole('columnheader', { name: 'Cliente' })).not.toHaveAttribute('style')
  })

  it('keeps the rows of the same record together when the order changes and a key is given', async () => {
    const user = userEvent.setup()
    const Reversible = () => {
      const [reversed, setReversed] = useState(false)

      return (
        <>
          <button onClick={() => setReversed(true)}>Inverter</button>
          <Table columns={columns} rows={reversed ? [...orders].reverse() : orders} getRowKey={(row) => row.id} />
        </>
      )
    }
    renderWithProviders(<Reversible />)
    const before = screen.getAllByRole('row')

    await user.click(screen.getByRole('button', { name: 'Inverter' }))
    const after = screen.getAllByRole('row')

    expect(after[1]).toBe(before[3])
    expect(after[3]).toBe(before[1])
  })

  it('shows the empty content in one cell across every column when there are no rows', () => {
    renderWithProviders(<Table columns={columns} rows={[]} empty="Nenhum pedido" />)
    const cell = screen.getByText('Nenhum pedido')

    expect(cell.tagName).toBe('TD')
    expect(cell).toHaveAttribute('colspan', '3')
    expect(screen.getAllByRole('row')).toHaveLength(2)
  })

  it('shows only the header when there are no rows and no empty content', () => {
    renderWithProviders(<Table columns={columns} rows={[]} />)

    expect(screen.getAllByRole('row')).toHaveLength(1)
    expect(screen.queryByRole('cell')).not.toBeInTheDocument()
  })

  it('does not show the empty content when there are rows', () => {
    renderWithProviders(<Table columns={columns} rows={orders} empty="Nenhum pedido" />)

    expect(screen.queryByText('Nenhum pedido')).not.toBeInTheDocument()
  })

  it('is medium and plain by default, and takes the small size and stripes', () => {
    const { container, unmount } = renderWithProviders(<Table columns={columns} rows={orders} />)
    const root = () => container.querySelector('[data-slot="table"]') as HTMLElement

    expect(root()).toHaveAttribute('data-size', 'md')
    expect(root()).not.toHaveAttribute('data-striped')
    unmount()

    const other = renderWithProviders(<Table columns={columns} rows={orders} size="sm" striped />)

    expect(other.container.querySelector('[data-slot="table"]')).toHaveAttribute('data-size', 'sm')
    expect(other.container.querySelector('[data-slot="table"]')).toHaveAttribute('data-striped')
  })

  it('forwards the ref to the root', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = renderWithProviders(<Table columns={columns} rows={orders} ref={ref} />)

    expect(ref.current).toBe(container.querySelector('[data-slot="table"]'))
  })

  it('does not pass its own props to the page', () => {
    const { container } = renderWithProviders(<Table columns={columns} rows={orders} getRowKey={(row) => row.id} caption="Pedidos" ariaLabel="Lista" empty="Vazio" size="sm" striped />)
    const root = container.querySelector('[data-slot="table"]') as HTMLElement

    for (const name of ['columns', 'rows', 'getrowkey', 'caption', 'arialabel', 'empty', 'size', 'striped']) {
      expect(root, name).not.toHaveAttribute(name)
    }
  })

  it('has no axe violations in any state', async () => {
    const { container } = renderWithProviders(
      <>
        <Table caption="Completa" columns={columns} rows={orders} striped />
        <Table ariaLabel="Pequena" columns={columns} rows={orders} size="sm" />
        <Table caption="Vazia" columns={columns} rows={[]} empty="Nada por aqui" />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Table scrolling', () => {
  it('stays out of the tab order and unlabelled while the table fits', () => {
    mockOverflow(300, 300)
    const { container } = renderWithProviders(<Table caption="Pedidos" columns={columns} rows={orders} />)
    const root = container.querySelector('[data-slot="table"]') as HTMLElement

    expect(root).not.toHaveAttribute('tabindex')
    expect(root).not.toHaveAttribute('role')
    expect(root).not.toHaveAttribute('aria-label')
  })

  it('becomes a focusable region named after the caption when the table is wider than its box', () => {
    mockOverflow(900, 300)
    const { container } = renderWithProviders(<Table caption="Pedidos" columns={columns} rows={orders} />)
    const root = container.querySelector('[data-slot="table"]') as HTMLElement

    expect(root).toHaveAttribute('tabindex', '0')
    expect(root).toHaveAttribute('role', 'region')
    expect(screen.getByRole('region', { name: 'Pedidos' })).toBe(root)
  })

  it('names the region with ariaLabel before the caption', () => {
    mockOverflow(900, 300)
    renderWithProviders(<Table caption="Pedidos" ariaLabel="Pedidos do mês" columns={columns} rows={orders} />)

    expect(screen.getByRole('region', { name: 'Pedidos do mês' })).toBeInTheDocument()
  })

  it('is only focusable, without a role, when it has no name', () => {
    mockOverflow(900, 300)
    const { container } = renderWithProviders(<Table columns={columns} rows={orders} />)
    const root = container.querySelector('[data-slot="table"]') as HTMLElement

    expect(root).toHaveAttribute('tabindex', '0')
    expect(root).not.toHaveAttribute('role')
    expect(root).not.toHaveAttribute('aria-label')
  })

  it('lets the caller override the tab index and the role', () => {
    mockOverflow(900, 300)
    const { container } = renderWithProviders(<Table caption="Pedidos" columns={columns} rows={orders} tabIndex={-1} role="group" />)
    const root = container.querySelector('[data-slot="table"]') as HTMLElement

    expect(root).toHaveAttribute('tabindex', '-1')
    expect(root).toHaveAttribute('role', 'group')
  })

  it('has no axe violations as a scrollable region', async () => {
    mockOverflow(900, 300)
    const { container } = renderWithProviders(<Table caption="Pedidos" columns={columns} rows={orders} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Table contract', () => {
  it('marks the root and every part with a data-slot', () => {
    const { container } = renderWithProviders(<Table caption="Pedidos" columns={columns} rows={orders} />)

    for (const part of ['table', 'table-element', 'table-caption', 'table-head', 'table-header', 'table-body', 'table-row', 'table-row-header', 'table-cell']) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).toBeInTheDocument()
    }
  })

  it('marks the empty cell', () => {
    const { container } = renderWithProviders(<Table columns={columns} rows={[]} empty="Nada" />)

    expect(container.querySelector('[data-slot="table-empty"]')).toHaveTextContent('Nada')
  })

  it('keeps className and style on the root with the caller last', () => {
    const { container } = renderWithProviders(<Table columns={columns} rows={orders} className="mine" style={{ margin: '3px' }} />)
    const root = container.querySelector('[data-slot="table"]') as HTMLElement

    expect(root.className.split(' ').at(-1)).toBe('mine')
    expect(root.style.margin).toBe('3px')
  })

  it('passes other attributes and handlers to the root', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(<Table columns={columns} rows={orders} data-testid="orders" id="orders" onClick={onClick} />)

    await user.click(screen.getByText('Ana'))

    expect(screen.getByTestId('orders')).toHaveAttribute('id', 'orders')
    expect(onClick).toHaveBeenCalled()
  })
})
