import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Table } from '@components/common/Table/index.tsx'

import type { ReactNode } from 'react'
import type { TableColumn, TableSort } from '@components/common/Table/types.ts'

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

describe('Table headers that are nodes', () => {
  it('renders a node as the header of a plain column and of a sortable one', () => {
    renderWithProviders(
      <Table
        columns={[
          { key: 'id', header: <abbr title="Número do pedido">Nº</abbr> },
          { key: 'customer', header: <em>Cliente</em>, sortable: true }
        ]}
        rows={orders}
      />
    )

    expect(screen.getByText('Nº').tagName).toBe('ABBR')
    expect(screen.getByText('Cliente').tagName).toBe('EM')
    expect(screen.getByRole('button', { name: 'Cliente' })).toContainElement(screen.getByText('Cliente'))
  })
})

describe('Table sorting', () => {
  const sortable: TableColumn<Order>[] = [
    { key: 'id', header: 'Pedido', rowHeader: true, sortable: true },
    { key: 'customer', header: 'Cliente', sortable: true },
    { key: 'total', header: 'Total', align: 'end', sortable: true, cell: (row) => `R$ ${row.total.toFixed(2)}` },
    { key: 'paid', header: 'Pago' }
  ]

  const header = (name: string) => screen.getByRole('columnheader', { name })

  it('puts a button named after the header in a sortable column and none in the others', () => {
    renderWithProviders(<Table columns={sortable} rows={orders} />)

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Pedido', 'Cliente', 'Total'])
    expect(within(header('Pago')).queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Total' })).toHaveAttribute('type', 'button')
    expect(header('Cliente')).toHaveAttribute('data-sortable')
    expect(header('Pago')).not.toHaveAttribute('data-sortable')
  })

  it('has no aria-sort in any header while nothing is sorted', () => {
    const { container } = renderWithProviders(<Table columns={sortable} rows={orders} />)

    expect(container.querySelectorAll('[aria-sort]')).toHaveLength(0)
  })

  it('marks only the sorted column with aria-sort, in the direction of the sort', () => {
    const { container, rerender } = renderWithProviders(<Table columns={sortable} rows={orders} sort={{ key: 'customer', direction: 'ascending' }} />)

    expect(container.querySelectorAll('[aria-sort]')).toHaveLength(1)
    expect(header('Cliente')).toHaveAttribute('aria-sort', 'ascending')

    rerender(<Table columns={sortable} rows={orders} sort={{ key: 'total', direction: 'descending' }} />)

    expect(header('Cliente')).not.toHaveAttribute('aria-sort')
    expect(header('Total')).toHaveAttribute('aria-sort', 'descending')
  })

  it('shows the sorted state of a column that has no button too, since it describes how the rows are ordered', () => {
    renderWithProviders(<Table columns={sortable} rows={orders} sort={{ key: 'paid', direction: 'ascending' }} />)

    expect(header('Pago')).toHaveAttribute('aria-sort', 'ascending')
    expect(within(header('Pago')).queryByRole('button')).not.toBeInTheDocument()
  })

  it('does not mark anything for a sort of a key that is not a column', () => {
    const { container } = renderWithProviders(<Table columns={sortable} rows={orders} sort={{ key: 'ghost', direction: 'ascending' }} />)

    expect(container.querySelectorAll('[aria-sort]')).toHaveLength(0)
  })

  it('asks for ascending when a column that is not sorted is activated', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    renderWithProviders(<Table columns={sortable} rows={orders} sort={{ key: 'customer', direction: 'descending' }} onSortChange={onSortChange} />)

    await user.click(screen.getByRole('button', { name: 'Total' }))

    expect(onSortChange).toHaveBeenCalledTimes(1)
    expect(onSortChange).toHaveBeenCalledWith({ key: 'total', direction: 'ascending' })
  })

  it('asks for ascending on the first activation with no sort at all', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    renderWithProviders(<Table columns={sortable} rows={orders} onSortChange={onSortChange} />)

    await user.click(screen.getByRole('button', { name: 'Pedido' }))

    expect(onSortChange).toHaveBeenCalledWith({ key: 'id', direction: 'ascending' })
  })

  it('asks for the other direction when the sorted column is activated, both ways', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    const { rerender } = renderWithProviders(<Table columns={sortable} rows={orders} sort={{ key: 'customer', direction: 'ascending' }} onSortChange={onSortChange} />)

    await user.click(screen.getByRole('button', { name: 'Cliente' }))
    expect(onSortChange).toHaveBeenLastCalledWith({ key: 'customer', direction: 'descending' })

    rerender(<Table columns={sortable} rows={orders} sort={{ key: 'customer', direction: 'descending' }} onSortChange={onSortChange} />)

    await user.click(screen.getByRole('button', { name: 'Cliente' }))
    expect(onSortChange).toHaveBeenLastCalledWith({ key: 'customer', direction: 'ascending' })
  })

  it('leaves the order and the aria-sort to the app: nothing changes until the sort prop does', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Table columns={sortable} rows={orders} sort={{ key: 'id', direction: 'ascending' }} onSortChange={() => undefined} />)

    await user.click(screen.getByRole('button', { name: 'Cliente' }))

    expect(header('Pedido')).toHaveAttribute('aria-sort', 'ascending')
    expect(header('Cliente')).not.toHaveAttribute('aria-sort')
    expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['#1001', '#1002', '#1003'])
  })

  it('follows a sort that the app keeps in state, row by row', async () => {
    const user = userEvent.setup()

    const Sorted = () => {
      const [sort, setSort] = useState<TableSort | undefined>()
      const ordered = [...orders].sort((a, b) => (sort?.direction === 'descending' ? -1 : 1) * String(a[sort?.key as keyof Order]).localeCompare(String(b[sort?.key as keyof Order])))

      return <Table columns={sortable} rows={sort ? ordered : orders} sort={sort} onSortChange={setSort} getRowKey={(row) => row.id} />
    }
    renderWithProviders(<Sorted />)

    await user.click(screen.getByRole('button', { name: 'Cliente' }))
    expect(header('Cliente')).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['#1001', '#1002', '#1003'])

    await user.click(screen.getByRole('button', { name: 'Cliente' }))
    expect(header('Cliente')).toHaveAttribute('aria-sort', 'descending')
    expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['#1003', '#1002', '#1001'])
  })

  it('is activated with Enter and with Space, like any button', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    renderWithProviders(<Table columns={sortable} rows={orders} onSortChange={onSortChange} />)

    await user.tab()
    expect(screen.getByRole('button', { name: 'Pedido' })).toHaveFocus()

    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    await user.tab()
    await user.keyboard('{Enter}')

    expect(onSortChange.mock.calls.map(([value]) => value)).toEqual([
      { key: 'id', direction: 'ascending' },
      { key: 'id', direction: 'ascending' },
      { key: 'customer', direction: 'ascending' }
    ])
  })

  it('does nothing and does not throw when there is no onSortChange', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Table columns={sortable} rows={orders} />)

    await user.click(screen.getByRole('button', { name: 'Total' }))

    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('shows the direction on the indicator, which is hidden from screen readers', () => {
    const { container } = renderWithProviders(<Table columns={sortable} rows={orders} sort={{ key: 'customer', direction: 'descending' }} />)
    const icons = [...container.querySelectorAll('[data-slot="table-sort-icon"]')]

    expect(icons.map((icon) => icon.getAttribute('data-direction'))).toEqual(['none', 'descending', 'none'])
    expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true)
  })

  it('has no axe violations when sortable, sorted either way', async () => {
    const { container } = renderWithProviders(
      <>
        <Table caption="Ascendente" columns={sortable} rows={orders} sort={{ key: 'customer', direction: 'ascending' }} onSortChange={() => undefined} />
        <Table caption="Descendente" columns={sortable} rows={orders} sort={{ key: 'total', direction: 'descending' }} onSortChange={() => undefined} size="sm" />
        <Table caption="Sem ordem" columns={sortable} rows={orders} onSortChange={() => undefined} />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Table sticky header', () => {
  it('is not sticky by default and marks the root when it is', () => {
    const { container, unmount } = renderWithProviders(<Table columns={columns} rows={orders} />)

    expect(container.querySelector('[data-slot="table"]')).not.toHaveAttribute('data-sticky-header')
    unmount()

    const other = renderWithProviders(<Table columns={columns} rows={orders} stickyHeader />)

    expect(other.container.querySelector('[data-slot="table"]')).toHaveAttribute('data-sticky-header')
  })

  it('becomes a focusable region named after the caption when the rows scroll inside it', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => 900)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 300)
    const { container } = renderWithProviders(<Table caption="Pedidos" columns={columns} rows={orders} stickyHeader />)
    const root = container.querySelector('[data-slot="table"]') as HTMLElement

    expect(root).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('region', { name: 'Pedidos' })).toBe(root)
  })
})

