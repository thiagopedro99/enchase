import type { MotionOverride } from '@motion/types.ts'
import type { CSSProperties, ReactNode } from 'react'

export type SidebarItem = {
  id: string
  label: string
  icon?: ReactNode
  href?: string
  native?: boolean
  badge?: string
  onClick?: () => void
}

export type SidebarSection = {
  id: string
  title?: string
  items: SidebarItem[]
}

export type SidebarVariant = 'permanent' | 'modal'

export type SidebarSlot = ReactNode | ((state: { collapsed: boolean }) => ReactNode)

export interface SidebarProps {
  sections: SidebarSection[]
  activeSectionId?: string
  currentHref?: string
  header?: SidebarSlot
  footer?: SidebarSlot
  variant?: SidebarVariant
  collapsed?: boolean
  onToggleCollapsed?: () => void
  open?: boolean
  onClose?: () => void
  ariaLabel?: string
  id?: string
  animation?: MotionOverride
  className?: string
  style?: CSSProperties
}

export interface SidebarContentProps {
  sections: SidebarSection[]
  activeSectionId?: string
  currentHref?: string
  header?: SidebarSlot
  footer?: SidebarSlot
  collapsed: boolean
  compact?: boolean
  onToggleCollapsed?: () => void
  onSelect?: () => void
  ariaLabel: string
}

export interface SidebarItemViewProps {
  item: SidebarItem
  current?: 'page' | 'location'
  collapsed: boolean
  onSelect?: () => void
}
