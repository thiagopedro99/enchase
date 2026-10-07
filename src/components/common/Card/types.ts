import type { MotionOverride } from '@motion/types.ts'
import type { HTMLAttributes } from 'react'

type MotionConflictingHandlers = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, MotionConflictingHandlers> {
  $variant?: 'default' | 'elevated' | 'outlined'
  $padding?: string
  animation?: MotionOverride
}
