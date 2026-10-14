import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { GridProps } from './types.ts'

export const Grid = ({ children, columns = 1, gap, minColumnWidth, ...props }: GridProps) => {
  const templateColumns = minColumnWidth ? `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))` : `repeat(auto-fit, minmax(min(100%, max(var(--enchase-grid-min-column, 14rem), calc((100% - ${columns - 1} * var(--enchase-grid-gap, var(--enchase-space-md))) / ${columns}))), 1fr))`
  const own = {
    ...slot('grid'),
    className: styles.grid,
    style: { '--enchase-grid-columns': templateColumns, ...(gap ? { '--enchase-grid-gap': gap } : {}) } as CSSProperties
  }

  return <div {...mergeProps(own, props)}>{children}</div>
}

export default Grid
