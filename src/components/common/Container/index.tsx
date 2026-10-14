import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { ContainerProps } from './types.ts'

export const Container = ({ children, maxWidth = 'lg', padding = true, center = true, ...props }: ContainerProps) => {
  const own = {
    ...slot('container'),
    className: styles.container,
    style: typeof padding === 'string' ? ({ '--enchase-container-padding': padding } as CSSProperties) : undefined,
    'data-max-width': maxWidth,
    'data-padding': padding === false ? 'none' : undefined,
    'data-center': center ? undefined : 'false'
  }

  return <div {...mergeProps(own, props)}>{children}</div>
}

export default Container
