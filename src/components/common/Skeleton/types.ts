import type { MotionOverride } from '@motion/types.ts'
import type { HTMLAttributes } from 'react'

export type SkeletonVariant = 'text' | 'circular' | 'rectangular'

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: SkeletonVariant | undefined
  width?: string | undefined
  height?: string | undefined
  animation?: MotionOverride | undefined
}
