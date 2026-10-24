import type { MotionOverride } from '@motion/types.ts'
import type { CSSProperties, ReactNode } from 'react'

export type SidebarItem = {
  id: string
  label: string
  icon?: ReactNode | undefined
  href?: string | undefined
  native?: boolean | undefined
  badge?: string | undefined
  onClick?: (() => void) | undefined
}

export type SidebarSection = {
  id: string
  title?: string | undefined
  items: SidebarItem[]
}

export type SidebarVariant = 'permanent' | 'modal'

export type SidebarSlot = ReactNode | ((state: { collapsed: boolean }) => ReactNode)

export interface SidebarProps {
  sections: SidebarSection[]
  activeSectionId?: string | undefined
  currentHref?: string | undefined
  header?: SidebarSlot | undefined
  footer?: SidebarSlot | undefined
  variant?: SidebarVariant | undefined
  collapsed?: boolean | undefined
  onToggleCollapsed?: (() => void) | undefined
  open?: boolean | undefined
  onClose?: (() => void) | undefined
  ariaLabel?: string | undefined
  id?: string | undefined
  animation?: MotionOverride | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
}

export interface SidebarContentProps {
  sections: SidebarSection[]
  activeSectionId?: string | undefined
  currentHref?: string | undefined
  header?: SidebarSlot | undefined
  footer?: SidebarSlot | undefined
  collapsed: boolean
  compact?: boolean | undefined
  onToggleCollapsed?: (() => void) | undefined
  onSelect?: (() => void) | undefined
  ariaLabel: string
}

export interface SidebarItemViewProps {
  item: SidebarItem
  current?: 'page' | 'location' | undefined
  collapsed: boolean
  index: number
  onSelect?: (() => void) | undefined
}
