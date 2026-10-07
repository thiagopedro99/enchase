import { AnimatePresence } from 'motion/react'
import { useState, useCallback } from 'react'

import { defaultToastDuration } from './defaultData.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import ToastItemComponent from './toastItem.tsx'
import { ToastContainer } from './styles.ts'
import { ToastContext } from './context.ts'

import type { Toast, ToastType, ToastProviderProps } from './types.ts'

export const ToastProvider = ({ children, animation }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const { labels } = useUIConfig()

  const addToast = useCallback((message: string, type: ToastType, duration = defaultToastDuration) => {
    const id = Math.random().toString(36).slice(2, 11)

    setToasts((previous) => [...previous, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number) => addToast(message, 'success', duration), [addToast])
  const error = useCallback((message: string, duration?: number) => addToast(message, 'error', duration), [addToast])
  const warning = useCallback((message: string, duration?: number) => addToast(message, 'warning', duration), [addToast])
  const info = useCallback((message: string, duration?: number) => addToast(message, 'info', duration), [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}

      <ToastContainer role="region" aria-label={labels.notifications} aria-live="polite" aria-relevant="additions">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItemComponent key={toast.id} toast={toast} onRemove={removeToast} animation={animation} />
          ))}
        </AnimatePresence>
      </ToastContainer>
    </ToastContext.Provider>
  )
}
