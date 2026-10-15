import type { SidebarSection, SidebarSlot, SidebarVariant } from '@components/common/Sidebar/types.ts'
import type { CSSProperties } from 'react'

export type AppSidebarProps = {
  brand?: string
  brandLogo?: string
  sections: SidebarSection[]
  variant: SidebarVariant
  activeSectionId?: string
  navId?: string
  footer?: SidebarSlot
  collapsed: boolean
  open: boolean
  onClose: () => void
  className?: string
  style?: CSSProperties
}
