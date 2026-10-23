import { defaultTag, roleOf } from '@utils/structureTag.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { ContainerProps } from './types.ts'

export const Container = ({ as: Tag = defaultTag, children, maxWidth = 'lg', padding = true, center = true, ...props }: ContainerProps) => {
  const { breakpoints } = useUIConfig()
  const size = maxWidth === '2xl' ? 'xxl' : maxWidth
  const variables = {
    ...(size === 'full' ? {} : { '--enchase-container-max': breakpoints[size] }),
    ...(typeof padding === 'string' ? { '--enchase-container-padding': padding } : {})
  } as CSSProperties
  const own = {
    ...slot('container'),
    className: styles.container,
    style: Object.keys(variables).length > 0 ? variables : undefined,
    role: roleOf(Tag),
    'data-max-width': size,
    'data-padding': padding === false ? 'none' : undefined,
    'data-center': center ? undefined : 'false'
  }

  return <Tag {...mergeProps(own, props)}>{children}</Tag>
}

export default Container
