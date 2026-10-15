import { useCallback, useMemo, useRef, useState } from 'react'

import { defaultToastDuration, reducedMotionQuery } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { useMediaQuery } from '@hooks/useMediaQuery.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import ToastItemComponent from './toastItem.tsx'
import { ToastContext } from './context.ts'
import { useFlip } from './useFlip.ts'
import styles from './styles.module.css'

import type { Toast, ToastEntry, ToastOptions, ToastType, ToastProviderProps } from './types.ts'

export const ToastProvider = ({ children, animation, className, style }: ToastProviderProps) => {
  const [entries, setEntries] = useState<ToastEntry[]>([])
  const viewportRef = useRef<HTMLDivElement>(null)
  const { labels } = useUIConfig()
  const reduced = useMediaQuery(reducedMotionQuery)
  const motionStyle = useMotionStyle('slide', 'toast', animation, 'right')
  const reflowMs = reduced ? 0 : Number.parseFloat(String((motionStyle as Record<string, string>)['--enchase-toast-duration']))

  useFlip(viewportRef, Number.isFinite(reflowMs) ? reflowMs : 0)

  const addToast = useCallback((message: string, type: ToastType, duration = defaultToastDuration, options?: ToastOptions) => {
    const id = Math.random().toString(36).slice(2, 11)
    const toast: Toast = { id, message, type, duration, ...options }

    setEntries((previous) => [...previous, { toast, closing: false }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setEntries((previous) => previous.map((entry) => (entry.toast.id === id ? { ...entry, closing: true } : entry)))
  }, [])

  const disposeToast = useCallback((id: string) => {
    setEntries((previous) => previous.filter((entry) => entry.toast.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number, options?: ToastOptions) => addToast(message, 'success', duration, options), [addToast])
  const error = useCallback((message: string, duration?: number, options?: ToastOptions) => addToast(message, 'error', duration, options), [addToast])
  const warning = useCallback((message: string, duration?: number, options?: ToastOptions) => addToast(message, 'warning', duration, options), [addToast])
  const info = useCallback((message: string, duration?: number, options?: ToastOptions) => addToast(message, 'info', duration, options), [addToast])

  const actions = useMemo(() => ({ addToast, removeToast, success, error, warning, info }), [addToast, removeToast, success, error, warning, info])

  const viewportProps = mergeProps(
    {
      ...slot('toast', 'viewport'),
      className: styles.container,
      role: 'region',
      'aria-label': labels.notifications,
      'aria-live': 'polite' as const,
      'aria-relevant': 'additions' as const
    },
    { className, style }
  )

  return (
    <ToastContext.Provider value={actions}>
      {children}

      <div ref={viewportRef} {...viewportProps}>
        {entries.map(({ toast, closing }) => (
          <ToastItemComponent key={toast.id} toast={toast} open={!closing} onRemove={removeToast} onDispose={disposeToast} animation={animation} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
