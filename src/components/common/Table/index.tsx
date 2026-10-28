import { forwardRef, useMemo, useRef } from 'react'

import { defaultLoadingRows, defaultSize, defaultStickyHeader, defaultStriped } from './defaultData.ts'
import { SortIndicator } from './subcomponentes/SortIndicator/index.tsx'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { Skeleton } from '../Skeleton/index.tsx'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useOverflow } from '@hooks/useOverflow.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { mergeRefs } from '@utils/mergeRefs.ts'
import styles from './styles.module.css'

import type { ForwardedRef, ReactElement, ReactNode, RefAttributes } from 'react'
import type { TableColumn, TableProps } from './types.ts'

const textOf = <Row,>(row: Row, column: TableColumn<Row>) => {
  const value = (row as Record<string, unknown>)[column.key]

  return value === undefined || value === null ? '' : String(value)
}

export const Table = forwardRef(function Table<Row>(
  { columns, rows, getRowKey, caption, ariaLabel, empty, size = defaultSize, striped = defaultStriped, sort, onSortChange, stickyHeader = defaultStickyHeader, loading, ...props }: TableProps<Row>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const overflowing = useOverflow(containerRef)
  const { labels } = useUIConfig()
  const mergedRef = useMemo(() => mergeRefs(containerRef, ref), [ref])
  const name = ariaLabel ?? caption
  const busy = loading === true

  const root = mergeProps(
    {
      ...slot('table'),
      className: styles.container,
      'data-size': size,
      'data-striped': striped ? '' : undefined,
      'data-sticky-header': stickyHeader ? '' : undefined,
      'data-loading': busy ? '' : undefined,
      tabIndex: overflowing ? 0 : undefined,
      role: overflowing && name ? 'region' : undefined,
      'aria-label': overflowing && name ? name : undefined
    },
    props
  )

  const cell = (column: TableColumn<Row>, content: ReactNode) =>
    column.rowHeader ? (
      <th key={column.key} scope="row" className={styles.rowHeader} data-align={column.align} {...slot('table', 'row-header')}>
        {content}
      </th>
    ) : (
      <td key={column.key} className={styles.cell} data-align={column.align} {...slot('table', 'cell')}>
        {content}
      </td>
    )

  const header = (column: TableColumn<Row>) => {
    const direction = sort && sort.key === column.key ? sort.direction : undefined

    return (
      <th key={column.key} scope="col" className={styles.header} data-align={column.align} data-sortable={column.sortable ? '' : undefined} aria-sort={direction} style={column.width ? { inlineSize: column.width } : undefined} {...slot('table', 'header')}>
        {column.sortable ? (
          <button type="button" className={styles.sort} onClick={() => onSortChange?.({ key: column.key, direction: direction === 'ascending' ? 'descending' : 'ascending' })} {...slot('table', 'sort')}>
            <span className={styles.label} {...slot('table', 'sort-label')}>
              {column.header}
            </span>
            <SortIndicator direction={direction} />
          </button>
        ) : (
          column.header
        )}
      </th>
    )
  }

  return (
    <div {...root} ref={mergedRef}>
      {loading !== undefined && <VisuallyHidden role="status">{busy ? labels.loading : null}</VisuallyHidden>}

      <table className={styles.table} aria-label={ariaLabel} aria-busy={busy || undefined} {...slot('table', 'element')}>
        {caption && (
          <caption className={styles.caption} {...slot('table', 'caption')}>
            {caption}
          </caption>
        )}

        <thead {...slot('table', 'head')}>
          <tr>{columns.map(header)}</tr>
        </thead>

        <tbody {...slot('table', 'body')}>
          {busy
            ? Array.from({ length: rows.length > 0 ? rows.length : defaultLoadingRows }, (_, index) => (
                <tr key={`placeholder-${index}`} className={styles.row} data-placeholder="" aria-hidden="true" {...slot('table', 'row')}>
                  {columns.map((column) => (
                    <td key={column.key} className={styles.cell} data-align={column.align} {...slot('table', 'cell')}>
                      <div className={styles.placeholder} {...slot('table', 'placeholder')}>
                        <Skeleton width="70%" />
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row, index) => (
                <tr key={getRowKey ? getRowKey(row, index) : index} className={styles.row} {...slot('table', 'row')}>
                  {columns.map((column) => cell(column, column.cell ? column.cell(row, index) : textOf(row, column)))}
                </tr>
              ))}

          {!busy && rows.length === 0 && empty !== undefined && (
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
