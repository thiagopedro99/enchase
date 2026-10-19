import type { HTMLAttributes, ReactNode } from 'react'

export interface TableColumn<Row> {
  key: string
  header: string
  cell?: (row: Row, index: number) => ReactNode
  align?: 'start' | 'center' | 'end'
  width?: string
  rowHeader?: boolean
}

export interface TableProps<Row> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  columns: TableColumn<Row>[]
  rows: Row[]
  getRowKey?: (row: Row, index: number) => string | number
  caption?: string
  ariaLabel?: string
  empty?: ReactNode
  size?: 'sm' | 'md'
  striped?: boolean
}
