import { defaultCenterLastRow, defaultColumns } from './defaultData.ts'
import { gridVariables, isResponsive } from './variables.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { GridProps } from './types.ts'

export const Grid = ({ children, columns = defaultColumns, gap, minColumnWidth, centerLastRow = defaultCenterLastRow, ...props }: GridProps) => {
  const own = {
    ...slot('grid'),
    className: styles.grid,
    style: { ...gridVariables({ columns, minColumnWidth, centerLastRow }), ...(gap ? { '--enchase-grid-gap': gap } : {}) } as CSSProperties,
    'data-responsive': isResponsive(columns) && !minColumnWidth ? '' : undefined,
    'data-center-last': centerLastRow && !minColumnWidth ? '' : undefined
  }

  return <div {...mergeProps(own, props)}>{children}</div>
}

export default Grid
