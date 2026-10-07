import type { SidebarSection, SidebarVariant } from '@components/common/Sidebar/types.ts'

export type AppSidebarProps = {
  brand: string
  brandLogo?: string
  sections: SidebarSection[]
  variant: SidebarVariant
  activeId?: string
  navId?: string
}
