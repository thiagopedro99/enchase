import type { MotionOverride } from '@motion/types.ts'
import type { CSSProperties, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  className?: string
  style?: CSSProperties
}

export interface Toast extends ToastOptions {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number, options?: ToastOptions) => string
  removeToast: (id: string) => void
  success: (message: string, duration?: number, options?: ToastOptions) => string
  error: (message: string, duration?: number, options?: ToastOptions) => string
  warning: (message: string, duration?: number, options?: ToastOptions) => string
  info: (message: string, duration?: number, options?: ToastOptions) => string
}

export interface ToastProviderProps {
  children: ReactNode
  animation?: MotionOverride
  className?: string
  style?: CSSProperties
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
  animation?: MotionOverride
}
