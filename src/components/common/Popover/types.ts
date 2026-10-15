import type { CSSProperties, ReactNode } from 'react'
import type { PlacementInput } from '../../../positioning/index.ts'
import type { MotionOverride } from '@motion/types.ts'

export type PopoverRole = 'dialog' | 'listbox' | 'tree' | 'grid'

export interface PopoverProps {
  children: ReactNode
  content: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: PlacementInput
  offset?: number
  padding?: number
  role?: PopoverRole
  label?: string
  arrow?: boolean
  closeOnEsc?: boolean
  closeOnOutsideClick?: boolean
  animation?: MotionOverride
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}

export type PopoverTreeNode = (node: Node) => boolean

export type PopoverTree = {
  add: (contains: PopoverTreeNode) => () => void
}
