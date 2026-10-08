import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { FlexProps } from './types.ts'

export const Flex = ({ children, direction = 'row', align = 'stretch', justify = 'start', gap, wrap = false, className, style, ...props }: FlexProps) => (
  <div
    className={classNames(styles.flex, className)}
    data-align={align}
    data-justify={justify}
    style={{ flexDirection: direction, flexWrap: wrap ? 'wrap' : 'nowrap', ...(gap ? { gap } : {}), ...style } as CSSProperties}
    {...props}
  >
    {children}
  </div>
)

export default Flex
