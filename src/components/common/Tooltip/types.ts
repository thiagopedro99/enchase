import type { MotionOverride } from '@motion/types.ts'
import type { ReactNode } from 'react'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  text: string
  children: ReactNode
  position?: TooltipPosition
  describe?: boolean
  animation?: MotionOverride
}
