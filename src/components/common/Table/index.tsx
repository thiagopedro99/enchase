import { forwardRef, useMemo, useRef } from 'react'

import { defaultSize, defaultStriped } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useOverflow } from '@hooks/useOverflow.ts'
import { mergeRefs } from '@utils/mergeRefs.ts'
import styles from './styles.module.css'

import type { ForwardedRef, ReactElement, RefAttributes } from 'react'
import type { TableColumn, TableProps } from './types.ts'

const textOf = <Row,>(row: Row, column: TableColumn<Row>) => {
  const value = (row as Record<string, unknown>)[column.key]

  return value === undefined || value === null ? '' : String(value)
}

export const Table = forwardRef(function Table<Row>(
  { columns, rows, getRowKey, caption, ariaLabel, empty, size = defaultSize, striped = defaultStriped, ...props }: TableProps<Row>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const overflowing = useOverflow(containerRef)
  const mergedRef = useMemo(() => mergeRefs(containerRef, ref), [ref])
  const name = ariaLabel ?? caption
  const root = mergeProps(
    {
      ...slot('table'),
      className: styles.container,
      'data-size': size,
      'data-striped': striped ? '' : undefined,
      tabIndex: overflowing ? 0 : undefined,
      role: overflowing && name ? 'region' : undefined,
      'aria-label': overflowing && name ? name : undefined
    },
    props
  )

  return (
    <div {...root} ref={mergedRef}>
      <table className={styles.table} aria-label={ariaLabel} {...slot('table', 'element')}>
        {caption && (
          <caption className={styles.caption} {...slot('table', 'caption')}>
            {caption}
          </caption>
        )}

        <thead {...slot('table', 'head')}>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={styles.header} data-align={column.align} style={column.width ? { inlineSize: column.width } : undefined} {...slot('table', 'header')}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody {...slot('table', 'body')}>
          {rows.map((row, index) => (
            <tr key={getRowKey ? getRowKey(row, index) : index} className={styles.row} {...slot('table', 'row')}>
              {columns.map((column) => {
                const content = column.cell ? column.cell(row, index) : textOf(row, column)

                return column.rowHeader ? (
                  <th key={column.key} scope="row" className={styles.rowHeader} data-align={column.align} {...slot('table', 'row-header')}>
                    {content}
                  </th>
                ) : (
                  <td key={column.key} className={styles.cell} data-align={column.align} {...slot('table', 'cell')}>
                    {content}
                  </td>
                )
              })}
            </tr>
          ))}

          {rows.length === 0 && empty !== undefined && (
            <tr className={styles.row} {...slot('table', 'row')}>
              <td colSpan={Math.max(columns.length, 1)} className={styles.empty} {...slot('table', 'empty')}>
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}) as <Row>(props: TableProps<Row> & RefAttributes<HTMLDivElement>) => ReactElement

export default Table
