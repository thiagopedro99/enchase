import { defaultColumns } from './defaultData.ts'

import type { BreakpointKey } from '../../uiProvider/types.ts'
import type { CSSProperties } from 'react'
import type { GridProps } from './types.ts'

type ResponsiveColumns = Partial<Record<BreakpointKey, number>>

type VariablesInput = Pick<GridProps, 'columns' | 'minColumnWidth' | 'centerLastRow'>

const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

const gap = 'var(--enchase-grid-gap, var(--enchase-space-md))'

const minColumn = 'var(--enchase-grid-min-column, 14rem)'

const wholeNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? Math.max(1, Math.floor(value)) : undefined)

export const isResponsive = (columns: GridProps['columns']): columns is ResponsiveColumns => typeof columns === 'object' && columns !== null

const autoColumns = (count: number) => `repeat(auto-fit, minmax(min(100%, max(${minColumn}, calc((100% - ${count - 1} * ${gap}) / ${count}))), 1fr))`

const responsiveCounts = (columns: ResponsiveColumns) => {
  const counts = breakpointOrder.reduce<number[]>((list, name) => [...list, wholeNumber(columns[name]) ?? list.at(-1) ?? defaultColumns], [])

  return Object.fromEntries(breakpointOrder.map((name, index) => [`--enchase-grid-n-${name}`, counts[index]]))
}

export const gridVariables = ({ columns = defaultColumns, minColumnWidth, centerLastRow }: VariablesInput): CSSProperties => {
  if (minColumnWidth) return { '--enchase-grid-columns': `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))` } as CSSProperties
  if (isResponsive(columns)) return responsiveCounts(columns) as CSSProperties

  const count = wholeNumber(columns) ?? defaultColumns

  return { '--enchase-grid-columns': autoColumns(count), ...(centerLastRow ? { '--enchase-grid-n': count } : {}) } as CSSProperties
}
