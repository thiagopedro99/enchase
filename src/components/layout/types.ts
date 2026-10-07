import type { BreadcrumbItem } from '../common/Breadcrumbs/types.ts'
import type { SidebarSection, SidebarSlot } from '../common/Sidebar/types.ts'
import type { ReactNode } from 'react'

export type LayoutNavigation = 'sidebar' | 'navbar'

export interface LayoutProps {
  children: ReactNode
  pageTitle?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean | string
  hideNavbar?: boolean
  hideFooter?: boolean
  centered?: boolean
  navigation?: LayoutNavigation
  brand?: string
  brandLogo?: string
  sidebarFooter?: SidebarSlot
  navigationSections?: SidebarSection[]
  pageSections?: SidebarSection[]
  activePageSectionId?: string
  breadcrumbs?: BreadcrumbItem[]
}

export type DeriveBreadcrumbsInput = {
  sections: SidebarSection[]
  pageSections: SidebarSection[]
  pathname: string
  pageTitle: string
  activePageSectionId?: string
}
