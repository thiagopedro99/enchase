import { useEffect, useState } from 'react'
import { Badge, Button, Pagination, Table } from 'enchase'
import { compareOrders, defaultSize, defaultStickyHeader, defaultStriped, orders, pageSize, statusLabels, statusVariants } from './defaultData.ts'

import type { TableColumn, TableSort } from 'enchase'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Order } from './defaultData.ts'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const columns: TableColumn<Order>[] = [
  { key: 'id', header: 'Order', rowHeader: true },
  { key: 'customer', header: 'Customer' },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge variant={statusVariants[row.status]} size="sm">
        {statusLabels[row.status]}
      </Badge>
    )
  },
  { key: 'date', header: 'Date' },
  { key: 'total', header: 'Total', align: 'end', cell: (row) => currency.format(row.total) }
]

const sortableColumns = columns.map((column) => ({ ...column, sortable: column.key !== 'status' }))

const nodeColumns: TableColumn<Order>[] = [
  { key: 'id', header: <abbr title="Order number">No.</abbr>, rowHeader: true },
  { key: 'customer', header: 'Customer' },
  { key: 'date', header: 'Date' },
  {
    key: 'total',
    header: (
      <>
        Total <small style={{ fontWeight: 400 }}>(USD)</small>
      </>
    ),
    align: 'end',
    cell: (row) => currency.format(row.total)
  }
]

const SortableDemo = () => {
  const [sort, setSort] = useState<TableSort>({ key: 'date', direction: 'descending' })
  const rows = [...orders].sort((a, b) => (sort.direction === 'ascending' ? 1 : -1) * compareOrders(a, b, sort.key))

  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(48rem, 100%)' }}>
      <Table caption="Orders" columns={sortableColumns} rows={rows.slice(0, 6)} getRowKey={(row) => row.id} sort={sort} onSortChange={setSort} />
      <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>
        Sorted by {sort.key}, {sort.direction}
      </div>
    </div>
  )
}

const SelectableDemo = () => {
  const [selected, setSelected] = useState<(string | number)[]>(['#1041'])
  const [sort, setSort] = useState<TableSort>({ key: 'date', direction: 'descending' })
  const rows = [...orders].sort((a, b) => (sort.direction === 'ascending' ? 1 : -1) * compareOrders(a, b, sort.key)).slice(0, 6)

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start', inlineSize: 'min(48rem, 100%)' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Button size="sm" variant="outline" onClick={() => setSelected([])} disabled={selected.length === 0}>
          Clear selection
        </Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>{selected.length} selected</span>
      </div>
      <Table caption="Orders" columns={sortableColumns} rows={rows} getRowKey={(row) => row.id} sort={sort} onSortChange={setSort} selectedKeys={selected} onSelectedKeysChange={setSelected} style={{ inlineSize: '100%' }} />
    </div>
  )
}

const ReloadDemo = () => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!loading) return undefined

    const timer = setTimeout(() => setLoading(false), 1800)

    return () => clearTimeout(timer)
  }, [loading])

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start', inlineSize: 'min(48rem, 100%)' }}>
      <Button size="sm" onClick={() => setLoading(true)} disabled={loading}>
        Reload
      </Button>
      <Table caption="Orders" columns={columns} rows={orders.slice(0, 4)} getRowKey={(row) => row.id} loading={loading} style={{ inlineSize: '100%' }} />
    </div>
  )
}

const PaginatedDemo = () => {
  const [page, setPage] = useState(1)
  const first = (page - 1) * pageSize

  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(48rem, 100%)' }}>
      <Table caption="Orders" columns={columns} rows={orders.slice(first, first + pageSize)} getRowKey={(row) => row.id} />
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>
          Showing {first + 1} to {Math.min(first + pageSize, orders.length)} of {orders.length}
        </div>
        <Pagination ariaLabel="Order pages" pageCount={Math.ceil(orders.length / pageSize)} page={page} onPageChange={setPage} size="sm" />
      </div>
    </div>
  )
}

