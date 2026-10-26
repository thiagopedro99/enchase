import type { PortalContainer } from '@utils/portalContainer.ts'
import type { MotionOverride, SlideFrom } from '@motion/types.ts'
import type { CSSProperties, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type ToastPosition = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'

export interface ToastAction {
  label: ReactNode
  onClick: () => void
}

export interface ToastOptions {
  className?: string | undefined
  style?: CSSProperties | undefined
  action?: ToastAction | undefined
  dismissible?: boolean | undefined
}

export interface Toast extends ToastOptions {
  id: string
  message: ReactNode
  type: ToastType
  duration?: number | undefined
}

export type ToastUpdate = Partial<Pick<Toast, 'message' | 'type' | 'duration' | 'action' | 'dismissible' | 'className' | 'style'>>

export interface ToastPromiseMessages<T> {
  loading: ReactNode
  success: ReactNode | ((value: T) => ReactNode)
  error: ReactNode | ((reason: unknown) => ReactNode)
}

export interface ToastContextType {
  addToast: (message: ReactNode, type: ToastType, duration?: number, options?: ToastOptions) => string
  removeToast: (id: string) => void
  update: (id: string, patch: ToastUpdate) => void
  promise: <T>(task: Promise<T>, messages: ToastPromiseMessages<T>, options?: ToastOptions) => Promise<T>
  success: (message: ReactNode, duration?: number, options?: ToastOptions) => string
  error: (message: ReactNode, duration?: number, options?: ToastOptions) => string
  warning: (message: ReactNode, duration?: number, options?: ToastOptions) => string
  info: (message: ReactNode, duration?: number, options?: ToastOptions) => string
}

export interface ToastProviderProps {
  children: ReactNode
  container?: PortalContainer | undefined
  position?: ToastPosition | undefined
  limit?: number | undefined
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
  paused: boolean
  from: SlideFrom
  animation?: MotionOverride | undefined
}
