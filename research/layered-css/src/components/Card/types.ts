import type { MotionOverride } from '@motion/types.ts'
import type { HTMLAttributes } from 'react'

export type CardVariant = 'default' | 'elevated' | 'outlined'

type MotionConflictingHandlers = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, MotionConflictingHandlers> {
  variant?: CardVariant
  padding?: string
  animation?: MotionOverride
}