const meta = {
  title: 'Components/Table',
  component: Table<Order>,
  args: {
    caption: 'Recent orders',
    columns,
    rows: orders.slice(0, 6),
    size: defaultSize,
    striped: defaultStriped,
    stickyHeader: defaultStickyHeader
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A semantic data table, built from `columns` and `rows`: a `<table>` with a caption (`<caption>`), column headers (`scope="col"`), optional row headers and cells that accept any content through the `cell` function. It is generic: the row type flows from the `rows` to the columns. When the table is wider than the space available, the container scrolls horizontally and becomes a focusable region with the name of the table, for keyboard-only users. It does not order or paginate the data itself: with `sortable` columns, `sort` and `onSortChange` it draws the sort buttons and marks `aria-sort` while the app orders the `rows`, and for pages you use the `Pagination` next to it. `stickyHeader` keeps the header in view while the rows scroll, `loading` swaps the rows for placeholders, and `selectedKeys` adds a column of checkboxes, with a select all in the header, that the app keeps in state. It accepts a `ref`, which goes to the container, and the attributes of the `<div>`; `className` and `style` go to it as well.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 'min(48rem, 100%)' }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    columns: {
      description:
        'Columns of the table, in the order they appear on screen. Each one has `key` (the field of the row that it shows), `header` (text or nodes, such as an abbreviation or a unit in small type) and, optionally, `cell` (a function that returns the content of the cell of a row), `align` (`start`, `center` or `end`), `width` (CSS width, such as `8rem`), `rowHeader` (its cells become row headers) and `sortable` (puts a button in the header, which holds the header, so it cannot hold a button or a link). Without `cell`, the column shows `row[key]` as text.',
      control: false
    },
    rows: {
      description: 'Rows of the table, one object per row. The row type links the columns to the rows: `TableColumn<Order>[]` with `rows` of `Order`.',
      control: false
    },
    getRowKey: {
      description: 'Returns the stable key of a row, such as the id, so React can reuse the row when the order changes. Without it, the position is used.',
      control: false
    },
    caption: {
      description: 'Title of the table, rendered as a `<caption>` above it, which also gives the accessible name. For a name that is not shown, pass ariaLabel.',
      control: 'text'
    },
    ariaLabel: {
      description: 'Name of the table for screen readers, useful when there is no caption. With both, ariaLabel is used.',
      control: 'text'
    },
    empty: {
      description: 'Content shown in a cell that spans all the columns when there are no rows. Without it, only the header appears.',
      control: 'text'
    },
    size: {
      description: 'Density of the rows: sm is compact and md is the default. The compact density of the whole kit (`data-density` on the `<html>`) keeps the sm rows at the same height.',
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    },
    striped: {
      description: 'Alternates the background of the rows to help follow a long row.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultStriped) } }
    },
    sort: {
      description: 'How the rows are ordered now: `{ key, direction }`, where `key` is the key of a column and `direction` is `ascending` or `descending`. The table marks that column with `aria-sort`, whether it has a button or not, and shows the direction on its button. The rows themselves are yours to order. See the Sortable story.',
      control: false
    },
    onSortChange: {
      description: 'Called when a sort button is activated, with the sort that was asked for: ascending for a column that is not sorted and the opposite direction for the sorted one. It does not change anything by itself: order the rows and pass the new `sort` back. Without it the buttons do nothing.',
      control: false
    },
    stickyHeader: {
      description: 'Keeps the header at the top of the table while the rows scroll under it. It only works when the table has a height limit, such as `style={{ maxBlockSize: "16rem" }}`: without one the page scrolls and the header goes with it.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultStickyHeader) } }
    },
    selectedKeys: {
      description: 'The keys of the selected rows, in a list that the app keeps. Passing it, even empty, adds a first column with a checkbox per row and a select all in the header, which is checked when every row is selected and mixed when only some are. A key is what `getRowKey` returns for the row, or its position when there is no `getRowKey`, so pass `getRowKey` when the rows can be sorted or filtered. Keys of rows that are not in the table, such as those of another page, are kept. A selected row has `data-selected`. The table is not a grid, so there is no `aria-selected`.',
      control: false
    },
    onSelectedKeysChange: {
      description: 'Called with the whole new list of keys when a row box or the select all box is used. A row is added at the end or taken out; the select all adds the rows that are missing, or takes out the rows of the table when they are all selected. It does not change anything by itself: pass the list back in `selectedKeys`. The names of the boxes come from the `selectRow` and `selectAllRows` labels, and each row box also reads the row header.',
      control: false
    },
    loading: {
      description: 'Swaps the rows for placeholder rows, as many as the rows or five when there are none, marks the table `aria-busy` and announces the loading label. The `empty` content waits until it stops loading. Pass a boolean always, even false, so the announcement works: the status region is created when the prop is not undefined.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    }
  }
} satisfies Meta<typeof Table<Order>>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Striped: Story = {
  args: { striped: true }
}

export const Small: Story = {
  args: { size: 'sm' }
}

export const WithoutCaption: Story = {
  args: { caption: undefined, ariaLabel: 'Recent orders' }
}

export const Empty: Story = {
  args: { rows: [], empty: 'No orders yet' }
}

export const Scrolls: Story = {
  args: { striped: true },
  render: (args) => (
    <div style={{ inlineSize: 'min(24rem, 100%)' }}>
      <Table {...args} />
    </div>
  )
}

export const Sortable: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'A column with `sortable` gets a button in its header. The table does not order the rows: `onSortChange` says which sort was asked for, the app orders the `rows` and passes the `sort` back, and the table marks the column with `aria-sort`. Activating a column that is not sorted asks for ascending, and activating the sorted one flips the direction.' } }
  },
  render: () => <SortableDemo />
}

export const StickyHeader: Story = {
  args: { stickyHeader: true, rows: orders, style: { maxBlockSize: '16rem' } },
  parameters: { docs: { description: { story: '`stickyHeader` keeps the header in view while the rows scroll, inside a table that has a height limit: here `style={{ maxBlockSize: "16rem" }}`. While the rows scroll the table is a focusable region, so the keyboard reaches them too.' } } }
}

export const Loading: Story = {
  args: { loading: true },
  parameters: { docs: { description: { story: 'While `loading` is true the rows are replaced by placeholders, the table is marked `aria-busy` and a status message, hidden from the eye, says that it is loading.' } } }
}

export const Reloading: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ReloadDemo />
}

export const WithHeaderNodes: Story = {
  args: { columns: nodeColumns },
  parameters: { docs: { description: { story: 'A `header` can be nodes, such as an abbreviation with its meaning or a unit in small type.' } } }
}

export const WithPagination: Story = {
  parameters: { controls: { disable: true } },
  render: () => <PaginatedDemo />
}

export const Selectable: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'Passing `selectedKeys` adds a column of checkboxes. The select all box in the header is checked when every row is selected and mixed when only some are, and the selected rows are marked with `data-selected`. The app owns the list: `onSelectedKeysChange` gets the whole new list and the table shows what is passed back. The selection follows the record by its key, so it survives sorting, as here.' } }
  },
  render: () => <SelectableDemo />
}
