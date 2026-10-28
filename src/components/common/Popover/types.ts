import type { CSSProperties, ReactNode, RefObject } from 'react'
import type { PlacementInput } from '../../../positioning/index.ts'
import type { PortalContainer } from '@utils/portalContainer.ts'
import type { MotionOverride } from '@motion/types.ts'

export type PopoverRole = 'dialog' | 'listbox' | 'tree' | 'grid' | 'menu'

export interface PopoverProps {
  children: ReactNode
  content: ReactNode
  open?: boolean | undefined
  defaultOpen?: boolean | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
  placement?: PlacementInput | undefined
  offset?: number | undefined
  padding?: number | undefined
  role?: PopoverRole | undefined
  label?: string | undefined
  arrow?: boolean | undefined
  closeOnEsc?: boolean | undefined
  closeOnOutsideClick?: boolean | undefined
  container?: PortalContainer | undefined
  animation?: MotionOverride | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
  contentClassName?: string | undefined
  contentStyle?: CSSProperties | undefined
}

export type PopoverTreeNode = (node: Node) => boolean

export type PopoverTree = {
  add: (contains: PopoverTreeNode) => () => void
}

export type PopoverControl = {
  close: () => void
  contentRef: RefObject<HTMLElement | null>
}
