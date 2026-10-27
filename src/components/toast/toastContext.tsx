import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { defaultToastDuration, defaultToastPosition, reducedMotionQuery } from './defaultData.ts'
import { VisuallyHidden } from '@components/common/VisuallyHidden/index.tsx'
import { inertExemptSlot } from '@hooks/useInertSiblings.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useMediaQuery } from '@hooks/useMediaQuery.ts'
import { usePortalContainer } from '@hooks/usePortalContainer.ts'
import { useIsClient } from '@hooks/useIsClient.ts'
import { useAnnouncer } from './useAnnouncer.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import ToastItemComponent from './toastItem.tsx'
import { ToastContext } from './context.ts'
import { useFlip } from './useFlip.ts'
import styles from './styles.module.css'

import type { Toast, ToastEntry, ToastOptions, ToastProviderProps, ToastPromiseMessages, ToastType, ToastUpdate } from './types.ts'
import type { FocusEvent, ReactNode } from 'react'

export const ToastProvider = ({ children, container, position = defaultToastPosition, limit, animation, className, style }: ToastProviderProps) => {
  const [entries, setEntries] = useState<ToastEntry[]>([])
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const { labels } = useUIConfig()
  const reduced = useMediaQuery(reducedMotionQuery)
  const isClient = useIsClient()
  const [statusText, announceStatus] = useAnnouncer()
  const [alertText, announceAlert] = useAnnouncer()
  const host = useMemo(() => {
    if (!isClient) return null

    const element = document.createElement('div')

    element.setAttribute('data-slot', inertExemptSlot)
    element.style.display = 'contents'

    return element
  }, [isClient])

  const target = usePortalContainer(container)

  useLayoutEffect(() => {
    if (!host || !target) return

    target.append(host)

    return () => host.remove()
  }, [host, target])

  useFlip(viewportRef, !reduced)

  const announce = useCallback((type: ToastType, text: string) => (type === 'error' ? announceAlert(text) : announceStatus(text)), [announceAlert, announceStatus])

  const addToast = useCallback((message: ReactNode, type: ToastType, duration = defaultToastDuration, options?: ToastOptions) => {
    const id = Math.random().toString(36).slice(2, 11)
    const toast: Toast = { id, message, type, duration, ...options }

    setEntries((previous) => [...previous, { toast, closing: false }])

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setEntries((previous) => previous.map((entry) => (entry.toast.id === id ? { ...entry, closing: true } : entry)))
  }, [])

  const disposeToast = useCallback((id: string) => {
    setEntries((previous) => previous.filter((entry) => entry.toast.id !== id))
  }, [])

  const update = useCallback((id: string, patch: ToastUpdate) => {
    setEntries((previous) => previous.map((entry) => (entry.toast.id === id ? { ...entry, toast: { ...entry.toast, ...patch } } : entry)))
  }, [])

  const promise = useCallback(
    <T,>(task: Promise<T>, messages: ToastPromiseMessages<T>, options?: ToastOptions) => {
      const id = addToast(messages.loading, 'info', 0, options)

      task.then(
        (value) => update(id, { message: typeof messages.success === 'function' ? messages.success(value) : messages.success, type: 'success', duration: defaultToastDuration }),
        (reason: unknown) => update(id, { message: typeof messages.error === 'function' ? messages.error(reason) : messages.error, type: 'error', duration: defaultToastDuration })
      )

      return task
    },
    [addToast, update]
  )

  const success = useCallback((message: ReactNode, duration?: number, options?: ToastOptions) => addToast(message, 'success', duration, options), [addToast])
  const error = useCallback((message: ReactNode, duration?: number, options?: ToastOptions) => addToast(message, 'error', duration, options), [addToast])
  const warning = useCallback((message: ReactNode, duration?: number, options?: ToastOptions) => addToast(message, 'warning', duration, options), [addToast])
  const info = useCallback((message: ReactNode, duration?: number, options?: ToastOptions) => addToast(message, 'info', duration, options), [addToast])

  const actions = useMemo(() => ({ addToast, removeToast, update, promise, success, error, warning, info }), [addToast, removeToast, update, promise, success, error, warning, info])

  const shown = useMemo(() => {
    const capacity = limit === undefined || Number.isNaN(limit) ? Infinity : Math.max(1, Math.floor(limit))
    const waiting = new Set(entries.filter((entry) => !entry.closing).slice(0, capacity).map((entry) => entry.toast.id))

    return entries.filter((entry) => entry.closing || waiting.has(entry.toast.id))
  }, [entries, limit])

  const from = position.endsWith('start') ? 'left' : 'right'

  const viewportProps = mergeProps(
    {
      ...slot('toast', 'viewport'),
      className: styles.container,
      role: 'region',
      'aria-label': labels.notifications,
      'data-position': position,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }
    },
    { className, style }
  )

  const viewport = (
    <>
      <VisuallyHidden role="status" aria-atomic="true">
        {statusText}
      </VisuallyHidden>
      <VisuallyHidden role="alert" aria-atomic="true">
        {alertText}
      </VisuallyHidden>
      <div ref={viewportRef} {...viewportProps}>
        {shown.map(({ toast, closing }) => (
          <ToastItemComponent key={toast.id} toast={toast} open={!closing} onRemove={removeToast} onDispose={disposeToast} onAnnounce={announce} paused={hovered || focused} from={from} animation={animation} />
        ))}
      </div>
    </>
  )

  return (
    <ToastContext.Provider value={actions}>
      {children}
      {host && createPortal(viewport, host)}
    </ToastContext.Provider>
  )
}
