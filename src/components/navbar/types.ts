import type { SidebarItem, SidebarSection } from '../common/Sidebar/types.ts'

export interface NavbarProps {
  logo?: string
  sections?: SidebarSection[]
  activeSectionId?: string
}

export interface NavbarLinksProps {
  items: SidebarItem[]
  activeSectionId?: string
  linkClassName: string
  onSelect?: () => void
}

export interface MobileDrawerProps {
  id: string
  items: SidebarItem[]
  activeSectionId?: string
  onClose: () => void
}
