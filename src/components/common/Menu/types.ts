import type { PortalContainer } from '@utils/portalContainer.ts'
import type { PlacementInput } from '../../../positioning/index.ts'
import type { MotionOverride } from '@motion/types.ts'
import type { CSSProperties, ReactNode, RefObject } from 'react'

export type MenuItem = {
  id: string
  label: ReactNode
  textValue?: string | undefined
  icon?: ReactNode | undefined
  disabled?: boolean | undefined
  onSelect?: (() => void) | undefined
}

export type MenuSeparator = {
  id: string
  separator: true
}

export type MenuEntry = MenuItem | MenuSeparator

export type MenuEntryPoint = 'first' | 'last'

export interface MenuProps {
  children: ReactNode
  items: MenuEntry[]
  label: string
  open?: boolean | undefined
  defaultOpen?: boolean | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
  placement?: PlacementInput | undefined
  offset?: number | undefined
  container?: PortalContainer | undefined
  animation?: MotionOverride | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
  contentClassName?: string | undefined
  contentStyle?: CSSProperties | undefined
}

export interface MenuListProps {
  items: MenuEntry[]
  entry: RefObject<MenuEntryPoint | undefined>
  animation?: MotionOverride | undefined
}
