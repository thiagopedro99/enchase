import type { CSSProperties, ReactNode } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export type TooltipPosition = TooltipPlacement | 'start' | 'end'

export interface TooltipProps {
  text: string
  children: ReactNode
  position?: TooltipPosition
  describe?: boolean
  animation?: MotionOverride
  openDelay?: number
  closeDelay?: number
  className?: string
  style?: CSSProperties
  bubbleClassName?: string
  bubbleStyle?: CSSProperties
}

export type TooltipAnimation = {
  off: boolean
  pop: boolean
  duration: number
  scale: number
}
