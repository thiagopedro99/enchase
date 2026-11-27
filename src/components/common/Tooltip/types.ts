import type { CSSProperties, ReactNode, Ref } from 'react'
import type { PortalContainer } from '@utils/portalContainer.ts'
import type { MotionOverride } from '@motion/types.ts'

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

export type TooltipPlacement = TooltipSide | 'start' | 'end'

export interface TooltipProps {
  text: string
  children: ReactNode
  placement?: TooltipPlacement | undefined
  describe?: boolean | undefined
  arrow?: boolean | undefined
  container?: PortalContainer | undefined
  animation?: MotionOverride | undefined
  openDelay?: number | undefined
  closeDelay?: number | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
  bubbleClassName?: string | undefined
  bubbleStyle?: CSSProperties | undefined
  ref?: Ref<HTMLSpanElement> | undefined
}

export type TooltipAnimation = {
  off: boolean
  pop: boolean
  duration: number
  scale: number
}
