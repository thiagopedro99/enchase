import type { MotionSettings } from '../../motion/types.ts'
import type { Direction, Locale } from '../../locales/types.ts'
import type { baseTokens } from '../../styles/tokens/base.ts'
import type { ReactNode } from 'react'

export type Breakpoints = typeof baseTokens.breakpoints

export type BreakpointKey = keyof Breakpoints

export type BreakpointName = Exclude<BreakpointKey, 'xs'>

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
  pagination?: string | undefined
  previousPage?: string | undefined
  nextPage?: string | undefined
  increaseValue?: string | undefined
  decreaseValue?: string | undefined
  removeTag?: string | undefined
  selectRow?: string | undefined
  selectAllRows?: string | undefined
}

export type UIConfig = {
  motion: MotionSettings
  labels: UILabels
  dir: Direction
  locale: string
  breakpoints: Breakpoints
}

export type UIProviderProps = {
  children: ReactNode
  motion?: Partial<MotionSettings> | undefined
  locale?: Locale | undefined
  labels?: Partial<UILabels> | undefined
  breakpoints?: Partial<Breakpoints> | undefined
  navigate?: ((href: string) => void) | undefined
  currentHref?: string | undefined
}
