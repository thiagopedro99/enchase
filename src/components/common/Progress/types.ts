import type { MotionOverride } from '@motion/types.ts'
import type { HTMLAttributes } from 'react'

export type ProgressVariant = 'linear' | 'circular'

export type ProgressSize = 'sm' | 'md' | 'lg'

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: number | undefined
  max?: number | undefined
  variant?: ProgressVariant | undefined
  size?: ProgressSize | undefined
  animation?: MotionOverride | undefined
}
