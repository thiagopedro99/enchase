import type { MotionSettings } from '../../motion/types.ts'
import type { Direction, Locale } from '../../locales/types.ts'
import type { baseTokens } from '../../styles/tokens/base.ts'
import type { ReactNode } from 'react'

export type Breakpoints = typeof baseTokens.breakpoints

export type BreakpointName = 'sm' | 'md' | 'lg' | 'xl'

export type UILabels = {
  closeModal: string
  closeToast: string
  notifications: string
  openMenu: string
  closeMenu: string
  mainNavigation: string
  mobileNavigation: string
  switchToDark: string
  switchToLight: string
  loading: string
  confirm: string
  cancel: string
  confirmAction: string
  skipToContent: string
  collapseSidebar: string
  expandSidebar: string
  breadcrumb: string
  showFullPath: string
  logout: string
  showPassword: string
  opensInNewTab: string
  hidePassword: string
}

export type UIConfig = {
  motion: MotionSettings
  labels: UILabels
  dir: Direction
  breakpoints: Breakpoints
}

export type UIProviderProps = {
  children: ReactNode
  motion?: Partial<MotionSettings>
  locale?: Locale
  labels?: Partial<UILabels>
  breakpoints?: Partial<Breakpoints>
  navigate?: (href: string) => void
  currentHref?: string
}
