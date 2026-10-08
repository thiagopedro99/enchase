import type { MotionOverride } from '@motion/types.ts'

export type SkeletonVariant = 'text' | 'circular' | 'rectangular'

export interface SkeletonProps {
  variant?: SkeletonVariant
  width?: string
  height?: string
  className?: string
  animation?: MotionOverride
}
