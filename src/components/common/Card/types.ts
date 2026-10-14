import type { MotionOverride } from '@motion/types.ts'
import type { HTMLAttributes } from 'react'

export type CardVariant = 'default' | 'elevated' | 'outlined'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: string
  animation?: MotionOverride
}
