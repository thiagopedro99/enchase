import type { BreakpointName } from '../uiProvider/types.ts'
import type { FooterProps } from '../footer/types.ts'
import type { BreadcrumbItem } from '../common/Breadcrumbs/types.ts'
import type { SidebarSection, SidebarSlot } from '../common/Sidebar/types.ts'
import type { HTMLAttributes, ReactNode } from 'react'

export type LayoutNavigation = 'sidebar' | 'navbar'

export interface LayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode
  pageTitle?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean | string
  hideNavbar?: boolean
  hideFooter?: boolean
  centered?: boolean
  navigation?: LayoutNavigation
  breakpoint?: BreakpointName
  brand?: string
  brandLogo?: string
  footerProps?: FooterProps
  sidebarFooter?: SidebarSlot
  navigationSections?: SidebarSection[]
  pageSections?: SidebarSection[]
  activePageSectionId?: string
  breadcrumbs?: BreadcrumbItem[]
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  storageKey?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export type DeriveBreadcrumbsInput = {
  sections: SidebarSection[]
  pageSections: SidebarSection[]
  currentHref?: string
  pageTitle?: string
  activePageSectionId?: string
}
