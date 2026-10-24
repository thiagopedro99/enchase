import type { HTMLAttributes, ReactNode } from 'react'

export interface TableColumn<Row> {
  key: string
  header: string
  cell?: ((row: Row, index: number) => ReactNode) | undefined
  align?: 'start' | 'center' | 'end' | undefined
  width?: string | undefined
  rowHeader?: boolean | undefined
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
}
