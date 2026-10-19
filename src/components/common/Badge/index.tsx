import { defaultSize, defaultVariant } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { BadgeProps } from './types.ts'

export const Badge = ({ children, variant = defaultVariant, size = defaultSize, ...props }: BadgeProps) => {
  const own = { ...slot('badge'), className: styles.badge, 'data-variant': variant, 'data-size': size }

  return <span {...mergeProps(own, props)}>{children}</span>
}

export default Badge
