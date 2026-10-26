import { useState } from 'react'
import { Badge, Pagination, Table } from 'enchase'
import { defaultSize, defaultStriped, orders, pageSize, statusLabels, statusVariants } from './defaultData.ts'

import type { TableColumn } from 'enchase'
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
    striped: defaultStriped
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A semantic data table, built from `columns` and `rows`: a `<table>` with a caption (`<caption>`), column headers (`scope="col"`), optional row headers and cells that accept any content through the `cell` function. It is generic: the row type flows from the `rows` to the columns. When the table is wider than the space available, the container scrolls horizontally and becomes a focusable region with the name of the table, for keyboard-only users. It does not sort or paginate: sort the data first and use the `Pagination` next to it. It accepts a `ref`, which goes to the container, and the attributes of the `<div>`; `className` and `style` go to it as well.'
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
        'Columns of the table, in the order they appear on screen. Each one has `key` (the field of the row that it shows), `header` (the header text) and, optionally, `cell` (a function that returns the content of the cell of a row), `align` (`start`, `center` or `end`), `width` (CSS width, such as `8rem`) and `rowHeader` (its cells become row headers). Without `cell`, the column shows `row[key]` as text.',
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
      description: 'Density of the rows: sm is compact and md is the default.',
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    },
    striped: {
      description: 'Alternates the background of the rows to help follow a long row.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultStriped) } }
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

export const WithPagination: Story = {
  parameters: { controls: { disable: true } },
  render: () => <PaginatedDemo />
}
