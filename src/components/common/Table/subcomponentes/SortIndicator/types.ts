import type { SVGAttributes } from 'react'
import type { TableSortDirection } from '../../types.ts'

export interface SortIndicatorProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  direction?: TableSortDirection | undefined
}
