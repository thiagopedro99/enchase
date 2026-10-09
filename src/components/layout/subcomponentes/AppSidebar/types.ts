import type { SidebarSection, SidebarSlot, SidebarVariant } from '@components/common/Sidebar/types.ts'

export type AppSidebarProps = {
  brand: string
  brandLogo?: string
  sections: SidebarSection[]
  variant: SidebarVariant
  activeSectionId?: string
  navId?: string
  footer?: SidebarSlot
}
