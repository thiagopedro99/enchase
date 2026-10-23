import { defaultCenterLastRow, defaultColumns } from './defaultData.ts'
import { gridVariables, isResponsive } from './variables.ts'
import { defaultTag, roleOf } from '@utils/structureTag.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { GridProps } from './types.ts'

export const Grid = ({ as: Tag = defaultTag, children, columns = defaultColumns, gap, minColumnWidth, centerLastRow = defaultCenterLastRow, ...props }: GridProps) => {
  const own = {
    ...slot('grid'),
    className: styles.grid,
    style: { ...gridVariables({ columns, minColumnWidth, centerLastRow }), ...(gap ? { '--enchase-grid-gap': gap } : {}) } as CSSProperties,
    role: roleOf(Tag),
    'data-responsive': isResponsive(columns) && !minColumnWidth ? '' : undefined,
    'data-center-last': centerLastRow && !minColumnWidth ? '' : undefined
  }

  return <Tag {...mergeProps(own, props)}>{children}</Tag>
}

export default Grid
