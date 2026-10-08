import { motion } from 'motion/react'

import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { CSSProperties } from 'react'
import type { SkeletonProps } from './types.ts'

const sizeStyle = (variant: NonNullable<SkeletonProps['variant']>, width?: string, height?: string): CSSProperties | undefined => {
  if (variant === 'circular') {
    const size = width || height

    return size ? ({ '--skeleton-width': size, '--skeleton-height': size } as CSSProperties) : undefined
  }

  const style: Record<string, string> = {}

  if (width) style['--skeleton-width'] = width
  if (height) style['--skeleton-height'] = height

  return Object.keys(style).length ? (style as CSSProperties) : undefined
}

export const Skeleton = ({ variant = 'text', width, height, className, animation }: SkeletonProps) => {
  const shimmerMotion = useMotionRecipe('shimmer', animation)

  return <motion.div {...shimmerMotion} className={classNames(styles.skeleton, className)} data-variant={variant} style={sizeStyle(variant, width, height)} aria-hidden="true" />
}

export default Skeleton
