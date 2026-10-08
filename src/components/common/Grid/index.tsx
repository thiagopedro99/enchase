import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { GridProps } from './types.ts'

export const Grid = ({ children, columns = 1, gap, minColumnWidth, className, style, ...props }: GridProps) => {
  const templateColumns = minColumnWidth ? `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))` : `repeat(${columns}, 1fr)`

  return (
    <div className={classNames(styles.grid, className)} style={{ '--grid-template-columns': templateColumns, ...(gap ? { gap } : {}), ...style } as CSSProperties} {...props}>
      {children}
    </div>
  )
}

export default Grid
