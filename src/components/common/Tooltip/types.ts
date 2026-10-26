import type { CSSProperties, ReactNode } from 'react'
import type { PortalContainer } from '@utils/portalContainer.ts'
import type { MotionOverride } from '@motion/types.ts'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export type TooltipPosition = TooltipPlacement | 'start' | 'end'

export interface TooltipProps {
  text: string
  children: ReactNode
  position?: TooltipPosition | undefined
  describe?: boolean | undefined
  container?: PortalContainer | undefined
  animation?: MotionOverride | undefined
  openDelay?: number | undefined
  closeDelay?: number | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
  bubbleClassName?: string | undefined
  bubbleStyle?: CSSProperties | undefined
}

export type TooltipAnimation = {
  off: boolean
  pop: boolean
  duration: number
  scale: number
}