const Loadable = ({ initial, children }: { initial: boolean; children: (loading: boolean) => ReactNode }) => {
  const [loading, setLoading] = useState(initial)

  return (
    <>
      <button onClick={() => setLoading((current) => !current)}>alternar</button>
      {children(loading)}
    </>
  )
}

describe('Table loading', () => {
  it('shows placeholder rows in place of the rows, as many as the rows, hidden from screen readers', () => {
    const { container } = renderWithProviders(<Table columns={columns} rows={orders} loading />)
    const placeholders = [...container.querySelectorAll('[data-placeholder]')]

    expect(placeholders).toHaveLength(3)
    expect(placeholders.every((row) => row.getAttribute('aria-hidden') === 'true')).toBe(true)
    expect(container.querySelectorAll('[data-slot="table-placeholder"]')).toHaveLength(9)
    expect(screen.queryByText('Ana')).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(1)
  })

  it('shows five placeholder rows when there are no rows yet, and not the empty content', () => {
    const { container } = renderWithProviders(<Table columns={columns} rows={[]} empty="Nenhum pedido" loading />)

    expect(container.querySelectorAll('[data-placeholder]')).toHaveLength(5)
    expect(screen.queryByText('Nenhum pedido')).not.toBeInTheDocument()
  })

  it('shows the empty content again when it stops loading with no rows', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Loadable initial>{(loading) => <Table columns={columns} rows={[]} empty="Nenhum pedido" loading={loading} />}</Loadable>)

    expect(screen.queryByText('Nenhum pedido')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'alternar' }))

    expect(screen.getByText('Nenhum pedido')).toBeInTheDocument()
    expect(document.querySelector('[data-placeholder]')).not.toBeInTheDocument()
  })

  it('brings the rows back when it stops loading, and takes them away when it starts again', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Loadable initial>{(loading) => <Table columns={columns} rows={orders} loading={loading} />}</Loadable>)

    await user.click(screen.getByRole('button', { name: 'alternar' }))
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="table-placeholder"]')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'alternar' }))
    expect(screen.queryByText('Ana')).not.toBeInTheDocument()
    expect(document.querySelectorAll('[data-placeholder]')).toHaveLength(3)
  })

  it('marks the table as busy and the root as loading only while it loads', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Loadable initial>{(loading) => <Table columns={columns} rows={orders} loading={loading} />}</Loadable>)

    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelector('[data-slot="table"]')).toHaveAttribute('data-loading')

    await user.click(screen.getByRole('button', { name: 'alternar' }))

    expect(screen.getByRole('table')).not.toHaveAttribute('aria-busy')
    expect(container.querySelector('[data-slot="table"]')).not.toHaveAttribute('data-loading')
  })

  it('announces the loading label in a status region that exists before it loads and keeps the same element', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Loadable initial={false}>{(loading) => <Table columns={columns} rows={orders} loading={loading} />}</Loadable>)
    const status = screen.getByRole('status')

    expect(status).toBeEmptyDOMElement()

    await user.click(screen.getByRole('button', { name: 'alternar' }))

    expect(screen.getByRole('status')).toBe(status)
    expect(status).toHaveTextContent('Carregando')

    await user.click(screen.getByRole('button', { name: 'alternar' }))

    expect(status).toBeEmptyDOMElement()
  })

  it('has no status region at all when the app never says whether it loads', () => {
    renderWithProviders(<Table columns={columns} rows={orders} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('keeps the header, with its sort buttons, and hides the placeholders from screen readers', () => {
    const { container } = renderWithProviders(<Table columns={[{ key: 'id', header: 'Pedido', sortable: true }, { key: 'customer', header: 'Cliente' }]} rows={orders} loading />)

    expect(screen.getByRole('button', { name: 'Pedido' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
    expect([...container.querySelectorAll('[data-slot="skeleton"]')].every((item) => item.getAttribute('aria-hidden') === 'true')).toBe(true)
  })

  it('aligns the placeholders with the alignment of their column', () => {
    const { container } = renderWithProviders(<Table columns={columns} rows={orders} loading />)

    expect([...container.querySelectorAll('[data-placeholder]:first-of-type > *')].map((cell) => cell.getAttribute('data-align'))).toEqual([null, null, 'end'])
  })

  it('has no axe violations while it loads', async () => {
    const { container } = renderWithProviders(
      <>
        <Table caption="Carregando com linhas" columns={columns} rows={orders} loading />
        <Table caption="Carregando sem linhas" columns={columns} rows={[]} empty="Nada" loading />
      </>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
