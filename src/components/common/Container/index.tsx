import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { ContainerProps } from './types.ts'

export const Container = ({ children, maxWidth = 'lg', padding = true, center = true, className, style, ...props }: ContainerProps) => {
  const override: CSSProperties = { ...style }

  if (!center) {
    override.marginLeft = '0'
    override.marginRight = '0'
  }

  if (typeof padding === 'string') {
    override.paddingLeft = padding
    override.paddingRight = padding
  } else if (!padding) {
    override.paddingLeft = '0'
    override.paddingRight = '0'
  }

  return (
    <div className={classNames(styles.container, className)} data-max-width={maxWidth} style={override} {...props}>
      {children}
    </div>
  )
}

export default Container
