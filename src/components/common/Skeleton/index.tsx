import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { resolveLoopMotion } from '@motion/loop.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { SkeletonProps } from './types.ts'

const sizeStyle = (variant: NonNullable<SkeletonProps['variant']>, width?: string, height?: string): CSSProperties => {
  if (variant === 'circular') {
    const size = width || height

    return size ? ({ '--skeleton-width': size, '--skeleton-height': size } as CSSProperties) : {}
  }

  const style: Record<string, string> = {}

  if (width) style['--skeleton-width'] = width
  if (height) style['--skeleton-height'] = height

  return style as CSSProperties
}

export const Skeleton = ({ variant = 'text', width, height, animation, ...props }: SkeletonProps) => {
  const { motion: settings } = useUIConfig()
  const { motion, style } = resolveLoopMotion('shimmer', settings, animation)
  const own = {
    ...slot('skeleton'),
    className: styles.skeleton,
    style: { ...style, ...sizeStyle(variant, width, height) } as CSSProperties,
    'data-variant': variant,
    'data-motion': motion,
    'aria-hidden': 'true' as const
  }

  return <div {...mergeProps(own, props)} />
}

export default Skeleton
