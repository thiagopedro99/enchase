import type { PortalContainer } from '@utils/portalContainer.ts'
import type { MotionOverride } from '@motion/types.ts'
import type { CSSProperties, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  className?: string | undefined
  style?: CSSProperties | undefined
}

export interface Toast extends ToastOptions {
  id: string
  message: ReactNode
  type: ToastType
  duration?: number | undefined
}

export interface ToastContextType {
  addToast: (message: ReactNode, type: ToastType, duration?: number, options?: ToastOptions) => string
  removeToast: (id: string) => void
  success: (message: ReactNode, duration?: number, options?: ToastOptions) => string
  error: (message: ReactNode, duration?: number, options?: ToastOptions) => string
  warning: (message: ReactNode, duration?: number, options?: ToastOptions) => string
  info: (message: ReactNode, duration?: number, options?: ToastOptions) => string
}

export interface ToastProviderProps {
  children: ReactNode
  container?: PortalContainer | undefined
  animation?: MotionOverride | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
}

export interface ToastEntry {
  toast: Toast
  closing: boolean
}

export interface ToastItemProps {
  toast: Toast
  open: boolean
  onRemove: (id: string) => void
  onDispose: (id: string) => void
  onAnnounce: (type: ToastType, text: string) => void
  animation?: MotionOverride | undefined
}
