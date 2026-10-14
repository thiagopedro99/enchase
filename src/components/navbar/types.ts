import type { CSSProperties, RefObject } from 'react'
import type { PresenceState } from '@hooks/usePresence.ts'
import type { SidebarItem, SidebarSection } from '../common/Sidebar/types.ts'

export interface NavbarProps {
  logo?: string
  sections?: SidebarSection[]
  activeSectionId?: string
  className?: string
  style?: CSSProperties
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
  open: boolean
  state: PresenceState
  drawerRef: RefObject<HTMLDivElement | null>
  motionStyle: CSSProperties
  onClose: () => void
}
