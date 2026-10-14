import { defaultVariant } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { resolveCardMotion } from './motion.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { CardProps } from './types.ts'

export const Card = ({ children, animation, variant = defaultVariant, padding, ...props }: CardProps) => {
  const { motion: settings } = useUIConfig()
  const { motion, style } = variant === 'elevated' ? resolveCardMotion(settings, animation) : { motion: 'off' as const, style: undefined }
  const own = {
    ...slot('card'),
    className: styles.card,
    style: { ...style, ...(padding ? { padding } : undefined) } as CSSProperties,
    'data-variant': variant,
    'data-motion': motion
  }

  return <div {...mergeProps(own, props)}>{children}</div>
}

export default Card
