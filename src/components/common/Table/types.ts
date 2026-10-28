import type { HTMLAttributes, ReactNode } from 'react'

export type TableSortDirection = 'ascending' | 'descending'

export interface TableSort {
  key: string
  direction: TableSortDirection
}

export interface TableColumn<Row> {
  key: string
  header: ReactNode
  cell?: ((row: Row, index: number) => ReactNode) | undefined
  align?: 'start' | 'center' | 'end' | undefined
  width?: string | undefined
  rowHeader?: boolean | undefined
  sortable?: boolean | undefined
}

export interface TableProps<Row> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  columns: TableColumn<Row>[]
  rows: Row[]
  getRowKey?: ((row: Row, index: number) => string | number) | undefined
  caption?: string | undefined
  ariaLabel?: string | undefined
  empty?: ReactNode | undefined
  size?: 'sm' | 'md' | undefined
  striped?: boolean | undefined
  sort?: TableSort | undefined
  onSortChange?: ((sort: TableSort) => void) | undefined
  stickyHeader?: boolean | undefined
  loading?: boolean | undefined
}
