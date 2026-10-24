import type { BreakpointName } from '../uiProvider/types.ts'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import type { PresenceState } from '@hooks/usePresence.ts'
import type { SidebarItem, SidebarSection } from '../common/Sidebar/types.ts'

export interface NavbarProps {
  logo?: ReactNode | undefined
  logoHref?: string | undefined
  breakpoint?: BreakpointName | undefined
  sections?: SidebarSection[] | undefined
  activeSectionId?: string | undefined
  actions?: ReactNode | undefined
  translucent?: boolean | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
}

export interface NavbarLinksProps {
  items: SidebarItem[]
  activeSectionId?: string | undefined
  linkClassName: string
  onSelect?: (() => void) | undefined
  staggered?: boolean | undefined
}

export interface MobileDrawerProps {
  id: string
  layout: 'wide' | 'compact'
  items: SidebarItem[]
  activeSectionId?: string | undefined
  actions?: ReactNode | undefined
  open: boolean
  state: PresenceState
  drawerRef: RefObject<HTMLDivElement | null>
  motionStyle: CSSProperties
  onClose: () => void
}
