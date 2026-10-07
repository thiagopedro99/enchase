import type { MotionSettings } from '../../motion/types.ts'
import type { ReactNode } from 'react'

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
}

export type UIProviderProps = {
  children: ReactNode
  motion?: Partial<MotionSettings>
  labels?: Partial<UILabels>
}
