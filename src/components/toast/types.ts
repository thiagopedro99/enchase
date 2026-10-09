import type { MotionOverride } from '@motion/types.ts'
import type { ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

export interface ToastProviderProps {
  children: ReactNode
  animation?: MotionOverride
}

export interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
  animation?: MotionOverride
}
