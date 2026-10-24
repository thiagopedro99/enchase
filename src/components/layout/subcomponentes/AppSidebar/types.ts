import type { SidebarSection, SidebarSlot, SidebarVariant } from '@components/common/Sidebar/types.ts'
import type { CSSProperties } from 'react'

export type AppSidebarProps = {
  brand?: string | undefined
  brandLogo?: string | undefined
  sections: SidebarSection[]
  variant: SidebarVariant
  activeSectionId?: string | undefined
  navId?: string | undefined
  footer?: SidebarSlot | undefined
  collapsed: boolean
  open: boolean
  onClose: () => void
  className?: string | undefined
  style?: CSSProperties | undefined
}
