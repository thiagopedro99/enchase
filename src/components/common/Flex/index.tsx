import { defaultTag, roleOf } from '@utils/structureTag.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { FlexProps } from './types.ts'

export const Flex = ({ as: Tag = defaultTag, children, direction = 'row', align = 'stretch', justify = 'start', gap, wrap = false, ...props }: FlexProps) => {
  const own = {
    ...slot('flex'),
    className: styles.flex,
    style: gap ? ({ '--enchase-flex-gap': gap } as CSSProperties) : undefined,
    role: roleOf(Tag),
    'data-direction': direction,
    'data-align': align,
    'data-justify': justify,
    'data-wrap': wrap ? '' : undefined
  }

  return <Tag {...mergeProps(own, props)}>{children}</Tag>
}

export default Flex
