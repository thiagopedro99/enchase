import type { ContainerMaxWidth } from '../common/Container/types.ts'
import type { BreakpointName } from '../uiProvider/types.ts'
import type { FooterProps } from '../footer/types.ts'
import type { BreadcrumbItem } from '../common/Breadcrumbs/types.ts'
import type { SidebarSection, SidebarSlot } from '../common/Sidebar/types.ts'
import type { HTMLAttributes, ReactNode } from 'react'

export type LayoutNavigation = 'sidebar' | 'navbar'

export interface LayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode
  pageTitle?: string | undefined
  maxWidth?: ContainerMaxWidth | undefined
  padding?: boolean | string | undefined
  hideNavbar?: boolean | undefined
  hideFooter?: boolean | undefined
  centered?: boolean | undefined
  navigation?: LayoutNavigation | undefined
  breakpoint?: BreakpointName | undefined
  translucent?: boolean | undefined
  brand?: string | undefined
  brandLogo?: string | undefined
  footerProps?: FooterProps | undefined
  sidebarFooter?: SidebarSlot | undefined
  navigationSections?: SidebarSection[] | undefined
  pageSections?: SidebarSection[] | undefined
  activePageSectionId?: string | undefined
  breadcrumbs?: BreadcrumbItem[] | undefined
  collapsed?: boolean | undefined
  defaultCollapsed?: boolean | undefined
  onCollapsedChange?: ((collapsed: boolean) => void) | undefined
  storageKey?: string | undefined
  open?: boolean | undefined
  defaultOpen?: boolean | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
}

export type DeriveBreadcrumbsInput = {
  sections: SidebarSection[]
  pageSections: SidebarSection[]
  currentHref?: string | undefined
  pageTitle?: string | undefined
  activePageSectionId?: string | undefined
}
